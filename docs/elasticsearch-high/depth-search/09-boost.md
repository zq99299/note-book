# 权重控制 boost

权重是什么意思呢？简单来说就是用数值来给「重要」量化

比如这个需求：

- 搜索标题中包含 java 的帖子
- 同时呢，如果标题中包含 hadoop 或 elasticsearch 就优先搜索出来，
- 同时呢，如果一个帖子包含 java hadoop，一个帖子包含 java elasticsearch，包含 hadoop 的帖子要比 elasticsearch 优先搜索出来

知识点：boost 搜索条件的权重，可以将某个搜索条件的权重加大，此时当匹配这个搜索条件和匹配另一个搜索条件的 document，
计算 relevance score 时，匹配权重更大的搜索条件的 document，relevance score 会更高，当然也就会优先被返回回来

默认情况下，搜索条件的权重都是一样的，都是 1


比如下面这个查询，前面讲到过 should 的的得分计算，
如果 spark 的 boost=1 那么 "title": "this is java, elasticsearch, hadoop blog" 肯定是得分最高的，
因为满足个数最多。

下面这个查询结果由于 spark 的 boost=5，最高得分就是 "title": "this is spark blog" 了，

::: tip
得分有相关的计算，权重只是提高了这个分支，可以理解为最终得分再多加这个权重分，而不是直接手动排序
:::

```json
GET /forum/article/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "title": "blog"
          }
        }
      ],
      "should": [
        {
          "match": {
            "title": {
              "query": "java"
            }
          }
        },
        {
          "match": {
            "title": {
              "query": "hadoop"
            }
          }
        },
        {
          "match": {
            "title": {
              "query": "elasticsearch"
            }
          }
        },
        {
          "match": {
            "title": {
              "query": "spark",
              "boost": 5
            }
          }
        }
      ]
    }
  }
}
```
