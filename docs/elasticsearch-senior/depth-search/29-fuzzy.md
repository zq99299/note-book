# fuzzy 纠错模糊搜索技术
[[toc]]

## 什么是 fuzzy 纠错
考虑一个场景：搜索的时候，可能输入的搜索文本会出现误拼写的情况
```
doc1: Surprise me
doc2: I wasn't surprised
```
搜索：surprize（手抖打错了最后两个字母） ，正常情况下是一条数据都搜索不到的

fuzzy 搜索技术自动将拼写错误的搜索文本，进行纠正，纠正以后去尝试匹配索引中的数据

## fuzzy 语法

插入测试数据

```json
POST /my_index/my_type/_bulk
{ "index": { "_id": 1 }}
{ "text": "Surprise me!"}
{ "index": { "_id": 2 }}
{ "text": "That was surprising."}
{ "index": { "_id": 3 }}
{ "text": "I wasn't surprised."}
```

使用 fuzzy 查询语法

```json
GET /my_index/my_type/_search
{
  "query": {
    "fuzzy": {
      "text": {
        "value": "surprize",
        "fuzziness": 2
      }
    }
  }
}
```

- fuzzy 搜索以后，会自动尝试将你的搜索文本进行纠错，然后去跟文本进行匹配
- fuzziness，你的搜索文本最多可以纠正几个字母去跟你的数据进行匹配，默认值为 2

响应结果

```json
"hits": {
  "total": 2,
  "max_score": 0.22585157,
  "hits": [
    {
      "_index": "my_index",
      "_type": "my_type",
      "_id": "1",
      "_score": 0.22585157,
      "_source": {
        "text": "Surprise me!"
      }
    },
    {
      "_index": "my_index",
      "_type": "my_type",
      "_id": "3",
      "_score": 0.1898702,
      "_source": {
        "text": "I wasn't surprised."
      }
    }
  ]
}
}
```

还有另外一种用法，在 match 中使用

## query match 中使用 fuzziness

```json
GET /my_index/my_type/_search
{
  "query": {
    "match": {
      "text": {
        "query": "SURPIZE ME",
        "fuzziness": "AUTO",
        "operator": "and"
      }
    }
  }
}
```

选择 atuo，自动纠错
