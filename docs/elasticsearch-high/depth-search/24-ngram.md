# ngram  实现搜索推荐

## 什么是 ngram？

比如一个单词 quick，5 种长度下的 ngram
```
ngram length=1，q u i c k
ngram length=2，qu ui ic ck
ngram length=3，qui uic ick
ngram length=4，quic uick
ngram length=5，quick
```

被切分的词叫做 ngram。

更细化的一个名词 edge ngram；它的表现形式如下：

```
anchor 首字母后进行 ngram

q
qu
qui
quic
quick
```

其实这个形式已经能想到了，这个就是我们搜索的时候进行的推荐那样的效果，类似前缀索引的效果；

在数据写入的时候就将这种情况进行倒排索引，查询的时候和普通 match 一样了，匹配倒排索引，匹配到则 ok，不用扫描所有的倒排索引了


## 实践 ngram

> 首先自定义分词器

```json
DELETE /my_index

PUT /my_index
{
    "settings": {
        "analysis": {
            "filter": {
                "autocomplete_filter": {
                    "type":     "edge_ngram",
                    "min_gram": 1,
                    "max_gram": 20
                }
            },
            "analyzer": {
                "autocomplete": {
                    "type":      "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "autocomplete_filter"
                    ]
                }
            }
        }
    }
}
```

分词相关定义详细请参考 [修改和定制分词器](/elasticsearch-core/index/62-tokenizer.md)

- min_gram：最小
- max_gram：最大

    比如：quick ，max_gram = 2，那么只会切分成
    - q
    - qu

    最大 gram 数量为 2

> 查看分词效果

```json
GET /my_index/_analyze
{
  "analyzer": "autocomplete",
  "text": "quick brown"
}
```

响应结果

```json
{
  "tokens": [
    {
      "token": "q",
      "start_offset": 0,
      "end_offset": 5,
      "type": "word",
      "position": 0
    },
    {
      "token": "qu",
      "start_offset": 0,
      "end_offset": 5,
      "type": "word",
      "position": 0
    },
    {
      "token": "qui",
      "start_offset": 0,
      "end_offset": 5,
      "type": "word",
      "position": 0
    },
    {
      "token": "quic",
      "start_offset": 0,
      "end_offset": 5,
      "type": "word",
      "position": 0
    },
    {
      "token": "quick",
      "start_offset": 0,
      "end_offset": 5,
      "type": "word",
      "position": 0
    },
    {
      "token": "b",
      "start_offset": 6,
      "end_offset": 11,
      "type": "word",
      "position": 1
    },
    {
      "token": "br",
      "start_offset": 6,
      "end_offset": 11,
      "type": "word",
      "position": 1
    },
    {
      "token": "bro",
      "start_offset": 6,
      "end_offset": 11,
      "type": "word",
      "position": 1
    },
    {
      "token": "brow",
      "start_offset": 6,
      "end_offset": 11,
      "type": "word",
      "position": 1
    },
    {
      "token": "brown",
      "start_offset": 6,
      "end_offset": 11,
      "type": "word",
      "position": 1
    }
  ]
}
```

> 建立 mapping

```json
PUT /my_index/_mapping/my_type
{
  "properties": {
      "title": {
          "type":     "string",
          "analyzer": "autocomplete",
          "search_analyzer": "standard"
      }
  }
}
```

> 插入实验数据

```json

put my_index/my_type/1
{
  "title": "hello w"
}

put my_index/my_type/2
{
  "title": "hello word"
}

put my_index/my_type/3
{
  "title": "hello wo"
}

put my_index/my_type/4
{
  "title": "hello"
}

```

> 查询

```json
GET /my_index/my_type/_search
{
  "query": {
    "match": {
      "title": "hello w"
    }
  }
}
```

会发现 4 条语句都会查询出来，是因为 match 是全文检索，只是分数比较低

可以改用 match_phrase 来查询，要求每个 term 都有，而且 position 刚好靠着1位，符合我们的期望

```json
GET /my_index/my_type/_search
{
  "query": {
    "match_phrase": {
      "title": "hello w"
    }
  }
}
```

这次 id=4 的 hello 不会被搜索出来了
