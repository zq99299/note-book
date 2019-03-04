# percentiles rank 以及网站访问时延 SLA 统计

## SLA
SLA 就是你提供的服务的标准

我们的网站的提供的访问延时的 SLA，确保所有的请求 100% 都必须在 200ms 以内，
大公司内一般都是要求 100% 在 200ms 以内，如果超过 1s，则需要升级到 A 级故障，
代表网站的访问性能和用户体验急剧下降

## percentiles rank
这个 percentile ranks 其实比 pencentile 还要常用，
比如按照品牌分组，计算电视机售价在 1000 占比，2000 占比，3000 占比

需求：在 200ms 以内的，有百分之多少，在 1000 毫秒以内的有百分之多少

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
        "latency_percentile_ranks": {
          "percentile_ranks": {
            "field": "latency",
            "values": [
              200,
              1000
            ]
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
  "took": 110,
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
          "latency_percentile_ranks": {
            "values": {
              "200.0": 29.40613026819923,
              "1000.0": 100
            }
          }
        },
        {
          "key": "江苏",
          "doc_count": 6,
          "latency_percentile_ranks": {
            "values": {
              "200.0": 100,
              "1000.0": 100
            }
          }
        }
      ]
    }
  }
}
```

理解这个 200ms 以内和 1000ms 以内：200ms 以内的占总数的百分比？

## percentile 的优化

内部使用的是 TDigest 算法，用很多节点来执行百分比的计算，近似估计、有误差，节点越多，越精准

它的配置参数 compression

- 限制节点数量最多 compression * 20 = 2000 个 node 去计算
- 默认100
- 越大，占用内存越多，越精准，性能越差

一个节点占用 32 字节，100 * 20 * 32 = 64KB

如果你想要 percentile 算法越精准，compression 可以设置的越大
