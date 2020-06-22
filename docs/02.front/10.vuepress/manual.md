---
title: 如何使用vuepress玩转blog
lang: zh-cn
createDate: 2020-3-19 
updateDate: 2020-6-22 
---
# 如何使用vuepress玩转blog

环境：`node.js`  编码工具：`vscode`  [vuepress官网](https://vuepress.vuejs.org/)

## 1 搭建环境

### 1.1 全局安装Vuepress

~~~cmake
yarn global add vuepress # 或者：npm install -g vuepress
~~~

### 1.2 项目初始化

* 新建blog项目文件夹（注意该目录为blog项目的主文件夹）

  可以使用命令新建文件夹，也可以手工创建

  ~~~cmake
  mkdir project
  ~~~

* 进入到`project`文件夹中，使用命令行初始化项目:

  ```cmake
  yarn init -y # 或者 npm init -y
  ```

* 将会创建一个`package.json`文件，长这样子：

```json
{
  "name": "project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

* 在`project`根目录下新建`docs`文件夹

~~~cmake
mkdir docs
# 这个会作为项目文档的根目录来使用
~~~

* 在`docs`文件夹创建`.vuepress`文件夹

~~~cmake
mkdir .vuepress
# 所有vuepress的菜单配置文件、自动生成文件、静态资源都在本目录下
~~~

* 在`.vuepress`下面创建`config.js`文件

~~~cmake
touch config.js
# config.js是VuePress必要的配置文件，它导出一个javascript对象。
~~~

先简单配置`config.js`

~~~cmake
module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around'
}
~~~

* 在`.vuepress`下面创建`public`文件夹

~~~cmake
mkdir public
# 这个文件夹是用来放置静态资源的，打包出来之后会放在.vuepress/dist/的根目录。
~~~

* 创建首页

在`docs`文件夹下面创建`README.MD`文件，用来生成首页：

默认的主题提供了一个首页，像下面一样设置`home:true`即可，可以把下面的设置放入`README.md`中，待会儿你将会看到跟`VuePress`一样的主页

~~~properties
---
home: true
heroImage: /image/logo.jpg
actionText: 快速上手 →
actionLink: /zh/guide/
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
footer: MIT Licensed | Copyright © 2018-present Evan You
---
~~~

需要在`docs/.vuepress/public`下放一张静态图片作为首页logo

## 2 启动项目

### 2.1 项目结构解析

~~~yaml
project
├─── docs
│   ├── README.md
│   └── .vuepress
│       ├── public
│       └── config.js
└── package.json
~~~

在`package.json`里添加两个启动命令

~~~json
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}
~~~

### 2.2 启动vuepress

~~~cmake
# 构建：build生成静态的HTML文件,默认会在 .vuepress/dist 文件夹下
yarn docs:build # 或者：npm run docs:build

# 启动：默认是 localhost:8080 端口
yarn docs:dev # 或者：npm run docs:dev
~~~

## 3 配置vuepress

`config.js`配置

### 3.1 基本的项目配置

~~~js
module.exports = {
  title: 'chenyanan の blog',
  description: '学习最好的时间就是现在',
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    ['link', { rel: 'icon', href: '/ico-pig.png' }], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  //base: '/vuepress-blog/', // 这是部署到github相关的配置 下面会讲
  markdown: {
    lineNumbers: true // 代码块显示行号
  },
  themeConfig: {
    sidebarDepth: 2, // e'b将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: 'Last Updated', // 文档更新时间：每个文件git最后提交的时间
 }
}
~~~

### 3.2 导航栏配置

<img :src="$withBase('/image/bar-example.jpg')" alt='导航栏配置'>

~~~js
themeConfig: {
	  nav:[
      { text: '后端', link: '/dev/' }, // 内部链接 以docs为根目录
      { text: '前端', link: '/front/' }, 
      { text: '微服务', link: '/videoDemo.html' }, 
      { text: '架构', link: '#' }, 
      { text: '读书', link: '#' }, 
      { text: '音乐', link: '#' }, 
      // 下拉列表
      {
        text: 'GitHub',
        items: [
          { text: 'GitHub地址', link: 'https://github.com/ching7' },// 外部链接
        ]
      }        
    ]
  }
~~~

### 3.3 侧边栏配置

<img :src="$withBase('/image/bar-example2.jpg')" alt='侧边栏配置'>


~~~js
module.exports = {
  themeConfig: {
      sidebar:{
        // docs文件夹下面的dev文件夹 文档中md文件 书写的位置(命名随意)
        '/dev/': [
            '/dev/', // dev文件夹的README.md 不是下拉框形式
            {
              title: '侧边栏下拉框的标题1',
              children: [
                '/dev/java/test', // 以docs为根目录来查找文件 
                // 上面地址查找的是：docs>dev>test.md 文件
                // 自动加.md 每个子选项的标题 是该md文件中的第一个h1/h2/h3标题
              ]
            }
          ],
          // docs文件夹下面的front文件夹 这是第二组侧边栏 跟第一组侧边栏没关系
          '/front/': [
            '/front/', 
            {
              title: '第二组侧边栏下拉框的标题1',
              children: [
                '/front/js/test' 
              ]
            }
          ]
      }
  }
}

~~~

## 4 发布vuepress到github

### 4.1 配置`config.js`

在`docs/.vuepress/config.js`设置正确的base

如果你打算发布到 `https://<USERNAME>.github.io/`，则可以省略这一步，因为 base 默认即是 `"/"`。

如果你打算发布到 `https://<USERNAME>.github.io/<REPO>/`（也就是说你的仓库在 `https://github.com/<USERNAME>/<REPO>`），则将 base 设置为 `"/<REPO>/"`。

```
module.exports = {
  base: '/test/', // 比如你的仓库是test
}
```

### 4.2 创建脚本文件

在`project`的根目录下创建`delpoy.sh`脚本

```cmake
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io  USERNAME=你的用户名 
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>  REPO=github上的项目
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```

### 4.3 调整`package.json`

~~~json
{
	"scripts": {
    	"dev": "vuepress dev docs", // 本地运行项目 npm run dev
    	"build": "vuepress build docs", // 构建项目 nom run build
    	"d": "bash deploy.sh" // 部署项目 npm run d
    }
}
~~~

### 4.4 部署vuepress到github

然后你每次可以运行下面的命令行，来把最新更改推到`github`上：

```
    npm run d
```

> 参考资料:
>
> [VuePress 手摸手教你搭建一个类Vue文档风格的技术文档/博客](https://segmentfault.com/a/1190000016333850)
>
> [VuePress + GitHub Pages 搭建个人博客](https://www.jianshu.com/p/6e8c608f24c8)
>
> [利用 GitHub Pages 快速搭建个人博客](https://www.jianshu.com/p/e68fba58f75c)