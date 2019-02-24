# rescore 机制优化近似匹配搜索的性能

## match 和 phrase match（proximity match）的区别
- match

    只要简单的匹配到了一个 term，就可以理解将 term 对应的 doc 作为结果返回，扫描倒排索引，扫描到了就 ok
- phrase match

    首先扫描到所有 term 的 doc list;
    找到包含所有 term 的 doc list;
    然后对每个 doc 都计算每个 term 的 position，是否符合指定的范围;
     slop，需要进行复杂的运算，来判断能否通过 slop 移动，匹配一个 doc

- match query 的性能比 phrase match 和 proximity match（有 slop）要高很多。因为后两者都要计算 position 的距离。
- match query 比 phrase match 的性能要高10倍，比 proximity match 的性能要高20倍。

但是别太担心，因为 es 的性能一般都在毫秒级别，match query 一般就在几毫秒，或者几十毫秒，
而 phrase match 和 proximity match 的性能在几十毫秒到几百毫秒之间，所以也是可以接受的。

优化 proximity match 的性能，一般就是减少要进行 proximity match 搜索的 document 数量。
主要思路就是，用 match query 先过滤出需要的数据，然后再用 proximity match 来根据 term 距离提高 doc 的分数，
同时 proximity match 只针对每个 shard 的分数排名前 n 个 doc 起作用，来重新调整它们的分数，
这个过程称之为 rescoring，重计分。因为一般用户会分页查询，只会看到前几页的数据，所以不需要对所有结果进行 proximity match 操作。

用我们刚才的说法，match + proximity match同时实现召回率和精准度

默认情况下，match 也许匹配了 1000 个 doc，proximity match 全都需要对每个 doc 进行一遍运算，判断能否 slop 移动匹配上，然后去贡献自己的分数

但是很多情况下，match 出来也许 1000 个 doc，其实用户大部分情况下是分页查询的，
所以可能最多只会看前几页，比如一页是10条，最多也许就看5页，就是50条，
proximity match 只要对前 50 个 doc 进行 slop 移动去匹配，去贡献自己的分数即可，
不需要对全部 1000 个 doc 都去进行计算和贡献分数

## rescore 重打分

```json
GET /forum/article/_search
{
  "query": {
    "match": {
      "content": "java spark"
    }
  },
  "rescore": {
    "window_size": 50,
    "query": {
      "rescore_query": {
        "match_phrase": {
          "content": {
            "query": "java spark",
            "slop": 50
          }
        }
      }
    }
  }
}
```

::: tip
此时应该都会有一个疑问，那么这样只重打分 50 个，最后结果正确吗？

肯定是不正确的，此时的重打分是在第一个 match 的返回的所有 doc list 上进行重打分，
而且是指定个数，所以不在重打分个数内的不会被影响。

所以这个操作只符合部分场景
:::
