import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

// Ordem dos números na roleta europeia
const ROULETTE_WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

interface TargetNumbersSelectorProps {
  onSelect: (base: number[], targets: number[]) => void;
}

export const TargetNumbersSelector = ({ onSelect }: TargetNumbersSelectorProps) => {
  const [baseNumbers, setBaseNumbers] = useState<number[]>([]);
  const [targetNumbers, setTargetNumbers] = useState<number[]>([]);
  const [useNeighbors, setUseNeighbors] = useState(false);
  const [neighborsCount, setNeighborsCount] = useState(1);

  const getNeighbors = (num: number, count: number): number[] => {
    const index = ROULETTE_WHEEL_ORDER.indexOf(num);
    if (index === -1) return [];

    const neighbors: number[] = [];
    for (let i = 1; i <= count; i++) {
      const leftIndex = (index - i + ROULETTE_WHEEL_ORDER.length) % ROULETTE_WHEEL_ORDER.length;
      const rightIndex = (index + i) % ROULETTE_WHEEL_ORDER.length;
      neighbors.push(ROULETTE_WHEEL_ORDER[leftIndex], ROULETTE_WHEEL_ORDER[rightIndex]);
    }
    return neighbors;
  };

  const toggleBaseNumber = (num: number) => {
    let newBase: number[];
    if (baseNumbers.includes(num)) {
      if (useNeighbors) {
        const neighbors = getNeighbors(num, neighborsCount);
        newBase = baseNumbers.filter(n => n !== num && !neighbors.includes(n));
      } else {
        newBase = baseNumbers.filter(n => n !== num);
      }
    } else {
      if (useNeighbors) {
        const neighbors = getNeighbors(num, neighborsCount);
        newBase = [...baseNumbers, num, ...neighbors].filter((n, i, arr) => arr.indexOf(n) === i).sort((a, b) => a - b);
      } else {
        newBase = [...baseNumbers, num].sort((a, b) => a - b);
      }
    }
    setBaseNumbers(newBase);
    onSelect(newBase, targetNumbers);
  };

  const toggleTargetNumber = (num: number) => {
    let newTargets: number[];
    if (targetNumbers.includes(num)) {
      if (useNeighbors) {
        const neighbors = getNeighbors(num, neighborsCount);
        newTargets = targetNumbers.filter(n => n !== num && !neighbors.includes(n));
      } else {
        newTargets = targetNumbers.filter(n => n !== num);
      }
    } else {
      if (useNeighbors) {
        const neighbors = getNeighbors(num, neighborsCount);
        newTargets = [...targetNumbers, num, ...neighbors].filter((n, i, arr) => arr.indexOf(n) === i).sort((a, b) => a - b);
      } else {
        newTargets = [...targetNumbers, num].sort((a, b) => a - b);
      }
    }
    setTargetNumbers(newTargets);
    onSelect(baseNumbers, newTargets);
  };

  const clearAll = () => {
    setBaseNumbers([]);
    setTargetNumbers([]);
    onSelect([], []);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={useNeighbors}
            onCheckedChange={setUseNeighbors}
            id="use-neighbors"
          />
          <Label htmlFor="use-neighbors">Incluir vizinhos</Label>
        </div>
        {useNeighbors && (
          <div className="flex items-center gap-2">
            <Label htmlFor="neighbors-count" className="text-xs">Vizinhos:</Label>
            <Input
              id="neighbors-count"
              type="number"
              min="1"
              max="9"
              value={neighborsCount}
              onChange={(e) => setNeighborsCount(Math.min(9, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-16 h-8 text-center"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold">Números Base ({baseNumbers.length})</Label>
            {baseNumbers.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBaseNumbers([]);
                  onSelect([], targetNumbers);
                }}
                className="h-6 text-xs"
              >
                Limpar
              </Button>
            )}
          </div>
          {baseNumbers.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {baseNumbers.map((num) => (
                <Badge key={num} variant="secondary" className="text-xs">
                  {num}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold">Números Alvo ({targetNumbers.length})</Label>
            {targetNumbers.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTargetNumbers([]);
                  onSelect(baseNumbers, []);
                }}
                className="h-6 text-xs"
              >
                Limpar
              </Button>
            )}
          </div>
          {targetNumbers.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {targetNumbers.map((num) => (
                <Badge key={num} variant="default" className="text-xs">
                  {num}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Selecionar Números Base</Label>
        <div className="grid grid-cols-7 gap-1">
          {[0, ...Array.from({ length: 36 }, (_, i) => i + 1)].map((num) => (
            <Button
              key={`base-${num}`}
              onClick={() => toggleBaseNumber(num)}
              variant={baseNumbers.includes(num) ? "default" : "outline"}
              className="aspect-square p-0 text-xs"
              size="sm"
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Selecionar Números Alvo</Label>
        <div className="grid grid-cols-7 gap-1">
          {[0, ...Array.from({ length: 36 }, (_, i) => i + 1)].map((num) => (
            <Button
              key={`target-${num}`}
              onClick={() => toggleTargetNumber(num)}
              variant={targetNumbers.includes(num) ? "default" : "outline"}
              className="aspect-square p-0 text-xs"
              size="sm"
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      {(baseNumbers.length > 0 || targetNumbers.length > 0) && (
        <Button onClick={clearAll} variant="outline" className="w-full" size="sm">
          <X className="w-3 h-3 mr-1" />
          Limpar Tudo
        </Button>
      )}
    </div>
  );
};
