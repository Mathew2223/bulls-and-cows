import { describe, expect, it, vi } from 'vitest';
import { memoize } from './memoize.js';

describe('memoize', () => {
  it('возвращает тот же результат, что и исходная функция', () => {
    const add = memoize((a: number, b: number) => a + b);
    expect(add(2, 3)).toBe(5);
  });

  it('вызывает исходную функцию один раз для одних и тех же аргументов', () => {
    const spy = vi.fn((n: number) => n * 2);
    const double = memoize(spy);
    double(4);
    double(4);
    double(4);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('разные аргументы считаются отдельно', () => {
    const spy = vi.fn((a: number, b: number) => a - b);
    const sub = memoize(spy);
    expect(sub(5, 2)).toBe(3);
    expect(sub(2, 5)).toBe(-3);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('кэширует falsy-результаты (0)', () => {
    const spy = vi.fn(() => 0);
    const zero = memoize(spy);
    zero();
    zero();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('кэши разных мемоизированных функций независимы', () => {
    const a = memoize((n: number) => n + 1);
    const b = memoize((n: number) => n + 100);
    expect(a(1)).toBe(2);
    expect(b(1)).toBe(101);
  });
});
