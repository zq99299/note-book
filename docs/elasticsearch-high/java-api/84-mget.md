# 基于 mget 实现多辆汽车的配置与价格对比


场景：一般来说，我们都可以在一些汽车网站上，或者在混合销售多个品牌的汽车 4S 店的内部，
都可以在系统里调出来多个汽车的信息，放在网页上，进行对比

mget：一次性将多个 document 的数据查询出来，也就是批量 id 获取

> 手动插入一条数据

```json
PUT /car_shop/cars/2
{
	"brand": "奔驰",
	"name": "奔驰C200",
	"price": 350000,
	"produce_date": "2017-01-05"
}

```

> mget 语法

```java
@Test
public void mget() {
    MultiGetResponse responses = client.prepareMultiGet()
            .add("car_shop", "cars", "1")
            .add("car_shop", "cars", "2")
            .get();
    responses.forEach(item -> {
                GetResponse response = item.getResponse();
                if (response.isExists()) {
                    System.out.println(response.getSourceAsString());
                }
            }
    );
}
```

响应结果

```json
{"brand":"宝马","name":"宝马320","price":310000,"produce_date":"2017-01-01"}
{
	"brand": "奔驰",
	"name": "奔驰C200",
	"price": 350000,
	"produce_date": "2017-01-05"
}
```

很奇怪的响应展示，用 java api 插入的没有格式化的 json 信息
