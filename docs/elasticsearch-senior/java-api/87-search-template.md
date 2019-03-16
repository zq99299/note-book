# 基于 search template 实现按品牌分页查询模板
搜索模板的功能，java api 怎么去调用一个搜索模板

`elasticsearch-5.2.0\config\scripts\page-query-by-brand.mustache`

```javascript
{
  "from": {{from}},
  "size": {{size}},
  "query": {
    "match": {
      "brand.keyword": "{{brand}}"
    }
  }
}
```
::: tip
注意要重启 es，注意模板中的内容是你对应的。一定要确认不要搞错
:::

```java
@Test
   public void pageQueryTest() {
       HashMap<String, Object> scriptParams = new HashMap<>();
       scriptParams.put("from", 0);
       scriptParams.put("size", 1);
       scriptParams.put("brand", "宝马");

       SearchTemplateResponse searchTemplateResponse = new SearchTemplateRequestBuilder(client)
               .setScriptType(ScriptType.FILE)
               .setScript("page-query-by-brand")  // page-query-by-brand.mustache
               .setScriptParams(scriptParams)
               .setRequest(new SearchRequest("car_shop").types("sales"))
               .get();
       SearchResponse response = searchTemplateResponse.getResponse();
       System.out.println(searchTemplateResponse.getResponse());
       SearchHit[] hits = response.getHits().getHits();
       for (SearchHit hit : hits) {
           System.out.println(hit.getSourceAsString());
       }
       client.close();
   }
```

输出信息

```json
{"took":22,"timed_out":false,"_shards":{"total":5,"successful":5,"failed":0},"hits":{"total":2,"max_score":0.2876821,"hits":[{"_index":"car_shop","_type":"sales","_id":"4","_score":0.2876821,"_source":{
    "brand": "宝马",
    "name": "宝马320",
    "price": 320000,
    "produce_date": "2017-01-01",
    "sale_price": 280000,
    "sale_date": "2017-01-25"
}
}]}}
{
    "brand": "宝马",
    "name": "宝马320",
    "price": 320000,
    "produce_date": "2017-01-01",
    "sale_price": 280000,
    "sale_date": "2017-01-25"
}
```
