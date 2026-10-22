const encodeValue = (value: unknown): string => {
  if (value === null) return ''
  if (value === true) return '1'
  if (value === false) return '0'
  if (value instanceof Date) return encodeURIComponent(value.toISOString())
  return encodeURIComponent(String(value))
}

const pairs = (key: string, value: unknown): string[] => {
  if (value === undefined) return []
  if (Array.isArray(value)) return value.flatMap((item, index) => pairs(`${key}[${index}]`, item))
  if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
    return Object.entries(value).flatMap(([name, item]) => pairs(`${key}[${name}]`, item))
  }
  return [`${encodeURIComponent(key)}=${encodeValue(value)}`]
}

/**
 * Serializes params into a PHP style query string (`filter[>ID]=5&select[0]=ID`), the format Bitrix expects
 * for commands inside a `batch` call
 */
export const encode = (params: Readonly<Record<string, unknown>>): string =>
  Object.entries(params)
    .flatMap(([key, value]) => pairs(key, value))
    .join('&')
