// 侧边栏目录构建配置
module.exports = () => {
    return [
        {
            title: "研磨设计模式（李兴华）",
            collapsable: false,
            children: [
                '',
                '02_how_to_learn/how_to_learn.md',
                '03_simple_factory/simple_factory.md',
                '04_facade/facade.md',
                '05_adapter/adapter.md',
                '06_singleton/singleton.md',
                '07_factory_method/factory_method.md',
                '08_abstract_factory/abstract_factory.md',
                '09_builder/builder.md',
                '10_prototype/prototype.md',
                '11_mediator/mediator.md',
                '12_proxy/proxy.md',
                '13_observer/observer.md'
            ]
        }
    ]
}