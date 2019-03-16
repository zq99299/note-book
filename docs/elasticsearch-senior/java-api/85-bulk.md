# 基于 bulk 实现多 4S 店销售数据批量上传

业务场景：有一个汽车销售公司，拥有很多家 4S 店，这些 4S 店的数据，都会在一段时间内陆续传递过来，
汽车的销售数据，现在希望能够在内存中缓存比如 1000 条销售数据，然后一次性批量上传到 es 中去

> 先手动添加两条 **销售** 数据，是重复的，模拟是重复上传的数据

```json
PUT /car_shop/sales/1
{
    "brand": "宝马",
    "name": "宝马320",
    "price": 320000,
    "produce_date": "2017-01-01",
    "sale_price": 300000,
    "sale_date": "2017-01-21"
}

PUT /car_shop/sales/2
{
    "brand": "宝马",
    "name": "宝马320",
    "price": 320000,
    "produce_date": "2017-01-01",
    "sale_price": 300000,
    "sale_date": "2017-01-21"
}
```

> bulk 操作

```java
@Test
public void bulk() throws IOException {
    BulkRequestBuilder bulkRequestBuilder = client.prepareBulk();
    // 要增加一条销售数据
    bulkRequestBuilder
            .add(client.prepareIndex("car_shop", "sales", "3")
                    .setSource(XContentFactory.jsonBuilder()
                            .startObject()
                            .field("brand", "奔驰")
                            .field("name", "奔驰C200")
                            .field("price", 35_0000)
                            .field("produce_date", "2017-01-05") // 生产日期
                            .field("sale_price", 34_0000) // 销售价格
                            .field("sale_date", "2017-02-03") // 销售日期
                            .endObject()
                    )
            );
    // 修改一条数据的价格
    bulkRequestBuilder.add(client.prepareUpdate("car_shop", "sales", "1")
            .setDoc(XContentFactory.jsonBuilder()
                    .startObject()
                    .field("price", 29_0000)
                    .endObject())
    );
    // 删除一条数据，之前上传重复的数据
    bulkRequestBuilder.add(client.prepareDelete("car_shop", "sales", "2"));

    BulkResponse bulkItemResponses = bulkRequestBuilder.get();
    if (bulkItemResponses.hasFailures()) {
        System.out.println(bulkItemResponses.buildFailureMessage());
    }

    for (BulkItemResponse item : bulkItemResponses.getItems()) {
        System.out.println(item.getId() + " : " + item.getResponse().getResult());
    }
}
```

执行多次之后的打印结果

```json
3 : UPDATED
1 : NOOP
2 : NOT_FOUND
```
