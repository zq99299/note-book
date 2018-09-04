const introduceGenSidebarConfig = require('../introduce');
const imoccDesignPatternGenSidebarConfig = require('../imocc/design_pattern');

module.exports = {
    title: 'Mrcode 笔记本',
    description: '放弃 GitBook 而使用 vuepress 构建 Markdown 笔记',
    base: '/note-book/', // gh-page 中是增加了项目名
    dest: 'build/.vuepress/dist',  // 目录配置在外,纯粹是有代码洁癖和强迫症，并不能规避开发模式下同时构建不报错的问题
    // theme: 'vue',
    themeConfig: {
        docsDir: 'docs',
        sidebar: 'auto',
        lastUpdated: '上次更新: ', // string | boolean
        serviceWorker: {
            updatePopup: true // Boolean | Object, 默认值是 undefined.
            // 如果设置为 true, 默认的文本配置将是:
            // updatePopup: {
            //    message: "New content is available.",
            //    buttonText: "Refresh"
            // }
        },
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
        nav: [
            {text: 'Home', link: '/'},
            {text: '项目介绍', link: '/introduce/'},
            {text: '设计模式（慕课）', link: '/imocc/design_pattern/'}
        ],
        sidebar: {
            '/introduce/': introduceGenSidebarConfig(),
            '/imocc/design_pattern/': imoccDesignPatternGenSidebarConfig()
        }
    }
}