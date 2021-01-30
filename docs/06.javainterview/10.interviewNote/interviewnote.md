---
title: 面试笔记
lang: zh-cn
createDate: 2021-1-25
updateDate: 2021-1-30 
---

## 待补充知识点

* 数据库事务特性、隔离机制
* 常用设计模式
* ThreadLocal的内存泄漏问题
* jvm内存模型、heap堆的分类、gc算法、gc策略 JVM的类加载流程
* jdk代理模式
* CAS自旋锁、基础锁的概念
* springcloud的bean加载逻辑bean的class什么时候初始化，对接各类的组件的底层实现
* **tcp三次握手**、**jvm如何标记被使用的对象和识别未被使用的对象**

1. 基础算法的手写

   1. 快速排序

2. k8s和es的基础知识

   1. k8s管理容器
   2. es全文检索

3. zk和eurka的cp ap 以及主节点的选取

   介绍死锁及其解决办法

   分布式锁、负载路由几种算法、微服务架构、redis集群模式，多线程、、http协议，xx框架怎么做到高可用等等，然后有一些案例问你的解决方案。

   第二轮(30-40分钟)：kafka，springcloud，web安全，有没有做过springcloud的性能压测，为什么从xx框架换到xx框架，做过哪些性能调优等等。坐等第三轮面试，谁知道第三轮面试是啥？不会还是技术面吧？



## 待巩固知识点

* dubbo的远程调用过程

  dubbo的跨jvm服务调用，我理解的rpc远程调用，跨jvm？实际并没有跨jvm。dubbo在远程泛化调用时，知道了调用类的全限定路径名，通过动态代理，将服务端的类代理动态加载到客户端的jvm中，达到和调用本地服务一样的过程。

* 类加载过程，双亲委派模型，treemap\hashmap，字节字符流，强引用弱引用，jdk代理过程，隔离级别、线程池

  基本组成

* **不知道也要说思路，根据自己的思路输出大概的猜想和实现，或者让面试引导自己去理解和学习**

* 尽量引导到自己熟悉的方面

* 线程新建基本的2种，run，start区别

* AQS大概原理底层逻辑和实现

* cas锁和adder的区别，增加线程竞争热点。cas多个线程竞争一个热点value，adder是多个线程竞争多个热点将value拆分为数组，计算后再相加

* 如何避免hash冲突，什么是hash，为什么要有hashcode和equals方法

* 开发中遇到的问题

  * hash校验导致文件上传缓慢的问题
  * pdf渲染缓慢的问题。redis问题。文件安全问题，时间有效token
  * 前端摄像头问题
  * ios集成flutter

## 自我介绍

工作内容，主要负责方面，主要做的事情

## 反问点：

1. 工作主要负责
2. 工作地点、薪资，公积金比例，年终奖，调薪晋升周期
3. 总共几轮。什么时候给结果。

---

## JVM内存结构

堆（数据结构）：堆可以被看成是一棵树，如：堆排序。栈（数据结构）：一种先进后出的数据结构。

堆中存的是对象。栈中存的是基本数据类型和堆中对象的引用。

栈是运行时单位，堆是存储单位；栈解决程序的运行问题，即程序如何执行，或者说如何处理数据；堆解决的是数据存储的问题，即数据怎么放、放在哪儿。

面向对象就是堆和栈的完美结合。其实，面向对象方式的程序与以前结构化的程序在执行上没有任何区别。**但是，面向对象的引入，使得对待问题的思考方式发生了改变，而更接近于自然方式的思考。当我们把对象拆开，你会发现**

**对象的属性其实就是数据，存放在堆中；**

**而对象的行为（方法），就是运行逻辑，放在栈中。**

**我们在编写对象的时候，其实即编写了数据结构，也编写的处理数据的逻辑。不得不承认，面向对象的设计，确实很美**

