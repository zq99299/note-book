# 学习 k8s 的基础知识

此笔记详细参考：https://kubernetes.io/zh/docs/tutorials/kubernetes-basics/




## 部署应用

### k8s 部署

一旦运行了 Kubernetes 集群，就可以在其上部署容器化应用程序。 为此，您需要创建 Kubernetes **Deployment** 配置。Deployment 指挥 Kubernetes 如何创建和更新应用程序的实例。创建 Deployment 后，Kubernetes master 将应用程序实例调度到集群中的各个节点上。

### 使用 kubectl 创建 Deployment

```bash
# 查看 client 和 server 版本
kubectl version

# 查看集群中的节点
$ kubectl get nodes
NAME       STATUS   ROLES    AGE   VERSION
minikube   Ready    master   85s   v1.17.3

# 创建应用
# 需要应用名称 和完整的 image 地址
$ kubectl create deployment kubernetes-bootcamp --image=gcr.io/google-samples/kubernetes-bootcamp:v1
deployment.apps/kubernetes-bootcamp created

# 获取你的应用，可以看到有一个应用，运行在一个节点上
$ kubectl get deployments
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
kubernetes-bootcamp   1/1     1            1           114s

# 此时该应用运行在内部的一个 pods：一个私有的、隔离的网络上，默认情况下，他们可以同同一个 k8s 集群中的其他 pods 和 services看到，不能在外网上看到
# 可以通过 kubectl 通过 API 与应用程序进行交互
# 可以新开一个终端，然后启动一个代理
$ kubectl proxy
Starting to serve on 127.0.0.1:8001
# 现在终端和 k8s 集群之间有了链接，可以通过代理之间访问 API
# 比如可以通过代理访问 version 信息
$ curl http://localhost:8001/version
{
  "major": "1",
  "minor": "17",
  "gitVersion": "v1.17.3",
  "gitCommit": "06ad960bfd03b39c8310aaf92d1e7c12ce618213",
  "gitTreeState": "clean",
  "buildDate": "2020-02-11T18:07:13Z",
  "goVersion": "go1.13.6",
  "compiler": "gc",
  "platform": "linux/amd64"
}


# API 服务器将根据 pod 名称为每个 pod 自动创建一个断点，该端点也可以通过代理访问，首先要获得断点的名称
# 下面把获得的断点名称放到 POD_NAME 的环境变量中
# 注意：通过 kubectl get pods 能看到所有的 pod 的端点名称；后面这个看效果是直接获取到了一个 name
$ export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
$ echo Name of the Pod: $POD_NAME
Name of the Pod: kubernetes-bootcamp-69fbc6f4cf-ppc9j
# 后续会用到该知识点
```

## 了解你的应用
### 目标

- 了解 Kubernetes Pod。
- 了解 Kubernetes 工作节点。
- 对已部署的应用故障排除。
### 查看 pod 和工作节点
#### Kubernetes Pods

**Pod** 托管你的应用实例。Pod 是 Kubernetes 抽象出来的，表示一组一个或多个应用程序容器（如 Docker 或 rkt ），以及这些容器的一些共享资源。这些资源包括:

- 共享存储，当作卷
- 网络，作为唯一的集群 IP 地址
- 有关每个容器如何运行的信息，例如容器映像版本或要使用的特定端口。

#### 工作节点

一个 pod 总是运行在 **工作节点**。工作节点是 Kubernetes 中的参与计算的机器，可以是虚拟机或物理计算机，具体取决于集群。每个工作节点由主节点管理。工作节点可以有多个 pod ，Kubernetes 主节点会自动处理在群集中的工作节点上调度 pod 。 主节点的自动调度考量了每个工作节点上的可用资源。

每个 Kubernetes 工作节点至少运行:

- Kubelet，负责 Kubernetes 主节点和工作节点之间通信的过程; 它管理 Pod 和机器上运行的容器。
- 容器运行时（如 Docker ，rkt ）负责从仓库中提取容器镜像，解压缩容器以及运行应用程序。

*如果它们紧耦合并且需要共享磁盘等资源，这些容器应在一个 Pod 中编排。*



