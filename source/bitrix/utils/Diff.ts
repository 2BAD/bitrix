// Remove types from T that are assignable to U
// ```
// type T = 'a' | 'b' | 'c' | 'd'
// type U = 'a' | 'c' | 'f'
// type Test = Diff<T, U> // Returns `'b' | 'd'`
// ```
export type Diff<T, U> = T extends U ? never : T
