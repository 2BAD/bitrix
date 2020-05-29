// Because `Array.isArray` itself give a strange result with `any[]`
export default <E>(x: E | readonly E[] | unknown): x is readonly E[] => Array.isArray(x)
