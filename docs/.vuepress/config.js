const introduceGenSidebarConfig = require('../introduce')
const imoccDesignPatternGenSidebarConfig = require('../imocc/design_pattern')
const designPatternGenSidebarConfig = require('../design_pattern')
const mycatGenSidebarConfig = require('../mycat')
const mycat2GenSidebarConfig = require('../mycat2')
const gitGenSidebarConfig = require('../git')
const xiemengyuanGenSidebarConfig = require('../xiemengyuan')
const elasticsearchCoreSC = require('../elasticsearch-core')
const elasticsearchSeniorSC = require('../elasticsearch-senior')
const cachePdpSc = require('../cache-pdp')
const postsSc = require('../posts')
const springCloudTutorialSc = require('../spring-cloud-tutorial')
const cssZxxSc = require('../css-zxx')
const gitScmSc = require('../git-scm')
const backEndStorageSc = require('../back-end-storage')
const middlegroundSc = require('../middle-office')
const oath2Sc = require('../oath2')
const regularSc = require('../regular')

module.exports = {
  title: 'MRCODE-BOOK',
  description: '用来记录工作和学习过程中的笔记，汇总成册方便查阅，类容涵盖各类技术，如：Java、Git、ElasticSearch、MyCat、设计模式、Gradle、Vue - mrcode.cn',
  base: '/note-book/', // gh-page 中是增加了项目名
  dest: 'build/.vuepress/dist',  // 目录配置在外,纯粹是有代码洁癖和强迫症，并不能规避开发模式下同时构建不报错的问题
  host: 'localhost', // dev 的域名
  port: 8080,
  // locales: {
  //     // 键名是该语言所属的子路径
  //     // 作为特例，默认语言可以使用 '/' 作为其路径。
  //     // '/': {
  //     //     lang: 'zh-CN', // 将会被设置为 <html> 的 lang 属性
  //     // }
  // },
  head:[
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
  ],
  markdown: {
    lineNumbers: true
  },
  // theme: 'vue',
  themeConfig: {
    docsDir: 'docs',
    sidebar: 'auto',
    sidebarDepth: 3, // 嵌套标题侧边栏提取深度，最大为 2，会提取到 h3
    lastUpdated: '上次更新', // string | boolean
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'https://github.com/zq99299/note-book',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: 'GitHub',
    // 以下为可选的编辑链接选项
    // 假如你的文档仓库和项目本身不在一个仓库：
    // docsRepo: 'vuejs/vuepress',
    // 假如文档不是放在仓库的根目录下：
    docsDir: 'docs',
    // 假如文档放在一个特定的分支下：
    docsBranch: 'master',
    // 默认是 false, 设置为 true 来启用
    editLinks: true,
    // 默认为 "Edit this page"
    editLinkText: '帮助我们改善此页面！',
    logo: '/mlogo.svg',
    // 主题级别的配置
    serviceWorker: {
      updatePopup: true // Boolean | Object, 默认值是 undefined.
      // 如果设置为 true, 默认的文本配置将是:
      // updatePopup: {
      //    message: "New content is available.",
      //    buttonText: "Refresh"
      // }
    },
    nav: [
      { text: '博客（零散文章）', link: '/posts/' },
      {
        text: '设计模式', items: [
          { text: '设计模式（慕课）', link: '/imocc/design_pattern/' },
          { text: '研磨设计模式（李兴华）', link: '/design_pattern/' }
        ]
      },
      {
        text: 'Elasticsearch', items: [
          { text: '核心知识篇', link: '/elasticsearch-core/' },
          { text: '高级知识篇', link: '/elasticsearch-senior/' }
        ]
      },
      {
        text: '缓存架构-亿级流量电商详情页系统实战',
        ariaLabel: '缓存架构-亿级流量电商详情页系统实战',
        items: [
          {
            text: '综合性导航',
            items: [
              { text: '全目录导航', link: '/cache-pdp/' },
              { text: '第一版（001 ~ 123 章）', link: '/cache-pdp/001-introduce.md' },
              { text: '第二版（124 ~ 195 章）', link: '/cache-pdp/124.md' },
              { text: '课程总结（难题与解决方案）', link: '/cache-pdp/121.md' }
            ]
          },
          {
            text: '精彩知识精选',
            items: [
              { text: 'Redis 篇（redis 企业级集群架构）', link: '/cache-pdp/redis/007.md' },
              { text: '多级缓存架构设计', link: '/cache-pdp/035.md' },
              { text: '数据库 + 缓存双写一致性解决方案', link: '/cache-pdp/040.md' },
              { text: '缓存维度化拆分解决方案', link: '/cache-pdp/045.md' },
              { text: '缓存命中率提升解决方案', link: '/cache-pdp/051.md' },
              { text: '缓存并发重建冲突解决方案', link: '/cache-pdp/057.md' },
              { text: '缓存预热解决方案', link: '/cache-pdp/069.md' },
              { text: '热点缓存自动降级方案', link: '/cache-pdp/077.md' },
              { text: '缓存雪崩解决方案', link: '/cache-pdp/110.md' },
              { text: '缓存穿透解决方案', link: '/cache-pdp/117.md' },
              { text: '缓存失效解决方案', link: '/cache-pdp/119.md' },
              { text: '高可用分布式系统架构设计（hystrix 篇）', link: '/cache-pdp/hystrix/084.md' },
              { text: 'spring boot 整合 ehcache', link: '/cache-pdp/047.md' },
              { text: '史上最通俗易懂 Storm 教程', link: '/cache-pdp/storm/062.md' }
            ]
          }
        ]
      },
      {
        text: '更多', items: [
          { text: '本笔记介绍', link: '/introduce/' },
          { text: 'Linux 基础篇', link: 'https://zq99299.github.io/linux-tutorial/' },
          { text: 'Spring Cloud', link: '/spring-cloud-tutorial/' },
          { text: 'CSS 深入理解（张鑫旭）', link: '/css-zxx/' },
          { text: '正则入门', link: '/regular/' },
          {
            text: '思路拓展', items: [
              { text: '后端存储实战', link: '/back-end-storage/' },
              { text: '说透中台', link: '/middle-office/' },
              { text: 'Oath 2.0 实战', link: '/oath2/' },
            ]
          },
          {
            text: 'Git', items: [
              { text: 'Git 零散知识', link: '/git/' },
              { text: 'Git 系统学习笔记', link: '/git-scm/' },
            ]
          },
          {
            text: 'Mycat', items: [
              { text: 'Mycat 1', link: '/mycat/' },
              { text: 'Mycat 2', link: '/mycat2/' }
            ]
          },
          {
            text: '笔记精选汇总',
            items: [
              { text: 'GitHub 站', link: 'https://github.com/zq99299/repository-summary' },
              { text: '国内镜像站', link: 'http://book.mrcode.cn/' }
            ]
          },
          { text: '博客文章 /_posts/ 路径失效说明', link: '/posts-failure.md' },
        ]
      }
      /*
      {text: 'MyCat', link: '/mycat/'},
      {text: 'Vue', link: '/vue/'},*/
    ],
    sidebar: {
      '/introduce/': introduceGenSidebarConfig(),
      '/imocc/design_pattern/': imoccDesignPatternGenSidebarConfig(),
      '/design_pattern/': designPatternGenSidebarConfig(),
      '/mycat/': mycatGenSidebarConfig(),
      '/mycat2/': mycat2GenSidebarConfig(),
      '/git/': gitGenSidebarConfig(),
      '/xiemengyuan/': xiemengyuanGenSidebarConfig(),
      '/elasticsearch-senior/': elasticsearchSeniorSC(),
      '/elasticsearch-core/': elasticsearchCoreSC(),
      '/cache-pdp/': cachePdpSc(),
      '/posts/': postsSc(),
      '/spring-cloud-tutorial/': springCloudTutorialSc(),
      '/css-zxx/': cssZxxSc(),
      '/git-scm/': gitScmSc(),
      '/back-end-storage/': backEndStorageSc(),
      '/middle-office/': middlegroundSc(),
      '/oath2/': oath2Sc(),
      '/regular/': regularSc()
    }
  },
  plugins: [
    ['@vuepress/back-to-top', true],
    ['@vuepress/pwa', {
      serviceWorker: true,
      updatePopup: {
        message: '有新内容更新啦~',
        buttonText: '立即获取新内容，确定后稍后自动刷新'
      }
    }],
    ['@vuepress/medium-zoom', {
      selector: '.theme-default-content img'
    }],
    ['@vuepress/search', {
      searchMaxSuggestions: 10
    }],
    ['vuepress-plugin-code-copy', true],
    ['@vuepress/last-updated', {
      transformer: (timestamp, lang) => {
        // 不要忘了安装 moment
        const moment = require('moment')
        // moment.locale(lang)
        // return moment(timestamp).fromNow()
        return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }
    }],
    ['vuepress-plugin-baidu-tongji-analytics', {
      key: '63b757e8938717e95e7218e8e1341393'
    }],
    ['vuepress-plugin-tags'],
    ['vuepress-plugin-baidu-autopush', true]
  ]
}
