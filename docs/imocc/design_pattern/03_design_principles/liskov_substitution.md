# 里氏替换原则

Liskov Substitution Principle LSP

稍微有点难。不过不要慌

**定义**：如果对每一个类型为 T1 的对象 o1，都有类型为 T2 的对象 o2，
使得以 T1 定义的所有程序 P 在所有的对象 o1 都替换成 o2 时，程序 P 的行为没有发生变化，
那么类型 T2 是类型 T1的子类型。

提取关键词解读：

* T1 类有对象 o1
* T2 类有对象 o2
* P 程序

当把程序中依赖 o1 对象全部替换成 o2 时，程序的行为没有发生变化。那么就可以认定为：T2 是 T1的子类型

里氏替换原则是对开闭原则的一个补充：

* 开闭原则：面向抽象编程，要抽象
* 里氏替换原则：可以被替换，那么就有抽象；对实现抽象化的具体步骤规范

比如：我们自定义一个类继承了ArrayList，但是重写get(index)方法时，把索引改成从1开始了，
那么这样的虽然有抽象，但是行为发生了变化，这样也不被认为 自定义的是 ArrayList的子类型

> 上面这个比喻：我没有明白，懵逼了

**定义扩展**：一个软件实体如果适用一个父类的话，那一定适用于其子类，
所有引用父类的地方必须能透明地适用其子类的对象，子类对象能够替换父类对象，而程序逻辑不变


在 java 中来说，只要只继承了某父类，那么就被认定为是其子类型，
但是对于里氏替换原则来说，就算继承了，但是导致替换后，行为发生了变化，则被认定为是不合法的

**引申意义**：子类可以扩展父类的功能，但不能改变父类原有的功能。

* 含义 1：子类可以实现父类的抽象方法，但不能覆盖父类的非抽象方法。
* 含义 2：子类中可以增加自己特有的方法。

  对于开闭原则中的例子如下，就有一个含义（含义 2）被破坏了，
  JavaDiscountCourse 在扩展父类功能的时候，改变了 getPrice 的含义
  ```java
  public static void main(String[] args) {
         ICourse iCourse = new JavaDiscountCourse(96, "设计模式", 389d);
         JavaDiscountCourse javaCourse = (JavaDiscountCourse) iCourse;
         System.out.println("ID:" + javaCourse.getId() +
                 "，课程名称：" + javaCourse.getName() +
                 "，价格：" + javaCourse.getPrice() +
                 ", 原价：" + javaCourse.getOriginPrice()
         );
     }
  ```

  通过上面的知识点来回想自己在实际工作中，经常会重写父类的方法，这样写起来的确简单快捷，
  但是在一定程度上导致了整个继承体系的可复用性比较差，特别是使用多态频繁的时候，出错的几率会大大增加。
* 含义 3 ：当子类的方法**重载**父类的方法时，方法的前置条件（既方法的入参）要比父类的入参更宽松。
* 含义 4 ：当子类的方法实现父类的方法时（重写/重载或实现抽象方法）方法的后置条件（及方法的返回值）要比如雷更严格或相等。


**优点**：

* 约束继承泛滥，开闭原则的一种体现

  如：Person 中有一个 生娃 的方法，子类可能有白人、黑人、黄种人，这是可以的，符合里氏替换原则。
  但是，来一个男人，机器人，这就是一个继承泛滥的表现

* 加强程序的健壮性，同时变更时也可以做到非常好的兼容性，提高程序的维护性，扩展性。
降低需求变更时引入的风险。  

## coding

## 从类层面演示
**场景**：正方形和长方形，我们认为正方形是一种特殊的长方形。

```java
// 长方形
public class Rectangle {
    private long length;
    private long width;

    public long getLength() {
        return length;
    }

    public void setLength(long length) {
        this.length = length;
    }

    public long getWidth() {
        return width;
    }

    public void setWidth(long width) {
        this.width = width;
    }
}
```

```java
// 正方形：来验证在某些场景下，正方形是否是长方形
public class Square extends Rectangle {
    // 边长：正方形的长宽是一样的
    private long sideLength;

    public long getSideLength() {
        return sideLength;
    }

    public void setSideLength(long sideLength) {
        this.sideLength = sideLength;
    }

    @Override
    public long getLength() {
        return getSideLength();
    }

    @Override
    public void setLength(long length) {
        setSideLength(length);
    }

    @Override
    public long getWidth() {
        return getSideLength();
    }

    @Override
    public void setWidth(long width) {
        setSideLength(width);
    }
}
```

```java
public class Test {
    public static void resize(Rectangle rectangle) {
        while (rectangle.getWidth() <= rectangle.getLength()) {
            rectangle.setWidth(rectangle.getWidth() + 1);
            System.out.println("width:" + rectangle.getWidth() +
                    "  length:" + rectangle.getLength());
        }
        System.out.println("resize 方法结束：width:" + rectangle.getWidth() +
                "  length:" + rectangle.getLength());
    }

    public static void main(String[] args) {
        Rectangle rectangle = new Rectangle();
        rectangle.setLength(20);
        rectangle.setWidth(10);
        resize(rectangle);

        Square square = new Square();
        square.setSideLength(10);
        resize(square);
    }
}

```

输出

