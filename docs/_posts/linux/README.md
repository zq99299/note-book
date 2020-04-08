# linux 常用知识

新机器使用如下命令升级软件或者依赖包

```
yum -y update
# 或
yum -y upgrade
```


## 环境变量配置

``` bash
# 系统环境变量文件：
vi /etc/profile

# 刷新配置文件
source /etc/profile

# 专门的环境变量
vi ~/.bashrc
source ~/.bashrc
```

## nodejs 安装

### yum 安装(强烈建议)
此方式添加有好处，因为在后面的 yarn 安装中，yarn 依赖 nodejs，使用 yum -y yarn 的时候，
依赖下载的是旧版本的 nodejs（6.x）

```
# 添加 yum 源的脚本，8.x 可以修改成你需要的版本
curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -

yum -y nodejs
```

### 已编译安装

```bash
cd /usr/local
wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz
tar -xvf node-v10.15.3-linux-x64.tar.xz
```

配置环境变量，增加到  /etc/profile 中

```
export NODE_HOME=/usr/local/node-v10.15.3-linux-x64
export PATH=$NODE_HOME/bin:$PATH
```


### 源码编译安装
以下方式，我自己编译回报错，安装不成功
```bash
# 手动安装的都在该目录下安装
cd /usr/local
# 这个是已经编译好的，配置环境变量就可以 wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz
# 下载指定版本的源码压缩包
wget https://nodejs.org/dist/v10.15.3/node-v10.15.3.tar.gz
tar -xvf node-v10.15.3.tar.gz

# 安装依赖
yum install gcc gcc-c++

# 编译与安装
cd node-v10.15.3
./configure && make && make install

# 验证是否成功
node -v
```

## yarn 安装

[官网安装方式](https://yarn.bootcss.com/docs/install/#centos-stable)

官网安装很简单，这里简单记录下

```bash
curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
yum install yarn
```
