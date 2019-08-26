import { BitrixCommandParams } from '../types'

export default (params: BitrixCommandParams): string =>
  Object.keys(params)
    .reduce((query, name) => `${query}&${name}=${params[name]}`, '')
    // That will happen only for first instance
    .replace('&', '')
