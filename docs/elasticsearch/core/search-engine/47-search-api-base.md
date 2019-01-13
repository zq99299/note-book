# search api 的基础语法介绍

[[toc]]

## search api的基本语法

```json
GET /search
{}
```

多 index/type 查询

```json
GET /index1,index2/type1,type2/search
{}
```

分页查询

```json
GET /_search
{
  "from": 0,
  "size": 10
}
```json

## http 协议中 get 是否可以带上 request body

HTTP协议，一般不允许 get 请求带上 request body，但是因为 get 更加适合描述查询数据的操作，因此还是这么用了

```json
GET /_search?from=0&size=10

POST /_search
{
  "from":0,
  "size":10
}
```

碰巧，很多浏览器，或者是服务器，也都支持 GET+request body 模式

如果遇到不支持的场景，也可以用 `POST /_search`

::: tip
HTTP 协议是规定不允许 get 携带 body 的，对于 es 来说他自己接收请求解析了 body。
:::
