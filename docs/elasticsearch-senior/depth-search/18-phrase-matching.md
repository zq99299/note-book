# match_phrase 短语匹配
[[toc]]

## 什么是短语匹配和近似匹配？

先来看一个搜索例子

添加两条数据
```json
PUT /forum/article/6
{
  "content":"java is my favourite programming language, and I also think spark is a very good big data system."
}

PUT /forum/article/7
{
  "content":"java spark are very related, because scala is spark's programming language and scala is also based on jvm like java."
}

PUT /forum/article/8
{
  "content":"java are spark very related, because scala is spark's programming language and scala is also based on jvm like java."
}
```

查询

```json
GET /forum/article/_search
{
  "query": {
      "match": {
        "content": "java spark"
      }
    }
  }
}
```
会看到这三条数据都返回来了，并且 id=7 的得分要高于 id=6 的。

假如要实现下面需求：

- java spark，就靠在一起，中间不能插入任何其他字符，就要搜索出来这种 doc
- java spark，但是要求，java 和 spark 两个单词靠的越近，doc 的分数越高，排名越靠前

使用 match 是搞不定的，match 只能搜索到包含 java 和 spark 的数据（因为会分词成两个词）

近似匹配包括以下两类，短语匹配也属于近似匹配，后续会看到（如 slop）

- phrase match 短语匹配：就是不分词，直接包含这个词的
- proximity match 近似匹配：靠得越近得分越高

## phrase match

```json
GET /forum/article/_search
{
  "query": {
      "match_phrase": {
        "content": "java spark"
      }
    }
  }
}
```

成功了，只有包含 java spark 这个短语的 doc 才返回了，只包含 java 的 doc 不会返回

## term position

什么是 term position？简单说就是分词后的词在原始 doc 中的顺序位置

通过下面的的语法可以查看到分词后的 position

```json
GET _analyze
{
  "text": "hello world, java spark",
  "analyzer": "standard"
}

GET _analyze
{
  "text": "hi, spark java",
  "analyzer": "standard"
}
```

其中一个返回

```json
{
  "tokens": [
    {
      "token": "hello",
      "start_offset": 0,
      "end_offset": 5,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "world",
      "start_offset": 6,
      "end_offset": 11,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "java",
      "start_offset": 13,
      "end_offset": 17,
      "type": "<ALPHANUM>",
      "position": 2
    },
    {
      "token": "spark",
      "start_offset": 18,
      "end_offset": 23,
      "type": "<ALPHANUM>",
      "position": 3
    }
  ]
}
```

## phrase match 基本原理

倒排索引中的 position 示例

```
hello world, java spark		doc1
hi, spark java				 doc2

--- 倒排索引示例，
hello   doc1(0)		
wolrd   doc1(1)
java    doc1(2) doc2(2)
spark   doc1(3) doc2(1)

java spark --> java 和 spark
match phrase 要求 doc 必须包含所有的关键词才符合第一步条件

--- 查询词在 doc 中的 position 示例
java -->  doc1(2) doc2(2)
spark --> doc1(3) doc2(1)
```

对于 match phrase 来说，spark 的 position > java 的 position 且必须大于 1 才能满足条件。因为刚好大于 1 的话，就能拼接成 java spark。

通过 position 的对比就能判定这个搜索是否是一个短语

这样看来，后面的 proximity match 原理也应该是这样！
