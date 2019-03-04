# doc value 机制内核级原理深入探秘
对于 doc value，我一直以为就类似于 mysql 表数据一样，基于 id 获取的，
但是看这章节并不是，所以看完还是懵逼状态

## doc value原理
- index-time生成

  PUT/POST的时候，就会生成doc value数据，也就是正排索引
- 核心原理与倒排索引类似

  正排索引也会写入磁盘文件中，os cache 先进行缓存以提升访问 doc value 正排索引的性能
  如果 os cache 内存大小不足够放得下整个正排索引，就会将 doc value 的数据写入磁盘文件中
- 性能问题：给 jvm 更少内存，64g 服务器给 jvm 最多 16g

  es 官方是建议 es 大量是基于 os cache 来进行缓存和提升性能的，不建议用 jvm 内存来进行缓存，
  那样会导致一定的 gc 开销和 oom 问题，所以给 jvm 更少的内存，给 os cache 更大的内存
  以 64g 服务器为例，给 jvm 最多 16g，其他的内存给 os cache
  os cache 可以提升 doc value 和倒排索引的缓存和查询效率
## column 压缩

比如以下数据
```
doc1: 550
doc2: 550
doc3: 500
```

合并相同值 550，doc1 和 doc2 都保留一个 550 的标识即可

- 所有值相同，直接保留单值
- 少于 256 个值，使用 table encoding 模式（一种压缩方式）
- 大于 256 个值，看有没有最大公约数，有就除以最大公约数，然后保留这个最大公约数

  doc1: 36
  doc2: 24
  6 --> doc1: 6, doc2: 4 --> 保留一个最大公约数 6 的标识，6 也保存起来
- 如果没有最大公约数，采取 offset 结合压缩的方式：

以上内容，只要明白 doc value 的一个压缩存储，使用层层压缩的方式进行存储的，其他的都太底层了，讲不清

## disable doc value

如果的确不需要 doc value，比如不需要聚合等操作，那么可以禁用，减少磁盘空间占用

```json
PUT my_index
{
  "mappings": {
    "my_type": {
      "properties": {
        "my_field": {
          "type": "keyword",
          "doc_values": false
        }
      }
    }
  }
}
```
