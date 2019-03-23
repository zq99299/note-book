module.exports = () => {
    return [
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
        },
    ]
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
