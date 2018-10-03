# 单例模式2

## jad 查看枚举的方法定义

```java
public enum EnumInstance {
    INSTANCE;

    // 这样是全局的
    public void print() {
        System.out.println("INSTANCE");
    }
```

还可以定义抽象方法，每个枚举自己再实现

```java
public enum EnumInstance {
    INSTANCE {
        @Override
        public void print() {
            System.out.println("INSTANCE");
        }
    };

    // 这样是全局的
    public abstract void print();

    private Object data;


    public static EnumInstance getInstance() {
        return INSTANCE;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
```

那么使用 jad 查看这样的写法被编译成什么了

```java
// Decompiled by Jad v1.5.8g. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.kpdus.com/jad.html
// Decompiler options: packimports(3)
// Source File Name:   EnumInstance.java

package cn.mrcode.newstudy.design.pattern.creational.singleton;

import java.io.PrintStream;

public abstract class EnumInstance extends Enum
{

    public static EnumInstance[] values()
    {
        return (EnumInstance[])$VALUES.clone();
    }

    public static EnumInstance valueOf(String name)
    {
        return (EnumInstance)Enum.valueOf(cn/mrcode/newstudy/design/pattern/creational/singleton/EnumInstance, name);
    }

    private EnumInstance(String s, int i)
    {
        super(s, i);
    }

    public abstract void print();

    public static EnumInstance getInstance()
    {
        return INSTANCE;
    }

    public Object getData()
    {
        return data;
    }

    public void setData(Object data)
    {
        this.data = data;
    }


    public static final EnumInstance INSTANCE;
    private Object data;
    private static final EnumInstance $VALUES[];

    static
    {
        INSTANCE = new EnumInstance("INSTANCE", 0) {

            public void print()
            {
                System.out.println("INSTANCE");
            }

        }
;
        $VALUES = (new EnumInstance[] {
            INSTANCE
        });
    }
}

```

可以看到被挪到静态代码块中了。


## 容器单例模式
适合的场景：在初始化的时候把需要的对象 put ；因为现在这个是线程不安全的
```java
public class ContainerSingleton {
    private static Map<String, Object> singletonMap = new HashMap<>();

    private ContainerSingleton() {
    }

    public static void putInstance(String key, Object instance) {
        if (!singletonMap.containsKey(key)) {
            singletonMap.put(key, instance);
        }
    }

    public static Object getInstance(String key) {
        return singletonMap.get(key);
    }
}
```

## ThreadLocal 线程单例模式

```java
public class ThreadLocalInstance {
    private ThreadLocalInstance() {
    }

    private static final ThreadLocal<ThreadLocalInstance> INSTANCE_THREAD_LOCAL
            = new ThreadLocal<ThreadLocalInstance>() {
        @Override
        protected ThreadLocalInstance initialValue() {
            return new ThreadLocalInstance();
        }
    };

    public static ThreadLocalInstance getInstance() {
        return INSTANCE_THREAD_LOCAL.get();
    }
}

```

测试

```java
@Test
public void test9() {
    System.out.println(Thread.currentThread().getName() + " ====== " + ThreadLocalInstance.getInstance());
    new Thread(() -> {
        System.out.println(Thread.currentThread().getName() + " ====== " + ThreadLocalInstance.getInstance());
        System.out.println(Thread.currentThread().getName() + " ====== " + ThreadLocalInstance.getInstance());
        System.out.println(Thread.currentThread().getName() + " ====== " + ThreadLocalInstance.getInstance());
    }).start();
    System.out.println(Thread.currentThread().getName() + " ====== " + ThreadLocalInstance.getInstance());
    System.out.println(Thread.currentThread().getName() + " ====== " + ThreadLocalInstance.getInstance());
    System.out.println(Thread.currentThread().getName() + " ====== " + ThreadLocalInstance.getInstance());
}
```

输出

```java
main ====== cn.mrcode.newstudy.design.pattern.creational.singleton.ThreadLocalInstance@1d16f93d
main ====== cn.mrcode.newstudy.design.pattern.creational.singleton.ThreadLocalInstance@1d16f93d
main ====== cn.mrcode.newstudy.design.pattern.creational.singleton.ThreadLocalInstance@1d16f93d
main ====== cn.mrcode.newstudy.design.pattern.creational.singleton.ThreadLocalInstance@1d16f93d
Thread-0 ====== cn.mrcode.newstudy.design.pattern.creational.singleton.ThreadLocalInstance@3187be8a
Thread-0 ====== cn.mrcode.newstudy.design.pattern.creational.singleton.ThreadLocalInstance@3187be8a
Thread-0 ====== cn.mrcode.newstudy.design.pattern.creational.singleton.ThreadLocalInstance@3187be8a
```

可以看到，在同一个线程中的对象是唯一的。


## 单例模式在其他代码中的应用

java.lang.Runtime#getRuntime 就是一个恶汉式的单例模式

```java
public class Runtime {
    private static Runtime currentRuntime = new Runtime();
    public static Runtime getRuntime() {
        return currentRuntime;
    }
```
java.awt.Desktop#getDesktop
```java
public static synchronized Desktop getDesktop(){
    if (GraphicsEnvironment.isHeadless()) throw new HeadlessException();
    if (!Desktop.isDesktopSupported()) {
        throw new UnsupportedOperationException("Desktop API is not " +
                                                "supported on the current platform");
    }

    sun.awt.AppContext context = sun.awt.AppContext.getAppContext();
    Desktop desktop = (Desktop)context.get(Desktop.class);
    // 同步方法，先从类似容器的上下文中获取对象，没有的时候在创建一个
    if (desktop == null) {
        desktop = new Desktop();
        context.put(Desktop.class, desktop);
    }

    return desktop;
}
```
