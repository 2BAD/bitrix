import { BitrixCommandParams } from '../types'

export default (params: BitrixCommandParams): string => {
  const names = Object.keys(params)

  return names.length > 0
    ? names
      .reduce((result, name) => `${result}&${name}=${params[name]}`, '')
      // That will happen only for first instance
      .replace('&', '')
    : ''
}
