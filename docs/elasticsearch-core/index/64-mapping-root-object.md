# mapping root object 深入剖析
[[toc]]

本章主要讲解 root object 下的东西 和 一些底层数据字段

## 什么是 root object？

就是某个 type 对应的 mapping json，包括了 properties，metadata`（_id，_source，_type），settings（analyzer），其他settings（比如include_in_all）`

如下高亮部分,“my_type” 这个一个大 json 就叫做 root object

```json{4,5,6}
PUT /my_index
{
  "mappings": {
    "my_type": {
      "properties": {}
    }
  }
}
```

## properties

- type：数据类型
- index：是否需要分词类型
- analyzer：分词器

```json
PUT /my_index/_mapping/my_type
{
  "properties": {
    "title": {
      "type": "text",
      "index": "analyzed",
      "analyzer": "standard"
    }
  }
}
```

## `_source`

```json
{
    "_index": "website",
    "_type": "article",
    "_id": "2",
    "_score": 1,
    "_source": {
      "title": "girst article",
      "content": "this is my second article",
      "post_date": "2017-01-01",
      "author_id": 110
    }
  },
```

查询出一个文档的时候，响应的数据中的 `_source`

> 好处

1. 查询的时候，直接可以拿到完整的 document，不需要先拿 document id，再发送一次请求拿 document
2. partial update 基于 `_source` 实现
3. reindex（零停机重建索引） 时，直接基于 `_source` 实现，不需要从数据库（或者其他外部存储）查询数据再修改
4. 可以基于 `_source` 定制返回 field
5. debug query 更容易，因为可以直接看到 `_source`

> 如果不需要以上好处可以禁用 `_source`

```json
PUT /my_index/_mapping/my_type2
{
  "_source": {"enabled": false}
}
```
插入一条数据

```json
PUT /my_index/my_type2/1
{
  "title": "girst article",
  "content": "this is my second article",
  "post_date": "2017-01-01",
  "author_id": 110
}
```
获取后查看响应的数据

```json
GET /my_index/my_type2/_search

---------------------------- 响应

{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 1,
    "hits": [
      {
        "_index": "my_index",
        "_type": "my_type2",
        "_id": "1",
        "_score": 1
      }
    ]
  }
}
```

可以看到返回的 `_score` 是一个 id

## `_all`

将所有 field 打包在一起，作为一个 `_all` field，建立索引。没指定任何 field 进行搜索时，就是使用 `_all` field在搜索。

> 默认开启，可以手动关闭

```json
PUT /my_index/_mapping/my_type3
{
  "_all": {"enabled": false}
}
```

也可以在 field 级别设置 include_in_all field，设置是否要将 field 的值包含在 `_all` field 中

```json
PUT /my_index/_mapping/my_type4
{
  "properties": {
    "my_field": {
      "type": "text",
      "include_in_all": false
    }
  }
}
```

## 标识性 metadata

- `_index`
- `_type`
- `_id`
