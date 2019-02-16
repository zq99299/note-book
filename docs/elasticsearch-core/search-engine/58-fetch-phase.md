# 分布式搜索引擎内核解密之 fetch phase

## 什么是  fetch phase？
就是获取数据阶段，query phase 获取到的只是 id，fetch phase 会批量到各个 shard 上去获取数据

::: tip 疑问
这里就明白了之前为什么需要正排索引了？
貌似在这一步获取数据之后再排序不行么？
搞不明白，好像都很麻烦的原理
:::

## fetch phbase 工作流程

1. coordinate node 构建完 priority queue 之后，就发送 mget 请求去所有 shard 上获取对应的 document
2. 各个 shard 将 document 返回给 coordinate node
3. coordinate node 将合并后的 document 结果返回给 client 客户端

一般搜索，如果不加 from 和 size，就默认搜索前 10条，按照 `_score` 排序
