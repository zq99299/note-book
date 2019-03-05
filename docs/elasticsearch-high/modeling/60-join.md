# 通过应用层 join 实现用户与博客的关联

## 案例介绍
案例背景：博客网站， 我们会模拟各种用户发表各种博客，然后针对用户和博客之间的关系进行数据建模，
同时针对建模好的数据执行各种搜索/聚合的操作

先使用关系型的思维来构造数据：在构造数据模型的时候，还是将有关联关系的数据，然后分割为不同的实体，类似于关系型数据库中的模型
## 构造用户与博客数据

```json
PUT /website/users/1
{
  "name": "小鱼儿",
  "email": "xiaoyuer@sina.com",
  "birthday": "1980-01-01"
}

PUT /website/blogs/1
{
  "title": "我的第一篇博客",
  "content": "这是我的第一篇博客，开通啦！！！",
  "userId": 1
}

```

一个用户对应多个博客，一对多的关系，做了建模，
建模方式为分割实体，类似三范式的方式，用主外键关联关系，将多个实体关联起来

## join 查询

需求：搜索到小鱼儿的所有博客

先搜索到小鱼儿的 userId
```json
GET /website/users/_search
{
  "query": {
    "term": {
      "name.keyword": "小鱼儿"
    }
  }
}

{
  "took": 129,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "website",
        "_type": "users",
        "_id": "1",
        "_score": 0.2876821,
        "_source": {
          "name": "小鱼儿",
          "email": "xiaoyuer@sina.com",
          "birthday": "1980-01-01"
        }
      }
    ]
  }
}
```

再根据 userId 搜索小鱼儿的所有博客

```json
GET /website/blogs/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "userId": 1
        }
      }
    }
  }
}

{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 1,
    "hits": [
      {
        "_index": "website",
        "_type": "blogs",
        "_id": "1",
        "_score": 1,
        "_source": {
          "title": "我的第一篇博客",
          "content": "这是我的第一篇博客，开通啦！！！",
          "userId": 1
        }
      }
    ]
  }
}
```

上面的操作，就属于应用层的 join，在应用层先查出一份数据，然后再查出一份数据，进行关联;

试想一下，如果是批量查询，那么需要返回第一次的结果，然后再拿这一大批数据去搜索，性能上相对来说有点差了

## 关系型模型的优缺点
- 优点：数据不冗余，维护方便
- 缺点：应用层 join，如果关联数据过多，导致查询过大，性能很差
