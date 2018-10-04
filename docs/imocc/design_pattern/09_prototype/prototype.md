# 原型设计模式

**定义**：指原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象。

**特点**：不需要知道任何创建的细节，不调用构造函数

**类型**：创建型

## 适用场景

* 类初始化消耗较多资源
* new 产生的一个对象需要非常繁琐的过程（数据准备、访问权限等）
* 构造函数比较复杂
* 循环体中生产大量对象时

## 优点

* 原型模式性能比直接 new 一个对象性能高
* 简化创建过程

## 缺点

* 必须配备克隆方法
* 对克隆复杂对象或对克隆出的对象进行复杂改造时，容易引起风险
* 深拷贝、浅拷贝要运用得当

## 扩展

* 深克隆
* 浅克隆

coding 与源码解析

## 示例 - 发送邮件
示例场景：在搞活动的时候发送大量的邮件，而邮件内容是相同的

```java
public class Mail {
    private String name;
    private String email;
    private String content;

    public Mail() {
        // 后面方便查看克隆的时候是否调用了构造函数
        System.out.println("mail class constructor");
    }

    @Override
    public String toString() {
        return "Mail{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", content='" + content + '\'' +
                '}';
    }
```
发送测试。

```java
public class MailTest {
    @Test
    public void sendMails() {
        for (int i = 0; i < 5; i++) {
            Mail mail = new Mail();
            mail.setName("姓名" + i);
            mail.setEmail(i + "@mrcode.cn");
            // 内容一样：模拟原型场景中非常耗时的几个操作，该操作是共享的
            mail.setContent("恭喜你中奖了");
            send(mail);
        }
    }

    public void send(Mail mail) {
        // 该方法模拟邮件发送操作
        System.out.println("邮件发送：" + mail);
    }

}
```
上面的代码很明显的在 mail 对象中，内容是相同的，其他的是不同的，
而且是在大量循环中不停的创建对象。假如构造这个内容是个很耗时的操作，那么这样就影响性能


可以使用克隆来操作，克隆是在通过拷贝内存中的二进制流来完成的新对象，比直接使用 new 要快

克隆操作步骤：

1. 实现 Cloneable 接口
2. 重写 Object 中的 clone 方法

如下代码

```java
public class Mail implements Cloneable {
    private String name;
    private String email;
    private String content;

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    public Mail() {
        // 后面方便查看克隆的时候是否调用了构造函数
        System.out.println("mail class constructor");
    }

    @Override
    public String toString() {
        return "Mail{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", content='" + content + '\'' +
                '}' + super.toString();  // 打印父类的 toString 方法，以便观察是否是同一个对象
    }

```

测试

```java
@Test
public void sendMailsForClone() throws CloneNotSupportedException {
    Mail mail = new Mail();
    mail.setContent("恭喜你中奖了");
    for (int i = 0; i < 5; i++) {
        Mail mailTempl = (Mail) mail.clone();
        mailTempl.setName("姓名" + i);
        mailTempl.setEmail(i + "@mrcode.cn");
        send(mailTempl);
    }
}
```

输出

```java
mail class constructor
邮件发送：Mail{name='姓名0', email='0@mrcode.cn', content='恭喜你中奖了'}cn.mrcode.newstudy.design.pattern.creational.prototype.Mail@6325a3ee
邮件发送：Mail{name='姓名1', email='1@mrcode.cn', content='恭喜你中奖了'}cn.mrcode.newstudy.design.pattern.creational.prototype.Mail@1d16f93d
邮件发送：Mail{name='姓名2', email='2@mrcode.cn', content='恭喜你中奖了'}cn.mrcode.newstudy.design.pattern.creational.prototype.Mail@67b92f0a
邮件发送：Mail{name='姓名3', email='3@mrcode.cn', content='恭喜你中奖了'}cn.mrcode.newstudy.design.pattern.creational.prototype.Mail@2b9627bc
邮件发送：Mail{name='姓名4', email='4@mrcode.cn', content='恭喜你中奖了'}cn.mrcode.newstudy.design.pattern.creational.prototype.Mail@65e2dbf3
```

可以看到 clone 的时候是不会调用构造方法的。

## 抽象类的 clone 用法

```java
// 使用抽象类来封装这种简单的克隆
public abstract class AbstractClone implements Cloneable {
    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}

// 业务类只要继承下即可
public class A extends AbstractClone {
    public static void main(String[] args) throws CloneNotSupportedException {
        A a = new A();
        A aTempl = (A) a.clone();
    }
}
```

注意 clone 在 Object 中的权限 protected ，
这也导致了不能使用 接口的 default 语法来定义（因为在接口中的所有方法都是 public 的）

## 深克隆和浅克隆
