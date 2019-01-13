# 相关度评分 TF&IDF 算法独家解密
[[toc]]

## 算法介绍

**relevance score（相关度得分）算法**：简单来说，就是计算出，一个索引中的文本，与搜索文本，他们之间的关联匹配程度

Elasticsearch 使用的是 term frequency/inverse document frequency 算法，简称为 **TF/IDF** 算法

TF/IDF 有以下三个组成


- Term frequency（词的频率）

    搜索文本中的各个词条在 field 文本中出现了多少次，**出现次数越多，就越相关**

    比如：搜索请求：hello world，肯定是 doc1 中得分高

    doc1：hello you, and world is very good
    doc2：hello, how are you

- Inverse document frequency

    搜索文本中的各个词条在整个索引的所有文档中出现了多少次，**出现的次数越多，就越不相关**

    比如：搜索请求：hello world ，hello 在 doc 2 中出现了两次，得分就会低

    doc1：hello world today is very good
    doc2：hello hello world is very good


- Field-length norm：

    field 长度，**field 越长，相关度越弱**

    比如：搜索请求：hello world

    doc1：{ "title": "hello article", "content": "babaaba 1万个单词" }
    doc2：{ "title": "my article hi world", "content": "blablabala 1万个单词" }

    hello world 在整个 index 中出现的次数是一样多的

    doc1更相关，title field更短

## 简单验证理论

先插入两条数据

```json
PUT /website/article/3
{
  "title": "first article aaa aaa bbb",
  "content": "this is my second article",
  "post_date": "2017-01-01",
  "author_id": 110
}

PUT /website/article/4
{
  "title": "girst article aaa bbb",
  "content": "this is my second article",
  "post_date": "2017-01-01",
  "author_id": 110
}
```

搜索 aaa bbb

```json
GET /website/article/_search
{
  "query": {
    "match": {
      "title": "aaa bbb"
    }
  }
}
```

可以看到如下的响应数据

```json
{
  "took": 7,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 1.219939,
    "hits": [
      {
        "_index": "website",
        "_type": "article",
        "_id": "4",
        "_score": 1.219939,
        "_source": {
          "title": "girst article aaa bbb",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        }
      },
      {
        "_index": "website",
        "_type": "article",
        "_id": "3",
        "_score": 0.67312354,
        "_source": {
          "title": "first article aaa aaa bbb",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        }
      }
    ]
  }
}
```

## explain 查看

通过 explain 关键字查看该数据是怎么得到的

```json
GET /website/article/_search?explain
{
  "query": {
    "match": {
      "title": "aaa bbb"
    }
  }
}
```

只有两条数据，但是响应的内容很多, 能从高亮的几行中看到：idf 和 tfNorm 的计算法方式等

