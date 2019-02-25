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
      }
  ]
}
