module.exports = () => {
  return [
    '',
    {
      title: 'linux',
      collapsable: false,
      children: [
        'linux/',
        'linux/git.md',
        'linux/yum.md',
        'linux/dist-manage.md'
      ]
    },
    'virtualbox/',
    {
      title: 'Spring Cloud',
      collapsable: false,
      children: [
        'spring-cloud/hystrix/',
        'spring-cloud/config/',
        'spring-cloud/config/001.md',
        'spring-cloud/config/002.md'
      ]
    }
  ]
}
