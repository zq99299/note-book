# 练习例子-员工管理
本章节会记录原始以下章节

- 72. Java API初步使用_员工管理案例：基于 Java 实现员工信息的增删改查
- 73. Java API初步使用_员工管理案例：基于 Java 对员工信息进行复杂的搜索操作
- 74. Java API初步使用_员工管理案例：基于 Java 对员工信息进行聚合分析

[[toc]]


强调一下，我们的es讲课的风格

1. es 这门技术有点特殊，跟比如其他的像纯 java 的课程，比如分布式课程，或者大数据类的课程，比如 hadoop，spark，storm 等。不太一样

2. es 非常重要的一个 api，是它的 restful api，你自己思考一下，掌握这个 es 的 restful api，可以让你执行一些核心的运维管理的操作，比如说创建索引，维护索引，执行各种 refresh、flush、optimize 操作，查看集群的健康状况，比如还有其他的一些操作，就不在这里枚举了。或者说探查一些数据，可能用 java api 并不方便。

3. es 的学习，首先，你必须学好 restful api，然后才是你自己的熟悉语言的 api，java api。


这个《核心知识篇（上半季）》，其实主要还是打基础，包括核心的原理，还有核心的操作，还有部分高级的技术和操作，大量的实验，大量的画图，最后初步讲解怎么使用 java api

《核心知识篇（下半季）》，包括深度讲解搜索这块技术，还有聚合分析这块技术，包括数据建模，包括 java api 的复杂使用，有一个项目实战

## 示例简介
含有如下信息的属性：

员工信息

- 姓名
- 年龄
- 职位
- 国家
- 入职日期
- 薪水

项目搭建，我使用 gradle 构建项目，依赖如下

```groovy
dependencies {
    testCompile group: 'junit', name: 'junit', version: '4.12'
    compile 'org.elasticsearch.client:transport:5.2.2'
    compile 'org.apache.logging.log4j:log4j-api:2.7'
    compile 'org.apache.logging.log4j:log4j-core:2.7'
}
```

log4j2.properties

```
appender.console.type = Console
appender.console.name = console
appender.console.layout.type = PatternLayout

rootLogger.level = info
rootLogger.appenderRef.console.ref = console
```

## transportClient CRUD

使用 transport 进行一个简单的测试用例，来测试是否能正常与 es 交互

```java
package cn.mrcode.newstudy.elasticsearch;

import org.elasticsearch.action.delete.DeleteResponse;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.index.IndexResponse;
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

/**
 * @author : zhuqiang
 * @date : 2019/1/22 21:59
 */
public class DemoTest {
    private TransportClient client = null;

    @Before
    public void createClient() throws UnknownHostException {
        // 集群连接
        client = new PreBuiltTransportClient(Settings.EMPTY)
                .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost"), 9300))
//                // 在同一台机器上面启动多个实例，端口会变化,多个地址在这里添加
//                .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost"), 9301))
        ;
    }

    @Test
    public void createEmployee() throws IOException {
        IndexResponse response = client.prepareIndex("company", "employee", "1")
                .setSource(XContentFactory.jsonBuilder()
                        .startObject()
                        .field("name", "jack")
                        .field("age", 27)
                        .field("position", "technique")
                        .field("country", "china")
                        .field("join_date", "2017-01-01")
                        .field("salary", 10000)
                        .endObject())
                .get();
        System.out.println(response.getResult());
    }

    // 按 id 查询文档
    @Test
    public void getById() {
        // 很奇葩的一个现象，执行后该对象 toString 方法是一个错误栈，实际上是可以获取到数据的
        // Error building toString out of XContent: com.fasterxml.jackson.core.JsonGenerationException: Can not start an object, expecting field name (context: Object)
        GetResponse response = client.prepareGet("company", "employee", "1").get();
        System.out.println(response.getSource());
    }

    @Test
    public void update() throws IOException {
        UpdateResponse updateResponse = client.prepareUpdate("company", "employee", "1")
                .setDoc(XContentFactory.jsonBuilder()
                        .startObject()
                        .field("age", "26")
                        .endObject())
                .get();
        System.out.println(updateResponse);
    }

    @Test
    public void delete() {
        DeleteResponse response = client.prepareDelete("company", "employee", "1").get();
        System.out.println(response);
    }
}
```

