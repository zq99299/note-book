# 基于 term vector 深入探查数据的情况
[[toc]]

## 何为 term vector？
是 es 中提供的一个 api，获取 document 中的某个 field 内的各个 term 的统计信息，比如

term：可以理解为一个分词

term information:

- term_freq： term frequency in the field
- term positions
- start and end offsets
- term payloads

term statistics

- total term frequency：一个 term 在所有 document 中出现的频率
- document frequency：有多少 document 包含这个 term

field statistics

- document count：有多少 document 包含这个 field;
- sum of document frequency：一个 field 中所有 term 的 df 之和
- sum of total term frequency：一个 field 中的所有 term 的 tf 之和

> 语法

```
GET /twitter/tweet/1/_termvectors
GET /twitter/tweet/1/_termvectors?fields=text
```

term statistics 和 field statistics 并不精准，不会被考虑有的 doc 可能被删除了

我告诉大家，其实很少用，用的时候，一般来说，就是你需要对一些数据做探查的时候。
比如说，你想要看到某个 term，某个词条如：大话西游在多少个 document 中出现了。
或者说某个 field，film_desc（电影的说明信息），有多少个 doc 包含了这个说明信息。

探查 term vectors 有两个时机可准备好数据：

- index-time

  在 mapping 里配置一下，然后建立索引的时候，就直接给你生成这些 term 和 field 的统计信息了
- query-time

  你之前没有生成过任何的 Term vector 信息，然后在查看 term vector 的时候，
  直接就可以看到了，会 on the fly（现场计算出各种统计信息），然后返回给你

## index-time term vector 实验

> 手动 mapping

```json
PUT /my_index
{
  "mappings": {
    "my_type": {
      "properties": {
        "text": {
            "type": "text",
            "term_vector": "with_positions_offsets_payloads",
            "store" : true,
            "analyzer" : "fulltext_analyzer"
         },
         "fullname": {
            "type": "text",
            "analyzer" : "fulltext_analyzer"
        }
      }
    }
  },
  "settings" : {
    "index" : {
      "number_of_shards" : 1,
      "number_of_replicas" : 0
    },
    "analysis": {
      "analyzer": {
        "fulltext_analyzer": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": [
            "lowercase",
            "type_as_payload"
          ]
        }
      }
    }
  }
}
```
> 插入数据

```json
PUT /my_index/my_type/1
{
  "fullname" : "Leo Li",
  "text" : "hello test test test "
}

PUT /my_index/my_type/2
{
  "fullname" : "Leo Li",
  "text" : "other hello test ..."
}
```

> 探查 term vectors 信息

```json
GET /my_index/my_type/1/_termvectors
{
  "fields" : ["text"],
  "offsets" : true,
  "payloads" : true,
  "positions" : true,
  "term_statistics" : true,
  "field_statistics" : true
}
```

这里是探查 id=1 的 doc 中的 text 字段的 term vectors 信息

响应结果

```json
{
  "_index": "my_index",
  "_type": "my_type",
  "_id": "1",
  "_version": 1,
  "found": true,
  "took": 9,
  "term_vectors": {
    "text": {
      "field_statistics": {
        "sum_doc_freq": 6,
        "doc_count": 2,
        "sum_ttf": 8
      },
      "terms": {
        "hello": {
          "doc_freq": 2,
          "ttf": 2,
          "term_freq": 1,
          "tokens": [
            {
              "position": 0,
              "start_offset": 0,
              "end_offset": 5,
              "payload": "d29yZA=="
            }
          ]
        },
        "test": {
          "doc_freq": 2,
          "ttf": 4,
          "term_freq": 3,
          "tokens": [
            {
              "position": 1,
              "start_offset": 6,
              "end_offset": 10,
              "payload": "d29yZA=="
            },
            {
              "position": 2,
              "start_offset": 11,
              "end_offset": 15,
              "payload": "d29yZA=="
            },
            {
              "position": 3,
              "start_offset": 16,
              "end_offset": 20,
              "payload": "d29yZA=="
            }
          ]
        }
      }
    }
  }
}
```

上面的结果是要参照需要探查的 text 字段内容来说明的

```json
id=1："text" : "hello test test test "
id=2： "text" : "other hello test ..."
```

> field_statistics

```json
"field_statistics": {
  "sum_doc_freq": 6,
  "doc_count": 2,
  "sum_ttf": 8
},
```

