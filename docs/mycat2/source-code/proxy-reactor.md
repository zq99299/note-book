# proxy reactor 模型
代理的 reactor 模型，研究该模式的一个大致写法、握手登录认证流程

io.mycat.mycat2.ProxyStarter#start 开始构造的地方
```java
NIOAcceptor acceptor = new NIOAcceptor(new DirectByteBufferPool(proxybean.getBufferPoolPageSize(),
    proxybean.getBufferPoolChunkSize(),
    proxybean.getBufferPoolPageNumber()));
acceptor.start();

构造里面比较简单。
```java
public NIOAcceptor(BufferPool bufferPool) throws IOException {
  super(bufferPool);
  this.setName("NIO-Acceptor");
}

@SuppressWarnings("unchecked")
public ProxyReactorThread(BufferPool bufPool) throws IOException {
  this.bufPool = bufPool;
  // 一个 ProxyReactorThread 线程一个独立的 selector 提高性能
  this.selector = Selector.open();
  sessionMan = (SessionManager<T>) ProxyRuntime.INSTANCE.getSessionManager();
}
```

主要的选择逻辑
```java
io.mycat.proxy.ProxyReactorThread#run

public void run() {
		long ioTimes = 0;
    // 构造了一个 当前处理的环境，里面只有两个属性
    // counter 计数器和 curSession 当前 session
		ReactorEnv reactorEnv = new ReactorEnv();
		while (true) {
			try {
        // 选择了超时的方法，默认是 100 毫秒
				selector.select(SELECTOR_TIMEOUT);
				final Set<SelectionKey> keys = selector.selectedKeys();
				// logger.info("handler keys ,total " + selected);
        // 当没有事件的时候处理 pendingJobs ，
        // 这里高效的利用了 acceptor 线程的空闲时间
				if (keys.isEmpty()) {
					if (!pendingJobs.isEmpty()) {
						ioTimes = 0;
						this.processNIOJob();
					}
					continue;
				}
        // 当 acceptor 繁忙的时候，处理 5 次则必须处理一次 pendingJobs
        // 防止 acceptor 一直繁忙，pendingJobs 被饿死的情况
        else if ((ioTimes > 5) & !pendingJobs.isEmpty()) {
					ioTimes = 0;
					this.processNIOJob();
				}
				ioTimes++;
				for (final SelectionKey key : keys) {
          // 判定了 链接、读、写 事件，委托不同的方法进行处理
					try {
						int readdyOps = key.readyOps();
						reactorEnv.curSession = null;
						// 如果当前收到连接请求
						if ((readdyOps & SelectionKey.OP_ACCEPT) != 0) {
							processAcceptKey(reactorEnv, key);
						}
						// 如果当前连接事件
						else if ((readdyOps & SelectionKey.OP_CONNECT) != 0) {
							this.processConnectKey(reactorEnv, key);
						} else if ((readdyOps & SelectionKey.OP_READ) != 0) {
							this.processReadKey(reactorEnv, key);

						} else if ((readdyOps & SelectionKey.OP_WRITE) != 0) {
							this.processWriteKey(reactorEnv, key);
						}
					} catch (Exception e) {
						if (logger.isWarnEnabled()) {
							logger.warn("Socket IO err :", e);
						}
            // 当异常的时候，取消掉
            // 该 api 会将当期的 key 添加到 待取消的 集合中
            // 下一次 选择的时候 select() 会进行清理，对 channel 与 key 进行解绑
						key.cancel();
            // 且会把当前的 session 进行关闭
            // 在关闭的时候还做了大量的操作
						if (reactorEnv.curSession != null) {
							reactorEnv.curSession.close(false, "Socket IO err:" + e);
							this.allSessions.remove(reactorEnv.curSession);
							reactorEnv.curSession = null;
						}
					}
				}
				keys.clear();
			} catch (IOException e) {
				logger.warn("caugh error ", e);
			}

		}

	}
