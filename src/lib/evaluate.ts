const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

export function isColorHit(value: 'red' | 'black', n: number): boolean {
  if (n === 0) return false;
  return (RED_NUMBERS.includes(n) ? 'red' : 'black') === value;
}

export function isParityHit(value: 'even' | 'odd', n: number): boolean {
  if (n === 0) return false;
  return (n % 2 === 0 ? 'even' : 'odd') === value;
}

export function isRangeHit(value: 'low' | 'high', n: number): boolean {
  if (n === 0) return false;
  return value === 'low' ? n >= 1 && n <= 18 : n >= 19 && n <= 36;
}

export function isDozenHit(value: 'first' | 'second' | 'third', n: number): boolean {
  if (n === 0) return false;
  if (value === 'first') return n >= 1 && n <= 12;
  if (value === 'second') return n >= 13 && n <= 24;
  return n >= 25 && n <= 36;
}

export function isColumnHit(col: number, n: number): boolean {
  if (n === 0) return false;
  return ((n - col) % 3 + 3) % 3 === 0;
}

export function isNumberHit(target: number, n: number): boolean {
  return n === target;
}

export function getNeighbors(base: number, count: number): number[] {
  const idx = WHEEL_ORDER.indexOf(base);
  if (idx === -1) return [];
  const out: number[] = [];
  for (let i = -count; i <= count; i++) {
    const pos = (idx + i + WHEEL_ORDER.length) % WHEEL_ORDER.length;
    if (!out.includes(WHEEL_ORDER[pos])) out.push(WHEEL_ORDER[pos]);
  }
  return out;
}

export function isNumberSetHit(numbers: number[], n: number): boolean {
  return numbers.includes(n);
}

export function isTargetNumbersHit(
  value: { base: number[]; targets: number[] },
  n: number,
  isBasePhase: boolean
): boolean {
  return isBasePhase ? value.base.includes(n) : value.targets.includes(n);
}
