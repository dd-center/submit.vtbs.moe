import { apply } from './warp'
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./worker'
import * as fList from './worker'

apply(new Worker())

Object.entries(fList).map(([name, f]) => f.registerName(name))

export * from './worker'
