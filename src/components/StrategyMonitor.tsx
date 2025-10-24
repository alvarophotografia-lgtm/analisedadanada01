import { useState } from 'react';
import { Strategy } from '@/types/strategy';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Trash2, RotateCcw, AlertTriangle, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StrategyMonitorProps {
  strategies: Strategy[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateAlerts: (id: string, alertOnWinStreak?: number, alertOnLossStreak?: number) => void;
}

const getValueLabel = (value: any): string => {
  if (!value) return '';
  
  switch (value.type) {
    case 'color':
      return value.value === 'red' ? '🔴' : value.value === 'black' ? '⚫' : '🟢';
    case 'parity':
      return value.value === 'even' ? 'Par' : 'Ímpar';
    case 'range':
      return value.value === 'low' ? 'Baixo' : 'Alto';
    case 'dozen':
      return value.value === 'first' ? '1ª' : value.value === 'second' ? '2ª' : '3ª';
    case 'column':
      return value.value === 'first' ? 'Col1' : value.value === 'second' ? 'Col2' : 'Col3';
    case 'number':
      return value.value.toString();
    case 'number-set':
      return `{${(value.value as number[]).join(', ')}}`;
    case 'target-numbers':
      const targets = value.value as { base: number[]; targets: number[] };
      return `Base:[${targets.base.join(',')}] → Alvo:[${targets.targets.join(',')}]`;
    default:
      return '';
  }
};

export const StrategyMonitor = ({ strategies, onToggle, onReset, onRemove, onUpdateAlerts }: StrategyMonitorProps) => {
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [tempAlertWins, setTempAlertWins] = useState<number>(0);
  const [tempAlertLosses, setTempAlertLosses] = useState<number>(0);
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedStrategies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const openAlertDialog = (strategy: Strategy) => {
    setEditingStrategyId(strategy.id);
    setTempAlertWins(strategy.alertOnWinStreak || 0);
    setTempAlertLosses(strategy.alertOnLossStreak || 0);
  };

  const saveAlerts = () => {
    if (editingStrategyId) {
      onUpdateAlerts(
        editingStrategyId,
        tempAlertWins > 0 ? tempAlertWins : undefined,
        tempAlertLosses > 0 ? tempAlertLosses : undefined
      );
      setEditingStrategyId(null);
    }
  };
  if (strategies.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold mb-2">Nenhuma Estratégia Ativa</h3>
        <p className="text-gray-400">
          Crie uma estratégia para começar a monitorar padrões
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {strategies.map((strategy) => {
        const progress = (strategy.currentProgress / strategy.sequence.length) * 100;
        const total = strategy.hits + strategy.misses;
        const winRate = total > 0 ? ((strategy.hits / total) * 100).toFixed(1) : '0.0';
        const isExpanded = expandedStrategies.has(strategy.id);

        // Prepara dados do gráfico (últimos 20 eventos de hit/miss apenas)
        const chartData = strategy.history
          .filter(event => event.result === 'hit' || event.result === 'miss')
          .slice(-20)
          .map((event, idx) => ({
            index: idx,
            value: event.result === 'hit' ? 1 : -1,
          }));

        return (
          <Collapsible
            key={strategy.id}
            open={isExpanded}
            onOpenChange={() => toggleExpanded(strategy.id)}
          >
            <div
              className={`glass-card rounded-xl p-3 sm:p-4 relative ${
                strategy.isPriority 
                  ? 'ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20 neon-glow' 
                  : strategy.isActive 
                  ? 'neon-glow' 
                  : 'opacity-60'
              }`}
            >
              {strategy.isPriority && (
                <div className="absolute -top-2 left-2 px-2 py-0.5 bg-yellow-500 text-black rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
                  <AlertTriangle className="w-3 h-3" />
                  PRIORIDADE
                </div>
              )}
              
              {/* Header - sempre visível */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <h4 className="text-sm sm:text-base font-bold truncate flex-1">{strategy.name || 'Sem nome'}</h4>
                  <Switch
                    checked={strategy.isActive}
                    onCheckedChange={() => onToggle(strategy.id)}
                    className="shrink-0"
                  />
                </div>
                
                <div className="flex gap-1 shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => openAlertDialog(strategy)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/10">
                      <DialogHeader>
                        <DialogTitle>⚡ Configurar Alertas de Prioridade</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="alert-wins">
                            Priorizar após <span className="text-green-400">acertos</span> consecutivos:
                          </Label>
                          <Input
                            id="alert-wins"
                            type="number"
                            min="0"
                            value={tempAlertWins}
                            onChange={(e) => setTempAlertWins(Number(e.target.value))}
                            placeholder="0 = desabilitado"
                            className="glass-card"
                          />
                          <p className="text-xs text-gray-500">Ex: 5 = alerta após 5 acertos seguidos</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="alert-losses">
                            Priorizar após <span className="text-red-400">erros</span> consecutivos:
                          </Label>
                          <Input
                            id="alert-losses"
                            type="number"
                            min="0"
                            value={tempAlertLosses}
                            onChange={(e) => setTempAlertLosses(Number(e.target.value))}
                            placeholder="0 = desabilitado"
                            className="glass-card"
                          />
                          <p className="text-xs text-gray-500">Ex: 5 = alerta após 5 erros seguidos</p>
                        </div>

                        <Button onClick={saveAlerts} className="w-full">
                          Salvar Alertas
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    onClick={() => onReset(strategy.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => onRemove(strategy.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Info minimizada - sempre visível */}
              {!isExpanded && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex gap-3">
                    <span className="text-green-400">✓ {strategy.hits}</span>
                    <span className="text-red-400">✗ {strategy.misses}</span>
                    <span className="text-cyan-400">{winRate}%</span>
                  </div>
                  {strategy.currentStreak !== 0 && (
                    <span className={`font-semibold ${
                      strategy.currentStreak > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {strategy.currentStreak > 0 ? '+' : ''}{strategy.currentStreak}
                    </span>
                  )}
                </div>
              )}

              {/* Conteúdo expandido */}
              <CollapsibleContent>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {strategy.sequence.map((value, idx) => (
                      <Badge
                        key={idx}
                        variant={idx < strategy.currentProgress ? 'default' : 'outline'}
                        className={`text-xs ${
                          idx < strategy.currentProgress 
                            ? 'bg-green-500/20 text-green-400 border-green-500' 
                            : idx === strategy.currentProgress 
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                            : ''
                        }`}
                      >
                        {idx + 1}. {getValueLabel(value)}
                      </Badge>
                    ))}
                  </div>
                  {strategy.currentProgress > 0 && strategy.currentProgress < strategy.sequence.length && (
                    <div className="text-xs sm:text-sm text-cyan-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold">Sequência Atual:</span>
                      <span className="flex gap-1 flex-wrap">
                        {strategy.sequence.slice(0, strategy.currentProgress).map((value, idx) => (
                          <span key={idx} className="text-green-400">
                            {getValueLabel(value)}
                            {idx < strategy.currentProgress - 1 && ' →'}
                          </span>
                        ))}
                        <span className="text-yellow-400 font-bold">
                          {' → ' + getValueLabel(strategy.sequence[strategy.currentProgress])}
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm text-gray-400">
                      <span>Progresso: {strategy.currentProgress}/{strategy.sequence.length}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Progress value={progress} className="h-2 flex-1" />
                      {chartData.length > 0 && (
                        <div className="w-16 sm:w-24 h-6 sm:h-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                    
                    {/* Streak atual de acertos/erros */}
                    {strategy.currentStreak !== 0 && (
                      <div className="text-center text-xs sm:text-sm">
                        <span className={`font-semibold ${
                          strategy.currentStreak > 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {strategy.currentStreak > 0 
                            ? `${strategy.currentStreak} acerto${strategy.currentStreak > 1 ? 's' : ''} seguido${strategy.currentStreak > 1 ? 's' : ''}`
                            : `${Math.abs(strategy.currentStreak)} erro${Math.abs(strategy.currentStreak) > 1 ? 's' : ''} seguido${Math.abs(strategy.currentStreak) > 1 ? 's' : ''}`
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-green-400">{strategy.hits}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">Acertos</div>
                      {strategy.alertOnWinStreak && strategy.alertOnWinStreak > 0 && (
                        <div className="text-[9px] sm:text-[10px] text-yellow-400 mt-1">
                          Alerta: {strategy.alertOnWinStreak}+
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-red-400">{strategy.misses}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">Erros</div>
                      {strategy.alertOnLossStreak && strategy.alertOnLossStreak > 0 && (
                        <div className="text-[9px] sm:text-[10px] text-yellow-400 mt-1">
                          Alerta: {strategy.alertOnLossStreak}+
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-cyan-400">{winRate}%</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">Taxa</div>
                    </div>
                  </div>

                  {/* Estatísticas de acertos consecutivos para estratégias de conjunto */}
                  {strategy.type === 'number-set' && strategy.consecutiveHitStreaks && Object.keys(strategy.consecutiveHitStreaks).length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <h5 className="text-xs sm:text-sm font-semibold mb-2 text-cyan-400">Sequências de Acertos Consecutivos:</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(strategy.consecutiveHitStreaks)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([streakLength, count]) => (
                            <div key={streakLength} className="glass-card p-2 rounded text-center">
                              <div className="text-sm sm:text-lg font-bold text-green-400">{count}</div>
                              <div className="text-[10px] sm:text-xs text-gray-400">
                                {streakLength} acerto{Number(streakLength) > 1 ? 's' : ''}
                              </div>
                            </div>
                          ))}
                      </div>
                      
                      {strategy.currentConsecutiveHits! > 0 && (
                        <div className="mt-2 text-center text-xs sm:text-sm">
                          <span className="text-yellow-400 font-semibold">
                            Acertos consecutivos atuais: {strategy.currentConsecutiveHits}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
};
