# `match_phrase_prefix` 实现搜索推荐

## 什么是搜索推荐（search-time）？

```
比如搜索 hello world，但是你在输入到 hello w 的时候，就会出现以下的一些数据

hello world
hello we
hello win
hello wind
hello dog
hello cat

hello w -->

hello world
hello we
hello win
hello wind
```

例如百度中搜索 --> elas --> elasticsearch --> elasticsearch权威指南

## match_phrase_prefix

```json
GET /forum/article/_search
{
  "query": {
    "match_phrase_prefix": {
      "content": "java i"
    }
  }
}
```

响应结果

```json
{
  "took": 106,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 1.1648302,
    "hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "2",
        "_score": 1.1648302,
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
          "sub_title": "learned a lot of course",
          "author_first_name": "Smith",
          "author_last_name": "Williams",
          "new_author_last_name": "Williams",
          "new_author_first_name": "Smith"
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "6",
        "_score": 0.8480819,
        "_source": {
          "content": "java is my favourite programming language, and I also think spark is a very good big data system."
        }
      }
    ]
  }
}
```

原理跟 match_phrase 类似，唯一的区别，就是把最后一个 term 作为前缀去搜索：

1. `java i` 分词
2. 使用 java match
3. 最后一个 term 「i」会作为前缀去扫描整个倒排索引，找到所有已 i 开头的 doc
4. 然后找到既满足第 2 条，又满足第 3 条的 doc

复杂的语法如下

```json
GET /forum/article/_search
{
  "query": {
    "match_phrase_prefix": {
      "content": {
        "query": "java i",
        "slop":10,
        "max_expansions": 2
      }
    }
  }
}
```

- slop：只有最有一个 term 会作为前缀
- max_expansions：指定 prefix 最多匹配多少个 term，超过这个数量就不继续匹配了，限定性能

    具体是什么规则我也没有搞懂，和 slop 一起使用才能限制。测试中没有看出来什么规则

尽量不要用，因为，最后一个前缀始终要去扫描大量的索引，性能可能会很差
