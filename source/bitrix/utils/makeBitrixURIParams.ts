import { BitrixCommandParams } from '../types'

export default (params: BitrixCommandParams): string => {
  const names = Object.keys(params)

  return names.length > 0
    ? names
      .reduce((query, name) => `${query}&${name}=${params[name]}`, '')
      // That will happen only for first instance
      .replace('&', '')
    : ''
}
