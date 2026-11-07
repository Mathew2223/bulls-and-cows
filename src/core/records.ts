import { BASES } from './state.js';
import type { Base, GameRecord, GameState } from './types.js';

export const RECORDS_LIMIT = 10;

const isBase = (value: unknown): value is Base => BASES.some((base) => base === value);

export const compareRecords = (a: GameRecord, b: GameRecord): number =>
  a.attempts - b.attempts || a.timeMs - b.timeMs;

const sameMode = (a: GameRecord, b: GameRecord): boolean =>
  a.length === b.length && a.base === b.base;

export const recordFromState = (state: GameState): GameRecord => ({
  length: state.settings.length,
  base: state.settings.base,
  attempts: state.history.length,
  timeMs: (state.finishedAt ?? state.startedAt) - state.startedAt,
  finishedAt: state.finishedAt ?? state.startedAt,
});

/** Отдельный топ-N на каждую комбинацию length/base. */
export const addRecord = (
  records: readonly GameRecord[],
  record: GameRecord,
  limit: number = RECORDS_LIMIT,
): readonly GameRecord[] => {
  const sameModeTop = [...records, record]
    .filter((item) => sameMode(item, record))
    .sort(compareRecords)
    .slice(0, limit);
  return [...records.filter((item) => !sameMode(item, record)), ...sameModeTop];
};

/** Порядок показа: по системе, длине, затем по результату. */
export const sortForDisplay = (records: readonly GameRecord[]): readonly GameRecord[] =>
  [...records].sort((a, b) => a.base - b.base || a.length - b.length || compareRecords(a, b));

const isRecord = (value: unknown): value is GameRecord => {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    isBase(r.base) &&
    typeof r.length === 'number' &&
    typeof r.attempts === 'number' &&
    typeof r.timeMs === 'number' &&
    typeof r.finishedAt === 'number'
  );
};

export const serializeRecords = (records: readonly GameRecord[]): string => JSON.stringify(records);

/** Безопасный разбор: битый JSON или чужие данные дают пустой список. */
export const parseRecords = (raw: string | null): readonly GameRecord[] => {
  if (raw === null) return [];
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isRecord) : [];
  } catch {
    return [];
  }
};
