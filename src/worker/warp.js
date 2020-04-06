const isWorker = !self.window

let warpWorker
const warps = []
const resolveMap = new Map()

const randomString = () => String(Math.random())

export const apply = worker => {
  if (!warpWorker) {
    warpWorker = worker
    worker.addEventListener('message', ({ data: { key, data } }) => {
      resolveMap.get(key)(data)
      resolveMap.delete(key)
    })
  }
}

if (isWorker) {
  self.addEventListener('message', async ({ data: { fNum, params, key } }) => {
    self.postMessage({ key, data: await warps[fNum](...params) })
  })
}

export const warp = f => {
  const fNum = warps.length
  warps.push(f)
  if (!isWorker) {
    return (...params) => new Promise(resolve => {
      if (warpWorker) {
        const key = randomString()
        resolveMap.set(key, resolve)
        warpWorker.postMessage({ fNum, params, key })
      }
    })
  } else {
    return f
  }
}
