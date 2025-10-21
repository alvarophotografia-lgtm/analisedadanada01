import { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface HotColdNumbersProps {
  results: number[];
}

export const HotColdNumbers = memo(({ results }: HotColdNumbersProps) => {
  const analysis = useMemo(() => {
    const frequency: Record<number, number> = {};
    
    results.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });

    const sorted = Object.entries(frequency)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count);

    return {
      hot: sorted.slice(0, 5),
      cold: sorted.slice(-5).reverse()
    };
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="glass-card rounded-xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-4">🔥 Números Quentes</h3>
          <p className="text-gray-400 text-sm">Aguardando resultados...</p>
        </div>
        <div className="glass-card rounded-xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-4">❄️ Números Frios</h3>
          <p className="text-gray-400 text-sm">Aguardando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Hot Numbers */}
      <div className="glass-card rounded-xl p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-4">🔥 Números Quentes</h3>
        <div className="space-y-2">
          {analysis.hot.map(({ num, count }, idx) => (
            <div key={num} className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-400">#{idx + 1}</span>
                <Badge className="bg-red-500 text-white text-lg font-bold px-3 py-1">
                  {num}
                </Badge>
              </div>
              <span className="text-gray-300 font-medium">{count}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cold Numbers */}
      <div className="glass-card rounded-xl p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-4">❄️ Números Frios</h3>
        <div className="space-y-2">
          {analysis.cold.map(({ num, count }, idx) => (
            <div key={num} className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-400">#{idx + 1}</span>
                <Badge className="bg-blue-500 text-white text-lg font-bold px-3 py-1">
                  {num}
                </Badge>
              </div>
              <span className="text-gray-300 font-medium">{count}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

HotColdNumbers.displayName = 'HotColdNumbers';
