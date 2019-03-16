# lucene 相关度分数算法


之前讲解到 boolean model、TF/IDF、vector space model

本章是深入讲解 TF/IDF 算法在 lucene 中，底层到底进行 TF/IDF 算法计算的一个完整的公式是什么？

> lucene practical scoring function

practical scoring function：来计算一个 query 对一个 doc 的分数的公式，该函数会使用一个公式来计算

```
score(q,d)  =  
            queryNorm(q)  
          · coord(q,d)    
          · ∑ (           
                tf(t in d)   
              · idf(t)2      
              · t.getBoost()
              · norm(t,d)    
            ) (t in q)
```

- score(q,d) is the relevance score of document d for query q.

    这个公式的最终结果，就是说是一个 query（叫做 q），对一个 doc（叫做 d）的最终的总评分
- queryNorm(q) is the query normalization factor (new).

    是用来让一个 doc 的分数处于一个合理的区间内，不要太离谱，
    举个例子，一个 doc 分数是 10000，一个 doc 分数是 0.1，你们说好不好，肯定不好
- coord(q,d) is the coordination factor (new).

    简单来说，就是对更加匹配的 doc，进行一些分数上的成倍的奖励

    The sum of the weights for each term t in the query q for document d.

- ∑：求和的符号

- ∑ (t in q)：

    query 中每个 term，query = hello world，query 中的 term 就包含了 hello 和 world
    query 中每个 term 对 doc 的分数，进行求和，多个 term 对一个 doc 的分数，组成一个 vector space，然后计算，就在这一步

- tf(t in d) is the term frequency for term t in document d.

    计算每一个term对doc的分数的时候，就是TF/IDF算法

- idf(t) is the inverse document frequency for term t.

- t.getBoost() is the boost that has been applied to the query (new).

- norm(t,d) is the field-length norm, combined with the index-time field-level boost, if any. (new).

## query normalization factor

`queryNorm = 1 / √sumOfSquaredWeights`

sumOfSquaredWeights = 所有 term 的 IDF 分数之和，开一个平方根，然后做一个平方根分之 1

主要是为了将分数进行规范化 --> 开平方根，首先数据就变小了 --> 然后还用 1 去除以这个平方根，分数就会很小 --> 1.几 / 零点几

分数就不会出现几万，几十万，那样的离谱的分数

## query coodination

奖励那些匹配更多字符的 doc 更多的分数

```
Document 1 with hello → score: 1.5
Document 2 with hello world → score: 3.0
Document 3 with hello world java → score: 4.5

Document 1 with hello → score: 1.5 * 1 / 3 = 0.5
Document 2 with hello world → score: 3.0 * 2 / 3 = 2.0
Document 3 with hello world java → score: 4.5 * 3 / 3 = 4.5
```

把计算出来的总分数 * 匹配上的 term 数量 / 总的 term 数量，让匹配不同 term/query 数量的doc，分数之间拉开差距

## field level boost
自定义权重

::: warning
这章基本上没有看懂
:::
