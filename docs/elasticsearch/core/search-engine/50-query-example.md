# 常用的各种 query 搜索语法

本章节会记录以下章节的内容:

- 50. 初识搜索引擎_上机动手实战常用的各种 query 搜索语法
- 51. 初识搜索引擎_上机动手实战多搜索条件组合查询
- 52. 初识搜索引擎_上机动手实战如何定位不合法的搜索以及其原因
- 53. 初识搜素引擎_上机动手实战如何定制搜索结果的排序规则

[[toc]]

## match all

```json
GET /_search
{
    "query": {
        "match_all": {}
    }
}
```


## match
搜索所有 index 中 title 包含 my elasticsearch article 内容。

```json
GET /_search
{
    "query": { "match": { "title": "my elasticsearch article" }}
}
```

::: tip
记住：搜索的内容会默认会安装该字段的 mapping 进行分词匹配
:::

## multi match
一个查询文本在多个字段中匹配，其中一个字段中有则返回

```json
GET /test_index/test_type/_search
{
  "query": {
    "multi_match": {
      "query": "test",
      "fields": ["test_field", "test_field1"]
    }
  }
}
```

## range query
范围

```json
GET /company/employee/_search
{
  "query": {
    "range": {
      "age": {
        "gte": 30
      }
    }
  }
}
```

## term query

将搜索文本不分词查询。（记忆当中有一个操作选项可以让文本不分词，具体记不起来了）

```json
GET /test_index/test_type/_search
{
  "query": {
    "term": {
      "test_field": "test hello"
    }
  }
}
```

## terms query

多个词查询

```json
GET /_search
{
    "query": { "terms": { "tag": [ "search", "full_text", "nosql" ] }}
}
```


## exist query
::: tip
2.x中的查询，现在已经不提供了
:::

## bool 中可以放那些语法
bool 中可以放：must，must_not，should，filter

```json
{
    "bool": {
        "must":     { "match": { "title": "how to make millions" }},
        "must_not": { "match": { "tag":   "spam" }},
        "should": [
            { "match": { "tag": "starred" }}
        ],
        "filter": {
          "range": { "date": { "gte": "2014-01-01" }}
        }
    }
}
```

每个子查询都会计算一个 document 针对它的相关度分数，然后 bool 综合所有分数，合并为一个分数，当然 filter 是不会计算分数的

```json
{
    "bool": {
        "must":     { "match": { "title": "how to make millions" }},
        "must_not": { "match": { "tag":   "spam" }},
        "should": [
            { "match": { "tag": "starred" }}
        ],
        "filter": {
          "bool": {
              "must": [
                  { "range": { "date": { "gte": "2014-01-01" }}},
                  { "range": { "price": { "lte": 29.99 }}}
              ],
              "must_not": [
                  { "term": { "category": "ebooks" }}
              ]
          }
        }
    }
}
```

## 只想用 filter

上面说到 bool 中可以放：must，must_not，should，filter，但是不支持直接放 filter，
但是可以通过 constant_score（恒定分数，所有分数都是 1）来实现

```json

GET /company/employee/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "age": {
            "gte": 30
          }
        }
      }
    }
  }
}
```

## `_validate` & explain
验证语法是否正确，和查看计划/错误信息

比如以下查询：match 写成了 math

```json
GET /test_index/test_type/_validate/query?explain
{
  "query": {
    "math": {
      "test_field": "test"
    }
  }
}

------------------- 响应

{
  "valid": false,
  "error": "org.elasticsearch.common.ParsingException: no [query] registered for [math]"
}

------------------- 改正之后

{
  "valid": true,
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "explanations": [
    {
      "index": "test_index",
      "valid": true,
      "explanation": "+test_field:test #(#_type:test_type)"
    }
  ]
}
```


::: tip
explain 参数在验证失败的情况下，会返回错误消息；验证通过的情况下，会返回计划，如在哪个 index 上查询等信息

一般用在那种特别复杂庞大的搜索下，比如你一下子写了上百行的搜索，这个时候可以先用 validate api 去验证一下，搜索是否合法
:::

## 默认排序规则

默认情况下，是按照 `_score` 降序排序的

然而，某些情况下，可能没有有用的 `_score`，比如说 filter

```json
GET /_search
{
    "query" : {
        "bool" : {
            "filter" : {
                "term" : {
                    "author_id" : 1
                }
            }
        }
    }
}
```

当然，也可以是 constant_score

```json
GET /_search
{
    "query" : {
        "constant_score" : {
            "filter" : {
                "term" : {
                    "author_id" : 1
                }
            }
        }
    }
}
```

## 定制排序规则

按员工入职时间升序排列：

```json
GET /company/employee/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "age": {
            "gte": 30
          }
        }
      }
    }
  },
  "sort": [
    {
      "join_date": {
        "order": "asc"
      }
    }
  ]
}
```

::: tip
使用自定义排序后，`_score` 会变成 null
:::
