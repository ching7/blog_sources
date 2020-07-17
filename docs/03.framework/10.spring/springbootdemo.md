---
title: SpringBoot快速上手demo
lang: zh-cn
createDate: 2020-7-10
updateDate: 2020-7-10
category: 框架
---

## SpringBoot快速上手demo

### SpringBoot简介

**是什么**

在介绍 SpringBoot 之前我们首先来简单介绍一下 Spring。Spring 是诞生于2002年的 Java 开发框架，可以说已经成为 Java 开发的事实标准。所谓事实标准就是虽然 Java 官方没有说它就是开发标准，但是在当前 Java 开发的众多项目中，当我们谈到产品级的 Java 项目的时候，大多都是基于 Spring 或者应用了 Spring 特性的。

Spring 基于 IOC 和 AOP 两个特性对 Java 开发本身进行了大大的简化。但是一个大型的项目需要集成很多其他组件，比如一个 WEB 项目，至少要集成 MVC 框架、Tomcat 这种 WEB 容器、日志框架、ORM框架，连接数据库要选择连接池吧……使用 Spring 的话每集成一个组件都要去先写它的配置文件，比较繁琐且容易出错。

然后就有了SpringBoot。

Spring Boot 是由 Pivotal 团队提供的全新框架，2014 年 4 月发布 Spring Boot 1.0 2018 年 3 月 Spring Boot 2.0发布。它是对spring的进一步封装，其设计目的是用来简化 Spring 应用的初始搭建以及开发过程。怎么简化的呢？就是通过封装、抽象、提供默认配置等方式让我们更容易使用。

SpringBoot 基于 Spring 开发。SpringBoot 本身并不提供 Spring 框架的核心特性以及扩展功能，也就是说，它并不是用来替代 Spring 的解决方案，而是和 Spring 框架紧密结合用于提升 Spring 开发者体验的工具。

关于 SpringBoot 有一句很出名的话就是**约定大于配置**。采用 Spring Boot 可以大大的简化开发模式，它集成了大量常用的第三方库配置，所有你想集成的常用框架，它都有对应的组件支持，例如 Redis、MongoDB、Jpa、kafka，Hakira 等等。SpringBoot 应用中这些第三方库几乎可以零配置地开箱即用，大部分的 SpringBoot 应用都只需要非常少量的配置代码，开发者能够更加专注于业务逻辑。

**为什么**

为什么会产生 SpringBoot 呢？

刚才说 SpringBoot 简化了基于 Spring 开发，这只是最直观的一方面，事实上 SpringBoot 的诞生有它所处的大时代背景这个原因在里面的，那就是微服务，这也是谈 SpringBoot 必谈微服务的原因。

2014年一个叫 Martin Fowler （同时也是经典著作《重构：改善既有代码的设计》一书的作者）发表了一篇关于[微服务的博客](https://martinfowler.com/articles/microservices.html)，比较形象生动地介绍了什么是微服务，然后微服务才慢慢被人所熟知。他说微服务其实是一种架构风格，我们在开发一个应用的时候这个应用应该是由一组小型服务组成，每个小型服务都运行在自己的进程内；小服务之间通过HTTP的方式进行互联互通。和微服务相对应的就是我们之前的，单体应用，就是大名鼎鼎的 all in one 的风格。这种风格把所有的东西都写在一个应用里面，比如我们熟悉的OA，CRM，ERP系统，所有的页面，所有的代码都放在一起，打成打成一个war包，然后把war包放在Tomcat容器中运行。

这种传统web开发的架构模式当然也有它的优势，比如它测试部署比较简单，因为不涉及到多个服务的互联互调，只需要把一个包上传到服务器就行了，可以说是一人吃饱全家不饿。同样也不会给运维带来麻烦，方便水平扩展，只需要又把相同的应用复制多份放在不同的服务器中就达到了扩展的目的。

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200717185012.png)

单体应用的的缺点也显而易见，容易牵一发而动全身，比如要更改一个小小的功能，就可能需要重新部署整个应用。当然，更大的挑战就是日益增长的用户需求。

**怎么用**

介绍了一大堆，那 SpringBoot 的开箱即用是怎么体现的呢。

