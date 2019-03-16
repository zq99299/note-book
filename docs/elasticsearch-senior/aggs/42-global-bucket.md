# global bucket：单个品牌与所有品牌销量对比

之前说过 aggregation scope：一个聚合操作，必须在 query 的搜索结果范围内执行

考虑一个场景出来两个结果：一个结果是基于 query 搜索结果来聚合的， 一个结果是对所有数据执行聚合的。
可以理解为在一个搜索中针对不同的 scope 进行聚合操作。

如下，计算长虹的平均价格和所有品牌的平均价格，形成一个对比。这就用到了 global bucket 语法

```json
GET /tvs/sales/_search
{
  "size": 0,
  "query": {
    "term": {
      "brand": {
        "value": "长虹"
      }
    }
  },
  "aggs": {
    "single_brand_avg_price": {
      "avg": {
        "field": "price"
      }
    },
    "all": {
      "global": {},
      "aggs": {
        "all_brand_avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```
global：就是 global bucket，将所有数据纳入聚合的 scope，而不管之前的 query

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
    "total": 3,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "all": {
      "doc_count": 8,
      "all_brand_avg_price": {
        "value": 2650
      }
    },
    "single_brand_avg_price": {
      "value": 1666.6666666666667
    }
  }
}
```

- single_brand_avg_price：就是针对 query 搜索结果，执行的，拿到的就是长虹品牌的平均价格
- all.all_brand_avg_price：拿到所有品牌的平均价格
