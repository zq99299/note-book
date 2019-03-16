# 基于 nested object 实现博客与评论嵌套关系
之前冗余数据方式的来建模，其实用的就是 object 类型，我们这里又要引入一种新的 object 类型：nested object 类型

会使用 object 类型来实现一个需求：搜索 28 岁的黄药师的评论，然后引出为什么需要使用 nested objec 类型

##  object 类型

- 删除 website index
- 插入模拟数据
- 查看自动生成的 mappings

```json
DELETE /website

PUT /website/blogs/6
{
  "title": "花无缺发表的一篇帖子",
  "content":  "我是花无缺，大家要不要考虑一下投资房产和买股票的事情啊。。。",
  "tags":  [ "投资", "理财" ],
  "comments": [
    {
      "name":    "小鱼儿",
      "comment": "什么股票啊？推荐一下呗",
      "age":     28,
      "stars":   4,
      "date":    "2016-09-01"
    },
    {
      "name":    "黄药师",
      "comment": "我喜欢投资房产，风，险大收益也大",
      "age":     31,
      "stars":   5,
      "date":    "2016-10-22"
    }
  ]
}

GET /website/blogs/_mapping

{
  "website": {
    "mappings": {
      "blogs": {
        "properties": {
          "comments": {
            "properties": {
              "age": {
                "type": "long"
              },
              "comment": {
                "type": "text",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                  }
                }
              },
              "date": {
                "type": "date"
              },
              "name": {
                "type": "text",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                  }
                }
              },
              "stars": {
                "type": "long"
              }
            }
          },
          "content": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "tags": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "title": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      }
    }
  }
}
```

实现搜索需求

```json
GET /website/blogs/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "comments.name":"黄药师"
          }
        },{
          "match": {
            "comments.age":28
          }
        }
      ]
    }
  }
}
```

搜索的结果是，id=6 这条数据被查询出来了，结果又一点不太对，被查询出来的结果中黄药师的年龄是 31

这个就涉及到了 object 类型的底层存储结构

``` json
{
  "title":            [ "花无缺", "发表", "一篇", "帖子" ],
  "content":          [ "我", "是", "花无缺", "大家", "要不要", "考虑", "一下", "投资", "房产", "买", "股票", "事情" ],
  "tags":             [ "投资", "理财" ],
  "comments.name":    [ "小鱼儿", "黄药师" ],
  "comments.comment": [ "什么", "股票", "推荐", "我", "喜欢", "投资", "房产", "风险", "收益", "大" ],
  "comments.age":     [ 28, 31 ],
  "comments.stars":   [ 4, 5 ],
  "comments.date":    [ "2016-09-01", "2016-10-22"]
}
```
object 类型底层数据结构，会将一个 json 数组中的数据，进行扁平化，
所以，直接命中了这个 document，name=黄药师，age=28，正好符合

## nested objec 类型

这次我们改用 nested objec 类型
```json

DELETE /website

PUT /website
{
  "mappings": {
    "blogs": {
      "properties": {
        "comments": {
          "type": "nested",
          "properties": {
            "name":    { "type": "string"  },
            "comment": { "type": "string"  },
            "age":     { "type": "short"   },
            "stars":   { "type": "short"   },
            "date":    { "type": "date"    }
          }
        }
      }
    }
  }
}

GET /website/blogs/_mapping

{
  "website": {
    "mappings": {
      "blogs": {
        "properties": {
          "comments": {
            "type": "nested",
            "properties": {
              "age": {
                "type": "short"
              },
              "comment": {
                "type": "text"
              },
              "date": {
                "type": "date"
              },
              "name": {
                "type": "text"
              },
              "stars": {
                "type": "short"
              }
            }
          },
          "content": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "tags": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "title": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      }
    }
  }
}

```

对比 mapping 发现，comments 多了一个 `"type": "nested"`

这次再查询就会发现搜索不到这一条数据了，成功了。

注意查询使用的类型也是 nested

```json
GET /website/blogs/_search
{
  "query": {
    "nested": {
      "path": "comments",
      "score_mode": "none",
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "comments.name":"黄药师"
              }
            },{
              "match": {
                "comments.age":28
              }
            }
          ]
        }
      }
    }
  }
}
```

- score_mode：分数计算模式，none 为不评分

这个时候底层存储数据其实就类似关联表那样的数据结构了

```json
{
  "comments.name":    [ "小鱼儿" ],
  "comments.comment": [ "什么", "股票", "推荐" ],
  "comments.age":     [ 28 ],
  "comments.stars":   [ 4 ],
  "comments.date":    [ 2014-09-01 ]
}
{
  "comments.name":    [ "黄药师" ],
  "comments.comment": [ "我", "喜欢", "投资", "房产", "风险", "收益", "大" ],
  "comments.age":     [ 31 ],
  "comments.stars":   [ 5 ],
  "comments.date":    [ 2014-10-22 ]
}
{
  "title":            [ "花无缺", "发表", "一篇", "帖子" ],
  "body":             [ "我", "是", "花无缺", "大家", "要不要", "考虑", "一下", "投资", "房产", "买", "股票", "事情" ],
  "tags":             [ "投资", "理财" ]
}
```
