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

```java
public class Pig implements Cloneable {
    private String name;
    private Date birthday;

    public Pig(String name, Date birthday) {
        this.name = name;
        this.birthday = birthday;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    @Override
    public String toString() {
        return "Pig{" +
                "name='" + name + '\'' +
                ", birthday=" + birthday +
                '}' + super.toString();
    }
    ...
}
```
测试

```java
@Test
public void fun1() throws CloneNotSupportedException, InterruptedException {
    Pig p1 = new Pig("小猪1", new Date());
    Pig p2 = (Pig) p1.clone();
    System.out.println(p1);
    System.out.println(p2);
    // 修改其中一个时间
    p2.getBirthday().setTime(6666666L);
    System.out.println(p1);
    System.out.println(p2);
}

============= 打印结果

Pig{name='小猪1', birthday=Wed Dec 19 21:53:04 CST 2018}cn.mrcode.newstudy.design.pattern.creational.prototype.Pig@7b49cea0
Pig{name='小猪1', birthday=Wed Dec 19 21:53:04 CST 2018}cn.mrcode.newstudy.design.pattern.creational.prototype.Pig@887af79
Pig{name='小猪1', birthday=Thu Jan 01 09:51:06 CST 1970}cn.mrcode.newstudy.design.pattern.creational.prototype.Pig@7b49cea0
Pig{name='小猪1', birthday=Thu Jan 01 09:51:06 CST 1970}cn.mrcode.newstudy.design.pattern.creational.prototype.Pig@887af79
```
可以看到修改 p2 的时间，p1 的也跟着一起变化了。这就是浅克隆，因为 birthday 是引用类型；如下修改即可

引用类型也需要再次克隆
```java
@Override
protected Object clone() throws CloneNotSupportedException {
    Pig pig = (Pig) super.clone();
    pig.birthday = (Date) pig.birthday.clone();
    return pig;
}
```

## 克隆破坏单例

克隆也可以破坏单例模式的单例特性

```java
/**
 * 恶汉式单例模式
 *
 * @author : zhuqiang
 * @version : V1.0
 * @date : 2018/9/28 22:08
 */
public class HungrySingleton implements Serializable, Cloneable {
    private final static HungrySingleton hungrySingleton = new HungrySingleton();

    private HungrySingleton() {
        if (hungrySingleton != null) {
            throw new IllegalStateException("单例模式不允许使用反射创建");
        }
    }

    public static HungrySingleton getInstance() {
        return hungrySingleton;
    }

    private Object readResolve() {
        return hungrySingleton;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
```

使用之前的单例模式进行实习克隆方法，然后测试

```java
@Test
    public void fun1() throws CloneNotSupportedException {
        HungrySingleton i1 = HungrySingleton.getInstance();
        HungrySingleton i2 = (HungrySingleton) i1.clone();
        System.out.println(i1);
        System.out.println(i2);
    }

    @Test
    public void fun2() throws CloneNotSupportedException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        HungrySingleton i1 = HungrySingleton.getInstance();
        // 实现克隆方法后，权限修饰符最小为 protected，所以不能防止被调用
        // 假设是 private 了，那么也可以使用反射进行调用 clone 方法
        Method clone = i1.getClass().getDeclaredMethod("clone");
        clone.setAccessible(true);
        HungrySingleton i2 = (HungrySingleton) clone.invoke(i1);
        System.out.println(i1);
        System.out.println(i2);
    }
```
上面的代码就破坏了单例模式的“单”特性；现在有两种方法解决这个问题：

1. 不实现 clone 方法
2. 在 clone 方法中返回同一个实例

```java
@Override
    protected Object clone() throws CloneNotSupportedException {
        return HungrySingleton.getInstance();
    }
```


## 源码解析

### ArrayList

要学会 clone 是怎么使用的，最简单的方法就是查看源码，如下面的源码

```java
public Object clone() {
       try {
           ArrayList<?> v = (ArrayList<?>) super.clone();
           v.elementData = Arrays.copyOf(elementData, size);
           v.modCount = 0;
           return v;
       } catch (CloneNotSupportedException e) {
           // this shouldn't happen, since we are Cloneable
           throw new InternalError(e);
       }
   }
```

### HashMap

```java
@Override
   public Object clone() {
       HashMap<K,V> result;
       try {
           result = (HashMap<K,V>)super.clone();
       } catch (CloneNotSupportedException e) {
           // this shouldn't happen, since we are Cloneable
           throw new InternalError(e);
       }
       result.reinitialize();
       // 这里才是重新把值取出来再 put 进去
       // hashMap 的克隆也是浅克隆，只是把 Node 对象克隆了，但是实际的值没有深克隆
       result.putMapEntries(this, false);
       return result;
   }
```
通过对 value 是引用类型的 HashMap 进行克隆调用测试，发现是浅克隆
