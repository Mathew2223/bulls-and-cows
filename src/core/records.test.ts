import { describe, expect, it } from 'vitest';
import {
  addRecord,
  parseRecords,
  recordFromState,
  serializeRecords,
  sortForDisplay,
} from './records.js';
import { initialState, startGame, submitGuess, updateSettings } from './state.js';
import type { GameRecord } from './types.js';

const rec = (
  attempts: number,
  timeMs: number,
  length = 4,
  base: GameRecord['base'] = 10,
): GameRecord => ({
  length,
  base,
  attempts,
  timeMs,
  finishedAt: 0,
});

describe('records', () => {
  it('сортирует по числу попыток, при равенстве — по времени', () => {
    const list = [rec(5, 1000), rec(3, 9000), rec(3, 4000)].reduce(
      (acc, r) => addRecord(acc, r),
      [] as readonly GameRecord[],
    );
    expect(sortForDisplay(list).map((r) => [r.attempts, r.timeMs])).toEqual([
      [3, 4000],
      [3, 9000],
      [5, 1000],
    ]);
  });

  it('хранит топ-N отдельно на каждую комбинацию length/base', () => {
    const start = [rec(9, 1, 4, 10), rec(8, 1, 4, 10), rec(7, 1, 2, 2)];
    const next = addRecord(start, rec(1, 1, 4, 10), 2);
    expect(
      next
        .filter((r) => r.base === 10)
        .map((r) => r.attempts)
        .sort(),
    ).toEqual([1, 8]);
    expect(next.filter((r) => r.base === 2)).toHaveLength(1);
  });

  it('не мутирует исходный список', () => {
    const start: readonly GameRecord[] = [rec(5, 1)];
    addRecord(start, rec(1, 1));
    expect(start).toHaveLength(1);
  });

  it('рекорд из выигранной игры', () => {
    const s0 = startGame(updateSettings(initialState(), { length: 2, base: 10 }), '12', 1000);
    const won = submitGuess(submitGuess(s0, '34', 1500), '12', 2500);
    expect(recordFromState(won)).toMatchObject({ length: 2, base: 10, attempts: 2, timeMs: 1500 });
  });

  it('сериализация переживает круг, мусор даёт пустой список', () => {
    const list = [rec(3, 100)];
    expect(parseRecords(serializeRecords(list))).toEqual(list);
    expect(parseRecords(null)).toEqual([]);
    expect(parseRecords('{oops')).toEqual([]);
    expect(parseRecords('[{"x":1}]')).toEqual([]);
  });
});
