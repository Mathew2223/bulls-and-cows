import { countPossibleSecrets } from '../core/combinatorics.js';
import { createDigitValidator } from '../core/digits.js';
import { addRecord, recordFromState, sortForDisplay } from '../core/records.js';
import { generateSecret } from '../core/secret.js';
import {
  BASES,
  BASE_NAMES,
  LENGTHS,
  availableLengths,
  checkGuess,
  elapsedMs,
  initialState,
  newGame,
  startGame,
  submitGuess,
  updateSettings,
  type GuessCheck,
} from '../core/state.js';
import type { Base, GameRecord, GameState } from '../core/types.js';
import { h } from './dom.js';
import { loadRecords, saveRecords } from './storage.js';

// ---- состояние UI (единственное место с изменяемыми переменными; ядро остаётся чистым) ----
let state: GameState = initialState();
let records: readonly GameRecord[] = loadRecords();
let draft = '';
let message = '';
let timerId: number | undefined;

const app = h('main', { class: 'app' });
document.body.append(app);

const formatTime = (ms: number): string => `${(ms / 1000).toFixed(1)} с`;

const MESSAGES: Readonly<
  Record<Exclude<GuessCheck, 'ok' | 'finished'>, (state: GameState) => string>
> = {
  invalid: ({ settings }) => `Нужно ${settings.length} разных цифр (${BASE_NAMES[settings.base]})`,
  repeat: () => 'Такая попытка уже была — введите другую',
};

// ---- действия ----
const chooseBase = (base: Base): void => {
  state = updateSettings(state, { ...state.settings, base });
  render();
};

const chooseLength = (length: number): void => {
  state = updateSettings(state, { ...state.settings, length });
  render();
};

const start = (): void => {
  const { length, base } = state.settings;
  state = startGame(state, generateSecret(length, base), Date.now());
  draft = '';
  message = '';
  render();
};

const restart = (): void => {
  state = newGame(state);
  draft = '';
  message = '';
  render();
};

const submit = (): void => {
  const check = checkGuess(state, draft);
  if (check === 'invalid' || check === 'repeat') {
    message = MESSAGES[check](state);
    render();
    return;
  }
  if (check === 'finished') return;

  state = submitGuess(state, draft, Date.now());
  draft = '';
  message = '';
  if (state.status === 'won') {
    records = addRecord(records, recordFromState(state));
    saveRecords(records);
  }
  render();
};

// ---- вью ----
const optionButton = (label: string, selected: boolean, disabled: boolean, onClick: () => void) =>
  h(
    'button',
    {
      type: 'button',
      class: selected ? 'option selected' : 'option',
      'aria-pressed': String(selected),
      disabled,
      onclick: onClick,
    },
    label,
  );

const settingsView = (): HTMLElement => {
  const locked = state.status !== 'settings';
  const { length, base } = state.settings;
  const lengths = availableLengths(base);

  return h(
    'section',
    { class: 'panel' },
    h('h2', {}, 'Настройки'),
    h(
      'div',
      { class: 'row' },
      h('span', { class: 'label' }, 'Система счисления'),
      ...BASES.map((b) => optionButton(BASE_NAMES[b], b === base, locked, () => chooseBase(b))),
    ),
    h(
      'div',
      { class: 'row' },
      h('span', { class: 'label' }, 'Длина числа'),
      ...LENGTHS.map((l) =>
        optionButton(String(l), l === length, locked || !lengths.includes(l), () =>
          chooseLength(l),
        ),
      ),
    ),
    h(
      'p',
      { class: 'hint' },
      `Возможных секретных чисел: ${countPossibleSecrets(length, base).toLocaleString('ru-RU')}`,
    ),
    locked
      ? h('button', { type: 'button', class: 'secondary', onclick: restart }, 'Новая игра')
      : h('button', { type: 'button', class: 'primary', onclick: start }, 'Начать игру'),
  );
};

const historyView = (): HTMLElement =>
  h(
    'ol',
    { class: 'history', 'aria-label': 'История попыток' },
    ...state.history.map((attempt) =>
      h(
        'li',
        {},
        h('span', { class: 'guess' }, attempt.guess.toUpperCase()),
        h('span', { class: 'bulls' }, `Быки: ${attempt.bulls}`),
        h('span', { class: 'cows' }, `Коровы: ${attempt.cows}`),
      ),
    ),
  );

let timerEl: HTMLElement | null = null;

const gameView = (): HTMLElement => {
  const { length, base } = state.settings;
  const isValidChar = createDigitValidator(base);
  const won = state.status === 'won';

  const input = h('input', {
    type: 'text',
    id: 'guess',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    maxlength: String(length),
    placeholder: '0'.repeat(length),
    value: draft,
    disabled: won,
    oninput: (event) => {
      const field = event.target as HTMLInputElement;
      draft = [...field.value].filter(isValidChar).slice(0, length).join('');
      field.value = draft;
    },
    onkeydown: (event) => {
      if ((event as KeyboardEvent).key === 'Enter') submit();
    },
  }) as HTMLInputElement;

  timerEl = h('span', { class: 'time' }, formatTime(elapsedMs(state, Date.now())));

  return h(
    'section',
    { class: 'panel' },
    h('h2', {}, 'Угадайте число'),
    h('div', { class: 'status' }, 'Время: ', timerEl, ` · Попыток: ${state.history.length}`),
    h(
      'div',
      { class: 'row' },
      input,
      h(
        'button',
        { type: 'button', class: 'primary', disabled: won, onclick: submit },
        'Проверить',
      ),
    ),
    h('p', { class: 'error', role: 'alert' }, message),
    won
      ? h(
          'p',
          { class: 'win' },
          `Победа! Секрет ${state.secret.toUpperCase()}. Попыток: ${state.history.length}, время: ${formatTime(elapsedMs(state, 0))}`,
        )
      : h(
          'p',
          { class: 'hint' },
          `Допустимые символы: ${base === 16 ? '0–9, A–F' : `0–${base - 1}`}, без повторов`,
        ),
    historyView(),
  );
};

const recordsView = (): HTMLElement => {
  const rows = sortForDisplay(records);
  return h(
    'section',
    { class: 'panel' },
    h('h2', {}, 'Таблица рекордов'),
    rows.length === 0
      ? h('p', { class: 'hint' }, 'Пока пусто — выиграйте первую игру!')
      : h(
          'ol',
          { class: 'records' },
          ...rows.map((r) =>
            h(
              'li',
              {},
              h('span', { class: 'badge' }, `${r.length} · ${BASE_NAMES[r.base]}`),
              h('span', {}, `${r.attempts} попыт.`),
              h('span', {}, formatTime(r.timeMs)),
            ),
          ),
        ),
  );
};

function render(): void {
  window.clearInterval(timerId);
  timerEl = null;

  app.replaceChildren(
    h('h1', {}, 'Bulls and Cows'),
    settingsView(),
    ...(state.status === 'settings' ? [] : [gameView()]),
    recordsView(),
  );

  if (state.status === 'playing') {
    document.getElementById('guess')?.focus();
    timerId = window.setInterval(() => {
      if (timerEl) timerEl.textContent = formatTime(elapsedMs(state, Date.now()));
    }, 200);
  }
}

render();
