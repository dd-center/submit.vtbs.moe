import level from 'level'

import { warp } from './warp'

import vdbParse from '../vdb/parse'
import vdbTest from '../vdb/test'

const workspace = level('submit.vtbs.moe-workspace')

let list
let fs
let newFs
let newFsLowerCaseFileMap
const newFsJsonSearchMap = new Map()

const encodeBase64 = string => Buffer.from(string).toString('base64')

const fetchJson = async url => (await fetch(url, { cache: 'no-cache' })).json()

const updateNewFsJsonSearchMap = (files = Object.keys(newFs)) => [files].flat()
  .forEach(file => {
    newFsJsonSearchMap.set(file, `${file}${JSON.stringify(newFs[file])}`.toLowerCase())
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

export const loadWorkspaceList = warp(() => new Promise(resolve => {
  const list = []
  workspace.createKeyStream()
    .on('data', (key) => {
      list.push(key)
    })
    .on('end', () => {
      resolve(list)
    })
}))

export const saveWorkspace = warp(async name => {
  await workspace.put(name, JSON.stringify(newFs))
})

export const loadWorkspace = warp(async name => {
  newFs = JSON.parse(await workspace.get(name))
  newFsLowerCaseFileMap = Object.fromEntries(Object.keys(newFs)
    .map(file => [file.toLowerCase(), file]))
  updateNewFsJsonSearchMap()
})

export const deleteWorkspace = warp(async name => {
  await workspace.del(name)
})

export const getMeta = warp(() => list.meta)

export const getFs = warp(() => newFs)

export const getList = warp(() => Object.keys(newFs).reverse())

export const getGroupList = warp(() => Object.entries(newFs)
  .map(([file, { type }]) => ({ file, type }))
  .filter(({ type }) => type === 'group')
  .map(({ file }) => file.replace('.json', '')))

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

export const resetVtb = warp(file => {
  if (fs[file]) {
    saveVtb(file, JSON.parse(JSON.stringify(fs[file])))
  } else {
    deleteVtb(file)
  }
})

const parse = () => vdbParse({ ...list.meta, vtbs: Object.entries(newFs).map(([name, object]) => [name.replace('.json', ''), object]).map(([name, object]) => ({ name, object })) }, true)

export const test = warp(() => vdbTest(parse(), Object.keys(newFs)))

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

const generateLink = file => {
  const { accounts = {} } = newFs[file]
  const { linkSyntax } = getMeta()
  return Object.entries(accounts)
    .map(([platform, ids]) => [linkSyntax[platform], ids])
    .map(w => w.flat())
    .map(([platform, ...ids]) => [platform, ...ids.map(id => id.id || id)])
    .flatMap(([linkFormat = '{id}', ...ids]) => ids.map(id => linkFormat.replace('{id}', id)))
}

const describeDiff = () => {
  const change = diff()
  return change
    .map(([file, status]) => {
      if (status === 'add' || status === 'update') {
        const links = generateLink(file)
          .map(link => link.startsWith('http') ? `<${link}>` : link)
          .map(link => `> ${link}`)
          .join('\n')
        if (links.length) {
          return [file, status, `\n${links}\n`]
        }
      }
      return [file, status]
    })
    .map(([file, status, detail = '']) => `${status}: ${file}${detail}`)
    .sort()
    .join('\n')
}

export const serializeDiff = warp((extraCommands = []) => {
  const change = diff()
  const command = change
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
  if (!command.length) {
    return []
  }
  return [...extraCommands, ...command]
})

const encodeDiff = extraCommands => {
  const command = serializeDiff(extraCommands)
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

export const makeIssue = warp((input, extraCommands) => {
  const command = encodeDiff(extraCommands)
  const description = describeDiff()

  return `${input}

### description

${description}

\`\`\`
-----BEGIN SUBMIT BLOCK-----${command}-----END SUBMIT BLOCK-----
\`\`\`

Submit from <https://submit.vtbs.moe>, please evaluate the automatic Pull Request`
})

export const submitDiff = warp(async (input, extraCommands, token) => {
  const body = makeIssue(input, extraCommands)

  const Authorization = token ? `token ${token}` : 'Basic ZGQtY2VudGVyLWJvdDpkZDBiMmY0MjE4OThmNjAzZGYwNGM0NzdkMzQyNmU5MzE4MWRlZTUy'

  console.log({ Authorization })

  const response = await fetch('https://api.github.com/repos/dd-center/vdb/issues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization
    },
    body: JSON.stringify({ title: 'Change requested from submit.vtbs.moe', body })
  })
  const { html_url: url } = await response.json()
  return url
})
