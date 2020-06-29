---
title: DDD(Domain-Drive-Design)领域驱动设计
lang: zh-cn
createDate: 2020-6-29
updateDate: 2020-6-29
category: framework
---

# 领域驱动设计（Domain-Drive-Design） 

领域驱动设计(简称 ddd)概念来源于2004年著名建模专家eric evans发表的他最具影响力的书籍:《domain-driven design –tackling complexity in the heart of software》(中文译名：领域驱动设计—软件核心复杂性应对之道)一书。，书中提出了“领域驱动设计(简称 ddd)”的概念。

 领域驱动设计一般分为两个阶段：

1. 以一种领域专家、设计人员、开发人员都能理解的“通用语言”作为相互交流的工具，在不断交流的过程中发现和挖出一些主要的领域概念，然后将这些概念设计成一个领域模型；
2. 由领域模型驱动软件设计，用代码来表现该领域模型。领域需求的最初细节，在功能层面通过领域专家的讨论得出。

领域驱动设计告诉我们，在通过软件实现一个业务系统时，建立一个领域模型是非常重要和必要的。

实际上 DDD 的概念和逻辑本身并不复杂，很多概念和名词是为了解决一些特定的问题才引入的，并和面向对象思想兼容，可以说 DDD 也是面向对象思想中的一个子集。如果遵从奥卡姆剃刀的原则，“如无必要，勿增实体”，我们先把 DDD 这些概念丢开，从一个案例出发，在必要的时候将这些概念引入。

> 参考：[使用 DDD 指导业务设计的一点思考](https://zhuanlan.zhihu.com/p/98420317)
