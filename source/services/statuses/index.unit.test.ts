import Statuses from '.'

const mockCall = jest.fn(() => Promise.resolve()) as any
const mockList = jest.fn(() => Promise.resolve()) as any
const statuses = Statuses({ call: mockCall })

const ID = '77'

describe('Statuses', () => {
  beforeEach(() => {
    mockCall.mockClear()
    mockList.mockClear()
  })

  it('should expose API methods', () => {
    expect(statuses).toMatchSnapshot()
  })

  describe('`create`', () => {
    it('should invoke `call`', async () => {
      await statuses.create({
        NAME: 'Test name'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })

  describe('`get`', () => {
    it('should invoke `call`', async () => {
      await statuses.get(ID)
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })

  describe('`list`', () => {
    it('should invoke `call`', async () => {
      await statuses.list({
        order: { NAME: 'ASC' },
        filter: { ENTITY_ID: 'STATUS' }
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })

    it('should work without optional params', async () => {
      await statuses.list()
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })

  describe('`update`', () => {
    it('should invoke `call`', async () => {
      await statuses.update(ID, {
        NAME: 'Test name'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })

    it('should work without optional params', async () => {
      await statuses.update(ID, {
        NAME: 'Test name'
      })
      expect(mockCall.mock.calls).toMatchSnapshot()
    })
  })
})
