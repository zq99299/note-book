# 内核级知识点之 doc value 初步探秘
[[toc]]

- 倒排索引： 搜索的时候使用
- 正排索引：排序的时候使用，看到每个 document 的每个 field，然后进行排序，所谓的正排索引，其实就是doc values

在建立索引的时候，一方面会建立倒排索引，以供搜索用；一方面会建立正排索引，也就是 doc values，以供排序，聚合，过滤等操作使用

doc values 是被保存在磁盘上的，此时如果内存足够，os 会自动将其缓存在内存中，性能还是会很高；如果内存不足够，os 会将其写入磁盘上

## 倒排索引回顾
比如：

doc1: hello world you and me
doc2: hi, world, how are you

倒排索引可能如下：

word  | doc1 | doc2
------|------|-----
hello | *    |
world | *    | *
you   | *    | *
and   | *    |
me    | *    |
hi    |      | *
how   |      | *
are   |      | *

query string：hello you --> hello, you

hello --> doc1
you --> doc1,doc2

在倒排索引中就匹配到了。

## 正排索引

doc1: hello world you and me

doc2: hi, world, how are you

sort by age

```json
doc1: { "name": "jack", "age": 27 }
doc2: { "name": "tom", "age": 30 }
```

document | name | age
---------|------|----
doc1     | jack | 27
doc2     | tom  | 30

::: tip 疑问
还是没有明白，怎么用来排序的，对于正排索引来说，搜索到所有的文档之后，再按照文档中的字段排序不行么？

那么正排索引和平时 mysql 中的类似，直接获取 document 然后按照字段排序。

这两个貌似是一样的？
:::
