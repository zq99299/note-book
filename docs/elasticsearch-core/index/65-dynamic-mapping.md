# 定制化自己的 dynamic mapping 策略
[[toc]]

## 定制 dynamic 策略
有如下三种可选

- true：遇到陌生字段，就进行 dynamic mapping
- false：遇到陌生字段，就忽略
- strict：遇到陌生字段，就报错

> 示例，创建一个策略

1. 对于 my_type 全局设置策略为 遇到陌生字段就报错
2. 对于 my_type.address 字段 策略设置为自动 mapping

PUT /my_index
{
  "mappings": {
    "my_type": {
      "dynamic": "strict",
      "properties": {
        "title": {
          "type": "text"
        },
        "address": {
          "type": "object",
          "dynamic": "true"
        }
      }
    }
  }
}

> 测试全局策略是否生效

```json
PUT /my_index/my_type/1
{
  "title": "my article",
  "content": "this is my article",
  "address": {
    "province": "guangdong",
    "city": "guangzhou"
  }
}
```

响应错误，content 字段校验未通过

```json
{
  "error": {
    "root_cause": [
      {
        "type": "strict_dynamic_mapping_exception",
        "reason": "mapping set to strict, dynamic introduction of [content] within [my_type] is not allowed"
      }
    ],
    "type": "strict_dynamic_mapping_exception",
    "reason": "mapping set to strict, dynamic introduction of [content] within [my_type] is not allowed"
  },
  "status": 400
}
```

> 测试 address 测自动 mapping 策略

```json
PUT /my_index/my_type/1
{
  "title": "my article",
  "address": {
    "province": "guangdong",
    "city": "guangzhou"
  }
}
```

响应成功

```json
{
  "_index": "my_index",
  "_type": "my_type",
  "_id": "1",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": true
}
```

## 查看 mapping 信息

```json
GET /my_index/_mapping/my_type

------------------------------- 响应

{
  "my_index": {
    "mappings": {
      "my_type": {
        "dynamic": "strict",
        "properties": {
          "address": {
            "dynamic": "true",
            "properties": {
              "city": {
                "type": "text",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                  }
                }
              },
              "province": {
                "type": "text",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                  }
                }
              }
            }
          },
          "title": {
            "type": "text"
          }
        }
      }
    }
  }
}
```

可以看到 address 下被自动 mapping 了两个字段的配置

## 定制 dynamic mapping 策略

自动 mapping 的相关信息

### date_detection

默认会按照一定格式识别 date，比如 yyyy-MM-dd 。

但是如果某个 field 先过来一个 2017-01-01 的值，就会被自动 dynamic mapping 成 date，
后面如果再来一个 "hello world" 之类的值，就会报错。

可以手动关闭某个 type 的 date_detection，如果有需要，自己手动指定某个 field 为 date 类型。

```json
PUT /my_index/_mapping/my_type
{
    "date_detection": false
}
```

### 定制自己的 dynamic mapping template（type level）

::: tip
type level：就是在哪一个级别/层面。比如在 index 层面配置，那么就对所有的 type 生效
:::

动态 mapping 模板：就是当某一个字段匹配到模板中的通配符配置时就应用该配置的 mapping 配置

> 配置一个动态模板

- 为 my_type 配置动态模板
- en：为该配置取一个名称
- match：通配符匹配字段；
- match_mapping_type：字段 type 也要匹配上
- mapping：mapping 的信息配置

下面的配置意思是：当一个 string 字段名称后缀为 `_en` 结尾时就使用此 mapping

```json
PUT /my_index
{
    "mappings": {
        "my_type": {
            "dynamic_templates": [
                { "en": {
                      "match":              "*_en",
                      "match_mapping_type": "string",
                      "mapping": {
                          "type":           "string",
                          "analyzer":       "english"
                      }
                }}
            ]
}}}
```

> 测试一个不匹配的数据

先查询当前的 mapping

```json
GET /my_index/_mapping/my_type/

-------------------- 响应

{
  "my_index": {
    "mappings": {
      "my_type": {
        "dynamic_templates": [
          {
            "en": {
              "match": "*_en",
              "match_mapping_type": "string",
              "mapping": {
                "analyzer": "english",
                "type": "string"
              }
            }
          }
        ]
      }
    }
  }
}

```

再插入数据
```json
PUT /my_index/my_type/1
{
  "title": "this is my first article"
}
```

再次查询当前的 mapping，title 字段没有匹配到动态模板配置

```json{22}
GET /my_index/_mapping/my_type/

-------------------- 响应

{
  "my_index": {
    "mappings": {
      "my_type": {
        "dynamic_templates": [
          {
            "en": {
              "match": "*_en",
              "match_mapping_type": "string",
              "mapping": {
                "analyzer": "english",
                "type": "string"
              }
            }
          }
        ],
        "properties": {
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

> 插入一条匹配的数据

```json
PUT /my_index/my_type/2
{
  "title_en": "this is my first article"
}
```

查看 mapping ，可以看到被匹配上了

```json{31}
GET /my_index/_mapping/my_type/

-------------------- 响应

{
  "my_index": {
    "mappings": {
      "my_type": {
        "dynamic_templates": [
          {
            "en": {
              "match": "*_en",
              "match_mapping_type": "string",
              "mapping": {
                "analyzer": "english",
                "type": "string"
              }
            }
          }
        ],
        "properties": {
          "title": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "title_en": {
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}
```

> 搜索再次测试是否能搜索到结果

```json
GET /my_index/my_type/_search?q=title:is

------------------- 响应

{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.2824934,
    "hits": [
      {
        "_index": "my_index",
        "_type": "my_type",
        "_id": "1",
        "_score": 0.2824934,
        "_source": {
          "title": "this is my first article"
        }
      }
    ]
  }
}

```

```json
GET /my_index/my_type/_search?q=title_en:is

----------------------- 响应

{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 0,
    "max_score": null,
    "hits": []
  }
}
```

- title 没有匹配到任何的 dynamic 模板，默认就是 standard 分词器，不会过滤停用词，is 会进入倒排索引，用 is 来搜索是可以搜索到的

- title_en 匹配到了 dynamic 模板，就是 english 分词器，会过滤停用词，is 这种停用词就会被过滤掉，用 is 来搜索就搜索不到了


## 定制自己的 default mapping template（index level）

- 在 index 这个层面全局关闭 `_all` 功能
- 在 blog 这个 type 下打开 `_all` 功能

```json
PUT /my_index
{
    "mappings": {
        "_default_": {
            "_all": { "enabled":  false }
        },
        "blog": {
            "_all": { "enabled":  true  }
        }
    }
}
```
