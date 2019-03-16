# dis_max 的 tie_breaker 作用

```json
GET /forum/article/_search
{
    "query": {
        "dis_max": {
            "queries": [
                { "match": { "title": "java beginner" }},
                { "match": { "body":  "java beginner" }}
            ],
            "tie_breaker": 0.3
        }
    }
}
```
用法如上，那么 tie_breaker 有什么作用呢？

如果你仔细观察使用 tie_breaker 和不使用查询出来的某一条数据的 `_score` 分数就能看出来了，
添加了之后会相应的提高。

dis_max 就是获取得分最高的那一个 query，这样就一刀切了，在某些情况下就会导致结果不是正确的；

- title 中包含 java ； matched query 有得分，假设是 1.1
- content 中包含 solution；matched query 有得分，假设是 1.2

添加了 tie_breaker = 0.3，那么就是这样的了， 1.1 * 0.3 + 1.2 = 1.53；

大于 dis_max 获取最高一条得分的 1.2，这样一来关联性就会上去了，也就会更合理一点
