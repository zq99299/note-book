# yum

## 配置阿里云 YUM 源

```bash
# 备份原始镜像文件，防止出错后找不回来
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
# 下载阿里云的
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
# 清理缓存
yum clean all
# 更新缓存　
yum makecache
```

## 包列表

```bash
# 列出资源库中所有可以安装或更新的 rpm 包
yum list
# 列出资源库中特定的可以安装或更新以及已经安装的 rpm 包
# 注:可以在 rpm 包名中使用匹配符,如列出所有以 mozilla 开头的 rpm 包
yum list mozilla#yum list mozilla*
# 列出资源库中所有可以更新的 rpm 包
yum list updates
# 列出已经安装的所有的 rpm 包
yum list installed
# 列出已经安装的但是不包含在资源库中的 rpm 包
# 注:通过其它网站下载安装的 rpm 包
yum list extras
```
