import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface NumberSetSelectorProps {
  onSelect: (numbers: number[]) => void;
}

export const NumberSetSelector = ({ onSelect }: NumberSetSelectorProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const toggleNumber = (num: number) => {
    setSelectedNumbers(prev => {
      const newSet = prev.includes(num)
        ? prev.filter(n => n !== num)
        : [...prev, num].sort((a, b) => a - b);
      
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