- sum_doc_freq：sum of document frequency，一个 field 中所有 term 的 df 之和

  注意，是所有 doc，比如这里的 doc_count 数量为 2 ，所以是这 2 个 doc 中的所有 df 之和
  这个可以查看 id=2 的 term vector 信息，因为 doc2 中的字段已经包含了 doc1 的，所以相加能匹配上
- doc_count： id=1 中的 text 字段中的分词（term）总共在几个 doc 中出现过
- sum_ttf： sum of total term frequency，一个 field 中的所有 term 的 tf 之和

  这个也是针对涉及到的 doc 中的 tf

> terms 信息

```json
"hello": {
    "doc_freq": 2,
    "ttf": 2,
    "term_freq": 1,
    "tokens": [
      {
        "position": 0,
        "start_offset": 0,
        "end_offset": 5,
        "payload": "d29yZA=="
      }
    ]
  }
```
- doc_freq：hello 这个 term 在几个 doc 中出现了
- ttf：total term frequency，一个 term 在所有 document 中出现的频率
- term_freq：一个 term 在当前 doc 中出现的频率
- tokens：一个 term 也叫 tokens；记载了这个词在当前 doc 中文本内容中的偏移量
- payload：该内容的一个编码？

## query-time term vector 实验
由于在创建 mapping 的时候只手动配置了 text 为 index-time 的 term vector，
这里直接用另外一个字段即可

```json
GET /my_index/my_type/1/_termvectors
{
  "fields" : ["fullname"],
  "offsets" : true,
  "positions" : true,
  "term_statistics" : true,
  "field_statistics" : true
}
```

响应数据

```json
{
  "_index": "my_index",
  "_type": "my_type",
  "_id": "1",
  "_version": 1,
  "found": true,
  "took": 1,
  "term_vectors": {
    "fullname": {
      "field_statistics": {
        "sum_doc_freq": 4,
        "doc_count": 2,
        "sum_ttf": 4
      },
      "terms": {
        "leo": {
          "doc_freq": 2,
          "ttf": 2,
          "term_freq": 1,
          "tokens": [
            {
              "position": 0,
              "start_offset": 0,
              "end_offset": 3
            }
          ]
        },
        "li": {
          "doc_freq": 2,
          "ttf": 2,
          "term_freq": 1,
          "tokens": [
            {
              "position": 1,
              "start_offset": 4,
              "end_offset": 6
            }
          ]
        }
      }
    }
  }
}
```

一般来说，如果条件允许，你就用 query time 的 term vector 就可以了，你要探查什么数据，
现场去探查一下就好了

## 手动指定 doc 的 term vector
```json
GET /my_index/my_type/_termvectors
{
  "doc" : {
    "fullname" : "Leo Li",
    "text" : "hello"
  },
  "fields" : ["text"],
  "offsets" : true,
  "payloads" : true,
  "positions" : true,
  "term_statistics" : true,
  "field_statistics" : true
}
```

该语法的意思不是说你写一个 doc 进行测试这个 doc 中的 term vector 信息，
而是你可以指定一条内容，如这里的 `hello` 它会按照对于的 text 字段去进行分词，
然后只返回你这里写的 term 在现有的 index 中的统计信息

下面是返回结果，可以对比下

```json
{
  "_index": "my_index",
  "_type": "my_type",
  "_version": 0,
  "found": true,
  "took": 0,
  "term_vectors": {
    "text": {
      "field_statistics": {
        "sum_doc_freq": 6,
        "doc_count": 2,
        "sum_ttf": 8
      },
      "terms": {
        "hello": {
          "doc_freq": 2,
          "ttf": 2,
          "term_freq": 1,
          "tokens": [
            {
              "position": 0,
              "start_offset": 0,
              "end_offset": 5
            }
          ]
        }
      }
    }
  }
}
```

## 手动指定 analyzer 来生成 term vector

```json
GET /my_index/my_type/_termvectors
{
  "doc" : {
    "fullname" : "Leo Li",
    "text" : "hello test test test"
  },
  "fields" : ["text"],
  "offsets" : true,
  "payloads" : true,
  "positions" : true,
  "term_statistics" : true,
  "field_statistics" : true,
  "per_field_analyzer" : {
    "text": "standard"
  }
}
```

默认会按照对应的字段去分词，这里可以通过 per_field_analyzer 去指定分词器

## terms filter

