import EventEmitter from 'events'

const isWorker = !self.window

let warpWorker
const warps = []
const resolveMap = new Map()
const runningMap = new Map()

const randomString = () => String(Math.random())

export const eventEmitter = new EventEmitter()

export const apply = worker => {
  if (!warpWorker) {
    warpWorker = worker
    worker.addEventListener('message', ({ data: { key, data } }) => {
      resolveMap.get(key)(data)
      resolveMap.delete(key)
      runningMap.delete(key)
      eventEmitter.emit('running', [...runningMap.entries()])
    })
  } else {
    throw new Error('Worker??')
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
  const warpF = (...params) => {
    if (warpWorker) {
      return new Promise(resolve => {
        if (warpWorker) {
          const key = randomString()
          resolveMap.set(key, resolve)
          runningMap.set(key, f.displayName)
          eventEmitter.emit('c', [...runningMap.entries()])
          warpWorker.postMessage({ fNum, params, key })
        }
      })
    } else {
      return f(...params)
    }
  }
  warpF.registerName = name => {
    f.displayName = name
  }
  return warpF
}
