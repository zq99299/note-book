# 透传流程

由于现在还不知道到底什么是透传、透传原理是什么？
所以决定先来一个简单的查询语句为开端交互，来研究到底什么是透传？

截止 2018.11.18 日，mysql 客户端还不能连接上 mycat，jdbc 连接也出问题了。

使用 navicat 发送查询语句。我观察了下，在 navicat 中每次操作都会发起一个登录请求。
然后再发送 set chart 等的命令准备好后续要查询语句的 session 环境。

登录认证前面已经分析过了；

## 接收发送的查询命令入口

io.mycat.mycat2.net.MainMycatNIOHandler#onSocketRead

```java
public void onSocketRead(final MycatSession session) throws IOException {
       // 从 channel 中读取数据到 buffer 中
       boolean readed = session.readFromChannel();
       if (!readed) return;
       if (session.loadDataStateMachine == LoadDataState.CLIENT_2_SERVER_CONTENT_FILENAME) {
           resolveLoadData(session);
           return;
       } else {
          // 解析报文，只提取包头+类型（命令类型组成 4+1）
          // -> 跳转到后续章节继续观看 【解析报文-第一次解析】
           CurrPacketType currPacketType = session.resolveMySQLPackage(false, false);
           if (CurrPacketType.Full == currPacketType) {
               session.changeToDirectIfNeed();
           } else if (CurrPacketType.LongHalfPacket == currPacketType || CurrPacketType.ShortHalfPacket == currPacketType) {
               if (!resolveHalfPackage(session)) return;
               session.proxyBuffer.readMark = session.proxyBuffer.readIndex;
               return;
           }
       }
       ProxyBuffer buffer = session.getProxyBuffer();
       if (session.curMSQLPackgInf.endPos < buffer.writeIndex) {
           logger.warn("front contains multi package ");
       }
       // -> 跳转到后续章节继续观看 【透传入口】
       if (!session.matchMySqlCommand()) {
           return;
       }
       // 如果当前包需要处理，则交给对应方法处理，否则直接透传
       //-> 跳转到后续章节继续观看 【透传入口】
       if (session.curSQLCommand.procssSQL(session)) {
           session.curSQLCommand.clearFrontResouces(session, session.isClosed());
       }
   }
```

## 解析报文-第一次解析

```java
CurrPacketType currPacketType = session.resolveMySQLPackage(false, false);
```
io.mycat.mycat2.AbstractMySQLSession#resolveMySQLPackage(boolean, boolean)

以下方法做的事情大致是：

- 读取5个字节（在 buffer 中按索引方式读取不影响源来的 buffer）
- 获取到该包在 buffer 中的起始位置（相当于记录了该包的数据）
- 同时按照包头中的包长度信息和 buffer 中的 limit 等信息，可以判定该包是否是完整包/跨包的报文
- 判定是否是跨包：(offset + pkgLength) > limit ；说明还有一部分数据在下一次的 buffer 中出现；
- 把解析到的信息存在 MySQLPackageInf 中 -> curPackInf 当前 session 包的信息，有 curPackInf 和 buffer 就能得到所有报文数据

