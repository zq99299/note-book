module.exports = () => {
  return [
    '',
    {
      title: 'linux',
      collapsable: true,
      children: [
        'linux/',
        'linux/git.md',
        'linux/yum.md',
        'linux/dist-manage.md'
      ]
    },
    'virtualbox/',
    'win10/',
    'docker/',
    {
      title: 'k8s',
      collapsable: true,
      children: [
        'k8s/',
        'k8s/kubernetes-basics.md',
        'k8s/configure-redis-using-configmap.md'
      ]
    },
    'npm/'
  ]
}
