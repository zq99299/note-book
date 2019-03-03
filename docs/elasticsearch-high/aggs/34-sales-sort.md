# 统计哪种颜色电视销量最高&案例介绍
[[toc]]

## 家电卖场案例背景
以一个家电卖场中的电视销售数据为背景，来对各种品牌，各种颜色的电视的销量和销售额，进行各种各样角度的分析

根据业务进行定制 mappings

```json
PUT /tvs
{
	"mappings": {
		"sales": {
			"properties": {
				"price": {
					"type": "long"
				},
				"color": {
					"type": "keyword"
				},
				"brand": {
					"type": "keyword"
				},
				"sold_date": {
					"type": "date"
				}
			}
		}
	}
}
```

插入销售数据

```json
POST /tvs/sales/_bulk
{ "index": {}}
{ "price" : 1000, "color" : "红色", "brand" : "长虹", "sold_date" : "2016-10-28" }
{ "index": {}}
{ "price" : 2000, "color" : "红色", "brand" : "长虹", "sold_date" : "2016-11-05" }
{ "index": {}}
{ "price" : 3000, "color" : "绿色", "brand" : "小米", "sold_date" : "2016-05-18" }
{ "index": {}}
{ "price" : 1500, "color" : "蓝色", "brand" : "TCL", "sold_date" : "2016-07-02" }
{ "index": {}}
{ "price" : 1200, "color" : "绿色", "brand" : "TCL", "sold_date" : "2016-08-19" }
{ "index": {}}
{ "price" : 2000, "color" : "红色", "brand" : "长虹", "sold_date" : "2016-11-05" }
{ "index": {}}
{ "price" : 8000, "color" : "红色", "brand" : "三星", "sold_date" : "2017-01-01" }
{ "index": {}}
{ "price" : 2500, "color" : "蓝色", "brand" : "小米", "sold_date" : "2017-02-12" }
```

## 统计哪种颜色的电视销量最高

```json
GET /tvs/sales/_search
{
  "size": 0,
  "aggs": {
    "popular_colors": {
      "terms": {
        "field": "color"
      }
    }
  }
}
```

- size：只获取聚合结果，而不要返回参与聚合的原始数据
- aggs：固定语法，要对一份数据执行分组聚合操作
- popular_colors：就是对每个 aggs 都要起一个名字，这个名字是自定义的
- terms：根据字段的值进行分组
- field：根据指定的字段的值进行分组

可以看到响应的结果，已经分好组了

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
    "popular_colors": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "红色",
          "doc_count": 4
        },
        {
          "key": "绿色",
          "doc_count": 2
        },
        {
          "key": "蓝色",
          "doc_count": 2
        }
      ]
    }
  }
}
```

- hits.hits：我们指定了size=0，所以 hits.hits 就是空的，否则会把执行聚合的那些原始数据给你返回回来
- aggregations：聚合结果
- popular_color：我们指定的某个聚合的名称
- buckets：根据我们指定的 field 划分出的 buckets
- key：每个 bucket 对应的那个值
- doc_count：这个 bucket 分组内，有多少个数据
- 数量，其实就是这种颜色的销量
- 默认的排序规则：按照 doc_count 降序排序
