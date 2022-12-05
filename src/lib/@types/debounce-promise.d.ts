type TFn = () => any

declare module "debounce-promise" {
  type TDebounceFn = (fn: TFn, ms: number) => TFn

  const debounce: TDebounceFn

  export default debounce
}