```json{35,94,44,60}
{
  "took": 4,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 1.219939,
    "hits": [
      {
        "_shard": "[website][2]",
        "_node": "sEvAlYxFRJe598mrSDwUjQ",
        "_index": "website",
        "_type": "article",
        "_id": "4",
        "_score": 1.219939,
        "_source": {
          "title": "girst article aaa bbb",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        },
        "_explanation": {
          "value": 1.219939,
          "description": "sum of:",
          "details": [
            {
              "value": 1.219939,
              "description": "sum of:",
              "details": [
                {
                  "value": 0.6099695,
                  "description": "weight(title:aaa in 0) [PerFieldSimilarity], result of:",
                  "details": [
                    {
                      "value": 0.6099695,
                      "description": "score(doc=0,freq=1.0 = termFreq=1.0\n), product of:",
                      "details": [
                        {
                          "value": 0.6931472,
                          "description": "idf, computed as log(1 + (docCount - docFreq + 0.5) / (docFreq + 0.5)) from:",
                          "details": [
                            {
                              "value": 1,
                              "description": "docFreq",
                              "details": []
                            },
                            {
                              "value": 2,
                              "description": "docCount",
                              "details": []
                            }
                          ]
                        },
                        {
                          "value": 0.88,
                          "description": "tfNorm, computed as (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * fieldLength / avgFieldLength)) from:",
                          "details": [
                            {
                              "value": 1,
                              "description": "termFreq=1.0",
                              "details": []
                            },
                            {
                              "value": 1.2,
                              "description": "parameter k1",
                              "details": []
                            },
                            {
                              "value": 0.75,
                              "description": "parameter b",
                              "details": []
                            },
                            {
                              "value": 3,
                              "description": "avgFieldLength",
                              "details": []
                            },
                            {
                              "value": 4,
                              "description": "fieldLength",
                              "details": []
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "value": 0.6099695,
                  "description": "weight(title:bbb in 0) [PerFieldSimilarity], result of:",
                  "details": [
                    {
                      "value": 0.6099695,
                      "description": "score(doc=0,freq=1.0 = termFreq=1.0\n), product of:",
                      "details": [
                        {
                          "value": 0.6931472,
                          "description": "idf, computed as log(1 + (docCount - docFreq + 0.5) / (docFreq + 0.5)) from:",
                          "details": [
                            {
                              "value": 1,
                              "description": "docFreq",
                              "details": []
                            },
                            {
                              "value": 2,
                              "description": "docCount",
                              "details": []
                            }
                          ]
                        },
                        {
                          "value": 0.88,
                          "description": "tfNorm, computed as (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * fieldLength / avgFieldLength)) from:",
                          "details": [
                            {
                              "value": 1,
                              "description": "termFreq=1.0",
                              "details": []
                            },
                            {
                              "value": 1.2,
                              "description": "parameter k1",
                              "details": []
                            },
                            {
                              "value": 0.75,
                              "description": "parameter b",
                              "details": []
                            },
                            {
                              "value": 3,
                              "description": "avgFieldLength",
                              "details": []
                            },
                            {
                              "value": 4,
                              "description": "fieldLength",
                              "details": []
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "value": 0,
              "description": "match on required clause, product of:",
              "details": [
                {
                  "value": 0,
                  "description": "# clause",
                  "details": []
                },
                {
                  "value": 1,
                  "description": "*:*, product of:",
                  "details": [
                    {
                      "value": 1,
                      "description": "boost",
                      "details": []
                    },
                    {
                      "value": 1,
                      "description": "queryNorm",
                      "details": []
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "_shard": "[website][4]",
        "_node": "sEvAlYxFRJe598mrSDwUjQ",
        "_index": "website",
        "_type": "article",
        "_id": "3",
        "_score": 0.67312354,
        "_source": {
          "title": "first article aaa aaa bbb",
          "content": "this is my second article",
          "post_date": "2017-01-01",
          "author_id": 110
        },
        "_explanation": {
          "value": 0.67312354,
          "description": "sum of:",
          "details": [
            {
              "value": 0.67312354,
              "description": "sum of:",
              "details": [
                {
                  "value": 0.39063013,
                  "description": "weight(title:aaa in 0) [PerFieldSimilarity], result of:",
                  "details": [
                    {
                      "value": 0.39063013,
                      "description": "score(doc=0,freq=2.0 = termFreq=2.0\n), product of:",
                      "details": [
                        {
                          "value": 0.2876821,
                          "description": "idf, computed as log(1 + (docCount - docFreq + 0.5) / (docFreq + 0.5)) from:",
                          "details": [
                            {
                              "value": 1,
                              "description": "docFreq",
                              "details": []
                            },
                            {
                              "value": 1,
                              "description": "docCount",
                              "details": []
                            }
                          ]
                        },
                        {
                          "value": 1.3578535,
                          "description": "tfNorm, computed as (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * fieldLength / avgFieldLength)) from:",
                          "details": [
                            {
                              "value": 2,
                              "description": "termFreq=2.0",
                              "details": []
                            },
                            {
                              "value": 1.2,
                              "description": "parameter k1",
                              "details": []
                            },
                            {
                              "value": 0.75,
                              "description": "parameter b",
                              "details": []
                            },
                            {
                              "value": 5,
                              "description": "avgFieldLength",
                              "details": []
                            },
                            {
                              "value": 5.2244897,
                              "description": "fieldLength",
                              "details": []
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "value": 0.2824934,
                  "description": "weight(title:bbb in 0) [PerFieldSimilarity], result of:",
                  "details": [
                    {
                      "value": 0.2824934,
                      "description": "score(doc=0,freq=1.0 = termFreq=1.0\n), product of:",
                      "details": [
                        {
                          "value": 0.2876821,
                          "description": "idf, computed as log(1 + (docCount - docFreq + 0.5) / (docFreq + 0.5)) from:",
                          "details": [
                            {
                              "value": 1,
                              "description": "docFreq",
                              "details": []
                            },
                            {
                              "value": 1,
                              "description": "docCount",
                              "details": []
                            }
                          ]
                        },
                        {
                          "value": 0.9819638,
                          "description": "tfNorm, computed as (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * fieldLength / avgFieldLength)) from:",
                          "details": [
                            {
                              "value": 1,
                              "description": "termFreq=1.0",
                              "details": []
                            },
                            {
                              "value": 1.2,
                              "description": "parameter k1",
                              "details": []
                            },
                            {
                              "value": 0.75,
                              "description": "parameter b",
                              "details": []
                            },
                            {
                              "value": 5,
                              "description": "avgFieldLength",
                              "details": []
                            },
                            {
                              "value": 5.2244897,
                              "description": "fieldLength",
                              "details": []
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "value": 0,
              "description": "match on required clause, product of:",
              "details": [
                {
                  "value": 0,
                  "description": "# clause",
                  "details": []
                },
                {
                  "value": 1,
                  "description": "*:*, product of:",
                  "details": [
                    {
                      "value": 1,
                      "description": "boost",
                      "details": []
                    },
                    {
                      "value": 1,
                      "description": "queryNorm",
                      "details": []
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

::: tip
太复杂，只要知道大概是这么个东西就行了
:::


## 分析一个 document 是如何被匹配上的

可以使用 `_explain` 关键字，下面的语法只是在前面的搜索基础上取出某一个结果的分析，这里是 id=4 的 document

```json
GET /website/article/4/_explain
{
  "query": {
    "match": {
      "title": "aaa bbb"
    }
  }
}
```
