const introduceGenSidebarConfig = require('../introduce');

module.exports = {
    title: 'Mrcode 笔记本',
    description: '放弃 GitBook 而使用 vuepress 构建 Markdown 笔记',
    theme: 'vue',
    themeConfig: {
        docsDir: 'docs',
        sidebar: 'auto',
        lastUpdated: 'Last Updated', // string | boolean
        nav: [
            {text: 'Home', link: '/'},
            {text: '项目介绍', link: '/introduce/'}
        ],
        sidebar: {
            '/introduce/': introduceGenSidebarConfig(),
            '/03_design_principles/':
                genSidebarConfig("设计模式")
        }
    }
}

function genSidebarConfig(title) {
    return [
        {
            title,
            collapsable: true,
            children: [
                '',
                'composition_aggeregation',
                'demeter',
                'dependency_inversion.md',
                'interface_segregation.md',
                'liskov_substitution.md',
                'open_close.md',
                'single_responsibility.md',
                '本章导航.md'
            ]
        }
    ]
}