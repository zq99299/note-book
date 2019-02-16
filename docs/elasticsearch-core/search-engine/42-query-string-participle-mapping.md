# query string & mapping 遗留问题

## 什么是 query string
简单说：要搜索的文本内容就是 query string

比如我们有一个 document，其中有一个 field，包含的 value 是：hello you and me，建立倒排索引

我们要搜索这个 document 对应的 index，搜索文本是 hell me，这个搜索文本就是 query string

## query string 分词

对于 query string 的分词，默认情况下，es 会使用它对应的 field 建立倒排索引时相同的分词器去进行分词，分词和 normalization，只有这样，才能实现正确的搜索

我们建立倒排索引的时候，将 dogs --> dog，结果你搜索的时候，还是一个 dogs，那不就搜索不到了吗？所以搜索的时候，那个 dogs 也必须变成 dog 才行。才能搜索到。

知识点：不同类型的 field，可能有的就是 full text，有的就是 exact value

- query string 必须以和 index 建立时相同的 analyzer 进行分词（默认情况下）
- query string 对 exact value 和 full text 的区别对待

- date：exact value
- `_all`：full text

## mapping 遗留问题

[什么是 mapping ？](./38-mapping.md) 中查询出来的结果让人很分解，这里进行回答解析

### q=2017
**GET /_search?q=2017**

搜索的是 `_all field`，document 所有的 field 都会拼接成一个大串，进行分词

```json
"_source": {
    "post_date": "2017-01-02",
    "title": "my second article",
    "content": "this is my second article in this website",
    "author_id": 11400
}
```

拿上面这一条数据举例：被拼接成 `2017-01-02 my second article this is my second article in this website 11400`

回到 query string（查询的内容上来）,3 条数据对于时间的分词数据数据分布如下：

| -    | doc1 | doc2 | doc3 |
|------|------|------|------|
| 2017 | *    | *    | *    |
| 01   | *    |      |      |
| 02   |      | *    |      |
| 03   |      |      | *    |

在 `_all` 中搜索 2017，自然会搜索到 3个 docuemnt

### q=2017-01-01
**GET /_search?q=2017-01-01**

也搜索到了 3个 document，是因为该 query string 被分词成 2017、01、01 ，所以就搜索到了 3个；

对于这个结果还可以通过分数验证到部分问题：完全匹配的那一条数据得分是 1.05 ，其他的则是 0.8

```json
"hits": [
  {
    "_index": "website",
    "_type": "article",
    "_id": "1",
    "_score": 1.0566096,
    "_source": {
      "post_date": "2017-01-01",
      "title": "my first article",
      "content": "this is my first article in this website",
      "author_id": 11400
    }
  },
  {
    "_index": "website",
    "_type": "article",
    "_id": "2",
    "_score": 0.84013355,
    "_source": {
      "post_date": "2017-01-02",
      "title": "my second article",
      "content": "this is my second article in this website",
      "author_id": 11400
    }
  },
  {
    "_index": "website",
    "_type": "article",
    "_id": "3",
    "_score": 0.84013355,
    "_source": {
      "post_date": "2017-01-03",
      "title": "my third article",
      "content": "this is my third article in this website",
      "author_id": 11400
    }
  }
]
}
```

### q=post_date:2017-01-01
**GET /_search?q=post_date:2017-01-01**

该字段是 date类型， 会作为 exact value 去建立索引

| -          | doc1 | doc2 | doc3 |
|------------|------|------|------|
| 2017-01-01 | *    |      |      |
| 2017-01-02 |      | *    |      |
| 2017-01-03 |      |      | *    |

所以只能查询到一条数据

### q=post_date:2017

这个在这里不讲解，因为是 es 5.2 以后做的一个优化

可以查询几个条件看看结果

```json
// 下面都能查询到 2017-01-01 的数据
GET /website/article/_search?q=post_date:2017
GET /website/article/_search?q=post_date:2017-01

// 这个就查询不到数据了
GET /website/article/_search?q=post_date:01
```

## 测试分词器

通过以下语法可以看到给定文本的具体分词情况

```
GET /_analyze
{
  "analyzer": "standard",
  "text": "2017-01-01"
}
```

响应

```json
{
  "tokens": [
    {
      "token": "2017",
      "start_offset": 0,
      "end_offset": 4,
      "type": "<NUM>",
      "position": 0
    },
    {
      "token": "01",
      "start_offset": 5,
      "end_offset": 7,
      "type": "<NUM>",
      "position": 1
    },
    {
      "token": "01",
      "start_offset": 8,
      "end_offset": 10,
      "type": "<NUM>",
      "position": 2
    }
  ]
}
```
