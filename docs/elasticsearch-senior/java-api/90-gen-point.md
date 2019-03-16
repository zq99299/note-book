# 基于地理位置对周围汽车 4S 店进行搜索

要进行地理位置的搜索需要添加两个依赖

```xml
<dependency>
    <groupId>org.locationtech.spatial4j</groupId>
    <artifactId>spatial4j</artifactId>
    <version>0.6</version>                        
</dependency>

<dependency>
    <groupId>com.vividsolutions</groupId>
    <artifactId>jts</artifactId>
    <version>1.13</version>                         
    <exclusions>
        <exclusion>
            <groupId>xerces</groupId>
            <artifactId>xercesImpl</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

or

```groovy
compile 'org.locationtech.spatial4j:spatial4j:0.6'
compile 'com.vividsolutions:jts:1.13'
```

比如我们有很多的 4s 店，给了用户一个 app，在某个地方的时候，可以根据当前的地理位置搜索一下，自己附近的 4s 店

新增一个 mapping

```json
POST /car_shop/_mapping/shops
{
  "properties": {
      "pin": {
          "properties": {
              "location": {
                  "type": "geo_point"
              }
          }
      }
  }
}
```

插入数据

```json
PUT /car_shop/shops/1
{
    "name": "上海至全宝马4S店",
    "pin" : {
        "location" : {
            "lat" : 40.12,
            "lon" : -71.34
        }
    }
}
```

> 需求：搜索两个坐标点组成的一个区域

来回顾下 restfull 语法

```json
GET /car_shop/shops/_search
{
  "query": {
    "geo_bounding_box": {
      "pin.location": {
        "top_left": {
          "lat": 42,
          "lon": -72
        },
        "bottom_right": {
          "lat": 40,
          "lon": -74
        }
      }
    }
  }
}
```
再对比下 java 语法

```java
@Test
public void geoBoundingBoxQuery() {
    GeoBoundingBoxQueryBuilder geoBoundingBoxQueryBuilder = QueryBuilders.geoBoundingBoxQuery("pin.location")
            .setCorners(40.73, -74.1, 40.01, -71.12);
    SearchResponse searchResponse = client.prepareSearch("car_shop")
            .setTypes("shops")
            .setQuery(geoBoundingBoxQueryBuilder)
            .get();
    System.out.println(searchResponse);
}
```

响应数据

```json
{"took":1,"timed_out":false,"_shards":{"total":5,"successful":5,"failed":0},"hits":{"total":1,"max_score":1.0,"hits":[{"_index":"car_shop","_type":"shops","_id":"1","_score":1.0,"_source":{
    "name": "上海至全宝马4S店",
    "pin" : {
        "location" : {
            "lat" : 40.12,
            "lon" : -71.34
        }
    }
}
}]}}
```

> 需求：指定一个区域，由三个坐标点，组成，比如上海大厦，东方明珠塔，上海火车站

```java
@Test
public void geoPolygonQuery() {
    ArrayList<GeoPoint> geoPoints = new ArrayList<>();
    geoPoints.add(new GeoPoint(40.73, -74.1));
    geoPoints.add(new GeoPoint(40.01, -71.12));
    geoPoints.add(new GeoPoint(50.56, -90.58));
    GeoPolygonQueryBuilder query = QueryBuilders.geoPolygonQuery("pin.location", geoPoints);
    SearchResponse searchResponse = client.prepareSearch("car_shop")
            .setTypes("shops")
            .setQuery(query)
            .get();
    System.out.println(searchResponse);
}
```

> 需求：搜索距离当前位置在 200 公里内的 4s 店

```java
@Test
public void geoDistanceQuery() {
    GeoDistanceQueryBuilder query = QueryBuilders.geoDistanceQuery("pin.location")
            .point(40, -70)
            .distance(200, DistanceUnit.KILOMETERS);
    SearchResponse searchResponse = client.prepareSearch("car_shop")
            .setTypes("shops")
            .setQuery(query)
            .get();
    System.out.println(searchResponse);
}
```
