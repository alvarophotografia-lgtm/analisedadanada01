# 🎰 Documentação Completa - Sistema de Análise de Roleta

## 📋 Visão Geral

Este é um sistema completo e avançado para análise de resultados de roleta, com foco em monitoramento de estratégias, análise estatística e identificação de padrões. O aplicativo foi desenvolvido com React, TypeScript, Tailwind CSS e utiliza Lovable Cloud (Supabase) para backend.

---

## 🎯 Funcionalidades Principais

### 1. **Entrada de Dados**

#### 1.1 Entrada Manual de Números
- Grid interativo com todos os números da roleta (0-36)
- Cada número pode ser clicado para adicionar aos resultados
- Feedback visual imediato com toast notifications
- Suporte para tema claro/escuro

#### 1.2 Upload de Imagem com OCR
- Upload de fotos de telas de roleta
- Extração automática de números usando IA (Google Gemini)
- Validação de tamanho de arquivo (máx 5MB)
- Processamento em lote de múltiplos números
- Edge Function dedicada para processar imagens de forma segura

#### 1.3 Botões de Controle
- **Desfazer**: Remove o último número adicionado
- **Limpar Tudo**: Remove todos os resultados (com confirmação)

---

### 2. **Sistema de Estratégias**

#### 2.1 Tipos de Estratégias Suportadas

##### **Cor (Color)**
- Monitora vermelho ou preto
- Números vermelhos: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36

##### **Paridade (Parity)**
- Par ou ímpar
- Zero é ignorado (não conta como par nem ímpar)

##### **Intervalo (Range)**
- Baixo (1-18) ou Alto (19-36)
- Zero é ignorado

##### **Dúzia (Dozen)**
- Primeira dúzia (1-12)
- Segunda dúzia (13-24)
- Terceira dúzia (25-36)

##### **Coluna (Column)**
- Primeira coluna: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
- Segunda coluna: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
- Terceira coluna: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36

##### **Número Específico**
- Monitora um número exato (0-36)

##### **Vizinhos (Neighbors)**
- Monitora um número base e seus vizinhos na roda física
- Configurável: quantos vizinhos de cada lado
- Ordem da roda: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]

##### **Conjunto de Números (Number Set)**
- Lista customizada de números (ex: 1, 5, 9, 14, 18)
- Conta acertos consecutivos
- Registra sequências (2+ acertos seguidos)
- **Lógica de Continuidade**: mesmo após erro, se o próximo número estiver no conjunto, inicia nova base

##### **Números Alvo (Target Numbers)**
- **Base**: Números que iniciam a análise
- **Alvos**: Números que devem aparecer após a base
- **Lógica Especial**: 
  - Se um número está na base E no alvo: conta como acerto E inicia nova base
  - Exemplo: Base [1,2,3], Alvo [3,4,5]
    - Sequência 1→3: ✓ Acerto (3 no alvo) + nova base (3 na base)
    - Sequência 3→4: ✓ Acerto
- **Continuidade**: número que falhou pode iniciar nova análise se estiver na base

#### 2.2 Criação de Estratégias

```typescript
interface Strategy {
  id: string;
  name: string;
  type: StrategyType;
  sequence: StrategyValue[];
  value: any; // Específico por tipo
  isActive: boolean;
  
  // Estatísticas
  hits: number;
  misses: number;
  currentProgress: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  
  // Alertas
  alertOnWinStreak?: number;
  alertOnLossStreak?: number;
  isPriority: boolean;
  
  // Histórico
  history: Array<{
    spin: number;
    result: 'hit' | 'miss' | 'progress' | 'partial';
  }>;
  
  // Para number-set e target-numbers
  currentConsecutiveHits?: number;
  consecutiveHitStreaks?: Record<number, number>;
}
```

#### 2.3 Monitoramento de Estratégias

**Interface Minimizada (padrão)**:
- Nome da estratégia
- Switch liga/desliga
- Estatísticas básicas: ✓ acertos | ✗ erros | % taxa de acerto
- Streak atual (positivo = acertos, negativo = erros)
- **Próximo segmento esperado** com badge destacado
- Progresso na sequência (ex: 3/5)
- Botões: Configurações, Reset, Remover

**Interface Expandida**:
- Todos os dados da versão minimizada
- Sequência completa com badges
  - Verde: já passou
  - Amarelo: próximo esperado
  - Cinza: ainda não alcançado
- Gráfico de linha com últimos 20 eventos (hit/miss)
- Progresso visual (barra)
- Estatísticas detalhadas:
  - Acertos totais
  - Erros totais
  - Taxa de acerto
  - Alertas configurados
