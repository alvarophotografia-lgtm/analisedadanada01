import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Strategy } from '@/types/strategy';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DataManagerProps {
  results: number[];
  strategies: Strategy[];
  onImport: (data: { results: number[]; strategies: Strategy[] }) => void;
  onClearAll: () => void;
}

export const DataManager = ({ results, strategies, onImport, onClearAll }: DataManagerProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    const data = {
      results,
      strategies,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roulette-analyzer-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "✅ Dados Exportados",
      description: "Arquivo baixado com sucesso!",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Formato de arquivo inválido');
        }

        onImport({
          results: data.results || [],
          strategies: data.strategies || [],
        });

        toast({
          title: "✅ Dados Importados",
          description: `${data.results.length} resultados e ${data.strategies?.length || 0} estratégias carregados!`,
        });
      } catch (error) {
        toast({
          title: "❌ Erro ao Importar",
          description: "Arquivo inválido ou corrompido",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Número', 'Timestamp', 'Índice'].join(','),
      ...results.map((num, idx) => [
        num,
        new Date(Date.now() - idx * 60000).toISOString(),
        results.length - idx,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roulette-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "✅ CSV Exportado",
      description: "Arquivo CSV baixado com sucesso!",
    });
  };

  return (
    <div className="glass-card rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-primary" />
        <h3 className="text-lg md:text-xl font-bold">Gerenciar Dados</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Faça backup dos seus dados ou importe de outro arquivo
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleExport}
          variant="default"
          size="sm"
          disabled={results.length === 0 && strategies.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar JSON
        </Button>

        <Button
          onClick={handleExportCSV}
          variant="secondary"
          size="sm"
          disabled={results.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center gap-2"
        >
          <label htmlFor="import-file" className="cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={results.length === 0 && strategies.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Tudo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá deletar permanentemente todos os resultados e estratégias.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onClearAll} className="bg-destructive text-destructive-foreground">
                Sim, limpar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>💾 {results.length} resultados | 📊 {strategies.length} estratégias</p>
      </div>
    </div>
  );
};
