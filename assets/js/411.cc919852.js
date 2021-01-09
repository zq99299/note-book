(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[411],{

/***/ "./docs/elasticsearch-senior/03-filter-bitset-caching.md":
/*!***************************************************************!*\
  !*** ./docs/elasticsearch-senior/03-filter-bitset-caching.md ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _03_filter_bitset_caching_md_vue_type_template_id_4ed8d520___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./03-filter-bitset-caching.md?vue&type=template&id=4ed8d520& */ "./docs/elasticsearch-senior/03-filter-bitset-caching.md?vue&type=template&id=4ed8d520&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");

var script = {}


/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_1__["default"])(
  script,
  _03_filter_bitset_caching_md_vue_type_template_id_4ed8d520___WEBPACK_IMPORTED_MODULE_0__["render"],
  _03_filter_bitset_caching_md_vue_type_template_id_4ed8d520___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./docs/elasticsearch-senior/03-filter-bitset-caching.md?vue&type=template&id=4ed8d520&":
/*!**********************************************************************************************!*\
  !*** ./docs/elasticsearch-senior/03-filter-bitset-caching.md?vue&type=template&id=4ed8d520& ***!
  \**********************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_vuepress_core_node_modules_cache_vuepress_cacheIdentifier_2e9acca5_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_1_0_node_modules_vue_loader_lib_index_js_ref_1_1_node_modules_vuepress_markdown_loader_index_js_ref_1_2_03_filter_bitset_caching_md_vue_type_template_id_4ed8d520___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/@vuepress/core/node_modules/.cache/vuepress","cacheIdentifier":"2e9acca5-vue-loader-template"}!../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../node_modules/cache-loader/dist/cjs.js??ref--1-0!../../node_modules/vue-loader/lib??ref--1-1!../../node_modules/@vuepress/markdown-loader??ref--1-2!./03-filter-bitset-caching.md?vue&type=template&id=4ed8d520& */ "./node_modules/cache-loader/dist/cjs.js?{\"cacheDirectory\":\"node_modules/@vuepress/core/node_modules/.cache/vuepress\",\"cacheIdentifier\":\"2e9acca5-vue-loader-template\"}!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./node_modules/@vuepress/markdown-loader/index.js?!./docs/elasticsearch-senior/03-filter-bitset-caching.md?vue&type=template&id=4ed8d520&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_vuepress_core_node_modules_cache_vuepress_cacheIdentifier_2e9acca5_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_1_0_node_modules_vue_loader_lib_index_js_ref_1_1_node_modules_vuepress_markdown_loader_index_js_ref_1_2_03_filter_bitset_caching_md_vue_type_template_id_4ed8d520___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_vuepress_core_node_modules_cache_vuepress_cacheIdentifier_2e9acca5_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_1_0_node_modules_vue_loader_lib_index_js_ref_1_1_node_modules_vuepress_markdown_loader_index_js_ref_1_2_03_filter_bitset_caching_md_vue_type_template_id_4ed8d520___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "./node_modules/cache-loader/dist/cjs.js?{\"cacheDirectory\":\"node_modules/@vuepress/core/node_modules/.cache/vuepress\",\"cacheIdentifier\":\"2e9acca5-vue-loader-template\"}!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./node_modules/@vuepress/markdown-loader/index.js?!./docs/elasticsearch-senior/03-filter-bitset-caching.md?vue&type=template&id=4ed8d520&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/@vuepress/core/node_modules/.cache/vuepress","cacheIdentifier":"2e9acca5-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/vue-loader/lib??ref--1-1!./node_modules/@vuepress/markdown-loader??ref--1-2!./docs/elasticsearch-senior/03-filter-bitset-caching.md?vue&type=template&id=4ed8d520& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ContentSlotsDistributor',{attrs:{"slot-key":_vm.$parent.slotKey}},[_c('h1',{attrs:{"id":"filter-原理剖析"}},[_c('a',{staticClass:"header-anchor",attrs:{"href":"#filter-原理剖析"}},[_vm._v("#")]),_vm._v(" filter 原理剖析")]),_vm._v(" "),_c('p',[_vm._v("核心是 bitset，还有 caching 机制")]),_vm._v(" "),_c('h2',{attrs:{"id":"_1-搜索数据-获取-document-list"}},[_c('a',{staticClass:"header-anchor",attrs:{"href":"#_1-搜索数据-获取-document-list"}},[_vm._v("#")]),_vm._v(" 1. 搜索数据，获取 document list")]),_vm._v(" "),_c('p',[_vm._v("在倒排索引中查找搜索串，获取 document list")]),_vm._v(" "),_c('p',[_vm._v("date 来举例")]),_vm._v(" "),_c('table',[_c('thead',[_c('tr',[_c('th',[_vm._v("word")]),_vm._v(" "),_c('th',[_vm._v("doc1")]),_vm._v(" "),_c('th',[_vm._v("doc2")]),_vm._v(" "),_c('th',[_vm._v("doc3")])])]),_vm._v(" "),_c('tbody',[_c('tr',[_c('td',[_vm._v("2017-01-01")]),_vm._v(" "),_c('td',[_vm._v("*")]),_vm._v(" "),_c('td',[_vm._v("*")]),_vm._v(" "),_c('td')]),_vm._v(" "),_c('tr',[_c('td',[_vm._v("2017-02-02")]),_vm._v(" "),_c('td'),_vm._v(" "),_c('td',[_vm._v("*")]),_vm._v(" "),_c('td',[_vm._v("*")])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v("2017-03-03")]),_vm._v(" "),_c('td',[_vm._v("*")]),_vm._v(" "),_c('td',[_vm._v("*")]),_vm._v(" "),_c('td',[_vm._v("*")])])])]),_vm._v(" "),_c('p',[_vm._v("filter：2017-02-02")]),_vm._v(" "),_c('p',[_vm._v("到倒排索引中一找，发现 2017-02-02 对应的 document list 是 doc2,doc3")]),_vm._v(" "),_c('h2',{attrs:{"id":"_2-构建-bitset"}},[_c('a',{staticClass:"header-anchor",attrs:{"href":"#_2-构建-bitset"}},[_vm._v("#")]),_vm._v(" 2. 构建 bitset")]),_vm._v(" "),_c('p',[_vm._v("为每个在倒排索引中搜索到的结果，构建一个 bitset，[0, 0, 0, 1, 0, 1]")]),_vm._v(" "),_c('p',[_vm._v("使用找到的 doc list 构建一个 bitset：就是一个二进制的数组，数组每个元素都是 0 或 1，\n用来标识一个 doc对一个 filter 条件是否匹配，如果匹配就是 1，不匹配就是 0")]),_vm._v(" "),_c('p',[_vm._v("如 filter：2017-02-02 ：[0, 1, 1]")]),_vm._v(" "),_c('ul',[_c('li',[_vm._v("doc1：不匹配这个 filter 的")]),_vm._v(" "),_c('li',[_vm._v("doc2 和 do3：是匹配这个 filter 的")])]),_vm._v(" "),_c('p',[_vm._v("尽可能用简单的数据结构去实现复杂的功能，可以节省内存空间，提升性能")]),_vm._v(" "),_c('h2',{attrs:{"id":"_3-遍历-bitset-查找满足条件的-documt"}},[_c('a',{staticClass:"header-anchor",attrs:{"href":"#_3-遍历-bitset-查找满足条件的-documt"}},[_vm._v("#")]),_vm._v(" 3. 遍历 bitset，查找满足条件的 documt")]),_vm._v(" "),_c('p',[_vm._v("遍历每个过滤条件对应的 bitset，优先从最稀疏的开始搜索，查找满足所有条件的 document")]),_vm._v(" "),_c('p',[_vm._v("后面会讲解，一次性其实可以在一个 search 请求中，发出多个 filter 条件，每个 filter 条件都会对应一个 bitset\n遍历每个 filter 条件对应的 bitset，先从最稀疏的开始遍历")]),_vm._v(" "),_c('div',{staticClass:"language- line-numbers-mode"},[_c('pre',{pre:true,attrs:{"class":"language-text"}},[_c('code',[_vm._v("[0, 0, 0, 1, 0, 0]：比较稀疏，可以简单任务是 1 最少的\n[0, 1, 0, 1, 0, 1]\n")])]),_vm._v(" "),_c('div',{staticClass:"line-numbers-wrapper"},[_c('span',{staticClass:"line-number"},[_vm._v("1")]),_c('br'),_c('span',{staticClass:"line-number"},[_vm._v("2")]),_c('br')])]),_c('p',[_vm._v("先遍历比较稀疏的 bitset，就可以先过滤掉尽可能多的数据；遍历所有的 bitset，找到匹配所有 filter 条件的doc")]),_vm._v(" "),_c('blockquote',[_c('p',[_vm._v("比如请求：filter，postDate=2017-01-01，userID=1")])]),_vm._v(" "),_c('div',{staticClass:"language- line-numbers-mode"},[_c('pre',{pre:true,attrs:{"class":"language-text"}},[_c('code',[_vm._v("postDate: [0, 0, 1, 1, 0, 0]\nuserID:   [0, 1, 0, 1, 0, 1]\n")])]),_vm._v(" "),_c('div',{staticClass:"line-numbers-wrapper"},[_c('span',{staticClass:"line-number"},[_vm._v("1")]),_c('br'),_c('span',{staticClass:"line-number"},[_vm._v("2")]),_c('br')])]),_c('p',[_vm._v("遍历完两个 bitset 之后，找到的匹配所有条件的 doc，就是 doc4 (都是 1)")]),_vm._v(" "),_c('p',[_vm._v("就可以将document作为结果返回给client了")]),_vm._v(" "),_c('h2',{attrs:{"id":"_4-caching-bitset"}},[_c('a',{staticClass:"header-anchor",attrs:{"href":"#_4-caching-bitset"}},[_vm._v("#")]),_vm._v(" 4. caching bitset")]),_vm._v(" "),_c('p',[_vm._v("caching bitset：跟踪 query，在最近 256个 query 中超过一定次数的过滤条件，缓存其 bitset。对于小 segment（<1000，或<3%），不缓存 bitset。")]),_vm._v(" "),_c('p',[_vm._v("比如 "),_c('code',[_vm._v("postDate=2017-01-01，[0, 0, 1, 1, 0, 0]")]),_vm._v("，可以缓存在内存中，\n这样下次如果再有这个条件过来的时候，就不用重新扫描倒排索引，反复生成 bitset，可以大幅度提升性能。")]),_vm._v(" "),_c('p',[_vm._v("在最近的 256 个 filter 中，有某个 filter 超过了一定的次数，次数不固定，就会自动缓存这个 filter 对应的 bitset")]),_vm._v(" "),_c('blockquote',[_c('p',[_vm._v("小 segment 不缓存")])]),_vm._v(" "),_c('p',[_vm._v("filter 针对小 segment 获取到的结果，可以不缓存，segment 记录数 <1000，或者 segment 大小 < index 总大小的 3%")]),_vm._v(" "),_c('p',[_vm._v("因为：")]),_vm._v(" "),_c('ul',[_c('li',[_vm._v("segment 数据量很小，此时哪怕是扫描也很快；")]),_vm._v(" "),_c('li',[_vm._v("segment 会在后台自动合并，小 segment 很快就会跟其他小 segment 合并成大 segment，此时就缓存也没有什么意义，segment 很快就消失了")])]),_vm._v(" "),_c('blockquote',[_c('p',[_vm._v("filter 与 query 相比的好处")])]),_vm._v(" "),_c('p',[_vm._v("好处就是 filter 会 caching，但是之前不知道 caching 的是什么东西，实际上并不是一个 filter 返回的完整的 doc list 数据结果。\n而是 filter bitset 缓存起来。下次不用扫描倒排索引了。")]),_vm._v(" "),_c('h2',{attrs:{"id":"_5-filter-大部分情况下会比-query-先执行"}},[_c('a',{staticClass:"header-anchor",attrs:{"href":"#_5-filter-大部分情况下会比-query-先执行"}},[_vm._v("#")]),_vm._v(" 5. filter 大部分情况下会比 query 先执行")]),_vm._v(" "),_c('p',[_vm._v("filter 大部分情况下来说，在 query 之前执行，先尽量过滤掉尽可能多的数据")]),_vm._v(" "),_c('ul',[_c('li',[_vm._v("query：是会计算 doc 对搜索条件的 relevance score，还会根据这个 score 去排序")]),_vm._v(" "),_c('li',[_vm._v("filter：只是简单过滤出想要的数据，不计算 relevance score，也不排序")])]),_vm._v(" "),_c('div',{staticClass:"custom-block tip"},[_c('p',{staticClass:"custom-block-title"},[_vm._v("TIP")]),_vm._v(" "),_c('p',[_vm._v("之前我一直以为 filter 是在 query 中条件查找之后，在结果上进行单纯的过滤操作。\n现在看来并不是这样")])]),_vm._v(" "),_c('h2',{attrs:{"id":"_6-有修改或者更新-cached-bitset-自动更新"}},[_c('a',{staticClass:"header-anchor",attrs:{"href":"#_6-有修改或者更新-cached-bitset-自动更新"}},[_vm._v("#")]),_vm._v(" 6. 有修改或者更新，cached bitset 自动更新")]),_vm._v(" "),_c('p',[_vm._v("如果 document 新增或修改，那么 cached bitset 会被自动更新")]),_vm._v(" "),_c('div',{staticClass:"language- line-numbers-mode"},[_c('pre',{pre:true,attrs:{"class":"language-text"}},[_c('code',[_vm._v("postDate=2017-01-01，[0, 0, 1, 0]\n\ndocument，id=5，postDate=2017-01-01，会自动更新到 postDate=2017-01-01 这个 filter 的 bitset 中，全自动，缓存会自动更新。postDate=2017-01-01的bitset，[0, 0, 1, 0, 1]\ndocument，id=1，postDate=2016-12-30，修改为 postDate-2017-01-01，此时也会自动更新 bitset，[1, 0, 1, 0, 1]\n")])]),_vm._v(" "),_c('div',{staticClass:"line-numbers-wrapper"},[_c('span',{staticClass:"line-number"},[_vm._v("1")]),_c('br'),_c('span',{staticClass:"line-number"},[_vm._v("2")]),_c('br'),_c('span',{staticClass:"line-number"},[_vm._v("3")]),_c('br'),_c('span',{staticClass:"line-number"},[_vm._v("4")]),_c('br')])]),_c('p',[_vm._v("以后只要是有相同的 filter 条件的，会直接来使用这个过滤条件对应的 cached bitset")])])}
var staticRenderFns = []



/***/ })

}]);
//# sourceMappingURL=411.cc919852.js.map