```java
public CurrPacketType resolveMySQLPackage(boolean markReaded, boolean forFull) {
    return resolveMySQLPackage(this.proxyBuffer, this.curMSQLPackgInf, markReaded, forFull);
}
public CurrPacketType resolveMySQLPackage(ProxyBuffer proxyBuf, MySQLPackageInf curPackInf, boolean markReaded,
                                              boolean forFull) {
        lastReadTime = TimeUtil.currentTimeMillis();
        ByteBuffer buffer = proxyBuf.getBuffer();
        // 读取的偏移位置
        int offset = proxyBuf.readIndex;
        // 读取的总长度
        int limit = proxyBuf.writeIndex;
        // 读取当前的总长度
        int totalLen = limit - offset;
        if (totalLen == 0 && !curPackInf.crossBuffer) { // 透传情况下.
            // 如果最后一个报文正好在buffer
            // 最后位置,已经透传出去了.这里可能不会为零
            return CurrPacketType.ShortHalfPacket;
        }
        if (curPackInf.remainsBytes == 0 && curPackInf.crossBuffer) {
//            if (totalLen < (ParseUtil.msyql_packetHeaderSize + ParseUtil.mysql_packetTypeSize)) {
//                String error = String.format("shorthalf packets do not support transparent transmission, session %d,offset %d ,limit %d", getSessionId(), offset, limit);
//                throw new UnsupportedOperationException(error);
//            }
            curPackInf.crossBuffer = false;
        }
        // 如果当前报文跨多个buffer
        if (curPackInf.crossBuffer) {
            if (curPackInf.remainsBytes <= totalLen) {
                // 剩余报文结束
                curPackInf.endPos = offset + curPackInf.remainsBytes;
                offset += curPackInf.remainsBytes; // 继续处理下一个报文
                proxyBuf.readIndex = offset;
                curPackInf.remainsBytes = 0;
                return CurrPacketType.FinishedCrossBufferPacket;
            } else {// 剩余报文还没读完，等待下一次读取
                curPackInf.startPos = 0;
                curPackInf.remainsBytes -= totalLen;
                curPackInf.endPos = limit;
                proxyBuf.readIndex = curPackInf.endPos;
                return CurrPacketType.RestCrossBufferPacket;
            }
        }
        // offset + msyql_packetHeaderSize + mysql_packetTypeSize <= limit;
        // 包头 4 字节，命令类型 1 字节，如果连这几个最基本的信息都没有读取完，那么就是一个短半包
        if (!ParseUtil.validateHeader(offset, limit)) {
            // 收到短半包
            logger.debug("not read a whole packet ,session {},offset {} ,limit {}", getSessionId(), offset, limit);
            return CurrPacketType.ShortHalfPacket;
        }

        // 解包获取包的数据长度
        int pkgLength = ParseUtil.getPacketLength(buffer, offset);

        // 解析报文类型
        int packetType = -1;

        packetType = buffer.get(offset + ParseUtil.msyql_packetHeaderSize);

        // 包的类型
        curPackInf.pkgType = packetType;
        // 设置包的长度
        curPackInf.pkgLength = pkgLength;
        // 设置偏移位置
        curPackInf.startPos = offset;
        curPackInf.crossBuffer = false;
        curPackInf.remainsBytes = 0;
        // 如果当前需要跨buffer处理
        if ((offset + pkgLength) > limit) {
            logger.debug("Not a whole packet: required length = {} bytes, cur total length = {} bytes, limit ={}, "
                    + "ready to handle the next read event", pkgLength, (limit - offset), limit);
            if (offset == 0 && pkgLength > limit && pkgLength > proxyBuffer.getBuffer().capacity()) {
                /*
                 * cjw 2018.4.6 假设整个buffer空间为88,开始位置是0,需要容纳89的数据大小,还缺一个数据没用接受完,
                 * 之后作为LongHalfPacket返回,之后上一级处理结果的函数因为是解析所以只处理整包,之后就一直不处理数据,
                 * 导致一直没有把数据处理,一直报错 readed zero bytes ,Maybe a bug ,please fix
                 * it !!!! 解决办法:扩容
                 */
                if (forFull) {
                    ensureFreeSpaceOfReadBuffer();
                } else {
                    curPackInf.crossBuffer = true;
                    curPackInf.remainsBytes = pkgLength - totalLen;
                }
            }
            curPackInf.endPos = limit;
            return CurrPacketType.LongHalfPacket;
        } else {
            // 读到完整报文
            curPackInf.endPos = curPackInf.pkgLength + curPackInf.startPos;
            if (ProxyRuntime.INSTANCE.isTraceProtocol()) {
                /**
                 * @todo 跨多个报文的情况下，修正错误。cjw fixed
                 */
                // 打印报文
                // 打印接收到的 SQL : 使用了 io.mycat.mycat2.sqlparser.byteArrayInterface.ByteBufferArray
		            // 读取思路是：通过索引从 buffer 中获取字符，拼成字符串，从而不影响原有 buffer
                // 内容是这样的：0f 00 00 00 03 53 45 54 20 4e 41 4d 45 53 20 75 74 66 38                                            . . . . . S E T . N A M E S . u t f 8
                // 这种处理方式 是参考了 jdbc 的源码中的一些工具类
                final String hexs = StringUtil.dumpAsHex(buffer, curPackInf.startPos, curPackInf.pkgLength);
                logger.debug(
                        "     session {} packet: startPos={}, offset = {}, length = {}, type = {}, cur total length = {},pkg HEX\r\n {}",
                        getSessionId(), curPackInf.startPos, offset, pkgLength, packetType, limit, hexs);
            }
            if (markReaded) {
                proxyBuf.readIndex = curPackInf.endPos;
            }
            return CurrPacketType.Full;
        }
    }
```

