# document 增删改内部原理图解揭秘

![](./assets/markdown-img-paste-2019010621164080.png)

1. 客户端选择一个 node 发送请求过去，这个 node 就是 coordinating node（协调节点）
2. coordinating node，对 document 进行路由，将请求转发给对应的 node（有primary shard）
3. 实际的 node 上的 primary shard 处理请求，然后将数据同步到 replica node
4. coordinating node，如果发现 primary node 和所有 replica node 都搞定之后，就返回响应结果给客户端

::: warning 疑问
有一个知识点可能没有说到，3个 primary shard，这 3个 shard 的数据是怎么协调的呢？

这里的解密感觉还是很初级的解密
:::
