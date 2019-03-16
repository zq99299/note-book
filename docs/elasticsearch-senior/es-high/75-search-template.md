# 使用 search template 将搜索模板化
[[toc]]


搜索模板 search template 高级功能，就可以将我们的一些搜索进行模板化，
每次执行这个搜索，就直接调用模板，给传入一些参数就可以了

越高级的功能，越少使用，可能只有在你真的遇到特别合适的场景的时候，才会去使用某个高级功能。
但是，这些高级功能你是否掌握，其实就是普通的 es 开发人员，和 es 高手之间的一个区别。
高手，一般来说，会把一个技术掌握的特别好，特别全面，特别深入，也许他平时用不到这个技术，
但是当真的遇到一定的场景的时候，高手可以基于自己的深厚的技术储备，立即反应过来，找到一个合适的解决方案。

如果是一个普通的技术人员，一般只会学习跟自己当前工作相关的一些知识和技术，只要求自己掌握的技术可以解决工作目前遇到的问题就可以了，
就满足了，就会止步不前了，然后就不会更加深入的去学习一个技术。
但是，当你的项目真正遇到问题的时候，遇到了一些难题，你之前的那一点技术储备已经没法去应付这些更加困难的问题了，
此时，普通的技术人员就会扎耳挠腮，没有任何办法。

高手，对技术是很有追求，能够精通很多自己遇到过的技术，但是也许自己学的很多东西，
自己都没用过，但是不要紧，这是你的一种技术储备。

## 何为 search template?
简单说类似 mysql 的视图，指定模板和参数即可。

先来看一个入门的使用方式，

inline 和之前的脚本类似，直接写模板，还支持文件方式

```json
GET /blog_website/_search/template
{
  "inline":{
    "query": {
      "match": {
        "{{field}}": "{{value}}"
      }
    }
  },
  "params": {
    "field": "content",
    "value": "博客"
  }
}
```

## toJson
限制：inline 的内容只能在一行上

```json
GET /blog_website/_search/template
{
  "inline": "{\"query\": {\"match\": {{#toJson}}matchCondition{{/toJson}}}}",
  "params": {
    "matchCondition":{
      "content":"博客"
    }
  }
}
```

## join
作用：把一个数组转为具体分隔符的字符串连接起来

如下效果：会吧 titles 数组转成 「博客 网站」，delimiter 规定了连接符是什么

```json
GET /blog_website/blogs/_search/template
{
  "inline": {
    "query": {
      "match": {
        "title": "{{#join delimiter=' '}}titles{{/join delimiter=' '}}"
      }
    }
  },
  "params": {
    "titles": ["博客", "网站"]
  }
}
```

以上模板渲染后会变成以下语法

```json
GET /blog_website/blogs/_search
{
  "query": {
    "match" : {
      "title" : "博客 网站"
    }
  }
}
```

## default value
增加一个 views 字段

```json
POST /blog_website/blogs/1/_update
{
  "doc": {
    "views": 5
  }
}
```

```json
GET /blog_website/blogs/_search/template
{
  "inline": {
    "query": {
      "range": {
        "views": {
          "gte": "{{start}}",
          "lte": "{{end}}{{^end}}20{{/end}}"
        }
      }
    }
  },
  "params": {
    "start": 1,
    "end": 10
  }
}
```

如上指定了两个参数，并使用

```
 {{^end}}20
```

指定了 end 的默认值为 20，
当 params.end 没有指定的之后，就会使用默认值 20

## conditional
插入一条数据

```json
POST /my_index/my_type/10
{
  "line":"我的博客",
  "line_no": 5
}
```

查询语法

```json
GET /my_index/my_type/_search/template
{
  "file": "conditional",
  "params": {
    "text": "博客",
    "line_no": true,
    "start": 1,
    "end": 10
  }
}
```
看到 file 就知道需要事先准备好模板文件了，文件名以后缀 `.mustache` 结尾

`config\scripts\conditonal.mustache`

```
{
  "query": {
    "bool": {
      "must": {
        "match": {
          "line": "{{text}}"
        }
      },
      "filter": {
        {{#line_no}}
          "range": {
            "line_no": {
              {{#start}}
                "gte": "{{start}}"
                {{#end}},{{/end}}
              {{/start}}
              {{#end}}
                "lte": "{{end}}"
              {{/end}}
            }
          }
        {{/line_no}}
      }
    }
  }
}
```

这个意思是要对应  params 里面的参数来看，`#line_no` 以 「#」开头的为条件判定语法，
只要存在该参数，即打开对应的模板条件

添加文件之后，记得重启 es

## 适应场景

提供一个思路

比如说，一般在大型的团队中，可能不同的人，都会想要执行一些类似的搜索操作，
这个时候，有一些负责底层运维的一些同学，就可以基于 search template，封装一些模板出来，
放在各个 es 进程的 scripts 目录下，其他的团队，其实就不用各个团队自己反复手写复杂的通用的查询语句了，直接调用某个搜索模板，传入一些参数就好了
