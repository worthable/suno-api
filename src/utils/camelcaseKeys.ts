import { camelCase } from 'lodash'

export const camelcaseKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => camelcaseKeys(item))
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = camelCase(key)
      acc[camelKey] = camelcaseKeys(obj[key])
      return acc
    }, {})
  }
  return obj
}
