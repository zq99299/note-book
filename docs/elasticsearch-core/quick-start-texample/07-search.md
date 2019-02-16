# 快速上手-商品搜索多种方式
[[toc]]

1. query string search
2. query DSL
3. query filter
4. full-text search
5. phrase search
6. highlight search  - 真正意义上算不上一种搜索方式

## query string search
通俗一点来说，就是以 http get 方式去拼接参数的一种方式

### 查询所有商品

```json
GET /ecommerce/product/_search

----- 响应

{
  "took": 2,
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
        "_index": "ecommerce",
        "_type": "product",
        "_id": "2",
        "_score": 1,
        "_source": {
          "name": "jiajieshi yagao",
          "desc": "youxiao fangzhu",
          "price": 25,
          "producer": "jiajieshi producer",
          "tags": [
            "fangzhu"
          ]
        }
      },
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "3",
        "_score": 1,
        "_source": {
          "name": "zhonghua yagao",
          "desc": "caoben zhiwu",
          "price": 40,
          "producer": "zhonghua producer",
          "tags": [
            "qingxin"
          ]
        }
      }
    ]
  }
}
```

- took：耗费了几毫秒
- timed_out：是否超时，这里是没有
- `_shards`：数据拆成了5个分片，所以对于搜索请求，会打到所有的 primary shard（或者是它的某个 replica shard 也可以）
- hits.total：查询结果的数量，3个 document
- hits.max_score：score 的含义，就是 document 对于一个 search 的相关度的匹配分数，越相关，就越匹配，分数也高
- hits.hits：包含了匹配搜索的 document 的详细数据

### 条件查询
搜索名称中带有 “yagao” 的商品，且按价格降序排列：

`GET /ecommerce/product/_search?q=name:yagao&sort=price:desc`

适用于临时的在命令行使用一些工具，比如 curl，快速的发出请求，来检索想要的信息；但是如果查询请求很复杂，是很难去构建的
在生产环境中，几乎很少使用 query string search

## query DSL

DSL：Domain Specified Language，特定领域的语言

http request body：请求体，可以用 json 的格式来构建查询语法，比较方便，可以构建各种复杂的语法，比 query string search 肯定强大多了

### 查询所有
```json
GET /ecommerce/product/_search
{
  "query": {
    "match_all": {}
  }
}
```

### 条件查询
搜索名称中带有 “yagao” 的商品，且按价格降序排列：

```json
GET /ecommerce/product/_search
{
  "query": {
    "match": {
      "name": "yagao"
    }
  },
  "sort": [
    {
      "price": {
        "order": "desc"
      }
    }
  ]
}

// price 这里也可以直接简写成 "price":"desc"

----------- 响应

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
    "max_score": null,
    "hits": [
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "3",
        "_score": null,
        "_source": {
          "name": "zhonghua yagao",
          "desc": "caoben zhiwu",
          "price": 40,
          "producer": "zhonghua producer",
          "tags": [
            "qingxin"
          ]
        },
        "sort": [
          40
        ]
      }
    ]
  }
}
.... 部分结果
```

### 分页查询

总共 3条 商品，假设每页就显示 1条 商品，现在显示第 2页，所以就查出来第 2个 商品

```json
GET /ecommerce/product/_search
{
  "query": {
    "match_all": {}
  },
  "from": 1,
  "size": 1
}
```
注意这里的 from：表示是从第几条数据开始，而不是表示 页数

### 限制返回字段
指定要查询出来商品的名称和价格就可以

```json
GET /ecommerce/product/_search
{
  "query": {
    "match_all": {}
  },
  "_source": ["name","price"]
}

---- 响应

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
    "max_score": 1,
    "hits": [
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "2",
        "_score": 1,
        "_source": {
          "price": 25,
          "name": "jiajieshi yagao"
        }
      },
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "1",
        "_score": 1,
        "_source": {
          "price": 30,
          "name": "gaolujie yagao"
        }
      },
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "3",
        "_score": 1,
        "_source": {
          "price": 40,
          "name": "zhonghua yagao"
        }
      }
    ]
  }
}
```
更加适合生产环境的使用，可以构建复杂的查询

## query filter

简单说就是在查询后，再进行过滤操作（可以理解为多条件查询）。

搜索商品名称包含 yagao，而且售价大于 25元 的商品

```json
GET /ecommerce/product/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "yagao"
          }
        }
      ],
      "filter": {
        "range": {
          "price": {
            "gte": 25
          }
        }
      }
    }
  }
}
```

