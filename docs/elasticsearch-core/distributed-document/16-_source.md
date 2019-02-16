# `_souce` 元数据
[[toc]]

1. `_souce` 元数据
2. 定制返回结果字段


## `_souce` 元数据

添加一条数据

```json
PUT /test_index/test_type/1
{
  "test_content": "test test",
  "test_content2": "test test2"
}

```

获取这一条数据

```json
GET /test_index/test_type/1

-------- 响应

{
  "_index": "test_index",
  "_type": "test_type",
  "_id": "1",
  "_version": 2,
  "found": true,
  "_source": {
    "test_content": "test test",
    "test_content2": "test test2"
  }
}
```

其中响应的 `_source` 中的就是我们在新增数据的时候提交的数据



## 定制返回结果字段

```json
// 多个字段用逗号分隔，就能返回指定的字段了

GET /test_index/test_type/1?_source=test_content2,test_content
```

dsl 语法，只有一个字段的时候，可以直接写 `"_source": "test_content"`

```json
GET /test_index/test_type/_search
{
  "query": {
    "match": {
      "_id": "1"
    }
  },
  "_source": ["test_content","test_content2"]
}
```
