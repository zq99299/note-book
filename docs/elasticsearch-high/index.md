# elasticsearch 高级篇

本主题主要会在一个案例背景下讲解技术：IT 技术论坛

IT技术论坛：发各种IT技术的帖子，一种是自己研究了一个技术，就发出来一些研究心得；自己遇到了问题，发个帖子问一问。帖子会有人回复，还会有人浏览。当然了，还有一些论坛会提供简单社交的一个功能，互相加好友，互相关注，互相点赞，之类的。

在IT技术论坛的背景下，去开发一些跟案例背景相关的搜索或者数据分析，或者数据建模的需求，用每一讲学到的知识点，去接解决一些问题

既可以学到知识和技术，也可以在真实的案例背景中练习一下学到的东西

1. 结构化搜索_ IT 技术论坛案例背景介绍（就是本章）
2. [结构化搜索_在案例中实战使用 term filter 来搜索数据](./02-term-filter.md)
3. [结构化搜索_ filter 执行原理深度剖析（bitset 机制与 caching 机制）](./03-filter-bitset-caching.md)
4. [结构化搜索_在案例中实战基于 bool 组合多个 filter 条件来搜索数据](./04-bool-filter.md)
5. [结构化搜索_在案例中实战使用 terms 搜索多个值以及多值搜索结果优化](./05-terms.md)
6. [结构化搜索_在案例中实战基于 range filter 来进行范围过滤](./06-range-filter.md)
7. [深度探秘搜索技术_在案例中体验如何手动控制全文检索结果的精准度](./depth-search/07-precision.md)
8. [深度探秘搜索技术_基于 term+bool 实现的 multiword 搜索底层原理剖析](./depth-search/08-multiword.md)
9. [深度探秘搜索技术_基于 boost 的细粒度搜索条件权重控制](./depth-search/09-boost.md)
10. [深度探秘搜索技术_多shard 场景下 relevance score 不准确问题大揭秘](./depth-search/10-shard-relevance-score.md)
11. [深度探秘搜索技术_案例实战基于 dis_max 实现 best fields 策略进行多字段搜索](./depth-search/11-dis-max-best-fields.md)
12. [深度探秘搜索技术_案例实战基于 tie_breaker 参数优化 dis_max 搜索效果](./depth-search/12-dis-max-tie-breaker.md)
13. [深度探秘搜索技术_案例实战基于 multi_match 语法实现 dis_max + tie_breaker](./depth-search/13-multi-match.md)
14. [深度探秘搜索技术_基于 multi_match + most fiels 策略进行 multi-field 搜索](./depth-search/14-multi-match-most-fiels.md)
15. [深度探秘搜索技术_使用 most_fields 策略进行 cross-fields search 弊端大揭秘](./depth-search/15-cross-fields-most-fiels.md))
16. [深度探秘搜索技术_使用 copy_to 定制组合 field 解决 cross-fields 搜索弊端](./depth-search/16-cross-fields-copy-to.md)
17. [深度探秘搜索技术_使用原生 cross-fiels 技术解决搜索弊端](./depth-search/17-cross-fields.md)
18. [深度探秘搜索技术_在案例实战中掌握 phrase matching 搜索技术](./depth-search/18-phrase-matching.md)
19. [深度探秘搜索技术_基于 slop 参数实现近似匹配以及原理剖析和相关实验](./depth-search/19-phrase-matching-slop.md)
20. [深度探秘搜索技术_混合使用 match 和近似匹配实现召回率与精准度的平衡](./depth-search/20-match-recall-precision.md)
21. [深度探秘搜索技术_使用 rescoring 机制优化近似匹配搜索的性能](./depth-search/21-rescore.md)
22. [深度探秘搜索技术_实战前缀搜索、通配符搜索、正则搜索等技术](./depth-search/22.md)
23. [深度探秘搜索技术_实战 match_phrase_prefix 实现 search-time 搜索推荐](./depth-search/23-search-time.md)
24. [深度探秘搜索技术_实战通过 ngram 分词机制实现 index-time 搜索推荐](./depth-search/24-ngram.md)
25. [深度探秘搜索技术_深入揭秘 TF&IDF 算法以及向量空间模型算法](./depth-search/25-vector-space-model.md)
26. [深度探秘搜索技术_深入揭秘 lucene 的相关度分数算法](./depth-search/26-lucene-score.md)
27. [深度探秘搜索技术_实战掌握四种常见的相关度分数优化方法](./depth-search/27.md)
28. [深度探秘搜索技术_实战用 function_score 自定义相关度分数算法](./depth-search/28-function-score.md)
29. [深度探秘搜索技术_实战掌握误拼写时的 fuzzy 模糊搜索技术](./depth-search/29-fuzzy.md)
30. [彻底掌握 IK 中文分词_上机动手实战 IK 中文分词器的安装和使用](./ik/30-ik-introduce.md)
31. [彻底掌握 IK 中文分词_ IK 分词器配置文件讲解以及自定义词库实战](./ik/31-config.md)
32. [彻底掌握 IK 中文分词_修改 IK 分词器源码来基于 mysql 热更新词库](./ik/32-mysql-hot-update.md)