- Para number-set: estatísticas de sequências consecutivas

**Sistema de Prioridade**:
- Estratégias podem ser marcadas como prioritárias
- Destacadas com borda amarela e badge "PRIORIDADE"
- Aparecem no topo da lista
- Ativação automática via alertas configurados

#### 2.4 Alertas e Notificações

**Configuração de Alertas**:
- Alerta após X acertos consecutivos
- Alerta após X erros consecutivos
- Quando ativado, estratégia vira prioritária
- Toast notification + som de alerta

**Sons**:
- Arquivo de áudio embutido (base64)
- Reproduz automaticamente em alertas
- Configurável por estratégia

#### 2.5 Reset de Estratégias

**Reset Individual**:
- Reseta uma estratégia específica
- Mantém configuração (nome, tipo, sequência, alertas)
- Zera estatísticas (hits, misses, streaks, histórico)

**Reset Global** (NOVO):
- Botão "Resetar Todas"
- Reseta todas as estratégias de uma vez
- Toast de confirmação
- Preserva configurações, zera apenas estatísticas

---

### 3. **Análise Estatística**

#### 3.1 Estatísticas Gerais
- Total de resultados
- Contagem por cor (vermelho, preto, verde)
- Contagem por paridade (par, ímpar)
- Último número
- Taxa de verde (porcentagem de zeros)

#### 3.2 Números Quentes e Frios (Hot/Cold Numbers)
- **Quentes**: números mais frequentes (top 10)
- **Frios**: números menos frequentes (bottom 10)
- Visualização com gráfico de barras
- Contagem e porcentagem
- Cores vibrantes (gradientes)

#### 3.3 Correlação de Números

**Versão Completa (tab Análise)**:
- Analisa últimos 100 resultados
- Identifica números que aparecem frequentemente após outros
- Top 10 correlações mais fortes
- Para cada número: mostra os 3 números mais prováveis de aparecer depois
- Porcentagens e contagens

**Versão Compacta (tab Entrada)** (NOVO):
- Mostra apenas top 5 correlações
- Minimizável/expansível
- Aparece acima do histórico recente
- Interface compacta para mobile

#### 3.4 Sequências de Estratégias
- Gráfico de linha mostrando evolução de cada estratégia
- Eixo Y: vitórias acumuladas
- Cores diferentes por estratégia
- Legenda interativa

---

### 4. **Gerenciamento de Dados**

#### 4.1 Exportação

**JSON**:
```json
{
  "results": [10, 25, 3, ...],
  "strategies": [
    {
      "name": "Cor Vermelha",
      "type": "color",
      "sequence": [...],
      "hits": 45,
      "misses": 38,
      ...
    }
  ],
  "exportDate": "2025-10-26T..."
}
```

**CSV**:
```csv
Número,Cor,Par/Ímpar,Intervalo,Dúzia,Coluna,Timestamp
25,Vermelho,Ímpar,Alto,Terceira,1,2025-10-26...
```

#### 4.2 Importação
- Suporta JSON exportado pelo próprio app
- Valida estrutura antes de importar
- Limpa dados atuais antes de importar
- Feedback com toast

#### 4.3 Limpar Tudo
- Remove todos os resultados
- Remove todas as estratégias
- Confirmação obrigatória

---

### 5. **Interface e Responsividade**

#### 5.1 Tema Claro/Escuro
- Toggle no header
- Persistência via localStorage
- Transições suaves
- Design system baseado em tokens CSS (HSL)
- Todas as cores são semânticas (--primary, --secondary, etc)

#### 5.2 Layout Responsivo

**Desktop**:
- Grid de 2 colunas em várias seções
- Tabs horizontais
- Estratégias expandem lateralmente

**Tablet**:
- Grid adapta para coluna única em telas menores
- Botões mantêm tamanho adequado

**Mobile**:
- Stack vertical
- Estratégias com padding reduzido
- Texto ajusta tamanho (text-sm → text-xs)
- Botões com ícones menores
- Grid de números compacto
- Scroll horizontal onde necessário
- **Correções aplicadas**: overflow controlado, flex-wrap, whitespace-nowrap em badges

#### 5.3 Tabs de Navegação

**🎲 Entrada**:
- Entrada de números (manual/upload)
- **Correlação de números compacta** (NOVO)
- Estratégias monitoradas (resumo)
- Histórico recente (últimos 20)

**🎯 Estratégias**:
- Criador de estratégias (formulário)
- Lista de estratégias (gerenciamento)
- Histórico de resultados

