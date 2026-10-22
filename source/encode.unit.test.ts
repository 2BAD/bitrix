import { describe, expect, it } from 'vitest'
import { encode } from './encode.js'

describe('encode', () => {
  it('encodes flat params', () => {
    expect(encode({ id: 7, name: 'a b' })).toBe('id=7&name=a%20b')
  })

  it('encodes nested objects and arrays with brackets', () => {
    expect(decodeURIComponent(encode({ filter: { '>ID': 5, STAGE_ID: ['WON', 'LOSE'] }, select: ['ID'] }))).toBe(
      'filter[>ID]=5&filter[STAGE_ID][0]=WON&filter[STAGE_ID][1]=LOSE&select[0]=ID'
    )
  })

  it('percent encodes keys and values', () => {
    expect(encode({ 'filter[>ID]': '$result[0][49][ID]' })).toBe('filter%5B%3EID%5D=%24result%5B0%5D%5B49%5D%5BID%5D')
  })

  it('skips undefined and maps null, booleans and dates', () => {
    expect(
      encode({ skip: undefined, empty: null, yes: true, no: false, at: new Date('2026-01-02T03:04:05.000Z') })
    ).toBe('empty=&yes=1&no=0&at=2026-01-02T03%3A04%3A05.000Z')
  })

  it('returns an empty string for empty params', () => {
    expect(encode({})).toBe('')
    expect(encode({ list: [] })).toBe('')
  })
})
