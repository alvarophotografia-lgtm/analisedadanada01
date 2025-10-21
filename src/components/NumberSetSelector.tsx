import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Ordem real dos números na roleta europeia
const ROULETTE_WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

interface NumberSetSelectorProps {
  onSelect: (numbers: number[]) => void;
}

export const NumberSetSelector = ({ onSelect }: NumberSetSelectorProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [useNeighbors, setUseNeighbors] = useState(false);
  const [neighborsCount, setNeighborsCount] = useState(2);

  const getNeighbors = (num: number, count: number): number[] => {
    const index = ROULETTE_WHEEL_ORDER.indexOf(num);
    if (index === -1) return [num];

    const neighbors = new Set<number>([num]);
    const wheelLength = ROULETTE_WHEEL_ORDER.length;

    // Adiciona vizinhos para cada lado
    for (let i = 1; i <= count; i++) {
      // Vizinho à esquerda
      const leftIndex = (index - i + wheelLength) % wheelLength;
      neighbors.add(ROULETTE_WHEEL_ORDER[leftIndex]);
      
      // Vizinho à direita
      const rightIndex = (index + i) % wheelLength;
      neighbors.add(ROULETTE_WHEEL_ORDER[rightIndex]);
    }

    return Array.from(neighbors).sort((a, b) => a - b);
  };

  const toggleNumber = (num: number) => {
    setSelectedNumbers(prev => {
      let newSet: number[];
      
      if (prev.includes(num)) {
        // Remove o número e seus vizinhos se estiver usando vizinhos
        if (useNeighbors) {
          const neighborsToRemove = getNeighbors(num, neighborsCount);
          newSet = prev.filter(n => !neighborsToRemove.includes(n));
        } else {
          newSet = prev.filter(n => n !== num);
        }
      } else {
        // Adiciona o número e seus vizinhos se estiver usando vizinhos
        if (useNeighbors) {
          const neighborsToAdd = getNeighbors(num, neighborsCount);
          newSet = [...new Set([...prev, ...neighborsToAdd])].sort((a, b) => a - b);
        } else {
          newSet = [...prev, num].sort((a, b) => a - b);
        }
      }
      
      if (newSet.length > 0) {
        onSelect(newSet);
      }
      
      return newSet;
    });
  };

  const clearAll = () => {
    setSelectedNumbers([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selecione os números do conjunto:
        </p>
        {selectedNumbers.length > 0 && (
          <Button
            onClick={clearAll}
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
          >
            Limpar
          </Button>
        )}
      </div>

      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="use-neighbors" className="text-sm font-semibold text-yellow-400">
            🎯 Incluir Vizinhos na Roleta
          </Label>
          <Switch
            id="use-neighbors"
            checked={useNeighbors}
            onCheckedChange={setUseNeighbors}
          />
        </div>

        {useNeighbors && (
          <div className="space-y-2">
            <Label htmlFor="neighbors-count" className="text-xs">
              Quantidade de vizinhos de cada lado:
            </Label>
            <Input
              id="neighbors-count"
              type="number"
              min="1"
              max="9"
              value={neighborsCount}
              onChange={(e) => setNeighborsCount(Math.max(1, Math.min(9, Number(e.target.value))))}
              className="glass-card h-8"
            />
            <p className="text-xs text-gray-500">
              Total de números selecionados: {neighborsCount * 2 + 1} por número escolhido
            </p>
          </div>
        )}
      </div>

      {selectedNumbers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
          {selectedNumbers.map(num => (
            <Badge
              key={num}
              variant="default"
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => toggleNumber(num)}
            >
              {num}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {[0, ...Array.from({ length: 36 }, (_, i) => i + 1)].map(num => (
          <Button
            key={num}
            onClick={() => toggleNumber(num)}
            variant={selectedNumbers.includes(num) ? 'default' : 'outline'}
            className="aspect-square p-0 text-xs"
          >
            {num}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {selectedNumbers.length} número{selectedNumbers.length !== 1 ? 's' : ''} selecionado{selectedNumbers.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
};