## 匹配 Command 处理对象

```java
if (!session.matchMySqlCommand())
```
io.mycat.mycat2.MycatSession#matchMySqlCommand

这里确定 schemaType 类型的关联思路是：

- DB_IN_ONE_SERVER 所有表在一个MySQL Server上（但不分片），判定标准是从 mycatSchema 中获取的，
- mycatSchema 应该是在配置初始化的时候通过某种逻辑判定的，具体是怎么判定为 DB_IN_ONE_SERVER 的，还要去查看；
- 在 用户登录的时候，如果用户有指定初始化 db，则从配置文件中查找对应的 schema。如果没有则从 schemas 中获取第一个；

所以在这里判定的就是这一个 db 的信息；
```java
public boolean matchMySqlCommand() {
  switch (mycatSchema.schemaType) {
    case DB_IN_ONE_SERVER:
      return DBInOneServerCmdStrategy.INSTANCE.matchMySqlCommand(this);
    case DB_IN_MULTI_SERVER:
      // return
      // DBINMultiServerCmdStrategy.INSTANCE.matchMySqlCommand(this);
    case ANNOTATION_ROUTE:
      // return AnnotateRouteCmdStrategy.INSTANCE.matchMySqlCommand(this);
      // case SQL_PARSE_ROUTE:
      //// AnnotateRouteCmdStrategy.INSTANCE.matchMySqlCommand(this);
    default:
      throw new InvalidParameterException("mycatSchema type is invalid ");
  }
}
```

继续委托找到的策略解析,io.mycat.mycat2.cmds.strategy.AbstractCmdStrategy#matchMySqlCommand

```java
public boolean matchMySqlCommand(MycatSession session) {


        MySQLCommand command = null;

        byte sqltype = 0;
        // 通过之前解析的信息 curMSQLPackgInf，获取到命令类型，COM_QUERY = 3；
        if (MySQLCommand.COM_QUERY == (byte) session.curMSQLPackgInf.pkgType) {

            int rowDataIndex = session.curMSQLPackgInf.startPos + MySQLPacket.packetHeaderSize + 1;
            // 包长度 - 包头 - 命令类型 = 查询的类容.
            int length = session.curMSQLPackgInf.pkgLength - MySQLPacket.packetHeaderSize - 1;
            try {
                // 每个 session 都绑定了一个 BufferSQLParser 实例；
                // -> 跳转到后续章节继续观看 【匹配 Command 处理对象】
                session.parser.parse(session.proxyBuffer.getBuffer(), rowDataIndex, length, session.sqlContext);
            } catch (Exception e) {
                try {
                    logger.error("sql parse error", e);
                    session.sendErrorMsg(ErrorCode.ER_PARSE_ERROR, "sql parse error : " + e.getMessage());
                } catch (Exception e1) {
                    session.close(false, e1.getMessage());
                }
                return false;
            }

            sqltype = session.sqlContext.getSQLType() != 0 ? session.sqlContext.getSQLType() : session.sqlContext.getCurSQLType();
            // 如果是 mycat 自己本身的查询报文，则委托 MyCatCmdDispatcher 处理
            if (BufferSQLContext.MYCAT_SQL == sqltype) {
                session.curSQLCommand = MyCatCmdDispatcher.INSTANCE.getMycatCommand(session.sqlContext);
                return true;
            }
            command = MYSQLCOMMANDMAP.get(sqltype);
            session.setSqltype(sqltype);

        } else {
            command = MYCOMMANDMAP.get((byte) session.curMSQLPackgInf.pkgType);
            session.setSqltype((byte) session.curMSQLPackgInf.pkgType);
        }
        // 上面没有匹配的的，则使用 透传命令 报文对象
        if (command == null) {
            command = DirectPassthrouhCmd.INSTANCE;
        }
        // 并绑定在 session 上。一些重要的属性 leaderus 说可以抽象成 session 的属性
        session.curSQLCommand = command;

        if (sqltype == LOAD_SQL){
            session.curSQLCommand = LoadDataCommand.INSTANCE;
        }

        return true;
    }
```

