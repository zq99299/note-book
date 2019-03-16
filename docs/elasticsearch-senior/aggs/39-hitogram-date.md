# date_histogram

实现需求：2016-01-01 ~ 2017-12-31 之间每个月的电视销量

```json
GET /tvs/sales/_search
{
   "size" : 0,
   "aggs": {
      "sales": {
         "date_histogram": {
            "field": "sold_date",
            "interval": "month",
            "format": "yyyy-MM-dd",
            "min_doc_count" : 0,
            "extended_bounds" : {
                "min" : "2016-01-01",
                "max" : "2017-12-31"
            }
         }
      }
   }
}
```
这里就用到了 date_histogram 日期区间分组语法

- min_doc_count：

  即使某个日期 interval，2017-01-01~2017-01-31 中，一条数据都没有，那么这个区间也是要返回的，不然默认是会过滤掉这个区间的
- extended_bounds

  min，max：划分 bucket 的时候，会限定在这个起始日期，和截止日期内

响应结果
```json
{
  "took": 7,
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
    "dales": {
      "buckets": [
        {
          "key_as_string": "2016-01-01",
          "key": 1451606400000,
          "doc_count": 0
        },
        {
          "key_as_string": "2016-02-01",
          "key": 1454284800000,
          "doc_count": 0
        },
        {
          "key_as_string": "2016-03-01",
          "key": 1456790400000,
          "doc_count": 0
        },
        {
          "key_as_string": "2016-04-01",
          "key": 1459468800000,
          "doc_count": 0
        },
        {
          "key_as_string": "2016-05-01",
          "key": 1462060800000,
          "doc_count": 1
        },
        {
          "key_as_string": "2016-06-01",
          "key": 1464739200000,
          "doc_count": 0
        },
        {
          "key_as_string": "2016-07-01",
          "key": 1467331200000,
          "doc_count": 1
        },
        {
          "key_as_string": "2016-08-01",
          "key": 1470009600000,
          "doc_count": 1
        },
        {
          "key_as_string": "2016-09-01",
          "key": 1472688000000,
          "doc_count": 0
        },
        {
          "key_as_string": "2016-10-01",
          "key": 1475280000000,
          "doc_count": 1
        },
        {
          "key_as_string": "2016-11-01",
          "key": 1477958400000,
          "doc_count": 2
        },
        {
          "key_as_string": "2016-12-01",
          "key": 1480550400000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-01-01",
          "key": 1483228800000,
          "doc_count": 1
        },
        {
          "key_as_string": "2017-02-01",
          "key": 1485907200000,
          "doc_count": 1
        },
        {
          "key_as_string": "2017-03-01",
          "key": 1488326400000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-04-01",
          "key": 1491004800000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-05-01",
          "key": 1493596800000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-06-01",
          "key": 1496275200000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-07-01",
          "key": 1498867200000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-08-01",
          "key": 1501545600000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-09-01",
          "key": 1504224000000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-10-01",
          "key": 1506816000000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-11-01",
          "key": 1509494400000,
          "doc_count": 0
        },
        {
          "key_as_string": "2017-12-01",
          "key": 1512086400000,
          "doc_count": 0
        }
      ]
    }
  }
}
```
