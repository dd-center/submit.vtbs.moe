import { warp } from './warp'

let fs

const fetchJson = async url => (await fetch(url)).json()

export const loadFs = warp(async () => {
  fs = await fetchJson('https://vdb.vtbs.moe/json/fs.json')
})

export const getFs = warp(() => fs)

const getList = () => Object.keys(fs)

export const getNameList = warp(() => getList().map(file => file.replace('.json', '')))
