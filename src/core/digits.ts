/** Алфавит цифр: достаточно для hex. Всегда в нижнем регистре. */
export const ALPHABET = '0123456789abcdef';

/** Цифры системы счисления `base` в виде массива символов. */
export const digitsOf = (base: number): readonly string[] => [...ALPHABET.slice(0, base)];

/**
 * Каррированная фабрика: по системе счисления возвращает предикат
 * «этот символ — допустимая цифра». Регистр не важен (a === A).
 */
export const createDigitValidator = (base: number) => {
  const allowed = new Set(digitsOf(base));
  return (char: string): boolean => char.length === 1 && allowed.has(char.toLowerCase());
};
