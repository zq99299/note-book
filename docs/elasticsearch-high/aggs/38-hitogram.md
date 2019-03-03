# histogram 区间分组

什么是 histogram ？：类似于 terms，也是进行 bucket 分组操作，接收一个 field，
按照这个 field 的值的各个范围区间，进行 bucket 分组操作

它的部分语法如下：

```json
"histogram":{
  "field": "price",
  "interval": 2000
}
```

interval：2000，根据字段 price 的值划分范围，0~2000，2000~4000，4000~6000，6000~8000，8000~10000，
比如 2500，看落在哪个区间内，比如 2000~4000，此时就会将这条数据放入 2000~4000 对应的那个 bucket 中

而 terms 是将 field 值相同的数据划分到一个 bucket 中

bucket 有了之后，就可以去对每个 bucket 执行 avg、count、sum、max、min，等各种 metric 操作、聚合分析

例如：统计每隔 2000 价格区间内的电视数量和他们的总价

```json
GET /tvs/sales/_search
{
   "size" : 0,
   "aggs":{
      "price":{
         "histogram":{
            "field": "price",
            "interval": 2000
         },
         "aggs":{
            "revenue": {
               "sum": {
                 "field" : "price"
               }
             }
         }
      }
   }
}
```

响应结果

```json
{
  "took": 10,
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
    "price": {
      "buckets": [
        {
          "key": 0,
          "doc_count": 3,
          "revenue": {
            "value": 3700
          }
        },
        {
          "key": 2000,
          "doc_count": 4,
          "revenue": {
            "value": 9500
          }
        },
        {
          "key": 4000,
          "doc_count": 0,
          "revenue": {
            "value": 0
          }
        },
        {
          "key": 6000,
          "doc_count": 0,
          "revenue": {
            "value": 0
          }
        },
        {
          "key": 8000,
          "doc_count": 1,
          "revenue": {
            "value": 8000
          }
        }
      ]
    }
  }
}
```
