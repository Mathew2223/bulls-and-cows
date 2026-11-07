import { parseRecords, serializeRecords } from '../core/records.js';
import type { GameRecord } from '../core/types.js';

const STORAGE_KEY = 'bulls-and-cows:records';

export const loadRecords = (): readonly GameRecord[] => {
  try {
    return parseRecords(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
};

export const saveRecords = (records: readonly GameRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, serializeRecords(records));
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — игра продолжает работать без рекордов
  }
};