## 复杂搜索

我都忍不住吐槽了，这个搜索也太简单了。全是一个条件字段查询啊。难道 es 就只能这样吗？

```java
public class EmployeeSearchTest {
    private TransportClient client = null;

    @Before
    public void createClient() throws UnknownHostException {
        client = new PreBuiltTransportClient(Settings.EMPTY)
                .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost"), 9300))
        ;
    }

    /**
     * 准备数据
     */
    @Test
    public void prepareData() throws Exception {
        client.prepareIndex("company", "employee", "1")
                .setSource(XContentFactory.jsonBuilder()
                        .startObject()
                        .field("name", "jack")
                        .field("age", 27)
                        .field("position", "technique software")
                        .field("country", "china")
                        .field("join_date", "2017-01-01")
                        .field("salary", 10000)
                        .endObject())
                .get();

        client.prepareIndex("company", "employee", "2")
                .setSource(XContentFactory.jsonBuilder()
                        .startObject()
                        .field("name", "marry")
                        .field("age", 35)
                        .field("position", "technique manager")
                        .field("country", "china")
                        .field("join_date", "2017-01-01")
                        .field("salary", 12000)
                        .endObject())
                .get();

        client.prepareIndex("company", "employee", "3")
                .setSource(XContentFactory.jsonBuilder()
                        .startObject()
                        .field("name", "tom")
                        .field("age", 32)
                        .field("position", "senior technique software")
                        .field("country", "china")
                        .field("join_date", "2016-01-01")
                        .field("salary", 11000)
                        .endObject())
                .get();

        client.prepareIndex("company", "employee", "4")
                .setSource(XContentFactory.jsonBuilder()
                        .startObject()
                        .field("name", "jen")
                        .field("age", 25)
                        .field("position", "junior finance")
                        .field("country", "usa")
                        .field("join_date", "2016-01-01")
                        .field("salary", 7000)
                        .endObject())
                .get();

        client.prepareIndex("company", "employee", "5")
                .setSource(XContentFactory.jsonBuilder()
                        .startObject()
                        .field("name", "mike")
                        .field("age", 37)
                        .field("position", "finance manager")
                        .field("country", "usa")
                        .field("join_date", "2015-01-01")
                        .field("salary", 15000)
                        .endObject())
                .get();
    }

    /**
     * <pre>
     * 搜索：需求如下
     * （1）搜索职位中包含 technique 的员工
     * （2）同时要求 age 在 30 到 40 岁之间
     * （3）分页查询，查找第一页
     * </pre>
     */
    @Test
    public void search() {
        SearchResponse searchResponse = client.prepareSearch("company")
                .setTypes("employee")
                .setQuery(QueryBuilders.matchQuery("position", "technique"))
                .setPostFilter(QueryBuilders.rangeQuery("age").from(30).to(40))
                .setFrom(0)
                .setSize(1)
                .get();
        SearchHit[] hits = searchResponse.getHits().getHits();
        for (SearchHit hit : hits) {
            System.out.println(hit.getSourceAsString());
        }
    }
}
```

> 查询结果

```json
{"name":"marry","age":35,"position":"technique manager","country":"china","join_date":"2017-01-01","salary":12000}
```

> 上述 java 查询对于的 resultful api 代码如下

```json
GET /company/employee/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "position": "technique"
          }
        }
      ],
      "filter": {
        "range": {
          "age": {
            "gte": 30,
            "lte": 40
          }
        }
      }
    }
  },
  "from": 0,
  "size": 1
}
```

