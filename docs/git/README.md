# Git

[Git 系统学习笔记](../git-scm/)

## GitHub 如何测试别人提交的 pr

> [官网文档 ](https://help.github.com/articles/checking-out-pull-requests-locally/)

1. clone 原仓库
2. 执行拉取命令。

  ```bash
  # 其中的 ID: 为 pr 的 id，如果 ＃240 ，那么 ID 就写 240
  # BRANCHNAME: 分支名称，把 pr 的代码拉取到这个分支中，取一个分支名称
  $ git fetch origin pull/ID/head:BRANCHNAME
  ```
3. git checkout BRANCHNAME 
