import { describe, expect, it } from 'vitest';
import { isValidGuess } from './validation.js';

describe('isValidGuess', () => {
  it('принимает корректную попытку', () => {
    expect(isValidGuess('1234', 4, 10)).toBe(true);
  });

  it('принимает лидирующий ноль', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('отвергает неверную длину', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
    expect(isValidGuess('12345', 4, 10)).toBe(false);
    expect(isValidGuess('', 4, 10)).toBe(false);
  });

  it('отвергает символы вне системы счисления', () => {
    expect(isValidGuess('12a4', 4, 10)).toBe(false);
    expect(isValidGuess('0102', 4, 2)).toBe(false);
    expect(isValidGuess('1289', 4, 8)).toBe(false);
  });

  it('отвергает повторяющиеся цифры', () => {
    expect(isValidGuess('1123', 4, 10)).toBe(false);
  });

  it('hex: регистр не важен, a и A считаются одной цифрой', () => {
    expect(isValidGuess('aB3F', 4, 16)).toBe(true);
    expect(isValidGuess('aA3F', 4, 16)).toBe(false);
  });

  it('bin: длина 2 с уникальными цифрами', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
    expect(isValidGuess('11', 2, 2)).toBe(false);
  });
});
