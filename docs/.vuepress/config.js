module.exports = {
  title: 'Attic.cyn',
  description: 'Now Just Study',
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    ['link', { rel: 'icon', href: '/icon/ico-pig.png' }], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  markdown: {
    lineNumbers: true, // 代码块显示行号
  },
  // 推送到不同的平台需要修改
  // base: '/master/', //github ching7.github.io 分支名
  base: '/blog-web/', //gitee  分支名
  // plugins: ['@vuepress/blog'],
  themeConfig: {
    // 博客配置
    sidebar: 'auto',//在所有页面中启用自动生成侧栏
    sidebarDepth: 2, // 将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: 'Last Updated', // 文档更新时间：每个文件git最后提交的时间
    nav: [
      { text: '最近的', link: '/00.mydocslist/' },
      { text: '后端', link: '/01.dev/' }, // 内部链接 以docs为根目录
      { text: '前端', link: '/02.front/' },
      // 下拉列表
      {
        text: 'Git',
        items: [
          { text: 'GitHub地址', link: 'https://github.com/ching7' },// 外部链接
          { text: 'Gitee地址', link: 'https://gitee.com/ching7777' },// 外部链接
        ]
      }
    ],
    sidebar: {
      '/01.dev/': [
        {
          title: '服务端',
          children: [
            '/01.dev/11.nginx/nginxstudy',
            '/01.dev/10.fastdfs/fastdfsStudy'
          ]
        },
      ],
      '/02.front/': [
        {
          title: '前端',
          children: [
            '/02.front/10.markdown/manual'
          ]
        }
      ]
    }
  },
};
