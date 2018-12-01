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
没有在当前的 session 中找到连接，说明很有可能是第一次执行。在当前的 reactor 中尝试获取连接
```java
reactorThread.tryGetMySQLAndExecute(this, runOnSlave, targetMetaBean,callback);
```

```java
public void tryGetMySQLAndExecute(MycatSession currMycatSession, boolean runOnSlave, MySQLMetaBean targetMetaBean,
			AsynTaskCallBack<MySQLSession> callback) throws IOException {
		// 从ds中获取已经建立的连接

		ArrayList<MySQLSession> mySQLSessionList = mySQLSessionMap.get(targetMetaBean);
		if (mySQLSessionList != null && !mySQLSessionList.isEmpty()) {
			for (MySQLSession mysqlSession : mySQLSessionList) {
				if (mysqlSession.isIdle()) {
					logger.debug("Using the existing session in the datasource  for {}. {}:{}",
							(runOnSlave ? "read" : "write"), mysqlSession.getMySQLMetaBean().getDsMetaBean().getIp(),
							mysqlSession.getMySQLMetaBean().getDsMetaBean().getPort());
					mysqlSession.getMycatSession().unbindBackend(mysqlSession);
					currMycatSession.bindBackend(mysqlSession);
					syncAndExecute(mysqlSession, callback);
					return;
				}
			}
		}

		// 新建连接
		if (logger.isDebugEnabled()) {
			logger.debug("create new connection for " + (runOnSlave ? "read" : "write"));
		}

		createSession(targetMetaBean, currMycatSession.mycatSchema, (optSession, Sender, exeSucces, retVal) -> {
			// 恢复默认的Handler
			currMycatSession.setCurNIOHandler(MainMycatNIOHandler.INSTANCE);
			if (exeSucces) {
				// 设置当前连接 读写分离属性
				optSession.setDefaultChannelRead(targetMetaBean.isSlaveNode());
				optSession.setCurNIOHandler(MainMySQLNIOHandler.INSTANCE);
				currMycatSession.bindBackend(optSession);
				syncAndExecute(optSession, callback);
				// addMySQLSession(targetMetaBean, optSession);
			} else {
				if (retVal instanceof ErrorPacket) {
					currMycatSession.responseOKOrError((ErrorPacket) retVal);
				} else {
					System.err.println(" retVal is not ErrorPacket, please check it !!!");
					ErrorPacket error = new ErrorPacket();
					error.errno = ErrorCode.ER_UNKNOWN_ERROR;
					error.packetId = 1;
					error.message = retVal.toString();
					currMycatSession.responseOKOrError(error);
				}
			}
		});
	}
```

## 透传整体流程概要

## 1. 从 channel 中读取数据到 buffer 中；

  io.mycat.mycat2.net.MainMycatNIOHandler#onSocketRead
## 2. 解析报文，只提取包头+类型

  （命令类型组成 4+1）
  - 读取5个字节（在 buffer 中按索引方式读取不影响源来的 buffer）
  - 获取到该包在 buffer 中的起始位置（相当于记录了该包的数据）
  - 同时按照包头中的包长度信息和 buffer 中的 limit 等信息，可以判定该包是否是完整包/跨包的报文
  - 判定是否是跨包：(offset + pkgLength) > limit ；说明还有一部分数据在下一次的 buffer 中出现；
  - 把解析到的信息存在 MySQLPackageInf 中 -> curPackInf 当前 session 包的信息，有 curPackInf 和 buffer 就能得到所有报文数据
	io.mycat.mycat2.AbstractMySQLSession#resolveMySQLPackage(boolean, boolean)

## 3. 第一次解析报文
1. 获取 sql 的类型

    io.mycat.mycat2.MycatSession#matchMySqlCommand

    DB_IN_ONE_SERVER 所有表在一个MySQL Server上（但不分片），判定标准是从 mycatSchema 中获取的，
    mycatSchema 应该是在配置初始化的时候通过某种逻辑判定的，具体是怎么判定为 DB_IN_ONE_SERVER 的，还要去查看；

    在用户登录的时候，如果用户有指定初始化 db，则从配置文件中查找对应的 schema。如果没有则从 schemas 中获取第一个；
    所以在这里判定的就是这一个 db 的信息；

    确定是 DB_IN_ONE_SERVER 后，走 DBInOneServerCmdStrategy 策略；
    io.mycat.mycat2.cmds.strategy.AbstractCmdStrategy#matchMySqlCommand

    通过之前解析的信息 curMSQLPackgInf，获取到命令类型，COM_QUERY = 3；
