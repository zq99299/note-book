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
    mds = mds.concat(buildSc(68, 100, ''))
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
