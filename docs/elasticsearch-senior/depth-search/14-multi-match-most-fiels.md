# multi_match 的 most_fiels 策略

- most-fiels: 在多个 field 查询到关键词的则优先返回该 doc
- [best_fields](./11-dis-max-best-fields.md)：在一个 field 中匹配到多个查询词的则优先返回该 doc

他们两个是刚好相反的一个策略

现在来实验，首先添加测试数据

```java
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"sub_title" : "learning more courses"} }
{ "update": { "_id": "2"} }
{ "doc" : {"sub_title" : "learned a lot of course"} }
{ "update": { "_id": "3"} }
{ "doc" : {"sub_title" : "we have a lot of fun"} }
{ "update": { "_id": "4"} }
{ "doc" : {"sub_title" : "both of them are good"} }
{ "update": { "_id": "5"} }
{ "doc" : {"sub_title" : "haha, hello world"} }
```

```json
GET /forum/article/_search
{
  "query": {
    "match": {
      "sub_title": "learning courses"
    }
  }
}
```

这个查询出来的结果我们希望是 id=1 的数据会排在最前面，因为最相关。但是使用默认的 mapping 就不一定

原理就是：sub_title 会自动 mapping 成 enligsh analyzer，所以还原了单词

为什么，因为如果我们用的是类似于 english analyzer 这种分词器的话，就会将单词还原为其最基本的形态（stemmer）

```
learning --> learn
learned --> learn
courses --> course

sub_titile: learning coureses --> learn course
```

这样转换后再查询，相关分就和我们想象的不太一样了。所以先处理该差异，手动 mapping

```json
POST /forum/_mapping/article
{
  "properties": {
      "sub_title": {
          "type":     "string",
          "analyzer": "english",
          "fields": {
              "std":   {
                  "type":     "string",
                  "analyzer": "standard"
              }
          }
      }
  }
}
```

再次查询

```json
GET /forum/article/_search
{
  "query": {
    "match": {
      "sub_title.std": "learning courses"
    }
  }
}
```

就只会返回一条了，因为只有这一条符合标准

```json
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.5063205,
    "hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "1",
        "_score": 0.5063205,
        "_source": {
          "articleID": "XHDK-A-1293-#fJ3",
          "userID": 1,
          "hidden": false,
          "postDate": "2017-01-01",
          "tag": [
            "java",
            "hadoop"
          ],
          "tag_cnt": 2,
          "view_cnt": 30,
          "title": "this is java and elasticsearch blog",
          "content": "i like to write best elasticsearch article",
          "sub_title": "learning more courses"
        }
      }
    ]
  }
}
```

如果不使用 `.std` 就会使用分词形式去匹配到两条数据。multi_match 语法如下


```json
GET /forum/article/_search
{
   "query": {
        "multi_match": {
            "query":  "learning courses",
            "type":   "most_fields",
            "fields": [ "sub_title", "sub_title.std" ]
        }
    }
}
```

响应结果

```json
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 1.219939,
    "hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "2",
        "_score": 1.219939,
        "_source": {
          "articleID": "KDKE-B-9947-#kL5",
          "userID": 1,
          "hidden": false,
          "postDate": "2017-01-02",
          "tag": [
            "java"
          ],
          "tag_cnt": 1,
          "view_cnt": 50,
          "title": "this is java blog",
          "content": "i think java is the best programming language",
          "sub_title": "learned a lot of course"
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "1",
        "_score": 1.012641,
        "_source": {
          "articleID": "XHDK-A-1293-#fJ3",
          "userID": 1,
          "hidden": false,
          "postDate": "2017-01-01",
          "tag": [
            "java",
            "hadoop"
          ],
          "tag_cnt": 2,
          "view_cnt": 30,
          "title": "this is java and elasticsearch blog",
          "content": "i like to write best elasticsearch article",
          "sub_title": "learning more courses"
        }
      }
    ]
  }
}
```

但是这还是没有出现我们希望的结果是为什么呢？这个老师也讲解不清楚了，计算很复杂；但是有一点可以知道，
使用 best_fields 和 most_fields 查看对于 id=1 的评分，
在 most_fields 策略下 评分达到了 1+ ，而 best_fields 策略下只有 0.5+；

这就可以说明 most_fields 策略的作用了

```json
GET /forum/article/_search
{
   "query": {
        "multi_match": {
            "query":  "learning courses",
            "type":   "best_fields",
            "fields": [ "sub_title", "sub_title.std" ]
        }
    }
}
```
