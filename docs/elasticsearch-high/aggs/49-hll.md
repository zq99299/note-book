# cardinality 算法内存优化、hll 算法
[[toc]]

## cardinality 算法内存优化

cardinality 5% 的错误率，性能在 100ms 左右

上面这句话是否是感觉很没有安全感？缺少一些重要的信息，比如是怎么计算来的？那么这会带出来一个配置参数 `precision_threshold`

```json
GET /tvs/sales/_search
{
    "size" : 0,
    "aggs" : {
        "distinct_brand" : {
            "cardinality" : {
              "field" : "brand",
              "precision_threshold" : 100
            }
        }
    }
}
```
precision_threshold：在多少个 unique value 以内 cardinality 几乎保证 100% 准确，
默认值为 100，它的配置可以优化准确率和内存开销

怎么理解这个 100 个 unique value？

考虑一个场景：brand 去重，如果 brand 的 unique value 在100个以内，比如小米，长虹，三星，TCL，HTL ... 在去重后的结果在 100 个以内

cardinality 算法会占用 precision_threshold * 8 byte 内存消耗，100 * 8 = 800 个字节，
占用内存很小。而且 unique value 如果的确在值以内，那么可以确保 100% 准确
官方给的一个说法是 100，在数百万的 unique value 内错误率在 5% 以内

::: warning
反正我是有点懵逼，解说 precision_threshold 表示的是 多少个 unique value ，
现在又说官网设置为 100，可以保证数百万
:::

precision_threshold 值设置的越大，占用内存越大，1000 * 8 = 8000 / 1000 = 8KB，可以确保更多 unique value 的场景下 100% 的准确

field 去重 count，这时候 unique value 10000，precision_threshold=10000，10000 * 8 = 80000个byte，80KB

## HyperLogLog++（HLL）算法性能优化
cardinality 底层算法：使用 HLL 算法，优化 HLL 算法的性能即可

HLL 会对所有的 uqniue value 取 hash 值，通过 hash 值近似去求 distcint count，所以有一定误差

默认情况下，发送一个 cardinality 请求的时候，会动态地对所有的 field value，取 hash 值;

我们只要将取 hash 值的操作，前移到建立索引的时候，就能优化这个聚合性能了

```json{8-12}
PUT /tvs/
{
  "mappings": {
    "sales": {
      "properties": {
        "brand": {
          "type": "text",
          "fields": {
            "hash": {
              "type": "murmur3"
            }
          }
        }
      }
    }
  }
}

手动内置 mapping hash 字段

GET /tvs/sales/_search
{
    "size" : 0,
    "aggs" : {
        "distinct_brand" : {
            "cardinality" : {
              "field" : "brand.hash",
              "precision_threshold" : 100
            }
        }
    }
}

```