### 解析报文 - 第二次解析

```java
session.parser.parse(session.proxyBuffer.getBuffer(), rowDataIndex, length,session.sqlContext);
```
这里的源码解析，太难了，反正看不懂实现的原理
以下函数大致了做以下工作

- tokenize 把读取到的某些信息？转换成了 hash 值；反正看不懂。
- firstParse 第一遍处理，通过在之前的 hash 中拿到值进行常量对比，能获取 sql 的具体命令类型，比如 set 命令（也属于 quary 命令）

```java
public void parse(ByteBuffer src, int offset, int length, BufferSQLContext context) {
     this.byteBufferArray.setSrc(src);
     this.byteBufferArray.setOffset(offset);
     this.byteBufferArray.setLength(length);
     if (logger.isDebugEnabled()) {
         logger.debug("Recieved SQL : " + this.byteBufferArray.getString(offset, length));
     }
     sql = this.byteBufferArray;
     hashArray = context.getHashArray();
     hashArray.init();
     context.setCurBuffer(sql);
     tokenizer.tokenize(sql, hashArray);
     firstParse(context);
     //System.out.println("getRealSQL : "+context.getRealSQL(0)+" #limit count : "+context.getLimitCount());
 }
```

## 透传入口
到目前为止，接收到的查询包，关键的几个已经解析完了。由于前面 hash 缓存解析的地方没有看懂，不知道具体解析出了哪些东西；

从注释来看，复杂的 sql 语法树应该还没有涉及到。
```java
if (session.curSQLCommand.procssSQL(session)) {
```

io.mycat.mycat2.cmds.DirectPassthrouhCmd#procssSQL

```java
@Override
public boolean procssSQL(MycatSession session) throws IOException {
    /*
     * 获取后端连接可能涉及到异步处理,这里需要先取消前端读写事件
     */
    session.clearReadWriteOpts();
    // 获取后端连接，这里使用了 拉姆达表达式，把处理的逻辑传入了进去
    // 具体有什么玄机，等分析完之后，再来补充总结
    // -> 跳转到后续章节继续观看 【获取后端连接】
    session.getBackend((mysqlsession, sender, success, result) -> {
        ProxyBuffer curBuffer = session.proxyBuffer;
        // 切换 buffer 读写状态
        curBuffer.flip();
        if (success) {
            session.responseStateMachine.in(mysqlsession.getMycatSession().getSqltype());
            // 没有读取,直接透传时,需要指定 透传的数据 截止位置
            curBuffer.readIndex = curBuffer.writeIndex;
            // 改变 owner，对端Session获取，并且感兴趣写事件
            session.giveupOwner(SelectionKey.OP_WRITE);
            mysqlsession.writeToChannel();
        } else {
            session.closeAllBackendsAndResponseError( success, ((ErrorPacket) result));
        }
    });
    return false;
}
```

## 获取后端连接
io.mycat.mycat2.MycatSession#getBackend

```java
session.getBackend((mysqlsession, sender, success, result) -> {
```

```java
/**
 * 当前操作的后端会话连接
 *
 * @return
 */
public void getBackend(AsynTaskCallBack<MySQLSession> callback) throws IOException {
  // 先获取复制组名称
  // 在根据复制组名称获取后端会话连接
  getBackendByRepBeanName(getbackendName(), callback);
}
```

