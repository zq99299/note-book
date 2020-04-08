# mycat 源码学习

对于 mycat 应该有几个核心原理需要弄明白:

1. mycat 与 mysql 是怎么交互的
2. 前端应用是怎么和 mycat 交互的
3. 前端应用的请求到落地在 mysql 库中，然后结果是怎么返回到应用的





---

临时仓库

---

## ServerParse
命令解析，所用是解析出语句的命令是什么？

```java
@Test
  public void testIsSelect() {
      Assert.assertEquals(ServerParse.SELECT, 0xff & ServerParse.parse("select ..."));
      Assert.assertEquals(ServerParse.SELECT, 0xff & ServerParse.parse("SELECT ..."));
      Assert.assertEquals(ServerParse.SELECT, 0xff & ServerParse.parse("sELECt ..."));
  }

// 就是不知道为什么要进行位运算，返回，外面再位运算还原
return (offset << 8) | SELECT;
```
