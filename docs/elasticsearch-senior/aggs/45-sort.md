# order：按每种颜色的平均销售额升序排序

统计每种颜色的平均销售额？

```json
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "group_by_color": {
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
响应结果

```json
{
  "took": 2,
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
    "group_by_color": {
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

对于响应结果来说，看不出来默认是按照什么来排序的（视屏中说默认是按照 doc_count 排序的），
那么这里使用升序来展示结果肯定是能看到效果了

```json{8-10}
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "group_by_color": {
      "terms": {
        "field": "color",
        "order": {
          "avg_price": "asc"
        }
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
响应结果

```json
{
  "took": 5,
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
    "group_by_color": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "蓝色",
          "doc_count": 2,
          "avg_price": {
            "value": 2000
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
          "key": "红色",
          "doc_count": 4,
          "avg_price": {
            "value": 3250
          }
        }
      ]
    }
  }
}
```
