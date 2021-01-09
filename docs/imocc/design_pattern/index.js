// 侧边栏目录构建配置
module.exports = () => {
  return [
    '',
    '01/',
    {
      title: 'UML急速入门',
      collapsable: true,
      children: [
        '02_uml/',
        '02_uml/01.md'
      ]
    },
    {
      title: '设计原则',
      collapsable: true,
      children: [
        '03_design_principles/',
        '03_design_principles/open_close.md',
        '03_design_principles/dependency_inversion.md',
        '03_design_principles/single_responsibility.md',
        '03_design_principles/interface_segregation.md',
        '03_design_principles/demeter.md',
        '03_design_principles/liskov_substitution.md',
        '03_design_principles/composition_aggeregation.md'
      ]
    },
    {
      title: '设计模式',
      collapsable: true,
      children: [
        '04_simple_factory/simple_factory.md',
        '05_factory_method/factory_method.md',
        '06_abstract_factory/abstract_factory.md',
        '07_builder/builder.md',
        '08_singleton/singleton.md',
        '08_singleton/singleton2.md',
        '09_prototype/prototype.md',
        '10_facade/facade.md',
        '11_decorator/decorator.md',
        '12_adapter/adapter.md',
        '13_flyweight/flyweight.md'
      ]
    }
  ]
}