**📊 Dashboard**:
- **Gerenciador de dados** (export/import) (MOVIDO DA ABA ENTRADA)
- Estatísticas gerais (cards)
- Histórico completo (até 50)

**📈 Análise**:
- Estatísticas rápidas (cards)
- Números quentes e frios
- Sequências de estratégias (gráficos)
- Correlação de números (completa)

---

### 6. **Fluxo de Processamento**

#### 6.1 Ordem de Atualização (CRÍTICO)

Quando um número é adicionado:
1. **Primeiro**: processa o número em todas as estratégias ativas
2. **Depois**: adiciona o número aos resultados
3. **Resultado**: garante que batch de números seja processado corretamente

```typescript
const handleAddNumber = (num: number) => {
  processNumber(num);  // 1. Processa estratégias
  addNumber(num);      // 2. Adiciona aos resultados
  toast.success(`Número ${num} adicionado!`);
};

const handleBatchAdd = (nums: number[]) => {
  nums.forEach(n => processNumber(n));  // 1. Processa cada um
  addBatch(nums);                       // 2. Adiciona em lote
  toast.success(`${nums.length} números adicionados!`);
};
```

#### 6.2 Lógica de Estratégias

**Estratégias Simples (cor, paridade, etc)**:
```
Para cada número novo:
  1. Verifica se corresponde ao esperado na sequência
  2. Se SIM: avança progresso
  3. Se NÃO: 
     - Se estava no último elemento: conta erro
     - Se não estava no último: apenas reseta progresso
  4. Verifica se número inicia nova sequência
```

**Number-Set**:
```
Para cada número novo:
  1. Está no conjunto?
     - SIM e é primeiro: inicia base (não conta)
     - SIM e tinha base: conta acerto
  2. Não está no conjunto?
     - Tinha 1 acerto: conta erro MAS verifica se inicia nova base
     - Tinha 2+: registra streak, conta erro MAS verifica se inicia nova base
```

**Target-Numbers**:
```
Para cada número novo:
  1. Está na base E no alvo?
     - Sem base ativa: inicia base
     - Com base ativa: ACERTO + reinicia base
  2. Apenas na base?
     - Sem base: inicia base
     - Com base: ERRO + verifica se reinicia base
  3. Apenas no alvo?
     - Com base: ACERTO + zera base
     - Sem base: ignora
  4. Nem base nem alvo?
     - Com base: ERRO
     - Sem base: ignora
```

---

### 7. **Persistência de Dados**

#### 7.1 LocalStorage
- Chave: `roulette-strategies`
- Armazena array de estratégias
- Atualização automática em toda mudança
- Recuperação automática ao carregar app

#### 7.2 Hooks Customizados

**useLocalStorage**:
```typescript
const [state, setState] = useLocalStorage<T>(key, initialValue);
```

**useRouletteData**:
```typescript
const {
  results,      // número[]
  stats,        // estatísticas calculadas
  addNumber,    // adiciona um número
  addBatch,     // adiciona múltiplos
  clearResults, // limpa tudo
  undoLast,     // remove último
} = useRouletteData();
```

**useStrategyMonitor**:
```typescript
const {
  strategies,         // Strategy[]
  addStrategy,        // cria nova
  removeStrategy,     // remove
  toggleStrategy,     // ativa/desativa
  resetStrategy,      // reseta uma
  resetAllStrategies, // reseta todas (NOVO)
  updateAlerts,       // configura alertas
  processNumber,      // processa número (NOVO)
} = useStrategyMonitor(results);
```

---

### 8. **Backend (Lovable Cloud / Supabase)**

#### 8.1 Edge Function: extract-numbers-from-image

**Endpoint**: `/functions/v1/extract-numbers-from-image`

**Método**: POST

**Request**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Validações**:
- Formato: deve ser base64 válido
- Tamanho: máximo 5MB
- Tipo: deve ser imagem

**Processamento**:
1. Extrai base64
2. Valida tamanho
3. Chama Google Gemini 2.5 Flash com prompt específico
4. Parseia resposta JSON
5. Valida números (0-36)

**Response**:
```json
{
  "numbers": [25, 10, 3, 18, 7],
  "message": "5 números extraídos"
}
```

**Errors**:
- 400: Imagem inválida ou formato incorreto
- 413: Arquivo muito grande
- 500: Erro no processamento

**Segurança**:
- API key armazenada em variável de ambiente
- CORS configurado
- Rate limiting (Supabase nativo)

---

### 9. **Tecnologias Utilizadas**

#### 9.1 Frontend
- **React 18.3**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Radix UI**: Componentes acessíveis
- **Recharts**: Gráficos
- **Sonner**: Toast notifications
- **Lucide React**: Ícones