## 聚合分析

```java
package cn.mrcode.newstudy.elasticsearch;

import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramInterval;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.junit.Before;
import org.junit.Test;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.concurrent.ExecutionException;

/**
 * 聚合分析
 *
 * @author : zhuqiang
 * @date : 2019/1/22 23:18
 */
public class EmployeeAggrTest {
    private TransportClient client = null;

    @Before
    public void createClient() throws UnknownHostException {
        client = new PreBuiltTransportClient(Settings.EMPTY)
                .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost"), 9300))
        ;
    }

    /**
     * <pre>
     * 需求：
     * （1）首先按照 country 国家来进行分组
     * （2）然后在每个 country 分组内，再按照入职年限进行分组
     * （3）最后计算每个分组内的平均薪资
     * </pre>
     */
    @Test
    public void aggr() throws ExecutionException, InterruptedException {
        SearchResponse searchResponse = client.prepareSearch("company")
                .setTypes("employee")
                .addAggregation(
                        AggregationBuilders
                                // 前面的是对该操作取名，后面的是真实的字段
                                .terms("group_by_country")
                                .field("country")
                                .subAggregation(
                                        AggregationBuilders
                                                .dateHistogram("group_by_join_date")
                                                .field("join_date")
                                                .dateHistogramInterval(DateHistogramInterval.YEAR) // 按照年来分
                                                .subAggregation(
                                                        AggregationBuilders
                                                                .avg("ave_salary")
                                                                .field("salary")
                                                )
                                )
                )
                .execute()
                .get();
        System.out.println(searchResponse);
    }
}

```
可以看到上面的操作，添加一个聚合操作，然后在该聚合操作里面不断下钻

如果运行报错
```
java.util.concurrent.ExecutionException: RemoteTransportException[[sEvAlYx][127.0.0.1:9300][indices:data/read/search]]; nested: SearchPhaseExecutionException[all shards failed]; nested: RemoteTransportException[[sEvAlYx][127.0.0.1:9300][indices:data/read/search[phase/query]]]; nested: IllegalArgumentException[Fielddata is disabled on text fields by default. Set fielddata=true on [country] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory.];
```

前面的课程遇到过的，进行聚合分析/排序的时候，需要把 text 类型的 Fielddata 属性打开

> 删除索引，手动重建后，再运行上一个例子中的数据准备插入数据

```json
PUT /company
{
  "mappings": {
      "employee": {
        "properties": {
          "age": {
            "type": "long"
          },
          "country": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            },
            "fielddata": true
          },
          "join_date": {
            "type": "date"
          },
          "name": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "position": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "salary": {
            "type": "long"
          }
        }
      }
    }
}
```

> 程序运行结果

