# term filter 搜索数据
[[toc]]

要搜索数据，必须得先有数据，所以接下来会先把模拟数据创建出来

## 创建帖子数据

根据 用户ID、是否隐藏、帖子ID、发帖日期来搜索帖子

> 插入一些测试帖子数据

```json
POST /forum/article/_bulk
{ "index": { "_id": 1 }}
{ "articleID" : "XHDK-A-1293-#fJ3", "userID" : 1, "hidden": false, "postDate": "2017-01-01" }
{ "index": { "_id": 2 }}
{ "articleID" : "KDKE-B-9947-#kL5", "userID" : 1, "hidden": false, "postDate": "2017-01-02" }
{ "index": { "_id": 3 }}
{ "articleID" : "JODL-X-1937-#pV7", "userID" : 2, "hidden": false, "postDate": "2017-01-01" }
{ "index": { "_id": 4 }}
{ "articleID" : "QQPX-R-3956-#aD8", "userID" : 2, "hidden": true, "postDate": "2017-01-02" }
```

初步来说，就先搞4个字段，因为整个 es 是支持 json document 格式的，所以说扩展性和灵活性非常之好。
如果后续随着业务需求的增加，要在 document 中增加更多的 field，那么我们可以很方便的随时添加field。

但是如果是在关系型数据库中，比如mysql，我们建立了一个表，现在要给表中新增一些 column，那就很坑爹了，
必须用复杂的修改表结构的语法去执行。而且可能对系统代码还有一定的影响。

> 查看 mappings

```json
GET /forum/_mapping/article

```

响应

```json{8-13}
{
  "forum": {
    "mappings": {
      "article": {
        "properties": {
          "articleID": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "hidden": {
            "type": "boolean"
          },
          "postDate": {
            "type": "date"
          },
          "userID": {
            "type": "long"
          }
        }
      }
    }
  }
}
```

> articleID.keyword 解释

在 5.2 版本起，type = text，默认会设置两个 field：

1. 原本的字段：articleID
2. 不分词的字段：keyword

    ignore_above：最多保留 256 个字符

> 可以通过 `_analyze` 来检测

```json
GET /forum/_analyze
{
  "field": "articleID.keyword",
  "text": "XHDK-A-1293-#fJ3"
}
```

响应

```json
{
  "error": {
    "root_cause": [
      {
        "type": "remote_transport_exception",
        "reason": "[sEvAlYx][127.0.0.1:9300][indices:admin/analyze[s]]"
      }
    ],
    "type": "illegal_argument_exception",
    "reason": "Can't process field [articleID.keyword], Analysis requests are only supported on tokenized fields"
  },
  "status": 400
}
```

## 使用 term 搜索

term：对搜索文本不分词，直接拿去倒排索引中匹配，你输入的是什么，就去匹配什么

这里就是把数据过滤出来，也不需要相关分数，可以使用 constant_score

> 根据用户ID搜索帖子

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "userID": 1
        }
      }
    }
  }
}
```

> 搜索没有隐藏的帖子

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "hidden": false
        }
      }
    }
  }
}
```

> 根据发帖日期搜索帖子

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "postDate": "2017-01-01"
        }
      }
    }
  }
}
```

> 根据帖子ID搜索帖子

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "articleID": "JODL-X-1937-#pV7"
        }
      }
    }
  }
}
```

会发现什么都搜不到

```json
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 0,
    "max_score": null,
    "hits": []
  }
}
```

这是因为，该字段是分词字段。查看分词

### 查看分词

```json
GET /forum/_analyze
{
  "field": "articleID",
  "text": "XHDK-A-1293-#fJ3"
}
```

响应

```json
{
  "tokens": [
    {
      "token": "xhdk",
      "start_offset": 0,
      "end_offset": 4,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "a",
      "start_offset": 5,
      "end_offset": 6,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "1293",
      "start_offset": 7,
      "end_offset": 11,
      "type": "<NUM>",
      "position": 2
    },
    {
      "token": "fj3",
      "start_offset": 13,
      "end_offset": 16,
      "type": "<ALPHANUM>",
      "position": 3
    }
  ]
}
```

可以看到在 articleID 存储中，已经是分词的了。所以我们使用 term 不分词的肯定是匹配不上的。

前面说了 text 字段会自动 mapping 一个 keyword 字段

articleID.keyword，是 es 最新版本内置建立的 field，就是不分词的。

所以一个 articleID 过来的时候，会建立两次索引，一次是自己本身，是要分词的，分词后放入倒排索引；
另外一次是基于 articleID.keyword，不分词，保留 256个 字符最多，直接一个字符串放入倒排索引中。

对于 text 类型的字段就可以考虑使用 filed.keyword 字段来搜索

```json{7}
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "articleID.keyword": "JODL-X-1937-#pV7"
        }
      }
    }
  }
}
```

结果是出来了，但是还有个问题，默认就保留 256个 字符。
所以尽可能还是自己去手动建立索引，指定 not_analyzed 吧。在最新版本的es中，不需要指定 not_analyzed 也可以，将 type=keyword 即可。

### 索引重建

```json{9,10}
DELETE /forum

PUT /forum
{
  "mappings": {
    "article":{
      "properties": {
        "articleID":{
          "type": "string",
          "index": "not_analyzed"
        }
      }
    }
  }
}
```

::: tip
注意 type ，如果是 text，就算指定了 index=not_analyzed 也还是会分词的。
:::

如上面这样指定之后，再次查看 mapping ，会发现被优化成了 keyword

```json
GET /forum/_mapping
```

响应

```json
{
  "forum": {
    "mappings": {
      "article": {
        "properties": {
          "articleID": {
            "type": "keyword"
          },
          "hidden": {
            "type": "boolean"
          },
          "postDate": {
            "type": "date"
          },
          "userID": {
            "type": "long"
          }
        }
      }
    }
  }
}
```

所以在创建索引的时候就可以直接使用 keyword 类型

```json{7}
PUT /forum
{
  "mappings": {
    "article":{
      "properties": {
        "articleID":{
          "type": "keyword"
        }
      }
    }
  }
}
```

插入测试数据之后再次搜索就可以了

## 知识总结

- term filter：根据 exact value 进行搜索，数字、boolean、date 天然支持
- text 需要建索引时指定为 not_analyzed，才能用 term query
- 相当于 SQL 中的单个 where 条件

    ```sql
    select *
    from forum.article
    where articleID='XHDK-A-1293-#fJ3'
    ```
