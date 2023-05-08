(window.webpackJsonp=window.webpackJsonp||[]).push([[46],{1e3:function(t,s,e){t.exports=e.p+"assets/img/markdown-img-paste-20190120155716894.72b0a7f3.png"},1001:function(t,s,e){t.exports=e.p+"assets/img/markdown-img-paste-20190120160400697.a384e6eb.png"},1807:function(t,s,e){"use strict";e.r(s);var a=e(13),r=Object(a.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"内核原理解密"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#内核原理解密"}},[t._v("#")]),t._v(" 内核原理解密")]),t._v(" "),a("p",[t._v("本章会记录原始以下章节内容")]),t._v(" "),a("ul",[a("li",[a("ol",{attrs:{start:"67"}},[a("li",[t._v("内核原理探秘_倒排索引组成结构以及其索引可变原因揭秘")])])]),t._v(" "),a("li",[a("ol",{attrs:{start:"68"}},[a("li",[t._v("内核原理探秘_深度图解剖析 document 写入原理（buffer，segment，commit）")])])]),t._v(" "),a("li",[a("ol",{attrs:{start:"69"}},[a("li",[t._v("内核原理探秘_优化写入流程实现 NRT 近实时（filesystem cache，refresh）")])])]),t._v(" "),a("li",[a("ol",{attrs:{start:"70"}},[a("li",[t._v("内核原理探秘_继续优化写入流程实现 durability 可靠存储（translog，flush）")])])]),t._v(" "),a("li",[a("ol",{attrs:{start:"71"}},[a("li",[t._v("内核原理探秘_最后优化写入流程实现海量磁盘文件合并（segment merge，optimize）")])])])]),t._v(" "),a("p"),a("div",{staticClass:"table-of-contents"},[a("ul",[a("li",[a("a",{attrs:{href:"#倒排索引的结构"}},[t._v("倒排索引的结构")])]),a("li",[a("a",{attrs:{href:"#倒排索引不可变的好处"}},[t._v("倒排索引不可变的好处")])]),a("li",[a("a",{attrs:{href:"#倒排索引不可变的坏处"}},[t._v("倒排索引不可变的坏处")])]),a("li",[a("a",{attrs:{href:"#document-写入原理"}},[t._v("document 写入原理")])]),a("li",[a("a",{attrs:{href:"#document-删除原理"}},[t._v("document 删除原理")])]),a("li",[a("a",{attrs:{href:"#nrt-实现"}},[t._v("NRT 实现")])]),a("li",[a("a",{attrs:{href:"#refresh-间隔修改"}},[t._v("refresh 间隔修改")])]),a("li",[a("a",{attrs:{href:"#durability-可靠存储"}},[t._v("durability 可靠存储")])]),a("li",[a("a",{attrs:{href:"#宕机后数据恢复流程"}},[t._v("宕机后数据恢复流程")])]),a("li",[a("a",{attrs:{href:"#海量磁盘文件合并"}},[t._v("海量磁盘文件合并")])]),a("li",[a("a",{attrs:{href:"#optimize"}},[t._v("_optimize")])])])]),a("p"),t._v(" "),a("p",[t._v("倒排索引，是适合用于进行搜索的")]),t._v(" "),a("h2",{attrs:{id:"倒排索引的结构"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#倒排索引的结构"}},[t._v("#")]),t._v(" 倒排索引的结构")]),t._v(" "),a("p",[t._v("倒排索引其实并不是像之前说的那样很简单的，结构，但是核心却就是这样。")]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("word\t\tdoc1\t\tdoc2\n\ndog\t\t  *\t\t      *\nhello\t\t*\nyou\t\t\t*\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br")])]),a("p",[t._v("还包括其他的一些数据，可以看出来如下数据基本上都是用来算相关度评分的")]),t._v(" "),a("ul",[a("li",[t._v("包含这个关键词的 document list")]),t._v(" "),a("li",[t._v("包含这个关键词的所有 document 的数量：IDF（inverse document frequency）")]),t._v(" "),a("li",[t._v("这个关键词在每个 document 中出现的次数：TF（term frequency）")]),t._v(" "),a("li",[t._v("这个关键词在这个 document 中的次序")]),t._v(" "),a("li",[t._v("每个 document 的长度：length norm")]),t._v(" "),a("li",[t._v("包含这个关键词的所有 document 的平均长度")])]),t._v(" "),a("h2",{attrs:{id:"倒排索引不可变的好处"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#倒排索引不可变的好处"}},[t._v("#")]),t._v(" 倒排索引不可变的好处")]),t._v(" "),a("ul",[a("li",[t._v("不需要锁，提升并发能力，避免锁的问题")]),t._v(" "),a("li",[t._v("数据不变，一直保存在 os cache 中，只要 cache 内存足够")]),t._v(" "),a("li",[t._v("filter cache 一直驻留在内存，因为数据不变")]),t._v(" "),a("li",[t._v("可以压缩，节省 cpu 和 io 开销（因为不可变，所以可以压缩不存在修改）")])]),t._v(" "),a("h2",{attrs:{id:"倒排索引不可变的坏处"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#倒排索引不可变的坏处"}},[t._v("#")]),t._v(" 倒排索引不可变的坏处")]),t._v(" "),a("p",[t._v("每次都要重新构建整个索引。")]),t._v(" "),a("p",[t._v("在之前的讲解中，一个重要概念，对于 document 的变更，内部都是先标记延迟删除，再新增一个文档")]),t._v(" "),a("h2",{attrs:{id:"document-写入原理"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#document-写入原理"}},[t._v("#")]),t._v(" document 写入原理")]),t._v(" "),a("p",[t._v("会涉及到三个概念：")]),t._v(" "),a("ul",[a("li",[t._v("buffer：内存")]),t._v(" "),a("li",[t._v("segment：lucene 底层的 index 是分为多个 segment 的，每个 segment 都会存放部分数据")]),t._v(" "),a("li",[t._v("commit：将 buffer 的数据写入到 segment 中")])]),t._v(" "),a("p",[a("img",{attrs:{src:e(996),alt:""}})]),t._v(" "),a("p",[t._v("一个 document 的写入如上图流程：")]),t._v(" "),a("ol",[a("li",[t._v("数据写入 buffer")]),t._v(" "),a("li",[t._v("commit point")]),t._v(" "),a("li",[t._v("buffer 中的数据写入新的 index segment")]),t._v(" "),a("li",[t._v("等待在 os cache 中的 index segment 被 fsync 强制刷到磁盘上")]),t._v(" "),a("li",[t._v("新的 index sgement 被打开，供 search 使用")]),t._v(" "),a("li",[t._v("buffer 被清空")])]),t._v(" "),a("h2",{attrs:{id:"document-删除原理"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#document-删除原理"}},[t._v("#")]),t._v(" document 删除原理")]),t._v(" "),a("p",[t._v("每次 commit point 时，会有一个 "),a("code",[t._v(".del")]),t._v(" 文件，标记了哪些 segment 中的哪些 document 被标记为 deleted 了")]),t._v(" "),a("p",[t._v("搜索的时候，会依次查询所有的 segment，从旧的到新的，\n比如被修改过的 document，在旧的 segment 中，会标记为 deleted，在新的 segment 中会有其新的数据")]),t._v(" "),a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("对于这个原理概念思路的东西，听一听就好了，至于怎么实现的，貌似所有书籍教程基本上都不会解说")])]),t._v(" "),a("p",[a("img",{attrs:{src:e(997),alt:""}})]),t._v(" "),a("h2",{attrs:{id:"nrt-实现"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#nrt-实现"}},[t._v("#")]),t._v(" NRT 实现")]),t._v(" "),a("p",[t._v("前面流程的问题，每次都必须等待 fsync 将 segment 刷入磁盘，\n才能将 segment 打开供 search 使用，这样的话，从一个 document 写入，到它可以被搜索，可能会超过1分钟！！！")]),t._v(" "),a("p",[t._v("这就不是近实时的搜索了！！！主要瓶颈在于 fsync 实际发生磁盘IO写数据进磁盘，是很耗时的。")]),t._v(" "),a("p",[t._v("写入流程别改进如下：")]),t._v(" "),a("ol",[a("li",[t._v("数据写入 buffer")]),t._v(" "),a("li",[t._v("每隔一定时间，buffer 中的数据被写入 segment 文件，但是先写入 os cache")]),t._v(" "),a("li",[t._v("只要 segment 写入 os cache，那就直接打开供 search 使用，不立即执行 commit")])]),t._v(" "),a("p",[t._v("数据写入 os cache，并被打开供搜索的过程，叫做 refresh，默认是每隔 1秒 refresh 一次。\n也就是说，每隔一秒就会将 buffer 中的数据写入一个新的 index segment file，先写入 os cache 中。所以，es 是近实时的，数据写入到可以被搜索，默认是 1秒。")]),t._v(" "),a("p",[a("img",{attrs:{src:e(998),alt:""}})]),t._v(" "),a("h2",{attrs:{id:"refresh-间隔修改"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#refresh-间隔修改"}},[t._v("#")]),t._v(" refresh 间隔修改")]),t._v(" "),a("p",[a("code",[t._v("POST /my_index/_refresh")]),t._v("，可以手动 refresh，一般不需要手动执行，没必要，让 es 自己搞就可以了")]),t._v(" "),a("p",[t._v("比如说，我们现在的时效性要求，比较低，只要求一条数据写入 es，一分钟以后才让我们搜索到就可以了，那么就可以调整 refresh interval")]),t._v(" "),a("div",{staticClass:"language-json line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-json"}},[a("code",[t._v("PUT /my_index\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"settings"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"refresh_interval"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"30s"')]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br")])]),a("p",[t._v("这里支持刷新到 os cache 中，commit （将 os cache 中的内容刷新到硬盘上）操作是什么时候调用的呢？稍后就会讲。。。")]),t._v(" "),a("h2",{attrs:{id:"durability-可靠存储"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#durability-可靠存储"}},[t._v("#")]),t._v(" durability 可靠存储")]),t._v(" "),a("p",[t._v("再次优化的写入流程(增加了 translog 文件)")]),t._v(" "),a("ol",[a("li",[a("p",[t._v("数据写入 buffer 缓冲和 translog 日志文件")])]),t._v(" "),a("li",[a("p",[t._v("每隔一秒钟，buffer 中的数据被写入新的 segment file，并进入 os cache，此时 segment 被打开并供 search 使用")])]),t._v(" "),a("li",[a("p",[t._v("buffer 被清空")])]),t._v(" "),a("li",[a("p",[t._v("重复 1~3，新的 segment 不断添加，buffer 不断被清空，而 translog 中的数据不断累加")])]),t._v(" "),a("li",[a("p",[t._v("当 translog 长度达到一定程度的时候，commit 操作发生")]),t._v(" "),a("ol",[a("li",[t._v("buffer 中的所有数据写入一个新的 segment，并写入 os cache，打开供使用")]),t._v(" "),a("li",[t._v("buffer 被清空")]),t._v(" "),a("li",[t._v("一个 commit ponit 被写入磁盘，标明了所有的 index segment")]),t._v(" "),a("li",[t._v("filesystem cache 中的所有 index segment file 缓存数据，被 fsync 强行刷到磁盘上")])])])]),t._v(" "),a("p",[a("img",{attrs:{src:e(999),alt:""}})]),t._v(" "),a("h2",{attrs:{id:"宕机后数据恢复流程"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#宕机后数据恢复流程"}},[t._v("#")]),t._v(" 宕机后数据恢复流程")]),t._v(" "),a("p",[t._v("基于 translog 和 commit point，如何进行数据恢复")]),t._v(" "),a("p",[a("img",{attrs:{src:e(1e3),alt:""}})]),t._v(" "),a("blockquote",[a("p",[t._v("flush 操作")])]),t._v(" "),a("p",[t._v("fsync + 清空 translog，就是 flush，默认每隔 30分钟 flush 一次，或者当 translog 过大的时候，也会 flush")]),t._v(" "),a("p",[a("code",[t._v("POST /my_index/_flush")]),t._v("，一般来说别手动 flush，让它自动执行就可以了")]),t._v(" "),a("blockquote",[a("p",[t._v("translog")])]),t._v(" "),a("p",[t._v("每隔 5秒 被 fsync 一次到磁盘上。在一次增删改操作之后，当 fsync 在 primary shard 和 replica shard 都成功之后，那次增删改操作才会成功")]),t._v(" "),a("p",[t._v("但是这种在一次增删改时强行 fsync translog 可能会导致部分操作比较耗时，也可以允许部分数据丢失，设置异步 fsync translog")]),t._v(" "),a("div",{staticClass:"language-json line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-json"}},[a("code",[t._v("PUT /my_index/_settings\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"index.translog.durability"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"async"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"index.translog.sync_interval"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"5s"')]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br")])]),a("h2",{attrs:{id:"海量磁盘文件合并"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#海量磁盘文件合并"}},[t._v("#")]),t._v(" 海量磁盘文件合并")]),t._v(" "),a("p",[t._v("每秒一个 segment file，文件过多，而且每次 search 都要搜索所有的 segment，很耗时")]),t._v(" "),a("p",[t._v("默认会在后台执行 segment merge 操作，在 merge 的时候，被标记为 deleted 的 document 也会被彻底物理删除")]),t._v(" "),a("p",[t._v("每次 merge 操作的执行流程")]),t._v(" "),a("ol",[a("li",[t._v("选择一些有相似大小的 segment，merge 成一个大的 segment")]),t._v(" "),a("li",[t._v("将新的 segment flush 到磁盘上去")]),t._v(" "),a("li",[t._v("写一个新的 commit point，包括了新的 segment，并且排除旧的那些 segment")]),t._v(" "),a("li",[t._v("将新的 segment 打开供搜索")]),t._v(" "),a("li",[t._v("将旧的 segment 删除")])]),t._v(" "),a("p",[a("img",{attrs:{src:e(1001),alt:""}})]),t._v(" "),a("h2",{attrs:{id:"optimize"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#optimize"}},[t._v("#")]),t._v(" "),a("code",[t._v("_optimize")])]),t._v(" "),a("p",[t._v("也就是上述讲解的 segment merge 操作")]),t._v(" "),a("p",[a("code",[t._v("OST /my_index/_optimize?max_num_segments=1")]),t._v("，尽量不要手动执行，让它自动默认执行就可以了")]),t._v(" "),a("p",[t._v("可以在 "),a("code",[t._v("elasticsearch-5.2.0\\data\\nodes\\0\\indices\\7jrPOaovTP6-Z0X9bUIowA\\0")]),t._v(" 看到一些文件")]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("index/segments_1\ntranslog/translog-1.tlog\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br")])])])}),[],!1,null,null,null);s.default=r.exports},996:function(t,s,e){t.exports=e.p+"assets/img/markdown-img-paste-20190120151200920.5b7061c2.png"},997:function(t,s,e){t.exports=e.p+"assets/img/markdown-img-paste-20190120151937731.b5c4205f.png"},998:function(t,s,e){t.exports=e.p+"assets/img/markdown-img-paste-2019012015381449.d7a85709.png"},999:function(t,s,e){t.exports=e.p+"assets/img/markdown-img-paste-20190120155115281.69dc5f00.png"}}]);