```json
GET /my_index/my_type/_termvectors
{
  "doc" : {
    "fullname" : "Leo Li",
    "text" : "hello test test test"
  },
  "fields" : ["text"],
  "offsets" : true,
  "payloads" : true,
  "positions" : true,
  "term_statistics" : true,
  "field_statistics" : true,
  "filter" : {
      "max_num_terms" : 3,
      "min_term_freq" : 1,
      "min_doc_freq" : 1
    }
}
```

这个就是说，根据 term 统计信息，过滤出你想要看到的 term vector 统计结果
也挺有用的，比如你探查数据把，可以过滤掉一些出现频率过低的term，就不考虑了

## multi term vector
顾名思义就是一次性可以指定多个 doc 的 term vector 信息返回

```json
GET _mtermvectors
{
   "docs": [
      {
         "_index": "my_index",
         "_type": "my_type",
         "_id": "2",
         "term_statistics": true
      },
      {
         "_index": "my_index",
         "_type": "my_type",
         "_id": "1",
         "fields": [
            "text"
         ]
      }
   ]
}
```

```json
{
  "docs": [
    {
      "_index": "my_index",
      "_type": "my_type",
      "_id": "2",
      "_version": 1,
      "found": true,
      "took": 0,
      "term_vectors": {
        "text": {
          "field_statistics": {
            "sum_doc_freq": 6,
            "doc_count": 2,
            "sum_ttf": 8
          },
          "terms": {
            "...": {
              "doc_freq": 1,
              "ttf": 1,
              "term_freq": 1,
              "tokens": [
                {
                  "position": 3,
                  "start_offset": 17,
                  "end_offset": 20,
                  "payload": "d29yZA=="
                }
              ]
            },
            "hello": {
              "doc_freq": 2,
              "ttf": 2,
              "term_freq": 1,
              "tokens": [
                {
                  "position": 1,
                  "start_offset": 6,
                  "end_offset": 11,
                  "payload": "d29yZA=="
                }
              ]
            },
            "other": {
              "doc_freq": 1,
              "ttf": 1,
              "term_freq": 1,
              "tokens": [
                {
                  "position": 0,
                  "start_offset": 0,
                  "end_offset": 5,
                  "payload": "d29yZA=="
                }
              ]
            },
            "test": {
              "doc_freq": 2,
              "ttf": 4,
              "term_freq": 1,
              "tokens": [
                {
                  "position": 2,
                  "start_offset": 12,
                  "end_offset": 16,
                  "payload": "d29yZA=="
                }
              ]
            }
          }
        }
      }
    },
    {
      "_index": "my_index",
      "_type": "my_type",
      "_id": "1",
      "_version": 1,
      "found": true,
      "took": 0,
      "term_vectors": {
        "text": {
          "field_statistics": {
            "sum_doc_freq": 6,
            "doc_count": 2,
            "sum_ttf": 8
          },
          "terms": {
            "hello": {
              "term_freq": 1,
              "tokens": [
                {
                  "position": 0,
                  "start_offset": 0,
                  "end_offset": 5,
                  "payload": "d29yZA=="
                }
              ]
            },
            "test": {
              "term_freq": 3,
              "tokens": [
                {
                  "position": 1,
                  "start_offset": 6,
                  "end_offset": 10,
                  "payload": "d29yZA=="
                },
                {
                  "position": 2,
                  "start_offset": 11,
                  "end_offset": 15,
                  "payload": "d29yZA=="
                },
                {
                  "position": 3,
                  "start_offset": 16,
                  "end_offset": 20,
                  "payload": "d29yZA=="
                }
              ]
            }
          }
        }
      }
    }
  ]
}
```

其他的写法

```json
GET /my_index/_mtermvectors
{
   "docs": [
      {
         "_type": "test",
         "_id": "2",
         "fields": [
            "text"
         ],
         "term_statistics": true
      },
      {
         "_type": "test",
         "_id": "1"
      }
   ]
}

GET /my_index/my_type/_mtermvectors
{
   "docs": [
      {
         "_id": "2",
         "fields": [
            "text"
         ],
         "term_statistics": true
      },
      {
         "_id": "1"
      }
   ]
}

GET /_mtermvectors
{
   "docs": [
      {
         "_index": "my_index",
         "_type": "my_type",
         "doc" : {
            "fullname" : "Leo Li",
            "text" : "hello test test test"
         }
      },
      {
         "_index": "my_index",
         "_type": "my_type",
         "doc" : {
           "fullname" : "Leo Li",
           "text" : "other hello test ..."
         }
      }
   ]
}
```
