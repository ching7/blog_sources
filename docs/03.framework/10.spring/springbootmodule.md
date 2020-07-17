---
title: SpringBoot多模块开发，聚合打包
lang: zh-cn
createDate: 2020-7-17
updateDate: 2020-7-17
category: 框架
---

## SpringBoot多模块开发，聚合打包

使用springboot进行微服务开发时，单个微服务内部，根据业务不同需要划分多个模块进行业务实现，就涉及到多模块管理和聚合

如下图所示是一个mall工程

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200717192205.png)

其中业务模块为

* admin
* ai
* manager
* nosql
* oss
* search

聚合模块为

* deploy
* impl
* parent

业务模块根据业务需求进行开发，重点关注聚合模块，最外层的pom进行公用依赖管理

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200717194156.png)

### parent模块-公用模块

parent模块主要用于所用模块公用的工具类，配置类等的实现

parent会被所有业务子模块依赖

### impl模块-工程聚合

impl模块没有代码实现，主要用于项目的依赖模块管理

impl依赖了所有的业务模块和parent模块，用于deploy做依赖打包

### deploy模块-启动、打包

deploy模块主要负责

* 项目的启动
* 项目配置管理
* 项目打包配置

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200717192615.png)

其中pom文件尤为关键

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200717192705.png)

pom只依赖了impl，打包时，会将所有业务模块根据配置，进行打包