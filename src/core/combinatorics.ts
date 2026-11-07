import { memoize } from './memoize.js';

/**
 * Количество различных секретов = P(base, length) = base! / (base − length)!.
 * Рекурсия: P(l, b) = b * P(l − 1, b − 1), P(0, b) = 1. Результат мемоизирован.
 */
export const countPossibleSecrets: (length: number, base: number) => number = memoize(
  (length: number, base: number): number => {
    if (length < 0 || length > base) return 0;
    if (length === 0) return 1;
    return base * countPossibleSecrets(length - 1, base - 1);
  },
);
