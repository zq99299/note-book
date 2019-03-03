# bucket+metric 统计每种颜色电视平均价格

按照 color 去分 bucket，可以拿到每个 color bucket 中的数量，这个仅仅只是一个 bucket 操作，
doc_count 可以看成是 es 的 bucket 操作 默认执行的一个内置 metric

统计每种颜色电视平均价格如下。

```json{8-15}
GET /tvs/sales/_search
{
   "size" : 0,
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
            }
         }
      }
   }
}
```

看如上代码，使用了 terms bucket 操作，如下代码就是一个  metric 操作，
对每个 bucket 的数据进行平均值计算

```json
"aggs": {
   "avg_price": {
      "avg": {
         "field": "price"
      }
   }
}
```

看看响应结果

```json
{
  "took": 6,
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
          "avg_price": {
            "value": 3250
          }
        },
        {
          "key": "绿色",
          "doc_count": 2,
          "avg_price": {
            "value": 2100
          }
        },
        {
          "key": "蓝色",
          "doc_count": 2,
          "avg_price": {
            "value": 2000
          }
        }
      ]
    }
  }
}
```

- avg_price：我们自己取的 metric aggs 的名字
- value：metric 计算的结果，每个 bucket 中的数据的 price 字段求平均值后的结果