### 使用 kubectl 进行故障排除

- kubectl get - 列出资源
- kubectl describe - 显示有关资源的详细信息
- kubectl logs - 打印 pod 和其中容器的日志
- kubectl exec - 在 pod 中的容器上执行命令

#### 检查应用程序配置
```bash
# 检查现有的 pod
$ kubectl get pods
NAME                                   READY   STATUS    RESTARTS   AGE
kubernetes-bootcamp-765bf4c7b4-nw2d8   1/1     Running   0          35s

# 可以查看该 pod 内的 容器和镜像 等信息
# 可以看到返回的信息数据很多
$ kubectl describe pods
Name:         kubernetes-bootcamp-765bf4c7b4-nw2d8
Namespace:    default
Priority:     0
Node:         minikube/172.17.0.13
Start Time:   Wed, 08 Apr 2020 03:16:46 +0000
Labels:       pod-template-hash=765bf4c7b4
              run=kubernetes-bootcamp
Annotations:  <none>
Status:       Running
IP:           172.18.0.6
IPs:
  IP:           172.18.0.6
Controlled By:  ReplicaSet/kubernetes-bootcamp-765bf4c7b4
Containers:
  kubernetes-bootcamp:
    Container ID:   docker://3854a4a1e21d6c8e192e8121d9c07b7e03fe8fb90e3f3dfaa66b4185ba395735
    Image:          gcr.io/google-samples/kubernetes-bootcamp:v1
    Image ID:       docker-pullable://jocatalin/kubernetes-bootcamp@sha256:0d6b8ee63bb57c5f5b6156f446b3bc3b3c143d233037f3a2f00e279c8fcc64af
    Port:           8080/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Wed, 08 Apr 2020 03:16:52 +0000
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-h8pmg (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  default-token-h8pmg:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-h8pmg
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type     Reason            Age                  From               Message
  ----     ------            ----                 ----               -------
  Warning  FailedScheduling  105s (x3 over 110s)  default-scheduler  0/1 nodes are available: 1 node(s) had taints that the pod didnt tolerate.
  Normal   Scheduled         102s                 default-scheduler  Successfully assigned default/kubernetes-bootcamp-765bf4c7b4-nw2d8 to minikube
  Normal   Pulled            97s                  kubelet, minikube  Container image "gcr.io/google-samples/kubernetes-bootcamp:v1" already present on machine
  Normal   Created           97s                  kubelet, minikube  Created container kubernetes-bootcamp
  Normal   Started           96s                  kubelet, minikube  Started container kubernetes-bootcamp

# 该命令输出的信息是人类可读的，并非是脚本化的原始文件  
```

#### 在终端中显示应用
pods 是在私有网络中运行的，因此先创建一个代理

```bash
$ kubectl proxy
Starting to serve on 127.0.0.1:8001

# 获取 pod 名称，并存储在变量中
$ export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
$ echo Name of the Pod: $POD_NAME
Name of the Pod: kubernetes-bootcamp-765bf4c7b4-nw2d8

# 通过 API 获取该 POD 的信息
$ curl http://localhost:8001/api/v1/namespaces/default/pods/$POD_NAME/proxy/
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-765bf4c7b4-nw2d8 | v=1
```

#### 显示容器日志
应用程序发送到 STDOUT 的任何内容都会成为 pod 中容器的日志。

```bash
# 查看该 POD 的容器日志
$ kubectl logs $POD_NAME
```

#### 在容器上执行命令
一旦 Pod 启动并运行，我们就可以直接在容器上执行命令。为此，我们使用 exec 命令并使用 Pod 的名称作为参数。让我们列出环境变量:

```bash
$ kubectl exec $POD_NAME env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=kubernetes-bootcamp-765bf4c7b4-nw2d8
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
KUBERNETES_SERVICE_HOST=10.96.0.1
...
```

在 Pod 的容器中启动一个 bash 程序。注意的是：由于当前 pod 只有一个容器，容器名称是可以省略的

