# 基于共享锁和排他锁实现悲观锁并发控制

## 读写锁概念

- 共享锁：所有线程都可获得该锁，用于读取数据
- 排他锁：只能有一个线程获得该锁，用于写数据

共享锁和排他锁的作用是读写分离，但是共享锁和排他锁是互斥的：

- 有共享锁则排他锁不能被获取
- 有排他锁则共享锁不能被获取

简单说就是读写操作只能存在一种

::: tip
在我的认知里面读写分离，是为了解决写数据并发竞争，提高读并发性能，因为适合于读大于写的场景；

但是有一个问题，有可能一直不释放造成写饥饿？
:::


下面来实现读写锁实验

## 共享锁/读锁获取

```json
POST /fs/lock/1/_update
{
  "upsert": {
    "lock_type": "shared",
    "lock_count": 1
  },
  "script": {
     "lang": "groovy",
     "inline": "if ( ctx._source.lock_type == 'exclusive' ) { assert false }; ctx._source.lock_count++;"
  }
}

多次获取共享锁结果
{
  "_index": "fs",
  "_type": "lock",
  "_id": "1",
  "_version": 6,
  "found": true,
  "_source": {
    "lock_type": "shared",
    "lock_count": 2
  }
}
```

- lock_type：shared 共享锁/读锁、exclusive 排他锁/写锁
- lock_count：锁持有数量，用于共享锁的统计
- script：当时共享锁的时候，将 lock_count 自增 1

## 获取排他锁

利用 create 语法来创建，当该 doc 存在的时候，就会报错

```json
PUT /fs/lock/1/_create
{ "lock_type": "exclusive" }

报错如下
{
  "error": {
    "root_cause": [
      {
        "type": "version_conflict_engine_exception",
        "reason": "[lock][1]: version conflict, document already exists (current version [6])",
        "index_uuid": "ksKH094bQQuh7PaGY8Jb7w",
        "shard": "3",
        "index": "fs"
      }
    ],
    "type": "version_conflict_engine_exception",
    "reason": "[lock][1]: version conflict, document already exists (current version [6])",
    "index_uuid": "ksKH094bQQuh7PaGY8Jb7w",
    "shard": "3",
    "index": "fs"
  },
  "status": 409
}
```

有共享锁在的话，就需要读线程在操作完成之后释放自己的共享锁

## 释放共享锁

每次执行该操作，就将锁数量自减 1，当等于 0 的时候就删除自己。这样排他锁就能上锁成功了
```json{13}
POST /fs/lock/1/_update
{
  "script": "if(--ctx._source.lock_count == 0){ ctx.op = 'delete'}"
}

被删除时返回的数据：result=deleted

{
  "_index": "fs",
  "_type": "lock",
  "_id": "1",
  "_version": 8,
  "result": "deleted",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  }
}
```

## 释放排他锁
通过删除 doc 来达到释放

```json
DELETE /fs/lock/1
```

## 小结
以自己的观点来看，都是利用了 es 的 doc 创建报错语法和脚本判定等语法来保证数据的竞争上锁的。
