import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { StrategyType, StrategyValue } from '@/types/strategy';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NumberSetSelector } from './NumberSetSelector';

interface StrategyCreatorProps {
  onStrategyCreate: (strategy: { 
    name: string; 
    type: StrategyType; 
    sequence: StrategyValue[];
    alertOnWinStreak?: number;
    alertOnLossStreak?: number;
  }) => void;
}

export const StrategyCreator = ({ onStrategyCreate }: StrategyCreatorProps) => {
  const [name, setName] = useState('');
  const [sequence, setSequence] = useState<StrategyValue[]>([]);
  const [useCustomName, setUseCustomName] = useState(false);
  const [alertOnWinStreak, setAlertOnWinStreak] = useState<number>(0);
  const [alertOnLossStreak, setAlertOnLossStreak] = useState<number>(0);

  const addToSequence = (value: StrategyValue) => {
    setSequence([...sequence, value]);
  };

  const removeFromSequence = (index: number) => {
    setSequence(sequence.filter((_, i) => i !== index));
  };

  const createStrategy = () => {
    if (useCustomName && !name.trim()) {
      toast.error('Digite um nome para a estratégia');
      return;
    }

    if (sequence.length === 0) {
      toast.error('Adicione pelo menos um elemento à sequência');
      return;
    }

    const strategyName = useCustomName ? name : `Estratégia ${sequence.map(getValueLabel).join(' → ')}`;

    onStrategyCreate({ 
      name: strategyName, 
      type: sequence[0].type, 
      sequence,
      alertOnWinStreak: alertOnWinStreak > 0 ? alertOnWinStreak : undefined,
      alertOnLossStreak: alertOnLossStreak > 0 ? alertOnLossStreak : undefined,
    });
    
    // Reset form
    setName('');
    setSequence([]);
    setUseCustomName(false);
    setAlertOnWinStreak(0);
    setAlertOnLossStreak(0);
    
    toast.success('Estratégia criada com sucesso!');
  };

  const getValueLabel = (value: StrategyValue): string => {
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
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <h3 className="text-xl font-bold mb-4">✨ Criar Nova Estratégia</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Nome Personalizado</Label>
          <Switch
            checked={useCustomName}
            onCheckedChange={setUseCustomName}
          />
        </div>

        {useCustomName && (
          <div>
            <Input
              id="strategy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Três Vermelhos"
              className="glass-card"
            />
          </div>
        )}

        <div className="space-y-3 p-4 glass-card rounded-lg border border-yellow-500/20">
          <Label className="text-yellow-400 font-semibold">⚡ Alertas de Prioridade</Label>
          <p className="text-xs text-gray-400">Configure quando esta estratégia deve ganhar prioridade</p>
          
          <div className="space-y-2">
            <Label htmlFor="alert-wins" className="text-sm">
              Priorizar após <span className="text-green-400">acertos</span> consecutivos:
            </Label>
            <Input
              id="alert-wins"
              type="number"
              min="0"
              value={alertOnWinStreak}
              onChange={(e) => setAlertOnWinStreak(Number(e.target.value))}
              placeholder="0 = desabilitado"
              className="glass-card"
            />
            <p className="text-xs text-gray-500">Ex: 5 = alerta após 5 acertos seguidos</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-losses" className="text-sm">
              Priorizar após <span className="text-red-400">erros</span> consecutivos:
            </Label>
            <Input
              id="alert-losses"
              type="number"
              min="0"
              value={alertOnLossStreak}
              onChange={(e) => setAlertOnLossStreak(Number(e.target.value))}
              placeholder="0 = desabilitado"
              className="glass-card"
            />
            <p className="text-xs text-gray-500">Ex: 5 = alerta após 5 erros seguidos</p>
          </div>
        </div>

        <div>
          <Label>Adicionar à Sequência</Label>
          <Tabs defaultValue="color" className="mt-2">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="color" className="text-xs">Cor</TabsTrigger>
              <TabsTrigger value="parity" className="text-xs">Par/Ímpar</TabsTrigger>
              <TabsTrigger value="range" className="text-xs">Faixa</TabsTrigger>
              <TabsTrigger value="dozen" className="text-xs">Dúzia</TabsTrigger>
              <TabsTrigger value="column" className="text-xs">Coluna</TabsTrigger>
              <TabsTrigger value="number" className="text-xs">Número</TabsTrigger>
              <TabsTrigger value="number-set" className="text-xs">Conjunto</TabsTrigger>
            </TabsList>

            <TabsContent value="color" className="space-y-2 mt-3">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => addToSequence({ type: 'color', value: 'red' })}
                  className="bg-red-600 hover:bg-red-700"
                >
                  🔴 Vermelho
                </Button>
                <Button
                  onClick={() => addToSequence({ type: 'color', value: 'black' })}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  ⚫ Preto
                </Button>
                <Button
                  onClick={() => addToSequence({ type: 'color', value: 'green' })}
                  className="bg-green-600 hover:bg-green-700"
                >
                  🟢 Verde
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="parity" className="space-y-2 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => addToSequence({ type: 'parity', value: 'even' })}
                  variant="outline"
                >
                  Par
                </Button>
                <Button
                  onClick={() => addToSequence({ type: 'parity', value: 'odd' })}
                  variant="outline"
                >
                  Ímpar
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="range" className="space-y-2 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => addToSequence({ type: 'range', value: 'low' })}
                  variant="outline"
                >
                  Baixo (1-18)
                </Button>
                <Button
                  onClick={() => addToSequence({ type: 'range', value: 'high' })}
                  variant="outline"
                >
                  Alto (19-36)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="dozen" className="space-y-2 mt-3">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => addToSequence({ type: 'dozen', value: 'first' })}
                  variant="outline"
                >
                  1ª (1-12)
                </Button>
                <Button
                  onClick={() => addToSequence({ type: 'dozen', value: 'second' })}
                  variant="outline"
                >
                  2ª (13-24)
                </Button>
                <Button
                  onClick={() => addToSequence({ type: 'dozen', value: 'third' })}
                  variant="outline"
                >
                  3ª (25-36)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="column" className="space-y-2 mt-3">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => addToSequence({ type: 'column', value: 'first' })}
                  variant="outline"
                >
                  Coluna 1
                </Button>
                <Button
                  onClick={() => addToSequence({ type: 'column', value: 'second' })}
                  variant="outline"
                >
                  Coluna 2
                </Button>
                <Button
                  onClick={() => addToSequence({ type: 'column', value: 'third' })}
                  variant="outline"
                >
                  Coluna 3
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="number" className="space-y-2 mt-3">
              <div className="grid grid-cols-7 gap-1">
                {[0, ...Array.from({ length: 36 }, (_, i) => i + 1)].map(num => (
                  <Button
                    key={num}
                    onClick={() => addToSequence({ type: 'number', value: num })}
                    variant="outline"
                    className="aspect-square p-0 text-xs"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="number-set" className="space-y-2 mt-3">
              <NumberSetSelector onSelect={(numbers) => {
                setSequence([{ type: 'number-set', value: numbers }]);
              }} />
            </TabsContent>
          </Tabs>
        </div>

        {sequence.length > 0 && (
          <div>
            <Label>Sequência ({sequence.length} elementos)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {sequence.map((value, index) => (
                <div
                  key={index}
                  className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
                >
                  <span>{index + 1}. {getValueLabel(value)}</span>
                  <button
                    onClick={() => removeFromSequence(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button onClick={createStrategy} className="w-full" size="lg">
        Criar Estratégia
      </Button>
    </div>
  );
};
