module.exports = {
  title: 'chenyanan の blog',
  description: '学习最好的时间就是现在',
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    ['link', { rel: 'icon', href: '/icon/ico-pig.png' }], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  markdown: {
    lineNumbers: true, // 代码块显示行号
  },
  plugins: ['@vuepress/blog'] ,
  themeConfig: {
    // 博客配置
    sidebar: 'auto',//在所有页面中启用自动生成侧栏
    sidebarDepth: 2, // 将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: 'Last Updated', // 文档更新时间：每个文件git最后提交的时间
	nav:[
      { text: '我的工程', link: '/00.mydocslist/' }, 
      { text: '后端', link: '/01.dev/' }, // 内部链接 以docs为根目录
      { text: '前端', link: '/02.front/' }, 
      // 下拉列表
      {
        text: 'GitHub',
        items: [
          { text: 'GitHub地址', link: 'https://github.com/ching7' },// 外部链接
        ]
      }        
    ],
	sidebar:{
      '/01.dev/': [
        {
          title:'nginx基础入门',
          children:[
            '/01.dev/11.nginx/nginxstudy'
          ]
        },
        {
          title:'FastDFS安装和使用',
          children:[
            '/01.dev/10.fastdfs/fastdfsStudy'
          ]
        },
      ],
      '/02.front/': [
        {
          title:'玩转vuepress',
          children:[
            '/02.front/10.markdown/manual'
          ]
        }
      ]
    }
  },
};
