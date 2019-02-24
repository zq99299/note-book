# copy_to 解决 cross-fields
上一节使用 most_fields 来解决多字段搜索的需求的弊端中最最核心的问题就是有跨字段搜索了，
那么这里就可以使用 copy_to 来让多个字段组合成一个字段

需要先 mapping ，这里新增加字段

```json
PUT /forum/_mapping/article
{
  "properties": {
      "new_author_first_name": {
          "type":     "string",
          "copy_to":  "new_author_full_name"
      },
      "new_author_last_name": {
          "type":     "string",
          "copy_to":  "new_author_full_name"
      },
      "new_author_full_name": {
          "type":     "string"
      }
  }
}
```

再增加数据

```json
POST /forum/article/_bulk
{ "update": { "_id": "1"} }
{ "doc" : {"new_author_first_name" : "Peter", "new_author_last_name" : "Smith"} }		
{ "update": { "_id": "2"} }
{ "doc" : {"new_author_first_name" : "Smith", "new_author_last_name" : "Williams"} }		
{ "update": { "_id": "3"} }
{ "doc" : {"new_author_first_name" : "Jack", "new_author_last_name" : "Ma"} }		
{ "update": { "_id": "4"} }
{ "doc" : {"new_author_first_name" : "Robbin", "new_author_last_name" : "Li"} }		
{ "update": { "_id": "5"} }
{ "doc" : {"new_author_first_name" : "Tonny", "new_author_last_name" : "Peter Smith"} }	 
```

注意：在查询的时候 new_author_full_name 字段并不会显示出来，在查询 mapping 的时候才能看到

::: warning
该章节示例的测试不能解决我们的需求，因为该打分的的策略没有彻底搞明白的缘故。所以复现不出来了
:::

这几章节的内容其实就是讲解了什么场景下使用：best_fields、most_fields 
