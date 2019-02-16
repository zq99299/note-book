# 分页搜索、deep paging
[[toc]]

1. 讲解如何使用es进行分页搜索的语法
2. 什么是deep paging问题？为什么会产生这个问题，它的底层原理是什么？

## 分页语法
由以下两个参数控制：

- from：从那一条数据开始？
- size：获取多少条

```json
GET /_search?size=10
GET /_search?size=10&from=0
GET /_search?size=10&from=20
```

```json
GET /test_index/test_type/_search

---------- 响应

"hits": {
  "total": 8,
  "max_score": 1,
  "hits": [
  ]
}  
```
::: tip
这里还是证明了前面某一章节解释 hits.total 解释错的。这里的数量就是这次你查询的总数量
:::

对于这 8 条数据进行每页 3 条数据的分页，大致是以下请求

```json
GET /test_index/test_type/_search?from=0&size=3
GET /test_index/test_type/_search?from=3&size=3
GET /test_index/test_type/_search?from=6&size=3
```


## deep paging
什么是 deep paging ？

看下图，记住一个知识点：分页搜索 10 条数据，在搜索深分页（比如 10000 条以后的数据），
每个节点会返回 10000+ 条数据进行排序后再选中其中的 10 条数据返回；

这资源耗费是很大的，就如同 mycat 中的分页是一个原理，需要协调节点来聚合并返回结果，但是这个 es 是怎么解决的呢?


![](./assets/markdown-img-paste-20190112170019724.png)
