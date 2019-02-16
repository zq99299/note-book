# 什么是 mapping ？

插入几条数据，让 es 自动为我们建立一个索引

```json
PUT /website/article/1
{
  "post_date": "2017-01-01",
  "title": "my first article",
  "content": "this is my first article in this website",
  "author_id": 11400
}

PUT /website/article/2
{
  "post_date": "2017-01-02",
  "title": "my second article",
  "content": "this is my second article in this website",
  "author_id": 11400
}

PUT /website/article/3
{
  "post_date": "2017-01-03",
  "title": "my third article",
  "content": "this is my third article in this website",
  "author_id": 11400
}
```

尝试各种搜索

```json
3条结果
GET /website/article/_search?q=2017		

3条结果           
GET /website/article/_search?q=2017-01-01   

1条结果 	
GET /website/article/_search?q=post_date:2017-01-01   

1条结果
GET /website/article/_search?q=post_date:2017         	
```

这里就很奇怪了，仔细看要搜索的东西，前面两个未指定字段的都能搜索出来 3条数据，后面指定字段的，只能搜索出一条数据了。

就这很让人费解了。出现这样的结果，这就是 es 的 mapping 的效果

查看 es 自动建立的 mapping，带出什么是 mapping 的知识点

**自动或手动为 index 中的 type 建立的一种数据结构和相关配置，简称为 mapping**

dynamic mapping，自动为我们建立 index，创建 type，以及 type 对应的 mapping，mapping 中包含了每个 field 对应的数据类型，以及如何分词等设置

我们当然，后面会讲解，也可以手动在创建数据之前，先创建 index 和 type，以及 type 对应的 mapping

## 查看 mapping

`GET /website/_mapping/article`

```json
{
  "website": {
    "mappings": {
      "article": {
        "properties": {
          "author_id": {
            "type": "long"
          },
          "content": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "post_date": {
            "type": "date"
          },
          "title": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      }
    }
  }
}
```

可以看到 es 自动为每个字段都设置了不同的 data type。不同的 data type 的分词、搜索等行为是不一样的。所以出现了`_all` field 和 post_date field 的搜索表现完全不一样

至于里面的具体含义，本章节不会讲解
