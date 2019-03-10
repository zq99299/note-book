# 深入剖析搜索结果的 highlight 高亮显示

## 一个最基本的高亮例子

手动 mapping 指定了 ik 分词器
```json
PUT /blog_website
{
  "mappings": {
    "blogs": {
      "properties": {
        "title": {
          "type": "text",
          "analyzer": "ik_max_word"
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
插入数据

```json
PUT /blog_website/blogs/1
{
  "title": "我的第一篇博客",
  "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
}
```

高亮搜索
```json
GET /blog_website/blogs/_search
{
  "query": {
    "match": {
      "title": "博客"
    }
  },
  "highlight": {
    "fields": {
      "title": {
      }
    }
  }
}
```
高亮搜索的返回结果
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
    "max_score": 0.28582606,
    "hits": [
      {
        "_index": "blog_website",
        "_type": "blogs",
        "_id": "1",
        "_score": 0.28582606,
        "_source": {
          "title": "我的第一篇博客",
          "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
        },
        "highlight": {
          "title": [
            "我的第一篇<em>博客</em>"
          ]
        }
      }
    ]
  }
}
```

`<em></em>` 表现，会变成红色，在网页中就表现出是高亮了

也可以多个搜索高亮，highlight 中的 field，必须跟 query 中的 field 一一对齐的

```json
GET /blog_website/blogs/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "title": "博客"
          }
        },
        {
          "match": {
            "content": "大家好 博客"
          }
        }
      ]
    }
  },
  "highlight": {
    "fields": {
      "title": {},
      "content": {}
    }
  }
}
```
响应结果

```json
{
  "took": 6,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 1.7438751,
    "hits": [
      {
        "_index": "blog_website",
        "_type": "blogs",
        "_id": "1",
        "_score": 1.7438751,
        "_source": {
          "title": "我的第一篇博客",
          "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
        },
        "highlight": {
          "title": [
            "我的第一篇<em>博客</em>"
          ],
          "content": [
            "<em>大家好</em>，这是我写的第一篇<em>博客</em>，特别喜欢这个<em>博客</em>网站！！！"
          ]
        }
      }
    ]
  }
}
```

## 三种 highlight 介绍

- plain highlight：lucene highlight 默认
- posting highlight：index_options=offsets 暂时不解释

  - 性能比 plain highlight 要高，因为不需要重新对高亮文本进行分词
  - 对磁盘的消耗更少
  - 将文本切割为句子，并且对句子进行高亮，效果更好

- fast vector highlight

## posting highlight

在 mapping 中配置
```json{13}
PUT /blog_website
{
  "mappings": {
    "blogs": {
      "properties": {
        "title": {
          "type": "text",
          "analyzer": "ik_max_word"
        },
        "content": {
          "type": "text",
          "analyzer": "ik_max_word",
          "index_options": "offsets"
        }
      }
    }
  }
}
```

插入数据

```json
PUT /blog_website/blogs/1
{
  "title": "我的第一篇博客",
  "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
}
```

搜索

```json

GET /blog_website/blogs/_search
{
  "query": {
    "match": {
      "content": "博客"
    }
  },
  "highlight": {
    "fields": {
      "content": {}
    }
  }
}
```

响应结果

```json
{
  "took": 86,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.37842745,
    "hits": [
      {
        "_index": "blog_website",
        "_type": "blogs",
        "_id": "1",
        "_score": 0.37842745,
        "_source": {
          "title": "我的第一篇博客",
          "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
        },
        "highlight": {
          "content": [
            "大家好，这是我写的第一篇<em>博客</em>，特别喜欢这个<em>博客</em>网站！！！"
          ]
        }
      }
    ]
  }
}
```

说实话，这个效果看不出来哪里有什么不一样。

## fast vector highlight

