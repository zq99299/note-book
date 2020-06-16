# Git 安装与使用

## 第三方仓库安装方式（IUS）最新版

使用 yum list git 只有 1.8 版本的，要安装最新版本的官网上面说要么手动，要么使用第三方仓库。

这里使用 ius 的 [使用说明](https://ius.io/Usage/) 和 [入门指南](https://ius.io/GettingStarted/)

```bash
# 下载并执行 ius 提供的自动化脚本
curl https://setup.ius.io | sh
# 搜索 git 包，会发现有 git2u 的版本
yum search git
yum -y install git2u

# 查看版本会发现是 git version 2.16.5
git --version
```
