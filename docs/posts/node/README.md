# Nodejs

## 多版本 Node

使用第三方工具，可以随时切换到某一个版本的 Node，需要注意的是：**每个版本都有自己独立的依赖包缓存等机制**，简单说，只是帮你实现了可以随时切换到一个版本上面去。

- windows ：[nvm-windows](https://github.com/coreybutler/nvm-windows)
- 非 windows：[nvm](https://github.com/nvm-sh/nvm)

使用命令都应该差不多。

### nvm-windows

官方仓库：[nvm-windows](https://github.com/coreybutler/nvm-windows)

在下载页面下载安装包：[立即下载](https://github.com/coreybutler/nvm-windows/releases)！，安装之后就可以使用 nvm 命令了

```bash
# 查看可安装版本
$ nvm list available

|   CURRENT    |     LTS      |  OLD STABLE  | OLD UNSTABLE |
|--------------|--------------|--------------|--------------|
|    15.1.0    |   14.15.0    |   0.12.18    |   0.11.16    |
|    15.0.1    |   12.19.0    |   0.12.17    |   0.11.15    |
...

# 安装版本
$ nvm install <version>

# 查看本地已安装版本，与当前所在版本
$ nvm list

  * 14.10.1 (Currently using 64-bit executable)
    8.12.0
    
# 切换指定版本
$ nvm use 8.12.0

# 卸载版本
$ nvm uninstall <version>
```

其他更多命令，请查阅官方文档