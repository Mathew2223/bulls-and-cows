export const memoize = <Args extends readonly unknown[], Result>(
  fn: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  throw new Error(`not implemented: ${String(fn)}`);
};
