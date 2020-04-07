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
    return 'delete'
  }
  return undefined
}

export const diff = warp(() => [...new Set([...Object.keys(fs), ...Object.keys(fs)])]
  .map(file => [file, diffFile(file)])
  .filter(([_, status]) => status))

const describeDiff = () => {
  const change = diff()
  return change
    .map(([file, status]) => `${status}: ${file}`)
    .join('\n')
}

export const serializeDiff = warp(() => {
  const change = diff()
  return change
    .map(([file, status]) => {
      if (status === 'delete') {
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

Submit from submit.vtbs.moe`
})
