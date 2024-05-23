# 接口隔离原则

**定义**：用多个专门的接口，而不使用单一的总接口，客户端不应该依赖它不需要的接口

* 一个类（泛指）对一个类的依赖应该建立在虚小的接口上
* 建立单一接口，不要建立庞大臃肿的接口
* 尽量细化接口，接口中的方法尽量少
* **注意适度原则，一定要适度**

  如果只是尽可能的一个接口一个方法的话，那么接口类将爆炸，复杂性更高

**优点**：符合我们常说的高内聚低耦合的设计思想，从而使得类具有很好的：

* 可读性
* 可扩展性
* 可维护性

高内聚：减少对外的交互，使接口中最少的方法去完成最多的事情

一定要适度，在实际开发过程中，还要考虑业务模型，包括预判未来可能变更的地方

## coding

```java
// 动物行为
public interface IAnimalAction {
    void eat();

    void fly(); // 飞

    void swim(); // 游泳
}

```

```java
public class Dog implements IAnimalAction {
    @Override
    public void eat() {

    }

    @Override
    public void fly() {
      // 狗不会飞
    }

    @Override
    public void swim() {

    }
}
```

对于狗来说，其他两种行为都ok，但是不会飞。假如再增加一种鸟类动物大雁，大雁不会游泳。

那么使用接口隔离原则来实现的一种可能：将接口拆分

```java
public interface IEatAnimalAction {
    void eat();
}

public interface IFlyAnimalAction {
    void fly();
}

public interface ISwimAnimalAction {
    void swim();
}
```

```java
public class Bird implements IFlyAnimalAction, IEatAnimalAction {
    @Override
    public void eat() {

    }

    @Override
    public void fly() {

    }
}
```

![](./assets/markdown-img-paste-20180826141002886.png)

这样就将行为给隔离开了。也不会有空实现方法了；

那么 单一职责原则和接口隔离原则有什么不同呢?

* 单一职责原则：约束的是类，接口，方法的**职责**是单一的
  - 也就是说，在一个接口中，只要职责是单一的，有多个方法也可以
  - 如：游泳：有狗刨，自由泳等
  - 针对的是程序中的实现和细节

* 接口隔离原则：主要约束的是接口，
  - 针对抽象，整体，程序框架的构建

还是适度，看项目规模、业务模型，不要一个简单的业务就搞了n个接口和类，开发起来也麻烦