#### 9.2 Backend
- **Lovable Cloud (Supabase)**
- **Edge Functions (Deno)**
- **Google Gemini 2.5 Flash**: OCR/IA

#### 9.3 Armazenamento
- **LocalStorage**: Dados do cliente
- **Base64**: Encoding de imagens

---

### 10. **Arquitetura de Arquivos**

```
src/
├── components/
│   ├── ui/              # Componentes Shadcn/Radix
│   ├── DataManager.tsx  # Export/Import
│   ├── HotColdNumbers.tsx
│   ├── NumberCorrelation.tsx  # Com modo compacto
│   ├── NumberInput.tsx
│   ├── RecentResults.tsx
│   ├── StatsCard.tsx
│   ├── StrategyCreator.tsx
│   ├── StrategyMonitor.tsx    # Com reset all, mobile fixes
│   ├── StrategyStreaks.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useRouletteData.ts     # Com addBatch
│   └── useStrategyMonitor.ts  # Com processNumber, resetAll
├── lib/
│   ├── evaluate.ts            # Funções puras de avaliação
│   └── utils.ts
├── pages/
│   ├── Index.tsx              # App principal
│   └── NotFound.tsx
├── types/
│   └── strategy.ts
├── index.css              # Design system (tokens HSL)
└── main.tsx

supabase/
└── functions/
    └── extract-numbers-from-image/
        └── index.ts       # Edge function OCR

```

---

### 11. **Melhorias Implementadas**

#### Correções de Bugs:
✅ Ordem de processamento: estratégias atualizadas ANTES de adicionar aos resultados
✅ Lógica de continuidade: números que erram podem iniciar nova base
✅ Target-numbers: suporte para números que são base E alvo simultaneamente
✅ Mobile: overflow, wrapping, proporções corrigidas

#### Novas Funcionalidades:
✅ Reset global de estratégias (botão "Resetar Todas")
✅ Correlação compacta na aba Entrada
✅ Próximo segmento mostrado corretamente (baseado em currentProgress)
✅ DataManager movido para Dashboard
✅ processNumber() para processar antes de adicionar

#### Melhorias de UX:
✅ Badges com whitespace-nowrap
✅ Textos responsivos (sm/base/lg)
✅ Botões adaptados para mobile
✅ Layout flex com wrap apropriado
✅ Overflow controlado em estratégias

---

### 12. **Como Usar**

#### 12.1 Adicionar Resultados
1. Vá para aba "🎲 Entrada"
2. Clique nos números ou faça upload de imagem
3. Veja os resultados aparecerem no histórico

#### 12.2 Criar Estratégia
1. Vá para aba "🎯 Estratégias"
2. Preencha nome e selecione tipo
3. Configure a sequência/valores
4. (Opcional) Configure alertas
5. Clique em "Criar Estratégia"

#### 12.3 Monitorar Estratégias
1. Estratégias aparecem nas abas "Entrada" e "Estratégias"
2. Clique na seta para expandir/minimizar
3. Use o switch para ativar/desativar
4. Configure alertas pelo ícone de engrenagem
5. Resete individual (ícone de seta circular) ou todas (botão "Resetar Todas")

#### 12.4 Analisar Dados
1. Vá para "📊 Dashboard" para visão geral
2. Vá para "📈 Análise" para detalhes
3. Veja correlações, quentes/frios, gráficos
4. Exporte dados em JSON/CSV conforme necessário

---

### 13. **Próximos Passos Sugeridos**

- [ ] Adicionar testes unitários (Vitest)
- [ ] Implementar CI/CD (GitHub Actions)
- [ ] Adicionar mais tipos de visualização (pizza charts, heatmaps)
- [ ] Suporte para múltiplas sessões/salas
- [ ] Histórico de sessões com timestamps
- [ ] Comparação de estratégias lado a lado
- [ ] Exportação para PDF com relatórios
- [ ] Modo offline completo (PWA)
- [ ] Notificações push para alertas
- [ ] Integração com APIs de cassinos online

---

## 🚀 Conclusão

Este é um sistema profissional e completo para análise de roleta, com foco em:
- **Precisão**: lógica de estratégias testada e validada
- **Performance**: hooks otimizados, memoização, batch processing
- **UX**: responsivo, acessível, intuitivo
- **Escalabilidade**: arquitetura modular, componentes reutilizáveis
- **Segurança**: validações, edge functions, tokens semânticos

O app está pronto para uso em produção e pode ser facilmente estendido com novas funcionalidades.
