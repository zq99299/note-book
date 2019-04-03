# 一个 field 索引两次解决字符串排序

如果对一个 string field 进行排序，结果往往不准确，因为分词后是多个单词，再排序就不是我们想要的结果了

通常解决方案是，将一个 string field 建立两次索引，一个分词，用来进行搜索；一个不分词，用来进行排序

先来建立 mapping，将 title 索引两次，注意语法

```json{6-14}
PUT /website
{
  "mappings": {
    "article": {
      "properties": {
        "title": {
          "type": "text",
          "fields": {
            "raw": {
              "type": "string",
              "index": "not_analyzed"
            }
          },
          "fielddata": true
        },
        "content": {
          "type": "text"
        },
        "post_date": {
          "type": "date"
        },
        "author_id": {
          "type": "long"
        }
      }
    }
  }
}
```

::: tip
对一个 text、string 字段进行排序，需要正排索引，使用 fielddata 属性来开启
:::

记得查询看下 mapping 数据

```json
GET /website/_mapping

-------------------------- 响应

{
  "website": {
    "mappings": {
      "article": {
        "properties": {
          "author_id": {
            "type": "long"
          },
          "content": {
            "type": "text"
          },
          "post_date": {
            "type": "date"
          },
          "title": {
            "type": "text",
            "fields": {
              "raw": {
                "type": "keyword"
              }
            },
            "fielddata": true
          }
        }
      }
    }
  }
}
```

插入两条数据,注意第 2条 数据的 title 的首字母，g 排序的话，就会在后面

```json{3,11}
PUT /website/article/1
{
  "title": "first article",
  "content": "this is my second article",
  "post_date": "2017-01-01",
  "author_id": 110
}

PUT /website/article/2
{
  "title": "girst article",
  "content": "this is my second article",
  "post_date": "2017-01-01",
  "author_id": 110
}
```

直接查询, 后插入的在前面

```json
GET /website/article/_search

{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 1,
    "hits": [
      {
        "_index": "website",
        "_type": "article",
        "_id": "2",
        "_score": 1,
        "_source": {
          "title": "girst article",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        }
      },
      {
        "_index": "website",
        "_type": "article",
        "_id": "1",
        "_score": 1,
        "_source": {
          "title": "first article",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        }
      }
    ]
  }
}
```

使用 title 升序排列，可以看到 sort 中使用的是分词后的一个单词来排序

```json{38,39,40,53,54,55}
GET /website/article/_search
{
  "query": {},
  "sort": [
    {
      "title": {
        "order": "asc"
      }
    }
  ]
}

----------------- 响应

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
    "max_score": null,
    "hits": [
      {
        "_index": "website",
        "_type": "article",
        "_id": "2",
        "_score": null,
        "_source": {
          "title": "girst article",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        },
        "sort": [
          "article"
        ]
      },
      {
        "_index": "website",
        "_type": "article",
        "_id": "1",
        "_score": null,
        "_source": {
          "title": "first article",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        },
        "sort": [
          "article"
        ]
      }
    ]
  }
}
```

使用 title.raw 来排序

```json{38,39,40,53,54,55}
GET /website/article/_search
{
  "query": {},
  "sort": [
    {
      "title.raw": {
        "order": "asc"
      }
    }
  ]
}

--------------------- 响应

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
    "max_score": null,
    "hits": [
      {
        "_index": "website",
        "_type": "article",
        "_id": "1",
        "_score": null,
        "_source": {
          "title": "first article",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        },
        "sort": [
          "first article"
        ]
      },
      {
        "_index": "website",
        "_type": "article",
        "_id": "2",
        "_score": null,
        "_source": {
          "title": "girst article",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        },
        "sort": [
          "girst article"
        ]
      }
    ]
  }
}

```
