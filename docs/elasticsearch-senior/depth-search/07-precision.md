# 体验如何控制全文检索结果的精准度
[[toc]]

增加测试数据，添加一个 title 字段

```json
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"title" : "this is java and elasticsearch blog"} }
{ "update": { "_id": "2"} }
{ "doc" : {"title" : "this is java blog"} }
{ "update": { "_id": "3"} }
{ "doc" : {"title" : "this is elasticsearch blog"} }
{ "update": { "_id": "4"} }
{ "doc" : {"title" : "this is java, elasticsearch, hadoop blog"} }
{ "update": { "_id": "5"} }
{ "doc" : {"title" : "this is spark blog"} }
```

#### 1、搜索标题中包含 java 或 elasticsearch 的 blog

- term query： 搜索 exact value
- match query：full text 全文检索

    如果要检索的 field，是 not_analyzed 类型的，那么 match query 也相当于 term query。

```json
GET /forum/article/_search
{
    "query": {
        "match": {
            "title": "java elasticsearch"
        }
    }
}
```

会出来 4 条数据。

#### 2、搜索标题中包含 java 和 elasticsearch 的 blog

```json
GET /forum/article/_search
{
    "query": {
        "match": {
            "title": {
          		"query": "java elasticsearch",
          		"operator": "and"
   	        }
        }
    }
}
```

搜索的结果是包含 java 和 elasticsearch 两个关键词的结果，并不是 term query 的精准匹配

#### 3、搜索包含 java、elasticsearch、spark、hadoop 4 个关键字中，至少 3 个的 blog

```json
GET /forum/article/_search
{
    "query": {
        "match": {
            "title": {
          		"query": "java elasticsearch spark hadoop",
          		"minimum_should_match": "75%"
   	        }
        }
    }
}
```

minimum_should_match：必须至少匹配其中的多少个关键字，才能作为结果返回，默认是一个


#### 4、用 bool 组合多个搜索条件，来搜索 title

```json
GET /forum/article/_search
{
  "query": {
    "bool": {
      "must":     { "match": { "title": "java" }},
      "must_not": { "match": { "title": "spark"  }},
      "should": [
          { "match": { "title": "hadoop" }},
          { "match": { "title": "elasticsearch"   }}
      ]
    }
  }
}
```

再来解说下这个：必须包含 java，且不能包含 spark，且可以包含或者不包含 hadoop 和 elasticsearch；

这里的 should 这样用我觉得没有什么必要，那有什么用么？下面会讲解相关作用

------

#### 5、bool 组合多个搜索条件，如何计算 relevance score

must 和 should 搜索对应的分数，加起来，除以 must 和 should 的总数

- 排名第一：java，同时包含 should 中所有的关键字，hadoop，elasticsearch
- 排名第二：java，同时包含 should 中的 elasticsearch
- 排名第三：java，不包含 should 中的任何关键字

should 是可以影响相关度分数的

must 是确保说，谁必须有这个关键字，同时会根据这个 must 的条件去计算出 document 对这个搜索条件的 relevance score

在满足 must 的基础之上，should 中的条件，不匹配也可以，但是如果匹配的更多，那么 document 的 relevance score 就会更高

看下面的结果排名，对照上面的就清楚了

```json
"hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "4",
        "_score": 1.3375794,
        "_source": {
          "articleID": "QQPX-R-3956-#aD8",
          "userID": 2,
          "hidden": true,
          "postDate": "2017-01-02",
          "tag": [
            "java",
            "elasticsearch"
          ],
          "tag_cnt": 2,
          "view_cnt": 80,
          "title": "this is java, elasticsearch, hadoop blog"
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "1",
        "_score": 0.53484553,
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
          "title": "this is java and elasticsearch blog"
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "2",
        "_score": 0.19856805,
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
          "title": "this is java blog"
        }
      }
    ]
```

#### 6、搜索 java、hadoop、spark、elasticsearch，至少包含其中 3 个关键字

至少满足 should 中的 3个条件才返回结果

```json
GET /forum/article/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "title": "java" }},
        { "match": { "title": "elasticsearch"   }},
        { "match": { "title": "hadoop"   }},
	      { "match": { "title": "spark"   }}
      ],
      "minimum_should_match": 3
    }
  }
}
```

## 总结

1. 全文检索的时候，进行多个值的检索，有两种做法，

    - match query
    - should
2. 控制搜索结果精准度：

    - operator and
    - minimum_should_match
