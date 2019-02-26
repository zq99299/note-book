# ik 分词器的安装与简单使用
[[toc]]

之前大家会发现，我们全部是用英文在玩儿，不太好玩

中国人，其实我们用来进行搜索的，绝大多数，都是中文应用，很少做英文的

standard：没有办法对中文进行合理分词的，只是将每个中文字符一个一个的切割开来，比如说「中国人」就会简单的拆分为 中、国、人

所以说，我们利用核心知识篇的相关的知识，来把 es 这种英文原生的搜索引擎，先学一下;
因为有些知识点，可能用英文讲更靠谱，因为比如说 analyzed、palyed、students 进行 stemmer 后会变成 analyze，play，student，
那么使用中文来讲的话，这个就不好讲了，有些知识点，仅仅适用于英文，不太适用于中文

从这一讲开始，大家就会觉得很爽，因为全部都是我们熟悉的中文了，没有英文了，高阶知识点，搜索，聚合，全部是中文了

## ik 分词器简介
在搜索引擎领域，比较成熟和流行的，就是 ik 分词器

比如：中国人很喜欢吃油条

- standard：中 国 人 很 喜 欢 吃 油 条
- ik：中国人 很 喜欢 吃 油条

看下上面分词后的结果，肯定是 ik 的分词结果比较符合中文

## 安装 ik 分词器
在 elasticsearch 中安装 ik 中文分词器

```bash
# 自己拉取源码进行打包
git clone https://github.com/medcl/elasticsearch-analysis-ik
git checkout tags/v5.2.0
mvn package
```
1. 将 target/releases/elasticsearch-analysis-ik-5.2.0.zip 拷贝到 es/plugins/ik 目录下
2. 在 es/plugins/ik 下对 elasticsearch-analysis-ik-5.2.0.zip 进行解压缩

    比如 `elasticsearch-5.2.0\plugins\ik` 该文件夹下就是所有的解压缩内容
3. 重启 es

::: tip
在 windows 下安装中间件等开发软件，路径中最好不要有空格，否则会莫名其妙的错误
:::

## ik 分词器基础知识

两种 analyzer，你根据自己的需要自己选吧，但是一般是选用 ik_max_word

- ik_max_word 会将文本做最细粒度的拆分

    比如会将「中华人民共和国国歌」拆分为：中华人民共和国、中华人民、中华、华人、人民共和国、人民、人、民、共和国、共和、和、国国、国歌，会穷尽各种可能的组合；
- ik_smart 最粗粒度的拆分

    比如会将「中华人民共和国国歌」拆分为：中华人民共和国、国歌。

显而易见在搜索效果中来说，拆分越细粒度的搜索效果越好，比如搜索「共和国」在「中华人民共和国、国歌」索引中能搜索到吗？

## ik 分词器的使用

安装完后，就可以使用 `_analyze` 语法验证

```json
GET /_analyze
{
  "text": "中华人民共和国国歌",
  "analyzer": "ik_smart"
}
```
响应结果
```json
{
  "tokens": [
    {
      "token": "中华人民共和国",
      "start_offset": 0,
      "end_offset": 7,
      "type": "CN_WORD",
      "position": 0
    },
    {
      "token": "国歌",
      "start_offset": 7,
      "end_offset": 9,
      "type": "CN_WORD",
      "position": 1
    }
  ]
}
```

插入实验数据

```json
PUT /my_index
{
  "mappings": {
    "my_type": {
      "properties": {
        "text": {
          "type": "text",
          "analyzer": "ik_max_word"
        }
      }
    }
  }
}
```

```json
POST /my_index/my_type/_bulk
{ "index": { "_id": "1"} }
{ "text": "男子偷上万元发红包求交女友 被抓获时仍然单身" }
{ "index": { "_id": "2"} }
{ "text": "16岁少女为结婚“变”22岁 7年后想离婚被法院拒绝" }
{ "index": { "_id": "3"} }
{ "text": "深圳女孩骑车逆行撞奔驰 遭索赔被吓哭(图)" }
{ "index": { "_id": "4"} }
{ "text": "女人对护肤品比对男票好？网友神怼" }
{ "index": { "_id": "5"} }
{ "text": "为什么国内的街道招牌用的都是红黄配？" }
```

查询

```json
GET /my_index/my_type/_search
{
  "query": {
    "match": {
      "text": "16岁少女结婚好还是单身好？"
    }
  }
}
```

响应结果

```json
{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 3,
    "max_score": 3.603062,
    "hits": [
      {
        "_index": "my_index",
        "_type": "my_type",
        "_id": "2",
        "_score": 3.603062,
        "_source": {
          "text": "16岁少女为结婚“变”22岁 7年后想离婚被法院拒绝"
        }
      },
      {
        "_index": "my_index",
        "_type": "my_type",
        "_id": "4",
        "_score": 1.3862944,
        "_source": {
          "text": "女人对护肤品比对男票好？网友神怼"
        }
      },
      {
        "_index": "my_index",
        "_type": "my_type",
        "_id": "1",
        "_score": 0.2699054,
        "_source": {
          "text": "男子偷上万元发红包求交女友 被抓获时仍然单身"
        }
      }
    ]
  }
}
```

对于这个结果像了解更详细的可以使用 [explain](/elasticsearch-core/search-engine/50-query-example.md#validate-explain) 查看每个文档中的倒排索引得分情况