2. 解析报文

    io.mycat.mycat2.sqlparser.BufferSQLParser#parse(java.nio.ByteBuffer, int, int, io.mycat.mycat2.sqlparser.BufferSQLContext)

    每个 session 都绑定了一个 BufferSQLParser 实例；

    包长度 - 包头 - 命令类型 = 查询的类容

    打印接收到的 SQL : 使用了 io.mycat.mycat2.sqlparser.byteArrayInterface.ByteBufferArray

    读取思路是：通过索引从 buffer 中获取字符，拼成字符串，从而不影响原有 buffer
    通过 io.mycat.mycat2.sqlparser.byteArrayInterface.Tokenizer2#tokenize
    把读取到的某些信息？转换成了 hash 值；反正看不懂。

    io.mycat.mycat2.sqlparser.BufferSQLParser#firstParse

    第一遍处理，通过在之前的 hash 中拿到值进行常量对比，能获取 sql 的具体命令类型，比如 set 命令（也属于 quary 命令）

    SSS 级难度的感觉，完全看不懂。反正就是通过 sql 类型，找到了 透传的单例 DirectPassthrouhCmd 命令报文支持
    session.curSQLCommand = command 绑定在了 session 上

## 4. 处理sql

`io.mycat.mycat2.MySQLCommand#procssSQL`

通过解析后，获取到 透传的 cmd ，开始处理 sql `io.mycat.mycat2.cmds.DirectPassthrouhCmd#procssSQL`

## 4.1 获取后端连接
`io.mycat.mycat2.MycatSession#getBackend`

要执行 sql 就得先获取到一个可用的后端连接；传递的是一个回调函数。那么获取后端连接都做了哪些工作呢？

1. 获取复制组的名称，`io.mycat.mycat2.MycatSession#getbackendName`

    根据 session 中绑定的 mycatSchema 中的 dataNode 获取到所属的复制组名称
2. 根据复制组名称获取后端会话连接 `io.mycat.mycat2.MycatSession#getBackendByRepBeanName`

    读写分离是从这里判定的：
    1. 根据静态注解，sql解析后的上下文中可以获取到注解类型 `io.mycat.mycat2.sqlparser.BufferSQLContext#getAnnotationType`

    2. 非事务场景下，走从节点，根据 autoCommit 的值，不自动提交标识没有事务？ 	

3. 根据复制组名称获取 `io.mycat.mycat2.MycatSession#getMySQLRepBean`

    MySQLRepBean 表示一組 MySQL Server 复制集群，如主从或者多主；该信息是在 datasource.yml 中配置的 mysql 相关连接的信息

4. 在根据是否走从节点判定结果，从 复制组中获取具体的 mysql 数据连接信息，
    - io.mycat.mycat2.beans.MySQLRepBean#getBalanceMetaBean
    - io.mycat.mycat2.beans.MySQLMetaBean   

5. 获取到当前的 MycatReactorThread 线程

    直接使用 (MycatReactorThread) Thread.currentThread(); 获取

    因为在 reactor 读取信息后，在该线程中调用的，是同步方法。能直接获取到；

6. 从当前seesion中先获取一次后端连接 `io.mycat.mycat2.MycatSession#findMatchedMySQLSession`

    根据获取到的 mysql（MySQLMetaBean）信息。在一个本类 backends list 中循环比对后端 session 绑定的 MySQLMetaBean 对象；

    如果找到则表示已经有一个后端连接可用。直接使用该连接；


## 4.2 缓存命中 session

  待会继续分析未找到的情况

1. 记录当前 session 使用的后端连接索引，curBackendIndex

  这得益于 一个seesion 同一时间只能处理一个语句

2. 同步这个后端 session 的相关状态 `io.mycat.proxy.MycatReactorThread#syncAndExecute`

    该方法又是一个回调方法。同步状态至后端数据库，包括：字符集，事务，隔离级别等

    1. 新建了一个 task `io.mycat.mycat2.tasks.BackendSynchronzationTask`

      把 mycatSession（mycat 与 前端客户端的连接状态信息）, mysqlSession（mycat 与 具体mysql 的连接信息） 传递进去了

    2. 这里设置了一个回调方法到这个 task 中；
    3. 开始同步状态 `io.mycat.mycat2.tasks.BackendSynchronzationTask#syncState`

      注意，该查询包是多条语句一起构造发送
      1. 创建 QueryPacket 查询包,以下同步的项目都是通过 前后 session 中的状态对比，不同则拼接 sql 语句
      2. 隔离级别
      3. 提交方式
      3. 字符集

      拼接完成同步的 sql 之后，后续的操作又是通过选择器的 读取结果（刚才发送的sql语句）；
      触发 `io.mycat.mycat2.tasks.BackendSynchronzationTask#onSocketRead` 方法。进行串联起来的

