import { describe, expect, it } from 'vitest';
import { createDigitValidator } from './digits.js';

describe('createDigitValidator', () => {
  it('bin: принимает только 0 и 1', () => {
    const isBin = createDigitValidator(2);
    expect(['0', '1'].every(isBin)).toBe(true);
    expect(isBin('2')).toBe(false);
    expect(isBin('a')).toBe(false);
  });

  it('oct: 0–7 допустимы, 8 и 9 нет', () => {
    const isOct = createDigitValidator(8);
    expect(isOct('7')).toBe(true);
    expect(isOct('8')).toBe(false);
  });

  it('dec: 0–9 допустимы, буквы нет', () => {
    const isDec = createDigitValidator(10);
    expect(isDec('9')).toBe(true);
    expect(isDec('a')).toBe(false);
  });

  it('hex: регистр не важен (a и A — одна цифра)', () => {
    const isHex = createDigitValidator(16);
    expect(isHex('a')).toBe(true);
    expect(isHex('A')).toBe(true);
    expect(isHex('f')).toBe(true);
    expect(isHex('F')).toBe(true);
    expect(isHex('g')).toBe(false);
  });

  it('отвергает пустую строку, многосимвольные строки и пробелы', () => {
    const isHex = createDigitValidator(16);
    expect(isHex('')).toBe(false);
    expect(isHex('12')).toBe(false);
    expect(isHex(' ')).toBe(false);
  });

  it('каррирование: фабрика возвращает функцию, независимую от других оснований', () => {
    const isBin = createDigitValidator(2);
    const isDec = createDigitValidator(10);
    expect(isBin('5')).toBe(false);
    expect(isDec('5')).toBe(true);
  });
});
