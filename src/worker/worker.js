import { warp } from './warp'

let fs
let newFs

const fetchJson = async url => (await fetch(url)).json()

export const loadFs = warp(async () => {
  fs = await fetchJson('https://vdb.vtbs.moe/json/fs.json')
  if (!newFs) {
    newFs = JSON.parse(JSON.stringify(fs))
  }
})

export const getFs = warp(() => newFs)

export const getList = warp(() => Object.keys(newFs))

export const getVtbJson = warp(name => newFs[name])

export const deleteVtb = warp(file => {
  delete newFs[file]
})

const diffFile = file => {
  if (!newFs[file]) {
    return 'remove'
  }
  if (!fs[file]) {
    return 'add'
  }
  if (JSON.stringify(fs[file]) !== JSON.stringify(newFs[file])) {
    return 'update'
  }
  return undefined
}

export const diff = warp(() => [...new Set([...Object.keys(fs), ...Object.keys(newFs)])]
  .map(file => [file, diffFile(file)])
  .filter(([_, status]) => status))

const describeDiff = () => {
  const change = diff()
  return change
    .map(([file, status]) => `${status}: ${file}`)
    .sort()
    .join('\n')
}

export const serializeDiff = warp(() => {
  const change = diff()
  return change
    .map(([file, status]) => {
      if (status === 'remove') {
        return ['delete', file]
      }
    })
    .filter(Boolean)
})

const encodeDiff = () => {
  const command = serializeDiff()
  return btoa(command
    .map(([cmd, file]) => [cmd, btoa(file)])
    .map(cmds => cmds.join(':'))
    .join('\n'))
}

export const makeIssue = warp(input => {
  const command = encodeDiff()
  const description = describeDiff()

  return `${input}

### description

${description}

\`\`\`
-----BEGIN SUBMIT BLOCK-----${command}-----END SUBMIT BLOCK-----
\`\`\`

Submit from submit.vtbs.moe, please evaluate the automatic Pull Request`
})

export const submitDiff = warp(async input => {
  const body = makeIssue(input)

  const response = await fetch('https://api.github.com/repos/dd-center/vdb/issues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ZGQtY2VudGVyLWJvdDpkZDBiMmY0MjE4OThmNjAzZGYwNGM0NzdkMzQyNmU5MzE4MWRlZTUy'
    },
    body: JSON.stringify({ title: 'Change requested from submit.vtbs.moe', body })
  })
  const { html_url: url } = await response.json()
  return url
})
