# percentiles 百分比算法、网站访问时延统计
需求：比如有一个网站，记录下了每次请求的访问的耗时，需要统计 tp50，tp90，tp99

什么是 tp n 呢?
- tp50：50% 的请求的耗时最长在多长时间
- tp90：90% 的请求的耗时最长在多长时间
- tp99：99% 的请求的耗时最长在多长时间

那么可以使用 percentiles 算法

先插入模拟数据
```json
PUT /website
{
    "mappings": {
        "logs": {
            "properties": {
                "latency": {
                    "type": "long"
                },
                "province": {
                    "type": "keyword"
                },
                "timestamp": {
                    "type": "date"
                }
            }
        }
    }
}

POST /website/logs/_bulk
{ "index": {}}
{ "latency" : 105, "province" : "江苏", "timestamp" : "2016-10-28" }
{ "index": {}}
{ "latency" : 83, "province" : "江苏", "timestamp" : "2016-10-29" }
{ "index": {}}
{ "latency" : 92, "province" : "江苏", "timestamp" : "2016-10-29" }
{ "index": {}}
{ "latency" : 112, "province" : "江苏", "timestamp" : "2016-10-28" }
{ "index": {}}
{ "latency" : 68, "province" : "江苏", "timestamp" : "2016-10-28" }
{ "index": {}}
{ "latency" : 76, "province" : "江苏", "timestamp" : "2016-10-29" }
{ "index": {}}
{ "latency" : 101, "province" : "新疆", "timestamp" : "2016-10-28" }
{ "index": {}}
{ "latency" : 275, "province" : "新疆", "timestamp" : "2016-10-29" }
{ "index": {}}
{ "latency" : 166, "province" : "新疆", "timestamp" : "2016-10-29" }
{ "index": {}}
{ "latency" : 654, "province" : "新疆", "timestamp" : "2016-10-28" }
{ "index": {}}
{ "latency" : 389, "province" : "新疆", "timestamp" : "2016-10-28" }
{ "index": {}}
{ "latency" : 302, "province" : "新疆", "timestamp" : "2016-10-29" }
```
percentiles 用法，下面

```json
GET /website/logs/_search
{
  "size": 0,
  "aggs": {
    "latency_percentiles": {
      "percentiles": {
        "field": "latency",
        "percents": [
          50,
          95,
          99
        ]
      }
    },
    "latency_avg": {
      "avg": {
        "field": "latency"
      }
    }
  }
}
```

- latency_percentiles：所有数据中按百分比计算
- latency_avg：所有数据的平均耗时

响应结果如下

```json
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 12,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "latency_avg": {
      "value": 201.91666666666666
    },
    "latency_percentiles": {
      "values": {
        "50.0": 108.5,
        "95.0": 508.24999999999983,
        "99.0": 624.8500000000001
      }
    }
  }
}
```

至于这个是怎么计算出来的，应该是涉及到数据相关的知识，稍微百度了下，是统计学里面的数据知识

> 需求：按照省份进行百分比计算

```json
GET /website/logs/_search
{
  "size": 0,
  "aggs": {
    "group_by_province": {
      "terms": {
        "field": "province"
      },
      "aggs": {
        "latency_percentiles": {
          "percentiles": {
            "field": "latency",
            "percents": [
              50,
              95,
              99
            ]
          }
        },
        "latency_avg": {
          "avg": {
            "field": "latency"
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
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 12,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "group_by_province": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "新疆",
          "doc_count": 6,
          "latency_avg": {
            "value": 314.5
          },
          "latency_percentiles": {
            "values": {
              "50.0": 288.5,
              "95.0": 587.75,
              "99.0": 640.75
            }
          }
        },
        {
          "key": "江苏",
          "doc_count": 6,
          "latency_avg": {
            "value": 89.33333333333333
          },
          "latency_percentiles": {
            "values": {
              "50.0": 87.5,
              "95.0": 110.25,
              "99.0": 111.65
            }
          }
        }
      ]
    }
  }
}
```
