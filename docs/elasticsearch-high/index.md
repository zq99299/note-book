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
33. [深入聚合数据分析_ bucket 与 metric 两个核心概念的讲解](./aggs/33-bucket-metric.md)
34. [深入聚合数据分析_家电卖场案例以及统计哪种颜色电视销量最高](./aggs/34-sales-sort.md)
35. [深入聚合数据分析_实战 bucket+metric：统计每种颜色电视平均价格](./aggs/35-bucket-metric.md)
36. [深入聚合数据分析_ bucket 嵌套实现颜色 + 品牌的多层下钻分析](./aggs/36-bucket.md)
37. [深入聚合数据分析_掌握更多 metrics：统计每种颜色电视最大最小价格](./aggs/37-metric.md)
38. [深入聚合数据分析_实战 hitogram 按价格区间统计电视销量和销售额](./aggs/38-hitogram.md)
39. [深入聚合数据分析_实战 date hitogram 之统计每月电视销量](./aggs/39-hitogram-date.md)
40. [深入聚合数据分析_下钻分析之统计每季度每个品牌的销售额](./aggs/40.md),
41. [深入聚合数据分析_ 搜索+聚合：统计指定品牌下每个颜色的销量](./aggs/41-query-aggs.md),
42. [深入聚合数据分析_ global bucket：单个品牌与所有品牌销量对比](./aggs/42-global-bucket.md),
43. [深入聚合数据分析_过滤+聚合：统计价格大于 1200 的电视平均价格](./aggs/43-filter-aggs.md),
44. [深入聚合数据分析_ bucket filter：统计牌品最近一个月的平均价格](./aggs/44-bucket-filter.md)
45. [深入聚合数据分析_排序：按每种颜色的平均销售额降序排序](./aggs/45-sort.md),
46. [深入聚合数据分析_颜色+品牌下钻分析时按最深层 metric 进行排序](./aggs/46-sort-bosom.md),
47. [深入聚合数据分析_易并行聚合算法：三角选择原则、近似聚合算法](./aggs/47-aggs-algorithm.md),
48. [深入聚合数据分析_ cardinality 去重算法以及每月销售品牌数量统计](./aggs/48-cardinality.md),
49. [深入聚合数据分析_ cardinality 算法之优化内存开销以及 HLL 算法](./aggs/49-hll.md),
50. [深入聚合数据分析_ percentiles 百分比算法以及网站访问时延统计](./aggs/50-percentiles.md)
51. [深入聚合数据分析_ percentiles rank 以及网站访问时延SLA统计](./aggs/51-percentiles-sla.md)
52. [深入聚合数据分析_基于 doc value 正排索引的聚合内部原理](./aggs/52-doc-value.md)
53. [深入聚合数据分析_ doc value 机制内核级原理深入探秘](./aggs/53-doc-value.md)
54. [深入聚合数据分析_ string field 聚合实验以及 fielddata 原理初探](./aggs/54.md)
55. [深入聚合数据分析_ fielddata 内存控制以及 circuit breaker 短路器](./aggs/55-fielddata.md)
56. [深入聚合数据分析_ fielddata filter 的细粒度内存加载控制](./aggs/56-fielddata-filter.md)
57. [深入聚合数据分析_ fielddata 预加载机制以及序号标记预加载](./aggs/57-fielddata.md)
58. [深入聚合数据分析_海量 bucket 优化机制：从深度优先到广度优先](./aggs/58-bucket.md)
