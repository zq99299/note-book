# bool 组合多个 filter 搜索
[[toc]]

## 第一个例子

需求如下：

- 搜索发帖日期为 2017-01-01 或者帖子 ID 为 XHDK-A-1293-#fJ3 的帖子
- 同时要求帖子的发帖日期绝对不为 2017-01-02

用 sql 来表示大致是这样

```sql
select * from forum.article
where (post_date='2017-01-01' or article_id='XHDK-A-1293-#fJ3')
and post_date!='2017-01-02'
```

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "bool": {
          "should":[
            {"term":{"postDate":"2017-01-01"}},
            {"term":{"articleID":"XHDK-A-1293-#fJ3"}}
          ],
          "must_not":{
            "term":{
              "postDate":"2017-01-02"
            }
          }
        }
      }
    }
  }
}
```

::: tip
这个语法提示在 kibana 中没有提示的！！！
:::

## 第二个例子

- 搜索帖子 ID 为 XHDK-A-1293-#fJ3
- 或者帖子 ID 为 JODL-X-1937-#pV7 而且发帖日期为 2017-01-01 的帖子


```sql
select * from forum.article
where article_id='XHDK-A-1293-#fJ3'
or (article_id='JODL-X-1937-#pV7' and post_date='2017-01-01')
```

```json
GET /forum/article/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "bool": {
          "should":[
            {"term":{"articleID":"XHDK-A-1293-#fJ3"}},
            {"bool":{
                "must":[
                  {"term":{"articleID":"JODL-X-1937-#pV7"}},
                  {"term":{"postDate":"2017-01-01"}}
                ]
              }
            }
          ]
        }
      }
    }
  }
}
```

## 总结

- bool：must，must_not，should，组合多个过滤条件
- bool 可以嵌套
- 相当于 SQL 中的多个 and 条件：当你把搜索语法学好了以后，基本可以实现部分常用的 sql 语法对应的功能

::: tip
好多语法提示在 kibana 中没有提示的！！！，重要的事情多说几遍，以前一直以为没有提示就是不支持
:::
