module.exports = () => {
  return [
    '',
    '02-whatis/',
    '03-introduce/',
    '04-core-concept.md',
    '05-windows-install.md',
    {
      title: "快速入门案例",
      collapsable: true,
      children: [
        'quick-start-texample/06-crud.md',
        'quick-start-texample/07-search.md',
        'quick-start-texample/08-aggregation-analysis.md'
      ]
    },
    '09-basic-distributed-architecture.md',
    '10-one-node-shard-and-replica.md',
    '11-two-node-shard-and-replica.md',
    '12-lateral-capacity.md',
    '13-fault-tolerant.md',
    {
      title: "分布式文档系统",
      collapsable: true,
      children: [
        'distributed-document/14-document-basic-metadata.md',
        'distributed-document/15-documentid.md',
        'distributed-document/16-_source.md',
        'distributed-document/17-crud.md',
        'distributed-document/18-concurrent-update.md',
        'distributed-document/23-partial-update.md',
        'distributed-document/26-mget.md',
        'distributed-document/27-bulk.md',
        'distributed-document/28-stage-summary.md',
        'distributed-document/29-route.md',
        'distributed-document/30-crud-theory.md',
        'distributed-document/31-consistency-quorum.md',
        'distributed-document/32-query-theory.md',
        'distributed-document/33-bulk-json.md'
      ]
    },
    {
      title: "初识搜索引擎",
      collapsable: true,
      children: [
        'search-engine/34-search-result-timeout.md',
        'search-engine/35-multi-index.md',
        'search-engine/36-paging-deep-paging.md',
        'search-engine/37-query-string-search-and-mall-metadata.md',
        'search-engine/38-mapping.md',
        'search-engine/39-full-text-precise.md',
        'search-engine/40-inverted-index.md',
        'search-engine/41-tokenizer.md',
        'search-engine/42-query-string-participle-mapping.md',
        'search-engine/43-mapping-thorough.md',
        'search-engine/44-mapping-detailed.md',
        'search-engine/47-search-api-base.md',
        'search-engine/48-quick-start-query-dsl.md',
        'search-engine/49-filter-query.md',
        'search-engine/50-query-example.md',
        'search-engine/54-string-tow-index-sort.md',
        'search-engine/55-tf-idf.md',
        'search-engine/56-doc-value.md',
        'search-engine/57-query-phase.md',
        'search-engine/58-fetch-phase.md',
        'search-engine/59-bouncing-results.md',
        'search-engine/60-scoll.md'
      ]
    },
    {
      title: "index 索引管理",
      collapsable: true,
      children: [
        'index/61-quick-start-crud.md',
        'index/62-tokenizer.md',
        'index/63-type-data-structure.md',
        'index/64-mapping-root-object.md',
        'index/65-dynamic-mapping.md',
        'index/66-zero-downtime-replace-index.md'
      ]
    },
    '67-kernel-principle-decryption.md',
    '72-employee-example.md'
  ]
}
