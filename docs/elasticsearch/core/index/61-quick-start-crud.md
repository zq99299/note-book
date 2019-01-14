# 快速上手手动创建、修改、删除索引
[[toc]]

## 为什么我们要手动创建索引？

在自动索引配置和 mapping 配置不符合我们要求的时候就需要手动管理了

## 创建索引

创建索引的语法

```json
PUT /my_index
{
    "settings": { ... any settings ... },
    "mappings": {
        "type_one": { ... any mappings ... },
        "type_two": { ... any mappings ... },
        ...
    }
}
```

> 创建索引的示例

```json
PUT /my_index
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "my_type": {
      "properties": {
        "my_field": {
          "type": "text"
        }
      }
    }
  }
}
```

## 修改索引

前面其实已经说到过，修改的时候好多都没法修改的。

```json
PUT /my_index/_settings
{
    "number_of_replicas": 1
}
```

## 删除索引

```json
// 删除的单个
DELETE /my_index
// 删除多个
DELETE /index_one,index_two
// 通配符删除
DELETE /index_*
// 删除所有
DELETE /_all
```

elasticsearch.yml 中有一个配置 ，设置为 true 后，就不允许删除所有索引了（为了安全）

```
action.destructive_requires_name: true
```
