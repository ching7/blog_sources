---
title: swagger简单使用
lang: zh-cn
createDate: 2020-7-21
updateDate: 2020-7-21
category: 工具
---

## Swagger简单使用

Swagger 是一个规范和完整的框架，用于生成、描述、调用和可视化 RESTful 风格的 Web 服务。总体目标是使客户端和文件系统作为服务器以同样的速度来更新。文件的方法，参数和模型紧密集成到服务器端的代码，允许API来始终保持同步。Swagger 主要包含了以下三个部分：

* Swagger Editor：基于浏览器的编辑器，我们可以使用它编写我们 OpenAPI 规范。
* Swagger UI：它会将我们编写的 OpenAPI 规范呈现为交互式的 API 文档，后文我将使用浏览器来查看并且操作我们的 Rest API。
* Swagger Codegen：它可以通过为 OpenAPI（以前称为 Swagger）规范定义的任何 API 生成服务器存根和客户端 SDK 来简化构建过程。

其功能十分强大，Swagger 为我们提供了一套通过代码和注解自动生成文档的方法，这一点对于保证 API 文档的及时性将有很大的帮助。我们日常开发常用

* 生成API文档，
* 功能测试

### 导入依赖

~~~xml
        <!-- Swagger -->
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger2</artifactId>
            <version>2.2.2</version>
        </dependency>
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger-ui</artifactId>
            <version>2.2.2</version>
        </dependency>
~~~

### 添加配置类

~~~java
@Configuration
@EnableSwagger2
public class SwaggerConfig {
    /**
     * 创建API应用
     * apiInfo() 增加API相关信息
     * 通过select()函数返回一个ApiSelectorBuilder实例,用来控制哪些接口暴露给Swagger来展现，
     * 本例采用指定扫描的包路径来定义指定要建立API的目录。
     * 
     * @return
     */
    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.ll.farm.mall"))
                .paths(PathSelectors.any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("后端接口标题")
                .description("后端接口描述")
                .contact(
                        new Contact("farm-mall", "mall.farm-mall.com", "farm-mall@mall.com")
                )
                .version("1.0.0-SNAPSHOT")
                .build();
    }
}

~~~

如上代码所示，通过添加Swagger配置类，Spring框架扫描创建Bean之后，apiInfo()用来创建该Api的基本信息（这些基本信息会展现在文档页面中）。

### 测试接口

添加测试类

~~~java
@RequestMapping("/ums")
@RestController
@Slf4j
@Api(value = "用户菜单演示", tags = "用户菜单")
public class AdminMenusController {

    @Autowired
    AdminMenuService adminMenuService;

    @Autowired
    Hello hello;

    @RequestMapping(value = "/getMenus", method = RequestMethod.POST)
    @ApiOperation(notes = "需要id", value = "获取用户菜单")
    public AdminMenu getMenus(@ApiParam(required = true, value = "用户id") @RequestBody Integer userId) {
        hello.getHello();
        return adminMenuService.getAdminMenus();
    }
}

~~~

启动项目。访问http://127.0.0.1:8090/swagger-ui.html

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200721150358.png)

点击接口进行测试

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200721150535.png)

### swagger注解介绍

Swagger的注解大致来说可以分为两类，一类是用于Controller层，就是我们的接口；还有一类是用于Model的，也就是一些POJO类，比如用于接收参数的类呀、返回给前端的。

* 用于Controller层的注解

| 注解               | 作用范围     | 说明                                                      |
| :----------------- | :----------- | :-------------------------------------------------------- |
| @Api               | 类           | 用在类上，说明该类的作用                                  |
| @ApiOperation      | 方法         | 注解来给API增加方法说明                                   |
| @ApiImplicitParam  | 方法         | 用来注解来给方法入参增加说明                              |
| @ApiImplicitParams | 方法         | 用在方法上包含一组参数说明，用于包含多个@ApiImplicitParam |
| @ApiParam          | 方法的参数上 | 当方法的参数时一个类时，用此注解较                        |

* 用于Model的注解

| 注解              | 作用范围 | 说明                                                                               |
| :---------------- | :------- | :--------------------------------------------------------------------------------- |
| @ApiModel         | 类       | 描述一个Model的信息（一般用在请求参数无法使用@ApiImplicitParam注解进行描述的时候） |
| @ApiModelProperty | 成员变量 | 描述一个model的属性，对该成员变量进行说明                                          |

### 注意点

如果方法注解上不写请求方法的参数

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200721151443.png)

生成的文档中，会包含所有的请求类型，开发中建议加上，减少冗余

![](https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/20200721151531.png)

**参考：**

> [Swagger使用手册](https://www.jianshu.com/p/66a14ea07622)
>
> [Swagger使用教程](https://juzibiji.top/archives/14/)
>
> [在 Spring Boot 项目中使用 Swagger 文档](https://developer.ibm.com/zh/articles/j-using-swagger-in-a-spring-boot-project/)

