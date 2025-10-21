import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/NumberInput';
import { StatsCard } from '@/components/StatsCard';
import { RecentResults } from '@/components/RecentResults';
import { HotColdNumbers } from '@/components/HotColdNumbers';
import { StrategyCreator } from '@/components/StrategyCreator';
import { StrategyMonitor } from '@/components/StrategyMonitor';
import { StrategyStreaks } from '@/components/StrategyStreaks';
import { NumberCorrelation } from '@/components/NumberCorrelation';
import { useRouletteData } from '@/hooks/useRouletteData';
import { useStrategyMonitor } from '@/hooks/useStrategyMonitor';
import { toast } from 'sonner';
import { RotateCcw, Trash2 } from 'lucide-react';

const Index = () => {
  const { results, stats, addNumber, clearResults, undoLast } = useRouletteData();
  const { strategies, addStrategy, removeStrategy, toggleStrategy, resetStrategy } = useStrategyMonitor(results);
  const [activeTab, setActiveTab] = useState('input');

  const handleAddNumber = (num: number) => {
    addNumber(num);
    toast.success(`Número ${num} adicionado!`);
  };

  const handleClear = () => {
    if (results.length === 0) return;
    clearResults();
    toast.info('Todos os resultados foram limpos');
  };

  const handleUndo = () => {
    if (results.length === 0) return;
    undoLast();
    toast.info('Último número removido');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 via-yellow-400 to-cyan-400 bg-clip-text text-transparent">
            🎰 Análise de Roleta
          </h1>
        </header>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 glass-card">
            <TabsTrigger value="input" className="text-base md:text-lg">
              🎲 Entrada
            </TabsTrigger>
            <TabsTrigger value="strategies" className="text-base md:text-lg">
              🎯 Estratégias
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-base md:text-lg">
              📊 Dashboard
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-base md:text-lg">
              📈 Análise
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-4 md:space-y-6">
            <div className="glass-card rounded-xl p-4 md:p-6">
              <NumberInput onNumberAdd={handleAddNumber} />
              
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  onClick={handleUndo}
                  disabled={results.length === 0}
                  variant="secondary"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Desfazer
                </Button>
                <Button
                  onClick={handleClear}
                  disabled={results.length === 0}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Tudo
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <StrategyMonitor
                strategies={strategies}
                onToggle={toggleStrategy}
                onReset={resetStrategy}
                onRemove={removeStrategy}
              />
              <RecentResults results={results} maxDisplay={20} />
            </div>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">🎯 Monitoramento de Estratégias</h2>
              <p className="text-gray-300">Crie e monitore suas estratégias de apostas</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <StrategyCreator onStrategyCreate={addStrategy} />
              <div>
                <StrategyMonitor
                  strategies={strategies}
                  onToggle={toggleStrategy}
                  onReset={resetStrategy}
                  onRemove={removeStrategy}
                />
              </div>
            </div>

            <RecentResults results={results} maxDisplay={20} />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">📊 Dashboard Completo</h2>
              <p className="text-gray-300">Visualização completa dos dados e estatísticas</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatsCard
                title="Total"
                value={stats.totalResults}
                icon="📊"
                valueClassName="text-blue-400"
              />
              <StatsCard
                title="Vermelho"
                value={stats.redCount}
                icon="🔴"
                valueClassName="text-red-400"
              />
              <StatsCard
                title="Preto"
                value={stats.blackCount}
                icon="⚫"
                valueClassName="text-gray-300"
              />
              <StatsCard
                title="Verde"
                value={stats.greenCount}
                icon="🟢"
                valueClassName="text-green-400"
              />
              <StatsCard
                title="Par"
                value={stats.evenCount}
                icon="⚖️"
                valueClassName="text-purple-400"
              />
              <StatsCard
                title="Ímpar"
                value={stats.oddCount}
                icon="⚖️"
                valueClassName="text-yellow-400"
              />
              <StatsCard
                title="Último"
                value={stats.lastNumber ?? '-'}
                icon="🎯"
                valueClassName="text-cyan-400"
              />
              <StatsCard
                title="Taxa Verde"
                value={stats.totalResults > 0 ? `${((stats.greenCount / stats.totalResults) * 100).toFixed(1)}%` : '0%'}
                icon="📈"
                valueClassName="text-green-400"
              />
            </div>

            <RecentResults results={results} maxDisplay={50} />
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">📈 Análise Avançada</h2>
              <p className="text-gray-300">Análise detalhada de padrões e tendências</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatsCard
                title="Resultados"
                value={stats.totalResults}
                valueClassName="text-blue-400"
              />
              <StatsCard
                title="Último Número"
                value={stats.lastNumber ?? '-'}
                valueClassName="text-cyan-400"
              />
              <StatsCard
                title="Vermelho %"
                value={stats.totalResults > 0 ? `${((stats.redCount / stats.totalResults) * 100).toFixed(1)}%` : '0%'}
                valueClassName="text-red-400"
              />
              <StatsCard
                title="Preto %"
                value={stats.totalResults > 0 ? `${((stats.blackCount / stats.totalResults) * 100).toFixed(1)}%` : '0%'}
                valueClassName="text-gray-300"
              />
            </div>

            <HotColdNumbers results={results} />

            <StrategyStreaks strategies={strategies} />

            <NumberCorrelation results={results} />

            {results.length === 0 && (
              <div className="glass-card rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-2">Nenhum Dado Disponível</h3>
                <p className="text-gray-400">
                  Adicione alguns números na aba "Entrada" para ver análises detalhadas
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
