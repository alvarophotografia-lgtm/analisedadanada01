import { useCallback, useEffect, useRef } from 'react';
import { Strategy, matchesStrategyValue } from '@/types/strategy';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from './use-toast';

export const useStrategyMonitor = (results: number[]) => {
  const [strategies, setStrategies] = useLocalStorage<Strategy[]>('roulette-strategies', []);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVKzn77BdGAg+ltrzxnYpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSh+zfDajjkJF2e+7eidTAwPU6vm8LFdGAg+ltrzxnYpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSh+zfDajjkJF2e+7eidTAwPU6vm8LFdGAg+ltrzxnYpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSh+zfDajjkJF2e+7eidTAwPU6vm8LFdGAg+ltrzxnYpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSh+zfDajjkJF2e+7eidTAwPU6vm8LFdGAg+ltrzxnYpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSh+zfDajjkJF2e+7eidTAwPU6vm8LFdGAg+ltrzxnYpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBQ==');
  }, []);

  const addStrategy = useCallback((strategy: Omit<Strategy, 'id' | 'hits' | 'misses' | 'currentProgress' | 'isActive' | 'history' | 'currentStreak' | 'longestWinStreak' | 'longestLossStreak' | 'currentConsecutiveHits' | 'consecutiveHitStreaks' | 'isPriority'>) => {
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
      currentConsecutiveHits: (strategy.type === 'number-set' || strategy.type === 'target-numbers') ? 0 : undefined,
      consecutiveHitStreaks: (strategy.type === 'number-set' || strategy.type === 'target-numbers') ? {} : undefined,
      isPriority: false,
    };
    
    // Processar resultados históricos para a nova estratégia
    if (results.length > 0) {
      let processedStrategy = { ...newStrategy };
      
      // Processar resultados do mais antigo para o mais recente
      for (let i = results.length - 1; i >= 0; i--) {
        const num = results[i];
        processedStrategy = processStrategyUpdate(processedStrategy, num);
      }
      
      setStrategies(prev => [...prev, processedStrategy]);
      return processedStrategy.id;
    }
    
    setStrategies(prev => [...prev, newStrategy]);
    return newStrategy.id;
  }, [results]);
  
  const processStrategyUpdate = (strategy: Strategy, latestNumber: number): Strategy => {
    if (!strategy.isActive) return strategy;

    // Lógica para estratégia de números alvo
    if (strategy.type === 'target-numbers' && strategy.sequence.length === 1 && strategy.sequence[0].type === 'target-numbers') {
      const { base, targets } = strategy.sequence[0].value as { base: number[]; targets: number[] };
      const isBase = base.includes(latestNumber);
      const isTarget = targets.includes(latestNumber);
      
      // Se for um número base, marca que estamos esperando um alvo
      if (isBase) {
        return {
          ...strategy,
          currentConsecutiveHits: 1, // Marca que temos uma base ativa
        };
      }
      
      // Se estávamos esperando um alvo (temos uma base ativa)
      if (strategy.currentConsecutiveHits === 1) {
        if (isTarget) {
          // Acerto! Base seguida de alvo
          const newHistory = [...strategy.history, { spin: latestNumber, result: 'hit' as const }];
          const newStreak = strategy.currentStreak >= 0 ? strategy.currentStreak + 1 : 1;
          const shouldPrioritize = strategy.alertOnWinStreak && newStreak >= strategy.alertOnWinStreak;
          const wasPriorityByLoss = strategy.isPriority && strategy.alertOnLossStreak;
          
          // Se o número é TAMBÉM uma base, mantém ativo para próxima análise
          const isAlsoBase = base.includes(latestNumber);
          
          return {
            ...strategy,
            hits: strategy.hits + 1,
            currentConsecutiveHits: isAlsoBase ? 1 : 0, // Mantém base ativa se for base E alvo
            history: newHistory,
            currentStreak: newStreak,
            longestWinStreak: Math.max(strategy.longestWinStreak, newStreak),
            isPriority: wasPriorityByLoss ? false : shouldPrioritize,
          };
        } else {
          // Erro - esperava alvo mas veio outro número
          const newHistory = [...strategy.history, { spin: latestNumber, result: 'miss' as const }];
          const newStreak = strategy.currentStreak <= 0 ? strategy.currentStreak - 1 : -1;
          const shouldPrioritize = strategy.alertOnLossStreak && Math.abs(newStreak) >= strategy.alertOnLossStreak;
          
          // Se o número que falhou é uma base, mantém como base ativa
          const isNewBase = base.includes(latestNumber);
          
          return {
            ...strategy,
            misses: strategy.misses + 1,
            currentConsecutiveHits: isNewBase ? 1 : 0, // Mantém base ativa se for base
            history: newHistory,
            currentStreak: newStreak,
            longestLossStreak: Math.max(strategy.longestLossStreak, Math.abs(newStreak)),
            isPriority: shouldPrioritize,
          };
        }
      }
      
      // Se não temos base ativa e não é uma base, ignora
      return strategy;
    }

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
          const shouldPrioritize = strategy.alertOnWinStreak && newStreak >= strategy.alertOnWinStreak;
          const wasPriorityByLoss = strategy.isPriority && strategy.alertOnLossStreak;
          
          return {
            ...strategy,
            hits: strategy.hits + 1,
            currentConsecutiveHits: newConsecutiveHits,
            history: newHistory,
            currentStreak: newStreak,
            longestWinStreak: Math.max(strategy.longestWinStreak, newStreak),
            isPriority: wasPriorityByLoss ? false : shouldPrioritize,
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
          return strategy;
        }
        
        if (strategy.currentConsecutiveHits === 1) {
          // Estava na base e quebrou - conta como erro
          const newHistory = [...strategy.history, { spin: latestNumber, result: 'miss' as const }];
          const newStreak = strategy.currentStreak <= 0 ? strategy.currentStreak - 1 : -1;
          const shouldPrioritize = strategy.alertOnLossStreak && Math.abs(newStreak) >= strategy.alertOnLossStreak;
          
          return {
            ...strategy,
            misses: strategy.misses + 1,
            currentConsecutiveHits: 0,
            history: newHistory,
            currentStreak: newStreak,
            longestLossStreak: Math.max(strategy.longestLossStreak, Math.abs(newStreak)),
            isPriority: shouldPrioritize,
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
        const shouldPrioritize = strategy.alertOnLossStreak && Math.abs(newStreak) >= strategy.alertOnLossStreak;
        
        return {
          ...strategy,
          misses: strategy.misses + 1,
          currentConsecutiveHits: 0,
          consecutiveHitStreaks: newConsecutiveHitStreaks,
          history: newHistory,
          currentStreak: newStreak,
          longestLossStreak: Math.max(strategy.longestLossStreak, Math.abs(newStreak)),
          isPriority: shouldPrioritize,
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
        const shouldPrioritize = strategy.alertOnWinStreak && newStreak >= strategy.alertOnWinStreak;
        const wasPriorityByLoss = strategy.isPriority && strategy.alertOnLossStreak;
        
        return {
          ...strategy,
          hits: strategy.hits + 1,
          currentProgress: startsNew ? 1 : 0,
          history: newHistory,
          currentStreak: newStreak,
          longestWinStreak: Math.max(strategy.longestWinStreak, newStreak),
          isPriority: wasPriorityByLoss ? false : shouldPrioritize,
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
        const shouldPrioritize = strategy.alertOnLossStreak && Math.abs(newStreak) >= strategy.alertOnLossStreak;
        
        return {
          ...strategy,
          misses: strategy.misses + 1,
          currentProgress: startsNew ? 1 : 0,
          history: newHistory,
          currentStreak: newStreak,
          longestLossStreak: Math.max(strategy.longestLossStreak, Math.abs(newStreak)),
          isPriority: shouldPrioritize,
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
  };

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
        currentConsecutiveHits: (s.type === 'number-set' || s.type === 'target-numbers') ? 0 : undefined,
        consecutiveHitStreaks: (s.type === 'number-set' || s.type === 'target-numbers') ? {} : undefined,
        isPriority: false,
      } : s
    ));
  }, []);

  const updateAlerts = useCallback((id: string, alertOnWinStreak?: number, alertOnLossStreak?: number) => {
    setStrategies(prev => prev.map(s => 
      s.id === id ? { 
        ...s, 
        alertOnWinStreak,
        alertOnLossStreak,
        isPriority: false, // Reset priority quando mudar alertas
      } : s
    ));
  }, []);

  // Atualiza estratégias baseado nos resultados
  useEffect(() => {
    if (results.length === 0) return;

    const latestNumber = results[0];

    setStrategies(prev => {
      const updated = prev.map(strategy => processStrategyUpdate(strategy, latestNumber));

      // Ordenar: estratégias prioritárias primeiro, depois ativas, depois inativas
      return updated.sort((a, b) => {
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return 0;
      });
    });
  }, [results]);

  return {
    strategies,
    addStrategy,
    removeStrategy,
    toggleStrategy,
    resetStrategy,
    updateAlerts,
  };
};
