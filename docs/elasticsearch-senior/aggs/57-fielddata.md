# fielddata 预加载机制以及序号标记预加载

如果真的要对分词的 field 执行聚合，那么每次都在 query-time 现场生成 fielddata 并加载到内存中来，速度可能会比较慢

我们是不是可以预先生成加载 fielddata 到内存中来？

## fielddata 预加载

```json
POST /test_index/_mapping/test_type
{
  "properties": {
    "test_field": {
      "type": "string",
      "fielddata": {
        "loading" : "eager"
      }
    }
  }
}
```

上面的配置可以将 query-time 的 fielddata 生成和加载到内存，变为 index-time，
建立倒排索引的时候，会同步生成 fielddata 并且加载到内存中来，这样的话，对分词 field 的聚合性能当然会大幅度增强

## 序号标记预加载

> global ordinal 原理解释

有如下值，右侧表示 doc 的某一个字段内容
```
doc1: status1
doc2: status2
doc3: status2
doc4: status1
```
有很多重复值的情况，会进行 global ordinal 标记，可以理解为享元模式，
标记后的示意图如下

```
status1 --> 0
status2 --> 1

doc1: 0
doc2: 1
doc3: 1
doc4: 0
```

建立的 fielddata 也会是这个样子的，这样的好处就是减少重复字符串的出现的次数，减少内存的消耗

> 配置语法如下

```json
POST /test_index/_mapping/test_type
{
  "properties": {
    "test_field": {
      "type": "string",
      "fielddata": {
        "loading" : "eager_global_ordinals"
      }
    }
  }
}
```
