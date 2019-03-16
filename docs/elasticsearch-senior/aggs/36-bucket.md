# bucket 嵌套实现颜色+品牌的多层下钻分析
[[toc]]


从颜色到品牌进行下钻分析，每种颜色的平均价格，以及找到每种颜色每个品牌的平均价格

在实现该需求之前，我们先来了解下什么是下钻分析

## 什么是下钻？
比如说，现在红色的电视有 4 台，有 3 台是属于长虹的，1 台是属于小米的

- 红色电视中的 3 台长虹的平均价格是多少？
- 红色电视中的 1 台小米的平均价格是多少？

下钻的意思是，已经分了一个组了，比如说颜色的分组，然后还要继续对这个分组内的数据再分组，
比如一个颜色内，还可以分成多个不同的品牌的组，最后对每个最小粒度的分组执行聚合分析操作，
这就叫做下钻分析。

es 下钻分析，就要对 bucket 进行多层嵌套，多次分组

## 实现需求
```json{15-24}
GET /tvs/sales/_search
{
   "size" : 0,
   "aggs": {
      "colors": {
         "terms": {
            "field": "color"
         },
         "aggs": {
            "color_avg_price": {
               "avg": {
                  "field": "price"
               }
            },
            "group_by_brand":{
              "terms": {
                "field": "brand"
              },
              "aggs": {
                "brand_avg_price": {
                  "avg": {
                    "field": "price"
                  }
                }
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
          "color_avg_price": {
            "value": 3250
          },
          "group_by_brand": {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
              {
                "key": "长虹",
                "doc_count": 3,
                "brand_avg_price": {
                  "value": 1666.6666666666667
                }
              },
              {
                "key": "三星",
                "doc_count": 1,
                "brand_avg_price": {
                  "value": 8000
                }
              }
            ]
          }
        },
        {
          "key": "绿色",
          "doc_count": 2,
          "color_avg_price": {
            "value": 2100
          },
          "group_by_brand": {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
              {
                "key": "TCL",
                "doc_count": 1,
                "brand_avg_price": {
                  "value": 1200
                }
              },
              {
                "key": "小米",
                "doc_count": 1,
                "brand_avg_price": {
                  "value": 3000
                }
              }
            ]
          }
        },
        {
          "key": "蓝色",
          "doc_count": 2,
          "color_avg_price": {
            "value": 2000
          },
          "group_by_brand": {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
              {
                "key": "TCL",
                "doc_count": 1,
                "brand_avg_price": {
                  "value": 1500
                }
              },
              {
                "key": "小米",
                "doc_count": 1,
                "brand_avg_price": {
                  "value": 2500
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

按照多个维度（颜色+品牌）多层下钻分析，而且学会了每个下钻维度（颜色，颜色+品牌），
都可以对每个维度分别执行一次 metric 聚合操作
