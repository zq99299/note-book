# 快速上手-集群健康检查、文档 CRUD
[[toc]]

1. document 数据格式
2. 电商网站商品管理案例：背景介绍
3. 简单的集群管理
4. 商品的 CRUD 操作（document CRUD 操作）

::: tip
快速上手的三章节，只是展示简单的使用 
:::

## document 数据格式

面向文档的搜索分析引擎

1. 应用系统的数据结构都是面向对象的、复杂的
2. 对象数据存储到数据库中，只能拆解开来，变为扁平的多张表，每次查询的时候还得还原回对象格式，相当麻烦
3. ES 是面向文档的，文档中存储的数据结构，与面向对象的数据结构是一样的，基于这种文档数据结构，es 可以提供复杂的索引，全文检索，分析聚合等功能
4. es 的 document 用 json 数据格式来表达

如下的一个场景，在 Java 中面向对象存入数据库的时候:

```java
public class Employee {

  private String email;
  private String firstName;
  private String lastName;
  private EmployeeInfo info;
  private Date joinDate;

}

private class EmployeeInfo {

  private String bio; // 性格
  private Integer age;
  private String[] interests; // 兴趣爱好

}

EmployeeInfo info = new EmployeeInfo();
info.setBio("curious and modest");
info.setAge(30);
info.setInterests(new String[]{"bike", "climb"});

Employee employee = new Employee();
employee.setEmail("zhangsan@sina.com");
employee.setFirstName("san");
employee.setLastName("zhang");
employee.setInfo(info);
employee.setJoinDate(new Date());
```

employee 对象：里面包含了 Employee 类自己的属性，还有一个 EmployeeInfo 对象

两张表：employee 表，employee_info 表，将 employee 对象的数据重新拆开来，变成 Employee 数据和 EmployeeInfo 数据

- employee表：email，first_name，last_name，join_date，4个字段
- employee_info表：bio，age，interests，3个字段；此外还有一个外键字段，比如employee_id，关联着employee表

而在 es 中的 document
```json
{
    "email":      "zhangsan@sina.com",
    "first_name": "san",
    "last_name": "zhang",
    "info": {
        "bio":         "curious and modest",
        "age":         30,
        "interests": [ "bike", "climb" ]
    },
    "join_date": "2017/01/01"
}
```

我们就明白了 es 的 document 数据格式和数据库的关系型数据格式的区别

## 电商网站商品管理案例背景介绍
::: tip
该实例纯粹是为了演示 es 的 crud 的基本操作
:::

现在考虑一个场景：有一个电商网站，需要为其基于 ES 构建一个后台系统，提供以下功能：

1. 对商品信息进行 CRUD（增删改查）操作
2. 执行简单的结构化查询
3. 可以执行简单的全文检索，以及复杂的 phrase（短语）检索
4. 对于全文检索的结果，可以进行高亮显示
5. 对数据进行简单的聚合分析

## 简单的集群管理

### 快速检查集群的健康状况
es 提供了一套api，叫做 cat api，可以查看 es 中各种各样的数据；

::: tip
看到是 restuful api 的链接基本上都是在 kibana 中操作查询
:::

`GET /_cat/health?v` 获取当前集群关键的信息，参与 v : 显示标题头

```
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1546235661 13:54:21  elasticsearch yellow          1         1      1   1    0    0        1             0                  -                 50.0%

-------------
unassign：未分配数量
active_shards_percent：可用 shards 百分比
```

如何快速了解集群的健康状况？可以通过 status 的值： green、yellow、red？

- green：每个索引的 primary shard 和 replica shard 都是 active 状态的
- yellow：每个索引的 primary shard 都是 active 状态的，但是部分 replica shard 不是 active 状态，处于不可用的状态
- red：不是所有索引的 primary shard 都是 active 状态的，部分索引有数据丢失了

**为什么现在会处于一个 yellow 状态？**

我们现在就一个笔记本电脑，就启动了一个 es 进程，相当于就只有一个 node。

现在 es 中有一个 index，就是 kibana 自己内置建立的 index。由于默认的配置是给每个 index 分配 5个 primary shard 和 5个 replica shard，而且 primary shard 和 replica shard 不能在同一台机器上（为了容错）。

现在 kibana 自己建立的 index 是 1个 primary shard 和 1个 replica shard。

当前就一个 node，所以只有 1个 primary shard 被分配了和启动了，但是一个 replica shard 没有第二台机器去启动。

**做一个小实验：** 此时只要启动第二个 es 进程，就会在 es 集群中有 2个 node，然后那 1个 replica shard 就会自动分配过去，然后 cluster status 就会变成 green 状态。

步骤：值需要再把压缩包解压一份，直接启动 bin/elasticsearch.bat 即可，关于端口，通过观察应该会自动生成端口，这一点做得很强大

