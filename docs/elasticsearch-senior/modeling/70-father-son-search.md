# 根据员工信息和研发中心互相搜索父子数据
我们已经建立了父子关系的数据模型之后，就要基于这个模型进行各种搜索和聚合了

> 搜索有 1980 年以后出生的员工的研发中心

```json
GET /company/rd_center/_search
{
  "query": {
    "has_child": {
      "type": "employee",
      "query": {
        "range": {
          "birthday": {
            "gte": "1980-01-01"
          }
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
    "total": 2,
    "max_score": 1,
    "hits": [
      {
        "_index": "company",
        "_type": "rd_center",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "北京研发总部",
          "city": "北京",
          "country": "中国"
        }
      },
      {
        "_index": "company",
        "_type": "rd_center",
        "_id": "3",
        "_score": 1,
        "_source": {
          "name": "硅谷人工智能实验室",
          "city": "硅谷",
          "country": "美国"
        }
      }
    ]
  }
}
```

> 搜索有名叫张三的员工的研发中心

```json
GET /company/rd_center/_search
{
  "query": {
    "has_child": {
      "type": "employee",
      "query": {
        "term": {
          "name.keyword": "张三"
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
        "_index": "company",
        "_type": "rd_center",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "北京研发总部",
          "city": "北京",
          "country": "中国"
        }
      }
    ]
  }
}
```

> 搜索有至少 2 个以上员工的研发中心

```json
GET /company/rd_center/_search
{
  "query": {
    "has_child": {
      "type": "employee",
      "min_children": 2,
      "query": {
        "match_all": {}
      }
    }
  }
}


{
  "took": 4,
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
        "_index": "company",
        "_type": "rd_center",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "北京研发总部",
          "city": "北京",
          "country": "中国"
        }
      }
    ]
  }
}
```

> 搜索在中国的研发中心的员工

```json
GET /company/employee/_search
{
  "query": {
    "has_parent": {
      "parent_type": "rd_center",
      "query": {
        "term": {
          "country.keyword": "中国"
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
    "total": 3,
    "max_score": 1,
    "hits": [
      {
        "_index": "company",
        "_type": "employee",
        "_id": "3",
        "_score": 1,
        "_routing": "2",
        "_parent": "2",
        "_source": {
          "name": "王二",
          "birthday": "1979-04-01",
          "hobby": "爬山"
        }
      },
      {
        "_index": "company",
        "_type": "employee",
        "_id": "1",
        "_score": 1,
        "_routing": "1",
        "_parent": "1",
        "_source": {
          "name": "张三",
          "birthday": "1970-10-24",
          "hobby": "爬山"
        }
      },
      {
        "_index": "company",
        "_type": "employee",
        "_id": "2",
        "_score": 1,
        "_routing": "1",
        "_parent": "1",
        "_source": {
          "name": "李四",
          "birthday": "1982-05-16",
          "hobby": "游泳"
        }
      }
    ]
  }
}
```

## 总结

- 在子中查询父中的字段使用 has_parent
- 在父中查询子中的字段使用 has_child
