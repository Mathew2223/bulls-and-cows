import type { Evaluation } from './types.js';

export const evaluateGuess = (secret: string, guess: string): Evaluation => {
  throw new Error(`not implemented: ${secret} ${guess}`);
};
