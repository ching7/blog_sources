---
title: 面向切面编程
lang: zh-cn
createDate: 2020-7-17
updateDate: 2020-7-17
category: spring
---

## 面向切面编程

在软件业，AOP为Aspect Oriented Programming的缩写，意为：[面向切面编程](https://baike.baidu.com/item/面向切面编程/6016335)，可以通过[预编译](https://baike.baidu.com/item/预编译)方式和运行期动态代理实现在不修改[源代码](https://baike.baidu.com/item/源代码)的情况下给程序动态统一添加功能的一种技术。AOP实际是GoF设计模式的延续，设计模式孜孜不倦追求的是调用者和被调用者之间的解耦,提高代码的灵活性和可扩展性，AOP可以说也是这种目标的一种实现。

### 主要功能

日志记录，性能统计，安全控制，事务处理，[异常处理](https://baike.baidu.com/item/异常处理)等等。

### 主要意图

将日志记录，性能统计，安全控制，事务处理，[异常处理](https://baike.baidu.com/item/异常处理)等代码从业务逻辑代码中划分出来，通过对这些行为的分离，我们希望可以将它们独立到非指导业务逻辑的方法中，进而改变这些行为的时候不影响业务逻辑的代码。