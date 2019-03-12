# 统计当前位置每个距离范围内有多少家酒店

最后一个知识点，基于地理位置进行聚合分析

比如一个需求：统计我周围几个范围内的酒店数量，如 0~100m 有几个酒店，100m~300m 有几个酒店，300m以上有几个酒店

一般来说，做酒店 app，一般来说，我们是不是会有一个地图，用户可以在地图上直接查看和搜索酒店，
此时就可以显示出来举例你当前的位置，几个举例范围内，有多少家酒店，让用户知道，心里清楚，用户体验就比较好

语法如下

```json
GET /hotel_app/hotels/_search
{
  "size": 0,
  "aggs": {
    "agg_by_distance_range": {
      "geo_distance": {
        "field": "pin.location",
        "origin": {
          "lat": 40,
          "lon": -70
        },
        "unit": "mi",
        "distance_type": "arc",
        "ranges": [
          {
            "to": 100
          },
          {
            "from": 100,
            "to": 300
          },
          {
            "from": 300
          }
        ]
      }
    }
  }
}
```

- origin：你所在的坐标点
- unit：单位

  m (metres) but it can also accept: m (miles), km (kilometers)
- distance_type：搜索方式，速度和精度权衡

  sloppy_arc (the default), arc (most accurate) and plane (fastest)
- ranges：定义范围

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
    "total": 4,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "agg_by_distance_range": {
      "buckets": [
        {
          "key": "*-100.0",
          "from": 0,
          "to": 100,
          "doc_count": 1
        },
        {
          "key": "100.0-300.0",
          "from": 100,
          "to": 300,
          "doc_count": 0
        },
        {
          "key": "300.0-*",
          "from": 300,
          "doc_count": 3
        }
      ]
    }
  }
}
```
