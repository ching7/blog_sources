<template>
  <contribution :data="blogLog" :year="2020" :rectWidth="12" :rectHeight="12" :fontSize="10" :click="click" monthText="en" />
</template>
<script>
export default {
  data () {
    return {
      blogLog: {},
      // 测试数据
      data: {
        '2019-1-1': 6,
        '2019-1-2': 1,
        '2019-1-3': 2,
        '2019-2-2': 23,
        '2019-2-3': 13,
        '2019-2-4': 7,
        '2019-4-1': 6,
        '2019-4-2': 1,
        '2019-5-3': 2,
        '2019-6-2': 23,
        '2019-6-3': 13,
        '2019-6-4': 7,
        '2019-12-20': 3,
        '2019-12-21': 0,
        '2019-12-22': 9,
        '2019-12-23': 5
      }
    }
  },
  methods: {
    click (date) {
      console.log(date)
    },
    // 拉取md的updateDate和createDate
    init () {
      let blogLogs = []
      let Allpages = this.$site.pages
      Allpages.forEach(element => {
        if (element.frontmatter.updateDate) {
          blogLogs.push(element.frontmatter.updateDate)
        }
        if (element.frontmatter.createDate) {
          blogLogs.push(element.frontmatter.createDate)
        }
      });
      blogLogs.forEach(e => {
        let count = 0
        blogLogs.forEach(t => {
          if (e === t) {
            count++
          }
        })
        this.blogLog[e] = count
      })
      // console.log('vue-contribution', this.$site.pages)
      // console.log('vue-blogLogs', blogLogs)
      // console.log('vue-blogLog', this.blogLog)
    }
  },
  created () {
    this.init()
  }
}
</script>