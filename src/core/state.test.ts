import { describe, expect, it } from 'vitest';
import {
  availableLengths,
  checkGuess,
  elapsedMs,
  initialState,
  newGame,
  normalizeSettings,
  startGame,
  submitGuess,
  updateSettings,
} from './state.js';

const playing = (secret = '1234', length = 4) =>
  startGame(updateSettings(initialState(), { length, base: 10 }), secret, 1000);

describe('availableLengths / normalizeSettings', () => {
  it('bin: доступна только длина 2', () => {
    expect(availableLengths(2)).toEqual([2]);
  });
  it('oct/dec/hex: доступны длины 2–6', () => {
    expect(availableLengths(8)).toEqual([2, 3, 4, 5, 6]);
    expect(availableLengths(16)).toEqual([2, 3, 4, 5, 6]);
  });
  it('при переходе на bin длина сжимается до 2', () => {
    expect(normalizeSettings({ length: 5, base: 2 })).toEqual({ length: 2, base: 2 });
  });
});

describe('состояние игры', () => {
  it('настройки меняются до старта и не меняются после', () => {
    const before = initialState();
    expect(updateSettings(before, { length: 5, base: 16 }).settings).toEqual({
      length: 5,
      base: 16,
    });
    const started = playing();
    expect(updateSettings(started, { length: 2, base: 2 })).toBe(started);
  });

  it('попытка добавляется новой записью, старое состояние не мутирует', () => {
    const s0 = playing();
    const s1 = submitGuess(s0, '1243', 2000);
    const s2 = submitGuess(s1, '5678', 3000);
    expect(s0.history).toHaveLength(0);
    expect(s1.history).toEqual([{ guess: '1243', bulls: 2, cows: 2 }]);
    expect(s2.history).toHaveLength(2);
    expect(s2.history[0]).toBe(s1.history[0]);
    expect(s2.history).not.toBe(s1.history);
  });

  it('повтор попытки и невалидный ввод не меняют состояние', () => {
    const s1 = submitGuess(playing(), '1243', 2000);
    expect(checkGuess(s1, '1243')).toBe('repeat');
    expect(submitGuess(s1, '1243', 2500)).toBe(s1);
    expect(checkGuess(s1, '11')).toBe('invalid');
    expect(submitGuess(s1, '11', 2500)).toBe(s1);
  });

  it('повтор в другом регистре тоже считается повтором (hex)', () => {
    const s0 = startGame(updateSettings(initialState(), { length: 2, base: 16 }), 'ab', 0);
    const s1 = submitGuess(s0, 'AF', 1);
    expect(checkGuess(s1, 'af')).toBe('repeat');
  });

  it('угадывание завершает игру и фиксирует время', () => {
    const won = submitGuess(playing(), '1234', 4500);
    expect(won.status).toBe('won');
    expect(won.finishedAt).toBe(4500);
    expect(elapsedMs(won, 99999)).toBe(3500);
    expect(checkGuess(won, '4321')).toBe('finished');
  });

  it('новая игра возвращает к настройкам без истории', () => {
    const won = submitGuess(playing(), '1234', 4500);
    const fresh = newGame(won);
    expect(fresh.status).toBe('settings');
    expect(fresh.history).toEqual([]);
    expect(fresh.settings).toEqual(won.settings);
  });
});