```bash
$ kubectl exec -ti $POD_NAME bash
root@kubernetes-bootcamp-765bf4c7b4-nw2d8:/#
# 这就进入了一个 pod 内的容器
# 在该 bash 环境下，可以执行 bash 指令，比如 ls 等

# 看看这个 js 中的内容。里面就是我们部署容器的时候运行的一个 node js 程序，他监听了 8080 端口，并输出一些信息
root@kubernetes-bootcamp-765bf4c7b4-nw2d8:/# cat server.js

# 由于在容器内部，所以可以直接访问 localhost
root@kubernetes-bootcamp-765bf4c7b4-nw2d8:/# curl localhost:8080
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-765bf4c7b4-nw2d8 | v=1

# 退出与该容器的联机
root@kubernetes-bootcamp-765bf4c7b4-nw2d8:/# exit
```

## 公开的暴露你的应用

### 目标

- 了解 Kubernetes 中的服务
- 了解标签和 LabelSelector 对象如何与服务相关
- 使用服务在 Kubernetes 集群外公开应用程序

### 服务概述

Pod 是有生命周期的，当工作节点死亡，在该节点上运行的 Pod 也会丢失，然后可能会通过 ReplicaSet 来创建新的 Pod 来恢复成原来的状态。

集群中的每个 Pod 都有一个唯一的 IP 地址，因此需要一种自动协调 Pod 之间的方法

Kubernetes 中的服务是一种抽象，定义了 Pod 的逻辑集合和访问 Pod 的策略，可以通过 YML（首选）或 JSON 定义服务。如果没有服务，尽管每个 Pod 有 一个唯一的地址，但是也不会暴露在集群外部。服务允许你的应用程序接受流量。

在 ServiceSpec 中通过 type 可以指定以何种方式公开服务：

- *ClusterIP*（默认）：在群集的内部 IP上公开服务。这种类型使得只能从群集内部访问服务。
- *NodePort*：使用 NAT 在群集中每个选定节点的相同端口上公开服务。使用可以从群集外部访问服务`:`。`<NodeIP>:<NodePort>`  ClusterIP 的超集。
- *LoadBalancer* ：在当前云中创建一个外部负载平衡器（如果支持），并为该服务分配一个固定的外部 IP。NodePort 的超集。
- *ExternalName*：`externalName`通过返回带有该名称的 CNAME 记录，使用任意名称（在规范中指定）公开服务。不使用代理。此类型需要 v1.7 或更高版本 `kube-dns`。

服务在一组 Pod 之间路由流量。服务是允许 Pod 在 Kubernetes 中死亡和复制而又不影响您的应用程序的抽象。

简单说：服务类似一个 nginx，可以决定路由到哪些 pod 上去

### 使用 expose 暴露你的程序

#### 创建新服务 services

```bash
# 先找到一个 pod ，确定你的应用还在运行
$ kubectl get pods
NAME                                   READY   STATUS    RESTARTS   AGE
kubernetes-bootcamp-765bf4c7b4-bsmcs   1/1     Running   0          2m19s

# 列出集群中的服务
$ kubectl get services
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   2m57s
```

上述有一个 kubernetes 的服务，这个是 minikube 启动集群时默认创建的。

```bash
# 关于这个 deployment/kubernetes-bootcamp 前面的 deployment 是我们不熟应用时的指令
# 如果这里使用 services/xxx 一样的概念
$ kubectl expose deployment/kubernetes-bootcamp --type="NodePort" --port 8080
service/kubernetes-bootcamp exposed

$ kubectl get services
NAME                  TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
kubernetes            ClusterIP   10.96.0.1        <none>        443/TCP          9m17s
kubernetes-bootcamp   NodePort    10.104.184.115   <none>        8080:31880/TCP   57s
```

xx

