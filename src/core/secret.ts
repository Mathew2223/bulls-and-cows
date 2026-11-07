import { digitsOf } from './digits.js';
import type { RandomSource } from './types.js';

const pickIndex = (size: number, random: RandomSource): number =>
  Math.min(size - 1, Math.floor(random() * size));

/** Рекурсивно вынимает `count` уникальных элементов из пула, не мутируя его. */
const pickUnique = (pool: readonly string[], count: number, random: RandomSource): string[] => {
  if (count === 0) return [];
  const index = pickIndex(pool.length, random);
  const rest = pool.filter((_, i) => i !== index);
  return [pool[index] as string, ...pickUnique(rest, count - 1, random)];
};

/**
 * Секрет — строка из `length` уникальных цифр системы `base` (может начинаться с 0).
 * Источник случайности передаётся параметром, поэтому функция тестируется детерминированно.
 */
export const generateSecret = (
  length: number,
  base: number,
  random: RandomSource = Math.random,
): string => {
  if (length < 1 || length > base) {
    throw new RangeError(`Нельзя взять ${length} уникальных цифр в системе с основанием ${base}`);
  }
  return pickUnique(digitsOf(base), length, random).join('');
};
