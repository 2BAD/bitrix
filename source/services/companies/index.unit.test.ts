import { beforeEach, describe, expect, it, vi } from 'vitest'
import Companies from './index.js'

const mockCall = vi.fn(() => Promise.resolve()) as any
const mockList = vi.fn(() => Promise.resolve()) as any
const companies = Companies({ call: mockCall, list: mockList })

const ID = '77'

describe('Companies', () => {
  beforeEach(() => {
    mockCall.mockClear()
    mockList.mockClear()
  })

  it('should expose API methods', () => {
    expect(companies).toMatchSnapshot()
  })

  describe('`create`', () => {
    it('should invoke `call`', async () => {
      await companies.create({
        COMMENTS: 'Some comment'
      }, {
        REGISTER_SONET_EVENT: 'Y'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })

    it('should work without optional params', async () => {
      await companies.create({
        COMMENTS: 'Some comment'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })

  describe('`get`', () => {
    it('should invoke `call`', async () => {
      await companies.get(ID)
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })

  describe('`list`', () => {
    it('should invoke `list`', async () => {
      await companies.list({
        start: 0,
        order: { COMMENTS: 'ASC' },
        filter: { '>PROBABILITY': 50 },
        select: ['*', 'UF_*']
      })
      expect(mockList.mock.calls).toMatchSnapshot()
    })

    it('should work without optional params', async () => {
      await companies.list()
      expect(mockList.mock.calls).toMatchSnapshot()
    })
  })

  describe('`update`', () => {
    it('should invoke `call`', async () => {
      await companies.update(ID, {
        COMMENTS: 'Some comment'
      }, {
        REGISTER_SONET_EVENT: 'Y'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })

    it('should work without optional params', async () => {
      await companies.update(ID, {
        COMMENTS: 'Some comment'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })
})
