# filter 原理剖析

核心是 bitset，还有 caching 机制

## 1. 搜索数据，获取 document list

在倒排索引中查找搜索串，获取 document list

date 来举例

word       | doc1 | doc2 | doc3
-----------|------|------|-----
2017-01-01 | *    | *    |
2017-02-02 |      | *    | *
2017-03-03 | *    | *    | *

filter：2017-02-02

到倒排索引中一找，发现 2017-02-02 对应的 document list 是 doc2,doc3

## 2. 构建 bitset

为每个在倒排索引中搜索到的结果，构建一个 bitset，[0, 0, 0, 1, 0, 1]

使用找到的 doc list 构建一个 bitset：就是一个二进制的数组，数组每个元素都是 0 或 1，
用来标识一个 doc对一个 filter 条件是否匹配，如果匹配就是 1，不匹配就是 0

如 filter：2017-02-02 ：[0, 1, 1]

- doc1：不匹配这个 filter 的
- doc2 和 do3：是匹配这个 filter 的

尽可能用简单的数据结构去实现复杂的功能，可以节省内存空间，提升性能

## 3. 遍历 bitset，查找满足条件的 documt

遍历每个过滤条件对应的 bitset，优先从最稀疏的开始搜索，查找满足所有条件的 document

后面会讲解，一次性其实可以在一个 search 请求中，发出多个 filter 条件，每个 filter 条件都会对应一个 bitset
遍历每个 filter 条件对应的 bitset，先从最稀疏的开始遍历

```
[0, 0, 0, 1, 0, 0]：比较稀疏，可以简单任务是 1 最少的
[0, 1, 0, 1, 0, 1]
```

先遍历比较稀疏的 bitset，就可以先过滤掉尽可能多的数据；遍历所有的 bitset，找到匹配所有 filter 条件的doc

> 比如请求：filter，postDate=2017-01-01，userID=1

```
postDate: [0, 0, 1, 1, 0, 0]
userID:   [0, 1, 0, 1, 0, 1]
```

遍历完两个 bitset 之后，找到的匹配所有条件的 doc，就是 doc4 (都是 1)

就可以将document作为结果返回给client了

## 4. caching bitset

caching bitset：跟踪 query，在最近 256个 query 中超过一定次数的过滤条件，缓存其 bitset。对于小 segment（<1000，或<3%），不缓存 bitset。

比如 `postDate=2017-01-01，[0, 0, 1, 1, 0, 0]`，可以缓存在内存中，
这样下次如果再有这个条件过来的时候，就不用重新扫描倒排索引，反复生成 bitset，可以大幅度提升性能。

在最近的 256 个 filter 中，有某个 filter 超过了一定的次数，次数不固定，就会自动缓存这个 filter 对应的 bitset

> 小 segment 不缓存

filter 针对小 segment 获取到的结果，可以不缓存，segment 记录数 <1000，或者 segment 大小 < index 总大小的 3%

因为：

- segment 数据量很小，此时哪怕是扫描也很快；
- segment 会在后台自动合并，小 segment 很快就会跟其他小 segment 合并成大 segment，此时就缓存也没有什么意义，segment 很快就消失了

> filter 与 query 相比的好处

好处就是 filter 会 caching，但是之前不知道 caching 的是什么东西，实际上并不是一个 filter 返回的完整的 doc list 数据结果。
而是 filter bitset 缓存起来。下次不用扫描倒排索引了。

## 5. filter 大部分情况下会比 query 先执行

filter 大部分情况下来说，在 query 之前执行，先尽量过滤掉尽可能多的数据

- query：是会计算 doc 对搜索条件的 relevance score，还会根据这个 score 去排序
- filter：只是简单过滤出想要的数据，不计算 relevance score，也不排序

::: tip
之前我一直以为 filter 是在 query 中条件查找之后，在结果上进行单纯的过滤操作。
现在看来并不是这样
:::

## 6. 有修改或者更新，cached bitset 自动更新

如果 document 新增或修改，那么 cached bitset 会被自动更新

```
postDate=2017-01-01，[0, 0, 1, 0]

document，id=5，postDate=2017-01-01，会自动更新到 postDate=2017-01-01 这个 filter 的 bitset 中，全自动，缓存会自动更新。postDate=2017-01-01的bitset，[0, 0, 1, 0, 1]
document，id=1，postDate=2016-12-30，修改为 postDate-2017-01-01，此时也会自动更新 bitset，[1, 0, 1, 0, 1]
````

以后只要是有相同的 filter 条件的，会直接来使用这个过滤条件对应的 cached bitset
