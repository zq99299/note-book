# range filter 范围过滤
[[toc]]

> 为帖子增加浏览量的字段数据

```json
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"view_cnt" : 30} }
{ "update": { "_id": "2"} }
{ "doc" : {"view_cnt" : 50} }
{ "update": { "_id": "3"} }
{ "doc" : {"view_cnt" : 100} }
{ "update": { "_id": "4"} }
{ "doc" : {"view_cnt" : 80} }
```

## 数值范围查询

> 搜索浏览量在 30~60 之间的帖子

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "view_cnt": {
            "gte": 30,
            "lte": 60
          }
        }
      }
    }
  }
}
```

- gt：大于
- lt：小于
- gte：大于等于
- lte：小于等于

## 日期范围查询

> 搜索发帖日期在最近 1个月 的帖子

由于该笔记是 2019.01.28 记录的，需要添加一条记录

```json
POST /forum/article/_bulk
{ "index": { "_id": 5 }}
{ "articleID" : "DHJK-B-1395-#Ky5", "userID" : 3, "hidden": false, "postDate": "2019-01-28", "tag": ["elasticsearch"], "tag_cnt": 1, "view_cnt": 10 }
```

最近一个月：也就是当前时间 - 30天，大于该时间即可

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "postDate": {
            "gte": "2018-01-01"
          }
        }
      }
    }
  }
}
```

上面这个时间是我们自己算的，es 支持动态语法

- now-30d：当前时间减去 30天
- 2019-01-30||-2d：下面例子来说 gte：

    大于 2019.01.30
    或者是大于 2019.01.30 -2 天 = 2019.01.28

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "postDate": {
            "gte": "2019-01-30||-2d"
          }
        }
      }
    }
  }
}
```

## 总结

- range，sql 中的 between，或者是 >=1，<=1
- range 做范围过滤
