---
title: Spring基础知识
lang: zh-cn
createDate: 2020-11-1
updateDate: 2020-11-1
category: spring
---

## Spring基础知识点

### BeanFactory  ApplicationContext 的区别

接口 BeanFactory 和 ApplicationContext 都是用来从容器中获取 Spring beans 的，但是，他们二者有很大不同

什么是 Spring Bean这是一个非常简单而又很复杂的问题，通常来说，Spring beans 就是被 Spring 容器所管理的 Java 对象，来看一个简单的例子

```java
public class HelloWorld { 
   private String message;  
   public void setMessage(String message){ 
      this.message  = message; 
   }  
   public void getMessage(){ 
      System.out.println("My Message : " + message); 
   } 
}
```

在基于 XML 的配置中， beans.xml 为 Spring 容器管理 bean 提供元数据

### 什么是 Spring 容器

Spring 容器负责实例化，配置和装配 Spring beans，下面来看如何为 IoC 容器配置我们的 HelloWorld POJO

```xml
<?xml version = "1.0" encoding = "UTF-8"?>
<beans xmlns = "http://www.springframework.org/schema/beans"
   xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation = "http://www.springframework.org/schema/beans
   http://www.springframework.org/schema/beans/spring-beans-3.0.xsd">
   <bean id = "helloWorld" class = "com.cyn.HelloWorld">
      <property name = "message" value = "Hello World!"/>
   </bean>
</beans>
```

现在，它已经被 Spring 容器管理了，接下来的问题是：我们怎样获取它？

### BeanFactory 和 ApplicationContext 的不同点

#### BeanFactory 接口

这是一个用来访问 Spring 容器的 root 接口，要访问 Spring 容器，我们将使用 Spring 依赖注入功能，使用 BeanFactory 接口和它的子接口**特性：**

- Bean 的实例化/串联

通常情况，BeanFactory 的实现是使用懒加载的方式，这意味着 beans 只有在我们通过 getBean() 方法直接调用它们时才进行实例化实现 BeanFactory 最常用的 API 是 XMLBeanFactory这里是如何通过 BeanFactory 获取一个 bean 的例子：

```java
public class HelloWorldApp{ 
   public static void main(String[] args) { 
      XmlBeanFactory factory = new XmlBeanFactory (new ClassPathResource("beans.xml")); 
      HelloWorld obj = (HelloWorld) factory.getBean("helloWorld");    
      obj.getMessage();    
   }
}
```

### ApplicationContext 接口

ApplicationContext 是 Spring 应用程序中的中央接口，用于向应用程序提供配置信息它继承了 BeanFactory 接口，所以 ApplicationContext 包含 BeanFactory 的所有功能以及更多功能！它的主要功能是支持大型的业务应用的创建**特性：**

- Bean instantiation/wiring
- Bean 的实例化/串联
- 自动的 BeanPostProcessor 注册
- 自动的 BeanFactoryPostProcessor 注册
- 方便的 MessageSource 访问（i18n）
- ApplicationEvent 的发布

与 BeanFactory 懒加载的方式不同，它是预加载，所以，每一个 bean 都在 ApplicationContext 启动之后实例化这里是 ApplicationContext 的使用例子：

```java
public class HelloWorldApp{ 
   public static void main(String[] args) { 
      ApplicationContext context=new ClassPathXmlApplicationContext("beans.xml"); 
      HelloWorld obj = (HelloWorld) context.getBean("helloWorld");    
      obj.getMessage();    
   }
}
```

**参考：** https://mp.weixin.qq.com/s/YBQB086ADBjHUmwrFQrWew