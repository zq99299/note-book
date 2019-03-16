# 使用动态映射模板定制自己的映射策略

## 什么是动态映射模板？
dynamic mapping template 是es 中的一个高级的用法

> dynamic mapping

在默认情况下，没有手动 mapping 的时候，es 会自动为我们做一个识别，动态映射出这个 type 的 mapping，包括每个 field 的数据类型，一般用的动态映射

但是这里有个问题，比如:

- 一个字段值为 10，es 会默认是识别为数据类型 long，
- 一个字段值为 "10"，会默认为 text，还会带一个 keyword 的内置 field。

如果我们对 dynamic mapping 有一些自己独特的需求，这个默认我们是没法没法改变的。

这个时候动态映射模板就出生了。

## 查看默认 mapping
```json
DELETE /my_index

PUT /my_index/my_type/1
{
  "test_string": "hello world",
  "test_number": 10
}

GET /my_index/_mapping/my_type

{
  "my_index": {
    "mappings": {
      "my_type": {
        "properties": {
          "test_number": {
            "type": "long"
          },
          "test_string": {
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

假设我们的需求是：
- test_number，如果是个数字，我们希望默认就是 integer 类型的
- test_string，如果是字符串，我们希望默认是个 text，这个没问题，但是内置的 field 名字，叫做 raw，不叫 keyword，类型还是 keyword，保留 500 个字符

> 动态映射模板，有两种方式：

1. 根据默认数据类型

  根据新加入的 field 的默认的数据类型，来进行匹配上某个预定义的模板；
2. 根据字段名

  根据新加入的 field 的名字，去匹配预定义的名字（可通配符），然后匹配上某个预定义的模板

## 根据类型匹配映射模板

```json
PUT /my_index
{
  "mappings": {
    "my_type": {
      "dynamic_templates": [
        {
          "integers": {
            "match_mapping_type": "long",
            "mapping": {
              "type": "integer"
            }
          }
        },
        {
          "strings": {
            "match_mapping_type": "string",
            "mapping": {
              "type": "text",
              "fields": {
                "raw": {
                  "type": "keyword",
                  "ignore_above": 500
                }
              }
            }
          }
        }
      ]
    }
  }
}
```
- mappings.my_type ：为指定 type 配置映射模板
- dynamic_templates：难道是个固定语句么？这个没有语法提示不知道是不是
- integers：自定义名称
- match_mapping_type：需要匹配的数据类型
- mapping：动态映射的目标配置

上面 string 的意思是说，遇到 string 类型的时候，把数据类型更改为 text，并且内置 raw 字段

查看现有的 mapping

```json
get /my_index/_mapping

{
  "my_index": {
    "mappings": {
      "my_type": {
        "dynamic_templates": [
          {
            "integers": {
              "match_mapping_type": "long",
              "mapping": {
                "type": "integer"
              }
            }
          },
          {
            "strings": {
              "match_mapping_type": "string",
              "mapping": {
                "fields": {
                  "raw": {
                    "ignore_above": 500,
                    "type": "keyword"
                  }
                },
                "type": "text"
              }
            }
          }
        ]
      }
    }
  }
}
```

会发现没有其他额外的定制 mapping 信息

现在来插入一条数据测试效果

```json
PUT /my_index/my_type/1
{
  "test_long": 1,
  "test_string": "hello world"
}
```

在来查看 mapping 信息

```json
get /my_index/_mapping

{
  "my_index": {
    "mappings": {
      "my_type": {
        "dynamic_templates": [
          {
            "integers": {
              "match_mapping_type": "long",
              "mapping": {
                "type": "integer"
              }
            }
          },
          {
            "strings": {
              "match_mapping_type": "string",
              "mapping": {
                "fields": {
                  "raw": {
                    "ignore_above": 500,
                    "type": "keyword"
                  }
                },
                "type": "text"
              }
            }
          }
        ],
        "properties": {
          "test_long": {
            "type": "integer"
          },
          "test_string": {
            "type": "text",
            "fields": {
              "raw": {
                "type": "keyword",
                "ignore_above": 500
              }
            }
          }
        }
      }
    }
  }
}
```

如上信息 properties 中自动创建了我们预定义的规则类型

## 根据字段名配映射模板

```json
PUT /my_index
{
  "mappings": {
    "my_type": {
      "dynamic_templates": [
        {
          "string_as_integer": {
            "match_mapping_type": "string",
            "match": "long_*",
            "unmatch": "*_text",
            "mapping": {
              "type": "integer"
            }
          }
        }
      ]
    }
  }
}
```

- match：匹配字段名称，这里可以使用通配符
- unmatch：不能匹配的名称，这里也可以使用通配符

string_as_integer 的意思是：当字段是一个 string 的时候，
并且以 `long_` 开头且不能以 `_text` 结尾的时候，把类型转成 integer

插入数据，测试效果

```json
PUT /my_index/my_type/1
{
  "long_age": "100",
  "long_text": "100"
}
```

这条数据的正确结果只能是把 long_age 转成 integer 的

来查看下 mapping 结构

```json
GET /my_index/_mapping

{
  "my_index": {
    "mappings": {
      "my_type": {
        "dynamic_templates": [
          {
            "string_as_integer": {
              "match": "long_*",
              "unmatch": "*_text",
              "match_mapping_type": "string",
              "mapping": {
                "type": "integer"
              }
            }
          }
        ],
        "properties": {
          "long_age": {
            "type": "integer"
          },
          "long_text": {
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

可以看到成功了

## 使用场景
这里提供一个使用 dynamic mapping + template 的思路

比如每天有一堆日志，每天有一堆数据，这些数据，每天的数据都放一个新的 type 中，
每天的数据都会哗哗的往新的 tye 中写入，此时你就可以定义一个模板，搞一个脚本，
每天都预先生成一个新 type 的模板，里面将你的各个 Field 都匹配到一个你预定义的模板中去，就好了
