import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from './combinatorics.js';

describe('countPossibleSecrets', () => {
  it('dec, длина 4: 10·9·8·7 = 5040 (включая секреты с нулём в начале)', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
  });

  it('dec, длина 6: 151200', () => {
    expect(countPossibleSecrets(6, 10)).toBe(151200);
  });

  it('hex, длина 6: 5 765 760', () => {
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it('oct, длина 2: 56', () => {
    expect(countPossibleSecrets(2, 8)).toBe(56);
  });

  it('bin, длина 2: 2', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('граничные случаи: длина 0 → 1, длина 1 → base', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
    expect(countPossibleSecrets(1, 10)).toBe(10);
  });

  it('длина больше основания → 0 вариантов', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });

  it('повторный вызов возвращает тот же результат (мемоизация не ломает значения)', () => {
    expect(countPossibleSecrets(5, 16)).toBe(countPossibleSecrets(5, 16));
    expect(countPossibleSecrets(5, 16)).toBe(524160);
  });
});
