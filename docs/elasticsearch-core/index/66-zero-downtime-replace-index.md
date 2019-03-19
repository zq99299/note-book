# scoll+bulk+ 索引别名实现零停机重建索引

> 零停机重建索引问题

在程序使用中使用了一个 my_index 的索引，但是该索引中的 text 字段类型为 date，现在想要改成 string，让客户端不停机的情况下完成这个需求

> 零停机重建索引思路

1. 前提客户端使用的索引是一个别名
2. 新建一个索引，把 text 字段建立成 string 类型
3. 使用 scoll api 批量查询出来
4. 使用 bulk api 批量插入到新索引中去
5. 移除别名中的旧索引，把新索引与别名相关联

::: tip
该思路，在视频中没有深入的解决这一需求的完整解决方案；

如：在后台重建数据这一个时间段内：

1. 万一文档中的数据有变化呢？
2. 旧索引中的文档信息怎么与新索引中的数据进行追平呢？
:::

所以基于上面不完善的解决方案，该笔记记录只记录关键步骤；

> 自动建立 mapping 是 date

```json
PUT /my_index/my_type/1
{
  "title": "2017-01-03"
}

{
  "my_index": {
    "mappings": {
      "my_type": {
        "properties": {
          "title": {
            "type": "date"
          }
        }
      }
    }
  }
}
```
> 当后期向索引中加入 string 类型的 title 值的时候，就会报错

```json
PUT /my_index/my_type/2
{
  "title": "my first article"
}

{
  "error": {
    "root_cause": [
      {
        "type": "mapper_parsing_exception",
        "reason": "failed to parse [title]"
      }
    ],
    "type": "mapper_parsing_exception",
    "reason": "failed to parse [title]",
    "caused_by": {
      "type": "illegal_argument_exception",
      "reason": "Invalid format: \"my first article\""
    }
  },
  "status": 400
}
```

> 如果此时想修改 title 的类型，是不可能的

```json
PUT /my_index/_mapping/my_type
{
  "properties": {
    "title": {
      "type": "text"
    }
  }
}

{
  "error": {
    "root_cause": [
      {
        "type": "illegal_argument_exception",
        "reason": "mapper [title] of different type, current_type [date], merged_type [text]"
      }
    ],
    "type": "illegal_argument_exception",
    "reason": "mapper [title] of different type, current_type [date], merged_type [text]"
  },
  "status": 400
}
```

此时，唯一的办法，就是进行 reindex，也就是说，重新建立一个索引，将旧索引的数据查询出来，再导入新索引

> 新建一个 index，调整其 title 的类型为 string

```json
PUT /my_index_new
{
  "mappings": {
    "my_type": {
      "properties": {
        "title": {
          "type": "text"
        }
      }
    }
  }
}
```

> 使用 scroll api 将数据批量查询出来

```json
GET /my_index/_search?scroll=1m
{
    "query": {
        "match_all": {}
    },
    "sort": ["_doc"],
    "size":  1
}

{
  "_scroll_id": "DnF1ZXJ5VGhlbkZldGNoBQAAAAAAADpAFjRvbnNUWVZaVGpHdklqOV9zcFd6MncAAAAAAAA6QRY0b25zVFlWWlRqR3ZJajlfc3BXejJ3AAAAAAAAOkIWNG9uc1RZVlpUakd2SWo5X3NwV3oydwAAAAAAADpDFjRvbnNUWVZaVGpHdklqOV9zcFd6MncAAAAAAAA6RBY0b25zVFlWWlRqR3ZJajlfc3BXejJ3",
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 3,
    "max_score": null,
    "hits": [
      {
        "_index": "my_index",
        "_type": "my_type",
        "_id": "2",
        "_score": null,
        "_source": {
          "title": "2017-01-02"
        },
        "sort": [
          0
        ]
      }
    ]
  }
}
```

> 采用 bulk api 将 scoll 查出来的一批数据，批量写入新索引

重复该步骤逻辑，将所有数据插入到新索引中

```json
POST /_bulk
{ "index":  { "_index": "my_index_new", "_type": "my_type", "_id": "2" }}
{ "title":    "2017-01-02" }
```

> 索引名切换

客户端使用索引的时候就需要一直使用 goods_index 索引了

```json
POST /_aliases
{
    "actions": [
        { "remove": { "index": "my_index", "alias": "goods_index" }},
        { "add":    { "index": "my_index_new", "alias": "goods_index" }}
    ]
}
```

直接通过 goods_index 别名来查询，是否 ok

```json
GET /goods_index/my_type/_search
```


这样思路可以再一开始就对索引添加别名使用，真实索引使用版本号来区分

```json
POST /_aliases
{
    "actions": [
        { "remove": { "index": "my_index_v1", "alias": "my_index" }},
        { "add":    { "index": "my_index_v2", "alias": "my_index" }}
    ]
}

```
