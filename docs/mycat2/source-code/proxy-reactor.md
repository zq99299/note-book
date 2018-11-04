# proxy reactor 模型
代理的 reactor 模型，研究该模式的一个大致写法。

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


```
## 读处理

## 写处理
