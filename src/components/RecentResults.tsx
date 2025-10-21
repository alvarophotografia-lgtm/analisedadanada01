import { memo } from 'react';
import { Badge } from '@/components/ui/badge';

interface RecentResultsProps {
  results: number[];
  maxDisplay?: number;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const getNumberColor = (num: number) => {
  if (num === 0) return 'bg-green-500 text-white';
  if (RED_NUMBERS.includes(num)) return 'bg-red-500 text-white';
  return 'bg-gray-900 text-white';
};

export const RecentResults = memo(({ results, maxDisplay = 20 }: RecentResultsProps) => {
  const displayResults = results.slice(0, maxDisplay);

  return (
    <div className="glass-card rounded-xl p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-bold">📋 Últimos Resultados</h3>
        <span className="text-sm text-gray-400">Total: {results.length}</span>
      </div>
      
      {displayResults.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Nenhum resultado ainda
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displayResults.map((num, idx) => (
            <Badge
              key={idx}
              className={`
                ${getNumberColor(num)}
                text-lg font-bold px-3 py-1.5
                animate-slide-in
                hover:scale-110 transition-transform
              `}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {num}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});

RecentResults.displayName = 'RecentResults';
