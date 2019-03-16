# 对文件系统进行数据建模以及文件搜索实战
本章主要讲解对文件路径的存储于搜索

## path_hierarchy analyzer
这个分词的作用是什么呢？直接看一个分词例子即可知道

```json
GET /_analyze
{
  "text": "H:/dev/note/note-book",
  "tokenizer": "path_hierarchy"
}


{
  "tokens": [
    {
      "token": "H:",
      "start_offset": 0,
      "end_offset": 2,
      "type": "word",
      "position": 0
    },
    {
      "token": "H:/dev",
      "start_offset": 0,
      "end_offset": 6,
      "type": "word",
      "position": 0
    },
    {
      "token": "H:/dev/note",
      "start_offset": 0,
      "end_offset": 11,
      "type": "word",
      "position": 0
    },
    {
      "token": "H:/dev/note/note-book",
      "start_offset": 0,
      "end_offset": 21,
      "type": "word",
      "position": 0
    }
  ]
}
```

## 数据构造
先 mappings，

fs: filesystem
```json
PUT /fs
{
  "settings": {
    "analysis": {
      "analyzer": {
        "paths":{
          "tokenizer": "path_hierarchy"
        }
      }
    }
  }
}

PUT /fs/_mapping/file
{
  "properties": {
    "name": {
      "type":  "keyword"
    },
    "path": {
      "type":  "keyword",
      "fields": {
        "tree": {
          "type":     "text",
          "analyzer": "paths"
        }
      }
    }
  }
}
```

插入数据

```json
PUT /fs/file/1
{
  "name":     "README.txt",
  "path":     "/workspace/projects/helloworld",
  "contents": "这是我的第一个 elasticsearch 程序"
}
```

## 搜索数据

需求：搜索文件内容包含 elasticsearch，且在 /workspace/projects 下的文件

```json
GET /fs/file/_search
{
  "query": {
   "bool": {
     "must": [
       {"match": {
         "contents": "elasticsearch"
       }}
     ],
     "filter": {
       "term": {
         "path.tree": "/workspace/projects"
       }
     }
   }
  }
}

GET /fs/file/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
           "contents": "elasticsearch"
        }},
        {
          "constant_score": {
            "filter": {
              "term": {
                "path.tree": "/workspace/projects"
              }
            }
          }
        }
      ]
    }
  }
}
```

上面是两种 filter 的用法，实现结果一致，不同的只是评分结果不一致

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
    "total": 1,
    "max_score": 1.284885,
    "hits": [
      {
        "_index": "fs",
        "_type": "file",
        "_id": "1",
        "_score": 1.284885,
        "_source": {
          "name": "README.txt",
          "path": "/workspace/projects/helloworld",
          "contents": "这是我的第一个 elasticsearch 程序"
        }
      }
    ]
  }
}
```
