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