```
第一个 es 启动后端口情况：
 publish_address {127.0.0.1:9300}, bound_addresses {127.0.0.1:9300}, {[::1]:9300}

第二个 es 启动后端口情况：
 publish_address {127.0.0.1:9301}, bound_addresses {127.0.0.1:9301}, {[::1]:9301}
```

再次查看集群信息： `GET /_cat/health?v`

```bash
只有一个 es 的信息
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1546235661 13:54:21  elasticsearch yellow          1         1      1   1    0    0        1             0                  -                 50.0%

启动第二个 es 后的信息
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1546236258 14:04:18  elasticsearch green           2         2      2   1    0    0        0             0                  -                100.0%

```

### 快速查看集群中有哪些索引

`GET /_cat/indices?v`

```
health status index   uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   .kibana id1SV_oGSjyGosKxeJApww   1   1          1            0      3.1kb          3.1kb
```

可以看到此时就只有一个 kibana 的索引，它的 primary shard(pri.store.size) 占用的大小是 3.1kb

### 简单的索引操作

创建索引 `PUT /test_index?pretty`；创建一个名为 test_index 的索引
```
{
  "acknowledged": true,
  "shards_acknowledged": true
}

------------- 再次查看索引 GET /_cat/indices?v

health status index      uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   test_index JXdbMWj8T9-Y0JWW5-M7fg   5   1          0            0       650b           650b
yellow open   .kibana    id1SV_oGSjyGosKxeJApww   1   1          1            0      3.1kb          3.1kb
```

可以看到 pri 默认是 5 个，rep 默认是 1 个

删除索引 `DELETE /test_index?pretty`

```
{
  "acknowledged": true
}
```

## 商品的 CRUD 操作
### 新增

这里没有使用中文，由于中文分词需要安装插件，对于数据查询才会准确，所以这里使用拼音

```json
PUT /ecommerce/product/1
{
    "name" : "gaolujie yagao",
    "desc" :  "gaoxiao meibai",
    "price" :  30,
    "producer" :      "gaolujie producer",
    "tags": [ "meibai", "fangzhu" ]
}

-------- 响应
// 可以看到 index 和 type 对应了 PUT 地址中的信息
{
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 1,
  "result": "updated",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": false
}
```

- `_version` ：数据版本号，用途一般是是乐观锁，后面会讲解
- `_shards` ：分片信息
  - total ：总的要写的分片数量是 2
  - successful ：成功了 1 个
  - failed ：失败了 0 个

这里为什么 total 是 2个？简单说：一个 pre 默认对应一个 rep 这里只有一台机器，所以 1 个 pre + rep 等于 2，
但是只有一台机器，rep 没有被分配，所以只成功了一个，总数是 2 个；反正这里有点懵逼，pre 和 rep 的分配策略什么的不知道，所以这里的数字有一点对不上，后面课程会讲解

再多增加几条数据

```json
PUT /ecommerce/product/2
{
    "name" : "jiajieshi yagao",
    "desc" :  "youxiao fangzhu",
    "price" :  25,
    "producer" :      "jiajieshi producer",
    "tags": [ "fangzhu" ]
}

PUT /ecommerce/product/3
{
    "name" : "zhonghua yagao",
    "desc" :  "caoben zhiwu",
    "price" :  40,
    "producer" :      "zhonghua producer",
    "tags": [ "qingxin" ]
}
```
es 会自动建立 index 和 type，不需要提前创建，而且 es 默认会对 document 每个 field 都建立倒排索引，让其可以被搜索

### 查询商品：检索文档

语法：`GET /index/type/id`


```json
`GET /ecommerce/product/1`

--------- 响应

{
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 1,
  "found": true,
  "_source": {
    "name": "gaolujie yagao",
    "desc": "gaoxiao meibai",
    "price": 30,
    "producer": "gaolujie producer",
    "tags": [
      "meibai",
      "fangzhu"
    ]
  }
}
```

### 修改商品：替换文档

```json
PUT /ecommerce/product/1
{
    "name" : "jiaqiangban gaolujie yagao",
    "desc" :  "gaoxiao meibai",
    "price" :  30,
    "producer" :      "gaolujie producer",
    "tags": [ "meibai", "fangzhu" ]
}

--------- 响应

{
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 2,
  "result": "updated",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": false
}
```

替换文档：顾名思义，原始 `_id` 中的所有 document 内容被覆盖;

### 修改商品：更新文档
```json
POST /ecommerce/product/1/_update
{
  "doc": {
    "name": "jiaqiangban gaolujie yagao"
  }
}

--------- 响应

{
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 8,
  "result": "updated",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  }
}
```

### 删除商品：删除文档

```json
DELETE /ecommerce/product/1

--------- 响应

{
  "found": true,
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 4,
  "result": "deleted",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  }
}

如果删除一个不存在的 id 文档将是

{
  "found": false,
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 7,
  "result": "not_found",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  }
}

_version ：每执行一次操作 version 都会自增一次
```
