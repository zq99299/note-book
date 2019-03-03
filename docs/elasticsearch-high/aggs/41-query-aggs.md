# 搜索+聚合：统计指定品牌下每个颜色的销量
实际上来说，我们之前学习的搜索相关的知识，完全可以和聚合组合起来使用

如下一个 sql 的分组统计操作，要搜索品牌名为「长 xx」，并按价格分组
```
select count(*) from tvs.sales
where brand like "%长%"
group by price
```

在 es 中来说，aggregation 聚合操作必须在一个 scope 中执行，搜索出来的结果就是聚合分析操作的 scope

统计小米品牌颜色分类数量，可以下面这样写

```json
GET /tvs/sales/_search
{
   "size": 0,
   "query": {
     "term": {
       "brand": {
         "value": "小米"
       }
     }
   },
   "aggs": {
     "group_by_color": {
       "terms": {
         "field": "color"
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
    "total": 2,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "group_by_color": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "绿色",
          "doc_count": 1
        },
        {
          "key": "蓝色",
          "doc_count": 1
        }
      ]
    }
  }
}
```
