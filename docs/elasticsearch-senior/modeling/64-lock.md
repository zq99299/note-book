# 基于全局锁实现悲观锁并发控制

## 悲观锁介绍
之前讲解了基于 version 的乐观锁并发控制

在数据建模章节，结合文件系统建模的这个案例，把悲观锁的并发控制，3 种锁粒度都给大家仔细讲解一下

本章讲解：最粗的一个粒度，全局锁

考虑一个场景：多个线程，并发地给 /workspace/projects/helloworld 下的 README.txt 修改文件名

- 乐观锁：
  1. get current version
  2. 带着这个 current version 去执行修改，如果一旦发现数据已经被别人给修改了，
  version 号跟之前自己获取的已经不一样了; 那么必须重新获取新的 version 号再次尝试修改
- 悲观锁
  1. 上来就先加锁
  2. 此时就只有你一个能对这数据进行修改

## 全局锁
第一种锁，全局锁：直接锁掉整个 fs index

::: tip
在应用中，利用 `_create` 语法，创建空的 doc ，让 es 保证只能有一个被创建成功的思路
:::

```json
PUT /fs/lock/global/_create
{}
```
- fs: 你要上锁的那个 index
- lock: 就是你指定的一个对这个 index 上全局锁的一个 type
- global: 就是你上的全局锁对应的这个 doc 的 id
- `_create`：强制必须是创建，如果 /fs/lock/global 这个 doc 已经存在，那么创建失败，报错

利用了 doc 来进行上锁 `/fs/lock/global  /index/type/id --> doc`

重复执行该创建语法就会报错，那么没有抢占到锁的线程需要重复此操作

```json
{
  "error": {
    "root_cause": [
      {
        "type": "version_conflict_engine_exception",
        "reason": "[lock][global]: version conflict, document already exists (current version [1])",
        "index_uuid": "IYbj0OLGQHmMUpLfbhD4Hw",
        "shard": "2",
        "index": "fs"
      }
    ],
    "type": "version_conflict_engine_exception",
    "reason": "[lock][global]: version conflict, document already exists (current version [1])",
    "index_uuid": "IYbj0OLGQHmMUpLfbhD4Hw",
    "shard": "2",
    "index": "fs"
  },
  "status": 409
}
```

抢占到该锁的线程，就可以执行各种操作了，比如完成上面的需求，修改文件名称

```json
POST /fs/file/1/_update
{
  "doc": {
    "name": "README-update.txt"
  }
}
```

操作完成后，释放当前的锁，也就是删除那个空的 doc

```json
DELETE /fs/lock/global
```

这个时候，另外一个线程就会创建成功，然后执行它自己的逻辑

## 全局锁的优点和缺点

- 优点：操作非常简单，非常容易使用，成本低
- 缺点：你直接就把整个 index 给上锁了，这个时候对 index 中所有的 doc 的操作，都会被 block 住，导致整个系统的并发能力很低

::: warning
这里只是利用了另外一个 type 来创建空的 doc，这样应该是一条 doc 吧？
怎么说是整个 index 呢？难道意思是说所有的使用都是用这一个 doc？ `/fs/lock/global`

如果所有的都用这一个 doc 的话，那么的确的全局的
:::

什么时候使用？
上锁解锁的操作不是频繁，每次上锁之后，执行的操作的耗时不会太长
