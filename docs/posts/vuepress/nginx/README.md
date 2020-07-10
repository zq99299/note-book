# nginx + lua + webhook 自动化部署

如果将 vuepress build 之后的静态网站部署在自己的服务器上，这里有一个自动化方案，思路如下：

1. 在 linux 服务器上安装 node、yarn、git、nginx 软件
2. 编写一个脚本：用于更新 git 仓库项目，然后 build，再复制到 nginx 配置访问的文件位置
3. 使用 nginx 来作为静态网站的容器
4. 使用 nginx lua 模块提供一个调用脚本的入口
5. 在 github 上填写 webhook 地址为，调用脚本的入口地址
6. 达到：上传到 github 后，触发 webhook 事件，服务器自动构建并发布新笔记内容的功能

## 安装 OpenResty + lua 相关依赖包

[安装 OpenResty 和 lua 入门请参考本文章](https://zq99299.github.io/note-book/cache-pdp/052.html)

请按该文章完成安装后，并完成  hello world lua 的测试，再继续下面的步骤

##  nginx 执行 shell 脚本

[本节内容参考文章](https://blog.csdn.net/weixin_40429878/article/details/81908019)

要在 nginx 下执行 shell 脚本，主要使用以下两个软件：

- **lua-resty-shell** 模块
- **sockproc**

lua-resty-shell 通过 sockproc 去执行 shell 命令，并返回执行结果

### 安装 sockproc

随意把 sockproc 安装在哪里，按你自己的习惯，只要能运行上就行

```java
git clone https://github.com/juce/sockproc
cd sockproc
make
./sockproc /tmp/shell.sock
chmod 0666 /tmp/shell.sock
```

sockproc 是一个服务器程序，侦测 unix socket 或者 tcp socket ， 并把收到的命令，传递给子进程执行，执行完毕后，把结果返回给客户端,，我们就让 sockproc 侦测 `/tmp/shell.sock` 的套接口有没有数据到来。

###  安装 lua-resty-shell 模块

它是一个很小的库，配合 openresty 使用，目的是提供类似于 os.execute 或 io.popen 的功能， 唯一区别它是非阻塞的，也就是说即使需要耗时很久的命令，你也可以使用它

```bash
# 同样，在任意目录下，这里我们需要拿到仓库里面的 shell.lua 文件而已
git clone https://github.com/juce/lua-resty-shell
cd lua-resty-shell
# 把 shell.lua 文件复制到 openResty 中配置的 lualib 目录中
# 如果是按照上面教程安装的，那么我们的 lualib路径就如下
mkdir /usr/servers/lualib/resty/
cp lib/resty/shell.lua /usr/servers/lualib/resty/ 
```

### 测试执行 shell 脚本

创建一个 lua 脚本文件  

```bash
vim /usr/servers/nginx/conf/test.lua

local shell = require "resty.shell"
local args = {
    socket = "unix:/tmp/shell.sock",  -- 这是第一步的 unxi socket
}
local status, out, err = shell.execute("ls", args)  -- ls 是想调用的命令,
ngx.header.content_type = "text/plain"
ngx.say("Result:\n" .. out)                    -- 命令输出结果
```

修改 nginx 配置

```bash
vim /usr/servers/nginx/conf/lua.conf 

server {  
    listen       9300;  
    server_name  _;
    
    location /lua {  
      default_type 'text/html';  
      # content_by_lua 'ngx.say("hello world")';  
      content_by_lua_file /usr/servers/nginx/conf/test.lua; 
    } 
}  
```

重新加载 nginx 配置文件后，访问 9300 端口，就可以看到 ls 命令执行后输出的内容了

## 编写接受 webhook 的逻辑 lua 脚本

我们的这里的思路简单一点：

1. 提供一个访问地址，接受 webhook 请求，请求的时候需要携带一个 token 参数
2. 在 lua 脚本中获取这个 token 参数，并校验是否自己设置的，如果不是，则直接丢弃这个请求
3. 执行笔记构建部署脚本

```bash
-- 拿一个地址来说明：http://eshop-cache03/lua?method=hello&productId=1
-- 获取问号后面的参数列表
local uri_args = ngx.req.get_uri_args()
-- 获取参数
local token = uri_args["token"]
local checkToken = "123456xxx"

-- 如果没有提供 token 则输出一个 err 信息
if not token then  
    ngx.say("request error :", err)  
    return  
end

-- 判断是否与 token 相等
if( token != checkToken ) then
    ngx.say("request error :", err)  
    return  
end

-- 校验通过后，执行脚本
local shell = require "resty.shell"
local args = {
    socket = "unix:/tmp/shell.sock", 
}
local status, out, err = shell.execute("sh /xx/build.sh", args)  
ngx.header.content_type = "text/plain"
ngx.say("Result:\n" .. out) 
```

那么这个 `/xx/build.sh` 内容经过测试有如下的特性

```java
#!/bin/bash
ll
touch /usr/servers/nginx/conf/testxxxxxxxxx
echo "Hello World !"
```

命令会正常执行，但是只会输出  echo 打印的信息给调用处。

## 构建 vuepress 到 nginx 下的部署配置

上面搞定了 lua 的开发环境，也测试过了，下面就要完成：lua 执行脚本里面的真正内容了，步骤如下：

- 安装 vuepress build 的软件环境：[yarn](https://yarn.bootcss.com/docs/install/#centos-stable) 和 [node](https://github.com/zq99299/essay-note/blob/master/chapter/linux/install.md#node)
- [安装 git 软件](https://zq99299.github.io/note-book/posts/linux/git.html)：用于克隆一个项目到本地，进行拉取最新的笔记内容
- 编写构建脚本
- 配置 nginx 访问构建好的静态网站
- 在 Github 对应项目配置 webhook 地址到我们提供的 lua 入口

先把仓库 clone 下来

```bash
mkdir -p /usr/servers/notework/gitrepo
cd /usr/servers/notework/gitrepo
## 在该路径下存放我们的笔记项目
git clone https://github.com/zq99299/mysql-tutorial.git
git clone https://github.com/zq99299/note-book.git
git clone https://github.com/zq99299/java-tutorial.git
git clone https://github.com/zq99299/mysql-tutorial.git
git clone https://github.com/zq99299/mq-tutorial.git
git clone https://github.com/zq99299/dsalg-tutorial.git
```

