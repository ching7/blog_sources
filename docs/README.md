---
home: true
heroImage: /image/logo.jpg
footer: MIT Licensed | Copyright © 2020-chenyanan
---
<!-- ## 自定义组件 ✔
<index-main/> -->

<template>
    <ol class='main-ol'>
        <li class='main-li'  v-for="(item, index) in list" :key="index" @click="go(item)">
            <span class="dir">{{ nav[item.path.substring((item.path.lastIndexOf('.html')),-1)] }} /</span> <!--匹配当前文章所属栏目-->
            <span class="tit">{{ item.title }}</span>
            <span class="date">{{ item.frontmatter.updateDate }}</span>
        </li>
    </ol>
</template>

<script>
export default {
  // TODO 文章分类、分类页展示、最近在学
  computed: {
      list () {
          // debugger
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
  }
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
### :raised_hands:联系我
- **qq：**<775608698@qq.com>
- **wechat: ching_vip**
- **[github](https://github.com/ching7)**
- **[gitee](https://gitee.com/ching7777)**