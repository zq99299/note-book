# fielddata 内存控制以及 circuit breaker 短路器
[[toc]]

## fielddata 核心原理

fielddata 加载到内存的过程是 lazy 加载的，对一个 analzyed field 执行聚合时，
才会加载，而且是 field-level（字段级别而不是该 doc 的所有字段） 加载的，
一个 index 的一个 field，所有 doc 都会被加载而不是少数 doc，
不是 index-time 创建，是 query-time 创建

## fielddata 内存限制
有一个配置字段可以配置 `indices.fielddata.cache.size`: 20%，

作用是占用的内存超出了这个比例的限制，清除内存已有 fielddata 数据，
默认无限制。

虽然可以限制内存使用，但是会导致频繁 evict 和 reload，大量 IO 性能损耗，以及内存碎片和 gc

配置方式：在配置文件 `elasticsearch-5.2.0/config/elasticsearch.yml` 新增该配置参数即可

::: tip
该配置文件中默认是没有改参数配置的，所以搜不到该配置的关键信息
:::

## 监控 fielddata 内存使用

```json
// 所有分片的统计信息
GET /_stats/fielddata?fields=*

// 获取每个 node 的占用信息
GET /_nodes/stats/indices/fielddata?fields=*

// 获取每个 node 的每个索引占用信息
GET /_nodes/stats/indices/fielddata?level=indices&fields=*
```
## circuit breaker

如果一次 query load 的 feilddata 超过总内存，就会 oom 内存溢出

circuit breaker 会估算 query 要加载的 fielddata 大小，如果超出总内存就短路，query 直接失败
```
indices.breaker.fielddata.limit：fielddata 的内存限制，默认 60%
indices.breaker.request.limit：执行聚合的内存限制，默认 40%
indices.breaker.total.limit：综合上面两个，限制在 70% 以内
```
这些属性也是在 elasticsearch.yml 中配置的
