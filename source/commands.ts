import { Method } from './methods'

export type Command = {
  readonly method: Method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly params?: Record<string, any>
}

export type Commands =
  { readonly [key: string]: Command } |
  // For arrays. It's signature, since `Command[]` won't be
  // accepted by types like `Record`
  { readonly [index: number]: Command }
