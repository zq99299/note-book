# 基于 completion suggest 实现搜索提示

## 什么是 completion suggest ？
suggest（提示）：completion suggest，常叫做自动完成（auto completion），
其他叫法搜索推荐、搜索提示

比如说我们在百度，搜索，你现在搜索“大话西游”，百度自动给你提示“大话西游电影”、“大话西游小说”、 “大话西游手游”，不用你把所有你想要输入的文本都输入完，搜索引擎会自动提示你可能是你想要搜索的那个文本

## es 提供的 completion suggest
语法如下
```json{10-13}
PUT /news_website
{
  "mappings": {
    "news" : {
      "properties" : {
        "title" : {
          "type": "text",
          "analyzer": "ik_max_word",
          "fields": {
            "suggest" : {
              "type" : "completion",
              "analyzer": "ik_max_word"
            }
          }
        },
        "content": {
          "type": "text",
          "analyzer": "ik_max_word"
        }
      }
    }
  }
}
```

> suggest.type=completion

一种用于前缀搜索的特殊数据结构，不是我们之前利用的倒排索引，会全部放在内存中，所以 auto completion 进行的前缀搜索提示，性能是非常高的

> 插入数据

```json
PUT /news_website/news/1
{
  "title": "大话西游电影",
  "content": "大话西游的电影时隔20年即将在2017年4月重映"
}
PUT /news_website/news/2
{
  "title": "大话西游小说",
  "content": "某知名网络小说作家已经完成了大话西游同名小说的出版"
}
PUT /news_website/news/3
{
  "title": "大话西游手游",
  "content": "网易游戏近日出品了大话西游经典IP的手游，正在火爆内测中"
}
```

> 搜索

```json
GET /news_website/news/_search
{
  "suggest": {
    "my-suggest" : {
      "prefix" : "大话西游",
      "completion" : {
        "field" : "title.suggest"
      }
    }
  }
}
```
响应数据

```json
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 0,
    "max_score": 0,
    "hits": []
  },
  "suggest": {
    "my-suggest": [
      {
        "text": "大话西游",
        "offset": 0,
        "length": 4,
        "options": [
          {
            "text": "大话西游小说",
            "_index": "news_website",
            "_type": "news",
            "_id": "2",
            "_score": 1,
            "_source": {
              "title": "大话西游小说",
              "content": "某知名网络小说作家已经完成了大话西游同名小说的出版"
            }
          },
          {
            "text": "大话西游手游",
            "_index": "news_website",
            "_type": "news",
            "_id": "3",
            "_score": 1,
            "_source": {
              "title": "大话西游手游",
              "content": "网易游戏近日出品了大话西游经典IP的手游，正在火爆内测中"
            }
          },
          {
            "text": "大话西游电影",
            "_index": "news_website",
            "_type": "news",
            "_id": "1",
            "_score": 1,
            "_source": {
              "title": "大话西游电影",
              "content": "大话西游的电影时隔20年即将在2017年4月重映"
            }
          }
        ]
      }
    ]
  }
}
```
