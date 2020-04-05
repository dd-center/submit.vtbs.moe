import { apply } from './warp'
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./worker'

apply(new Worker())

export * from './worker'
