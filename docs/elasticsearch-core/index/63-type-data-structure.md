# 内核级知识点：深入探秘 type 底层数据结构

> type

是一个 index 中用来区分类似的数据的，类似的数据，但是可能有不同的 fields，而且有不同的属性来控制索引建立、分词器

field 的 value，在底层的 lucene 中建立索引的时候，全部是 opaque bytes (二进制)类型，不区分类型的

lucene 是没有 type 的概念的，在 document 中，实际上将 type 作为一个 document 的 field 来存储，即 `_type`，es 通过 `_type`来进行 type 的过滤和筛选

一个 index 中的多个 type，实际上是放在一起存储的，因此一个 index 下，不能有多个 type 重名，而类型或者其他设置不同的，因为那样是无法处理的

> 比如下面这个示例

在 ecommerce（电子商务） index 下有电子商品和生鲜产品两个 type，只有一个保质期字段是不同名的

```json{12,25}
{
   "ecommerce": {
      "mappings": {
         "elactronic_goods": {
            "properties": {
               "name": {
                  "type": "string",
               },
               "price": {
                  "type": "double"
               },
      	       "service_period": {
      		        "type": "string"
      	       }			
            }
         },
         "fresh_goods": {
            "properties": {
               "name": {
                  "type": "string",
               },
               "price": {
                  "type": "double"
               },
      	       "eat_period": {
      		        "type": "string"
      	       }
            }
         }
      }
   }
}
```

两条示例数据可能是这样

```json{4,10}
{
  "name": "geli kongtiao",
  "price": 1999.0,
  "service_period": "one year"
}

{
  "name": "aozhou dalongxia",
  "price": 199.0,
  "eat_period": "one week"
}
```

但是在底层存在却是多了一个 `_type` 属性

```json{2,9}
{
  "_type": "elactronic_goods",
  "name": "geli kongtiao",
  "price": 1999.0,
  "service_period": "one year"
}

{
  "_type": "fresh_goods",
  "name": "aozhou dalongxia",
  "price": 199.0,
  "eat_period": "one week"
}
```

> 在 lucene 存储是一个 document

在底层的存储是这样子的

```json
{
   "ecommerce": {
      "mappings": {
        "_type": {
          "type": "string",
          "index": "not_analyzed"
        },
        "name": {
          "type": "string"
        },
        "price": {
          "type": "double"
        },
        "service_period": {
          "type": "string"
        },
        "eat_period": {
          "type": "string"
        }
      }
   }
}
```

所以将类似结构的 type 放在一个 index 下，这些 type 应该有多个 field 是相同的

假如说，你将两个 type 的 field 完全不同，放在一个 index 下，那么就每条数据都至少有一半的 field 在底层的 lucene 中是空值，会有严重的性能问题

::: tip
不要将大多数字段不一致的 type 放到同一个 index 中；

也看到好多地方说官网在高版本将限制为一个 index 只能有一个 type 了
:::
