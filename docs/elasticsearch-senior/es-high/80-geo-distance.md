# geo_distance 实战搜索距离当前位置一定范围内的酒店
![](./assets/markdown-img-paste-20190312214618391.png)

之前讲解了在某一个范围内搜索，应用场景比如：上面的图，我指定 北京理工大学 和 新街口 这两个点，
要搜索这个范围内的酒店

geo_distance 是距离搜索，以一个点周围扩散的距离范围，比如我们平时使用的外卖 app、
旅游的时候搜索周边旅游景点，就是这种距离当前位置搜索

## 搜索酒店

```json
GET /hotel_app/hotels/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match_all": {}
        }
      ],
      "filter": {
        "geo_distance": {
          "distance": "200km",
          "pin.location": {
            "lat": 40,
            "lon": -70
          }
        }
      }
    }
  }
}
```

## 真实地理位置搜索学校
前面找了三个点，这里吧另外两个点添加进来

```json
PUT /hotel_app/hotels/6
{
    "name": "北京理工大学",
    "pin" : {
        "location" : {
            "lat": 39.967157,
            "lon": 116.322631
        }
    }
}

PUT /hotel_app/hotels/7
{
    "name": "新街口",
    "pin" : {
        "location" : {
           "lat": 39.947025,
            "lon": 116.373511
        }
    }
}
```

搜索

```json
GET /hotel_app/hotels/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match_all": {}
        }
      ],
      "filter": {
        "geo_distance": {
          "distance": "2500m",
          "pin.location": {
            "lat" : 39.957866,
            "lon" : 116.349652
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
        "_index": "hotel_app",
        "_type": "hotels",
        "_id": "5",
        "_score": 1,
        "_source": {
          "name": "北京交通大学",
          "pin": {
            "location": {
              "lat": 39.957866,
              "lon": 116.349652
            }
          }
        }
      },
      {
        "_index": "hotel_app",
        "_type": "hotels",
        "_id": "7",
        "_score": 1,
        "_source": {
          "name": "新街口",
          "pin": {
            "location": {
              "lat": 39.947025,
              "lon": 116.373511
            }
          }
        }
      }
    ]
  }
}
```

可以看到，2500 米内能找到新接口，我尝试过 3 km 的时候能把 北京理工大学 搜索出来
