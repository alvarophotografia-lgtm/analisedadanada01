import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { memo, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface NumberInputProps {
  onNumberAdd: (num: number) => void;
}

const extractNumbersFromImage = async (file: File): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Image = e.target?.result as string;
        const base64Data = base64Image.split(',')[1];
        
        const { data: functionData, error: functionError } = await supabase.functions.invoke('extract-numbers-from-image', {
          body: { 
            imageData: base64Data,
            mimeType: file.type
          }
        });

        if (functionError) {
          console.error('Function Error:', functionError);
          throw new Error('Erro ao processar imagem');
        }

        if (!functionData.success) {
          throw new Error(functionData.error || 'Erro ao extrair números');
        }

        resolve(functionData.numbers);
      } catch (error) {
        console.error('Erro ao extrair números:', error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const NumberInput = memo(({ onNumberAdd }: NumberInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [multipleNumbers, setMultipleNumbers] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      onNumberAdd(num);
      setInputValue('');
    }
  };

  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numbers = multipleNumbers.trim().split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 0 && n <= 36);
    if (numbers.length > 0) {
      setIsProcessing(true);
      // Adiciona em ordem reversa para manter a ordem correta, um por vez com delay
      for (let i = numbers.length - 1; i >= 0; i--) {
        onNumberAdd(numbers[i]);
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de delay entre cada número
        }
      }
      setMultipleNumbers('');
      setIsProcessing(false);
      toast.success(`${numbers.length} números adicionados!`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    setIsProcessing(true);
    try {
      const numbers = await extractNumbersFromImage(file);
      if (numbers.length > 0) {
        // Adiciona em ordem reversa para manter a ordem correta, um por vez com delay
        for (let i = numbers.length - 1; i >= 0; i--) {
          onNumberAdd(numbers[i]);
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de delay entre cada número
          }
        }
        toast.success(`${numbers.length} números extraídos e adicionados!`);
      } else {
        toast.error('Nenhum número válido encontrado na imagem');
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar a imagem. Verifique se a imagem contém números de roleta visíveis.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-3">
        <TabsTrigger value="single">Único</TabsTrigger>
        <TabsTrigger value="multiple">Múltiplos</TabsTrigger>
        <TabsTrigger value="image">Imagem</TabsTrigger>
      </TabsList>
      
      <TabsContent value="single" className="mt-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="number"
            min="0"
            max="36"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="0-36"
            className="text-center"
          />
          <Button type="submit" className="shrink-0">
            Adicionar
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="multiple" className="mt-3">
        <form onSubmit={handleMultipleSubmit} className="space-y-2">
          <Textarea
            value={multipleNumbers}
            onChange={(e) => setMultipleNumbers(e.target.value)}
            placeholder="Ex: 3 15 22 8"
            className="text-center min-h-[60px]"
            disabled={isProcessing}
          />
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? 'Adicionando...' : 'Adicionar Todos'}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="image" className="mt-3">
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isProcessing}
          />
          <Button
            type="button"
            className="w-full gap-2"
            disabled={isProcessing}
            onClick={(e) => {
              e.preventDefault();
              (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload de Imagem
              </>
            )}
          </Button>
        </label>
        <p className="text-xs text-muted-foreground text-center mt-2">
          IA extrai números automaticamente
        </p>
      </TabsContent>
    </Tabs>
  );
});

NumberInput.displayName = 'NumberInput';