3. 同步状态发送之后，被触发读取结果 `io.mycat.mycat2.tasks.BackendSynchronzationTask#onSocketRead`

    1. 后端 session 读：session.readFromChannel ；读取当次的数据

    2. 统计接收到的响应报文个数 是否与之前 syncCmdNum（拼接 sql 语句的个数）相等；

        相等的话，则标识所有 状态同步语句均已同步成功,可以执行后面的操作，不相等的话则返回了，后面的不会执行；

        这里比较关键的一个方法：session.resolveMySQLPackage(true) ；

        因为在循环中对 syncCmdNum 执行 -- 操作，所以该方法还要容错，没有数据的话不会报错，而是返回类型是其他类型,通过这个类型，循环则可退出并拦截后面的语句执行

    3. 所有结果都返回后：

        都成功判定：

        1. 改写后端 session 中的状态标识字段
        2. 调用 finished(true) 方法，完成此次任务

        只要有一个失败，则构建一个错误包。并调用 finished(false) 方法完成此次调用

    4. `io.mycat.mycat2.tasks.AbstractBackendIOTask#finished`

        1. 委托 `io.mycat.mycat2.tasks.AbstractBackendIOTask#onFinished`

          判定是否成功，如果成功则往 reactor 线程中添加这个 session
        2. 回调方法 `io.mycat.mycat2.tasks.AsynTaskCallBack#finished`

          把相关信息回调到 `io.mycat.proxy.MycatReactorThread#syncAndExecute` 方法传递进去的回调函数中了

4. 同步结果获取后：

    1. 前后端 session 都切换了处理器为 MainMycatNIOHandler
    2. 判定是否执行成功：
      1. 执行成功：同步 mycatSchema 到后端 `io.mycat.proxy.MycatReactorThread#syncSchemaToBackend`
      2. 执行失败： 关闭前端 session，并把错误信息转发 `io.mycat.mycat2.MycatSession#close`

5. 同步 mycatSchema 到后端 `io.mycat.proxy.MycatReactorThread#syncSchemaToBackend`

    最开始获取后端连接传进来的回调函数被继续往下传递`io.mycat.mycat2.cmds.DirectPassthrouhCmd#procssSQL`

    判定后端 session 是否有一个 database。

    1. 没有的情况
  		1. 创建一个 io.mycat.mycat2.tasks.BackendSynchemaTask ，根据 当前的 session 查找一个 db。
  		2. 构造 use db 包 发送到后端连接
  		3. 又是之前的套路，设置了一个回调函数。这里可以看出来了，异步执行的方式都是通过回调函数
  		4. 执行成功之后回到该回调函数,同时切换了前后端的处理器为 MainMycatNIOHandler

        - 判定执行成功：`io.mycat.mycat2.tasks.AsynTaskCallBack#finished`

            这里才是最终返回最开始处理 sql 传入的回调函数的最后一站

            流程又被串联回到了 `io.mycat.mycat2.cmds.DirectPassthrouhCmd#procssSQL` 获取连接成功的回调函数中。

        - 未执行成功：`io.mycat.mycat2.MycatSession#responseOKOrError(io.mycat.mysql.packet.MySQLPacket)`
            把错误消息返回到前段连接

    2. 有的情况：

      回调函数不为 null 的时候，和上面没有情况中的 1.4.1 一致.也是最后一站

## 4.3 缓存未命中 session
当未命中的时候，一般就会新建连接了
从 reactor 中获取连接 `io.mycat.proxy.MycatReactorThread#tryGetMySQLAndExecute`
1. 在当前的 ractor.mySQLSessionMap 中尝试获取连接
	mySQLSessionMap ：存放后端连接的map,每个Reactor独立的一个后端连接池，不共享，每个Reactor线程自己负责清理释放多余富足的连接
	保存了当前MycatReactorThread对象所拥有的所有后端连接
2. 新建连接 io.mycat.proxy.MycatReactorThread#createSession
	一个回调方法；
	1. 从当前系统中所有的 reactor 线程中轮询获取该数据库（mySQLMetaBean）的连接
		只是统计该数据库连接的数量，+ 1后与配置的 MaxCon 数量进行对比。
		+1 的含义：如果当前新建连接之后，是否会大于配置的最大连接数量，
		如果大于则返回 errorPacket 包，服务器太繁忙了；
		因为来到此处必定是之前在创建的所有连接中都没有获取到一个可用的连接；
	2. 新建了一个 BackendConCreateTask 任务进行创建新连接
