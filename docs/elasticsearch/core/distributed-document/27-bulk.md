# bulk 批量增删改

## 什么是 bulk？

简单说：就在提供了一个批量传递操作的入口，语法和各自的差不多

每一个操作要两个 json 串，语法如下：

```json
{"action": {"metadata"}}
{"data"}
```

举例，比如你现在要创建一个文档，放 bulk 里面，看起来会是这样子的：

```
{"index": {"_index": "test_index", "_type", "test_type", "_id": "1"}} // 唯一定位信息
{"test_field1": "test1", "test_field2": "test2"} // doc 文档内容
```

有哪些类型的操作可以执行呢？

1. delete：删除一个文档，只要 1个 json 串就可以了
2. create：`PUT /index/type/id/_create`，强制创建/存在则报错
3. index：普通的put操作，可以是创建文档，也可以是全量替换文档
4. update：执行的 partial update 操作

:::tip
bulk api 对 json 的语法，有严格的要求，每个 json 串不能换行，只能放一行，同时一个 json 串和一个 json 串之间，必须有一个换行；如果换行的话就会报错

```json
{
  "error": {
    "root_cause": [
      {
        "type": "json_parse_exception",
        "reason": "Unexpected end-of-input within/between Object entries\n at [Source: org.elasticsearch.transport.netty4.ByteBufStreamInput@2b0a4adc; line: 2, column: 40]"
      }
    ],
    "type": "json_parse_exception",
    "reason": "Unexpected end-of-input within/between Object entries\n at [Source: org.elasticsearch.transport.netty4.ByteBufStreamInput@2b0a4adc; line: 2, column: 40]"
  },
  "status": 500
}
```
:::

## 演练

```json
POST /_bulk
{ "delete": { "_index": "test_index", "_type": "test_type", "_id": "3" }}
{ "create": { "_index": "test_index", "_type": "test_type", "_id": "12" }}
{ "test_field":    "test12" }
{ "index":  { "_index": "test_index", "_type": "test_type", "_id": "2" }}
{ "test_field":    "replaced test2" }
{ "update": { "_index": "test_index", "_type": "test_type", "_id": "1", "_retry_on_conflict" : 3} }
{ "doc" : {"test_field2" : "bulk test1"} }
```

响应

```json
{
  "took": 471,
  "errors": true,
  "items": [
    {
      "delete": {
        "found": false,
        "_index": "test_index",
        "_type": "test_type",
        "_id": "3",
        "_version": 1,
        "result": "not_found",
        "_shards": {
          "total": 2,
          "successful": 1,
          "failed": 0
        },
        "status": 404
      }
    },
    {
      "create": {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "12",
        "_version": 1,
        "result": "created",
        "_shards": {
          "total": 2,
          "successful": 1,
          "failed": 0
        },
        "created": true,
        "status": 201
      }
    },
    {
      "index": {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "2",
        "_version": 1,
        "result": "created",
        "_shards": {
          "total": 2,
          "successful": 1,
          "failed": 0
        },
        "created": true,
        "status": 201
      }
    },
    {
      "update": {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "1",
        "status": 404,
        "error": {
          "type": "document_missing_exception",
          "reason": "[test_type][1]: document missing",
          "index_uuid": "g4RJx2v8TXK95LdwlhRx5A",
          "shard": "2",
          "index": "test_index"
        }
      }
    }
  ]
}
```

简写与 mget 类似

```json
POST /test_index/_bulk
{ "delete": { "_type": "test_type", "_id": "3" }}
{ "create": { "_type": "test_type", "_id": "12" }}
{ "test_field":    "test12" }
{ "index":  { "_type": "test_type" }}
{ "test_field":    "auto-generate id test" }
{ "index":  { "_type": "test_type", "_id": "2" }}
{ "test_field":    "replaced test2" }
{ "update": { "_type": "test_type", "_id": "1", "_retry_on_conflict" : 3} }
{ "doc" : {"test_field2" : "bulk test1"} }

POST /test_index/test_type/_bulk
{ "delete": { "_id": "3" }}
{ "create": { "_id": "12" }}
{ "test_field":    "test12" }
{ "index":  { }}
{ "test_field":    "auto-generate id test" }
{ "index":  { "_id": "2" }}
{ "test_field":    "replaced test2" }
{ "update": { "_id": "1", "_retry_on_conflict" : 3} }
{ "doc" : {"test_field2" : "bulk test1"} }
```

## bulk size 最佳大小

bulk request 会加载到内存里，如果太大的话，性能反而会下降，因此需要反复尝试一个最佳的 bulk size。一般从 1000~5000 条数据开始，尝试逐渐增加。另外，如果看大小的话，最好是在 5~15MB 之间。
