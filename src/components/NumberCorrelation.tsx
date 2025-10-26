import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NumberCorrelationProps {
  results: number[];
  compact?: boolean;
  maxDisplay?: number;
}

export const NumberCorrelation = ({ results, compact = false, maxDisplay = 10 }: NumberCorrelationProps) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const correlations = useMemo(() => {
    if (results.length < 2) return [];

    const correlationMap = new Map<number, Map<number, number>>();

    // Analisa os últimos 100 resultados ou todos se menos de 100
    const analysisResults = results.slice(0, Math.min(100, results.length));

    for (let i = 0; i < analysisResults.length - 1; i++) {
      const current = analysisResults[i];
      const next = analysisResults[i + 1];

      if (!correlationMap.has(next)) {
        correlationMap.set(next, new Map());
      }

      const nextMap = correlationMap.get(next)!;
      nextMap.set(current, (nextMap.get(current) || 0) + 1);
    }

    // Converte para array e ordena por frequência
    const correlationArray: Array<{
      number: number;
      followedBy: Array<{ num: number; count: number; percentage: number }>;
      totalOccurrences: number;
    }> = [];

    correlationMap.forEach((followedByMap, number) => {
      const totalOccurrences = Array.from(followedByMap.values()).reduce((a, b) => a + b, 0);
      const followedBy = Array.from(followedByMap.entries())
        .map(([num, count]) => ({
          num,
          count,
          percentage: (count / totalOccurrences) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // Top 3

      correlationArray.push({
        number,
        followedBy,
        totalOccurrences,
      });
    });

    return correlationArray
      .filter(c => c.totalOccurrences >= 2)
      .sort((a, b) => b.totalOccurrences - a.totalOccurrences)
      .slice(0, maxDisplay);
  }, [results, maxDisplay]);

  if (results.length < 2) {
    if (compact) return null;
    return (
      <div className="glass-card rounded-xl p-8 md:p-12 text-center">
        <div className="text-4xl md:text-6xl mb-4">🔗</div>
        <h3 className="text-xl md:text-2xl font-bold mb-2">Dados Insuficientes</h3>
        <p className="text-sm md:text-base text-gray-400">
          Adicione mais números para ver correlações
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base md:text-xl font-bold">🔗 Correlação de Números</h3>
          {!compact && (
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Números que frequentemente aparecem após outros números específicos
            </p>
          )}
        </div>
        {compact && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isExpanded ? 'Minimizar' : 'Ver Mais'}
          </Button>
        )}
      </div>
      
      {isExpanded && (
        <div className="space-y-3">
        {correlations.map((correlation) => (
          <Card key={correlation.number} className="p-4 bg-white/5 border-white/10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold">
                  {correlation.number}
                </div>
                <div>
                  <div className="text-sm font-semibold">Número {correlation.number}</div>
                  <div className="text-xs text-gray-400">
                    {correlation.totalOccurrences} ocorrências
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-2">Frequentemente seguido por:</div>
            <div className="flex gap-2 flex-wrap">
              {correlation.followedBy.map((follow) => (
                <div
                  key={follow.num}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20"
                >
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                    {follow.num}
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-green-400">
                      {follow.percentage.toFixed(0)}%
                    </span>
                    <span className="text-gray-500 ml-1">({follow.count}x)</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
};