```
width:20  length:20
width:21  length:20
resize 方法结束：width:21  length:20

width:239722  length:239722
width:239723  length:239723
```

会发现，在验证 resize 场景中，正方形是否是长方形这一子类的时候，替换之后，再次运行 resize 方法的时候，行为改变了，不能结束了；

那么这个时候就要考虑正方形继承长方形是否是正确的了，
假设之前的鸟类，我们认为飞的行为就是鸟类的特性，但是鸵鸟就是不能飞，强行让鸵鸟继承鸟，则有可能会造成与这里一致的情况。行为被改变了。

那么这里来继续重构，解耦正方形和长方形；他们都是四边形；

```java
public interface Quadrangle {
    long getLength();

    long getWidth();
}
```

```java
public class Rectangle implements Quadrangle {
    private long length;
    private long width;

    public void setLength(long length) {
        this.length = length;
    }

    public void setWidth(long width) {
        this.width = width;
    }

    @Override
    public long getLength() {
        return 0;
    }

    @Override
    public long getWidth() {
        return 0;
    }
}
```

```java
public class Square implements Quadrangle {
    // 边长：正方形的长宽是一样的
    private long sideLength;

    public long getSideLength() {
        return sideLength;
    }

    public void setSideLength(long sideLength) {
        this.sideLength = sideLength;
    }

    @Override
    public long getLength() {
        return getSideLength();
    }

    @Override
    public long getWidth() {
        return getSideLength();
    }
}
```
那么就会发现，没有办法设置宽度了。对于 resize 场景来说，正方形是不适合该场景的；

所以这里还是只能用于长方形。说明了，长方形和正方形在该场景中不适合里氏替换原则的
```java
public static void resize(Quadrangle rectangle) {
    while (rectangle.getWidth() <= rectangle.getLength()) {
        // 没有办法 setWidth
        rectangle.setWidth(rectangle.getWidth() + 1);
        System.out.println("width:" + rectangle.getWidth() +
                "  length:" + rectangle.getLength());
    }
    System.out.println("resize 方法结束：width:" + rectangle.getWidth() +
            "  length:" + rectangle.getLength());
}
```

通过这个例子，能深刻的理解里氏替换原则在我们软件设计中存在的巨大作用。

同时也约束我们，子类的行为与父类应该保持一致，如果子类达不到这一点，那么子类就会违反里氏替换原则。

在实际过程中，是多人协同开发的，甚至通过层层包装后，再使用，
如果这个时候，对于 resize 场景不采用里氏替换原则来约束，那么就将产生与预期不一致的行为，导致错误产生

## 方法入参出参 来说明
* 含义 3 ：当子类的方法**重载**父类的方法时，方法的前置条件（既方法的入参）要比父类的入参更宽松。

```java
public class Base {
    public void method(HashMap hashMap) {
        System.out.println("父类被执行");
    }
}

public class Child extends Base {
    @Override
    public void method(HashMap hashMap) {
        System.out.println("子类 HashMap 被执行");
    }

    // 比父类入参更宽松，不是重写，是重载
    public void method(Map map) {
        System.out.println("子类 Map 被执行");
    }
}
```

```
public class Test {
    public static void main(String[] args) {
        Child child = new Child();
        HashMap hashMap = new HashMap<>();
        child.method(hashMap);
    }
}

输出

子类 HashMap 被执行
```

当注释掉重写方法时，输出为 `父类被执行`;
```java
public class Child extends Base {
    // @Override
    // public void method(HashMap hashMap) {
    //     System.out.println("子类 HashMap 被执行");
    // }

    // 比父类入参更宽松，不是重写，是重载
    public void method(Map map) {
        System.out.println("子类 Map 被执行");
    }
}
```
这个结果是正确的，那么反过来，将父类替换成

```java
public class Base {
    public void method(Map hashMap) {
        System.out.println("父类被执行");
    }
}

public class Child extends Base {
    // 重载：子类的前置条件比父类严格
    public void method(HashMap hashMap) {
        System.out.println("子类 HashMap 被执行");
    }
}

public class Test {
    public static void main(String[] args) {
        Child child = new Child();
        HashMap hashMap = new HashMap<>();
        child.method(hashMap);
    }
}
```

将会输出： 子类 HashMap 被执行

这就破坏了里氏替换原则，因为这样执行，不是父类的被执行了，容易引起业务逻辑的混乱。bug容易产生。

在写这个简单的例子的时候，就很容易被搞懵逼；

## 后置条件，也就是返回参数
* 含义 4 ：当子类的方法实现父类的方法时（重写/重载或实现抽象方法）方法的后置条件（及方法的返回值）要比如雷更严格或相等。

在 java 中重写适合返回参数无关的，像下面这个例子，在 Idea 中就提示错误了，
所以这样的情况一般比较少犯错误，如果不写 override，那么就容易产生混乱。

```java
// 父类是 HashMap
@Override
public Map method() {
}
```


实际上看来，这里的例子是在讲，多态，重写，重载，相似的新方法，容易产生逻辑混乱调用，不容易发现问题。 如果遵守里氏替换原则的写法，能减少这样的情况。维护性

还有就是里氏替换原则的约束继承泛滥的问题。

> 这一个原则理解起来感觉有点难，懵逼
