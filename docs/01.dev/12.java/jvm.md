---
title: Java 虚拟机
lang: zh-cn
createDate: 2020-8-24
updateDate: 2020-8-24
category: java
---
# Java JVM虚拟机

Java虚拟机在执行Java程序的过程中会把它所管理的内存划分为若干个不同的数据区域。这些区域
有各自的用途，以及创建和销毁的时间，有的区域随着虚拟机进程的启动而一直存在，有些区域则是
依赖用户线程的启动和结束而建立和销毁。根据《Java虚拟机规范》的规定，Java虚拟机所管理的内存
将会包括以下几个运行时数据区域

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200824193709.png)