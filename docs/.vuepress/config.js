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
          {
            text: '待添加',
            link: 'https://github.com/ching7'
          }
        ]
      }        
    ],
	  sidebar:{
        '/dev/': [ 
          'one',
          'two',  
        ],
        '/front/': [
          'one',  
          'two',  
        ]
    }
  },
};
