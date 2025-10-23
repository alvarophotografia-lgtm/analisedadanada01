export type StrategyType = 'color' | 'parity' | 'range' | 'dozen' | 'column' | 'number' | 'number-set' | 'target-numbers';

export type ColorValue = 'red' | 'black' | 'green';
export type ParityValue = 'even' | 'odd';
export type RangeValue = 'low' | 'high'; // 1-18 / 19-36
export type DozenValue = 'first' | 'second' | 'third'; // 1-12, 13-24, 25-36
export type ColumnValue = 'first' | 'second' | 'third';

export interface Strategy {
  id: string;
  name?: string;
  type: StrategyType;
  sequence: StrategyValue[];
  hits: number;
  misses: number;
  currentProgress: number;
  isActive: boolean;
  history: Array<{ spin: number; result: 'hit' | 'miss' | 'progress' }>;
  currentStreak: number; // sequência atual de acertos (positivo) ou erros (negativo)
  longestWinStreak: number;
  longestLossStreak: number;
  // Para estratégias de conjunto de números
  currentConsecutiveHits?: number; // acertos consecutivos atuais
  consecutiveHitStreaks?: { [key: number]: number }; // conta quantas vezes teve 2, 3, 4... acertos consecutivos
  // Configurações de alerta/prioridade
  alertOnWinStreak?: number; // avisar após X acertos consecutivos (0 = desabilitado)
  alertOnLossStreak?: number; // avisar após X erros consecutivos (0 = desabilitado)
  isPriority?: boolean; // indica se a estratégia está em prioridade no momento
}

export type StrategyValue = 
  | { type: 'color'; value: ColorValue }
  | { type: 'parity'; value: ParityValue }
  | { type: 'range'; value: RangeValue }
  | { type: 'dozen'; value: DozenValue }
  | { type: 'column'; value: ColumnValue }
  | { type: 'number'; value: number }
  | { type: 'number-set'; value: number[] }
  | { type: 'target-numbers'; value: { base: number[]; targets: number[] } };

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const getNumberColor = (num: number): ColorValue => {
  if (num === 0) return 'green';
  if (RED_NUMBERS.includes(num)) return 'red';
  return 'black';
};

export const getNumberParity = (num: number): ParityValue | null => {
  if (num === 0) return null;
  return num % 2 === 0 ? 'even' : 'odd';
};

export const getNumberRange = (num: number): RangeValue | null => {
  if (num === 0) return null;
  return num <= 18 ? 'low' : 'high';
};

export const getNumberDozen = (num: number): DozenValue | null => {
  if (num === 0) return null;
  if (num <= 12) return 'first';
  if (num <= 24) return 'second';
  return 'third';
};

export const getNumberColumn = (num: number): ColumnValue | null => {
  if (num === 0) return null;
  if (num % 3 === 1) return 'first';
  if (num % 3 === 2) return 'second';
  return 'third';
};

export const matchesStrategyValue = (num: number, value: StrategyValue): boolean => {
  switch (value.type) {
    case 'color':
      return getNumberColor(num) === value.value;
    case 'parity':
      return getNumberParity(num) === value.value;
    case 'range':
      return getNumberRange(num) === value.value;
    case 'dozen':
      return getNumberDozen(num) === value.value;
    case 'column':
      return getNumberColumn(num) === value.value;
    case 'number':
      return num === value.value;
    case 'number-set':
      return value.value.includes(num);
    case 'target-numbers':
      // Para target-numbers, verificamos se o número está na lista base
      return value.value.base.includes(num);
    default:
      return false;
  }
};
