import { beforeEach, describe, expect, it, vi } from 'vitest'
import Deals from '.'

const mockCall = vi.fn(() => Promise.resolve()) as any
const mockList = vi.fn(() => Promise.resolve()) as any
const deals = Deals({ call: mockCall, list: mockList })

const ID = '77'

describe('Deals', () => {
  beforeEach(() => {
    mockCall.mockClear()
    mockList.mockClear()
  })

  it('should expose API methods', () => {
    expect(deals).toMatchSnapshot()
  })

  describe('`create`', () => {
    it('should invoke `call`', async () => {
      await deals.create({
        COMMENTS: 'Some comment'
      }, {
        REGISTER_SONET_EVENT: 'Y'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })

    it('should work without optional params', async () => {
      await deals.create({
        COMMENTS: 'Some comment'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })

  describe('`get`', () => {
    it('should invoke `call`', async () => {
      await deals.get(ID)
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })

  describe('`list`', () => {
    it('should invoke `list`', async () => {
      await deals.list({
        start: 0,
        order: { COMMENTS: 'ASC' },
        filter: { '>PROBABILITY': 50 },
        select: ['*', 'UF_*']
      })
      expect(mockList.mock.calls).toMatchSnapshot()
    })

    it('should work without optional params', async () => {
      await deals.list()
      expect(mockList.mock.calls).toMatchSnapshot()
    })
  })

  describe('`update`', () => {
    it('should invoke `call`', async () => {
      await deals.update(ID, {
        COMMENTS: 'Some comment'
      }, {
        REGISTER_SONET_EVENT: 'Y'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })

    it('should work without optional params', async () => {
      await deals.update(ID, {
        COMMENTS: 'Some comment'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })
})
