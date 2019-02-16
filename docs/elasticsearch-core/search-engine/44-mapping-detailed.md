# mapping 的创建以及复杂 mapping 详解
本章会记录 3个 章节的笔记

- 44. 初识搜索引擎_ mapping 的核心数据类型以及 dynamic mapping
- 45. 初识搜索引擎_手动建立和修改 mapping 以及定制 string 类型数据是否分词
- 46. 初识搜索引擎_ mapping 复杂数据类型以及 object 类型数据底层结构大揭秘


[[toc]]



## 核心的数据类型

- string
- byte，short，integer，long
- float，double
- boolean
- date

## dynamic mapping 规则

就是自动识别类型

- true or false	-->	boolean
- 123		-->	long
- 123.45		-->	double
- 2017-01-01	-->	date
- "hello world"	-->	string/text

## 查看 mapping
语法

```json
GET /index/_mapping/type
```

## 如何建立索引时指定 mapping

语法如下

```json
PUT /index
{
  "index": {
    "type":{
      "properties": {
        "field":{
          "type": "text", // 数据类型
          "index":"",    // 索引类型
          "analyzer": "english" // 分词类型
        }
      }
    }
  }
}
```
索引类型有如下值：

- analyzed : 全文 full text
- not_analyzed : 精准匹配 exact value
- no ：不索引

::: tip
只能创建 index 时手动建立 mapping，或者新增 field mapping，但是不能 update field mapping
:::

```json
PUT /website
{
  "mappings": {
    "article": {
      "properties": {
        "author_id": {
          "type": "long"
        },
        "title": {
          "type": "text",
          "analyzer": "english"
        },
        "content": {
          "type": "text"
        },
        "post_date": {
          "type": "date"
        },
        "publisher_id": {
          "type": "text",
          "index": "not_analyzed"
        }
      }
    }
  }
}
```

如果你尝试再次执行上面的语句就会看到报错了,不能修改

```json
{
  "error": {
    "root_cause": [
      {
        "type": "index_already_exists_exception",
        "reason": "index [website/icXrvvkcRj6z4uNaNhf6uA] already exists",
        "index_uuid": "icXrvvkcRj6z4uNaNhf6uA",
        "index": "website"
      }
    ],
    "type": "index_already_exists_exception",
    "reason": "index [website/icXrvvkcRj6z4uNaNhf6uA] already exists",
    "index_uuid": "icXrvvkcRj6z4uNaNhf6uA",
    "index": "website"
  },
  "status": 400
}
```

## 新增字段 mapping

对于已经存在的字段不能修改 mapping，新增字段则可以指定

```json
PUT /website/_mapping/article
{
  "properties" : {
    "new_field" : {
      "type" :    "string",
      "index":    "not_analyzed"
    }
  }
}
```

## 测试 mapping

可以使用如下语法进行查看 mapping 的分词效果，如

title 的 analyzer 是 english，可以看到把 a 干掉了

```json
GET /website/_analyze
{
  "field": "title",
  "text": "a dogs"
}

--------------- 响应

{
  "tokens": [
    {
      "token": "dog",
      "start_offset": 2,
      "end_offset": 6,
      "type": "<ALPHANUM>",
      "position": 1
    }
  ]
}
```

```json
GET /website/_analyze
{
  "field": "content",
  "text": "my-dogs"
}
```

如果 index = not_analyzed 的话。使用该 api 就会报错；如 new_field 字段

```json
GET website/_analyze
{
  "field": "new_field",
  "text": "my dogs"
}

--------------------------------- 响应

{
  "error": {
    "root_cause": [
      {
        "type": "remote_transport_exception",
        "reason": "[sEvAlYx][127.0.0.1:9300][indices:admin/analyze[s]]"
      }
    ],
    "type": "illegal_argument_exception",
    "reason": "Can't process field [new_field], Analysis requests are only supported on tokenized fields"
  },
  "status": 400
}
```

-----------------------

mapping 复杂数据类型以及 object 类型数据底层结构大揭秘

## multivalue field

建立索引时与 string 是一样的，数据类型不能混

```json
{ "tags": [ "tag1", "tag2" ]}
```


## empty field

主要是空值：null，[]，[null]

## object field

对象类型的就比较复杂了，先来创建一个文档，再查看 es 自动为我们创建的 mapping 是什么样的

```json
PUT /company/employee/1
{
  "address": {
    "country": "china",
    "province": "guangdong",
    "city": "guangzhou"
  },
  "name": "jack",
  "age": 27,
  "join_date": "2017-01-01"
}

```

`GET /company/_mapping/employee` 可以看到返回的数据嵌套很复杂了。

address 下面还有一个 properties ，那么 address 就是一个 object field

```json
{
  "company": {
    "mappings": {
      "employee": {
        "properties": {
          "address": {
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
              "country": {
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
          "age": {
            "type": "long"
          },
          "join_date": {
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
          }
        }
      }
    }
  }
}
```

比如这一条数据，它在 es 里面被分词之后，可能是这样的

```json
{
  "address": {
    "country": "china",
    "province": "guangdong",
    "city": "guangzhou"
  },
  "name": "jack",
  "age": 27,
  "join_date": "2017-01-01"
}

-----------------------------------

{
    "name":            [jack],
    "age":          [27],
    "join_date":      [2017-01-01],
    "address.country":         [china],
    "address.province":   [guangdong],
    "address.city":  [guangzhou]
}
```

上面的都是比较简单的内容，如果是稍微复杂一点的，就可能是下面这样了

```json
{
    "authors": [
        { "age": 26, "name": "Jack White"},
        { "age": 55, "name": "Tom Jones"},
        { "age": 39, "name": "Kitty Smith"}
    ]
}

-------------------------------

{
    "authors.age":    [26, 55, 39],
    "authors.name":   [jack, white, tom, jones, kitty, smith]
}
```
