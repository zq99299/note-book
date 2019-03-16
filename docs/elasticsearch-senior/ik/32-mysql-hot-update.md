# 使用 mysql 来达到热更新 ik 词库

## 什么是热更新？

修改扩展词的时候，每次都需要手动在配置文件中增加，并且需要重启 es 才能生效，
es 是分布式的，可能有数百个节点，你不能每次都一个一个节点上面去修改。

es 不停机，直接我们在外部某个地方添加新的词语，es 中立即热加载到这些新词语，这就是热更新效果

## 热更新的方案

- 修改 ik 分词器源码，然后手动支持从 mysql 中每隔一定时间，自动加载新的词库
- 基于 ik 分词器原生支持的热更新方案

    部署一个 web 服务器，提供一个 http 接口，通过 modified 和 tag 两个 http 响应头，来提供词语的热更新
    这个远程更新的可以在源码中找到。使用数据库加载的时候就可以参考这个是怎么把词语放到内存中的

用第一种方案，第二种 ik git 社区官方都不建议采用，觉得不太稳定

1. 下载源码

    https://github.com/medcl/elasticsearch-analysis-ik/tree/v5.2.0
    ik 分词器，是个标准的 java maven 工程

2. 修改源码

    主要思路：
    ```java
    Dictionary类，169行：Dictionary 单例类的初始化方法，在这里需要创建一个我们自定义的线程，并且启动它
    HotDictReloadThread 类：就是死循环，不断调用 Dictionary.getSingleton().reLoadMainDict()，去重新加载词典
    Dictionary类，389行：this.loadMySQLExtDict();
    Dictionary类，683行：this.loadMySQLStopwordDict();
    ```
    然后再写个配置文件和 ik 的词库配置放一起，里面可以配置 mysql 的相关参数配置
    `org.wltea.analyzer.dic.Dictionary` 主要的入口点在这个类里面，大概看了一下代码量少，有中文注释，比较容易看懂
3. mvn package 打包代码

    target\releases\elasticsearch-analysis-ik-5.2.0.zip

4. 解压缩 ik 压缩包：将 mysql 驱动 jar，放入 ik 的目录下
5. 修改 jdbc 相关配置
6. 重启 es

观察日志，日志中就会显示我们打印的那些东西，比如加载了什么配置，加载了什么词语，什么停用词

在 mysql 中添加词库与停用词并分词实验，验证热更新是否生效

::: tip
该课程包含了一个已经实现 mysql 热更新的项目包。由于代码不是很复杂，就不提供该包了
:::