```

acceptor 的主要选择逻辑是比较简单的，是很经典的一个选择处理；
这里有两个值的学习的地方：

1. 使用了超时的 select 方法

   这将会在编程的时减少大量的 wakeup() 操作。降低了编程难度，提高了性能，缺点是造成了 cpu 空转，但是第二个有点就弥补了这个缺点

2. 当选择不繁忙的时候主动进行其他的处理

   处理连接的线程，肯定是需要高性能的，所以可以断定 这个其他的处理必然不会很耗时。

主要逻辑完成了，但是这个 acceptor 还不能正常接收连接的，服务端的端口还没有。

## ServerSocketChannel 的初始化
io.mycat.mycat2.ProxyStarter#start

```java
与 构造 acceptor 同一个方法里面，默认是非集群。也是当前所阅读的源码
if (clusterBean.isEnable()) {
  // 启动集群
  startCluster(runtime, clusterBean, acceptor);
} else {
  // 未配置集群，直接启动
  startProxy(true);
}
```

```java

	/**
	 * 启动代理
	 * @param isLeader true 主节点，false 从节点
	 * @throws IOException
	 */
	public void startProxy(boolean isLeader) throws IOException {
		ProxyRuntime runtime = ProxyRuntime.INSTANCE;
		MycatConfig conf = runtime.getConfig();
		NIOAcceptor acceptor = runtime.getAcceptor();

		ProxyConfig proxyConfig = conf.getConfig(ConfigEnum.PROXY);
		ProxyBean proxyBean = proxyConfig.getProxy();
    // 主要是这一句 是对 ServerSocketChannel 的初始化
		if (acceptor.startServerChannel(proxyBean.getIp(), proxyBean.getPort(), ServerType.MYCAT)){
			.....
			});
		}
    ....
	}

```
io.mycat.proxy.NIOAcceptor#startServerChannel

```java
public boolean startServerChannel(String ip, int port, ServerType serverType) throws IOException {
  final ServerSocketChannel serverChannel = getServerSocketChannel(serverType);
  if (serverChannel != null && serverChannel.isOpen()) {
    return false;
  }

  ....

  // 非集群下的初始化
  openServerChannel(selector, ip, port, serverType);
  return true;
}

private void openServerChannel(Selector selector, String bindIp, int bindPort, ServerType serverType)
    throws IOException {
  // 经典式的模板代码
  final ServerSocketChannel serverChannel = ServerSocketChannel.open();
  final InetSocketAddress isa = new InetSocketAddress(bindIp, bindPort);
  serverChannel.bind(isa);
  serverChannel.configureBlocking(false);
  serverChannel.setOption(StandardSocketOptions.SO_REUSEADDR, true);
  // 这里注册时候需要注意下，注册了一个 attachment
  // 一般的写法是在 连接到此 serverChannel 的 key 进行设置 attachment
  // 这里是在注册 serverChannel 的时候设置了一个
  // 它的作用是：所有连接到此 serverChannel 的 channel 绑定的 key 中的 attachment 的初始值是 serverChannel 的值
  serverChannel.register(selector, SelectionKey.OP_ACCEPT, serverType);
  if (serverType == ServerType.CLUSTER) {
  } else if (serverType == ServerType.LOAD_BALANCER) {
  } else {
    logger.info("open proxy server port on {}:{}", bindIp, bindPort);
    proxyServerSocketChannel = serverChannel;
  }
}
```

到此为止 acceptor 的工作能正常接受连接了

## 连接处理

io.mycat.proxy.NIOAcceptor#processAcceptKey
```java
protected void processAcceptKey(ReactorEnv reactorEnv, SelectionKey curKey) throws IOException {
		ServerSocketChannel serverSocket = (ServerSocketChannel) curKey.channel();
		// 接收通道，设置为非阻塞模式
		final SocketChannel socketChannel = serverSocket.accept();
		socketChannel.configureBlocking(false);
		logger.info("new Client connected: " + socketChannel);
		ServerType serverType = (ServerType) curKey.attachment();
		ProxyRuntime proxyRuntime = ProxyRuntime.INSTANCE;
		// 获取附着的标识，即得到当前是否为集群通信端口
		if (serverType == ServerType.CLUSTER) {
			....
		} else if (serverType == ServerType.LOAD_BALANCER &&
				   proxyRuntime.getMyCLuster() != null &&
                   proxyRuntime.getMyCLuster().getClusterState() == ClusterState.Clustered) {
      ....
		} else {
      // 最后委托了该方法进行处理
			accept(reactorEnv,socketChannel,serverType);
		}
	}

