# docker

```bash
# 启动
systemctl start docker
# 重启
systemctl restart docker
# 关闭
systemctl stop docker
```

##  拓展阅读

更详细的系统的教程：

- [如何使用 Docker 虚拟机](https://zq99299.github.io/mysql-tutorial/ali-new-retail/09/02.html)

  非常基础的介绍，安装、镜像、容器、虚拟机管理命令等

- [分布式 Docker 环境](https://zq99299.github.io/mysql-tutorial/ali-new-retail/09/03.html)

  Swarm 组网知识。

- [管理 Docker 数据卷](https://zq99299.github.io/mysql-tutorial/ali-new-retail/09/04.html#%E7%AE%A1%E7%90%86-docker-%E6%95%B0%E6%8D%AE%E5%8D%B7)

## Dockerfile

打包一个 image。下面是一个 cloud boot 项目的打包配置

```
#FROM hub.c.163.com/library/java:8
FROM java8

ADD build/libs/*-boot.jar app.jar

EXPOSE 9500

ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
# 打包镜像
docker image build -t serviceApp:1.0 .
# 可以查看上面打包后的镜像
docker image ls
# 运行一个镜像
docker container run --publish 9500:9500 --detach --name serviceApp serviceApp:1.0
# 查看正在运行的容器
docker container ls
# 查看指定容器的日志信息
docker logs -t -f containerId
# 强制删除一个容器，可能类似暴力 kill
docker container rm --force serviceApp
```

## 仓库
```bash
# 登陆/注销docker
docker login --username=[ 用户名 ]

# 更改tag
docker tag [ 原镜像名 or 镜像 id ] [ 用户名 ]/[ 仓库 ]:[ tag ]
# [ 用户名 ]/[ 仓库 ]这个部分是可以任意取名的，写什么都可以，这个部分会作为REPOSITORY属性。
# 但是如果要推送到某仓库，则必须是[ 用户名 ]/[ 仓库 ]这样，推送上去之后如果仓库在这个用户下不存在则会新建一个这个名字的仓库。

# 推送镜像到仓库
docker push [ 用户名 ]/[ 仓库 ]:[ tag ]
```

## 镜像
```bash
# 查找镜像
docker search [ 条件 ]

# 查询三颗星及以上名字包含alpine的镜像
docker search -f=stars=3 alpine

# 登陆/退出第三方仓库
docker [ login/logout ] [ 仓库地址 ]

# 获取镜像
docker pull [ 仓库 ]:[ tag ]
#仓库格式为 [仓库url]/[用户名]/[应用名] , 除了官方仓库外的第三方仓库要指定 url, 用户名就是在对应仓库下建立的账户, 一般只有应用名的仓库代表 官方镜像, 如 ubuntu、tomcat 等, 而 tag 表示镜像的版本号, 不指定时默认为 latest

# 推送镜像到仓库
docker push [ 仓库 ]:[ tag ]
```

## 本地镜像

```bash
# 查看本地镜像
docker images

# 删除镜像
docker rmi [ 镜像名 or 镜像 id ]

# 删除指定镜像（当存在同一个ID的不同镜像时）
docker rmi [ 仓库 ]:[ tag ]

# 查看镜像详情
docker inspect [ 镜像名 or 镜像 id ]

# 打包本地镜像
docker save [ 镜像名 or 镜像 id ] > [ 文件路径 ]

# 导入镜像
docker load < [ 文件路径 ]

# 修改镜像tag
docker tag [ 镜像名 or 镜像 id ] [ 新镜像名 ]:[ 新 tag ]

```

### 批量删除无 tag 的镜像

```bash
docker images|grep none|awk '{print $3}'|xargs docker rmi

说明：
docker images ：镜像列表
|grep none : 筛选含 none 的行
|awk '{print $3}' ：awk行处理器打印第三个参数（IMAGE ID）
|xargs ： 参数列表转换
docker rmi ： 镜像删除命令
```



## 本地容器

```bash
# 查看本地运行中的容器
docker ps

# 查看本地所有容器
docker ps -a

# 查看容器详情
docker inspect [ 容器名 or 容器 id ]

# 创建容器
docker run --name [ 容器名 ] -it -p 8888:8888 -v [本地目录]:[新建容器的目录] [ 仓库名 ]:[ tag ]

# 关闭容器(发送SIGTERM信号,做一些'退出前工作',再发送SIGKILL信号)
docker stop [ 容器名 or 容器 id ]

# 强制关闭容器(默认发送SIGKILL信号, 加-s参数可以发送其他信号)
docker kill [ 容器名 or 容器 id ]

# 启动容器
docker start [ 容器名 or 容器 id ]

# 重启容器
docker restart [ 容器名 or 容器 id ]

# 进入容器命令行
docker exec -it [ 容器名 or 容器 id ] bash
# 或者
docker attach [ 容器名 or 容器 id ]

# 将容器保存为镜像
docker commit [ 容器名 or 容器 id ] [ 镜像名 ]:[ tag ]

# 使用dockfile构建镜像
docker build -t [ 镜像名 ]:[ tag ] -f [ DockerFile 名 ] [ DockerFile 所在目录 ]

# 查看容器日志
docker logs -f [ 容器名 or 容器 id ]

```
