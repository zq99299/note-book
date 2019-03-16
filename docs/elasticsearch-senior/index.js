module.exports = () => {
  return [
      '',
      {
        title: "结构化搜索",
        collapsable: true,
        children: [
          '02-term-filter.md',
          '03-filter-bitset-caching.md',
          '04-bool-filter.md',
          '05-terms.md',
          '06-range-filter.md'
        ]
      },
      {
        title: "深度探秘搜索技术",
        collapsable: true,
        children: [
          'depth-search/07-precision.md',
          'depth-search/08-multiword.md',
          'depth-search/09-boost.md',
          'depth-search/10-shard-relevance-score.md',
          'depth-search/11-dis-max-best-fields.md',
          'depth-search/12-dis-max-tie-breaker.md',
          'depth-search/13-multi-match.md',
          'depth-search/14-multi-match-most-fiels.md',
          'depth-search/15-cross-fields-most-fiels.md',
          'depth-search/16-cross-fields-copy-to.md',
          'depth-search/17-cross-fields.md',
          'depth-search/18-phrase-matching.md',
          'depth-search/19-phrase-matching-slop.md',
          'depth-search/20-match-recall-precision.md',
          'depth-search/21-rescore.md',
          'depth-search/22.md',
          'depth-search/23-search-time.md',
          'depth-search/24-ngram.md',
          'depth-search/25-vector-space-model.md',
          'depth-search/26-lucene-score.md',
          'depth-search/27.md',
          'depth-search/28-function-score.md',
          'depth-search/29-fuzzy.md'
        ]
      },
      {
        title: "彻底掌握 IK 分词器",
        collapsable: true,
        children: [
          'ik/30-ik-introduce.md',
          'ik/31-config.md',
          'ik/32-mysql-hot-update.md'
        ]
      },
      {
        title: "深入聚合数据分析",
        collapsable: true,
        children: [
          'aggs/33-bucket-metric.md',
          'aggs/34-sales-sort.md',
          'aggs/35-bucket-metric.md',
          'aggs/36-bucket.md',
          'aggs/37-metric.md',
          'aggs/38-hitogram.md',
          'aggs/39-hitogram-date.md',
          'aggs/40.md',
          'aggs/41-query-aggs.md',
          'aggs/42-global-bucket.md',
          'aggs/43-filter-aggs.md',
          'aggs/44-bucket-filter.md',
          'aggs/45-sort.md',
          'aggs/46-sort-bosom.md',
          'aggs/47-aggs-algorithm.md',
          'aggs/48-cardinality.md',
          'aggs/49-hll.md',
          'aggs/50-percentiles.md',
          'aggs/51-percentiles-sla.md',
          'aggs/52-doc-value.md',
          'aggs/53-doc-value.md',
          'aggs/54.md',
          'aggs/55-fielddata.md',
          'aggs/56-fielddata-filter.md',
          'aggs/57-fielddata.md',
          'aggs/58-bucket.md'
        ]
      },
      {
        title: "数据建模实战",
        collapsable: true,
        children: [
          'modeling/59-compare.md',
          'modeling/60-join.md',
          'modeling/61-redundancy.md',
          'modeling/62-group.md',
          'modeling/63-file.md',
          'modeling/64-lock.md',
          'modeling/65-plock.md',
          'modeling/66-plock.md',
          'modeling/67-nested-object.md',
          'modeling/68-aggs.md',
          'modeling/69-father-son.md',
          'modeling/70-father-son-search.md',
          'modeling/71-aggs.md',
          'modeling/72-deep.md'
        ]
      },
      {
        title: "ES 高手进阶",
        collapsable: true,
        children: [
          'es-high/73-ter-vector.md',
          'es-high/74-highlight.md',
          'es-high/75-search-template.md',
          'es-high/76-completion-suggest.md',
          'es-high/77-dyanmic-mapping-template.md',
          'es-high/78-geo-point.md',
          'es-high/79-o2o.md',
          'es-high/80-geo-distance.md',
          'es-high/81-geo-point-aggs.md'
        ]
      },
      {
        title: "熟练掌握 ES Java API",
        collapsable: true,
        children: [
          'java-api/82-client-cluster.md',
          'java-api/83-upsert.md',
          'java-api/84-mget.md',
          'java-api/85-bulk.md',
          'java-api/86-scroll.md',
          'java-api/87-search-template.md',
          'java-api/88-full-text.md',
          'java-api/89-bool-query.md',
          'java-api/90-gen-point.md',
          'java-api/91-.md'
        ]
      },
      '92-.md'
  ]
}