```bash
$ kubectl describe services/kubernetes-bootcamp
Name:                     kubernetes-bootcamp
Namespace:                default
Labels:                   run=kubernetes-bootcamp
Annotations:              <none>
Selector:                 run=kubernetes-bootcamp
Type:                     NodePort
IP:                       10.104.184.115
Port:                     <unset>  8080/TCP
TargetPort:               8080/TCP
NodePort:                 <unset>  31880/TCP
Endpoints:                172.18.0.3:8080
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>

# 这个是暴露的端口，
$ export NODE_PORT=$(kubectl get services/kubernetes-bootcamp -o go-template='{{(index .spec.ports 0).nodePort}}')
$ echo NODE_PORT=$NODE_PORT
NODE_PORT=31880
# 但是这个 ip 结果居然是 172.17.0.49 也就是 kubernetes 暴露的 IP
$ curl $(minikube ip):$NODE_PORT
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-765bf4c7b4-bsmcs | v=1
```

#### 使用标签 labels

deployment 为 pod 自动创建了一个标签

```baSH
# 通过描述来获取标签信息
$ kubectl describe deployment
Name:                   kubernetes-bootcamp
Namespace:              default
CreationTimestamp:      Wed, 08 Apr 2020 05:23:49 +0000
Labels:                 run=kubernetes-bootcamp
```

可以通过这个标签来获取 pod 列表，通过 `-l` 参数

```bash
$ kubectl get pods -l run=kubernetes-bootcamp
NAME                                   READY   STATUS    RESTARTS   AGE
kubernetes-bootcamp-765bf4c7b4-bsmcs   1/1     Running   0          24m
```

还可以用标签来获取服务

```bash
$ kubectl get services -l run=kubernetes-bootcamp
NAME                  TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
kubernetes-bootcamp   NodePort   10.104.184.115   <none>        8080:31880/TCP   16m
```

```bash
# 获取 pod name
$ export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
$ echo Name of the Pod: $POD_NAME
Name of the Pod: kubernetes-bootcamp-765bf4c7b4-bsmcs
```

给应用添加新标签，使用 label 参数，后面跟 象类型、对象名称和新标签

```bash
$ kubectl label pod $POD_NAME app=v1
pod/kubernetes-bootcamp-765bf4c7b4-bsmcs labeled
```

查看这个 pod 的标签列表

```bash
$ kubectl describe pods $POD_NAME
Name:         kubernetes-bootcamp-765bf4c7b4-bsmcs
Namespace:    default
Priority:     0
Node:         minikube/172.17.0.49
Start Time:   Wed, 08 Apr 2020 05:24:06 +0000
Labels:       app=v1
              pod-template-hash=765bf4c7b4
              run=kubernetes-bootcamp
...
# 可以看到多了 app=v1

# 那么就可以通过标签来获取 pod 列表了
$ kubectl get pods -l app=v1
NAME                                   READY   STATUS    RESTARTS   AGE
kubernetes-bootcamp-765bf4c7b4-bsmcs   1/1     Running   0          28m
```

#### 删除服务

可以使用 `delete service` 命令，标签也可以在这里使用

```bash
$ kubectl delete service -l run=kubernetes-bootcamp
service "kubernetes-bootcamp" deleted

$ kubectl get services
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   30m
# 会发现服务没有了

# 使用之前的访问地址，发现不能访问了，表示该应用不被暴露在集群之外了
$ curl $(minikube ip):$NODE_PORT
curl: (7) Failed to connect to 172.17.0.49 port 31880: Connection refused

# 可以通过命令执行，来确认该应用程序还存活
$ kubectl exec -ti $POD_NAME curl localhost:8080
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-765bf4c7b4-bsmcs | v=1
```

这里已经看到应用程序确实还活跃，要关闭应用程序的话，需要删除部署，因为部署正在管理应用程序

## 伸缩应用