private void accept(ReactorEnv reactorEnv,SocketChannel socketChannel,ServerType serverType) throws IOException {
	// 找到一个可用的NIO Reactor Thread，交付托管
	ProxyReactorThread<?> nioReactor = getProxyReactor(reactorEnv);
	// 将通道注册到reactor对象上
  // ProxyReactorThread 实际上是一个 io.mycat.proxy.MycatReactorThread
  // 这里实际上已经委托了，这里只是把 这个通道添加到了 reactor的队列中了
	nioReactor.acceptNewSocketChannel(serverType, socketChannel);
}

// 从池中获取可用 reactor 线程，做了一个简单的取模，相当于均衡负载
private ProxyReactorThread<?> getProxyReactor(ReactorEnv reactorEnv){
	if (reactorEnv.counter++ == Integer.MAX_VALUE) {
		reactorEnv.counter = 1;
	}
	int index = reactorEnv.counter % ProxyRuntime.INSTANCE.getNioReactorThreads();
	// 获取一个reactor对象
	return ProxyRuntime.INSTANCE.getReactorThreads()[index];
}
```

## reactor 接受并触发 session 绑定
io.mycat.proxy.ProxyReactorThread#acceptNewSocketChannel

```java
public void acceptNewSocketChannel(Object keyAttachement, final SocketChannel socketChannel) {
    // 只是把创建session的逻辑放到了队列里面
    // 可见这个是一个稍微耗时的方法， acceptor 线程当前阶段的工作就完成了，可以返回处理其他请求了，很高效
		pendingJobs.offer(() -> {
			try {
				T session = sessionMan.createSession(keyAttachement, this.bufPool, selector, socketChannel, true);
				allSessions.add(session);
			} catch (Exception e) {
				e.printStackTrace();
				logger.warn("regist new connection err " + e);
			}
		});
	}
