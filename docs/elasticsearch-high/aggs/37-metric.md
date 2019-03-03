# 要学更多的 metric

目前已经学习过了两种 metric：count，avg，接下来学习其他的 metric 操作

- count：bucket terms，自动就会有一个 doc_count，就相当于是 count
- avg：avg aggs，求平均值
- max：求一个 bucket 内，指定 field 值最大的那个数据
- min：求一个 bucket 内，指定 field 值最小的那个数据
- sum：求一个 bucket 内，指定 field 值的总和

一般来说，90% 的常见的数据分析的操作 metric，无非就是 count、avg、max、min、sum

下面来演示这几种操作：统计每种颜色电视的数量、平均价格、最大最小价格

```json
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "colors": {
      "terms": {
        "field": "color"
      },
      "aggs": {
        "avg_price": {
          "avg": {
            "field": "price"
          }
        },
        "max_price": {
          "max": {
            "field": "price"
          }
        },
        "min_price": {
          "min": {
            "field": "price"
          }
        },
        "sum_price": {
          "sum": {
            "field": "price"
          }
        }
      }
    }
  }
}
``
响应结果

```json
{
  "took": 19,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 8,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "colors": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "红色",
          "doc_count": 4,
          "max_price": {
            "value": 8000
          },
          "min_price": {
            "value": 1000
          },
          "avg_price": {
            "value": 3250
          },
          "sum_price": {
            "value": 13000
          }
        },
        {
          "key": "绿色",
          "doc_count": 2,
          "max_price": {
            "value": 3000
          },
          "min_price": {
            "value": 1200
          },
          "avg_price": {
            "value": 2100
          },
          "sum_price": {
            "value": 4200
          }
        },
        {
          "key": "蓝色",
          "doc_count": 2,
          "max_price": {
            "value": 2500
          },
          "min_price": {
            "value": 1500
          },
          "avg_price": {
            "value": 2000
          },
          "sum_price": {
            "value": 4000
          }
        }
      ]
    }
  }
}
```
