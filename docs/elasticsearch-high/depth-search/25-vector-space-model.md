# TF&IDF 算法以及向量空间模型算法

[[toc]]

es 里的得分算法主要是 3 部分

- boolean model
- TF/IDF
- vector space model 向量空间模型算法

前面两个只是简单的过一下，主要是向量空间模型算法


##  boolean model
类似 and 这种逻辑操作符，先过滤出包含指定 term 的 doc

> 举个例子

```
query "hello world" --> 过滤出包含 --> hello / world / hello & world 的 doc
bool --> must/must not/should --> 过滤 --> 包含 / 不包含 / 可能包含
doc --> 经过条件过滤之后，这些步骤是不打分数 --> 正或反 true or false --> 为了减少后续要计算的 doc 的数量，提升性能
```

## TF/IDF
详细请参考 [相关度评分 TF&IDF 算法独家解密](/elasticsearch-core/search-engine/55-tf-idf.md)

简单或就是计算单个 term 在 doc 中的分数

比如要查询 content 中查询「hello world」
```
doc1: java is my favourite programming language, hello world !!!
doc2: hello java, you are very good, oh hello world!!!
```

hello 对 doc1 的评分

- TF: term frequency

    找到 hello 在 doc1 中出现了几次，1次，会根据出现的次数给个分数
    一个 term 在一个 doc 中，出现的次数越多，那么最后给的相关度评分就会越高
- IDF：inversed document frequency

    找到 hello 在所有的 doc 中出现的次数，3 次
    一个 term 在所有的 doc 中，出现的次数越多，那么最后给的相关度评分就会越低
- length norm

    hello 搜索的那个 field 的长度，field 长度越长，给的相关度评分越低;
    field 长度越短，给的相关度评分越高

最后，会将 hello 这个 term，对 doc1 的分数，综合 TF，IDF，length norm，计算出来一个综合性的分数

hello world --> doc1 --> hello 对 doc1的分数，world 对 doc1 的分数 --> 但是最后 hello world query 要对 doc1 有一个总的分数 --> vector space model

## vector space model
这个是一个数学上的概念，很复杂。这里举例让你明白大概是个什么东西、

计算多个 term 对一个 doc 的总分数

## query vector
hello world --> es 会根据 hello world 在所有 doc 中的评分情况，计算出一个 query vector，query 向量

- hello 这个 term，给的基于所有 doc 的一个评分就是 2
- world 这个 term，给的基于所有 doc 的一个评分就是 5

query vertor 就是 [2, 5]

## doc vector

3 个 doc,会给每一个 doc，拿每个 term 计算出一个分数来，hello 有一个分数，world 有一个分数，再拿所有 term 的分数组成一个 doc vector

```
doc1：包含 hello --> [2, 0]
doc2：包含 world --> [0, 5]
doc3：包含 hello, world --> [2, 5]
```

画在一个图中（图也很简单，不截图了），取每个 doc vector 对 query vector 的弧度，给出每个 doc 对多个 term 的总分数

每个 doc vector 计算出对 query vector 的弧度，最后基于这个弧度给出一个 doc 相对于 query 中多个 term 的总分数
弧度越大，分数月底; 弧度越小，分数越高

如果是多个 term，那么就是线性代数来计算，无法用图表示

这个反正也没有看懂。知道是这么个名词就行了
