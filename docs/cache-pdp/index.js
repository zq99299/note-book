module.exports = () => {
    let mds = [
        '',
        '001-introduce.md',
        '002.md',
        '003.md',
        '004.md',
        '005.md',
        '006.md',
        {
            title: "redis",
            collapsable: true,
            children: buildSc(7, 34, 'redis/')
        }
    ]
    mds = mds.concat(buildSc(35, 40, ''))
    mds = mds.concat(buildSc(44, 61, ''))
    mds.push({
        title: "讲给 Java 工程师的史上最通俗易懂 Storm 教程",
        collapsable: true,
        children: buildSc(62, 67, 'storm/')
    })
    mds = mds.concat(buildSc(68, 83, ''))
    mds.push({
        title: "hystrix",
        collapsable: true,
        children: buildSc(84, 109, 'hystrix/')
    })
    mds.push({
        title: "缓存雪崩",
        collapsable: true,
        children: buildSc(110, 116, '')
    })
    mds.push({
        title: "缓存穿透",
        collapsable: true,
        children: buildSc(117, 120, '')
    })
    mds = mds.concat(buildSc(121, 123, ''))

    // 第二版
    mds = mds.concat(buildSc(124, 126, ''))
    mds.push({
        title: "动态渲染系统",
        collapsable: true,
        children: buildSc(127, 185, 'dr/')
    })
	mds.push({
        title: "OneService 系统",
        collapsable: true,
        children: buildSc(186, 194, 'onservice/')
    })
	mds.push('195.md')
    return mds
}

function buildSc(start, end, parentDir) {
    let mds = []
    for (let i = start; i <= end; i++) {
        if (i < 10) {
            mds.push(`${parentDir}00${i}.md`)
        } else if (i < 100) {
            mds.push(`${parentDir}0${i}.md`)
        } else {
            mds.push(`${parentDir}${i}.md`)
        }
    }
    return mds
}
