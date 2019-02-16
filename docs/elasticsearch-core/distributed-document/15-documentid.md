# 分布式文档-document id
[[toc]]

1. 手动指定 document id
2. 自动生成 document id

## 手动指定 document id

根据应用情况来说，是否满足手动指定document id的前提：

一般来说，是从某些其他的系统中，导入一些数据到es时，会采取这种方式，
就是使用系统中已有数据的唯一标识，作为 es 中 document 的 id。

举个例子，比如说，我们现在在开发一个电商网站，做搜索功能，或者是OA系统，做员工检索功能。
这个时候，数据首先会在网站系统或者 IT 系统内部的数据库中，会先有一份，
此时就肯定会有一个数据库的 primary key（自增长，UUID，或者是业务编号）。
如果将数据导入到 es 中，此时就比较适合采用数据在数据库中已有的 primary key。

如果说，我们是在做一个系统，这个系统主要的数据存储就是es一种，也就是说，
数据产生出来以后，可能就没有 id，直接就放 es 一个存储，那么这个时候，
可能就不太适合说手动指定 document id 的形式了，因为你也不知道id应该是什么，
此时可以采取下面要讲解的让 es 自动生成 id 的方式。

手动指定的语法就是前面用过的 put 方式

```json
PUT /test_index/test_type/1
{
  "test_content": "test test"
}
```

## 自动生成 document id

语法很简单，把 put 改成 post，不指定 id

```json
POST /test_index/test_type
{
  "test_content": "test test"
}

---------- 响应

{
  "_index": "test_index",
  "_type": "test_type",
  "_id": "AWgPGM7zE8HO-7Ks86bu",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": true
}
```

可以看到返回了一串很长的 id

自动生成的 ID 的特点：

1. 长度为 20 个字符
2. URL 安全：经过了 base64编码的 id，可以放在 url 中传递
3. GUID 方式，分布式系统并行生成时不可能发生冲突
