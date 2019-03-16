# dis_max 实现 best fields 策略多字段搜索

> 增加 content 字段的测试数据

```json
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"content" : "i like to write best elasticsearch article"} }
{ "update": { "_id": "2"} }
{ "doc" : {"content" : "i think java is the best programming language"} }
{ "update": { "_id": "3"} }
{ "doc" : {"content" : "i am only an elasticsearch beginner"} }
{ "update": { "_id": "4"} }
{ "doc" : {"content" : "elasticsearch and hadoop are all very good solution, i am a beginner"} }
{ "update": { "_id": "5"} }
{ "doc" : {"content" : "spark is best big data solution based on scala ,an programming language similar to java"} }
```
## 问题产生

> 搜索 title 或 content 中包含 java 或 solution 的帖子

```json
GET /forum/article/_search
{
  "query": {
    "bool": {
      "should": [
        {"match": {
          "title": "java solution"
        }},
        {
          "match": {
            "content": "java solution"
          }
        }
      ]
    }
  }
}
```

获取其中两条数据来分析下为什么会这样？ 下面两条数据比较好描述

id 5 的 doc 中 content 包含了 solution 和 java，而 id 4 中只包含一个词语，应该是 id 5 得分高才对吧？

```
id=4，得分 0.7120095
"title": "this is java, elasticsearch, hadoop blog",
"content": "elasticsearch and hadoop are all very good solution, i am a beginner"

id=5，得分 0.56008905
"title": "this is spark blog",
"content": "spark is best big data solution based on scala ,an programming language similar to java"
```

这个就关系到 es 中的 should 得分计算规则有关系了。
大体的公式可以理解为这样：每个 query 得分相加 * matched query 数量 / 总 query 数量。

```
如 id 4 ：

- title 中包含 java ； matched query 有得分，假设是 1.1
- content 中包含 solution；matched query 有得分，假设是 1.2
- matched query 数量：就是有得分的 query 数量，这里为 2
- 总 query 数量：should 中的 query 个数，这里为 2

(1.1 + 1.2) * 2 / 2 = 2.3

id 4：

- title ：没有得分
- content 中包含 solution 和 java 有得分，假设是 2.3
- matched query 数量：就是有得分的 query 数量，这里为 1
- 总 query 数量：should 中的 query 个数，这里为 2

2.3 * 1 / 2 = 1.5
```

这里就看出来了，id 5 得分变低了

## best fields 策略 和 dis_max

- best fields 策略：某一个 field 中匹配到了尽可能多的关键词，得分就高
- dis_max 语法：直接取多个 query 中，分数最高的那一个 query 的分数即可

有这两项保证，就能得到我们想要的结果了

```json
GET /forum/article/_search
{
  "query": {
    "dis_max": {
      "queries": [
          {"match": {
          "title": "java solution"
        }},
        {
          "match": {
            "content": "java solution"
          }
        }
      ]
    }
  }
}
```
