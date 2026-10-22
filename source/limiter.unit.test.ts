import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLimiter } from './limiter.js'

const settled = async (promises: Promise<void>[]) => {
  const state = promises.map(() => false)
  promises.forEach((promise, index) => promise.then(() => (state[index] = true)).catch(() => {}))
  await vi.advanceTimersByTimeAsync(0)
  return state
}

describe('createLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lets a burst through at once', async () => {
    const limiter = createLimiter({ burst: 3, refillPerSecond: 1 })
    const state = await settled([limiter.acquire(), limiter.acquire(), limiter.acquire()])
    expect(state).toEqual([true, true, true])
  })

  it('queues requests over the burst until tokens refill', async () => {
    const limiter = createLimiter({ burst: 2, refillPerSecond: 2 })
    const acquired = [limiter.acquire(), limiter.acquire(), limiter.acquire(), limiter.acquire()]
    expect(await settled(acquired)).toEqual([true, true, false, false])

    await vi.advanceTimersByTimeAsync(499)
    expect(await settled(acquired)).toEqual([true, true, false, false])
    await vi.advanceTimersByTimeAsync(1)
    expect(await settled(acquired)).toEqual([true, true, true, false])
    await vi.advanceTimersByTimeAsync(500)
    expect(await settled(acquired)).toEqual([true, true, true, true])
  })

  it('never refills above the burst size', async () => {
    const limiter = createLimiter({ burst: 1, refillPerSecond: 10 })
    await vi.advanceTimersByTimeAsync(10_000)
    const state = await settled([limiter.acquire(), limiter.acquire()])
    expect(state).toEqual([true, false])
  })

  it('uses Bitrix defaults of 50 burst and 2 per second', async () => {
    const limiter = createLimiter()
    const acquired = Array.from({ length: 51 }, () => limiter.acquire())
    expect((await settled(acquired)).filter(Boolean)).toHaveLength(50)
    await vi.advanceTimersByTimeAsync(500)
    expect((await settled(acquired)).filter(Boolean)).toHaveLength(51)
  })

  it('empties the bucket on exhaust', async () => {
    const limiter = createLimiter({ burst: 5, refillPerSecond: 1 })
    limiter.exhaust()
    const acquired = [limiter.acquire()]
    expect(await settled(acquired)).toEqual([false])
    await vi.advanceTimersByTimeAsync(1000)
    expect(await settled(acquired)).toEqual([true])
  })

  it('rejects when the signal is already aborted', async () => {
    const limiter = createLimiter()
    await expect(limiter.acquire(AbortSignal.abort(new Error('stop')))).rejects.toThrow('stop')
  })

  it('removes an aborted waiter from the queue', async () => {
    const limiter = createLimiter({ burst: 1, refillPerSecond: 1 })
    const controller = new AbortController()
    await limiter.acquire()
    const aborted = limiter.acquire(controller.signal)
    const next = limiter.acquire()
    controller.abort(new Error('cancelled'))
    await expect(aborted).rejects.toThrow('cancelled')

    await vi.advanceTimersByTimeAsync(1000)
    expect(await settled([next])).toEqual([true])
  })
})
