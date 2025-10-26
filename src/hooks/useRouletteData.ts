import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface RouletteStats {
  totalResults: number;
  redCount: number;
  blackCount: number;
  greenCount: number;
  evenCount: number;
  oddCount: number;
  lastNumber?: number;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const useRouletteData = () => {
  const [results, setResults] = useLocalStorage<number[]>('roulette-results', []);

  const addNumber = useCallback((num: number) => {
    if (!Number.isInteger(num) || num < 0 || num > 36) return;
    setResults(prev => [num, ...prev]);
  }, [setResults]);

  const addBatch = useCallback((nums: number[]) => {
    const filtered = nums.filter(n => Number.isInteger(n) && n >= 0 && n <= 36);
    if (filtered.length === 0) return;
    setResults(prev => [...filtered, ...prev]);
  }, [setResults]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const undoLast = useCallback(() => {
    setResults(prev => prev.slice(1));
  }, []);

  const stats: RouletteStats = useMemo(() => {
    const redCount = results.filter(n => RED_NUMBERS.includes(n)).length;
    const blackCount = results.filter(n => n !== 0 && !RED_NUMBERS.includes(n)).length;
    const greenCount = results.filter(n => n === 0).length;
    const evenCount = results.filter(n => n !== 0 && n % 2 === 0).length;
    const oddCount = results.filter(n => n !== 0 && n % 2 === 1).length;

    return {
      totalResults: results.length,
      redCount,
      blackCount,
      greenCount,
      evenCount,
      oddCount,
      lastNumber: results[0]
    };
  }, [results]);

  return {
    results,
    stats,
    addNumber,
    addBatch,
    clearResults,
    undoLast
  };
};
