---
title: SpringBoot快速上手demo
lang: zh-cn
createDate: 2020-7-10
updateDate: 2020-7-10
category: 框架
---

## SpringBoot快速上手demo

### 新建mvn工程

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

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springbootdemo04.png)

### Demo编写

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springboot05.png)

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springboot06.png)

### 打包测试

1. 添加mvn配置

   在springboot启动的模块，pom新增打包配置

   ![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/springboot07.png)

2. 右侧mvn，package打包成jar，启动测试