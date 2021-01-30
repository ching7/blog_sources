---
home: true
heroImage: /image/logo.jpg
footer: MIT Licensed | Copyright © 2020-chenyanan
---
### 🚩 阅读须知

这里记录的是一个程序员日常的学习记录，目的是把自己的学习记录下来，分享交流。

理想是形成一个Java基础以及进阶知识库。目前正在努力。

目前水平有限，文章中有任何问题，欢迎交流联系。[github issue](https://github.com/ching7/blog_sources/issues)

### 📖 Java Library

 [Java基础以及进阶知识库](/04.javalibrary/)

### 💡 开源项目

 [基于WebRtc实现浏览器图片采集功能](/05.openSource/10.scanBox/scanBoxReadme)

 [简单商城](/06.openSource/11.simplemall/simpleMallDemo)

### 🌟 近期更新

<template>
    <ol class='main-ol'>
        <li class='main-li'  v-for="(item, index) in list" :key="index" @click="go(item)">
            <span class="dir">{{ nav[item.path.substring((item.path.lastIndexOf('.html')),-1)] }} /</span> <!--匹配当前文章所属栏目-->
            <span class="tit">{{ item.title }}</span>
            <span class="date" v-bind:class="{'main-li-redfont': index===0 || index===1 }">{{ index===0 || index===1 ? item.frontmatter.updateDate + " " + latestMsg : item.frontmatter.updateDate }}</span>
        </li>
    </ol>
</template>
<!-- 博客本年更新情况 -->
<vue-contribution/>

<script>
export default {
  // TODO 文章分类、分类页展示、最近在学
  data() {
    return {
      latestMsg:'NEW'
    }
  },
  computed: {
      list () {
          // let res2 = this.$site.pages
          let res = this.$site.pages
              .filter(item => item.regularPath.indexOf(".html") !== -1) //只显示内容页，不显示栏目首页
              .sort((a, b) => {
                  const av = a.frontmatter.updateDate ? new Date(a.frontmatter.updateDate).valueOf() : 0
                  const bv = b.frontmatter.updateDate ? new Date(b.frontmatter.updateDate).valueOf() : 0
                  return bv - av //模糊比较，倒序排列，此处未对非预期日期格式作兼容处理
              })
              .filter((item, index) => index < 15) //显示最新15条
              .map(item => {
                      item.dir = '/' + item.path.split('/')[1] + '/'
                      return item
                  })
          return res
      }
      ,
      //栏目数组
      nav() {
        const n = this.$site.themeConfig.sidebar
        let res = {}
        for(let key in n) {
          let value =  n[key]
          value.forEach(element => {
            let title = element.title
            let children = element.children
            children.forEach(element => {
              res[element]=title
            });
          });
        }
        return res
      }
  },
  methods: {
    go(item) {
      //首页超链接
        location.href = this.$site.base + item.path.substring(1)
    }
  },
  // 不进入首页直接访问菜单存在问题，config.js需要时静态文件，不能动态生成
  // created() {
  //   let pages = this.$site.pages.filter(item => item.regularPath.indexOf(".html") !== -1)
  //   //侧边栏生成
  //   let sidebar = this.$site.themeConfig.sidebar
  //   let newSidebar = {}
  //   for (let [key, value] of Object.entries(sidebar)) {
  //     // 每一栏目子菜单：01.dev/10.storage
  //     let newSidebarVal = []
  //     value.forEach(bar => {
  //       pages.forEach(element => {
  //         if (element.path.indexOf(bar.basePath) != -1) {
  //           // 为每个栏目子菜单添加
  //           bar.children.push(element.path.substring(0, element.path.length - 5))
  //         }
  //       });
  //       newSidebarVal.push(bar)
  //     });
  //     newSidebar[key] = newSidebarVal
  //   }
  //   this.$site.themeConfig.sidebar = newSidebar
  // },
}
</script>

<style>
.main-ol {
  line-height: 1.7;
  display: block;
  list-style-type: decimal;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 40px;
}
.main-li {
    color: rgb(170, 170, 170);
    cursor: pointer;
    list-style: none;
    padding: 0px 0.3rem 0.3rem 0.4rem;
}
.main-li-redfont {
    color:red;
}
.dir {
    color: rgb(0, 136, 0);
}
.tit {
    color: rgb(0, 136, 0);
}
.date {
    font-size: 0.8rem;
    line-height: 1.4;
    vertical-align: text-top;
}

</style>
### 💬 联系我
- **QQ：**<775608698@qq.com>
- **WeChat: ching_vip**
- **[Github](https://github.com/ching7)**
- **[Gitee](https://gitee.com/ching7777)**