# 对汽车品牌进行多种条件的组合搜索

```java
@Test
public void boolQueryTest() {
    BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery()
            .must(QueryBuilders.matchQuery("brand", "宝马"))
            .mustNot(QueryBuilders.termQuery("name.keyword", "宝马318"))
            .should(QueryBuilders.termQuery("produce_date", "2017-01-02"))
            .filter(QueryBuilders.rangeQuery("price").gt(280000).lt(350000));

    SearchResponse searchResponse = client.prepareSearch("car_shop")
            .setTypes("cars")
            .setQuery(boolQueryBuilder)
            .get();
    System.out.println(searchResponse);
}
```

响应数据

```json
{"took":7,"timed_out":false,"_shards":{"total":5,"successful":5,"failed":0},"hits":{"total":1,"max_score":0.18232156,"hits":[{"_index":"car_shop","_type":"cars","_id":"1","_score":0.18232156,"_source":{"brand":"宝马","name":"宝马320","price":310000,"produce_date":"2017-01-01"}}]}}
```
