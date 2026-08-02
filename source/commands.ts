import { Method } from './methods.js'

export type Command = {
  readonly method: Method
  // oxlint-disable-next-line typescript/no-explicit-any
  readonly params?: Record<string, any>
}

export type Commands =
  | { readonly [key: string]: Command }
  // For arrays. It's signature, since `Command[]` won't be
  // accepted by types like `Record`
  | { readonly [index: number]: Command }
