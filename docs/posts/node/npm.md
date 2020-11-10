# NPM
## npm 包发布和撤销
### 插件发布到 npm 社区 
1. www.npmjs.org 注册自己的账户
2. 添加账户注册的信息
    ```
    $ npm adduser --registry http://registry.npmjs.org  
    Username: your name
    Password: your password
    Email: yourmail
    ```
    可以通过以下命令查看 npm 当前使用的用户：`npm whoami`
3. 推送到 npm 社区
   ```bash
   # 进入插件所在目录（package.json） 
   npm publish
   ```
### 撤销一个发布包
加入你有强迫症，或则因为一些原因需要撤销一些发布

```bash
npm unpublish [<@scope>/]<pkg>[@<version>]
```

比如：

```bash
# 直接撤销一个包，需要加 --force 强制撤销
npm unpublish abc --force

# 只撤销某一个版本
npm unpublish abc@1.0.0
```