# query string search 语法以及 `_all metadata`
[[toc]]

1. query string 基础语法
2. `_all` metadata 的原理和作用


包含 test_field 字段中包含 test 内容

```json

GET /test_index/test_type/_search?q=test_field:test

----------- 响应

"hits": {
  "total": 1,
  "max_score": 0.8835016,
  "hits": [
    {
      "_index": "test_index",
      "_type": "test_type",
      "_id": "7",
      "_score": 0.8835016,
      "_source": {
        "test_field": "test test"
      }
    }
  ]
}
}
```
```json
必须包含，与包含类似
GET /test_index/test_type/_search?q=+test_field:test

不包含 test 内容
GET /test_index/test_type/_search?q=-test_field:test
```

一个是掌握 q=field:search content 的语法，还有一个是掌握 + 和 - 的含义

::: tip
这个知道就行了，一般很少使用
:::

## `_all` metadata 的原理和作用

**什么是 `_all` metadata ？**

下面的搜索，没有指定具体的字段，也能返回数据，那么他返回的是什么呢？

```json
GET /test_index/test_type/_search?q=test
```

返回的数据是所有字段中包含 test 内容的数据。

我们在进行中搜索的时候，难道是对 document 中的每一个 field 都进行一次搜索吗？不是的

es中的 `_all` 元数据，在建立索引的时候，我们插入一条 document，它里面包含了多个 field，
此时，es 会自动将多个 field 的值，全部用字符串的方式串联起来，变成一个长的字符串，作为 `_all field` 的值，同时建立索引

后面如果在搜索的时候，没有对某个`field`指定搜索，就默认搜索 `_all field`，其中是包含了所有 `field` 的值的

举个例子

```json
{
  "name": "jack",
  "age": 26,
  "email": "jack@sina.com",
  "address": "guamgzhou"
}
```

"jack 26 jack@sina.com guangzhou"，作为这一条 document 的 `_all` field 的值，同时进行分词后建立对应的倒排索引

生产环境不使用
