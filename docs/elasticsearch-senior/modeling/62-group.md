# 对每个用户发表的博客进行分组

## 构造数据
要分组的话，我们来构造更多的数据

```json
PUT /website/users/2
{
  "name": "花无缺 ",
  "email": "huawuque@sina.com",
  "birthday": "1960-01-01"
}

PUT /website/blogs/2
{
  "title": "我是花无缺",
  "content": "这是我的第一篇博客，开通啦！！！",
  "userInfo": {
    "userId": 2,
    "username": "花无缺"
  }
}

PUT /website/users/3
{
  "name": "黄药师",
  "email": "huangyaoshi@sina.com",
  "birthday": "1970-10-24"
}

PUT /website/blogs/3
{
  "title": "我是黄药师",
  "content": "我是黄药师啊，各位同学们！！！",
  "userInfo": {
    "userId": 1,
    "username": "黄药师"
  }
}
```

## 对每个用户发表的博客进行分组
需求：按用户名进行博客的分组统计

```json
GET /website/blogs/_search
{
  "size": 0,
  "aggs": {
    "group_by_username": {
      "terms": {
        "field": "userInfo.username.keyword"
      },
      "aggs": {
        "top_blogs": {
          "top_hits": {
            "_source": {
              "include": ["title"]
            },
            "size": 10
          }
        }
      }
    }
  }
}


{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 3,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "group_by_username": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "小鱼儿",
          "doc_count": 1,
          "top_blogs": {
            "hits": {
              "total": 1,
              "max_score": 1,
              "hits": [
                {
                  "_index": "website",
                  "_type": "blogs",
                  "_id": "1",
                  "_score": 1,
                  "_source": {
                    "title": "我的第一篇博客"
                  }
                }
              ]
            }
          }
        },
        {
          "key": "花无缺",
          "doc_count": 1,
          "top_blogs": {
            "hits": {
              "total": 1,
              "max_score": 1,
              "hits": [
                {
                  "_index": "website",
                  "_type": "blogs",
                  "_id": "2",
                  "_score": 1,
                  "_source": {
                    "title": "我是花无缺"
                  }
                }
              ]
            }
          }
        },
        {
          "key": "黄药师",
          "doc_count": 1,
          "top_blogs": {
            "hits": {
              "total": 1,
              "max_score": 1,
              "hits": [
                {
                  "_index": "website",
                  "_type": "blogs",
                  "_id": "3",
                  "_score": 1,
                  "_source": {
                    "title": "我是黄药师"
                  }
                }
              ]
            }
          }
        }
      ]
    }
  }
}
```

可以看到不需要再应用中 join 了，直接查询出来
