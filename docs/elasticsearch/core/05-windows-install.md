# windows 上启动 Elasticsearch

1. 安装 JDK，至少 1.8.0_73 以上版本，java -version
2. 下载和解压缩 Elasticsearch 安装包 elasticsearch-5.2.0.zip，并了解目录结构
3. 启动 Elasticsearch：bin\elasticsearch.bat，

    es本身特点之一就是开箱即用，如果是中小型应用，数据量少，操作不是很复杂，直接启动就可以用了

4. 检查ES是否启动成功：http://localhost:9200/?pretty
    ```json
    name: node名称
    cluster_name: 集群名称（默认的集群名称就是elasticsearch）
    version.number: 5.2.0，es版本号

    {
      "name" : "4onsTYV",
      "cluster_name" : "elasticsearch",
      "cluster_uuid" : "nKZ9VK_vQdSQ1J0Dx9gx1Q",
      "version" : {
        "number" : "5.2.0",
        "build_hash" : "24e05b9",
        "build_date" : "2017-01-24T19:52:35.800Z",
        "build_snapshot" : false,
        "lucene_version" : "6.4.0"
      },
      "tagline" : "You Know, for Search"
    }
    ```
5. 修改集群名称：elasticsearch.yml
6. 下载和解压缩 Kibana 安装包 kibana-5.2.0-windows-x86.zip

    使用里面的开发界面，去操作 elasticsearch，作为我们学习es知识点的一个主要的界面入口
7. 启动Kibana：bin\kibana.bat
8. 进入Dev Tools界面
9. GET _cluster/health

    ```JSON
    {
      "cluster_name": "elasticsearch",
      "status": "yellow",
      "timed_out": false,
      "number_of_nodes": 1,
      "number_of_data_nodes": 1,
      "active_primary_shards": 1,
      "active_shards": 1,
      "relocating_shards": 0,
      "initializing_shards": 0,
      "unassigned_shards": 1,
      "delayed_unassigned_shards": 0,
      "number_of_pending_tasks": 0,
      "number_of_in_flight_fetch": 0,
      "task_max_waiting_in_queue_millis": 0,
      "active_shards_percent_as_number": 50
    }
    ```
