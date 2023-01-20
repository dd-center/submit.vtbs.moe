import { Level } from 'level'

import { warp } from './warp'

import vdbParse from '../vdb/parse'
import vdbTest from '../vdb/test'

const workspace = new Level('submit.vtbs.moe-workspace')

let list
let fs
let issues = {}
let issuesApply = []
let newFs

const issuesApplyCacheFS = new WeakMap()

const encodeBase64 = string => Buffer.from(string).toString('base64')

const fetchJson = async url => (await fetch(url, { cache: 'no-cache' })).json()

export const loadFs = warp(async () => {
  fs = await fetchJson('https://vdb.vtbs.moe/json/fs.json')
  if (!newFs) {
    newFs = JSON.parse(JSON.stringify(fs))
  }
  list = await fetchJson('https://vdb.vtbs.moe/json/list.json')
  issues = await fetchJson('https://vdb.vtbs.moe/json/fs-review.json')
})

export const loadWorkspaceList = warp(async () => {
  const list = []
  for await (const key of workspace.keys()) {
    list.push(key)
  }
  return list
})

export const saveWorkspace = warp(async name => {
  await workspace.put(name, JSON.stringify(newFs))
})

export const loadWorkspace = warp(async name => {
  newFs = JSON.parse(await workspace.get(name))
})

export const deleteWorkspace = warp(async name => {
  await workspace.del(name)
})

export const getIssues = warp(() => issues)

export const getIssuesApply = warp(() => issuesApply)

const apply = (fs, commands) => commands
  .reduce((fs, [command, arg, content]) => {
    if (command === 'delete') {
      const {
        [arg]: _, ...rest
      } = fs
      return rest
    } else if (command === 'put') {
      return {
        ...fs,
        [arg]: JSON.parse(content)
      }
    }
    return fs
  }, fs)

const applyIssues = () => {
  if (!issuesApplyCacheFS.has(issuesApply)) {
    const result = apply(JSON.parse(JSON.stringify(fs)), issuesApply
      .map(file => issues[file])
      .flatMap(({ commands }) => commands))
    issuesApplyCacheFS.set(issuesApply, result)
  }
  return issuesApplyCacheFS.get(issuesApply)
}

export const applyIssue = warp(file => {
  if (!issuesApply.includes(file)) {
    issuesApply = [...issuesApply, file]
    newFs = apply(newFs, issues[file].commands)
  }
})

export const unapplyIssue = warp(file => {
  const currentCommand = diffCommand()
  issuesApply = issuesApply.filter(f => f !== file)
  newFs = apply(applyIssues(), currentCommand)
})

export const getMeta = warp(() => list.meta)

export const getFs = warp(() => newFs)

export const getList = warp(() => Object.keys(newFs).reverse())

export const getGroupList = warp(() => Object.entries(newFs)
  .map(([file, { type }]) => ({ file, type }))
  .filter(({ type }) => type === 'group')
  .map(({ file }) => file.replace('.json', '')))

export const searchList = warp(keys => Object.entries(newFs)
  .map(([file, content]) => [file.toLowerCase(), JSON.stringify(content).toLowerCase(), file])
  .filter(([k, content]) => keys.every(key => k.includes(key) || content.includes(key)))
  .map(([_, __, file]) => file))

export const getVtbJson = warp(name => newFs[name])

export const deleteVtb = warp(file => {
  delete newFs[file]
})

export const saveVtb = warp((file, data) => {
  const fileLowerCase = file.toLowerCase()
  const currentFile = Object.keys(newFs).find(file => file.toLowerCase() === fileLowerCase)
  if (currentFile) {
    deleteVtb(currentFile)
  }
  newFs[file] = data
})

export const resetVtb = warp((file, issue) => {
  const base = issue ? fs : applyIssues()
  if (base[file]) {
    saveVtb(file, JSON.parse(JSON.stringify(base[file])))
  } else {
    deleteVtb(file)
  }
})

const parse = fsUsed => vdbParse({ ...list.meta, vtbs: Object.entries(fsUsed).map(([name, object]) => [name.replace('.json', ''), object]).map(([name, object]) => ({ name, object })) }, true)

export const test = warp(issue => {
  const fsUsed = issue ? apply(JSON.parse(JSON.stringify(fs)), issues[issue].commands) : newFs
  return vdbTest(parse(fsUsed), Object.keys(fsUsed))
})

const diffFile = (file, from, to) => {
  if (!to[file]) {
    return 'remove'
  }
  if (!from[file]) {
    return 'add'
  }
  if (JSON.stringify(from[file]) !== JSON.stringify(to[file])) {
    return 'update'
  }
  return undefined
}

export const diff = warp(issue => {
  const base = issue ? fs : applyIssues()
  const fsUsed = issue ? apply(JSON.parse(JSON.stringify(fs)), issues[issue].commands) : newFs
  return [...new Set([...Object.keys(base), ...Object.keys(fsUsed)])]
    .map(file => [file, diffFile(file, base, fsUsed)])
    .filter(([_, status]) => status)
})

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

const describeMerge = () => {
  const merge = issuesApply
    .map(file => issues[file].issue.number)
    .map(number => `#${number}`)
  if (!merge.length) {
    return ''
  }
  return `
Merge: ${merge.join(' ')}`
}

const diffCommand = () => diff()
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

export const serializeDiff = warp((extraCommands = [], issue) => {
  if (issue) {
    return issues[issue].commands.map(([cmd, file, content]) => [cmd, file, content, fs[file] && JSON.stringify(fs[file], undefined, 2)])
  }
  const merge = issuesApply.map(file => issues[file].issue.number).map(number => ['merge', number])
  const command = [...merge, ...diffCommand()]
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
  const merge = describeMerge()

  return `${input}

### description
${merge}
${description}

\`\`\`
-----BEGIN SUBMIT BLOCK-----${command}-----END SUBMIT BLOCK-----
\`\`\`

Submit from <https://submit.vtbs.moe>, please evaluate the automatic Pull Request`
})

export const submitDiff = warp(async (input, extraCommands, token) => {
  const body = makeIssue(input, extraCommands)

  const Authorization = token ? `token ${token}` : 'Basic ZGQtY2VudGVyLWJvdDpkZDBiMmY0MjE4OThmNjAzZGYwNGM0NzdkMzQyNmU5MzE4MWRlZTUy'

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