参考：[JVM调优总结](https://www.cnblogs.com/andy-zhou/p/5327288.html)

### JVM内存模型

* jvm线程共享区域
  * heap堆：java对象，垃圾回收重点区域
  * 元数据（方法区）：final，static等常量，类信息（类方法，接口等）、运行时常量池

* jvm线程私有区域
  * 虚拟机栈：线程中每个方法执行时，创建一个栈帧用于存储局部变量表、操作数栈、动态连接、方法出口等信息。每一个方法被调用直至执行完毕的过程，就对应着一个栈帧在虚拟机栈中从入栈到出栈的过程，局部变量
  * 本地方法栈：native调用本地方法
  * 程序计数器：字节码指令、程序控制流的指示器，分支、循环、跳转、异常处理、线程恢复等基础功能都需要依赖这个计数器来完成。

### JVM的gc算法

gc调优：heap内存的合理分配。设置年轻代和老年代的比值，调整gc回收器的选择

标记清除：

一阶段对于被引用的对象进行标记。二阶段遍历整个heap，对所有未标记的对象进行清除。

缺点-会产生内存碎片，且需要暂停应用

复制：

每次只是用内存区域的一般。gc时，将正在使用的对象复制到另一半空闲区域同时整理。

缺点：内存区域真正使用的只有一半

标记整理：

一阶段标记被引用的对象，二阶段清理未被标记的对象，同时整理未被清除的对象到堆的一块连续内存区域

### JVM的gc策略

**Scavenge GC**

是主要对Young的GC

一般情况下，当新对象生成，并且在Eden申请空间失败时，就会触发Scavenge GC，对Eden区域进行GC，清除非存活对象，并且把尚且存活的对象移动到Survivor区。

**Full GC**

对整个堆进行整理，包括Young、Tenured和Perm。

### JVM如何判断对象生死

* 引用计数算法

  给对象设置一个引用计数器，被引用一次计数器加一次，引用失效就减一次

* 可达性分析算法

  构造类似树结构的引用分析树，根节点是GC-Root起始点，被引用的对象会加载到树节点，引用失效就断开树节点。

  判断对象生死就从根节点遍历，能遍历到是还在被引用的对象，遍历不到的就是失效的对象

## JAVA基础

### JVM类加载过程

jvm的类加载一般分为 7个阶段：加载、验证、准备、解析、初始化、使用、卸载

![](./classloader.jpg)

加载、验证、准备、初始化和卸载5个阶段的顺序是确定的，类的加载过程必须按照这种顺序按部就班地开始，而解析阶段则不一定：它在某些情况下可以再初始化阶段后再开始，这是为了支持Java语言的运行时绑定(也称动态绑定或晚期绑定)，大概步骤如下

~~~properties
装载：查找和导入Class文件

链接：把类的二进制数据合并到JRE中

​	校验：检查载入Class文件数据的正确性

​	准备：给类的静态变量分配存储空间

​	解析：将符号引用转成直接引用

初始化：对类的静态变量，静态代码块执行初始化操作
~~~

**加载：**

类加载过程中，类加载时机：`new`关键字，`static`关键字修饰，反射调用，虚拟机指定main之类

- 类的实例化是指创建一个类的实例(对象)的过程；实例化一定会走构造函数
- 类的初始化是指为类各个成员赋初始值的过程，是类生命周期中的一个阶段。初始化是对类的成员的初始化，不一定会走构造函数

1. 通过类的全限定名获取类的二进制字节流。
2. 存储字节流中的静态存储转化为方法区运行时的数据结构。
3. jvm堆中生成代表这个类的java.lang.Class实例

类加载和类连接阶段，可能并不是按照指定的先后顺序，可能在类加载的过程中，类连接操作已经开始了。但是这两个阶段的开始时间任然保持固定的先后顺序

**验证：**

1. class文件格式验证：是否以魔数开头，常量池是否有不被支持的类型
2. 元数据验证，类文件是否符合java语言规范
3. 字节码验证，符号引用验证

**准备：**

为类变量(static修饰)分配内存，然后初始化其值

如果类变量是常量，则直接赋值为该常量值否则为java类型的默认的零值

**解析：**

将常量池中的符号引用替换成直接引用，符号引用指的是：new、getField等替换成直接引用即执行目标地址

**初始化：**

类初始化是类加载过程的最后一步，初始化是执行类构造器cinit方法的过程.

除了在加载阶段用户应用程序可以通过自定义类加载器参与之外，其余动作完全由虚拟机主导和控制。到了初始化阶段，才真正开始执行类中定义的java程序代码(字节码)。

有且只有下面5种情况才会立即初始化类，称为主动引用：

- new 对象时
- 读取或设置类的静态字段（除了 被final，已在编译期把结果放入常量池的 静态字段）或调用类的静态方法时；
- 用java.lang.reflect包的方法对类进行反射调用没初始化过的类时
- 初始化一个类时发现其父类没初始化，则要先初始化其父类
- 含main方法的那个类，jvm启动时，需要指定一个执行主类，jvm先初始化这个类

其他对类的引用 称为被动引用，加载类时不会进行初始化动作

### 双亲委派模型

- **BootstrapClassLoader(启动类加载器)** ：最顶层的加载类，由C++实现，负责加载 %JAVA_HOME%/lib目录下的jar包和类或者或被 -Xbootclasspath参数指定的路径中的所有类。
- **ExtensionClassLoader(扩展类加载器)** ：主要负责加载目录 %JRE_HOME%/lib/ext 目录下的jar包和类，或被 java.ext.dirs 系统变量所指定的路径下的jar包。
- **AppClassLoader(应用程序类加载器)** :面向我们用户的加载器，负责加载当前应用classpath下的所有jar包和类。

![](./parentsdelegate.jpg)

双亲委派是指每次收到类加载请求时，先将请求委派给父类加载器完成（所有加载请求最终会委派到顶层的Bootstrap ClassLoader加载器中），如果父类加载器无法完成这个加载（该加载器的**搜索范围**中没有找到对应的类），子类尝试自己加载， 如果都没加载到，则会抛出 ClassNotFoundException 异常， 看到这里其实就解释了文章开头提出的第一个问题，父加载器已经加载了JDK 中的 String.class 文件，所以我们不能定义同名的 String java 文件。

*为什么会有这样的规矩设定？*

> 因为这样可以避免重复加载，当父亲已经加载了该类的时候，就没有必要 ClassLoader 再加载一次。考虑到安全因素，我们试想一下，如果不使用这种委托模式，那我们就可以随时使用自定义的String来动态替代java核心api中定义的类型，这样会存在非常大的安全隐患，而双亲委托的方式，就可以避免这种情况，因为String 已经在启动时就被引导类加载器（Bootstrcp ClassLoader）加载，所以用户自定义的ClassLoader永远也无法加载一个自己写的String，除非你改变 JDK 中 ClassLoader 搜索类的默认算法。

### JDK代理、cglib代理

一般的话，如果业务类实现了接口，jdk的代理可以直接代理业务类的接口。

而cglib代理一般是针对类本身进行代理

* JDK动态代理只能对实现了接口的类生成代理，而不能针对类
* CGLIB是针对类实现代理，主要是对指定的类生成一个子类，覆盖其中的方法，因为是继承，所以该类或方法最好不要声明成final 

**JDK静态代理**

1. 新建功能接口

2. 新建功能接口实现的业务bean

3. 新建业务bean的代理类proxyBean，代理类中

   1. 实例化被代理的类。

   2. 实现功能接口，业务bean功能被proxyBean代理，加上自定义代理逻辑

4. proxyBean实例化，具体业务场景使用实际调用的被proxyBean代理后的业务bean的功能

**JDK动态代理**

1. 动态代理类实现invocationHandler接口，实现invode方法

   invoke接受三个参数，被代理类proxy，被代理方法Method，被代理方法入参args。

   Method.invoke(targe,args) //targe是被代理类

2. 动态代理类构造方法接受需要被代理的类，以Object接受

3. 动态代理类提供getProxy方法初始化，Proxy.newProxyInstance，接受的入参为 被代理类的类加载器，类实现，代理类。

4. NeedProxyInteface  needProxy=  new JDKDynamicClass(new NeedProxy).getProxy();

~~~java
public class JdkDynamicProxyMishu implements InvocationHandler {
    //需要被动态代理的类
    private Object target;

    public JdkDynamicProxyMishu(Object target) {
        this.target = target;
    }

    /**
     * 获取被代理接口实例对象
     *
     * @param <T>
     * @return
     */
    public <T> T getProxy() {
        return (T) Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(), this);
    }

    /**
     * 代理调用被代理的类
     *
     * @param proxy
     * @param method
     * @param args
     * @return
     * @throws Throwable
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("dynamic before === proxy: method:" + method + " args:" + args);
        Object res = method.invoke(target, args);
        System.out.println("dynamic after === proxy: method:" + method + " args:" + args);
        return res;
    }
}
~~~

Main函数中

~~~java
// 2 jdk动态代理
        // 保存生成的代理类的字节码文件
        // 启动设置 -Dsun.misc.ProxyGenerator.saveGeneratedFiles=true
        Gongneng proxyLongzong = new JdkDynamicProxyMishu(new Laozong()).getProxy();
        proxyLongzong.chifan();
        String xiaomubiao = proxyLongzong.xiaomubiao();
        System.out.println(xiaomubiao);
        String jianghua1 = proxyLongzong.jianghua("讲话内容");
        System.out.println(jianghua1);

        Gongneng proxyLongzong2 = new JdkDynamicProxyMishu(new Laozong2()).getProxy();
        proxyLongzong2.chifan();
        String xiaomubiao1 = proxyLongzong2.xiaomubiao();
        System.out.println(xiaomubiao1);
        String jianghua2 = proxyLongzong2.jianghua("讲话内容");
        System.out.println(jianghua2);
~~~

**cglib代理**

1. 代理类需要实现MethodInterceptor接口
2. 使用时需要声明指定被代理类

~~~java
//代理类声明
public class NewMishu implements MethodInterceptor {
    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        System.out.println("cglib 输出预约时间");
        Object result =  methodProxy.invokeSuper(o,objects);
        System.out.println("cglib 输出记录访客信息");
        return result;
    }
}

//指定被代理类和代理类，调用代理方法
public class NenFangwenzhe {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(Laozong.class);
        enhancer.setCallback(new NewMishu());
        Laozong laozong =  (Laozong)enhancer.create();
        laozong.chifan();
    }
}
~~~

**JDK中具体的动态代理类是怎么产生的呢？**

**产生代理类$Proxy0类**

执行了Proxy.newProxyInstance(ClassLoader loader, Class[] interfaces, InvocationHandler h)

将产生$Proxy0类，它继承Proxy对象，并根据第二个参数，实现了被代理类的所有接口，自然就可以生成接口要实现的所有方法了（这时候会重写hashcode，toString和equals三个方法），但是还没有具体的实现体；

**将代理类$Proxy0类加载到JVM中**
这时候是根据Proxy.newProxyInstance(ClassLoader loader, Class[] interfaces, InvocationHandler h)它的第一个参数----就是被代理类的类加载器，把当前的代理类加载到JVM中

**创建代理类$Proxy0类的对象**
调用的$Proxy0类的$Proxy0（InvocationHandler）构造函数，生成$Proxy0类的对象
参数就是Proxy.newProxyInstance(ClassLoader loader, Class[] interfaces, InvocationHandler h)它的第三个参数

这个参数就是我们自己实现的InvocationHandler对象，我们知道InvocationHandler对象中组合加入了代理类代理的接口类的实现类；所以，$Proxy0对象调用所有要实现的接口的方法，都会调用InvocationHandler对象的invoke（）方法实现；

### object类的方法有哪些

toString、hashcode、equals

wait、notify、notifyall

### 抽象类可不可以实例化?

抽象类被继承后，继承类实例化，会触发抽象类的构造函数

但是不能直接使用new关键字去实例化

~~~java
abstract class B {
    private String str;
    
    public B(String a) {
        System.out.println("父类已经实例化");
        this.str=a;
        System.out.println(str);
    }
    public abstract void play();
}

public class A extends B{
    public A(String a) {
        super(a);
        System.out.println("子类已经实例化");
    }
    @Override
    public void play() {
        System.out.println("我实现了父类的方法");
    }
    public static void main(String[] args) {
        B aa=new A("a");
    }
}

父类已经实例化
a
子类已经实例化
~~~

### 字节流、字符流的区别

* FileInputStream // 文件的字节输入流

* FileOutputStream // 文件的字节输出流

* FileReader // 文件的字符输入流

* FileWriter // 文件的字符输出流

**Java的字节流**
InputStream是所有字节输入流的祖先，而OutputStream是所有字节输出流的祖先。

**Java的字符流**
Reader是所有读取字符串输入流的祖先，而writer是所有输出字符串的祖先。
InputStream，OutputStream,Reader,writer都是抽象类。所以不能直接new

字节流是最基本的，所有的InputStream和OutputStream的子类都是,主要用在处理二进制数据，它是按字节来处理的
但实际中很多的数据是文本，又提出了字符流的概念，它是按虚拟机的encode来处理，也就是要进行字符集的转化
这两个之间通过 InputStreamReader,OutputStreamWriter来关联，实际上是通过byte[]和String来关联
在实际开发中出现的汉字问题实际上都是在字符流和字节流之间转化不统一而造成的

在从字节流转化为字符流时，实际上就是byte[]转化为String时，
public String(byte bytes[], String charsetName)
有一个关键的参数字符集编码，通常我们都省略了，那系统就用操作系统的lang
而在字符流转化为字节流时，实际上是String转化为byte[]时，
byte[] String.getBytes(String charsetName)

### hash算法原理，怎么避免hash重复

**一般来说是hash的目的是将非固定长度的输入转化成固定长度的输出，该输出被称为散列值**

**哈希函数H(key)和处理冲突方法**将一组关键字映射到一个有限的地址区间上，并以关键字在地址区间中的象作为记录在表中的存储位置，这种表称为**哈希表或散列表**。这一映像称为**散列**，所得存储位置称为**哈希地址或散列地址**。

* hash一般是关键字加hash函数

* hash函数一般有

  * 随机数法

  * 直接寻址：即取关键字或者关键字的线性函数的值为散列地

**避免hash重复**

**开放地址法**

开放地执法有一个公式:Hi=(H(key)+di) MOD m i=1,2,…,k(k<=m-1)
其中，m为哈希表的表长。di 是产生冲突的时候的增量序列。如果di值可能为1,2,3,…m-1，称线性探测再散列。
如果di取1，则每次冲突之后，向后移动1个位置.如果di取值可能为1,-1,2,-2,4,-4,9,-9,16,-16,…k*k,-k*k(k<=m/2)，称二次探测再散列。
如果di取值可能为伪随机数列。称**伪随机探测再散列**。

**再哈希法**

当发生冲突时，使用第二个、第三个、哈希函数计算地址，直到无冲突时。缺点：计算时间增加。
比如上面第一次按照姓首字母进行哈希，如果产生冲突可以按照姓字母首字母第二位进行哈希，再冲突，第三位，直到不冲突为止

**链地址法（拉链法）**

将所有关键字为同义词的记录存储在同一线性链表中。如下：

![](./chainingadress.jpg)

### 有状态的请求，nginx是怎么处理的

保留状态属性直接转发

### Java-Web

### servlet、filter、listener的区别

本质都是servlet

* servlet是对请求的实际处理
  
* Init doGet doPost 、、、Destory
  
* filter是对请求的过滤

  filter能够在一个请求到达servlet之前预处理用户请求，也可以在离开servlet时处理http响应：在执行servlet之前，首先执行filter程序，并为之做一些预处理工作；

  根据程序需要修改请求和响应；在servlet被调用之后截获servlet的执行

  Init dofilter 

* Listener

  前两个一般是针对URL的

  listener一般是针对对象数据的变化

   监听器主要是用来监听 request seesion application 对象存取数据的变化

context-param -> listener -> filter -> servlet 

### 强引用、软引用、弱引用

**强引用(StrongReference):**

强引用就是指在程序代码之中普遍存在的，比如下面这段代码中的object和str都是强引用：

```java
Object object = new Object();
String str = "hello";
```

~~~java
public class Main {
    public static void main(String[] args) {
        new Main().fun1();
    }
     
    public void fun1() {
        Object object = new Object();
        Object[] objArr = new Object[1000];
    }
}
~~~

例如运行到：`Object[] objArr = new Object[1000];`

如果内存不足，JVM会抛出OOM错误也不会回收object指向的对象。不过要注意的是，当fun1运行完之后，object和objArr都已经不存在了，所以它们指向的对象都会被JVM回收。如果想中断强引用和某个对象之间的关联，可以显示地将引用赋值为null，这样一来的话，JVM在合适的时间就会回收该对象。

**软引用(SoftReference)：**

软引用是用来表示一些有用但不是必须的对象。用软引用关联的对象，只有在内存不足的时候jvm才会回收改对象

~~~java
public class Main {
    public static void main(String[] args) {
        SoftReference<String> sr = new SoftReference<String>(new String("hello"));
        System.out.println(sr.get());
    }
}
~~~

**弱引用（WeakReference）:**

弱引用也是用来描述非必需对象的，当JVM进行垃圾回收时，无论内存是否充足，都会回收被弱引用关联的对象。在java中，用`java.lang.ref.WeakReference`类来表示。下面是使用示例：

~~~java
public class Main {
    public static void main(String[] args) {
     
        WeakReference<String> sr = new WeakReference<String>(new String("hello"));
         
        System.out.println(sr.get());
        System.gc();                //通知JVM的gc进行垃圾回收
        System.out.println(sr.get());
    }
}
~~~

**虚引用(PhantomReference)：**

虚引用和前面的软引用、弱引用不同，它并不影响对象的生命周期。在java中用java.lang.ref.PhantomReference类表示。如果一个对象与虚引用关联，则跟没有引用与之关联一样，在任何时候都可能被垃圾回收器回收。

~~~java
public class Main {
    public static void main(String[] args) {
        ReferenceQueue<String> queue = new ReferenceQueue<String>();
        PhantomReference<String> pr = new PhantomReference<String>(new String("hello"), queue);
        System.out.println(pr.get());
    }
}
~~~

### 接口和抽象类的异同

相同：

* 都可以定义抽象方法，抽象方法都必须被子类或者实现类重写
* 都不能实例化对象
* 都可以定义public static 方法，public static final 常量

不同点：

* 抽象类需要用abstract修饰，且抽象方法需要abstact修饰。而接口类需要interface修饰，抽象方法直接定义即可

* 抽象类除了可以定义抽象方法，还可以和普通类一样正常定义常量和方法。而接口类，只能定义抽象方法，静态方法，final static常量  default方法。
* 一个类只能继承extends单个抽象类。而可以实现implement多个接口
* 抽象类是对象更具体的封装。而接口一般只是封装了对象的功能

### 常见Java异常

nullpointerexception

```java
java.lang.nullpointerexception
//这个异常大家肯定都经常遇到，异常的解释是"程序遇上了空指针"，简单地说就是调用了未经初始化的对象或者是不存在的对象，这个错误经常出现在创建图片，调用数组这些操作中，比如图片未经初始化，或者图片创建时的路径错误等等。
```

Classnotfound

```java
 java.lang.classnotfoundexception
 //这个异常是很多原本在jb等开发环境中开发的程序员，把jb下的程序包放在wtk下编译经常出现的问题，异常的解释是"指定的类不存在"，这里主要考虑一下类的名称和路径是否正确即可，如果是在jb下做的程序包，一般都是默认加上package的，所以转到wtk下后要注意把package的路径加上。
```

```java
arrayindexoutofboundsexception//数组下标越界
illegalargumentexception//参数不合法
IOException//输入输出异常
```

## 基本数据结构

* 常用基本数据结构

![](./structureData.jpg)

集合：数组

线性结构：栈、队列、链表

树形结构：堆

图形结构：散列表、图

* 数据结构分类：

  集合，线性结构，树形结构，图形结构（树、图也被称为非线性）

  1. 集合

     ![](./collection.png)

     数据结构中的元素之间除了“同属一个集合” 的相互关系外，别无其他关系；

  2. 线性结构

     数据结构中的元素存在一对一的相互关系

     线性结构的特点：在数据元素有限集中，除第一个元素无直接前驱，最后一个元素无直接后续以外，每个数据元素有且仅有一个直接前驱元素和一个直接后继元素。

     线性表定义：n个类型相同数据元素的有限序列。

     常用的线性结构：线性表、栈、队列、链表、数组

     栈：

    ![](./stack.jpg)

     队列：

    ![](./queue.jpg)

     链表：

    ![](./linkedlist.jpg)

     数组：

    ![](./array.jpg)

     注：线性表，栈和队列、数组的异同

     都是线性结构，都是逻辑结构的概念。都可以用顺序存储或链表存储；栈和队列是两种特殊的线性表，即受限的线性表，只是对插入、删除运算加以限制。

     线性表是一种抽象数据类型；数组是一种具体的数据结构，线性表是元素之间具有1对1的线性关系的数据元素的集合，而数组是具体的实现，即一组数据元素到数组下标的一一映射

  3. 树形结构

     **树**是一种数据结构，它是由n（n>=1）个有限节点组成一个具有层次关系的集合。

     拓展树（平衡二叉树、红黑树、B+树）

     简单二叉树：

     * 每个结点最多有两颗子树，结点的度最大为2。
     * 左子树和右子树是有顺序的，次序不能颠倒。
     * 即使某结点只有一个子树，也要区分左右子树。

    ![](./tree.jpg)

     堆：

     - 堆中某个节点的值总是不大于或不小于其父节点的值；
     - 堆总是一棵完全二叉树。

    ![](./heap.jpg)

     平衡二叉树：

     **它是一棵空树或它的左右两个子树的高度差的绝对值不超过1，并且左右两个子树都是一棵平衡二叉树。**

    ![](./balancedbinarytree.jpg)

     二叉查找树：

     也称二叉搜索树，或二叉排序树。其定义也比较简单，要么是一颗空树，要么就是具有如下性质的二叉树：
  
     * 若任意节点的左子树不空，则左子树上所有结点的值均小于它的根结点的值；
     * 若任意节点的右子树不空，则右子树上所有结点的值均大于它的根结点的值；
   * 任意节点的左、右子树也分别为二叉查找树；
     * 没有键值相等的节点。

     ![](./binarytree.jpg)

     红黑树：
  
     * 每个个节点或者是黑色，或者是红色。
   * 根节点是黑色。
     
     * 每个叶子节点（NIL）是黑色。 [注意：这里叶子节点，是指为空(NIL或NULL)的叶子节点！如果一个节点是红色的，则它的子节点必须是黑色的。
   * 从一个节点到该节点的子孙节点的所有路径上包含相同数目的黑节点。
  
  ![](./RB-tree.jpg)

   b-树：b-树就是b树，不存在b减树的读法
  
   b树相对以二叉查找树的优点：减少了磁盘IO，索引树的高度表示了索引IO次数
  
   一个m阶的B树具有如下几个特征
  
   * 根结点至少有两个子女。
  
   * 每个中间节点都包含k-1个元素和k个孩子，其中 m/2 <= k <= m
     
     * 每一个叶子节点都包含k-1个元素，其中 m/2 <= k <= m
 * 所有的叶子结点都位于同一层。
     * 每个节点中的元素从小到大排列，节点当中k-1个元素正好是k个孩子包含的元素的值域分划。

     由于b树有众多条件限制，所以他是一个自平衡的树

     ![](./b-tree.jpg)

     b树的值域划分：
  
     ![](./b-tree-val.jpg)
  
     b+树：
  
     * 有k个子树的中间节点包含有k个元素（B树中是k-1个元素），每个元素不保存数据，只用来索引，所有数据都保存在叶子节点。
     * 所有的叶子结点中包含了全部元素的信息，及指向含这些元素记录的指针，且叶子结点本身依关键字的大小自小而大顺序链接。
     * 所有的中间节点元素都同时存在于子节点，在子节点元素中是最大（或最小）元素。
     
  ![](./b+tree.jpg)
     
  B-树和B+树的区别：
     
  * 相对于b树b+树更加的'矮胖'。更加的减少磁盘IO次数。b+树除了叶子节点外，其他节点都不存储卫星数据，只存储索引数据。b树每个节点有索引又有卫星数据；卫星数据及索引对应的数据
    
  
     注：
  
     b+树怎么实现索引功能：
     
     https://blog.csdn.net/qq_26222859/article/details/80631121

  4. 散列表
  
     也叫哈希表，是根据关键码和值 (key和value) 直接进行访问的数据结构，通过key和value来映射到集合中的一个位置，这样就可以很快找到集合中的对应元素。
  
     HashMap，HashTable等，利用hash表的优势
  
     因为哈希表是基于数组衍生的数据结构，在添加删除元素方面是比较慢的，所以很多时候需要用到一种数组结合链表的一种结构
  
     jdk1.8之后才换成了数组加红黑树的结构
  
    ![](hashtable.jpg)
  
  5. 图性结构
  
     图是由结点的有穷集合V和边的集合E组成。其中，为了与树形结构加以区别，在图结构中常常将结点称为顶点，边是顶点的有序偶对，若两个顶点之间存在一条边，就表示这两个顶点具有相邻关系。
  
     ![](./map.jpg)

### 基础数据结构的编码实现

**二叉树，前序后序的编码实现**

前中后序的遍历实际上根据根节点的输出顺序的命名。

一般根节点先输出即 根-左-右 为前序遍历，同样的 左-根-右为中序遍历，左-右-根为后序遍历

**树的深度和广度遍历是怎么样过程**



### 简单集合类的代码底层原理

**HashMap：**

![](./hashmapandhashset.jpg)

hashmap在put的时候，我们把每次put进入hashmap的数据称之为为entry，hashmap的所有键值对存储在一个数组中，这个数组是hashmap的主干，首先是通过hash函数算出put的k所存放的位置。因为数组初始化长度是有限的，如果通过hash函数和k计算出重复的entry存放位置，可以通过链表的形式存储。

同样get的时候，hash函数计算k所在位置，如果计算出的位置的entry的k符合即返回。不符合判断当前节点是否存在链表，有则链式查询。

hashmap的index的计算方式：**index = HashCode（Key） & （Length - 1）** （Length是HashMap的长度）

参考：[漫画：什么是HashMap？](https://mp.weixin.qq.com/s?__biz=MzIxMjE5MTE1Nw==&mid=2653191907&idx=1&sn=876860c5a9a6710ead5dd8de37403ffc&chksm=8c990c39bbee852f71c9dfc587fd70d10b0eab1cca17123c0a68bf1e16d46d71717712b91509&scene=21#wechat_redirect)

不允许重复的键

* JDK1.7及之前：数组+链表 

* JDK1.8：数组+链表+红黑树

  TreeMap：相对于Hashmap来说，Treemap一般是基于红黑树，且其按key的自然顺序或自定义顺序存储键值对

**HashSet:**

不允许重复的值；使用`Map`的Key存值,Value存放一个固定的Object

**ArrayList：**

它是基于数组实现的List类，它封装了一个Object[]类型的数组，长度可以动态的增长

**LinkedList:**

数组的地址是连续的，链表的地址是不连续的

双向链表的数据结构

![](./linklist.jpg)

![](./linklistandarraylist.jpg)

### 常用集合类知识

**集合类分类**

![](./collections.jpg)

**List和Set的区别**

* list方法可以允许重复的对象，而set方法不允许重复对象
* list可以插入多个null元素，而set只允许插入一个null元素
* list是一个有序的容器，保持了每个元素的插入顺序。即输出顺序就是输入顺序，而set方法是无序容器，无法保证每个元素的存储顺序，TreeSet通过 Comparator 或者 Comparable 维护了一个排序顺序

list是一个有序的容器，保持了每个元素的插入顺序。即输出顺序就是输入顺序，而set方法是无序容器，无法保证每个元素的存储顺序，TreeSet通过 Comparator 或者 Comparable 维护了一个排序顺序

**HashSet和HashMap的区别**

1. HashSet和HashMap的区别，hashset的hash函数计算的val的hash函数，即hashset中没有相同的val。

   hashmap计算的是k的hash值

2. 本身属于不同的集合类，set属于集合类，map是k v

**Collection Collections的区别**

collection:它属于集合框架中的一个接口，并且是顶层接口。

 Collectios 则是在集合框架中给我们提供的一个工具类，它提供了一系列静态方法实现对各种集合的搜索、排序、线程安全化等操作。

### 为什么hashMap的主干数组长度是2的倍数

其实在hashmap的使用长度超过负载因子时，hashmap会自动扩容。由于hash值太大不能拿来直接散列，所以要用hash值对数组长度取余操作，进一步放到数组下标里。数组下标的计算方法index = HashCode（Key） & （Length - 1）。 采用二进制位操作 &，如果长度不是2的幂次数，则通过 hash(key)&(length-1) 位运算得出的index冲突几率高。这就解释了 HashMap 的长度为什么是2的幂次方。

### String、StringBuilder、StringBuffer

String：适用于少量的字符串操作的情况

StringBuilder：适用于单线程下在字符缓冲区进行大量操作的情况

StringBuffer：适用多线程下在字符缓冲区进行大量操作的情况

## 线程安全容器

线程安全：

HashTable，ConcurrentHashMap | Vector，CopyOnWrieArrayList，Collections.synchronizedList |     CopyOnWrieArraySet，Collections.synchronizedSet

不安全：

HashMap | ArrayList | HashSet

不安全会报：ConcurrentModificationException异常

分析异常原因：HashMap在put kv时，底层指令是先判断集合是否已满是否需要拓展，再put k再put v。

由于多线程调度关系，如果判断集合是否已满操作没有进行线程安全处理。可能有多个线程put 相同的k v（数据冗余）。

如果再put kv。操作没有进行线程安全处理,可能会出现数据丢失情况

arraylist 如何进行扩充，平衡二叉树原理和特点。

## 网络原理

### 正向代理、反向代理

正向代理是在客户端设置的，客户端先设置vpn转发地址，vpn转发到不同服务器

反向代理是在服务端设置，客户端无感知，客户端访问的是虚拟的ip端口，进行负载等功能，对客户端屏蔽服务端的信息

### TCP三次握手、四次挥手

* 三次握手建立连接

  客户端：发送SYN连接包

  服务端：接受到SYN，发送SYN+ACK连接加确认包

  客户端：发送ACK确认包

* 四次挥手断开连接

  客户端：FIN断开连接包

  服务端：接受FIN断开包，发送ACK断开确认包

  服务端：发送FIN+ACK断开包（需要等正在发送的数据发送完成）

  客户端：接受FIN+ACK，发送ACK断开连接

## Spring框架

Spring内部最核心的就是IOC了，动态注入，让一个对象的创建不用new了，可以自动的生产，这其实就是利用java里的反射，反射其实就是在运行时动态的去创建、调用对象，Spring就是在运行时，跟xml Spring的配置文件来动态的创建对象和调用对象里的方法的 。

Spring还有一个核心就是AOP面向切面编程，可以为某一类对象进行监督和控制（也就是在调用这类对象的具体方法的前后去调用你指定的模块）从而达到对一个模块扩充的功能。这些都是通过配置类达到的。

Spring目地就是让对象与对象（模块与模块）之间的关系没有通过代码来关联，都是通过配置类说明管理的

### aop的底层实现

通过aop注解获取需要进行操作的类（类全路径），通过反射获取类内容，通过动态代理进行代理改类是方法执行，再其方法执行前后加上自定义方法

### spring常用事务注解

**@Transactional**

参数：rollbackFor-指定异常回滚，noRollbackFor-指定异常不回滚

isolation-事务隔离级别（默认可重复读）

timeout-事务超时时间

**注：**@Transactional 只能被应用到public方法上, 对于其它非public的方法,如果标记了@Transactional也不会报错,但方法没有事务功能.

## 线程

### 线程新建

继承Thread类，调用start()方法
实现Runnable接口，重写run()方法，调用start()方法

此处注意，无论哪种启动线程时都是调用start()方法

**start(）方法，直接调用run()方法可以达到多线程的目的 通常，系统通过调用线程类的start()方法来启动一个线程，此时该线程处于就绪状态，而非运行状态，这也就意味着这个线程可以被JVM来调度执行。在调度过程中，JVM会通过调用线程类的run()方法来完成试机的操作，当run()方法结束之后，此线程就会终止**

**run()和start()的区别可以用一句话概括：单独调用run()方法，是同步执行；通过start()调用run()，是异步执行。**

如果直接调用run方法，那多线程并发异步执行的意义就不大了； 除非有特殊的业务场景需求

### 线程状态

![](./threadstatus.png)

### 线程池

一个线程池包括以下四个基本组成部分：

* 线程池管理器（ThreadPool）：用于创建并管理线程池，包括 创建线程池，销毁线程池，添加新任务；
* 工作线程（WorkThread）：线程池中线程，在没有任务时处于等待状态，可以循环的执行任务；
* 任务接口（Task）：每个任务必须实现的接口，以供工作线程调度任务的执行，它主要规定了任务的入口，任务执行完后的收尾工作，任务的执行状态等；
* 任务队列（TaskQueue）：用于存放没有处理的任务。提供一种缓冲机制。

1. 线程池的几种不同的创建方法

   * JDK 1.8使用Executor创建线程池实例。提供了多种方式的创建线程池的实例，newCachedThreadPool(...)、newFixedThreadPool(...)、newSingleThreadExecutor、newScheduledThreadPool等，其底层使用的是ThreadPoolExecutor，只不过Executor提供几种默认参数的ThreadPoolExecutor实现类。一般情况下，建议使用ThreadPoolExecutor，根据业务情况手动配置参数

   * 线程池配置参数详情

     **corePoolSize： 线程池维护线程的最少数量
     maximumPoolSize：线程池维护线程的最大数量
     keepAliveTime： 线程池维护线程所允许的空闲时间**（解释：当线程池的数量超过corePoolSize时，多余的空闲线程的存活时间。）
     **unit： 线程池维护线程所允许的空闲时间的单位
     workQueue： 线程池所使用的缓冲队列
     handler： 线程池对拒绝任务的处理策略**

2. 好处

   * 降低资源消耗：减少频繁的开启创建线程的时间和性能消耗
   * 提高性能：不用手动创建线程，从线程池取即可，
   * 增强系统的稳定性：线程是系统稀缺资源，统一的线程池管理有利于提供系统稳定性，方便统一管理和维护调优

3. 缺点

   * 线程池初始化时时间消耗较大
   * 线程池的使用较为复杂，需要谨慎调优，使用不当可能会触发系统异常
   * 线程池中线程优先级无法自定义调整

4. ThreadLocal

   * 用途：线程变量副本，每个线程用于自己的变量副本，相互不影响
* 内存泄漏问题，线程强引用，不会被GC。使用完线程共享变量后，显示调用ThreadLocalMap.remove方法清除线程共享变量，让JVM自动GC

**如何实现的多线程并发-具体步骤**

1. List集合里面存储的是要执行的任务runable的实现
2. concurrentHashMap存放执行结果
3. 循环List任务集合，使用CompletableFuture的runAsync方法，从jdk的默认线程池里面取线程执行任务，结果放入concurrentHashMap

## 线程安全

### 锁

公平/非公平

```
* 公平/非公平锁FairSync
* 公平锁：多个线程按照申请锁的顺序来获取锁
* 非公平锁：多个线程获取锁的顺序并不是按照申请锁的顺序，有可能后申请的线程比先申请的线程
* 优先获取锁，可能会出现优先级反转，或者是饥饿现象（可能存在线程一直获取不到锁）
```

可重入锁（递归锁）

```
* 可重入锁(递归锁) ReentrantLock
* 线程可以进入任何一个已经获取锁的，正在同步的代码块
```

自旋锁

```
* 通过while循环，不断重试，实际没加锁（即代码无lock类）
* 基于CAS compareAndSet
```

![](./CASAndAdder.png)

AtomicLong中有个内部变量value保存着实际的long值，所有的操作都是针对该变量进行。也就是说，高并发环境下，value变量其实是一个热点，也就是N个线程竞争一个热点。

LongAdder的基本思路就是分散热点，将value值分散到一个数组中，不同线程会命中到数组的不同槽中，各个线程只对自己槽中的那个值进行CAS操作，

这样热点就被分散了，冲突的概率就小很多。如果要获取真正的long值，只要将各个槽中的变量值累加返回。

AtomicLong是多个线程针对单个热点值value进行原子操作。而LongAdder是每个线程拥有自己的槽，各个线程一般只对自己槽中的那个值进行CAS操作。

读写锁

```
* 读写锁 ReentrantReadWriteLock
* <p>
* 多个线程同时读一个资源类，没有任何问题，为了满足并发量，读取共享资源可以同时进行
* 但是
* 如果有一个线程想写共享资源类，就不应该再有其他线程可以对该资源类进行读或者写
* 即：
* 读-读 共存
* 读-写 不共存
* 写—写 不共存
* 写操作：原子独占，不可中断
* <p>
* A\B原则
* before使用该技术前
* after使用技术后
```

### sychronize和Reentrantlock区别

AQS: abstractQueuedSynchronizer 抽象队列同步器

![](./AQS.jpg)

sychronize：

* 属于jvm层面的锁，底层是用的jvm的monitor
* 避免死锁，反编译后可以发现其每次都有两次的锁释放。
* 不需要手动释放锁
* 执行过程不可中断
* 非公平锁，可重入锁

Reentrantlock：

* 属于java.util.concurrent包，属于api层面的锁
* 需要手动释放锁，可能会出现死锁
* 执行过程可中断
* 公平和非公平都支持，
* 支持锁绑定多个条件condition，实现线程的部分和精准唤醒

在Java中Lock接口比synchronized块的优势是什么？你需要实现一个高效的缓存，它允许多个用户读，但只允许一个用户写，以此来保持它的完整性，你会怎样去实现它？

~~~java
//使用读写锁ReentrantReadWriteLock
public class Demo{
  public static void main(String[] args){
    Mycache mycache = new Mycache();
    for(i=0;i<10;i++){
      final int finalI = i;
      new Thread(()->{
        mycache.put(i+"",i);
      },"thread-test").start();
    }
  }
}

calss MyCache{
	private volatile Map<String,Obejct> cacheMap = new HashTable<>();
  private ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
  public void put(String k,Object v){
    rwLock.writeLock().lock();
    try{
      cacheMap.put(k,v)
    }catch(Exception e){
      e.printstackTrace()
    }finally{
      rwLock.writeLock().lock();
    }
  }
  public Object void get(String k){
    rwLock.readLock().lock();
    try{
      cacheMap.get(k);
    }catch(Exception){
      e.printStackTrace();
    }finally{
      rwLock.readLock.unlock();
    }
  }
}
~~~

### 阻塞同步、非阻塞同步

阻塞\非阻塞：程序在等待调用结果时的状态

阻塞：在未返回调用结果前，当前线程会被挂起，只有调用返回数据时，线程才会继续执行

非阻塞：线程在接口调用时，不能立即得到结果，不会阻止线程。会通过其他方法，类似轮训，异步通知等操作获取调用结果

同步\异步：消息通信机制

同步：在发出一个*调用*时，在没有得到结果之前，该*调用*就不返回。但是一旦调用返回，就得到返回值了

异步：发出一个调用时，立即返回，只是返回是否调用成功，调用者不会立刻得到调用结果。*被调用者*(类似接口)通过状态、通知来通知调用者，或通过回调函数处理这个调用结果。

## zookeeper

### 节点类型

1. 持久节点(PERSISTENT)

持久节点，创建后一直存在，直到主动删除此节点。

2. 持久顺序节点(PERSISTENT_SEQUENTIAL)

持久顺序节点，创建后一直存在，直到主动删除此节点。在ZK中，每个父节点会为它的第一级子节点维护一份时序，记录每个子节点创建的先后顺序。

3. 临时节点(EPHEMERAL)

临时节点在客户端会话失效后节点自动清除。临时节点下面不能创建子节点。

4. 顺序临时节点(EPHEMERAL_SEQUENTIAL)

临时节点在客户端会话失效后节点自动清除。临时节点下面不能创建子节点。父节点getChildren会获得顺序的节点列表。

## redis应用场景

### redis数据结构

string、hash：hashTable、list：ziplist\LinkedList、sets、sortedSets

![](./redis-datastructure.jpg)

### 缓存穿透和缓存雪崩问题

**缓存穿透：**即黑客故意去请求缓存中不存在的数据，导致所有的请求都怼到数据库上，从而数据库连接异常。

**缓存雪崩：**即缓存同一时间大面积的失效，这个时候又来了一波请求，结果请求都怼到数据库上，从而导致数据库连接异常。

临时token、短信通知

## sql索引以及数据库

### 索引类别

普通索引：允许重复和空值

唯一索引：值唯一，允许空值

主键索引：唯一且不能为空

单列索引：一个索引只包括单个列

组合索引：在多个列字段上面创建索引，使用组合索引时，遵循最左前缀集合。即（field1，field2，field3）的组合索引，是安装从左到右匹配索引的

### sql优化

1. 数据库查询、优化方法，sql常用函数，存储过程

   1. 优化方法

      * 关注耗时的读写是否走了索引，避免进行全表扫描

      * 避免使用selet *，查询时指定返回的具体字段

      * 使用varchar/nvarchar 代替 char/nchar

        以varchar(10)和char(10)存储3个字符长度的数据举例。varchar数据占用空间为3，最大为10；char占用的为10，3个实际字符和7个空字符

      * 索引的底层实现

   2. sql常用函数、以oracle为例

      * Avg()返回平均值，sum()返回总和
      * count()返回行数
      * MAX()、MIN() 返回列最大和最小值
      * Upper()、lower()大小写转化

   3. 存储过程是在大型数据库系统中，一组为了完成特定功能的SQL语句集，存储在数据库中，一次编译永久有效，可通过调用语句进行复用。

      **把SQL语句进行封装，并且可以使用简单的语句进行调用，这样就可以不用重复写一样的SQL，提高工作效率。**

### 手写sql语句

5000万条数据，在500ms毫秒之内

1. 减少函数运算
2. 更改where后的条件先后排序
3. 给表添加索引

* 两个引擎

  * mysql 

    对数据库ACID事务的支持。并且还提供了行级锁和外键的约束。它的设计的目标就是处理大数据容量的数据库系统。

    不支持全文搜索的。同时，启动也比较的慢，它是不会保存表的行数的。锁的力度小，写操作等不会锁全表

    启动也比较的慢，它是不会保存表的行数的

  * MyIASM引擎

    不提供事务的支持，也不支持行级锁和外键

    MyIASM引擎是保存了表的行数，写操作锁全表。读效率高

  * B+树数据库引擎的底层实现

    b树：多叉树、节点支持存储多个数据

* 什么情况加索引无效

  * 如果条件中有or，即使其中有条件带索引也不会使用(这也是为什么尽量少用or的原因)

    注意：要想使用or，又想让索引生效，只能将or条件中的每个列都加上索引

  * 对索引进行了运算会导致查询不走索引，会使用全表扫描

  * 如果列类型是字符串，那一定要在条件中将数据使用引号引用起来,否则不使用索引

  * like查询是以%开头。like "AMS%"是支持的

  * 多列索引，不按照列索引顺序查询
  
    ```
    多个索引：
    INDEX name (last_name),  
    INDEX_2 name (first_name) 
    多列索引：
    INDEX name (last_name,first_name)  
    
    生效：
    SELECT * FROM test WHERE last_name='Kun' AND first_name='Li';
    sql会先过滤出last_name符合条件的记录，在其基础上在过滤first_name符合条件的记录。那如果我们分别在last_name和first_name上创建两个列索引，mysql的处理方式就不一样了，它会选择一个最严格的索引来进行检索，可以理解为检索能力最强的那个索引来检索，另外一个利用不上了，这样效果就不如多列索引了。
    
    SELECT * FROM test WHERE last_name='Widenius';  
      
    SELECT * FROM test WHERE last_name='Widenius' AND first_name='Michael';  
      
    SELECT * FROM test WHERE last_name='Widenius' AND (first_name='Michael' OR first_name='Monty');  
      
    SELECT * FROM test WHERE last_name='Widenius' AND first_name >='M' AND first_name < 'N';  
    
    不生效：
    SELECT * FROM test WHERE first_name='Michael';  
      
    SELECT * FROM test WHERE last_name='Widenius' OR first_name='Michael';  
    
    ```

### 隔离级别

隔离性是指，多个用户的并发事务访问同一个数据库时，一个用户的事务不应该被其他用户的事务干扰，多个并发事务之间要相互隔离。	

数据库的A-原子Atomicity，C-一致Consistency，I-隔离Isolation，D-持久Durability

不考虑隔离产生的问题：

不可重复读和脏读的区别是，脏读读取到的是一个未提交的数据，而不可重复读读取到的是前一个事务提交的数据。

幻读和不可重复读都是读取了另一条已经提交的事务（这点就脏读不同），所不同的是不可重复读查询的都是同一个数据项，而幻读针对的是一批数据整体（比如数据的个数）。

* 脏读

  脏读是指一个事务在处理数据的过程中，读取到另一个为提交事务的数据

* 不可重复读

  不可重复读是指对于数据库中的某个数据，一个事务范围内的多次查询却返回了不同的结果，这是由于在查询过程中，数据被另外一个事务修改并提交了

* 幻读

  一个事务按相同的查询条件重新读取以前检索过的数据，却发现其他事务插入了满足其查询条件的新数据，这种现象就称为幻读。

***四种隔离级别解决了上述问题***

  1.读未提交（Read uncommitted）：

这种事务隔离级别下，select语句不加锁。

此时，可能读取到不一致的数据，即“***读脏*** ”。这是并发最高，一致性最差的隔离级别。

  2.读已提交（Read committed）：

可避免 ***脏读*** 的发生。

在互联网大数据量，高并发量的场景下，几乎 **不会使用** 上述两种隔离级别。

  3.可重复读（Repeatable read）：

MySql默认隔离级别。

可避免 ***脏读*** 、***不可重复读*** 的发生。

  4.串行化（Serializable ）：

可避免 ***脏读、不可重复读、幻读*** 的发生。

### Delete\Drop\Truncate

* delete（用于table和view）

  每次从表删一行，删除操作事务记录	

  不减少表和索引占用的空间

* truncate（只用于table）

  一次性删除表中所有数据，不记录日志且无法恢复。

  表和索引占用的空间会恢复

* drop（用于table）

  删除整个表，包括表结构和数据

  表空间释放

### 用itearte接受数据库查询结果

## Linux常用使用命令

### 查看某个进程的状态

~~~shell
 ps -ef|grep ams
 
 cat /proc/PID/status
~~~

## 了解哪些设计模式

### 手敲代码实现单例模式

单例：减少对象的反复实例化，单例只初始化时实例一次对象

双锁单例

~~~java
public class DclSingleton{
  private volatile static DclSingleton dclSingleton;
  private DclSingleton(){
    
  }
  public static DclSingleton instance(){
    if(dclSingleton==null){
      synchronized(DclSingleton.class){
        if(dclSingleton==null){
          dclSingleton=new DclSingleton;
        }
      }
    }
    return dclSingleton;
  }
}
~~~

枚举单例

~~~java
public enum EnumSingleton{
  INSTANCE;
  private final CommonBean commonInstance;
  EnumSingleton{
    this.commonInstance = new CommonBean();
  }
  public CommonBean getInstance(){
    return this.commonInstance
  }
}
~~~

工厂：根据不同需求场景，使用一个类型工厂创建多种对象。例如使用图形工厂类，根据使用场景使用图形工厂类创建不同图形实例，使用工厂创建出来，而不是通过对象自己的构造函数创建。

~~~java
ShapeFactory shapeFactory = new ShapeFactory();
        // 画圆
        Shape circle = shapeFactory.getShape("CIRCLE");
        circle.draw();
        // 画方形
        Shape square = shapeFactory.getShape("SQUARE");
        square.draw();
        // 画三角
        Shape rectangle = shapeFactory.getShape("RECTANGLE");
        rectangle.draw();
~~~

生产消费：典型微服务生产消费者

策略模式：相同接口，多个实现类

## 题目

1. 随机生成 Salary {name, baseSalary, bonus }的记录，如“wxxx,10,1”，每行一条记录，总共1000万记录，写入文本文件（UFT-8编码），
   然后读取文件，name的前两个字符相同的，其年薪累加，比如wx，100万，3个人，最后做排序和分组，输出年薪总额最高的10组：
   wx, 200万，10人
   lt, 180万，8人
   ....
   name 4位a-z随机， baseSalary [0,100]随机 bonus[0-5]随机 年薪总额 = baseSalary*13 + bonus

请努力将程序优化到5秒内执行完

~~~java
@Getter@Setter@ToString
public class Salary  {
    private String name; //员工姓名
    private Integer baseSalary; //基础工资
    private Integer bonus; //奖金
}
/**
 * 生成1000w条随机数据
 */
public class SalaryTest {
    public static void main(String[] args) throws IOException {
        File file = new File("D:/upload/test.txt");
        FileWriter out = new FileWriter(file, true);
        Integer count = 10000000;
        while (true){
            StringBuilder name = new StringBuilder(4);
            String chars = "abcdefghijklmnopqrstuvwxyz";
            for (int i = 0 ; i < 4; i++){
                name.append(chars.charAt((int) (Math.random() * 26))) ;
            }
            Salary salary = new Salary();
            salary.setName(name.toString());
            salary.setBaseSalary((int) (Math.random() * 100 + 1));
            salary.setBonus((int) (Math.random() * 5 + 1));
            count --;
            out.write(JSON.toJSONString(salary));
            out.write("\n");
        if (count ==0){
            out.close();
            return;
        }

        }
    }
}
public class Test {

    public static void main(String[] args) throws IOException {
        long time = new Date().getTime();
        /**
         * 其实也可以用随机流;将文件分块;多起几个线程执行;
          这样的做的话得将文件分块;意思就是通过scan的api;先全文循环后标记;分成几份.
          1000w的数据不大.这样反而效率更低
         */
        BufferedReader reader = new BufferedReader(new FileReader("D:/upload/test.txt"));
        String line = null;
        HashMap<String,Salary> map = new HashMap();
        while((line = reader.readLine()) != null){
            Salary salary = JSON.parseObject(String.valueOf(line), Salary.class);
            String key = salary.getName().substring(0, 2);
            Salary result = map.get(key);
            if (result != null) {
                result.setBaseSalary(result.getBaseSalary() + salary.getBaseSalary() * 13 + salary.getBonus());
                result.setBonus(result.getBonus() +1);
            }else {
                result = new Salary();
                result.setName(key);
                result.setBonus(1);
                result.setBaseSalary(salary.getBaseSalary() * 13 + salary.getBonus());
                map.put(key,result);
            }
        }
        ArrayList<Salary> values = new ArrayList();

         Collection<Salary> co =   map.values();
        values.addAll(co);
      /**
      java8之后提供流排序;效率更高
    **/
        List<Salary> list = map.values().stream().sorted(new Comparator<Salary>() {
            @Override
            public int compare(Salary o1, Salary o2) {
                return o2.getBaseSalary() - o1.getBaseSalary();
            }
        }).collect(Collectors.toList());

       /* Collections.sort( values, new Comparator<Salary>() {
            public int compare(Salary o1, Salary o2) {
                return o2.getBaseSalary() - o1.getBaseSalary();
            }
        });
*/
        System.out.println((new Date().getTime() - time));
        for (int i =0 ; i < 10 ; i++){
            System.out.println(list.get(i));
        }        
   }
}
// 链接：https://www.jianshu.com/p/f092fb562c87
~~~

2. 使用二分查找的方式来定位某一元素

   对于一个有序数组，我们通常采用二分查找的方式来定位某一元素，请编写二分查找的算法，在数组中查找指定元素。给定一个整数数组A及它的大小n，同时给定要查找的元素val，请返回它在数组中的位置(从0开始)，若不存在该元素，返回-1。若该元素出现多次，请返回第一次出现的位置。

~~~java
public int getBinarySearch(int[] nums,int n,int val){
  int high = n-1,low=0,mid=0,flag=-1;
  while(low<=high){
    if(nums[mid]==val){
      flag = mid
    }
    if(nums[mid]<val){
      low=mid+1;
    }
    if(nums[mid]>=val){
      high=mid-1;
    }
  }
  return flag;
}
~~~

3. 请用你熟悉的开发语言，完成如下题目:
   输入:若干个集合,各集合中的元素不会重复
   输出:求这些集合的笛卡尔积例如:
   输入:N个集合(这里N=3) :(a,b)(x,y)(1,2,3)
   输出: ((a,x,1), (a,x,2)…(b,y,3))
   在保证正确性的情况下尽可能优化效率，同时注意代码风格

4. 利用循环的方式实现我输入n 得到n对应的裴波拉契数字，裴波拉契举例：1 1 2 3 5 8 13 21 。。。。。。。

5. 用Java编写一个会导致死锁的程序

   ~~~java
   static Object lock1 = new Object();
   static Object lock2 = new Object();
   
   synchronized(lock1.class){
     synchronized(lock2.class){
       
     }
   }
   
   synchronized(lock2.class){
     synchronized(lock1.class){
       
     }
   }
   ~~~

   

6. Java写代码来解决生产者——消费者问题

   ~~~java
   ShareData shareData = new ShareData();
   // 生产
   for(int i=0;i<10;i++){
     new Thread(()->{
       shareData.increment();
     },"aaa"+i).start()
   }
   // 消费
   for(int i=0;i<10;i++){
     new Thread(()->{
       shareData.decrement();
     },"aaa"+i).start()
   }
   
   class ShareData(){
     private int num=0;
     private Lock lock = new ReentrantLock();
     private Condition condition = lock.newCondition();
     public void increment(){
       lock.lock();
       try{
         while(number!=0){
           condition.await();
         }
         number++;
         conditon.signAll();
       }catch(){
         
       }finally{
   			lock.unlock();
       }
     }
     
     public void decrement(){
       lock.lock();
       try{
         while(number==0){
           condition.await();
         }
         number--;
         condition.signAll();
       }catch(){
         
       }finally{
         lock.unlock();
       }
     }
   }
   
   
   ~~~

   

   