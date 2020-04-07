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
