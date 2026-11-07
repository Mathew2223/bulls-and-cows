import { createDigitValidator } from './digits.js';

/** Длина совпадает, все символы допустимы для `base`, цифры не повторяются. */
export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  const chars = [...guess.toLowerCase()];
  return (
    chars.length === length && chars.every(createDigitValidator(base)) && new Set(chars).size === length
  );
};
