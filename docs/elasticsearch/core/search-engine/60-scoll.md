# scoll 技术滚动搜索大量数据

如果一次性要查出来比如 10万条 数据，那么性能会很差，此时一般会采取用 scoll 滚动查询，一批一批的查，直到所有数据都查询完处理完

使用 scoll 滚动搜索，可以先搜索一批数据，然后下次再搜索一批数据，以此类推，直到搜索出全部的数据来

scoll 搜索会在第一次搜索的时候，保存一个当时的视图快照，之后只会基于该旧的视图快照提供数据搜索，如果这个期间数据变更，是不会让用户看到的

采用基于 `_doc`（这个是什么？） 进行排序的方式，性能较高

每次发送 scroll 请求，我们还需要指定一个 scoll 参数，指定一个时间窗口，每次搜索请求只要在这个时间窗口内能完成就可以了

```json{1}
GET /test_index/test_type/_search?scroll=1m
{
  "query": {
    "match_all": {}
  },
  "sort": [ "_doc" ],
  "size": 3
}
```

注意看第一次搜索返回的数据，一共有 8 条数据，第一次返回了 3 条

```json{2}
{
  "_scroll_id": "DnF1ZXJ5VGhlbkZldGNoAwAAAAAAACqyFnNFdkFsWXhGUkplNTk4bXJTRHdValEAAAAAAAAqsxZzRXZBbFl4RlJKZTU5OG1yU0R3VWpRAAAAAAAAKrQWc0V2QWxZeEZSSmU1OThtclNEd1VqUQ==",
  "took": 11,
  "timed_out": false,
  "_shards": {
    "total": 3,
    "successful": 3,
    "failed": 0
  },
  "hits": {
    "total": 8,
    "max_score": null,
    "hits": [
      {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "AWgPOqUAE8HO-7Ks86b7",
        "_score": null,
        "_source": {
          "test_content": "test test",
          "test_content2": "test test2"
        },
        "sort": [
          0
        ]
      },
      {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "AWgPGM7zE8HO-7Ks86bu",
        "_score": null,
        "_source": {
          "test_content": "test test"
        },
        "sort": [
          0
        ]
      },
      {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "10",
        "_score": null,
        "_source": {
          "test_field1": "test1",
          "test_field2": "updated test2"
        },
        "sort": [
          0
        ]
      }
    ]
  }
}
```

获得的结果会有一个 scoll_id，下一次再发送 scoll 请求的时候，必须带上这个 scoll_id

```json
GET /_search/scroll
{
    "scroll": "1m",
    "scroll_id" : "DnF1ZXJ5VGhlbkZldGNoAwAAAAAAACqyFnNFdkFsWXhGUkplNTk4bXJTRHdValEAAAAAAAAqsxZzRXZBbFl4RlJKZTU5OG1yU0R3VWpRAAAAAAAAKrQWc0V2QWxZeEZSSmU1OThtclNEd1VqUQ=="
}
```

::: tip
scroll 时间窗口不用每次都携带，貌似是每次都延长时间

scoll 看起来挺像分页的，但是其实使用场景不一样。

分页主要是用来一页一页搜索，给用户看的

scoll 主要是用来一批一批检索数据，让系统进行处理的
:::
