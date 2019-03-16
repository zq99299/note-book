# multi_match 语法

例如这样一个查询，使用 dis_max 语法的

```json
GET /forum/article/_search
{
  "query": {
    "dis_max": {
      "queries":  [
        {
          "match": {
            "title": {
              "query": "java beginner",
              "minimum_should_match": "50%",
	            "boost": 2
            }
          }
        },
        {
          "match": {
            "content": {
              "query": "java beginner",
              "minimum_should_match": "30%"
            }
          }
        }
      ],
      "tie_breaker": 0.3
    }
  }
}
```

- dis_max：获取得分最高的一个 query 作为最终得分
- tie_breaker：综合其他 query 得分，也可以理解为一点权重的意思吧
- boost：权重
- minimum_should_match：去长尾

    什么意思呢？举个例子，查询 「java is good bee」，但是某些结果可能只包含了一个 java
    这样一来关联性就很低了，设置必须满足一定的个数才算匹配该条件，这个就是去长尾

上面这个可以使用 multi_match 语法来转化

```json{7}
GET /forum/article/_search
{
  "query": {
    "multi_match": {
        "query":                "java beginner",
        "type":                 "best_fields",
        "fields":               [ "title^2", "content" ],
        "tie_breaker":          0.3,
        "minimum_should_match": "50%"
    }
  }
}
```

- `title^2`：来表示 boots 
