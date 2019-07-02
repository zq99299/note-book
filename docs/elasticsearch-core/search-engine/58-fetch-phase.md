# 分布式搜索引擎内核解密之 fetch phase

## 什么是  fetch phase？
就是获取数据阶段，query phase 获取到的只是 id，fetch phase 会批量到各个 shard 上去获取数据

::: tip 疑问
这里就明白了之前为什么需要正排索引了？
貌似在这一步获取数据之后再排序不行么？
搞不明白，好像都很麻烦的原理
个人理解：排序是在query phase阶段做的，在这个阶段每个分片会返回所有符合条件的文档的id以及其排序所需要用到参数，协调节点对所有分片返回的数据进行排序后根据from和size得到最终符合要求的文档的id，协调节点根据id去各个分片上获取数据，此时使用的就是 id -> 文档 的正向索引
:::

## fetch phbase 工作流程

1. coordinate node 构建完 priority queue 之后，就发送 mget 请求去所有 shard 上获取对应的 document
2. 各个 shard 将 document 返回给 coordinate node
3. coordinate node 将合并后的 document 结果返回给 client 客户端

一般搜索，如果不加 from 和 size，就默认搜索前 10条，按照 `_score` 排序
