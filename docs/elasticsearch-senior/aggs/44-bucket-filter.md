# bucket filter：统计牌品最近一个月的平均价格

一个简单的语法是这样的

```json
GET /tvs/sales/_search
{
  "aggs": {
    "NAME": {
      "filter": {
        "range": {
          "FIELD": {
            "gte": 10,
            "lte": 20
          }
        }
      }
    }
  }
}
```

aggs.filter 针对的是聚合去做的，如果放 query 里面的 filter，是全局的，会对所有的数据都有影响

考虑这样一个场景你就明白了 aggs.filter 与 query.filter 的区别：统计长虹电视最近 1 个月的平均值、 最近 3 个月的平均值、 最近 6 个月的平均值

那么针对如上需求，要实现的思路可能是：

- 把所有长虹电视订单先查询出来，然后在这个结果中进行条件过滤。
- 或者每个平均值计算都用不同的聚合分析语句去执行

bucket filter 可以让你在一个聚合分析请求中完成不同数据的过滤统计，对不同的 bucket下的 aggs 进行filter

下面来实现这么一个需求：统计长虹电视过去 130 天、140 天、150 天的平均销售价格

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
    "recent_150d": {
      "filter": {
        "range": {
          "sold_date": {
            "gte": "now-150d"
          }
        }
      },
      "aggs": {
        "recent_150d_avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    },
    "recent_140d": {
      "filter": {
        "range": {
          "sold_date": {
            "gte": "now-140d"
          }
        }
      },
      "aggs": {
        "recent_140d_avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    },
    "recent_130d": {
      "filter": {
        "range": {
          "sold_date": {
            "gte": "now-130d"
          }
        }
      },
      "aggs": {
        "recent_130d_avg_price": {
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
    "recent_130d": {
      "doc_count": 0,
      "recent_130d_avg_price": {
        "value": null
      }
    },
    "recent_140d": {
      "doc_count": 0,
      "recent_140d_avg_price": {
        "value": null
      }
    },
    "recent_150d": {
      "doc_count": 0,
      "recent_150d_avg_price": {
        "value": null
      }
    }
  }
}
```

::: tip
由于本笔记是 2019年3月3日20:48:05 记录的，该聚合中使用的是动态时间，
所以就算 130 天也搜索不到 2017 年的数据。所以这里的结果都没有
:::
