import { evaluateGuess } from './evaluate.js';
import { isValidGuess } from './validation.js';
import type { Attempt, Base, GameState, Settings } from './types.js';

export const BASES: readonly Base[] = [2, 8, 10, 16];
export const BASE_NAMES: Readonly<Record<Base, string>> = { 2: 'bin', 8: 'oct', 10: 'dec', 16: 'hex' };
export const LENGTHS: readonly number[] = [2, 3, 4, 5, 6];

export type GuessCheck = 'ok' | 'finished' | 'invalid' | 'repeat';

/** Длины, доступные в системе счисления: нельзя взять больше уникальных цифр, чем их есть. */
export const availableLengths = (base: number): readonly number[] =>
  LENGTHS.filter((length) => length <= base);

/** Подгоняет длину под систему счисления (bin → только 2). */
export const normalizeSettings = ({ length, base }: Settings): Settings => ({
  base,
  length: Math.min(length, Math.max(...availableLengths(base))),
});

export const initialState = (): GameState => ({
  status: 'settings',
  settings: { length: 4, base: 10 },
  secret: '',
  history: [],
  startedAt: 0,
  finishedAt: null,
});

export const updateSettings = (state: GameState, settings: Settings): GameState =>
  state.status === 'settings' ? { ...state, settings: normalizeSettings(settings) } : state;

export const startGame = (state: GameState, secret: string, now: number): GameState =>
  state.status === 'settings'
    ? { ...state, status: 'playing', secret, history: [], startedAt: now, finishedAt: null }
    : state;

export const isRepeat = (state: GameState, guess: string): boolean =>
  state.history.some((attempt) => attempt.guess === guess.toLowerCase());

export const checkGuess = (state: GameState, guess: string): GuessCheck => {
  if (state.status !== 'playing') return 'finished';
  if (!isValidGuess(guess, state.settings.length, state.settings.base)) return 'invalid';
  if (isRepeat(state, guess)) return 'repeat';
  return 'ok';
};

/** Иммутабельно добавляет попытку. Невалидные и повторные попытки состояние не меняют. */
export const submitGuess = (state: GameState, guess: string, now: number): GameState => {
  if (checkGuess(state, guess) !== 'ok') return state;

  const normalized = guess.toLowerCase();
  const attempt: Attempt = { guess: normalized, ...evaluateGuess(state.secret, normalized) };
  const won = attempt.bulls === state.settings.length;

  return {
    ...state,
    history: [...state.history, attempt],
    status: won ? 'won' : 'playing',
    finishedAt: won ? now : null,
  };
};

export const elapsedMs = (state: GameState, now: number): number =>
  (state.finishedAt ?? now) - state.startedAt;

/** Возврат к экрану настроек; выбранные настройки сохраняются. */
export const newGame = (state: GameState): GameState => ({
  ...initialState(),
  settings: state.settings,
});
