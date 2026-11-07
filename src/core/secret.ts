import type { RandomSource } from './types.js';

export const generateSecret = (length: number, base: number, random: RandomSource = Math.random): string => {
  throw new Error(`not implemented: ${length} ${base} ${String(random())}`);
};
