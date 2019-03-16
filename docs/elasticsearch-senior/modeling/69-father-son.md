# 研发中心管理案例以及父子关系数据建模
nested object 的建模，有个不好的地方，就是采取的是类似冗余数据的方式，将多个数据都放在一起了，维护成本就比较高

对于父子关系建模之前讲到过可以使用程序 join 来解决，但是性能相对差很多，因为需要拉取很多数据

es 提供了一种方案，父子关系元数据映射，用于确保查询时候的高性能,该方案的关键点是：**父子数据必须存在于一个 shard 中**

父子关系数据存在一个 shard 中，而且还有映射其关联关系的元数据，那么搜索父子关系数据的时候，不用跨分片，一个分片本地自己就搞定了，性能当然高咯

使用一个案例背景来演示这些功能。

案例背景：研发中心员工管理案例，一个 IT 公司有多个研发中心，每个研发中心有多个员工

> 父子关系建立

```json
PUT /company
{
  "mappings": {
    "rd_center": {},
    "employee": {
      "_parent": {
        "type": "rd_center"
      }
    }
  }
}
```

员工的父亲通过 `_parent` 指定为 研发中心

查看他的 mapping 结构，会发现和 routing 有关系

```json
GET /company/_mapping


{
  "company": {
    "mappings": {
      "employee": {
        "_parent": {
          "type": "rd_center"
        },
        "_routing": {
          "required": true
        }
      },
      "rd_center": {}
    }
  }
}
```

> 增加模拟数据

增加父数据

```json
POST /company/rd_center/_bulk
{ "index": { "_id": "1" }}
{ "name": "北京研发总部", "city": "北京", "country": "中国" }
{ "index": { "_id": "2" }}
{ "name": "上海研发中心", "city": "上海", "country": "中国" }
{ "index": { "_id": "3" }}
{ "name": "硅谷人工智能实验室", "city": "硅谷", "country": "美国" }
```

增加子数据

```json
PUT /company/employee/1?parent=1
{
  "name":  "张三",
  "birthday":   "1970-10-24",
  "hobby": "爬山"
}
```

父子关系的关联是通过 `parent` 参数来指定的，这里就把 「张三」 和 「北京研发总」部关联了起来

如果不指定 parent，那么该条数据会通过 doc id 路由到某一个 shard 中去，指定了则按照 parent id 所在的 shard 路由

批量插入子数据

```json
POST /company/employee/_bulk
{ "index": { "_id": 2, "parent": "1" }}
{ "name": "李四", "birthday": "1982-05-16", "hobby": "游泳" }
{ "index": { "_id": 3, "parent": "2" }}
{ "name": "王二", "birthday": "1979-04-01", "hobby": "爬山" }
{ "index": { "_id": 4, "parent": "3" }}
{ "name": "赵五", "birthday": "1987-05-11", "hobby": "骑马" }
```
