# bucket、metric 核心概念
[[toc]]

## bucket（桶）
表示一个数据分组，类似 mysql 中的 group

city  | name
--|--
北京  |  小李
北京  |  小王
上海  |  小张
上海  |  小丽
上海  |  小陈


基于如上数据，按 city 划分 buckets，划分出来两个bucket：

- 北京 bucket：包含了 2 个人，小李，小王
- 上海 bucket：包含了 3 个人，小张，小丽，小陈

按照某个字段进行 bucket 划分，那个字段的值相同的那些数据，就会被划分到一个 bucket 中



## metric
表示对一个数据分组执行的统计操作

当我们有了一堆 bucket 之后，就可以对每个 bucket 中的数据进行聚合分词了，

metric 就是对一个 bucket 执行的某种聚合分析的操作，比如说求平均值、求最大值、求最小值

使用如下 sql 来理解这两个概念

```sql
select count(*) from access_log group by user_id
```

- bucket：`group by user_id`，那些 user_id 相同的数据，就会被划分到一个 bucket 中
- metric：`count(*)`，对每个 user_id bucket 中所有的数据，计算一个数量
