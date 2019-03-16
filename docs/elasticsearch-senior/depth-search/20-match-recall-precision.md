# 混合使用 match 和近似匹配实现召回率与精准度的平衡
[[toc]]

## 什么是召回率与精准度
- 召回率

    比如你搜索一个 java spark，总共有 100 个 doc，能返回多少个 doc作为结果，就是召回率（recall）
- 精准度

    比如你搜索一个 java spark，能不能尽可能让包含 java spark 或者是 java 和 spark 离的很近的 doc，
    排在最前面，这个就是精准度（precision）

直接用 match_phrase 短语搜索（包括 proximity match），会导致必须所有 term 都在 doc field 中出现，
而且距离在 slop 限定范围内，才能匹配上，如果某一个 doc 可能就是有某个 term 没有包含，那么就无法作为结果返回

如：
```
java spark --> hello world java --> 就不能返回了
java spark --> hello world, java spark --> 才可以返回
```
近似匹配的时候，召回率比较低，精准度太高了。

那么怎么才能达到：召回率高，精准度高的排在最前面呢？
也就是说希望上面两条数据都返回，但是第二条排在前面

这里就可以混合使用 match 与近似匹配来达到这个效果

## 混合使用 match 与近似匹配

```json
GET /forum/article/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
          "content": "java spark"
        }}
      ],
      "should": [
        {"match_phrase": {
          "content": {
            "query": "java spark",
             "slop": 50
          }
        }}
      ]
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
    "total": 5,
    "max_score": 2.5593896,
    "hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "7",
        "_score": 2.5593896,
        "_source": {
          "content": "java spark are very related, because scala is spark's programming language and scala is also based on jvm like java."
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "6",
        "_score": 1.3154804,
        "_source": {
          "content": "java is my favourite programming language, and I also think spark is a very good big data system."
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "8",
        "_score": 0.63663185,
        "_source": {
          "content": "java are spark very related, because scala is spark's programming language and scala is also based on jvm like java."
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "2",
        "_score": 0.5099718,
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
        "_id": "5",
        "_score": 0.42019215,
        "_source": {
          "articleID": "DHJK-B-1395-#Ky5",
          "userID": 3,
          "hidden": false,
          "postDate": "2019-01-28",
          "tag": [
            "elasticsearch"
          ],
          "tag_cnt": 1,
          "view_cnt": 10,
          "title": "this is spark blog",
          "content": "spark is best big data solution based on scala ,an programming language similar to java",
          "sub_title": "haha, hello world",
          "author_first_name": "Tonny",
          "author_last_name": "Peter Smith",
          "new_author_last_name": "Peter Smith",
          "new_author_first_name": "Tonny"
        }
      }
    ]
  }
}
```

可以看到匹配上的都排在前面了，如果不使用 slop , id=2 的（只包含了 java） 会比部分都包含的 doc 得分高

- match：提高了召回率

    只要包含了 java 或者 spark 其中一个词的都符合结果
- match_phrase 提高了精准度

    使用 should 符合 match_phrase 条件的将会使 doc 的得分增加，
    使用 slop 进一步提高召回率
    两步相加召回率和得分都提高了