```json
{
    "took": 244,
    "timed_out": false,
    "_shards": {
        "total": 5,
        "successful": 5,
        "failed": 0
    },
    "hits": {
        "total": 5,
        "max_score": 1,
        "hits": [
            {
                "_index": "company",
                "_type": "employee",
                "_id": "5",
                "_score": 1,
                "_source": {
                    "name": "mike",
                    "age": 37,
                    "position": "finance manager",
                    "country": "usa",
                    "join_date": "2015-01-01",
                    "salary": 15000
                }
            },
            {
                "_index": "company",
                "_type": "employee",
                "_id": "2",
                "_score": 1,
                "_source": {
                    "name": "marry",
                    "age": 35,
                    "position": "technique manager",
                    "country": "china",
                    "join_date": "2017-01-01",
                    "salary": 12000
                }
            },
            {
                "_index": "company",
                "_type": "employee",
                "_id": "4",
                "_score": 1,
                "_source": {
                    "name": "jen",
                    "age": 25,
                    "position": "junior finance",
                    "country": "usa",
                    "join_date": "2016-01-01",
                    "salary": 7000
                }
            },
            {
                "_index": "company",
                "_type": "employee",
                "_id": "1",
                "_score": 1,
                "_source": {
                    "name": "jack",
                    "age": 27,
                    "position": "technique software",
                    "country": "china",
                    "join_date": "2017-01-01",
                    "salary": 10000
                }
            },
            {
                "_index": "company",
                "_type": "employee",
                "_id": "3",
                "_score": 1,
                "_source": {
                    "name": "tom",
                    "age": 32,
                    "position": "senior technique software",
                    "country": "china",
                    "join_date": "2016-01-01",
                    "salary": 11000
                }
            }
        ]
    },
    "aggregations": {
        "group_by_country": {
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {
                    "key": "china",
                    "doc_count": 3,
                    "group_by_join_date": {
                        "buckets": [
                            {
                                "key_as_string": "2016-01-01T00:00:00.000Z",
                                "key": 1451606400000,
                                "doc_count": 1,
                                "ave_salary": {
                                    "value": 11000
                                }
                            },
                            {
                                "key_as_string": "2017-01-01T00:00:00.000Z",
                                "key": 1483228800000,
                                "doc_count": 2,
                                "ave_salary": {
                                    "value": 11000
                                }
                            }
                        ]
                    }
                },
                {
                    "key": "usa",
                    "doc_count": 2,
                    "group_by_join_date": {
                        "buckets": [
                            {
                                "key_as_string": "2015-01-01T00:00:00.000Z",
                                "key": 1420070400000,
                                "doc_count": 1,
                                "ave_salary": {
                                    "value": 15000
                                }
                            },
                            {
                                "key_as_string": "2016-01-01T00:00:00.000Z",
                                "key": 1451606400000,
                                "doc_count": 1,
                                "ave_salary": {
                                    "value": 7000
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
}
```

> 对于的 restfull api

可以看到 restfull api 与 java 代码中的讨论几乎上是一致的

```json
GET /company/employee/_search
{
  "aggs": {
    "group_by_country": {
      "terms": {
        "field": "country"
      },
      "aggs": {
        "group_by_join_date": {
          "date_histogram": {
            "field": "join_date",
            "interval": "year"
          },
          "aggs": {
            "ave_salary": {
              "avg": {
                "field": "salary"
              }
            }
          }
        }
      }
    }
  }
}
```

> 怎么使用 api 来获取到结果数据呢？

```java
// 怎么用 api 来获取里面的分组结果数据呢？
// 这个只能看着结果，debug 来获取到层级对象

// 它的类型和之前查询的类型对应
StringTerms groupByCountry = (StringTerms) searchResponse.getAggregations().asMap().get("group_by_country");
List<Terms.Bucket> buckets = groupByCountry.getBuckets();
for (Terms.Bucket bucket : buckets) {
    String keyAsString = bucket.getKeyAsString();
    System.out.println("==== " + keyAsString);
    InternalDateHistogram groupByJoinDate = (InternalDateHistogram) bucket.getAggregations().asMap().get("group_by_join_date");
    List<Histogram.Bucket> groupByJoinDateBuckets = groupByJoinDate.getBuckets();
    for (Histogram.Bucket groupByJoinDateBucket : groupByJoinDateBuckets) {
        System.out.println("===== " + groupByJoinDateBucket.getKeyAsString());
        InternalAvg aveSalary = (InternalAvg) groupByJoinDateBucket.getAggregations().asMap().get("ave_salary");
        System.out.println("======" + aveSalary.getValueAsString());
    }
}
System.out.println();
}
```

> java api 获取的结果

可以看到 java api 来获取结果确实很麻烦
```
==== china
===== 2016-01-01T00:00:00.000Z
======11000.0
===== 2017-01-01T00:00:00.000Z
======11000.0
==== usa
===== 2015-01-01T00:00:00.000Z
======15000.0
===== 2016-01-01T00:00:00.000Z
======7000.0
```
