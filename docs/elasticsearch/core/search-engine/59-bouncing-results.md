# 搜索相关参数梳理以及 bouncing results 问题解决方案

本章重点：怎么解决 bouncing results 和 timeout、routing 回顾，其他的不详细解说

## 什么是 bouncing results？

看一个场景：两个 document 排序，field 值相同；不同的 shard 上，可能排序不同；
每次请求轮询打到不同的 replica shard 上；每次页面上看到的搜索结果的排序都不一样。这就是 **bouncing result**，也就是跳跃的结果。

解决方案：使用 preference

什么是 preference ? 决定了哪些 shard 会被用来执行搜索操作,可选值有如下

- `_primary`
- `_primary_first`
- ` _local`
- ` _only_node:xyz`
- ` _prefer_node:xyz`
- ` _shards:2,3`

这里的每个值不解说，在高级课程中才会解说。

解决 preference 的思路：将 preference 设置为一个字符串，比如说 user_id，让每个 user 每次搜索的时候，都使用同一个 replica shard 去执行，就不会看到 bouncing results 了

这里的 user_id 是指，假如 id=123 的用户查询，那么久将 preference=123。id=234 的用户查询就设置为 234 。

```json
GET /_search?preference=123
```

## timeout

已经讲解过原理了，主要就是限定在一定时间内，将部分获取到的数据直接返回，避免查询耗时过长

## routing

document 文档路由默认是 `_id` 路由；routing=user_id，这样的话可以让同一个 user 对应的数据到一个 shard 上去

## search_type

default：query_then_fetch

dfs_query_then_fetch：可以提升 revelance sort（相关性排序） 精准度
