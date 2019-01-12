# multi-index/type 搜索模式
[[toc]]

1. multi-index 和 multi-type 搜索模式
2. 初步图解一下简单的搜索原理

## multi-index/type 搜索模式
告诉你如何一次性搜索多个index和多个type下的数据

- `/_search`：所有索引，所有 type 下的所有数据都搜索出来
- `/index1/_search`：指定一个 index，搜索其下所有 type 的数据
- `/index1,index2/_search`：同时搜索两个index下的数据
- `/*1,*2/_search`：按照通配符去匹配多个索引
- `index1/type1/_search`：搜索一个 index 下指定的 type 的数据
- `index1/type1,type2/_search`：可以搜索一个 index 下多个 type的数据
- `index1,index2/type1,type2/_search`：搜索多个 index 下的多个 type的数据
- `_all/type1,type2/_search`: `_all`，可以代表搜索所有 index 下的指定 type 的数据


## 初步图解一下简单的搜索原理

![](./assets/markdown-img-paste-20190112163551615.png)
