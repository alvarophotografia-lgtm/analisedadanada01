import { useState, useCallback, useEffect } from 'react';
import { Strategy, matchesStrategyValue } from '@/types/strategy';

export const useStrategyMonitor = (results: number[]) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  const addStrategy = useCallback((strategy: Omit<Strategy, 'id' | 'hits' | 'misses' | 'currentProgress' | 'isActive' | 'history' | 'currentStreak' | 'longestWinStreak' | 'longestLossStreak' | 'currentConsecutiveHits' | 'consecutiveHitStreaks'>) => {
    const newStrategy: Strategy = {
      ...strategy,
      id: Date.now().toString(),
      hits: 0,
      misses: 0,
      currentProgress: 0,
      isActive: true,
      history: [],
      currentStreak: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      currentConsecutiveHits: strategy.type === 'number-set' ? 0 : undefined,
      consecutiveHitStreaks: strategy.type === 'number-set' ? {} : undefined,
    };
    setStrategies(prev => [...prev, newStrategy]);
    return newStrategy.id;
  }, []);

  const removeStrategy = useCallback((id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
  }, []);

  const toggleStrategy = useCallback((id: string) => {
    setStrategies(prev => prev.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  }, []);

  const resetStrategy = useCallback((id: string) => {
    setStrategies(prev => prev.map(s => 
      s.id === id ? { 
        ...s, 
        hits: 0, 
        misses: 0, 
        currentProgress: 0, 
        history: [], 
        currentStreak: 0,
        longestWinStreak: 0,
        longestLossStreak: 0,
        currentConsecutiveHits: s.type === 'number-set' ? 0 : undefined,
        consecutiveHitStreaks: s.type === 'number-set' ? {} : undefined,
      } : s
    ));
  }, []);

  // Atualiza estratégias baseado nos resultados
  useEffect(() => {
    if (results.length === 0) return;

    const latestNumber = results[0];

    setStrategies(prev => prev.map(strategy => {
      if (!strategy.isActive) return strategy;

      // Lógica especial para estratégias de conjunto de números
      if (strategy.type === 'number-set' && strategy.sequence.length === 1 && strategy.sequence[0].type === 'number-set') {
        const numberSet = strategy.sequence[0].value as number[];
        const isInSet = numberSet.includes(latestNumber);
        
        if (isInSet) {
          const newConsecutiveHits = (strategy.currentConsecutiveHits || 0) + 1;
          
          // Só conta como acerto a partir do segundo número consecutivo
          if (newConsecutiveHits > 1) {
            const newHistory = [...strategy.history, { spin: latestNumber, result: 'hit' as const }];
            const newStreak = strategy.currentStreak >= 0 ? strategy.currentStreak + 1 : 1;
            
            return {
              ...strategy,
              hits: strategy.hits + 1,
              currentConsecutiveHits: newConsecutiveHits,
              history: newHistory,
              currentStreak: newStreak,
              longestWinStreak: Math.max(strategy.longestWinStreak, newStreak),
            };
          } else {
            // Primeiro número do conjunto - apenas inicia a contagem (base)
            return {
              ...strategy,
              currentConsecutiveHits: 1,
            };
          }
        } else {
          // Número não está no conjunto
          if (strategy.currentConsecutiveHits === 0) {
            // Não estava contando, ignora
            return strategy;
          }
          
          if (strategy.currentConsecutiveHits === 1) {
            // Estava apenas na base, não conta erro, apenas reseta
            return {
              ...strategy,
              currentConsecutiveHits: 0,
            };
          }
          
          // Se tinha 2+ acertos consecutivos, marca erro e registra o streak
          const previousConsecutiveHits = strategy.currentConsecutiveHits;
          let newConsecutiveHitStreaks = { ...strategy.consecutiveHitStreaks };
          
          if (previousConsecutiveHits >= 2) {
            newConsecutiveHitStreaks = {
              ...newConsecutiveHitStreaks,
              [previousConsecutiveHits]: (newConsecutiveHitStreaks[previousConsecutiveHits] || 0) + 1,
            };
          }
          
          const newHistory = [...strategy.history, { spin: latestNumber, result: 'miss' as const }];
          const newStreak = strategy.currentStreak <= 0 ? strategy.currentStreak - 1 : -1;
          
          return {
            ...strategy,
            misses: strategy.misses + 1,
            currentConsecutiveHits: 0,
            consecutiveHitStreaks: newConsecutiveHitStreaks,
            history: newHistory,
            currentStreak: newStreak,
            longestLossStreak: Math.max(strategy.longestLossStreak, Math.abs(newStreak)),
          };
        }
      }

      // Lógica original para outras estratégias
      const sequenceLength = strategy.sequence.length;
      const expectedValue = strategy.sequence[strategy.currentProgress];

      // Verifica se o número atual corresponde à posição esperada da estratégia
      const matches = matchesStrategyValue(latestNumber, expectedValue);

      if (matches) {
        const newProgress = strategy.currentProgress + 1;

        // Se completou a sequência
        if (newProgress === sequenceLength) {
          // Acerto! Agora verifica se o mesmo número inicia um novo padrão
          const startsNew = matchesStrategyValue(latestNumber, strategy.sequence[0]);
          const newHistory = [...strategy.history, { spin: latestNumber, result: 'hit' as const }];
          const newStreak = strategy.currentStreak >= 0 ? strategy.currentStreak + 1 : 1;
          
          return {
            ...strategy,
            hits: strategy.hits + 1,
            currentProgress: startsNew ? 1 : 0,
            history: newHistory,
            currentStreak: newStreak,
            longestWinStreak: Math.max(strategy.longestWinStreak, newStreak),
          };
        }

        // Continua progredindo na sequência
        const newHistory = [...strategy.history, { spin: latestNumber, result: 'progress' as const }];
        return {
          ...strategy,
          currentProgress: newProgress,
          history: newHistory,
        };
      } else {
        // Não corresponde
        // Se estava no último elemento da sequência, conta como erro
        if (strategy.currentProgress === sequenceLength - 1) {
          // Erro no último! Verifica se o número atual inicia um novo padrão
          const startsNew = matchesStrategyValue(latestNumber, strategy.sequence[0]);
          const newHistory = [...strategy.history, { spin: latestNumber, result: 'miss' as const }];
          const newStreak = strategy.currentStreak <= 0 ? strategy.currentStreak - 1 : -1;
          
          return {
            ...strategy,
            misses: strategy.misses + 1,
            currentProgress: startsNew ? 1 : 0,
            history: newHistory,
            currentStreak: newStreak,
            longestLossStreak: Math.max(strategy.longestLossStreak, Math.abs(newStreak)),
          };
        }

        // Se erro antes do último elemento, apenas reseta sem contar erro
        // Mas verifica se o número atual inicia um novo padrão
        const startsNew = matchesStrategyValue(latestNumber, strategy.sequence[0]);
        return {
          ...strategy,
          currentProgress: startsNew ? 1 : 0,
        };
      }
    }));
  }, [results]);

  return {
    strategies,
    addStrategy,
    removeStrategy,
    toggleStrategy,
    resetStrategy,
  };
};
