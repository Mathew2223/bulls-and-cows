import { describe, expect, it } from 'vitest';
import { generateSecret } from './secret.js';

/** Детерминированный источник: отдаёт значения по кругу. */
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] as number;
};

/** Детерминированный псевдослучайный генератор (mulberry32) с фиксированным зерном. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

describe('generateSecret', () => {
  it('при random = 0 берёт первые цифры алфавита (лидирующий ноль допустим)', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
  });

  it('при random ≈ 1 берёт последние цифры алфавита', () => {
    expect(generateSecret(4, 10, () => 0.999)).toBe('9876');
  });

  it('использует переданный источник случайности', () => {
    expect(generateSecret(3, 10, sequence(0.5, 0, 0.99))).toBe('509');
  });

  it('random = 1 не выходит за границы пула', () => {
    expect(generateSecret(3, 10, () => 1)).toBe('987');
  });

  it('одинаковый random даёт одинаковый результат (Repeatable)', () => {
    expect(generateSecret(5, 16, seeded(42))).toBe(generateSecret(5, 16, seeded(42)));
  });

  it('длина верна, цифры уникальны и принадлежат системе счисления', () => {
    const cases: Array<[number, number]> = [
      [2, 2],
      [3, 8],
      [4, 10],
      [6, 16],
    ];
    cases.forEach(([length, base], index) => {
      const secret = generateSecret(length, base, seeded(index + 1));
      const allowed = '0123456789abcdef'.slice(0, base);
      expect(secret).toHaveLength(length);
      expect(new Set(secret).size).toBe(length);
      expect([...secret].every((char) => allowed.includes(char))).toBe(true);
    });
  });

  it('bin: длина 2 использует обе цифры', () => {
    expect([...generateSecret(2, 2, () => 0)].sort()).toEqual(['0', '1']);
  });

  it('выбрасывает ошибку, если уникальных цифр не хватает', () => {
    expect(() => generateSecret(3, 2, () => 0)).toThrow(RangeError);
    expect(() => generateSecret(0, 10, () => 0)).toThrow(RangeError);
  });

  it('по умолчанию использует Math.random и всё равно возвращает корректный секрет', () => {
    const secret = generateSecret(4, 10);
    expect(secret).toHaveLength(4);
    expect(new Set(secret).size).toBe(4);
  });
});
