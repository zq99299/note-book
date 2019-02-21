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
          'depth-search/14-multi-match-most-fiels.md'
        ]
      }
  ]
}