在之前的模块中，我们创建了一个 [Deployment](https://kubernetes.io/docs/user-guide/deployments/)，然后通过 [Service](https://kubernetes.io/docs/user-guide/services/)让其可以开放访问。Deployment 仅为跑这个应用程序创建了一个 Pod。 当流量增加时，我们需要扩容应用程序满足用户需求。

**扩缩** 是通过改变 Deployment 中的副本数量来实现的。

### 扩展

```bash
# 找到我们的部署
$ kubectl get deployments
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
kubernetes-bootcamp   1/1     1            1           3m31s
```

列表字段含义：

- NAME：集群中 deployment 的名称
- READY：当前所需副本的比率
- UP-TO-DATE：已更新到所需状态的数量
- AVAILABLE：有多少应用程序副本供用户使用
- AGE：应用程序运行的时间

查看 deployment 运行的副本

```bash
$ kubectl get rs
NAME                             DESIRED   CURRENT   READY   AGE
kubernetes-bootcamp-765bf4c7b4   1         1         1       38m

# DESIRED：部署程序时期望的副本数量
# CURRENT：当前正在运行的副本数量
```

注意：副本集的名称总是格式化为 `[DEPLOYMENT-NAME]-[RANDOM-STRING]`，随机字符串是随机生成的，使用 ` pod-template-hash` 作为随机数种子 

接下来，我们将部署扩展到 4 个副本。使用 `kubectl scale ` 命令

```bash
# 部署类型/应用名称 所需要的数量
$ kubectl scale deployments/kubernetes-bootcamp --replicas=4
deployment.apps/kubernetes-bootcamp scaled

$ kubectl get deployments
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
kubernetes-bootcamp   4/4     4            4           45m

# 查看 pod 的数量
$ kubectl get pods -o wide
NAME                                   READY   STATUS    RESTARTS   AGE   IP           NODE       NOMINATED NODE   READINESS GATES
kubernetes-bootcamp-765bf4c7b4-kvzml   1/1     Running   0          45m   172.18.0.2   minikube   <none>           <none>
kubernetes-bootcamp-765bf4c7b4-mc5sl   1/1     Running   0          67s   172.18.0.8   minikube   <none>           <none>
kubernetes-bootcamp-765bf4c7b4-rcfbm   1/1     Running   0          67s   172.18.0.9   minikube   <none>           <none>
kubernetes-bootcamp-765bf4c7b4-tphzj   1/1     Running   0          67s   172.18.0.7   minikube   <none>           <none>
```

现在有 4 个 pod，有不同的 IP 地址。这个更改已经注册到 Deployment events log 中，可以通过以下命令验证

```bash
$ kubectl describe deployments/kubernetes-bootcamp
Name:                   kubernetes-bootcamp
Namespace:              default
CreationTimestamp:      Wed, 08 Apr 2020 06:14:57 +0000
Labels:                 run=kubernetes-bootcamp
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               run=kubernetes-bootcamp
Replicas:               4 desired | 4 updated | 4 total | 4 available | 0 unavailable
.... 看到有 4 个副本
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  47m    deployment-controller  Scaled up replica set kubernetes-bootcamp-765bf4c7b4 to 1
  Normal  ScalingReplicaSet  3m15s  deployment-controller  Scaled up replica set kubernetes-bootcamp-765bf4c7b4 to 4
# 另外，在 events 中，有一条日志是变成了 4 个  

```

### 负载均衡 Load Balancing

让我们检查服务是否在负载平衡流量。为了找出暴露的 IP 和端口，我们可以使用前面模块中学习到的 describe 服务:

```bash
$ kubectl describe services/kubernetes-bootcamp
Name:                     kubernetes-bootcamp
Namespace:                default
Labels:                   run=kubernetes-bootcamp
Annotations:              <none>
Selector:                 run=kubernetes-bootcamp
Type:                     NodePort
IP:                       10.96.156.129
Port:                     <unset>  8080/TCP
TargetPort:               8080/TCP
NodePort:                 <unset>  31244/TCP
Endpoints:                172.18.0.2:8080,172.18.0.7:8080,172.18.0.8:8080 + 1 more...
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>

# 拿到这个服务暴露的端口
$ export NODE_PORT=$(kubectl get services/kubernetes-bootcamp -o go-template='{{(index .spec.ports 0).nodePort}}')
$ echo NODE_PORT=$NODE_PORT
NODE_PORT=31244

# 访问这个服务，会发现被自动均衡负载了
$ curl $(minikube ip):$NODE_PORT
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-765bf4c7b4-tphzj | v=1
$ curl $(minikube ip):$NODE_PORT
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-765bf4c7b4-mc5sl | v=1
$ curl $(minikube ip):$NODE_PORT
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-765bf4c7b4-kvzml | v=1
# 这里笔者还是不清楚，这里的 minikube ip 是怎么访问到这个服务的
```

### 缩减

和扩展的时候使用的命令一致

```bash
$ kubectl scale deployments/kubernetes-bootcamp --replicas=2
deployment.apps/kubernetes-bootcamp scaled

$ kubectl get deployments
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
kubernetes-bootcamp   2/2     2            2           7m56s

$ kubectl get pods -o wide
NAME                                   READY   STATUS    RESTARTS   AGE     IP           NODE       NOMINATED NODE   READINESS GATES
kubernetes-bootcamp-765bf4c7b4-f66cb   1/1     Running   0          7m25s   172.18.0.8   minikube   <none>           <none>
kubernetes-bootcamp-765bf4c7b4-p27l7   1/1     Running   0          7m59s   172.18.0.4   minikube   <none>           <none>
```

## 更新你的应用

 **滚动更新** 允许通过使用新的实例逐步更新 Pod 实例，零停机进行 Deployment 更新。新的 Pod 将在具有可用资源的节点上进行调度。

滚动更新允许以下操作：

- 将应用程序从一个环境提升到另一个环境（通过容器镜像更新）
- 回滚到以前的版本
- 持续集成和持续交付应用程序，无需停机

### 更新应用程序的版本

```bash
$ kubectl get deployments
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
kubernetes-bootcamp   0/4     4            0           9s

# 列出正在运行的 pod
$ kubectl get pods
NAME                                   READY   STATUS    RESTARTS   AGE
kubernetes-bootcamp-765bf4c7b4-5dnsj   1/1     Running   0          21s
kubernetes-bootcamp-765bf4c7b4-fhpjw   1/1     Running   0          21s
kubernetes-bootcamp-765bf4c7b4-l2xck   1/1     Running   0          21s
kubernetes-bootcamp-765bf4c7b4-t7f7v   1/1     Running   0          21s

# 查看当前 pod 的image 版本
$ kubectl describe pods
...
Containers:
  kubernetes-bootcamp:
    Container ID:   docker://27adad6a06a62863b135e6aa1563cb214fa8c5503c746a17c37805566ed31aa2
    Image:          gcr.io/google-samples/kubernetes-bootcamp:v1   # 主要看这个镜像版本
...
```

开始滚动更新

```bash
$ kubectl set image deployments/kubernetes-bootcamp kubernetes-bootcamp=jocatalin/kubernetes-bootcamp:v2
deployment.apps/kubernetes-bootcamp image updated

# 查看 pod 状态
$ kubectl get pods
NAME                                   READY   STATUS        RESTARTS   AGE
kubernetes-bootcamp-765bf4c7b4-5dnsj   0/1     Terminating   0          4m5s
kubernetes-bootcamp-765bf4c7b4-fhpjw   0/1     Terminating   0          4m5s
kubernetes-bootcamp-765bf4c7b4-l2xck   0/1     Terminating   0          4m5s
kubernetes-bootcamp-765bf4c7b4-t7f7v   0/1     Terminating   0          4m5s
kubernetes-bootcamp-7d6f8694b6-9t5pd   1/1     Running       0          38s
kubernetes-bootcamp-7d6f8694b6-cgljl   1/1     Running       0          38s
kubernetes-bootcamp-7d6f8694b6-h2gtl   1/1     Running       0          40s
kubernetes-bootcamp-7d6f8694b6-k7hkm   1/1     Running       0          40s
# 可以看到有终止状态，等一会，就变成新的 pod 了
$ kubectl get pods
NAME                                   READY   STATUS    RESTARTS   AGE
kubernetes-bootcamp-7d6f8694b6-9t5pd   1/1     Running   0          41s
kubernetes-bootcamp-7d6f8694b6-cgljl   1/1     Running   0          41s
kubernetes-bootcamp-7d6f8694b6-h2gtl   1/1     Running   0          43s
kubernetes-bootcamp-7d6f8694b6-k7hkm   1/1     Running   0          43s
```

### 验证一个更新

首先，让我们检查应用程序是否正在运行。为了找出暴露的 IP 和端口，我们可以使用描述服务:

```bash
$ kubectl describe services/kubernetes-bootcamp
Name:                     kubernetes-bootcamp
Namespace:                default
Labels:                   run=kubernetes-bootcamp
Annotations:              <none>
Selector:                 run=kubernetes-bootcamp
Type:                     NodePort
IP:                       10.109.203.10
Port:                     <unset>  8080/TCP
TargetPort:               8080/TCP
NodePort:                 <unset>  30410/TCP
Endpoints:                172.18.0.10:8080,172.18.0.11:8080,172.18.0.12:8080 + 1 more...
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>

# 拿到暴露的端口
$ export NODE_PORT=$(kubectl get services/kubernetes-bootcamp -o go-template='{{(index .spec.ports 0).nodePort}}')
$ echo NODE_PORT=$NODE_PORT
NODE_PORT=30410

# 验证是否更新
$ curl $(minikube ip):$NODE_PORT
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-7d6f8694b6-9t5pd | v=2
$ curl $(minikube ip):$NODE_PORT
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-7d6f8694b6-9t5pd | v=2
$ curl $(minikube ip):$NODE_PORT
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-7d6f8694b6-h2gtl | v=2
$ curl $(minikube ip):$NODE_PORT
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-7d6f8694b6-k7hkm | v=2
```

更新也可以通过运行 rollout 状态命令来确认:

```bash
$ kubectl rollout status deployments/kubernetes-bootcamp
deployment "kubernetes-bootcamp" successfully rolled out

# 查看当前的镜像版本。使用 describe 命令
$ kubectl describe pods
```

### 回滚更新

```bash
# 先升级部署使用 v10 的镜像
$ kubectl set image deployments/kubernetes-bootcamp kubernetes-bootcamp=gcr.io/google-samples/kubernetes-bootcamp:v10
deployment.apps/kubernetes-bootcamp image updated

$ kubectl get deployments
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
kubernetes-bootcamp   3/4     2            3           11m
# 但是没有达到我们预期的 pod 数量
# 查看当前的 pods
$ kubectl get pods
NAME                                   READY   STATUS             RESTARTS   AGE
kubernetes-bootcamp-7d6f8694b6-9t5pd   1/1     Running            0          8m41s
kubernetes-bootcamp-7d6f8694b6-h2gtl   1/1     Running            0          8m43s
kubernetes-bootcamp-7d6f8694b6-k7hkm   1/1     Running            0          8m43s
kubernetes-bootcamp-886577c5d-5kdnv    0/1     ImagePullBackOff   0          93s
kubernetes-bootcamp-886577c5d-qpb4g    0/1     ImagePullBackOff   0          93s

# 在描述命令上，能看到更多的 pod 信息
$ kubectl describe pods
... 
Warning  Failed     73s (x4 over 2m43s)  kubelet, minikube  Failed to pull image "gcr.io/google-samples/kubernetes-bootcamp:v10": rpc error: code = Unknown desc = Error response from daemon: manifest for gcr.io/google-samples/kubernetes-bootcamp:v10 not found: manifest unknown: Failed to fetch "v10" from request "/v2/google-samples/kubernetes-bootcamp/manifests/v10".
# 通观察，可以发现根本就没有 v10 这个镜像。 上述的 pods 表示有 3 个可用，有 2 个更新失败了
# 这意味着，在滚动更新过程中，新的版本启动失败了，老的丢掉了一个
# 这个时候使用回滚更新
$ kubectl rollout undo deployments/kubernetes-bootcamp
deployment.apps/kubernetes-bootcamp rolled back

$ kubectl get pods
NAME                                   READY   STATUS    RESTARTS   AGE
kubernetes-bootcamp-7d6f8694b6-9b9jb   1/1     Running   0          17s
kubernetes-bootcamp-7d6f8694b6-9t5pd   1/1     Running   0          13m
kubernetes-bootcamp-7d6f8694b6-h2gtl   1/1     Running   0          13m
kubernetes-bootcamp-7d6f8694b6-k7hkm   1/1     Running   0          13m
# 就会发现，死掉的哪一个又活过来了
```