[index-time term vector](./73-ter-vector.md#index-time-term-vector-实验) 设置在 mapping 中，就会用 fast verctor highlight

手动 mapping 配置 term vector

```json
PUT /blog_website
{
  "mappings": {
    "blogs": {
      "properties": {
        "title": {
          "type": "text",
          "analyzer": "ik_max_word"
        },
        "content": {
          "type": "text",
          "analyzer": "ik_max_word",
          "term_vector" : "with_positions_offsets"
        }
      }
    }
  }
}
```
模拟数据还是上面的那一条，开始搜索

```json
GET /blog_website/blogs/_search
{
  "query": {
    "match": {
      "content": "博客"
    }
  },
  "highlight": {
    "fields": {
      "content":{}
    }
  }
}
```

对于返回结果来说表现都是一样的，主要在于性能方面，对大 field 而言（大于 1mb），性能更高


## 强制使用某种 highlighter
比如对于开启了 term vector 的 field 而言，可以强制使用 plain highlight

```json
GET /blog_website/blogs/_search
{
  "query": {
    "match": {
      "content": "博客"
    }
  },
  "highlight": {
    "fields": {
      "content":{
        "type":"plain"
      }
    }
  }
}
```

> 总结一下

其实可以根据你的实际情况去考虑

- 一般情况下，用 plain highlight 也就足够了，不需要做其他额外的设置
- 如果对高亮的性能要求很高，可以尝试启用 posting highlight
- 如果 field 的值特别大，超过了 1M，那么可以用 fast vector highlight

## 设置高亮 html 标签
可以根据需求自定义 html 高亮标签是什么，默认是 `<em>` 标签

```json
GET /blog_website/blogs/_search
{
  "query": {
    "match": {
      "content": "博客"
    }
  },
  "highlight": {
    "pre_tags": ["<tag1>"],
    "post_tags": ["</tag2>"],
    "fields": {
      "content": {
        "type": "plain"
      }
    }
  }
}

{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.37842745,
    "hits": [
      {
        "_index": "blog_website",
        "_type": "blogs",
        "_id": "1",
        "_score": 0.37842745,
        "_source": {
          "title": "我的第一篇博客",
          "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
        },
        "highlight": {
          "content": [
            "大家好，这是我写的第一篇<tag1>博客</tag2>，特别喜欢这个<tag1>博客</tag2>网站！！！"
          ]
        }
      }
    ]
  }
}
```

## 高亮片段 fragment 的设置
什么意思呢？比如下面这一个比较长的 content 内容，
之前我们看到的高亮本文基本上是返回的是 doc 中的具体文本内容，
其实不是这样的，默认会返回最多 100 个字符

```json
PUT /blog_website/blogs/1
{
  "title": "我的第一篇博客",
  "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
}
```

假设有 1 万个字符内容的话，你不会返回 1 万个字符把？这就是 fragment 的设置了，
限制返回内容的大小

```json
GET /blog_website/_search
{
  "query": {
    "match": {
      "content": "博客"
    }
  },
  "highlight": {
    "fields": {
      "content":{
        "fragment_size": 20,
        "number_of_fragments": 3
      }
    }
  }
}
```

- fragment_size：返回内容的大小，默认为 100，最小为 18
- number_of_fragments：返回的片段数量（按照 size 分割，可以想象成分页，返回几条数据）
- no_match_size：对于没有匹配到关键词的 doc，可以设置最多返回多少个字符的文本；这个不知道怎么演示出来

> 在 fast vector highlight 下的返回结果

```json
{
  "took": 4,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.57275015,
    "hits": [
      {
        "_index": "blog_website",
        "_type": "blogs",
        "_id": "1",
        "_score": 0.57275015,
        "_source": {
          "title": "我的第一篇博客",
          "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
        },
        "highlight": {
          "content": [
            "大家好，这是我写的第一篇<em>博客</em>，特别喜欢这个<em>博客</em>网站！！！",
            "的第一篇<em>博客</em>，特别喜欢这个<em>博客</em>网站！！！",
            "的第一篇<em>博客</em>，特别喜欢这个<em>博客</em>网站！！！"
          ]
        }
      }
    ]
  }
}
```

> 在 plain highlight 默认情况下返回的结果

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
    "total": 1,
    "max_score": 0.57275015,
    "hits": [
      {
        "_index": "blog_website",
        "_type": "blogs",
        "_id": "1",
        "_score": 0.57275015,
        "_source": {
          "title": "我的第一篇博客",
          "content": "大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！大家好，这是我写的第一篇博客，特别喜欢这个博客网站！！！"
        },
        "highlight": {
          "content": [
            "大家好，这是我写的第一篇<em>博客</em>，特别喜欢",
            "这个<em>博客</em>网站！！！大家好，这是我写",
            "的第一篇<em>博客</em>，特别喜欢这个<em>博客</em>网站！！！大家好"
          ]
        }
      }
    ]
  }
}
```

对比看一下，返回的高亮结果，在默认情况下可能会更容易理解，因为的确是按照分页显示的那种想法返回的。

后来又测试了下，调整 fragment_size 的大小，可以让返回的片段更符合要求
