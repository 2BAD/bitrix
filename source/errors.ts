type BitrixErrorDetails = {
  readonly code: string
  readonly description: string
  readonly method: string
  readonly status?: number
  readonly command?: string
  readonly cause?: unknown
}

export class BitrixError extends Error {
  override readonly name = 'BitrixError'
  readonly code: string
  readonly description: string
  readonly method: string
  readonly status: number | undefined
  readonly command: string | undefined

  constructor({ code, description, method, status, command, cause }: BitrixErrorDetails) {
    const target = command === undefined ? method : `${method} (command ${command})`
    super(`${target}: ${[code, description].filter(Boolean).join(' ')}`, { cause })
    this.code = code
    this.description = description
    this.method = method
    this.status = status
    this.command = command
  }
}