3. BackendConCreateTask 构造中的工作内容
	1. 从传入的 mySQLMetaBean 中获取真实数据库的相关信息，创建 nio 连接
		一个 task 创建一个连接，打开一个 socketChannel 通道进行 nio 相关操作
	2. 创建后端 session
		这里复用了前端 session 的父类中的逻辑。nio 绑定选择器，注册到了 选择器上
		创建之后，把 session 中的处理器绑定成了自己。
		源来 BackendConCreateTask 也是一个处理器；
		说一下这里：这个在创建 session 的时候，构造函数中往 selector 中注册了自己
		但是不会立即触发选择器的操作。为什么呢？一定要记得，现在还处于上一次选择器处理读事件中
		是一个同步操作！！！
	3. session 绑定 mySQLMetaBean
	4. 重要方法：调用了setSession 方法 io.mycat.mycat2.tasks.AbstractBackendIOTask#setSession(T, boolean)
		1. 被 session 绑定在自己身上
		2. 把 session 的处理器绑定成自己 session.setCurNIOHandler(this)
	本方法构造就完成了。后续部分都是通过 回调处理的；
	前面创建 session 注册在了 选择器 上。后续的操作在通过 选择器 触发读操作。
	触发的第一次读操作，也就是接收到了握手包。需要发送登录认证系列；
	io.mycat.mycat2.tasks.BackendConCreateTask#onSocketRead
