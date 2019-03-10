# nested object 聚合分析
> 分析每个月的评论的评分的平均值

需求分析：

- 每个月的评论
- 评论的平均值

```json
GET /website/blogs/_search
{
  "size": 0,
  "aggs": {
    "comments_nested": {
      "nested": {
        "path": "comments"
      },
      "aggs": {
        "group_by_month": {
          "date_histogram": {
            "field": "comments.date",
            "interval": "month",
            "format": "yyyy-MM"
          },
          "aggs":{
            "ave_stars":{
              "avg": {
                "field": "comments.stars"
              }
            }
          }
        }
      }
    }
  }
}

响应结果

{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "comments_nested": {
      "doc_count": 2,
      "group_by_month": {
        "buckets": [
          {
            "key_as_string": "2016-09",
            "key": 1472688000000,
            "doc_count": 1,
            "ave_stars": {
              "value": 4
            }
          },
          {
            "key_as_string": "2016-10",
            "key": 1475280000000,
            "doc_count": 1,
            "ave_stars": {
              "value": 5
            }
          }
        ]
      }
    }
  }
}
```

> 统计每 10 岁一个年龄段的评论，文章标签个数

需求分析：

- 按 10 岁一个年龄段分组
- 下钻分析：这些评论的文章标签分组

```json
GET /website/blogs/_search
{
  "size": 0,
  "aggs": {
    "comments_nested": {
      "nested": {
        "path": "comments"
      },
      "aggs": {
         "group_by_age": {
            "histogram": {
              "field": "comments.age",
              "interval": 10
            },
            "aggs": {
              "group_by_tags": {
                "terms": {
                  "field": "tags.keyword"
                }
              }
            }
          }
      }
    }
  }
}

{
  "took": 38,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "comments_nested": {
      "doc_count": 2,
      "group_by_age": {
        "buckets": [
          {
            "key": 20,
            "doc_count": 1,
            "group_by_tags": {
              "doc_count_error_upper_bound": 0,
              "sum_other_doc_count": 0,
              "buckets": []
            }
          },
          {
            "key": 30,
            "doc_count": 1,
            "group_by_tags": {
              "doc_count_error_upper_bound": 0,
              "sum_other_doc_count": 0,
              "buckets": []
            }
          }
        ]
      }
    }
  }
}
```

可见统计分析失败了。这个是因为在 nested 中的时候需要引用外部的字段需要额外的配置 reverse_nested

```json{17-18}
GET /website/blogs/_search
{
  "size": 0,
  "aggs": {
    "comments_nested": {
      "nested": {
        "path": "comments"
      },
      "aggs": {
         "group_by_age": {
            "histogram": {
              "field": "comments.age",
              "interval": 10
            },
            "aggs": {
              "reverse_path":{
                "reverse_nested": {
                },
                "aggs": {
                  "group_by_tags": {
                    "terms": {
                      "field": "tags.keyword"
                    }
                  }
                }
              }
            }
          }
      }
    }
  }
}


{
  "took": 4,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "comments_nested": {
      "doc_count": 2,
      "group_by_age": {
        "buckets": [
          {
            "key": 20,
            "doc_count": 1,
            "reverse_path": {
              "doc_count": 1,
              "group_by_tags": {
                "doc_count_error_upper_bound": 0,
                "sum_other_doc_count": 0,
                "buckets": [
                  {
                    "key": "投资",
                    "doc_count": 1
                  },
                  {
                    "key": "理财",
                    "doc_count": 1
                  }
                ]
              }
            }
          },
          {
            "key": 30,
            "doc_count": 1,
            "reverse_path": {
              "doc_count": 1,
              "group_by_tags": {
                "doc_count_error_upper_bound": 0,
                "sum_other_doc_count": 0,
                "buckets": [
                  {
                    "key": "投资",
                    "doc_count": 1
                  },
                  {
                    "key": "理财",
                    "doc_count": 1
                  }
                ]
              }
            }
          }
        ]
      }
    }
  }
}
```
