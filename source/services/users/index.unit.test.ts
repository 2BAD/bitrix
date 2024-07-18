import { beforeEach, describe, expect, it, vi } from 'vitest'
import Users from './index.js'

const mockCall = vi.fn(() => Promise.resolve()) as any
const mockList = vi.fn(() => Promise.resolve()) as any
const users = Users({ call: mockCall })

const ID = '77'

describe('Users', () => {
  beforeEach(() => {
    mockCall.mockClear()
    mockList.mockClear()
  })

  it('should expose API methods', () => {
    expect(users).toMatchSnapshot()
  })

  describe('`get`', () => {
    it('should invoke `call`', async () => {
      await users.get(ID)
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })
})
