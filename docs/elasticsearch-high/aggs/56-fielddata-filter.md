# fielddata filter 的细粒度内存加载控制

可以通过 mappings 来定制每个 fielddata 的内存使用
```json
POST /test_index/_mapping/my_type
{
  "properties": {
    "my_field": {
      "type": "text",
      "fielddata": {
        "filter": {
          "frequency": {
            "min":              0.01,
            "min_segment_size": 500  
          }
        }
      }
    }
  }
}
```
- min：仅仅加载至少在 1% 的 doc 中出现过的 term 对应的 fielddata

  比如说总共有 1000 个 doc，hello 这个值必须在 10 个 doc 中出现，那么这个 hello 对应的 fielddata 才会加载到内存中来

- min_segment_size：少于 500 doc 的 segment 不加载 fielddata

  加载 fielddata 的时候，也是按照 segment 去进行加载的，某个 segment 里面的 doc 数量少于 500 个，那么这个 segment 的 fielddata 就不加载

这个，就我的经验来看，有点底层了，一般不会去设置它，大家知道就好
