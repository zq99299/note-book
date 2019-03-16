# 通过数据冗余实现用户与博客的关联

第二种建模方式：用冗余数据，采用文档数据模型，进行数据建模，实现用户和博客的关联

冗余数据，就是说，将可能会进行搜索的条件和要搜索的数据，放在一个 doc 中
## 构造用户与博客数据

```json
DELETE website

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
  "userInfo": {
    "userId": 1,
    "username": "小鱼儿"
  }
}
```

## join 查询
搜索数据，需求：还是前面的需求，查找小鱼儿的所有博客

```json
GET /website/blogs/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "userInfo.username.keyword": "小鱼儿"
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
    "max_score": 1.2,
    "hits": [
      {
        "_index": "website",
        "_type": "blogs",
        "_id": "1",
        "_score": 1.2,
        "_source": {
          "title": "我的第一篇博客",
          "content": "这是我的第一篇博客，开通啦！！！",
          "userInfo": {
            "userId": 1,
            "username": "小鱼儿"
          }
        }
      }
    ]
  }
}
```

现在就不需要走应用层的 join：先搜一个数据，找到 id，再去搜另一份数据，
直接走一个有冗余数据的 type 即可，指定要的搜索条件，即可搜索出自己想要的数据来

## 文档型模型的优缺点

- 优点：性能高，不需要执行两次搜索
- 缺点：数据冗余，维护成本高

  每次如果你的 username 变化了，同时要更新 user type 和 blog type

一般来说，对于 es 这种 NoSQL 类型的数据存储来讲，都是冗余模式，
当然，你要去维护数据的关联关系，也是很有必要的，所以一旦出现冗余数据的修改，必须记得将所有关联的数据全部更新