4. 登录认证 io.mycat.mycat2.tasks.BackendConCreateTask#onSocketRead
	1. 第一次读 触发 发送登录认证包
	2. 第二次读 触发 完成登录，后端连接创建成功 io.mycat.mycat2.tasks.AbstractBackendIOTask#finished
		1. 往所在的 reactorTread 添加了当次创建成功的 session
		2. callBack 的 finished 方法被回调

        回到了最初`io.mycat.proxy.MycatReactorThread#tryGetMySQLAndExecute` 中 createSession 的传入的回调函数中

        也就是逻辑被串联回到了 [缓存命中第 2 步](./direct-passthrough.md#_4-2-缓存命中-session)，开始同步状态、


## 4.4 连接获取到后
1. session 的处理器设置成了 MainMycatNIOHandler 实例
2. 并判定了 exeSucces 状态：
	1. 成功的时候：标识后端连接创建成功
		1. 后端 session 设置读写分离标识，targetMetaBean.isSlaveNode() 读取的
		2. 后端 session 设置处理器 MainMycatNIOHandler
		3. 前端 session 绑定 后端 session
		4. 开始同步状态；  --> 这里回到了 获取后端连接 的第 8 步骤；
			可以看到，无论是从缓存中获取连接还是新建连接。获取成功之后都是 状态同步操作
	2. 创建失败的时候：发送了错误包

## 4.4.1 获取连接成功后
1. 更改写兴趣 io.mycat.mycat2.MycatSession#giveupOwner
2. 把 sql 语句发送出去 io.mycat.mycat2.cmds.DirectPassthrouhCmd#procssSQL :: io.mycat.proxy.AbstractSession#writeToChannel
	1. 往 channel 中写一次数据。
	2. 如果写完则对 buffer 清理一次，没写完则。。没有处理？			
3. 检查是否写完 io.mycat.proxy.AbstractSession#checkWriteFinished
	检查逻辑是 ProxyBuffer 中的 return readIndex == readMark;
	1. 如果没有写完，改变兴趣为写。从这里可以看出来， reactor 中可能有处理写这个功能
	2. 如果已经写完，则继续委托 io.mycat.proxy.AbstractSession#writeFinished
4. session 的回调方法，写完成 io.mycat.proxy.AbstractSession#writeFinished
	继续委托 io.mycat.proxy.NIOHandler#onWriteFinished
	在本流程中是：io.mycat.mycat2.net.MainMySQLNIOHandler#onWriteFinished
	获取到 MySQLCommand，然后委托 io.mycat.mycat2.MySQLCommand#onBackendWriteFinished 方法
	让每个 command 去处理写完成；这里是io.mycat.mycat2.cmds.DirectPassthrouhCmd#onBackendWriteFinished透传的处理
5. DirectPassthrouhCmd 检查是否已经响应
	1. 在 session 中获取了状态机 io.mycat.mycat2.MycatSession#responseStateMachine -》 MySQLProxyStateM 类
	2. 状态机判定是否完成响应：io.mycat.mycat2.cmds.judge.MySQLProxyStateM#isFinished
		这是判定逻辑 this.isCommandFinished ||MySQLCommand.COM_STMT_CLOSE == commandType;
		后续在来看这些状态是哪里改变的；
		1. 如果已经响应则改变兴趣为 读
		2. 如果没有响应，也就是正常的逻辑流程；改变兴趣为读，并返回 false；
			在 io.mycat.mycat2.net.MainMySQLNIOHandler#onWriteFinished 中会进行判定这里的返回结果
			如果已经响应完成，则清理资源（具体清理了那些后面再分析）
到此此流程一轮结束；调用结束之后，就回到了 ProxyReactorThread 中，后端 mysql 响应之后
会调用当前与 session 绑定的处理器，也就是 io.mycat.mycat2.net.MainMySQLNIOHandler#onSocketRead

## 4.4.2 处理响应

 `io.mycat.mycat2.net.MainMySQLNIOHandler#onSocketRead`
该方法与前面  `io.mycat.mycat2.net.MainMySQLNIOHandler#onWriteFinished` 中的主要处理逻辑差不多
只是这里调用了 `io.mycat.mycat2.MySQLCommand#onBackendResponse` 方法来判定返回 boolean 类型，完成则清理资源；

透传的响应处理：`io.mycat.mycat2.cmds.DirectPassthrouhCmd#onBackendResponse`
1. 从 channel 中读取数据到 proxyBuffer中； `io.mycat.proxy.AbstractSession#readFromChannel`
2. 循环调用 判定当前包是否已经读完

    `io.mycat.mycat2.AbstractMySQLSession#isResolveMySQLPackageFinished`
    判定逻辑：`this.proxyBuffer.readIndex != this.proxyBuffer.writeIndex`
    没有读完的情况下一直循环

    1. 包解析，前面读取前端包也是这个方法，这里复用了 io.mycat.mycat2.AbstractMySQLSession#resolveCrossBufferMySQLPackage
  	2. 读取到整包。（响应包是很多个mysql数据包，这里是一个包一个包的解析）

      进状态机，这个+前面包解析的方法是透传的精华

      `io.mycat.mycat2.cmds.judge.MySQLProxyStateMHepler#on`
      1. 是否是 eof 包
      2. 是否是 ok 包
      3. 进入状态机：`io.mycat.mycat2.cmds.judge.MySQLProxyStateM#on(int, int, boolean`
        	1. 根据服务器状态值是否是 hasMoreResult ？
        	2. 一系列的状态判定当前 CommandFinished 是否已经完成：`io.mycat.mycat2.cmds.judge.MySQLProxyStateM#on(int, boolean, boolean, boolean`
        		1. 如果完成则回调 io.mycat.mycat2.cmds.judge.MySQLPacketCallback#onCommandFinished
        		2. 没有完成则返回 false ；当次循环结束。

	 -----------《-------《----

	 循环重复执行，resolveCrossBufferMySQLPackage 解析包头和部分数据，会消费 buffer 中的数据； `io.mycat.mycat2.AbstractMySQLSession#resolveCrossBufferMySQLPackage`

   最妙的就是这里了，被包装的 proxyBuf 的读写为止被改变，但是 原始 buffer 的指针却没有被改变过；
		通过少量的读取，和改变 proxyBuf 中的读写指针。能让业务代码进行判定，这也是透传的精华之一，少量解析，完成透传

	直到当前已读取的数据已经被处理完；循环结束；
3. 所有包都解析完成之后，（这里为什么要用状态机来判定？）

    之前我问过 leader 一个问题：既然是透传，后端响应什么就传递什么好了，为什么还要解析？

    leader 回答：如果不解析，有什么办法知道在什么时机回收 session ？

    这里判定包结束之后,一大难点也就是各种命令下的包在什么时候已经结束了。。。

    会把响应结果透传到前端；这里的一段代码就解惑了之前觉得 proxybuffer 的 readMark 有什么用？
    这里是原始包开始位置，在上面的循环中改变了 buffer  位置；在 `io.mycat.proxy.AbstractSession#writeToChannel`
    的时候，时回到原来的位置，往前端传递整包，也就达到了透传的效果。

## 什么是透传?
到现在也没有明白到底什么是透传。

1. `io.mycat.mycat2.sqlparser.BufferSQLParser` 提供 sql 语句的第一次解析，获得 sql 类型等基础信息。不需要 drui 解析成语法树
2. 只适合不需处理的结果集（如需要排序等操作，就没法透传了）
3. 对于查询语句，一般只需要包类型，表名？定位到对应的 mysql
4. 对于结果集，如若不考虑 session 回收的话，可以全部透传，不解析，但是不可能

   只检查包的前面几个字节，获取响应类型。然后判定该响应是否完结（这一步有点难）。

5. 把指针重置，然后把结果写出到前端。
