# 2 节点 shard & replica 机制

图解 2个 node 环境下 replica shard 是如何分配的

1. replica shard 分配：3个 primary shard，3个 replica shard，1 node
2. primary ---> replica 同步
3. 读请求：primary/replica

再启动一个 es 实例后，再次查看：


health status 变成了 green； shards 变成了 18

```json
GET /_cat/health?v

epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1546324075 14:27:55  elasticsearch green           2         2     18   9    0    0        0             0                  -                100.0%

```

indices 是没有任何变化的

```json
GET /_cat/indices?v

health status index      uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   ecommerce  ZpGp7bIBQBaZFk9SYmbJVQ   5   1          4            0     44.5kb         22.2kb
green  open   test_index g4RJx2v8TXK95LdwlhRx5A   3   1          0            0       780b           390b
green  open   .kibana    id1SV_oGSjyGosKxeJApww   1   1          1            0      6.3kb          3.1kb

```

![](./assets/markdown-img-paste-2019010114333074.png)
