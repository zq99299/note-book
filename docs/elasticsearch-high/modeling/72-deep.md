# 祖孙三层数据关系建模以及搜索实战
继续深层介绍父子数据模型之祖孙三层关系的数据建模和搜索

country -> rd_center -> employee 祖孙三层数据模型

> 手动 mapping

```json
PUT /company
{
  "mappings": {
    "country": {},
    "rd_center": {
      "_parent": {
        "type": "country"
      }
    },
    "employee": {
      "_parent": {
        "type": "rd_center"
      }
    }
  }
}

查看 mapping
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
      "country": {},
      "rd_center": {
        "_parent": {
          "type": "country"
        },
        "_routing": {
          "required": true
        }
      }
    }
  }
}
```

> 添加模拟数据

```json

POST /company/country/_bulk
{ "index": { "_id": "1" }}
{ "name": "中国" }
{ "index": { "_id": "2" }}
{ "name": "美国" }

POST /company/rd_center/_bulk
{ "index": { "_id": "1", "parent": "1" }}
{ "name": "北京研发总部" }
{ "index": { "_id": "2", "parent": "1" }}
{ "name": "上海研发中心" }
{ "index": { "_id": "3", "parent": "2" }}
{ "name": "硅谷人工智能实验室" }

PUT /company/employee/1?parent=1&routing=1
{
  "name":  "张三",
  "dob":   "1970-10-24",
  "hobby": "爬山"
}
```

这里需要详细解惑下 添加员工的时候指定了 routing 是为什么?

employee 的父是 rd_center，所以他的 `parent` 会按照 rd_center 去路由，
而 routing 指定 id 是 country 的

我个人是认为按 rd_center 的去路由没有什么不对，因为 rd_center 的父亲是 country，
所以他们三个一定会在同一个 shard 上。在语法上不指定 parent 也不会有问题，所以这里的 routing 应该可以不用指定

> 搜索有爬山爱好的员工所在的国家

```json

GET /company/country/_search
{
  "query": {
    "has_child": {
      "type": "rd_center",
      "query": {
        "has_child": {
          "type": "employee",
          "query": {
            "term": {
              "hobby.keyword": {
                "value": "爬山"
              }
            }
          }
        }
      }
    }
  }
}

响应结果

{
  "took": 3,
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
        "_type": "country",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "中国"
        }
      }
    ]
  }
}
```
