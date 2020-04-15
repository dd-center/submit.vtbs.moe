import { warp } from './warp'

import vdbParse from '../vdb/parse'
import vdbTest from '../vdb/test'

let list
let fs
let newFs
let newFsLowerCaseFileMap
const newFsJsonSearchMap = new Map()

const encodeBase64 = string => Buffer.from(string).toString('base64')

const fetchJson = async url => (await fetch(url)).json()

const updateNewFsJsonSearchMap = (files = Object.keys(newFs)) => [files].flat()
  .forEach(file => {
    newFsJsonSearchMap.set(file, `${file}${JSON.stringify(newFs[file]).toLowerCase()}`)
  })

export const loadFs = warp(async () => {
  fs = await fetchJson('https://vdb.vtbs.moe/json/fs.json')
  if (!newFs) {
    newFs = JSON.parse(JSON.stringify(fs))
    newFsLowerCaseFileMap = Object.fromEntries(Object.keys(newFs)
      .map(file => [file.toLowerCase(), file]))
    updateNewFsJsonSearchMap()
  }
  list = await fetchJson('https://vdb.vtbs.moe/json/list.json')
})

export const getMeta = warp(() => list.meta)

export const getFs = warp(() => newFs)

export const getList = warp(() => Object.keys(newFs).reverse())

export const searchList = warp(keys => getList()
  .map(file => [file, newFsJsonSearchMap.get(file)])
  .filter(([_, content]) => keys.every(key => content.includes(key)))
  .map(([file]) => file))

export const getVtbJson = warp(name => newFs[name])

export const deleteVtb = warp(file => {
  delete newFs[file]
  delete newFsLowerCaseFileMap[file.toLowerCase()]
  newFsJsonSearchMap.delete(file)
})

export const saveVtb = warp((file, data) => {
  const fileLowerCase = file.toLowerCase()
  const currentFile = newFsLowerCaseFileMap[fileLowerCase]
  if (currentFile) {
    deleteVtb(currentFile)
  }
  newFs[file] = data
  newFsLowerCaseFileMap[fileLowerCase] = file
  updateNewFsJsonSearchMap(file)
})

const parse = () => vdbParse({ ...list.meta, vtbs: Object.entries(newFs).map(([name, object]) => [name.replace('.json', ''), object]).map(([name, object]) => ({ name, object })) })

export const test = warp(() => vdbTest(parse()))

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
      switch (status) {
        case 'remove':
          return ['delete', file]
        case 'add':
        case 'update':
          return ['put', file, JSON.stringify(getVtbJson(file), undefined, 2)]
        default:
      }
    })
    .filter(Boolean)
})

const encodeDiff = () => {
  const command = serializeDiff()
  return encodeBase64(command
    .map(([cmd, file, content]) => {
      const line = [cmd, encodeBase64(file)]
      if (content) {
        line.push(encodeBase64(content))
      }
      return line
    })
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

Submit from <https://submit.vtbs.moe>, please evaluate the automatic Pull Request`
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
