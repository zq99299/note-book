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

前面验证了我们方案中的关键部分 **lua 执行 sh 脚本**，下面就开始真正实现自动构建

## vuepress 自动构建

步骤如下：

- 安装 vuepress build 的软件环境：[yarn](https://yarn.bootcss.com/docs/install/#centos-stable) 和 [node](https://github.com/zq99299/essay-note/blob/master/chapter/linux/install.md#node)
- [安装 git 软件](https://zq99299.github.io/note-book/posts/linux/git.html)：用于克隆一个项目到本地，进行拉取最新的笔记内容
- 编写构建脚本
- 配置 nginx 访问构建好的静态网站
- 在 Github 对应项目配置 webhook 地址到我们提供的 lua 入口

###  clone 项目

把要自动部署构建的项目 clone 下来。我们的构建和发布目录都在 `/usr/servers/notework/` 目录下展开

```bash
mkdir -p /usr/servers/notework/gitrepo
cd /usr/servers/notework/gitrepo
## 在该路径下存放我们的笔记项目
git clone https://github.com/zq99299/mysql-tutorial.git
git clone https://github.com/zq99299/note-book.git
git clone https://github.com/zq99299/java-tutorial.git
git clone https://github.com/zq99299/linux-tutorial.git
git clone https://github.com/zq99299/mq-tutorial.git
git clone https://github.com/zq99299/dsalg-tutorial.git
```

### 编写构建脚本

这是一个公共的构建脚本，在调用该脚本的时候，需要把项目名传递进来

`/usr/servers/notework/build.sh`

```bash
#!/bin/sh
# 一个工作目录，用于存放仓库、打包后部署目录
noteworkDir=/usr/servers/notework
# 笔记仓库名称，每个笔记一个，调用脚本时，将项目名传递进来
noteName=$1

# 更新项目，并构建
cd $noteworkDir/gitrepo/$noteName
git pull
yarn install
yarn docs:build

# 删除构建好的包，并用新的覆盖
rm -rf $noteworkDir/release/$noteName
mkdir -p $noteworkDir/release/$noteName
mv build/.vuepress/dist/* $noteworkDir/release/$noteName
```

配置 nginx 访问构建好的静态网站

```
server {
    listen       80;
    server_name  localhost;

    charset utf-8; 

    #access_log  logs/host.access.log  main;

    location ^~ /linux-tutorial {
        # root   /usr/servers/notework/release/linux-tutorial/;
        alias /usr/servers/notework/release/linux-tutorial/;
    }
}
```

需要说明下的是：这里的 location 的配置，这个需要看你的 `docs/.vuepress/config.js` 中 bash 的设置，由于要部署到 githubio，这里使用了一个前缀路径。

现在，可以通过 `http://你的主机 IP/linux-tutorial/` 访问到这个项目了。

### 编写 lua 脚本自动构建逻辑

前面写了一部分，这里做一点修改

`/usr/servers/nginx/conf/noteBuild.lua`

```bash
-- 拿一个地址来说明：http://eshop-cache03/lua?method=hello&productId=1
-- 获取问号后面的参数列表
local uri_args = ngx.req.get_uri_args()
-- 获取参数
local token = uri_args["token"]
-- 这里增加一个 noteName 的参数值，需要 webhook 中回调，来构建不同的项目
local noteName = uri_args["noteName"] 
local checkToken = "123456xxx"

-- 如果没有提供 token 则输出一个 err 信息
if not token then  
    ngx.say("request error token is null:", err)  
    return  
end

-- 判断是否与 token 相等
if( token ~= checkToken ) then
    ngx.say("request error token mismatching:", err)  
    return  
end

-- 检查当前笔记是否支持自动构建
if not noteName then  
    ngx.say("request error noteName is null:", err)  
    return  
end

local supportNotes = {"linux-tutorial","mysql-tutorial"}

function  isInTable(value,list)
   if not list then
      return false   
   end 
   for k, v in pairs(list) do
	if v == value then
	  return true
	end
   end
end 
if( not isInTable(noteName,supportNotes) ) then
    ngx.say("request error noteName mismatching:", err)  
    return  
end

-- 校验通过后，执行脚本
local shell = require "resty.shell"
local args = {
    socket = "unix:/tmp/shell.sock", 
	timeout = 120000
}
-- 不加 nohub 15秒回执行超时，加了之后，貌似受上面的 timeout 控制，不明白这一块是啥原因
local exeStr = "nohub sh /usr/servers/notework/build.sh "..noteName
local status, out, err = shell.execute(exeStr, args)
ngx.header.content_type = "text/plain"

if out then
 ngx.say("Result:\n" .. out) 
 return
end

if err then
 ngx.say("Result:\n" .. err) 
 return
end
```

`/usr/servers/nginx/conf/noteBuild.conf`

```java
server {
    listen       80;  
    server_name  _;
    charset utf-8;  # 中文不乱码
    
    location /lua {  
      default_type 'text/html';  
      # content_by_lua 'ngx.say("hello world")';  
      content_by_lua_file /usr/servers/nginx/conf/noteBuild.lua;
    } 
}
```

同样需要在 nginx.conf 中引用这个 noteBuild.conf 文件

**注意：** 这里的 conf 中的监听端口不能与前面配置访问静态文件的端口一致，一致的话，前面的配置将被覆盖，同样可以将调用脚本的这代码与前面访问静态文件的配置在同一个 server 中，就不会出现这种问题了

配置完成之后可以简单测试下，访问地址 `http://你的 ip/lua?token=123456xxx&noteName=linux-tutorial`，比如这个 linux-tutorial 整个构建响应信息如下

```
Result:
Already up to date.
yarn install v1.22.4
[1/4] Resolving packages...
success Already up-to-date.
Done in 1.11s.
yarn run v1.22.4
$ vuepress build docs
wait Extracting site metadata...
tip Apply theme @vuepress/theme-default ...
tip Apply plugin container (i.e. "vuepress-plugin-container") ...
tip Apply plugin @vuepress/register-components (i.e. "@vuepress/plugin-register-components") ...
tip Apply plugin @vuepress/active-header-links (i.e. "@vuepress/plugin-active-header-links") ...
tip Apply plugin @vuepress/nprogress (i.e. "@vuepress/plugin-nprogress") ...
tip Apply plugin smooth-scroll (i.e. "vuepress-plugin-smooth-scroll") ...
tip Apply plugin @vuepress/back-to-top (i.e. "@vuepress/plugin-back-to-top") ...
tip Apply plugin @vuepress/pwa (i.e. "@vuepress/plugin-pwa") ...
tip Apply plugin @vuepress/medium-zoom (i.e. "@vuepress/plugin-medium-zoom") ...
tip Apply plugin @vuepress/search (i.e. "@vuepress/plugin-search") ...
tip Apply plugin @vssue/vssue (i.e. "@vssue/vuepress-plugin-vssue") ...
tip Apply plugin code-copy (i.e. "vuepress-plugin-code-copy") ...
tip Apply plugin @vuepress/last-updated (i.e. "@vuepress/plugin-last-updated") ...
tip Apply plugin baidu-tongji-analytics (i.e. "vuepress-plugin-baidu-tongji-analytics") ...
tip Apply plugin baidu-autopush (i.e. "vuepress-plugin-baidu-autopush") ...
ℹ Compiling Client
ℹ Compiling Server
✔ Server: Compiled successfully in 53.18s
✔ Client: Compiled successfully in 53.67s
wait Rendering static HTML...
[2K[1Gwait Generating service worker...
success Generated static files in build/.vuepress/dist.

Done in 80.58s.
```

### 配置 github webhook 地址

![image-20200715131405149](./assets/image-20200715131405149.png)

关于上图中的 URL，换成你自己的 IP 和开放的端口，还有各种参数。

之后就可以测试下，往 gitHub 上 push 一个文档的修改，看是否能触发自动构建。

## 配置自定义域名

本人的 DNS 在万网，完全的网址重定向，只能在万网的机器才可以，所以只能使用转发到一个 IP 上，所以笔记访问端口就只能是 80 端口了，其他的端口不支持配置。

下面是修改后的配置

`/usr/servers/nginx/conf/nginx.conf`

```
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}


http {
    lua_package_path "/usr/servers/lualib/?.lua;;";  
    lua_package_cpath "/usr/servers/lualib/?.so;;"; 
    # include noteBuild.conf; 
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    server {
        listen       80;
        server_name  _;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        
        # 将 github webhook 调用的入口移动到这里来了，公用一个域名
        location /note-auto-build {  
          default_type 'text/html';    
          content_by_lua_file /usr/servers/nginx/conf/noteBuild.lua;
        } 

        # 有几个笔记项目就写几个指向
        location ^~ /linux-tutorial {
          alias /usr/servers/notework/release/linux-tutorial/;
        }
    }
    
    # 这个是针对不同域名的配置
    # 我这里给每一个笔记项目都配置了一个二级域名
    server {
      server_name linux-tutorial.mrcode.cn;
      listen 80;
      # 这个是能访问到 index.html 文件
      location / {
          alias /usr/servers/notework/release/linux-tutorial/;
      }
      # 这里是兼容有前缀的 css 等资源下载，由于我们的 .vuepress/config.js base 中配置了前缀
      # 要同时兼容能推送到 githubio 上，这里就只能这样曲线救国了
      # 实现的效果就是访问 inux-tutorial.mrcode.cn ,就能正常阅读
      location ^~ /linux-tutorial {
          alias /usr/servers/notework/release/linux-tutorial/;
      }
    }
}
```

关于上面的配置，按照你自己的需求来组织是否给二级域名，还是一个域名就全部搞定