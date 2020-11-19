---
title: Blogging Menu
lang: zh-cn
---
# 目录

##  正在学习
* ~~尚硅谷谷粒商城：后台 [gitee](https://gitee.com/ching7777/guliproject) [github](https://github.com/ching7/guliproject/tree/master) 前台 [gitee](https://gitee.com/ching7777/renren-fast-vue) [github](https://github.com/ching7/renren-fast-vue)~~，~~前端部分不适用，暂停~~
* vue基础知识 [gitee](https://gitee.com/ching7777/vueStudy) [github](https://github.com/ching7/vueStudy)
* ~~spring框架整合中间件demo，微服务基础demo   [github](https://github.com/ching7/springStudy)，部分组件进入维护阶段，替换成最新的~~
* java基础知识点学习记录   [gitee](https://gitee.com/ching7777/javaBaseStudy) [github](https://github.com/ching7/javaBaseStudy)

## 工具类

* [将一份ppt及ppt备注转成带语音的视频文件](https://github.com/ching7/ppt2video)
* [基于vue和WEBRTC的图片采集处理demo](https://github.com/ching7/imageCaptureDemo/blob/master/imageCapture.html)
* [java实现动态图像验证码登陆](https://github.com/ching7/javaBaseStudy/tree/master/java-validCode)


## 全部文章

<template>
    <ol class='main-ol'>
        <li class='main-li'  v-for="(item, index) in list" :key="index" @click="go(item)">
            <span class="dir">{{ nav[item.path.substring((item.path.lastIndexOf('.html')),-1)] }} /</span> <!--匹配当前文章所属栏目-->
            <span class="tit">{{ item.title }}</span>
            <span class="date" v-bind:class="{'main-li-redfont': index===0 || index===1 }">{{ index===0 || index===1 ? item.frontmatter.updateDate + " " + latestMsg : item.frontmatter.updateDate }}</span>
        </li>
    </ol>
</template>

<script>
export default {
  // TODO 分页、分类页展示、最近在学
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
      //超链接
        location.href = this.$site.base + item.path.substring(1)
    }
  },
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