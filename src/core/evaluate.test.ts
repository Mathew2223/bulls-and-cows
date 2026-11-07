import { describe, expect, it } from 'vitest';
import { evaluateGuess } from './evaluate.js';

describe('evaluateGuess', () => {
  it('полное совпадение: все быки', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
  });

  it('нет совпадений', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
  });

  it('все цифры угаданы, но не на своих местах: все коровы', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
  });

  it('смешанный случай', () => {
    expect(evaluateGuess('1234', '1243')).toEqual({ bulls: 2, cows: 2 });
    expect(evaluateGuess('0123', '0456')).toEqual({ bulls: 1, cows: 0 });
    expect(evaluateGuess('0123', '1045')).toEqual({ bulls: 0, cows: 2 });
  });

  it('лидирующие нули обрабатываются как обычные цифры', () => {
    expect(evaluateGuess('0123', '0123')).toEqual({ bulls: 4, cows: 0 });
  });

  it('hex: регистр не важен', () => {
    expect(evaluateGuess('a1b2', 'A1B2')).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess('A1B2', 'b2a1')).toEqual({ bulls: 0, cows: 4 });
  });

  it('bin, длина 2', () => {
    expect(evaluateGuess('01', '10')).toEqual({ bulls: 0, cows: 2 });
    expect(evaluateGuess('01', '01')).toEqual({ bulls: 2, cows: 0 });
  });

  it('не мутирует аргументы и чистая (одинаковый результат при повторном вызове)', () => {
    const first = evaluateGuess('1234', '1243');
    const second = evaluateGuess('1234', '1243');
    expect(first).toEqual(second);
  });
});
