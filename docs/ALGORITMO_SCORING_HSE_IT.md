# Algoritmo de Scoring HSE-IT - VIVAMENTE360

## Visão Geral

O algoritmo de scoring do HSE-IT (Health and Safety Executive - Indicator Tool) implementado no VIVAMENTE360 é uma ferramenta completa para avaliação de riscos psicossociais no ambiente de trabalho.

## 📊 Fórmulas de Cálculo

### Dimensões Avaliadas

O questionário HSE-IT avalia **7 dimensões** de risco psicossocial:

1. **Demandas** (8 perguntas) - NEGATIVA
2. **Controle** (6 perguntas) - POSITIVA
3. **Apoio Gerencial** (5 perguntas) - POSITIVA
4. **Apoio de Colegas** (4 perguntas) - POSITIVA
5. **Relacionamentos** (4 perguntas) - NEGATIVA
6. **Papel** (5 perguntas) - POSITIVA
7. **Mudanças** (3 perguntas) - POSITIVA

### Escala de Respostas

Cada pergunta utiliza escala Likert de 0 a 4:
- 0 = Nunca
- 1 = Raramente
- 2 = Às vezes
- 3 = Frequentemente
- 4 = Sempre

### Cálculo de Scores

#### 1. Média por Dimensão
```
Média = Σ(respostas) / número_de_perguntas
```

#### 2. Score por Dimensão

**Para dimensões POSITIVAS (Controle, Apoio Gerencial, Apoio de Colegas, Papel, Mudanças):**
```
Score = (4 - média) × 5
```
*Quanto menor a média, MAIOR o risco (invertido)*

**Para dimensões NEGATIVAS (Demandas, Relacionamentos):**
```
Score = média × 5
```
*Quanto maior a média, MAIOR o risco (direto)*

#### 3. Score Global
```
Score Global = Σ(todos os 7 scores)
Faixa: 0 a 140 pontos
```

### Classificação de Risco

| Score Global | Classificação | Significado |
|-------------|---------------|-------------|
| 0 - 40      | SATISFATÓRIO  | Nível de risco psicossocial satisfatório |
| 41 - 80     | ATENÇÃO       | Atenção: riscos psicossociais identificados |
| 81 - 140    | CRÍTICO       | Crítico: intervenção urgente necessária |

## 📈 Estatísticas Avançadas

### Percentis
Calcula P10, P25, P50 (mediana), P75, P90 dos scores globais.

**Função:** `calcularPercentis(empresaId)`

### Box Plot
Gera dados para visualização Box Plot:
- Mínimo e Máximo (excluindo outliers)
- Q1, Mediana, Q3
- IQR (Intervalo Interquartil)
- Outliers (método IQR: valores < Q1 - 1.5×IQR ou > Q3 + 1.5×IQR)

**Função:** `calcularBoxPlot(empresaId)`

### Histograma
Distribui scores em bins para análise de frequência.

**Função:** `calcularHistograma(empresaId, numeroBins = 10)`

### Correlação
Calcula correlação entre tempo de resposta e score:
- Coeficiente de Pearson
- Coeficiente de Spearman (correlação de ranks)
- P-valor e significância estatística

**Função:** `calcularCorrelacao(empresaId)`

### Tendência Temporal
Analisa evolução dos scores ao longo do tempo:
- Agrupamento por mês
- Regressão linear (inclinação, intercepto, R²)
- Tendência: crescente, decrescente ou estável
- Taxa de crescimento percentual

**Função:** `calcularTendencia(empresaId)`

### Perguntas Críticas e Positivas
Identifica as perguntas com maior percentual de respostas críticas (≥3) ou positivas (≤1).

**Funções:**
- `getPerguntasCriticas(empresaId, top = 10)`
- `getPerguntasPositivas(empresaId, top = 10)`

### Heatmap
Matriz de frequência: dimensão × faixa de score (0-5, 5-10, 10-15, 15-20).

**Função:** `getHeatmapData(empresaId)`

## 🔒 K-Anonymity e Privacidade

### Requisito Mínimo
**Mínimo de 5 respondentes** por grupo para análise segmentada.

### Segmentações Disponíveis
Quando há dados suficientes (≥5 respondentes):

1. **Por Unidade** - `getAnaliseUnidade(empresaId)`
2. **Por Setor** - `getAnaliseSetor(empresaId)`
3. **Por Cargo** - `getAnaliseCargo(empresaId)`
4. **Por Faixa Etária** - `getAnaliseFaixaEtaria(empresaId)`
5. **Por Gênero** - `getAnaliseGenero(empresaId)`

### Proteção de Dados
- Segmentos com menos de 5 respondentes são **automaticamente excluídos**
- Dados sempre **agregados** - nunca individuais
- Verificação automática via `verificarKAnonymityDetalhado(empresaId)`

