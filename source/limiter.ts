import { sleep } from './transport.js'

export type LimiterOptions = {
  readonly burst?: number
  readonly refillPerSecond?: number
}

export type Limiter = {
  readonly acquire: (signal?: AbortSignal) => Promise<void>
  readonly exhaust: () => void
}

/**
 * Leaky bucket matching the Bitrix request limit: up to `burst` requests at once, then `refillPerSecond`.
 * Requests over the limit reserve a token in advance and wait until it refills
 * @param options bucket size and refill rate
 * @param options.burst requests allowed at once, 50 by default
 * @param options.refillPerSecond requests added back every second, 2 by default
 */
export const createLimiter = ({ burst = 50, refillPerSecond = 2 }: LimiterOptions = {}): Limiter => {
  let tokens = burst
  let updatedAt = Date.now()

  const refill = () => {
    const now = Date.now()
    tokens = Math.min(burst, tokens + ((now - updatedAt) / 1000) * refillPerSecond)
    updatedAt = now
  }

  const acquire = async (signal?: AbortSignal) => {
    signal?.throwIfAborted()
    refill()
    tokens -= 1
    if (tokens >= 0) return
    try {
      await sleep(Math.ceil((-tokens / refillPerSecond) * 1000), signal)
    } catch (error) {
      tokens += 1
      throw error
    }
  }

  const exhaust = () => {
    refill()
    tokens = Math.min(tokens, 0)
  }

  return { acquire, exhaust }
}
