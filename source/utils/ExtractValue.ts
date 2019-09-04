/**
 * Extract value from the `MAP` following the `KEY`
 * It works with `enum` as a `KEY` when matched against dict as `enum` values as a keys,
 * which justifies whole existence of that helper.
 */
export type ExtractValue<
  MAP extends Record<string, any>,
  KEY extends string | number | symbol,
  MAPKEY extends keyof MAP = KEY extends keyof MAP ? KEY : never
> = MAP[MAPKEY]
