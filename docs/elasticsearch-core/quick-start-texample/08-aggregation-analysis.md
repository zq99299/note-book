# 快速上手-聚合分析
[[toc]]

嵌套聚合，下钻分析，聚合分析

## 计算每个 tag 下的商品数量

语法：

- aggs：聚合函数
- NAME：给这个操作取一个名字
- AGG_TYPE：聚合类型

```json
GET /ecommerce/product/_search
{
  "aggs": {
    "NAME": {
      "AGG_TYPE": {}
    }
  }
}
```

```json
GET /ecommerce/product/_search
{
  "aggs": {
    "group_by_tags": {
      "terms": {
        "field": "tags"
      }
    }
  }
}

------------ 响应

{
  "error": {
    "root_cause": [
      {
        "type": "illegal_argument_exception",
        "reason": "Fielddata is disabled on text fields by default. Set fielddata=true on [tags] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory."
      }
    ],
    "type": "search_phase_execution_exception",
    "reason": "all shards failed",
    "phase": "query",
    "grouped": true,
    "failed_shards": [
      {
        "shard": 0,
        "index": "ecommerce",
        "node": "sEvAlYxFRJe598mrSDwUjQ",
        "reason": {
          "type": "illegal_argument_exception",
          "reason": "Fielddata is disabled on text fields by default. Set fielddata=true on [tags] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory."
        }
      }
    ],
    "caused_by": {
      "type": "illegal_argument_exception",
      "reason": "Fielddata is disabled on text fields by default. Set fielddata=true on [tags] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory."
    }
  },
  "status": 400
}
```

error.root_cause.reason 中说：在 text 字段上默认 fielddata=false, 需要设置为 true，通过生成正向索引并加载到内存中进行计算；

也就是说需要映射的修改：

```json
PUT /ecommerce/product/_mapping
{
  "properties": {
    "tags":{
      "type": "text",
      "fielddata": true
    }
  }
}

--------------- 响应

{
  "acknowledged": true
}
```

```json
GET /ecommerce/product/_search
{
  "aggs": {
    "group_by_tags": {
      "terms": { // 可以理解为是分组的意思
        "field": "tags"
      }
    }
  },
  "size": 0
}

--------------- 响应

{
  "took": 146,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 4,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "group_by_tags": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "fangzhu",
          "doc_count": 2
        },
        {
          "key": "meibai",
          "doc_count": 2
        },
        {
          "key": "qingxin",
          "doc_count": 1
        }
      ]
    }
  }
}
```

在请求的时候使用了一个 size=0,这个参数影响响应数据中的 hits.hits 中的数据

- hits.total：总共参与聚合运算的目标数据，这里是 4 条
- hits.hits：这 4条 数据的详细信息（原数据）
- aggregations 聚合的响应
- aggregations.group_by_tags.buckets：桶，也就是聚合的结果

doc_count_error_upper_bound 和  sum_other_doc_count 后面再讲解；

对于 buckets 返回的数据条数也可以通过 size 控制，aggs.group_by_tags.terms.size = n

## 先搜索，再聚合

需求：对名称中包含 yagao 的商品，计算每个 tag 下的商品数量

```json
GET /ecommerce/product/_search
{
  "query": {
    "match": {
      "name": "yagao"
    }
  },
  "aggs": {
    "group_by_tags": {
      "terms": {
        "field": "tags"
      }
    }
  },
  "size": 0
}
```

很简单，之前的搜索，再加上 aggs 即可

## 嵌套聚合

需求：计算每个 tag 下的商品平均价格

也就是说：需要先对 tags 进行分组，再计算商品的平均价格

```json
GET /ecommerce/product/_search
{
  "aggs": {
    "group_by_tags": {
      "terms": {
        "field": "tags"
      },
      "aggs": {
        "avg_by_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  },
  "size": 0
}
```
响应

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
    "total": 4,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "group_by_tags": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "fangzhu",
          "doc_count": 2,
          "avg_by_price": {
            "value": 27.5
          }
        },
        {
          "key": "meibai",
          "doc_count": 2,
          "avg_by_price": {
            "value": 40
          }
        },
        {
          "key": "qingxin",
          "doc_count": 1,
          "avg_by_price": {
            "value": 40
          }
        }
      ]
    }
  }
}
```

## 在聚合分析后再排序

需求：给上一个例子加上排序，按照计算结果（商品平均价格）降序排列

```json
GET /ecommerce/product/_search
{
  "aggs": {
    "group_by_tags": {
      "terms": {
        "field": "tags",
        "order": {
          "avg_by_price": "desc"
        }
      },
      "aggs": {
        "avg_by_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  },
  "size": 0
}
```

在 terms 中增加 order 属性，并对 avg_by_price 这个计算结果进行排序

## 说明：为什么不用 java 代码讲解

我们现在全部都是用 es 的 restful api 在学习和讲解 es 的所欲知识点和功能点，但是没有使用一些编程语言去讲解（比如 java），原因有以下：

1. es 最重要的 api，让我们进行各种尝试、学习甚至在某些环境下进行使用的 api，就是 restful api。如果你学习不用 es restful api，比如我上来就用 java api 来讲 es，也是可以的，但是你根本就漏掉了 es 知识的一大块，你都不知道它最重要的 restful api 是怎么用的
2. 讲知识点，用 es restful api，更加方便，快捷，不用每次都写大量的 java 代码，能加快讲课的效率和速度，更加易于同学们关注es本身的知识和功能的学习
3. 我们通常会讲完 es 知识点后，开始详细讲解 java api，如何用 java api 执行各种操作
4. 我们每个篇章都会搭配一个项目实战，项目实战是完全基于 java 去开发的真实项目和系统


## 多次嵌套（下钻操作）

下钻操作：前面的列子，先分组，再聚合计算，这样的操作称为下钻操作（来源没有说）

需求：按照指定的价格区间进行分组，然后再每组内再按照 tags 进行分组，并计算每组内的商品平均价格，并按照平均价格进行降序排列

```json
GET /ecommerce/product/_search
{
  "aggs": {
    "group_by_price": {
      "range": {
        "field": "price",
        "ranges": [
          {
            "from": 0,
            "to": 20
          },
          {
            "from": 20,
             "to": 40
          },
          {
            "from": 40,
            "to": 50
          }
        ]
      },
      "aggs": {
        "group_by_tags": {
          "terms": {
            "field": "tags",
            "order": {
              "group_by_avg": "desc"
            }
          },
          "aggs": {
            "group_by_avg": {
              "avg": {
                "field": "price"
              }
            }
          }
        }
      }
    }
  },
  "size": 0
}
```

响应

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
    "total": 4,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "group_by_price": {
      "buckets": [
        {
          "key": "0.0-20.0",
          "from": 0,
          "to": 20,
          "doc_count": 0,
          "group_by_tags": {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": []
          }
        },
        {
          "key": "20.0-40.0",
          "from": 20,
          "to": 40,
          "doc_count": 2,
          "group_by_tags": {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
              {
                "key": "meibai",
                "doc_count": 1,
                "group_by_avg": {
                  "value": 30
                }
              },
              {
                "key": "fangzhu",
                "doc_count": 2,
                "group_by_avg": {
                  "value": 27.5
                }
              }
            ]
          }
        },
        {
          "key": "40.0-50.0",
          "from": 40,
          "to": 50,
          "doc_count": 1,
          "group_by_tags": {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
              {
                "key": "qingxin",
                "doc_count": 1,
                "group_by_avg": {
                  "value": 40
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```
