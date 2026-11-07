/** Поддерживаемые системы счисления: bin / oct / dec / hex. */
export type Base = 2 | 8 | 10 | 16;

export type RandomSource = () => number;

export type Evaluation = {
  readonly bulls: number;
  readonly cows: number;
};

export type Attempt = Evaluation & {
  readonly guess: string;
};

export type Settings = {
  readonly length: number;
  readonly base: Base;
};

export type GameStatus = 'settings' | 'playing' | 'won';

export type GameState = {
  readonly status: GameStatus;
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly Attempt[];
  readonly startedAt: number;
  readonly finishedAt: number | null;
};

export type GameRecord = {
  readonly length: number;
  readonly base: Base;
  readonly attempts: number;
  readonly timeMs: number;
  readonly finishedAt: number;
};
