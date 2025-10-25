import { Strategy } from '@/types/strategy';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StrategyStreaksProps {
  strategies: Strategy[];
}

export const StrategyStreaks = ({ strategies }: StrategyStreaksProps) => {
  if (strategies.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold mb-2">Nenhuma Estratégia Ativa</h3>
        <p className="text-gray-400">
          Crie uma estratégia para ver análise de sequências
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">📈 Análise de Sequências</h3>
      <div className="space-y-4">
        {strategies.map((strategy) => {
          // Prepare data for the chart (last 20 events)
          const chartData = strategy.history
            .slice(-20)
            .reverse()
            .map((event, idx) => ({
              index: idx + 1,
              streak: event.streak,
              result: event.result,
            }));

          return (
            <Card key={strategy.id} className="p-4 bg-white/5 border-white/10">
              <h4 className="font-semibold mb-3">{strategy.name || 'Sem nome'}</h4>
              
              {chartData.length > 0 && (
                <div className="mb-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="index" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        labelFormatter={(value) => `Evento ${value}`}
                        formatter={(value: any, name: string) => {
                          if (name === 'streak') return [`Sequência: ${value}`, ''];
                          return [value, name];
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="streak" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    strategy.currentStreak > 0 ? 'text-green-400' : 
                    strategy.currentStreak < 0 ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {strategy.currentStreak > 0 ? '+' : ''}{strategy.currentStreak}
                  </div>
                  <div className="text-xs text-gray-400">Sequência Atual</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                    <TrendingUp className="w-5 h-5" />
                    {strategy.longestWinStreak}
                  </div>
                  <div className="text-xs text-gray-400">Maior Sequência de Acertos</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
                    <TrendingDown className="w-5 h-5" />
                    {strategy.longestLossStreak}
                  </div>
                  <div className="text-xs text-gray-400">Maior Sequência de Erros</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {strategy.history.length}
                  </div>
                  <div className="text-xs text-gray-400">Total de Eventos</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
