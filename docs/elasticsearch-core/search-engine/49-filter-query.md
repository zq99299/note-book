# filter 与 query 深入对比解密：相关度、性能

## filter 与 query 示例

先来插入几条数据

```json
PUT /company/employee/2
{
  "address": {
    "country": "china",
    "province": "jiangsu",
    "city": "nanjing"
  },
  "name": "tom",
  "age": 30,
  "join_date": "2016-01-01"
}

PUT /company/employee/3
{
  "address": {
    "country": "china",
    "province": "shanxi",
    "city": "xian"
  },
  "name": "marry",
  "age": 35,
  "join_date": "2015-01-01"
}
```

搜索请求：年龄必须大于等于 30，同时 join_date 必须是 2016-01-01

```json
GET /company/employee/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "join_date": "2016-01-01"
          }
        }
      ],
      "filter": {
        "range": {
          "age": {
            "gte": 30
          }
        }
      }
    }
  }
}
```

上面这一个查询中 ，query 中有 filter，那么他们有什么不一样的呢？

## filter 与 query 对比大解密

- filter：仅仅只是按照搜索条件过滤出需要的数据而已，不计算任何相关度分数，对相关度没有任何影响
- query： 会去计算每个 document 相对于搜索条件的相关度，并按照相关度进行排序

::: tip
query 中除了 filter 的条件应该都会进行分数计算，而 filter 只是把数据过滤
:::

一般来说，如果你是在进行搜索，需要将最匹配搜索条件的数据先返回，那么用 query；

如果你只是要根据一些条件筛选出一部分数据，不关注其排序，那么用 filter；

除非是你的这些搜索条件，你希望越符合这些搜索条件的 document 越排在前面返回，那么这些搜索条件要放在 query 中；

如果你不希望一些搜索条件来影响你的 document 排序，那么就放在 filter 中即可

## filter 与 query 性能

- filter：不需要计算相关度分数，不需要按照相关度分数进行排序，同时还有内置的自动 cache 最常使用 filter 的数据
- query：相反，要计算相关度分数，按照分数进行排序，而且无法 cache 结果
