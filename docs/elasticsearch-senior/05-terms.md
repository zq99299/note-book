# terms 搜索多个值
[[toc]]

之前都是使用 term 搜索一个词，那么怎么实现 sql 中的 in 效果呢？

```sql
select * from tbl where col in ("value1", "value2")
```

就可以使用 terms

```json
terms: {"field": ["value1", "value2"]}
```

> 为帖子数据增加 tag 字段；增加模拟数据

```json
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"tag" : ["java", "hadoop"]} }
{ "update": { "_id": "2"} }
{ "doc" : {"tag" : ["java"]} }
{ "update": { "_id": "3"} }
{ "doc" : {"tag" : ["hadoop"]} }
{ "update": { "_id": "4"} }
{ "doc" : {"tag" : ["java", "elasticsearch"]} }
```

> 搜索 articleID 为 KDKE-B-9947-#kL5 或 QQPX-R-3956-#aD8的帖子

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "terms": {
          "articleID": [
            "KDKE-B-9947-#kL5",
            "QQPX-R-3956-#aD8"
          ]
        }
      }
    }
  }
}
```

> 搜索 tag 中包含 java 的帖子

由于这里只有一个条件，所以使用 term ，而不是 terms

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "tag": "java"
        }
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
    "total": 3,
    "max_score": 1,
    "hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "2",
        "_score": 1,
        "_source": {
          "articleID": "KDKE-B-9947-#kL5",
          "userID": 1,
          "hidden": false,
          "postDate": "2017-01-02",
          "tag": [
            "java"
          ]
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "4",
        "_score": 1,
        "_source": {
          "articleID": "QQPX-R-3956-#aD8",
          "userID": 2,
          "hidden": true,
          "postDate": "2017-01-02",
          "tag": [
            "java",
            "elasticsearch"
          ]
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "1",
        "_score": 1,
        "_source": {
          "articleID": "XHDK-A-1293-#fJ3",
          "userID": 1,
          "hidden": false,
          "postDate": "2017-01-01",
          "tag": [
            "java",
            "hadoop"
          ]
        }
      }
    ]
  }
}
```

可见如上结果，tag 中包含 java 的都出来了，那么如果只包含 java 的呢？

> 搜索 tag 只包含 java 的帖子

该需求在目前的知识中貌似实现不了呢，可以通过一个标识字段来实现。

标识当前 tag 中 tag 的数量，只要为 1 的且又包含 java 的就可以了

> 增加 tag 数量字段

```json
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"tag_cnt" : 2} }
{ "update": { "_id": "2"} }
{ "doc" : {"tag_cnt" : 1} }
{ "update": { "_id": "3"} }
{ "doc" : {"tag_cnt" : 1} }
{ "update": { "_id": "4"} }
{ "doc" : {"tag_cnt" : 2} }
```

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "bool": {
          "must":[
            {"term":{
              "tag":"java"
            }},
            {
              "match": {
                "tag_cnt": 1
              }
            }
          ]
        }
      }
    }
  }
}
```

> 查找 tag 中只包含 java 和 hadoop 的数据

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "bool": {
          "must":[
            {"term":{
              "tag":"java"
            }},
            {"term":{
              "tag":"hadoop"
            }},
            {
              "match": {
                "tag_cnt": 2
              }
            }
          ]
        }
      }
    }
  }
}
```

- 使用 must + 2个 term 限制至少该数据包含 java 和 hadoop
- 并且他们的数量只能为 2

响应

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
    "total": 1,
    "max_score": 1,
    "hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "1",
        "_score": 1,
        "_source": {
          "articleID": "XHDK-A-1293-#fJ3",
          "userID": 1,
          "hidden": false,
          "postDate": "2017-01-01",
          "tag": [
            "java",
            "hadoop"
          ],
          "tag_cnt": 2
        }
      }
    ]
  }
}
```

## 总结

- terms 多值搜索
- 优化 terms 多值搜索的结果
- 相当于 SQL 中的 in 语句
