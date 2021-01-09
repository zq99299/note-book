# client 集群自动探查以及汽车零售店案例背景

快速入门篇（[练习例子-员工管理](../../elasticsearch-core/72-employee-example.md) ），讲解过了一些基本的 java api，包括了 document 增删改查，基本的搜索，基本的聚合

高手进阶篇，必须将 java api 这块深入讲解一下，介绍一些最常用的，最核心的一些 api 的使用，用一个模拟现实的案例背景，让大家在学习的时候更加贴近业务

## 讲师吐槽
本段是讲师吐槽，大意是 java api 不能所有功能都讲解，只讲最常用的一些核心 api

话说在前面，我们是不可能将所有的 java api 用视频全部录制一遍的，因为 api 太多了。

我们之前讲解各种功能，各种知识点，花了那么多的时间，哪儿些才是最最关键的，知识，原理，功能，es restful api，最次最次，哪怕是搞 php，搞 python 的人也可以来学习

如果说，现在要将所有所有的 api 全部用 java api 实现一遍和讲解，太耗费时间了，几乎不可能接受

采取的粗略，将核心的 java api 语法，还有最最常用的那些 api 都给大家上课演示了

然后最后一讲，会告诉大家，在掌握了之前那些课程讲解的各种知识点之后，如果要用 java api 去实现和开发，应该怎么自己去探索和掌握

java api，api 的学习，实际上是最最简单的，纯用，没什么难度，技术难度，你掌握了课上讲解的这些 api之后，自己应该就可以举一反三，后面自己去探索和尝试出自己要用的各种功能对应的 java api 是什么。

## client 集群自动探查
默认情况下，是根据我们手动指定的所有节点，依次轮询这些节点，来发送各种请求的，如下面的代码，我们可以手动为 client 指定多个节点

```java
TransportClient client = new PreBuiltTransportClient(settings)
				.addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost1"), 9300))
				.addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost2"), 9300))
				.addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost3"), 9300));
```

但是问题是，如果我们有成百上千个节点呢？难道也要这样手动添加吗？

es client 提供了一种集群节点自动探查的功能，打开这个自动探查机制以后，es client 会根据我们手动指定的几个节点连接过去，然后通过集群状态自动获取当前集群中的所有 data node，然后用这份完整的列表更新自己内部要发送请求的 node list。默认每隔 5 秒钟，就会更新一次 node list。

但是注意，es cilent 是不会将 Master node 纳入 node list 的，因为要避免给 master node 发送搜索等请求。

这样的话，我们其实直接就指定几个 master node，或者 1 个 node 就好了，client 会自动去探查集群的所有节点，而且每隔 5 秒还会自动刷新。非常棒。

:::warning
之前我记得说没有 master 之分来着，这里怎么又强调了呢？
:::

```java
Settings settings = Settings.builder()
               .put("client.transport.sniff", true).build();
       TransportClient client = new PreBuiltTransportClient(settings)
               .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost"), 9300));
```
在实际的生产环境中，都是这么玩儿的。

## 汽车零售案例背景

简单来说，会涉及到三个数据，汽车信息、汽车销售记录、汽车 4S 店信息

后面的讲解 java api 的使用基于这个案例进行讲解