### 获取复制组名称
```java
private String getbackendName() {
		String backendName = null;
		switch (mycatSchema.getSchemaType()) {
  		case DB_IN_ONE_SERVER:
        // 根据 session 中绑定的 mycatSchema 中的 dataNode 获取到所属的复制组名称
  			backendName = ProxyRuntime.INSTANCE.getConfig().getMycatDataNodeMap().get(mycatSchema.getDefaultDataNode())
  					.getReplica();
  			break;
  	    ...
		}
		if (backendName == null) {
			throw new InvalidParameterException("the backendName must not be null");
		}
		return backendName;
	}

```

### 根据复制组名称获取后端会话连接
```java

/**
	 * 根据复制组名称获取后端会话连接
	 *
	 * @param repBeanName
	 *            复制组名称
	 * @param callback
	 *            cjw
	 * @throws IOException
	 */
	public void getBackendByRepBeanName(String repBeanName, AsynTaskCallBack<MySQLSession> callback)
			throws IOException {

    // 是否走从节点
    // 1. 根据静态注解，sql解析后的上下文中可以获取到注解类型 io.mycat.mycat2.sqlparser.BufferSQLContext#getAnnotationType
    // 2. 非事务场景下，走从节点，根据 autoCommit 的值，不自动提交标识没有事务？
		final boolean runOnSlave = canRunOnSlave();
		// 这里可能最合适的是先从Session里查找有没有合适的连接，没有的话在去看选择哪个节点？
    // 根据复制组名称获取 MySQLRepBean
    // MySQLRepBean 表示一組 MySQL Server 复制集群，如主从或者多主；该信息是在 datasource.yml 中配置的 mysql 相关连接的信息
		MySQLRepBean repBean = getMySQLRepBean(repBeanName);

		/**
		 * 本次根据读写分离策略要使用的metaBean
		 * 根据是否走从节点判定结果，从 复制组中获取具体的 mysql 数据连接信息
		 */
		MySQLMetaBean targetMetaBean = repBean.getBalanceMetaBean(runOnSlave);

		if (targetMetaBean == null) {
			String errmsg = " the metaBean is not found,please check datasource.yml!!! [balance] and [type]  propertie or see debug log or check heartbeat task!!";
			if (logger.isErrorEnabled()) {
				logger.error(errmsg);
			}
			ErrorPacket error = new ErrorPacket();
			error.errno = ErrorCode.ER_BAD_DB_ERROR;
			error.packetId = 1;
			error.message = errmsg;
			responseOKOrError(error);
			return;
		}
    // 因为在 reactor 读取信息后，在该线程中调用的，是同步方法。能直接获取到；
		MycatReactorThread reactorThread = (MycatReactorThread) Thread.currentThread();
		/*
    * 连接复用优先级
    *  1. 当前正在使用的 backend
    *  2. 当前session 缓存的 backend
		 */
     // 从当前seesion中先获取一次后端连接
     // 根据获取到的 mysql（MySQLMetaBean）信息。在一个本类 backends list 中循环比对后端session绑定的 MySQLMetaBean 对象；
		 //	如果找到则表示已经有一个后端连接可用。直接使用该连接；
		int mysqlIndex = findMatchedMySQLSession(targetMetaBean);
    // 已找到后端连接
		if (mysqlIndex != -1) {
			this.curBackendIndex = mysqlIndex;
			MySQLSession curBackend = this.backends.get(curBackendIndex);
			if (logger.isDebugEnabled()) {
				logger.debug("Using cached backend connections for {}。{}", (runOnSlave ? "read" : "write"), curBackend);
			}
      //
      // -> 跳转到后续章节继续观看 【已找到连接】
			reactorThread.syncAndExecute(curBackend, callback);

		} else {
			// 3. 从当前 actor 中获取连接
      // -> 跳转到后续章节继续观看 【未找到连接】
			reactorThread.tryGetMySQLAndExecute(this, runOnSlave, targetMetaBean, callback);
		}
	}
```

### 已找到连接

### 未找到连接
