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
  const { strategies, addStrategy, removeStrategy, toggleStrategy, resetStrategy, updateAlerts } = useStrategyMonitor(results);

  const handleImport = (data: { results: number[]; strategies: Strategy[] }) => {
    // Clear current data
    clearResults();
    
    // Import results
    data.results.forEach(num => addNumber(num));
    
    // Import strategies
    data.strategies.forEach(strategy => {
      addStrategy(strategy.type, strategy.value, strategy.name);
    });
  };

  const handleClearAll = () => {
    clearResults();
    strategies.forEach(s => removeStrategy(s.id));
  };
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
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🎲</div>
                <div>
                  <h3 className="text-lg font-bold">Entrada de Números</h3>
                  <p className="text-sm text-muted-foreground">Adicione resultados manualmente ou via imagem</p>
                </div>
              </div>
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
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="text-lg font-bold">Estratégias Monitoradas</h3>
                    <p className="text-sm text-muted-foreground">Acompanhe suas estratégias em tempo real</p>
                  </div>
                </div>
                <StrategyMonitor
                  strategies={strategies}
                  onToggle={toggleStrategy}
                  onReset={resetStrategy}
                  onRemove={removeStrategy}
                  onUpdateAlerts={updateAlerts}
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">📋</div>
                  <div>
                    <h3 className="text-lg font-bold">Histórico Recente</h3>
                    <p className="text-sm text-muted-foreground">Últimos 20 resultados da roleta</p>
                  </div>
                </div>
                <RecentResults results={results} maxDisplay={20} />
              </div>
            </div>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">🎯 Monitoramento de Estratégias</h2>
              <p className="text-gray-300">Crie e monitore suas estratégias de apostas</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">✨</div>
                  <div>
                    <h3 className="text-lg font-bold">Criar Estratégia</h3>
                    <p className="text-sm text-muted-foreground">Monte sua estratégia personalizada de apostas</p>
                  </div>
                </div>
                <StrategyCreator onStrategyCreate={addStrategy} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="text-lg font-bold">Suas Estratégias</h3>
                    <p className="text-sm text-muted-foreground">Gerencie e monitore estratégias criadas</p>
                  </div>
                </div>
                <StrategyMonitor
                  strategies={strategies}
                  onToggle={toggleStrategy}
                  onReset={resetStrategy}
                  onRemove={removeStrategy}
                  onUpdateAlerts={updateAlerts}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">📋</div>
                <div>
                  <h3 className="text-lg font-bold">Histórico de Resultados</h3>
                  <p className="text-sm text-muted-foreground">Todos os números registrados</p>
                </div>
              </div>
              <RecentResults results={results} maxDisplay={20} />
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">📊 Dashboard Completo</h2>
              <p className="text-gray-300">Visualização completa dos dados e estatísticas</p>
            </div>

            {/* Stats Grid */}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="text-lg font-bold">Estatísticas Gerais</h3>
                <p className="text-sm text-muted-foreground">Resumo completo de todos os resultados</p>
              </div>
            </div>
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

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">📜</div>
                <div>
                  <h3 className="text-lg font-bold">Histórico Completo</h3>
                  <p className="text-sm text-muted-foreground">Até 50 resultados mais recentes</p>
                </div>
              </div>
              <RecentResults results={results} maxDisplay={50} />
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">📈 Análise Avançada</h2>
              <p className="text-gray-300">Análise detalhada de padrões e tendências</p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🎲</div>
              <div>
                <h3 className="text-lg font-bold">Estatísticas Rápidas</h3>
                <p className="text-sm text-muted-foreground">Visão geral dos dados</p>
              </div>
            </div>
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

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🔥</div>
                <div>
                  <h3 className="text-lg font-bold">Números Quentes e Frios</h3>
                  <p className="text-sm text-muted-foreground">Frequência de aparição dos números</p>
                </div>
              </div>
              <HotColdNumbers results={results} />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">📈</div>
                <div>
                  <h3 className="text-lg font-bold">Sequências de Estratégias</h3>
                  <p className="text-sm text-muted-foreground">Padrões de vitórias e derrotas</p>
                </div>
              </div>
              <StrategyStreaks strategies={strategies} />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🔗</div>
                <div>
                  <h3 className="text-lg font-bold">Correlação de Números</h3>
                  <p className="text-sm text-muted-foreground">Números que aparecem juntos com frequência</p>
                </div>
              </div>
              <NumberCorrelation results={results} />
            </div>

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
