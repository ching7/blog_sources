---
title: Java 反射
lang: zh-cn
createDate: 2020-7-01
updateDate: 2020-7-01
category: java
---
# Java 反射

什么是**反射**：

正常情况下我们新建一个类就是：

```java
Student st = new Student()
```

通过new方式，调用默认构造方法新建一个类，加载到jvm虚拟机中，这种类的加载方法存在一种问题，就是运行时不灵活，如果我们把student类换成teacher类，就需要重新修改代码。

而java的反射机制提供了一种方法，在程序运行时动态加载所需要的类

```java
Class c1 = Class.forName("com.cyh.test.Teacher");
//创建此Class对象所表示类的一个新实例,
 //newInstance方法调用的是Teacher的空参数构造方法
Object o = c1.newInstance();
```

类路径可以从配置文件加载，从而实现不需要修改代码，实现类的替换

除此之外，还可以根据反射特性，对于任意一个类。都能都知道这个类的所有属性和方法，对于任意一个对象，都能够调用它的任意一个方法和属