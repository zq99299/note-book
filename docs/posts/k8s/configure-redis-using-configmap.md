# 使用 ConfigMap 来配置 Redis

本笔记参考：https://kubernetes.io/zh/docs/tutorials/configuration/configure-redis-using-configmap/



## 教程目标

- \* 创建一个包含以下内容的

  ```
  kustomization.yaml
  ```

  文件：

  - 一个 ConfigMap 生成器
  - 一个使用 ConfigMap 的 Pod 资源配置

- 使用 `kubectl apply -k ./` 应用整个路径的配置

- 验证配置已经被正确应用。

目标就是用编译 yaml 文件，来达成一步创建容器

## 使用 ConfigMap 来配置 Redis

