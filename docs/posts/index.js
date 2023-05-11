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
    {
      title: 'Nodejs',
      collapsable: true,
      children: [
        'node/',
        'node/npm.md'
      ]
    },
    {
      title: 'vuepress',
      collapsable: true,
      children: [
        'vuepress/plugin/plugin-dev.md',
        'vuepress/nginx/',
      ]
    },
    {
      title: 'JAVA',
      collapsable: true,
      children: [
        'java/',
        'java/javafx/'
      ]
    },
    {
      title: 'Gradle',
      collapsable: true,
      children: [
        'gradle/',
        'gradle/push-to-maven.md'
      ]
    },
    {
      title: 'Vue',
      collapsable: true,
      children: [
        'vue/'
      ]
    },
    {
      title: '随笔',
      collapsable: true,
      children: [
        'others/',
        'others/001.md',
        'others/002.md',
        'others/003.md',
        'others/004.md',
        'others/005.md',
        'others/006.md',
        'others/007.md',
        'others/008.md',
        'others/009.md',
        'others/010.md',
        'others/011.md',
        'others/012.md',
        'others/013.md',
        'others/014.md',
      ]
    }
  ]
}
