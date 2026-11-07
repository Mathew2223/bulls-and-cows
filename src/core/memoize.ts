/** Мемоизация чистой функции: результат кэшируется по сериализованным аргументам. */
export const memoize = <Args extends readonly unknown[], Result>(
  fn: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  const cache = new Map<string, Result>();
  return (...args: Args): Result => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as Result;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