```

那么这里放入队列之后，什么时候处理呢？在 nio 开发中，前面也看到了，利用空闲时间做一点事情，那么这里也一样

io.mycat.proxy.ProxyReactorThread#run

```java
while (true) {
			try {
				selector.select(SELECTOR_TIMEOUT);
				final Set<SelectionKey> keys = selector.selectedKeys();
				// logger.info("handler keys ,total " + selected);
				if (keys.isEmpty()) {
          // 这里很快就能处理刚请求连接到 mycat 的连接
					if (!pendingJobs.isEmpty()) {
						ioTimes = 0;
						this.processNIOJob();
					}
					continue;

// 从队列中取出，注意的是这里的取出后的运行逻辑
private void processNIOJob() {
		Runnable nioJob = null;
		while ((nioJob = pendingJobs.poll()) != null) {
			try {
        // 直接用的 run 而不是 start。同步执行之前用 拉姆达表达式放入队列中的逻辑
				nioJob.run();
			} catch (Exception e) {
				logger.warn("run nio job err ", e);
			}
		}

	}
```

重点逻辑来了；session 的绑定

## session 绑定
io.mycat.mycat2.MycatSessionManager#createSession

```java
@Override
	public MycatSession createSession(Object keyAttachment, BufferPool bufPool, Selector nioSelector,
			SocketChannel frontChannel, boolean isAcceptCon) throws IOException {
        if (logger.isInfoEnabled()) {
            logger.info("MySQL client connected  ." + frontChannel);
        }
		MycatSession session = new MycatSession(bufPool, nioSelector, frontChannel);
		// 第一个IO处理器为Client Authorware
    // session 构造出来的时候，给定了一个 io.mycat.mycat2.net.MySQLClientAuthHandler
		session.setCurNIOHandler(MySQLClientAuthHandler.INSTANCE);
		// 默认为透传命令模式
		//session.curSQLCommand = DirectPassthrouhCmd.INSTANCE;
		// 向MySQL Client发送认证报文（握手包）
		session.sendAuthPackge();
		session.setSessionManager(this);
		allSessions.add(session);
		return session;
	}

在构造 MycatSession 的时候，把 channel 与 selecter 相关联的

public AbstractSession(BufferPool bufferPool, Selector selector, SocketChannel channel, int socketOpt)
            throws IOException {
        this.bufPool = bufferPool;
        this.nioSelector = selector;
        this.channel = channel;
        InetSocketAddress clientAddr = (InetSocketAddress) channel.getRemoteAddress();
        this.addr = clientAddr.getHostString() + ":" + clientAddr.getPort();
        this.host = clientAddr.getHostString();
        SelectionKey socketKey = channel.register(nioSelector, socketOpt, this);
        this.channelKey = socketKey;
        this.proxyBuffer = new ProxyBuffer(this.bufPool.allocate());
        this.sessionId = ProxyRuntime.INSTANCE.genSessionId();
        this.startTime = System.currentTimeMillis();
    }
```

## 发送认证包（握手包）
io.mycat.mycat2.MycatSession#sendAuthPackge

```java
/**
 * 给客户端（front）发送认证报文
 *
 * @throws IOException
 */
public void sendAuthPackge() throws IOException {
    // 生成认证数据
    byte[] rand1 = RandomUtil.randomBytes(8);
    byte[] rand2 = RandomUtil.randomBytes(12);

    // 保存认证数据
    byte[] seed = new byte[rand1.length + rand2.length];
    System.arraycopy(rand1, 0, seed, 0, rand1.length);
    System.arraycopy(rand2, 0, seed, rand1.length, rand2.length);
    this.seed = seed;

    // 发送握手数据包
    HandshakePacket hs = new HandshakePacket();
    hs.packetId = 0;
    hs.protocolVersion = Version.PROTOCOL_VERSION;
    hs.serverVersion = Version.SERVER_VERSION;
    hs.threadId = this.getSessionId();
    hs.seed = rand1;
    hs.serverCapabilities = getServerCapabilities();
    // hs.serverCharsetIndex = (byte) (charsetIndex & 0xff);
    hs.serverStatus = 2;
    hs.restOfScrambleBuff = rand2;
    hs.write(proxyBuffer);
    // 设置frontBuffer 为读取状态
    proxyBuffer.flip();
    proxyBuffer.readIndex = proxyBuffer.writeIndex;
    // 构造握手包后，发送到 channel
    this.writeToChannel();
}

io.mycat.proxy.AbstractSession#writeToChannel

/**
    * 从内部Buffer数据写入到SocketChannel中发送出去，readState里记录了写到Socket中的数据指针位置 方法，
    */
   public void writeToChannel() throws IOException {
       checkBufferOwner(true);
       ByteBuffer buffer = proxyBuffer.getBuffer();
       buffer.limit(proxyBuffer.readIndex);
       buffer.position(proxyBuffer.readMark);
       // 往通道写入，完成 发送握手数据包 阶段
       int writed = channel.write(buffer);
       proxyBuffer.readMark += writed; // 记录本次磁轭如到 Channel 中的数据
       if (!buffer.hasRemaining()) {
           if (proxyBuffer.readMark != proxyBuffer.readIndex) {
               logger.error("writeToChannel has finished but readIndex != readLimit, please fix it !!!");
           }
           if (proxyBuffer.readIndex > buffer.capacity() * 2 / 3) {
               proxyBuffer.compact();
           } else {
               buffer.limit(buffer.capacity());
           }
       } else {
           /**
            * 1. writed==0 或者 buffer 中数据没有写完时,注册可写事件 通常发生在网络阻塞或者 客户端
            * COM_STMT_FETCH 命令可能会 出现没有写完或者 writed == 0 的情况
            */
           logger.debug("register OP_WRITE  selectkey .write  {} bytes. current channel is {}", writed, channel);
       }
       checkWriteFinished();
   }
```

## 接收认证数据包入口

发送完握手数据包，客户端会解析，并构造认证包（登录）到 mycat；而 mycat 所做的则是
读取并解析认证包，如果用户密码等策略能通过，则完成登录

接收到数据的入口还是在 reactor 中；

io.mycat.proxy.ProxyReactorThread#processReadKey
```java
protected void processReadKey(ReactorEnv reactorEnv, SelectionKey curKey) throws IOException {
  // only from cluster server socket
  // 拿到之前绑定的 session
  T session = (T) curKey.attachment();
  reactorEnv.curSession = session;
  // 在 session 构造的时候放入的是一个 MySQLClientAuthHandler
  session.getCurNIOHandler().onSocketRead(session);
}
```

io.mycat.mycat2.net.MySQLClientAuthHandler#onSocketRead
## 读取解析认证数据包
```java
@Override
	public void onSocketRead(MycatSession session) throws IOException {
		ProxyBuffer frontBuffer = session.getProxyBuffer();
    // resolveMySQLPackage 包大概的功能是对兑取到的数据进行是否是半包的判定
    // 判定的原理大致是：mysql 协议前面几个字节就能得到该包的长度，
    // 通过包长度和当前 buffer 读取到的数据长度对比就能得到是否是完整的包
    // 注意：只是判定这些，而不是真正的解析成 对象；
    // 具体的解析是由其他需要完整解析的时候再解析出来，
    // 比如下面的代码
    // CurrPacketType.Full 标识读取的数据包是完整的
		if (session.readFromChannel() == false
				|| CurrPacketType.Full != session.resolveMySQLPackage(frontBuffer, session.curMSQLPackgInf, false)) {
			return;
		}

    // 从这里开始处理用户登录相关的逻辑
		// 处理用户认证报文
		try {
			AuthPacket auth = new AuthPacket();
			auth.read(frontBuffer);

			MycatConfig config = ProxyRuntime.INSTANCE.getConfig();
			UserConfig userConfig = config.getConfig(ConfigEnum.USER);
			UserBean userBean = null;
			for (UserBean user : userConfig.getUsers()) {
				if (user.getName().equals(auth.user)) {
					userBean = user;
					break;
				}
			}

			// check user
			if (!checkUser(session, userConfig, userBean)) {
				failure(session, ErrorCode.ER_ACCESS_DENIED_ERROR, "Access denied for user '" + auth.user + "' with addr '" + session.addr + "'");
				return;
			}

			// check password
			if (!checkPassword(session, userBean, auth.password)) {
				failure(session, ErrorCode.ER_ACCESS_DENIED_ERROR, "Access denied for user '" + auth.user + "', because password is error ");
				return;
			}

            // check mycatSchema
			switch (checkSchema(userBean, auth.database)) {
				case ErrorCode.ER_BAD_DB_ERROR:
					failure(session, ErrorCode.ER_BAD_DB_ERROR, "Unknown database '" + auth.database + "'");
					break;
				case ErrorCode.ER_DBACCESS_DENIED_ERROR:
					String s = "Access denied for user '" + auth.user + "' to database '" + auth.database + "'";
					failure(session, ErrorCode.ER_DBACCESS_DENIED_ERROR, s);
					break;
				default:
                    // set mycatSchema
					if (auth.database == null) {
                        session.mycatSchema = (userBean.getSchemas() == null) ?
								config.getDefaultSchemaBean() : config.getSchemaBean(userBean.getSchemas().get(0));
					} else {
                        session.mycatSchema = config.getSchemaBean(auth.database);
					}
                    if (Objects.isNull(session.mycatSchema)) {
                        logger.error(" mycatSchema:{} can not match user: {}", session.mycatSchema, auth.user);
                    }
                    logger.debug("set mycatSchema: {} for user: {}", session.mycatSchema, auth.user);
					if (success(session, auth)) {
						session.clientUser=auth.user;//设置session用户
						session.proxyBuffer.reset();
						session.answerFront(AUTH_OK);
						// 认证通过，设置当前SQL Handler为默认Handler
            // 在这里切换了 session 的处理器。只要登录认证通过之后，就由该处理器来
            // 来进行处理后续的数据交互等。也就是可以进行发送查询语句了
						session.setCurNIOHandler(DefaultMycatSessionHandler.INSTANCE);
					}
			}
		} catch (Throwable e) {
			logger.warn("Frontend FrontendAuthenticatingState error:", e);
		}
	}

```

## 总结

到这里 mycat 怎么初始化 reactor 模式的，怎么接收 mycat 客户端的登录认证的流程已经 ok 了；

主要的几个概念主角类：

- NIOAcceptor ：处理客户端连接
- MycatSession ：绑定客户端的 channel 和保存当前会话的一些状态等
- MycatReactorThread ：处理读写数据的调度
- MySQLClientAuthHandler ：处理握手认证功能

大致步骤：

1. 客户端请求连接到 mycat
2. NIOAcceptor 进行初始化操作构造绑定 session
3. 委托 MySQLClientAuthHandler 处理登录认证
4. MySQLClientAuthHandler 发送握手包
5. 客户端接到 mycat 的握手包，进行响应发送 验证包（登录）
6. MySQLClientAuthHandler 读取认证包解析并验证用户名密码等相关权限是否ok
7. 通过之后更换处理器为 DefaultMycatSessionHandler。登录认证完成，可以进行命令的交互了
