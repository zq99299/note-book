# most_fields 策略 cross-fields 搜索弊端
cross-fields （跨字段）搜索：一个唯一标识，跨了多个 field。比如一个人，标识，是姓名；
一个建筑，它的标识是地址。姓名可以散落在多个 field 中，比如 first_name 和 last_name 中，
地址可以散落在 country、province、city中。

跨多个 field 搜索一个标识，比如搜索一个人名，或者一个地址，就是 cross-fields 搜索

初步来说，如果要实现，可能用 most_fields 比较合适。因为 best_fields 是优先搜索单个 field 最匹配的结果，
cross-fields 本身就不是一个 field 的问题了。

增加字段数据

```json
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"author_first_name" : "Peter", "author_last_name" : "Smith"} }
{ "update": { "_id": "2"} }
{ "doc" : {"author_first_name" : "Smith", "author_last_name" : "Williams"} }
{ "update": { "_id": "3"} }
{ "doc" : {"author_first_name" : "Jack", "author_last_name" : "Ma"} }
{ "update": { "_id": "4"} }
{ "doc" : {"author_first_name" : "Robbin", "author_last_name" : "Li"} }
{ "update": { "_id": "5"} }
{ "doc" : {"author_first_name" : "Tonny", "author_last_name" : "Peter Smith"} }
```

查询
```json
GET /forum/article/_search
{
  "query": {
    "multi_match": {
      "query":       "Peter Smith",
      "type":        "most_fields",
      "fields":      [ "author_first_name", "author_last_name" ]
    }
  }
}
```

响应结果

```json
{
  "took": 118,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 3,
    "max_score": 0.6931472,
    "hits": [
      {
        "_index": "forum",
        "_type": "article",
        "_id": "2",
        "_score": 0.6931472,
        "_source": {
          "articleID": "KDKE-B-9947-#kL5",
          "userID": 1,
          "hidden": false,
          "postDate": "2017-01-02",
          "tag": [
            "java"
          ],
          "tag_cnt": 1,
          "view_cnt": 50,
          "title": "this is java blog",
          "content": "i think java is the best programming language",
          "sub_title": "learned a lot of course",
          "author_first_name": "Smith",
          "author_last_name": "Williams"
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "1",
        "_score": 0.5753642,
        "_source": {
          "articleID": "XHDK-A-1293-#fJ3",
          "userID": 1,
          "hidden": false,
          "postDate": "2017-01-01",
          "tag": [
            "java",
            "hadoop"
          ],
          "tag_cnt": 2,
          "view_cnt": 30,
          "title": "this is java and elasticsearch blog",
          "content": "i like to write best elasticsearch article",
          "sub_title": "learning more courses",
          "author_first_name": "Peter",
          "author_last_name": "Smith"
        }
      },
      {
        "_index": "forum",
        "_type": "article",
        "_id": "5",
        "_score": 0.51623213,
        "_source": {
          "articleID": "DHJK-B-1395-#Ky5",
          "userID": 3,
          "hidden": false,
          "postDate": "2019-01-28",
          "tag": [
            "elasticsearch"
          ],
          "tag_cnt": 1,
          "view_cnt": 10,
          "title": "this is spark blog",
          "content": "spark is best big data solution based on scala ,an programming language similar to java",
          "sub_title": "haha, hello world",
          "author_first_name": "Tonny",
          "author_last_name": "Peter Smith"
        }
      }
    ]
  }
}
```

会发现 id=5 的 `"author_last_name": "Peter Smith"` 居然是排在最后面的，
我们想要的结果应该就是 id=5 这条数据了，造成这个结果的原因如下：


- 只是找到尽可能多的 field 匹配的 doc，而不是某个 field 完全匹配的 doc
- most_fields 没办法用 minimum_should_match 去掉长尾数据，就是匹配的特别少的结果
- TF/IDF算法，

    比如 Peter Smith 和 Smith Williams，搜索 Peter Smith 的时候，由于 first_name 中很少有 Smith 的，
    所以 query 在所有 document 中的频率很低，得到的分数很高，可能 Smith Williams 反而会排在 Peter Smith 前面

    注意：该算法在本教程中有时候的解释并不是完全正确，只大概是这样
