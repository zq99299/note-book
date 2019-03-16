# 基于 scroll 实现月度销售数据批量下载

比如说，现在要下载大批量的数据，导入到 excel 中，比如阅读、年度、销售记录等大批量数据，比如几千条、几万条、几十万条等

其实就要用到我们之前讲解的 es scroll api，对大量数据批量的获取和处理

再插入一条宝马的数据，现在就有两条宝马的数据记录了，分两次下载这两条数据

```json
PUT /car_shop/sales/4
{
    "brand": "宝马",
    "name": "宝马320",
    "price": 320000,
    "produce_date": "2017-01-01",
    "sale_price": 280000,
    "sale_date": "2017-01-25"
}
```

```java
@Test
   public void scrollTest() {
       SearchResponse searchResponse = client.prepareSearch("car_shop")
               .setTypes("sales")
               .setScroll(TimeValue.timeValueSeconds(60))
               .setQuery(QueryBuilders.termQuery("brand.keyword", "宝马"))
               .setSize(1)
               .get();

       do {
           for (SearchHit hit : searchResponse.getHits().getHits()) {
               System.out.println(hit.getSourceAsString());
           }

           searchResponse = client.prepareSearchScroll(searchResponse.getScrollId())
                   .setScroll(new TimeValue(60000))
                   .execute()
                   .actionGet();
       } while (searchResponse.getHits().getHits().length != 0);
   }
```
打印的数据

```json
{
    "brand": "宝马",
    "name": "宝马320",
    "price": 320000,
    "produce_date": "2017-01-01",
    "sale_price": 280000,
    "sale_date": "2017-01-25"
}

{"brand":"宝马","name":"宝马320","price":290000,"produce_date":"2017-01-01","sale_price":300000,"sale_date":"2017-01-21"}

```
