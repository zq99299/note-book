# spring 开发中的实战

## bootJar 部署到 k8s 中，启动传参数与配置文件

### 背景

在 boot 中，有一部分参数是只能写在  application.yml 中，写在 `application-xx.yml` 中，由于使用时机问题，有些配置属性就不生效了（比如：spring.profiles.active=prod）

那么这一类首先想到解决方法是：在启动 jar 包的时候使用如下的形式传参

```
nohup java -jar ${APP_JAR} --spring.profiles.active=${ACTIVE} --server.servlet.session.store-dir=${RESOURCES}/session-store-dir --logging.file.path=${RESOURCES}/logs > /dev/null 2>&1 &
```

可以看到，传参变得很复杂，是个不小的挑战，

### 解决方案

> Spring boot 版本：2.4.1

那么我可以基于 [boot 的外部化配置文件](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config) 中的 **外部应用程序属性**，将需要覆盖程序内的配置文件属性放到与 bootJar 同级的 `config` 目录下，如下所示：

```
|- bootJar
|- config
	|- application.yml
	|- application-prod.yml
```

我们将所有的配置属性都可以写到这个 application.yml 文件中，此时外部文件的属性优先级最高，会覆盖掉程序内部的配置文件属性

## 日志变 JSON 格式输出

### 背景

放在 k8s 下，控制台输出的日志将被抽走，原来多行日志（特别是堆栈错误信息）会被解析成多行，而不是一行

### 解决方案

> Spring boot 版本：2.4.1

解决思路如下：

1. 利用 logback 中的 `appender.encoder` 格式化控制台输出格式
2. 只在生产环境下生效：logback 配置文件只在生产环境下生效，该配置文件放在外部化配置文件目录中，通过外部化配置引用该配置文件

具体做法如下：

1. 添加 `logstash-logback-encoder` 依赖，但是我们只使用它的 encoder 处理类

   ```
   // 利用 logstash 打印 json 格式的 日志信息
   implementation 'net.logstash.logback:logstash-logback-encoder:6.6'
   ```

