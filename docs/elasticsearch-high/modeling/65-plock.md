# 基于 document 锁实现悲观锁并发控制


全局锁一次性就锁整个 index，对这个 index 的所有增删改操作都会被 block 住，如果上锁不频繁，还可以，比较简单

细粒度的一个锁：document 锁，每次只对你要操作的 doc 进行上锁。不影响其他 doc

document 锁的思路，是用 [脚本](/elasticsearch-core/distributed-document/23-partial-update.md#upsert-操作) 进行上锁，如下

```json
POST /fs/lock/1/_update
{
  "upsert": { "process_id": 123 },
  "script": {
     "lang": "groovy",
     "inline": "if ( ctx._source.process_id != process_id ) { assert false }; ctx.op = 'noop';",        "params": {
       "process_id": 123
     }
  }
}
```

- upsert：指定的 doc 不存在的时候使用该内容初始化 doc
- script：指定的 doc 存在的时候使用该脚本
- params：script 中可以使用
- process_id：

  充当一个唯一标识，比如：某个服务实例 ID + 当前操作的线程 ID 组成一个唯一标识
- assert false，不是当前进程加锁的话，则抛出异常
- ctx.op='noop'，不做任何修改

::: tip
这里需要传入参数，会导致 es 识别脚本语言有误，所以这里需要明确协商 groovy；
同时，inline 默认是禁止的，之前讲过用文件方式，文件方式是默认支持的

开启 inline 需要在 elasticsearch.yml 配置文件中增加属性 `script.inline: on`

完成之后需要重启 es
:::

当 process_id 相等的时候返回的数据如下

```json
{
  "_index": "fs",
  "_type": "lock",
  "_id": "1",
  "_version": 3,
  "result": "noop",
  "_shards": {
    "total": 0,
    "successful": 0,
    "failed": 0
  }
}
```

当 process_id 不相等的时候返回的数据如下

```json
{
  "error": {
    "root_cause": [
      {
        "type": "remote_transport_exception",
        "reason": "[KHsngUp][127.0.0.1:9300][indices:data/write/update[s]]"
      }
    ],
    "type": "illegal_argument_exception",
    "reason": "failed to execute script",
    "caused_by": {
      "type": "script_exception",
      "reason": "error evaluating if ( ctx._source.process_id != process_id ) { assert false }; ctx.op = 'noop';",
      "caused_by": {
        "type": "power_assertion_error",
        "reason": "assert false\n"
      },
      "script_stack": [],
      "script": "",
      "lang": "groovy"
    }
  },
  "status": 400
}
```

还可以执行下 [refresh](/elasticsearch-core/67-kernel-principle-decryption.md#refresh-间隔修改) 加速生效

```json
POST /fs/_refresh
```

加锁成之后就可以处理自己的业务操作了。处理完成之后释放锁

```json
DELETE /fs/lock/1
```

或者使用批量语法解锁

```json
PUT /fs/lock/_bulk
{ "delete": { "_id": 1}}
```
