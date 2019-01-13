# 快速上机动手实战 Query DSL 搜索语法

[[toc]]

## 一个例子让你明白什么是 Query DSL

之前说的 query string search（在 url 中拼接参数），这里在 body 中使用语法来查询

```json
GET /_search
{
    "query": {
        "match_all": {}
    }
}
```

## Query DSL 的基本语法

``` json
{
    QUERY_NAME: {
        ARGUMENT: VALUE,
        ARGUMENT: VALUE,...
    }
}

{
    QUERY_NAME: {
        FIELD_NAME: {
            ARGUMENT: VALUE,
            ARGUMENT: VALUE,...
        }
    }
}

```

示例：查询 test_field 字段中包含 test 的数据

```json
GET /test_index/test_type/_search
{
  "query": {
    "match": {
      "test_field": "test"
    }
  }
}
```

## 如何组合多个搜索条件

搜索需求：title 必须包含 elasticsearch、content 可以包含 elasticsearch 也可以不包含，author_id 必须不为 111

先插入三条数据

```json
PUT /website/article/1
{
  "title": "my hadoop article",
  "content": "hadoop is very bad",
  "author_id": 111
}

PUT /website/article/2
{
  "title": "my elasticsearch article",
  "content": "es is very bad",
   "author_id": 110
}


PUT /website/article/3
{
  "title": "my elasticsearch article",
  "content": "es is very goods",
  "author_id": 111
}
```

- title 必须包含 elasticsearch : 只有 2 和 3
- content 可以包含 elasticsearch 也可以不包含：那么 1,2,3 都满足
- author_id 必须不为 111 ：只有 2 满足

所以搜索结果就是 id 为 2 的文档

```json
GET /website/article/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
          "title": "elasticsearch"
          }
        }
      ],
      "should": [
        {"match": {
          "content": "elasticsearch"
          }
        }
      ],
      "must_not": [
        {"match": {
          "author_id": 111
          }
        }
      ]
    }
  }
}
```

- bool: 多可以条件
- must：必须
- match：匹配
- should：可能匹配，可以不匹配
- must_not：必须不

还有下面的例子，查询的是：

- name 必须包含 tom
- hired 可能为 true/false 并且 personality 为 good 且 rude 不为 true
- minimum_should_match ： 只要匹配到一条，但是这个应该是与 should 条件匹配的个数有关，具体是什么规则，没有尝试出来



总结起来： name 必须包含 tom 则就可以

```json
GET /test_index/_search
{
    "query": {
            "bool": {
                "must": { "match":   { "name": "tom" }},
                "should": [
                    { "match":       { "hired": true }},
                    { "bool": {
                        "must":      { "match": { "personality": "good" }},
                        "must_not":  { "match": { "rude": true }}
                    }}
                ],
                "minimum_should_match": 1
            }
    }
}
```