2. logback-spring.xml 配置文件，注意该配置文件只在生产环境下生效

   配置 consoleAppender ，在里面使用 LogstashEncoder 进行格式化日志信息

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
       <include resource="org/springframework/boot/logging/logback/base.xml" />
       <appender name="consoleAppender" class="ch.qos.logback.core.ConsoleAppender">
           <encoder class="net.logstash.logback.encoder.LogstashEncoder">
               <providers>
                   <timestamp>
                       <timeZone>EST</timeZone>
                   </timestamp>
                   <pattern>
                       <pattern>
                           {
                           "level": "%level",
                           "service": "orders",
                           "traceId": "%X{X-B3-TraceId:-}",
                           "spanId": "%X{X-B3-SpanId:-}",
                           "thread": "%thread",
                           "class": "%logger{40}",
                           "message": "%message"
                           }
                       </pattern>
                   </pattern>
                   <stackTrace>
                       <throwableConverter class="net.logstash.logback.stacktrace.ShortenedThrowableConverter">
                           <maxDepthPerThrowable>30</maxDepthPerThrowable>
                           <maxLength>2048</maxLength>
                           <shortenedClassNameLength>20</shortenedClassNameLength>
                           <rootCauseFirst>true</rootCauseFirst>
                       </throwableConverter>
                   </stackTrace>
               </providers>
           </encoder>
       </appender>
       <logger name="jsonLogger" additivity="false" level="DEBUG">
           <appender-ref ref="consoleAppender"/>
       </logger>
       <root level="debug">
           <appender-ref ref="consoleAppender"/>
       </root>
   </configuration>
   ```

3. 在外部化配置文件中指向该配置文件

   我一般是和外部化文件放到一起，如下所示

   ```
   |- bootJar
   |- config
   	|- application.yml
   	|- logback-spring.xml
   ```

   application.yml 配置该文件

   ```yml
   logging:
     config: file:/app/config/logback-spring.xml
     level:
       root: info
   ```

   ## 升级程序自动执行相关数据库变更

   ### 背景

   对于数据库字段变更，数据库结构首次程序部署时的初始化，我们一般都是如下流程：

   1. 在生产环境下，找一台数据库
   2. 手动创建数据库
   3. 手动执行 SQL 脚本把表和初始数据创建好

   在下次更新程序时的流程：

   1. 手动同步数据库表结构
   2. 手动同步需要增加或则变更的数据

   上面多次出现到了 **手动**，这个过程不难，但是繁琐且容易出错。 为了解决这个我们可以利用自动化来解决。

   ### 解决方案

   > Spring boot 版本：2.4.1

   Spring-boot 官方有一章是：[使用更高级别的数据库迁移工具](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#howto-use-a-higher-level-database-migration-tool)，自动配置中直接支持 [Flyway](https://flywaydb.org/) and [Liquibase](https://www.liquibase.org/).

   这里我们使用 Flyway 来实现，官方也有他的 [工作原理和流程](https://flywaydb.org/documentation/getstarted/how)，还有与 [spring boot 集成指引](https://flywaydb.org/documentation/usage/plugins/springboot)，这里不细说。

   简单说一下：

   1. flywa 会以版本号的方式在指定位置检测是否有 sql 脚本文件
   2. 如果检测到有，则会执行该 sql 脚本文件
   3. 执行完成后，会把该次执行的记录存放在 *flyway_schema_history* 表中
   4. 下次程序启动，拿到 sql 脚本文件名中的版本号，与 *flyway_schema_history* 表中的记录进行对比，如果已经执行过则不再执行

   那么这里就有如下的利用思路：

   1. 程序首次运行，初始化表结构和初始数据

   2. 程序升级：执行表结构变更和数据变更脚本

      负载的数据变更，这里暂时不涉及到，官方说 flyway 还支持 java 代码编写迁移。

   实际配置如下：

   1. 添加 flyway 依赖

      ```groovy
          implementation 'org.flywaydb:flyway-core'
          // 没有使用这个，纯粹为了解决启动报错：java.lang.NoClassDefFoundError: liquibase/exception/ChangeLogParseException
          implementation 'org.liquibase:liquibase-core'
      ```

   2. 自动配置参数：在 `application[-xx].yml`

      ```yml
      spring:
        flyway:
          # 指定迁移脚本位置，这里放到 classpath 下的
          locations: classpath:db/migration
          # 是否关闭这个功能：当表不为空时，是否清理数据库
          clean-disabled: true
          enabled: true
        liquibase:
          enabled: false
      ```

   3. 在 `classpath:db/migration` 下准备你的数据迁移脚本

      V1__Initial_Setup.sql

      ```sql
      SET NAMES utf8mb4;
      -- 外键约束是否开启
      SET FOREIGN_KEY_CHECKS = 0;
      
      -- 这里执行你的 sql 脚本
      CREATE TABLE `compound_task` ....
      INSERT INTO ...
      
      SET FOREIGN_KEY_CHECKS = 1;
      ```

   其他配置属性，请参考官方的说明，这里简单讲解下它的迁移脚本命名方式：

   以 `V1__Initial_Setup.sql` 为例：

   1. `V1`  这个前缀的 `V` 是可以通过配置属性改变的，重要的是里面的数字

      它充当了版本的概念，每个版本只执行一次

   2. `__` 后面的是你的描述，可以随意填写

##  Spring MVC 缓存控制(HTTP 缓存)

使用 bootJar 内嵌启动的话，Spring MVC 也提供了一些缓存控制功能，[官方比较详细](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-caching)。

注意：你用 spring boot，但是里面 wen 层，用的是 Spring mvc ，那么就你要去找 Spring MVC 的官方文档，而不是 boot 的文档

该文档中有：

- Controllers：对 controller 提供缓存支持
- Static Resources：对静态资源提供缓存支持

这里讲解下如何对一个 Controller 提供 HTTP 缓存的支持

### 背景

提供了一个接口：根据 ID 查询一张图片，通过流的形式响应

一般来说，这种接口无法触发浏览器的 缓存机制，但是通过如下方式可以做到

### 解决方案

没有缓存的写法

```java
    /**
     * 图片读取
     */
    @GetMapping("/img/{tppFaceId}")
    public void img(@PathVariable String tppFaceId,
                    HttpServletResponse response) throws IOException {
        TppFace face = faceService.getById(tppFaceId);
        if(face == null){
            throw new Exception("没有该资源");
        }
        final String img = face.getImg();
        response.addDateHeader("Expires", System.currentTimeMillis() + 1000 * 60 * 60);
        response.addDateHeader("Last-Modified", System.currentTimeMillis());
        response.addHeader("Cache-Control", "public");
        final Path path = Paths.get(pathServiceProperties.getWorkPath(), img);
        String contentType = new Tika().detect(path.getFileName().toString());
        response.setContentType(contentType);
        try (
                final InputStream is = Files.newInputStream(path)
        ) {
            IoUtil.copy(is, response.getOutputStream());
        }
    }
```

上述写了 缓存头，过期时间之类的，其实并不会生效。

下面是生效的写法

```java
    @GetMapping("/img/{tppFaceId}")
    public void img(@PathVariable String tppFaceId,
                    WebRequest request) throws IOException {
		// 在本场景中，图片生成之后，就永远不会改变，这里的版本号我就写死成 1 了
        final String eTag = "1";
        // 这里检查该请求携带过来的 eTag 版本号，如果与我们这里的一致，就直接返回
        // 返回时: 框架帮我们做了重要的一件事件，更改了响应状态码为 304
        if (request.checkNotModified(eTag)) {
            return;
        }

        TppFace face = faceService.getById(tppFaceId);
        if (face == null) {
            throw new Exception("没有该资源");
        }
        final String img = face.getImg();
        response.addDateHeader("Last-Modified", System.currentTimeMillis());
        // 利用缓存配置构建设置头  max-age 的时间等信息
        response.addHeader(HttpHeaders.CACHE_CONTROL, CacheControl.maxAge(1, TimeUnit.DAYS).getHeaderValue());
        // 该 id 首次响应的时候，添加响应头，版本也写  1
        response.addHeader("eTag", "1");
        final Path path = Paths.get(pathServiceProperties.getWorkPath(), img);
        String contentType = new Tika().detect(path.getFileName().toString());
        response.setContentType(contentType);
        try (
                final InputStream is = Files.newInputStream(path)
        ) {
            IoUtil.copy(is, response.getOutputStream());
        }
    }
```