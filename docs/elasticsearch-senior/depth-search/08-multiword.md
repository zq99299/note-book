# 多关键词底层原理 term + bool

**普通 match 如何转换为 term + should？**

```json
{
    "match": { "title": "java elasticsearch"}
}
```

使用诸如上面的 match query 进行多值搜索的时候，es 会在底层自动将这个 match query 转换为 bool 的语法
bool should，指定多个搜索词，同时使用 term query

```json
{
  "bool": {
    "should": [
      { "term": { "title": "java" }},
      { "term": { "title": "elasticsearch"}}
    ]
  }
}
```

**and match 如何转换为 term + must？**
```json
{
    "match": {
        "title": {
            "query":    "java elasticsearch",
            "operator": "and"
        }
    }
}
转换为
{
  "bool": {
    "must": [
      { "term": { "title": "java" }},
      { "term": { "title": "elasticsearch"   }}
    ]
  }
}
```

**minimum_should_match 如何转换**

```json
{
    "match": {
        "title": {
            "query":                "java elasticsearch hadoop spark",
            "minimum_should_match": "75%"
        }
    }
}
转换为
{
  "bool": {
    "should": [
      { "term": { "title": "java" }},
      { "term": { "title": "elasticsearch"   }},
      { "term": { "title": "hadoop" }},
      { "term": { "title": "spark" }}
    ],
    "minimum_should_match": 3
  }
}
```

上一讲，为啥要讲解两种实现 multi-value 搜索的方式呢？实际上，就是给这一讲进行铺垫的。match query --> bool + term。
