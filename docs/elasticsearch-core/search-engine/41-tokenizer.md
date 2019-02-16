# 内置分词器和分词器是什么？
[[toc]]

## 什么是分词器

切分词语，normalization（提升 recall 召回率）

给你一段句子，然后将这段句子拆分成一个一个的单个的单词，同时对每个单词进行 normalization（时态转换，单复数转换）分词器

recall，召回率：搜索的时候，增加能够搜索到的结果的数量

分词器主要由三个部分组成：

- character filter

    在一段文本进行分词之前，先进行预处理，比如说最常见的就是，

    - 过滤 html 标签（`<span>hello<span>` --> hello）
    - & --> and（I&you --> I and you）
- tokenizer：分词

    比如：hello you and me --> hello, you, and, me
- token filter：

    比如 lowercase，stop word，synonymom，

    - dogs --> dog
    - liked --> like
    - Tom --> tom
    - a/the/an --> 干掉
    - mother --> mom
    - small --> little

一个分词器，很重要，将一段文本进行各种处理，最后处理好的结果才会拿去建立倒排索引

## 内置分词器的介绍

比如一句话：Set the shape to semi-transparent by calling set_trans(5)

被以下 4 种分词器（内置常用）处理之后，会得到不同的结果：

- standard analyzer （默认）

    set, the, shape, to, semi, transparent, by, calling, set_trans, 5（默认的是standard）
- simple analyzer

    set, the, shape, to, semi, transparent, by, calling, set, trans
- whitespace analyzer

    Set, the, shape, to, semi-transparent, by, calling, set_trans(5)
- language analyzer（特定的语言的分词器，比如说，english，英语分词器）

    set, shape, semi, transpar, call, set_tran, 5


做的处理前面都说过了，大小写、单复数、按照空格或者下划线横线等切分词语；
