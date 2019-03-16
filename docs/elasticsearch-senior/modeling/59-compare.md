# 关系型与 document 类型数据模型对比

本章对关系型和 document 类型数据模型进行一个简单的介绍

## 关系型数据库的数据模型
比如有如下两个实体

```java
public class Department {

	private Integer deptId;
	private String name;
	private String desc;
	private List<Employee> employees;

}

public class Employee {

	private Integer empId;
	private String name;
	private Integer age;
	private String gender;
	private Department dept;

}
```

对应关系型数据库中
```
department表

dept_id
name
desc

employee表

emp_id
name
age
gender
dept_id
```

三范式 --> 将每个数据实体拆分为一个独立的数据表，同时使用主外键关联关系将多个数据表关联起来 --> 确保没有任何冗余的数据

一份数据，只会放在一个数据表中，要想查看某个员工的部门，需要到另外一个表中查询

## es 文档数据模型
```json
{
	"deptId": "1",
	"name": "研发部门",
	"desc": "负责公司的所有研发项目",
	"employees": [
		{
			"empId": "1",
			"name": "张三",
			"age": 28,
			"gender": "男"
		},
		{
			"empId": "2",
			"name": "王兰",
			"age": 25,
			"gender": "女"
		},
		{
			"empId": "3",
			"name": "李四",
			"age": 34,
			"gender": "男"
		}
	]
}
```
es 更加类似于面向对象的数据模型，将所有由关联关系的数据，放在一个 doc json 类型数据中，整个数据的关系，还有完整的数据，都放在了一起

## 总结

- 关系型数据库：提倡不冗余数据，数据分离
- 文档型数据：相关联的数据放在一起，一定的冗余数据
