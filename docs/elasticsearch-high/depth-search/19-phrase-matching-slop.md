# match_phrase 的 slop
[[toc]]

## 语法
```json
GET /forum/article/_search
{
    "query": {
        "match_phrase": {
            "content": {
                "query": "java spark",
                "slop":  1
            }
        }
    }
}
```
## slop 的含义是什么？

query string 搜索文本中的几个 term，要经过几次移动才能与一个 document 匹配，这个移动的次数，就是 slop

举个例子：

```
这样一段文本：hello world, java is very good, spark is also very good.
使用 match_phrase 搜索 java spark 搜不到
如果我们指定了slop，那么就允许 java spark 进行移动，来尝试与 doc 进行匹配

java    is    very    good    spark   is

java    spark
java      --> spark
java              --> spark
java                      -->  spark

上面展示了，当固定第一个 term 的时候，后面的 teram 经过移动直到匹配上搜索词的经过
这个移动的次数就是 slop
```

::: tip
slop 只指最大移动次数
:::

## 验证 slop

```json
GET /forum/article/_search
{
    "query": {
        "match_phrase": {
            "content": {
                "query": "java spark",
                "slop":  2
            }
        }
    }
}
```

响应结果

```json
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 1.1324264,
    "hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "7",
        "_score": 1.1324264,
        "_source": {
          "content": "java spark are very related, because scala is spark's programming language and scala is also based on jvm like java."
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "8",
        "_score": 0.21395226,
        "_source": {
          "content": "java are spark very related, because scala is spark's programming language and scala is also based on jvm like java."
        }
      }
    ]
  }
}
```

尝试着把 slop 的数值调整大一点，之前有好多条数据中都包含了 java 和 spark，
你会发现靠得越近的（slop 相对小的）得分会越高

其实，加了 slop 的 phrase match，就是 proximity match（近似匹配）

- java spark，短语，doc，phrase match
- java spark，可以有一定的距离，但是靠的越近，越先搜索出来，proximity match
