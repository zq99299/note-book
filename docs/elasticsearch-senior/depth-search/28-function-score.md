# `function_score` 自定义相关度分数算法

我们可以做到自定义一个 function_score 函数，自己将某个 field 的值，
跟 es 内置算出来的分数进行运算，然后由自己指定的 field 来进行分数的增强

插入实验数据，给所有的帖子数据增加 follower（查看）数量

```json
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"follower_num" : 5} }
{ "update": { "_id": "2"} }
{ "doc" : {"follower_num" : 10} }
{ "update": { "_id": "3"} }
{ "doc" : {"follower_num" : 25} }
{ "update": { "_id": "4"} }
{ "doc" : {"follower_num" : 3} }
{ "update": { "_id": "5"} }
{ "doc" : {"follower_num" : 60} }
```

将对帖子搜索得到的分数，跟 follower_num 进行运算，由 follower_num 在一定程度上增强帖子的分数，
看帖子的人越多，那么帖子的分数就越高

```json
GET /forum/article/_search
{
  "query": {
    "function_score": {
      "query": {
        "multi_match": {
          "query": "java spark",
          "fields": ["title","content"]
        }
      },
      "field_value_factor": {
        "field": "follower_num",
        "modifier": "log1p",
        "factor": 1.2
      },
      "boost_mode": "sum",
      "max_boost": 1
    }
  }
}
```

::: tip
注意进行 field_value_factor 的 field 必须要在每条数据中存在，否则会报错

删除不存在的其他两条数据
DELETE /forum/article/6
DELETE /forum/article/7
:::

- modifier：

    默认是 none，这个时候得分 * 指定的 field。
    可以设置成 log1p，使用这个内置的函数，大致意思是：new_score = old_score * log(1 + number_of_votes)
- factor：

    进一步影响分数，new_score = old_score * log(1 + factor * number_of_votes)
- boost_mode:

    可以决定分数与指定字段的值如何计算，multiply、sum、min、max、replace
- max_boost：

    限制计算出来的分数不要超过 max_boost 指定的值
