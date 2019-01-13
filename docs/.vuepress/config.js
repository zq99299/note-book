const introduceGenSidebarConfig = require('../introduce');
const imoccDesignPatternGenSidebarConfig = require('../imocc/design_pattern');
const designPatternGenSidebarConfig = require('../design_pattern');
const mycatGenSidebarConfig = require('../mycat');
const vueGenSidebarConfig = require('../vue');
const mycat2GenSidebarConfig = require('../mycat2');
const gradleGenSidebarConfig = require('../gradle');
const gitGenSidebarConfig = require('../git');
const javaGenSidebarConfig = require('../java');
const xiemengyuanGenSidebarConfig = require('../xiemengyuan');
const elasticsearchGenSidebarConfig = require('../elasticsearch');

module.exports = {
    title: 'Mrcode 笔记本',
    description: '用来记录工作和学习过程中的笔记，汇总成册方便查阅，类容涵盖各类技术，如：java、git、elasticsearch、mycat、设计模式、gradle、vue - mrcode.cn',
    base: '/note-book/', // gh-page 中是增加了项目名
    dest: 'build/.vuepress/dist',  // 目录配置在外,纯粹是有代码洁癖和强迫症，并不能规避开发模式下同时构建不报错的问题
    ga: 'UA-125573163-1', // 添加 ga 统计
    locales: {
        // 键名是该语言所属的子路径
        // 作为特例，默认语言可以使用 '/' 作为其路径。
        '/': {
            lang: 'zh-CN', // 将会被设置为 <html> 的 lang 属性
        }
    },
    markdown: {
      lineNumbers: true
    },
    // theme: 'vue',
    themeConfig: {
        docsDir: 'docs',
        sidebar: 'auto',
        sidebarDepth: 2, // 嵌套标题侧边栏提取深度，最大为 2，会提取到 h3
        lastUpdated: '上次更新: ', // string | boolean
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
            {text: 'Home', link: '/'},
            {text: '项目介绍', link: '/introduce/'}/*,
            {text: '设计模式（慕课）', link: '/imocc/design_pattern/'},
            {text: '研磨设计模式（李兴华）', link: '/design_pattern/'},
            {text: 'MyCat', link: '/mycat/'},
            {text: 'Vue', link: '/vue/'},*/
        ],
        sidebar: {
            '/introduce/': introduceGenSidebarConfig(),
            '/imocc/design_pattern/': imoccDesignPatternGenSidebarConfig(),
            '/design_pattern/': designPatternGenSidebarConfig(),
            '/mycat/': mycatGenSidebarConfig(),
            '/vue/': vueGenSidebarConfig(),
            '/mycat2/': mycat2GenSidebarConfig(),
            '/gradle/': gradleGenSidebarConfig(),
            '/git/': gitGenSidebarConfig(),
            '/java/': javaGenSidebarConfig(),
            '/xiemengyuan/': xiemengyuanGenSidebarConfig(),
            '/elasticsearch/': elasticsearchGenSidebarConfig()
        }
    },
    plugins: [
        ['@vuepress/back-to-top', true],
        ['@vuepress/pwa', {
            serviceWorker: true,
            updatePopup: {
                message: "有新内容更新啦~",
                buttonText: "立即获取新内容"
            }
        }],
        ['@vuepress/medium-zoom', true]
    ]
}
