/* eslint-env jest */
// tslint:disable: no-expression-statement

import makeBitrixURIParams from './makeBitrixURIParams'

describe('`makeBitrixURIParams` method', () => {
  it('should transform command params object into the query part of the Bitrix API URI', () => {
    expect(makeBitrixURIParams({ param1: 1, param2: 'value' })).toMatchSnapshot()
  })

  it('should return empty string when there is no params', () => {
    expect(makeBitrixURIParams({})).toMatchSnapshot()
  })
})
