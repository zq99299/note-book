# mget 批量查询 API
[[toc]]

## 批量查询的好处

就是一条一条的查询，比如说要查询 100条 数据，那么就要发送 100次 网络请求，这个开销还是很大的

如果进行批量查询的话，查询 100条 数据，就只要发送 1次 网络请求，网络请求的性能开销缩减 100倍

## 不同 index 下

```json
GET /_mget
{
   "docs" : [
      {
         "_index" : "test_index",
         "_type" :  "test_type",
         "_id" :    10
      },
      {
         "_index" : "test_index",
         "_type" :  "test_type",
         "_id" :    11
      }
   ]
}

------ 响应

{
  "docs": [
    {
      "_index": "test_index",
      "_type": "test_type",
      "_id": "10",
      "_version": 2,
      "found": true,
      "_source": {
        "test_field1": "test1",
        "test_field2": "updated test2"
      }
    },
    {
      "_index": "test_index",
      "_type": "test_type",
      "_id": "11",
      "_version": 3,
      "found": true,
      "_source": {
        "num": 2,
        "tags": []
      }
    }
  ]
}
```

## 是同一个 index 下

```json
GET /test_index/_mget
{
   "docs" : [
      {
         "_type" :  "test_type",
         "_id" :    10
      },
      {
         "_type" :  "test_type",
         "_id" :    11
      }
   ]
}
```

这里可以看出来了，在 api url 中是公共的，那么相同 type 下就可以这样写

```json
GET /test_index/test_type/_mget
{
   "docs" : [
      {
         "_id" :    10
      },
      {
         "_id" :    11
      }
   ]
}
```

但是这个可以简化成

```json
GET /test_index/test_type/_mget
{
   "ids":[10,11]
}
```

## mget 的重要性

可以说 mget 是很重要的，一般来说，在进行查询的时候，如果一次性要查询多条数据的话，那么一定要用 batch批量操作的 api

尽可能减少网络开销次数，可能可以将性能提升数倍，甚至数十倍，非常非常之重要