SpringBoot 官方推荐的构建应用的方式是使用 [Spring Initializr](https://start.spring.io/)，直接在网页上选择好构建工具、语言、SpringBoot 版本，填好自己的项目名和初始依赖，然后点**Generate** 按钮，就能下载一个构建好的工程的zip包，只需要把这个包解压之后导入IDE就可以了。

这已经是一个包含依赖的、完整的、可独立运行的springboot应用了！你所需要做的就是往里面填充自己的业务代码！

当然，如果能直接使用IDE来进行上述操作可以让这个过程变得更顺滑。如果你使用的是 IDEA 商业版的话，新建工程的时候直接有 Spring 的选项；如果是IDEA社区版的话，可以安装 `Spring Assistant` 这个插件可以实现同样的功能。它们的原理是帮你把连接 [Spring Initializr](https://start.spring.io/) 并下载解压这个过程自动化了，所以只需要保持网络畅通就行了。

|                  SpringBoot                   | Spring + Spring MVC                                          |
| :-------------------------------------------: | :----------------------------------------------------------- |
| [Spring Initializr](https://start.spring.io/) | 1. 安装Tomcat <br />2. 引入spring必要依赖 spring-webmvc spring-context spring-beans spring-aspects ...<br />3. 引入必要的第三方依赖，jdbc,test,log这些依赖依然要注意版本兼容问题 <br />4. 新建webapp/WEB-INFO/web.xml <br />5. applicationContext.xml <br />6. Springmvc.xml ... |

那如果要用原生的springMVC来实现这个事情就复杂了，可以看看右边我大概罗列的这些步骤，当时学的时候让我我非常头疼。要单独安装Tomcat，安装的过程中要注意版本和当前的spring版本是否兼容，手动引入spring各个模块的依赖。pom.xml就不说了，maven工程都要用到，然后还有web.xml-用来配置servlet、拦截规则、字符编码器等等，applicationContext.xml，springmvc.xml 等一大堆xml文件……

这个过程对初学者非常不友好，记忆这些步骤和配置文件能让人崩溃，xml这种表达方式又不是很直观。这些东西称为脚手架，在小公司里面会搭建这些东西就可以算半个师傅了，小弟们就可以在搭好的架子里面写业务代码了。

再聊回微服务，试想一下，如果我们要跟上时代的步伐，使用微服务去开发软件，每个功能模块都部署成一个单独的服务，这个时候我们再使用纯粹的 Spring 去开发，每开发一个服务都需要重复的搭建项目骨架，然后编写各种配置文件，几十几百个服务加起来，这部分工作量是很大的，这还不算业务代码的开发时间。这种时候就是 SpringBoot 发挥它开箱即用的特质的时候了。然后多个微服务之间再通过 Spring 全家桶里面的 SpringCloud 进行管理，比如服务注册、服务发现等等。所以我们现在说 SpringBoot 是 Java 企业级开发的一站式解决方案。

软件工程是一个不断抽象，不断把复杂的东西简化的这样一套理论和工具，不是是说使用起来越复杂就可以彰显我的高端和牛逼，有时候反而是做多错多。所以SpringBoot告诉我们这些工作都没必要，框架来做就行了，你们可以专注于代码逻辑。

**小结**

SpringBoot 具有如下优点：

- 快速创建独立运行的Spring项目以及与主流框架集成、
- 使用嵌入式的Servlet容器，应用无需打成WAR包
- Starters自动依赖与版本控制
- 大量的自动配置，简化开发，也可修改默认值
- 无需配置XML，无代码生成，开箱即用
- 准生产环境的运行时应用监控
- 与云计算的天然集成

### SpringBoot的demo

idea新建一个maven工程

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springbootdemo.png)

### 模块化

新增三个模块

qs-api、qs-pub、qs-service

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springboot01.png)

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springbootdemo2.png)

**注意**：在idea中，右侧红框中，是否有灰色的模块，这样的模块，需要重新在右侧mvn导入。否则在模块间依赖的时候会出现无法导入的问题

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springboot03.png)

### 依赖导入

* 导入springboot默认配置和启动器
* 导入lombok简化bean

~~~xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.0.RELEASE</version>
    </parent>
	<properties>
        <lombok.version>1.16.20</lombok.version>
    </properties>
    <dependencies>
        <!-- springBoot 的启动器 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- lombok插件-->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
~~~



![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springbootdemo04.png)

### Demo编写

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springboot05.png)

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springboot06.png)

### 打包测试

1. 添加mvn配置

   ~~~xml
   <build>
           <plugins>
               <plugin>
                   <groupId>org.apache.maven.plugins</groupId>
                   <artifactId>maven-compiler-plugin</artifactId>
                   <configuration>
                       <source>1.8</source>
                       <target>1.8</target>
                   </configuration>
               </plugin>
               <plugin>
                   <groupId>org.springframework.boot</groupId>
                   <artifactId>spring-boot-maven-plugin</artifactId>
                   <executions>
                       <execution>
                           <goals>
                               <goal>repackage</goal>
                           </goals>
                       </execution>
                   </executions>
               </plugin>
           </plugins>
       </build>
   ~~~

   

   在springboot启动的模块，pom新增打包配置

   ![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springboot07.png)

2. 右侧mvn，package打包成jar，启动测试