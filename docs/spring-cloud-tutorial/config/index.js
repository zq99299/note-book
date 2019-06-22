module.exports = (path) => {
  let mds = [
    path + ''
  ]

  mds = mds.concat(buildSc(1, 9, path))

  return [
    {
      title: 'Spring Cloud Config',
      collapsable: false,
      children: mds
    }
  ];
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
