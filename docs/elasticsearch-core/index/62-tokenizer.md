# 修改和定制分词器
[[toc]]

## 默认的分词器

下面只是描述，但是具体的 type 值是什么呢？

- standard tokenizer：以单词边界进行切分
- standard token filter：什么都不做
- lowercase token filter：将所有字母转换为小写
- stop token filer（默认被禁用）：移除停用词，比如a the it等等

## 修改分词器的设置

启用 english 停用词 token filter

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "es_std": {
          "type": "standard",
          "stopwords": "_english_"
        }
      }
    }
  }
}
```

> 测试标准分词效果

```json
GET /my_index/_analyze
{
  "analyzer": "standard",
  "text": "a dog is in the house"
}
````
响应

```json
{
  "tokens": [
    {
      "token": "a",
      "start_offset": 0,
      "end_offset": 1,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "dog",
      "start_offset": 2,
      "end_offset": 5,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "is",
      "start_offset": 6,
      "end_offset": 8,
      "type": "<ALPHANUM>",
      "position": 2
    },
    {
      "token": "in",
      "start_offset": 9,
      "end_offset": 11,
      "type": "<ALPHANUM>",
      "position": 3
    },
    {
      "token": "the",
      "start_offset": 12,
      "end_offset": 15,
      "type": "<ALPHANUM>",
      "position": 4
    },
    {
      "token": "house",
      "start_offset": 16,
      "end_offset": 21,
      "type": "<ALPHANUM>",
      "position": 5
    }
  ]
}
```

> 测试刚才启用的分词器

```json
GET /my_index/_analyze
{
  "analyzer": "es_std",
  "text":"a dog is in the house"
}
```
响应

```json
{
  "tokens": [
    {
      "token": "dog",
      "start_offset": 2,
      "end_offset": 5,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "house",
      "start_offset": 16,
      "end_offset": 21,
      "type": "<ALPHANUM>",
      "position": 5
    }
  ]
}
```

## 定制自己的分词器
::: tip
如果索引已经存在了，再次执行则会报错
:::

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "char_filter": {
        "&_to_and": {
          "type": "mapping",
          "mappings": ["&=> and"]
        }
      },
      "filter": {
        "my_stopwords": {
          "type": "stop",
          "stopwords": ["the", "a"]
        }
      },
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "char_filter": ["html_strip", "&_to_and"],
          "tokenizer": "standard",
          "filter": ["lowercase", "my_stopwords"]
        }
      }
    }
  }
}
```

- `&_to_and`: 将 & 转换为 and
- my_stopwords：把 the 和 a 定义为停用词
- my_analyzer.type：自定义
- my_analyzer.char_filter： 过滤 html 标签和使用我们刚才定义的 char filter
- my_analyzer.tokenizer：分词器使用标准分词器
- my_analyzer.filter 全部转换为小写、使用刚才自定义的停用词

> 测试自定义分词器

```json
GET /my_index/_analyze
{
  "text": "tom&jerry are a friend in the house, <a>, HAHA!!",
  "analyzer": "my_analyzer"
}
```

可以看到响应把刚才定义的都用上了

```json
{
  "tokens": [
    {
      "token": "tomandjerry",
      "start_offset": 0,
      "end_offset": 9,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "are",
      "start_offset": 10,
      "end_offset": 13,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "friend",
      "start_offset": 16,
      "end_offset": 22,
      "type": "<ALPHANUM>",
      "position": 3
    },
    {
      "token": "in",
      "start_offset": 23,
      "end_offset": 25,
      "type": "<ALPHANUM>",
      "position": 4
    },
    {
      "token": "house",
      "start_offset": 30,
      "end_offset": 35,
      "type": "<ALPHANUM>",
      "position": 6
    },
    {
      "token": "haha",
      "start_offset": 42,
      "end_offset": 46,
      "type": "<ALPHANUM>",
      "position": 7
    }
  ]
}
```

## 为字段指定自定义分词器
要注意,这个在前面已经说过了，只能新增字段设置，不能修改

```json
PUT /my_index/_mapping/my_type
{
  "properties": {
    "content": {
      "type": "text",
      "analyzer": "my_analyzer"
    }
  }
}
```