## 🤖 Insights Automáticos

A função `gerarInsights(empresaId)` produz análise completa:

### 1. Resumo Executivo
- Score global e classificação
- Total de respostas e taxa de adesão

### 2. Dimensões Críticas
Top 3 dimensões com maiores scores (maior risco)

### 3. Dimensões Positivas
Top 3 dimensões com menores scores (menor risco)

### 4. Alertas Automáticos
- Taxa de risco crítico > 30%
- Taxa de adesão < 50%
- Dimensões com score > 15

### 5. Recomendações
Ações sugeridas baseadas nos resultados:
- Intervenção em dimensões críticas
- Aumento de engajamento
- Monitoramento contínuo

### 6. Pontos Fortes e Fracos
Análise qualitativa dos resultados

### 7. Comparação com Ciclo Anterior
Evolução temporal dos indicadores (quando disponível)

## 📤 Exportação de Dados

### Exportação PDF
`getDadosParaPDF(empresaId, periodoInicio, periodoFim)`

Inclui:
- Resumo executivo completo
- Distribuição de risco
- Scores por dimensão
- Estatísticas (mediana, desvio padrão, percentis)
- Gráficos (Box Plot, Histograma, Heatmap)
- Insights automáticos
- Análise por segmento (se K-Anonymity permitir)

### Exportação Excel
`getDadosParaExcel(empresaId, periodoInicio, periodoFim)`

Abas geradas:
1. **Resumo Executivo** - KPIs principais
2. **Distribuição** - Frequências por faixa
3. **Scores por Dimensão** - Estatísticas descritivas
4. **Percentis** - P10, P25, P50, P75, P90
5. **Análise por Segmento** - Por unidade/setor/cargo
6. **Tendência Temporal** - Evolução mensal
7. **Top Perguntas Críticas** - Ranking de questões críticas
8. **Top Perguntas Positivas** - Ranking de questões positivas

## 🔍 Uso das Funções

### Exemplo Básico
```typescript
import { calcularScores } from "@/lib/scoring";

const respostas = {
  demandas: [2, 3, 1, 2, 3, 2, 1, 2],
  controle: [3, 3, 4, 3, 3, 4],
  apoioGerencial: [2, 3, 2, 3, 2],
  apoioColegas: [3, 3, 3, 4],
  relacionamentos: [1, 1, 2, 1],
  papel: [3, 3, 4, 3, 3],
  mudancas: [2, 3, 3]
};

const resultado = calcularScores(respostas);
console.log(resultado.scoreGlobal); // 0-140
console.log(resultado.classificacao); // SATISFATORIO, ATENCAO ou CRITICO
```

### Exemplo Analytics
```typescript
import {
  calcularKPIs,
  calcularPercentis,
  gerarInsights,
  getDadosParaPDF
} from "@/lib/dashboard-analytics";

// KPIs principais
const kpis = await calcularKPIs("empresa123");

// Estatísticas avançadas
const percentis = await calcularPercentis("empresa123");
const boxPlot = await calcularBoxPlot("empresa123");

// Insights automáticos
const insights = await gerarInsights("empresa123");

// Exportação
const dadosPDF = await getDadosParaPDF(
  "empresa123",
  new Date("2024-01-01"),
  new Date("2024-12-31")
);
```

## 📁 Estrutura de Arquivos

```
lib/
├── scoring.ts                    # Algoritmo de cálculo de scores
└── dashboard-analytics.ts         # Analytics e estatísticas avançadas

types/
└── analytics.ts                   # Interfaces TypeScript
```

## 🎯 Indicadores de Qualidade

### Métricas Calculadas
1. **Taxa de Adesão** - % de colaboradores que responderam
2. **Índice Geral de Risco** - Média dos scores globais
3. **Score Mediano** - Mediana dos scores
4. **Desvio Padrão** - Dispersão dos dados
5. **Coeficiente de Variação** - Variabilidade relativa
6. **Taxa de Risco Alto** - % de colaboradores em nível crítico
7. **Tempo Médio de Resposta** - Em segundos

## ✅ Validações

### Validação de Entrada
- Número correto de perguntas por dimensão
- Valores dentro da escala (0-4)
- Tipos de dados corretos

### Validação de Privacidade
- K-Anonymity verificado antes de segmentações
- Mensagens informativas quando dados insuficientes
- Exclusão automática de grupos pequenos

## 🔄 Versão do Algoritmo

**Versão Atual:** 1.0.0

Todas as exportações incluem metadados com a versão do algoritmo utilizada para rastreabilidade.

## 📞 Suporte

Para dúvidas ou sugestões sobre o algoritmo de scoring, consulte:
- Documentação técnica em `/docs`
- Código fonte em `/lib/scoring.ts` e `/lib/dashboard-analytics.ts`
- Tipos em `/types/analytics.ts`