## full-text search（全文检索）

为了演示这个示例，先增加一条数据

```json
PUT /ecommerce/product/4
{
  "name": "special yagao",
  "desc": "special meibai",
  "price": 50,
  "producer": "special yagao producer",
  "tags": [
    "meibai"
  ]
}
```

查询示例: 查询 producer 中包含 yagao 和 producer 的数据

```json
GET /ecommerce/product/_search
{
    "query" : {
        "match" : {
            "producer" : "yagao producer"
        }
    }
}

-------- 响应

{
  "took": 8,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 4,
    "max_score": 0.70293105,
    "hits": [
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "4",
        "_score": 0.70293105,
        "_source": {
          "name": "special yagao",
          "desc": "special meibai",
          "price": 50,
          "producer": "special yagao producer",
          "tags": [
            "meibai"
          ]
        }
      },
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "1",
        "_score": 0.25811607,
        "_source": {
          "name": "gaolujie yagao",
          "desc": "gaoxiao meibai",
          "price": 30,
          "producer": "gaolujie producer",
          "tags": [
            "meibai",
            "fangzhu"
          ]
        }
      },
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "3",
        "_score": 0.25811607,
        "_source": {
          "name": "zhonghua yagao",
          "desc": "caoben zhiwu",
          "price": 40,
          "producer": "zhonghua producer",
          "tags": [
            "qingxin"
          ]
        }
      },
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "2",
        "_score": 0.1805489,
        "_source": {
          "name": "jiajieshi yagao",
          "desc": "youxiao fangzhu",
          "price": 25,
          "producer": "jiajieshi producer",
          "tags": [
            "fangzhu"
          ]
        }
      }
    ]
  }
}
```

针对这个结果的一些说明：`_score`：相关度评分

回顾下倒排索引，针对 producer 字段：

producer 这个字段，会先被拆解，建立倒排索引

关键词    | ids
----------|--------
special   | 4
yagao     | 4
producer  | 1,2,3,4
gaolujie  | 1
zhognhua  | 3
jiajieshi | 2

**id 为 4 的评分为什么这么高呢？**

仔细观察 搜索目标 “yagao producer” 会被拆解成 yagao和 producer

在倒排索引中出现了 2次 ，而其他数据只出现了一次，所以它的评分是最高的

## phrase search（短语搜索）
跟全文检索相对应，相反，全文检索会将输入的搜索串拆解开来，去倒排索引里面去一一匹配，只要能匹配上任意一个拆解后的单词，就可以作为结果返回

phrase search：要求输入的搜索串，必须在指定的字段文本中，完全包含一模一样的，才可以算匹配，才能作为结果返回

```json
GET /ecommerce/product/_search
{
    "query" : {
        "match_phrase" : {
            "producer" : "yagao producer"
        }
    }
}

---- 响应

{
  "took": 10,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.70293105,
    "hits": [
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "4",
        "_score": 0.70293105,
        "_source": {
          "name": "special yagao",
          "desc": "special meibai",
          "price": 50,
          "producer": "special yagao producer",
          "tags": [
            "meibai"
          ]
        }
      }
    ]
  }
}
```

## highlight search（高亮搜索结果）

```json
GET /ecommerce/product/_search
{
    "query" : {
        "match_phrase" : {
            "producer" : "yagao producer"
        }
    },
    "highlight": {
      "fields": {
        "producer": {}
      }
    }
}

----- 响应

{
  "took": 61,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.70293105,
    "hits": [
      {
        "_index": "ecommerce",
        "_type": "product",
        "_id": "4",
        "_score": 0.70293105,
        "_source": {
          "name": "special yagao",
          "desc": "special meibai",
          "price": 50,
          "producer": "special yagao producer",
          "tags": [
            "meibai"
          ]
        },
        "highlight": {
          "producer": [
            "special <em>yagao</em> <em>producer</em>"
          ]
        }
      }
    ]
  }
}
```

增加了 highlight 配置，响应结果中除了目标数据，还返回了 highlight 的信息；

仔细看 `_source` 中的  producer 和 highlight 中的 producer 文本信息的区别,这一整条信息中被搜索的关键词都被 em 标签包裹了。在显示的时候，可以针对 em 进行高亮样式处理，这就是高亮结果

```
"producer": "special yagao producer"

"producer": [
  "special <em>yagao</em> <em>producer</em>"
]
```
