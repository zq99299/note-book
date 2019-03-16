# 对汽车品牌进行全文检索、精准查询和前缀搜索

为了查询，再插入一条数据

```json
PUT /car_shop/cars/5
{
    "brand": "华晨宝马",
    "name": "宝马318",
    "price": 270000,
    "produce_date": "2017-01-20"
}
```
```java
/**
 * 按品牌名搜索
 */
@Test
public void searchByBrand() {
    SearchResponse response = client.prepareSearch("car_shop")
            .setTypes("cars")
            .setQuery(QueryBuilders.matchQuery("brand", "宝马"))
            .get();
    System.out.println(response);
}

/**
 * 多字段搜索
 */
@Test
public void multiMatchQuery() {
    SearchResponse response = client.prepareSearch("car_shop")
            .setTypes("cars")
            .setQuery(QueryBuilders.multiMatchQuery("宝马", "brand", "name"))
            .get();
    System.out.println(response);
}

/**
 * terms 搜索
 */
@Test
public void commonTermsQuery() {
    SearchResponse response = client.prepareSearch("car_shop")
            .setTypes("cars")
            .setQuery(QueryBuilders.commonTermsQuery("name", "宝马320"))
            .get();
    System.out.println(response);
}

/**
 * 前缀搜索
 */
@Test
public void prefixQuery() {
    SearchResponse response = client.prepareSearch("car_shop")
            .setTypes("cars")
            .setQuery(QueryBuilders.prefixQuery("name", "宝"))
            .get();
    System.out.println(response);
}
```
