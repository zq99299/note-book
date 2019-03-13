# 基于 upsert 实现汽车最新价格的调整

::: tip
[es api 的练习代码仓库地址](https://github.com/zq99299/newstudy/tree/master/elasticsearch/src/test/java/cn/mrcode/newstudy/elasticsearch)

后面的练习代码都放在这个地址
:::

首先需要手动 mapping，既然是模拟就稍微模拟真实一点。

```json
PUT /car_shop
{
    "mappings": {
        "cars": {
            "properties": {
                "brand": {
                    "type": "text",
                    "analyzer": "ik_max_word",
                    "fields": {
                        "raw": {
                            "type": "keyword"
                        }
                    }
                },
                "name": {
                    "type": "text",
                    "analyzer": "ik_max_word",
                    "fields": {
                        "raw": {
                            "type": "keyword"
                        }
                    }
                }
            }
        }
    }
}
```

- brand：品牌名称，ik 中文分词，内置一个 raw 不分词字段
- name：汽车名称，同上

## upsert api
```java
package cn.mrcode.newstudy.elasticsearch.senior;

import org.elasticsearch.action.ActionFuture;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.action.update.UpdateResponse;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.common.xcontent.XContentFactory;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.concurrent.ExecutionException;


/**
 * upsert 调整汽车价格
 *
 * @author : zhuqiang
 * @date : 2019/3/13 22:19
 */
public class UpsertCarTest {
    private TransportClient client;

    @Before
    public void before() throws UnknownHostException {
        Settings settings = Settings.builder()
                .put("cluster.name", "elasticsearch") // 集群名称
                .put("client.transport.sniff", true) // 自动探查
                .build();
        client = new PreBuiltTransportClient(settings)
                .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost"), 9300));
    }

    @Test
    public void upsertCar() throws IOException, ExecutionException, InterruptedException {
        // 当 id=1 不存在的时候新增，存在的时候更新汽车价格

        IndexRequest upsertRequest = new IndexRequest("car_shop", "cars", "1");
        upsertRequest.source(
                XContentFactory.jsonBuilder()
                        .startObject()
                        .field("brand", "宝马")
                        .field("name", "宝马320")
                        .field("price", 320000)
                        .field("produce_date", "2017-01-01")
                        .endObject());

        UpdateRequest updateRequest = new UpdateRequest("car_shop", "cars", "1");
        updateRequest.doc(XContentFactory.jsonBuilder()
                .startObject()
                .field("price", 32_0000)
                .endObject())
                .upsert(upsertRequest);  // 更新的时候关联一个 upsert

        ActionFuture<UpdateResponse> update = client.update(updateRequest);
        System.out.println(update.get());

    }
}

```

执行更新打印的结果信息

```
UpdateResponse[index=car_shop,type=cars,id=1,version=1,result=created,shards=ShardInfo{total=2, successful=1, failures=[]}]
```
