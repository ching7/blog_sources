module.exports = {
  title: 'Attic.cyn',
  description: 'Now Just Study',
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    ['link', { rel: 'icon', href: '/icon/ico-build.png' }], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  markdown: {
    lineNumbers: true, // 代码块显示行号
  },
  // 推送到不同的平台需要修改
  // base: '', //github ching7.github.io
  base: '/blog-web/', //gitee  仓库名
  // plugins: ['@vuepress/blog'],
  themeConfig: {
    // 博客配置
    sidebar: 'auto',//在所有页面中启用自动生成侧栏
    sidebarDepth: 3, // 将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: 'Last Updated', // 文档更新时间：每个文件git最后提交的时间
    nav: [
      { text: '最近的', link: '/00.mydocslist/' },
      { text: 'JAVA知识库', link: '/04.javalibrary/' },
      {
        text: '后端',
        items: [
          { text: '基础', link: '/01.dev/' },
          { text: '框架', link: '/03.framework/' }
        ]
      }, // 内部链接 以docs为根目录
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
      // children移动至页面初始化
      '/01.dev/': [
        {
          title: '网络通信',
          children: [
            '/01.dev/11.network/cros',
            '/01.dev/11.network/nginx'
          ],
          basePath: '/01.dev/11.network'
        },
        {
          title: 'OSS存储',
          children: [
            '/01.dev/10.storage/fastdfs'
          ],
          basePath: '/01.dev/10.storage'
        },
        {
          title: 'JAVA基础',
          children: [
            '/01.dev/12.java/annotation',
            '/01.dev/12.java/java8newfeature',
            '/01.dev/12.java/reflect'
          ],
          basePath: '/01.dev/12.java'
        }],
      '/02.front/': [
        {
          title: '前端',
          children: [
            '/02.front/10.vuepress/manual'
          ],
          basePath: '/02.front/10.vuepress'
        }
      ],
      '/03.framework/': [
        {
          title: '框架思想',
          children: [
            '/03.framework/11.microservices/domaindrivedesign'
          ],
          basePath: '/03.framework/11.microservices'
        },
        {
          title: 'Spring框架',
          children: [
            '/03.framework/10.spring/annotation',
            '/03.framework/10.spring/aop',
            '/03.framework/10.spring/ioc',
            '/03.framework/10.spring/springbootdemo',
            '/03.framework/10.spring/springbootmodule'
          ],
          basePath: '/03.framework/10.spring'
        },
        {
          title: '日志框架',
          children: [
            '/03.framework/12.log/log4j2andslf4j'
          ],
          basePath: '/03.framework/12.log'
        },
        {
          title: '敏捷开发工具',
          children: [
            '/03.framework/13.utils/swaggerdemo'
          ],
          basePath: '/03.framework/12.utils'
        }
      ],
      '/04.javalibrary/': [
        {
          title: 'JavaLibrary',
          children: [
            '/04.javalibrary/'
          ],
          basePath: '/04.javalibrary'
        }
      ]
    }
  }
};
