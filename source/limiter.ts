export type LimiterOptions = {
  readonly burst?: number
  readonly refillPerSecond?: number
}

export type Limiter = {
  readonly acquire: (signal?: AbortSignal) => Promise<void>
  readonly exhaust: () => void
}

type Waiter = {
  readonly resolve: () => void
  readonly signal: AbortSignal | undefined
  readonly onAbort: () => void
}

/**
 * Leaky bucket matching the Bitrix request limit: up to `burst` requests at once, then `refillPerSecond`
 */
export const createLimiter = ({ burst = 50, refillPerSecond = 2 }: LimiterOptions = {}): Limiter => {
  let tokens = burst
  let updatedAt = Date.now()
  let timer: ReturnType<typeof setTimeout> | undefined
  const waiters: Waiter[] = []

  const refill = () => {
    const now = Date.now()
    tokens = Math.min(burst, tokens + ((now - updatedAt) / 1000) * refillPerSecond)
    updatedAt = now
  }

  const release = () => {
    timer = undefined
    refill()
    while (waiters.length > 0 && tokens >= 1) {
      tokens -= 1
      const waiter = waiters.shift() as Waiter
      waiter.signal?.removeEventListener('abort', waiter.onAbort)
      waiter.resolve()
    }
    if (waiters.length > 0) {
      timer = setTimeout(release, Math.ceil(((1 - tokens) / refillPerSecond) * 1000))
    }
  }

  const acquire = (signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason)
        return
      }
      const waiter: Waiter = {
        resolve,
        signal,
        onAbort: () => {
          waiters.splice(waiters.indexOf(waiter), 1)
          reject(signal?.reason)
        }
      }
      signal?.addEventListener('abort', waiter.onAbort, { once: true })
      waiters.push(waiter)
      if (timer === undefined) release()
    })

  const exhaust = () => {
    refill()
    tokens = 0
  }

  return { acquire, exhaust }
}
