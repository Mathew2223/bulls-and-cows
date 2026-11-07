import type { Evaluation } from './types.js';

/**
 * bulls — цифры на своих местах, cows — цифры, которые есть в секрете, но стоят не на своих местах.
 * Цифры уникальны, поэтому cows = (общие цифры) − bulls. Сложность O(n).
 */
export const evaluateGuess = (secret: string, guess: string): Evaluation => {
  const secretChars = [...secret.toLowerCase()];
  const guessChars = [...guess.toLowerCase()];
  const secretSet = new Set(secretChars);

  const bulls = guessChars.filter((char, index) => char === secretChars[index]).length;
  const common = guessChars.filter((char) => secretSet.has(char)).length;

  return { bulls, cows: common - bulls };
};
