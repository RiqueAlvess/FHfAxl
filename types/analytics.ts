// ============================================================================
// TYPES & INTERFACES PARA ANALYTICS DO HSE-IT
// ============================================================================

/**
 * Percentis calculados para os scores
 */
export interface Percentis {
  p10: number;
  p25: number;
  p50: number; // Mediana
  p75: number;
  p90: number;
}

/**
 * Outlier identificado no dataset
 */
export interface Outlier {
  valor: number;
  tipo: "inferior" | "superior";
  colaboradorId?: string; // Opcional, somente para uso interno
}

/**
 * Dados do Box Plot
 */
export interface BoxPlotData {
  min: number;
  q1: number;
  mediana: number;
  q3: number;
  max: number;
  outliers: Outlier[];
  iqr: number; // Intervalo interquartil
}

/**
 * Bin (intervalo) do histograma
 */
export interface HistogramaBin {
  inicio: number;
  fim: number;
  frequencia: number;
  percentual: number;
}

/**
 * Dados do histograma
 */
export interface HistogramaData {
  bins: HistogramaBin[];
  total: number;
}

/**
 * Dados de correlação entre variáveis
 */
export interface CorrelacaoData {
  coeficientePearson: number;
  coeficienteSpearman: number;
  pValor: number;
  significativo: boolean;
  interpretacao: string;
}

/**
 * Ponto de dados temporal
 */
export interface PontoTemporal {
  data: Date;
  scoreMedia: number;
  totalRespostas: number;
}

/**
 * Dados de tendência temporal
 */
export interface TendenciaData {
  pontos: PontoTemporal[];
  tendencia: "crescente" | "decrescente" | "estavel";
  taxaCrescimento: number; // % por período
  regressaoLinear: {
    inclinacao: number;
    intercepto: number;
    r2: number;
  };
}

/**
 * Pergunta crítica identificada
 */
export interface PerguntaCriticaData {
  dimensao: string;
  perguntaIndex: number;
  scoreMedia: number;
  desvioPadrao: number;
  percentualCritico: number; // % de respostas críticas (>=3)
  totalRespostas: number;
}

/**
 * Pergunta positiva identificada
 */
export interface PerguntaPositivaData {
  dimensao: string;
  perguntaIndex: number;
  scoreMedia: number;
  desvioPadrao: number;
  percentualPositivo: number; // % de respostas positivas (<=1)
  totalRespostas: number;
}

/**
 * Célula do heatmap
 */
export interface HeatmapCelula {
  dimensao: string;
  faixaScore: string;
  frequencia: number;
  percentual: number;
}

/**
 * Dados do heatmap
 */
export interface HeatmapData {
  celulas: HeatmapCelula[];
  dimensoes: string[];
  faixas: string[];
}

/**
 * Estatísticas de um segmento
 */
export interface SegmentoStats {
  segmentoNome: string;
  totalRespostas: number;
  scoreMedia: number;
  scoreMediano: number;
  desvioPadrao: number;
  distribuicao: {
    satisfatorio: number;
    atencao: number;
    critico: number;
  };
  percentis: Percentis;
  atendeKAnonymity: boolean;
}

/**
 * Análise comparativa por segmento
 */
export interface AnaliseSegmento {
  tipoSegmento: "unidade" | "setor" | "cargo" | "faixaEtaria" | "genero";
  segmentos: SegmentoStats[];
  totalGeral: number;
  mediaGeral: number;
}

/**
 * Comparação com ciclo anterior
 */
export interface ComparacaoCiclo {
  cicloAtual: {
    periodo: string;
    scoreMedia: number;
    totalRespostas: number;
  };
  cicloAnterior: {
    periodo: string;
    scoreMedia: number;
    totalRespostas: number;
  } | null;
  diferenca: number | null;
  percentualMudanca: number | null;
  melhorou: boolean | null;
}

/**
 * Dimensão com mudança significativa
 */
export interface DimensaoMudanca {
  dimensao: string;
  scoreAtual: number;
  scoreAnterior: number;
  diferenca: number;
  percentualMudanca: number;
  tipo: "melhora" | "piora";
}

/**
 * Alerta identificado
 */
export interface Alerta {
  tipo: "critico" | "atencao" | "info";
  titulo: string;
  descricao: string;
  dimensao?: string;
  prioridade: "alta" | "media" | "baixa";
}

/**
 * Recomendação de ação
 */
export interface Recomendacao {
  titulo: string;
  descricao: string;
  dimensao?: string;
  prioridade: "alta" | "media" | "baixa";
  acoes: string[];
}

/**
 * Insights automáticos gerados
 */
export interface InsightsData {
  resumoExecutivo: {
    scoreGlobal: number;
    classificacao: string;
    totalRespostas: number;
    taxaAdesao: number;
  };
  dimensoesCriticas: {
    dimensao: string;
    score: number;
    ranking: number;
  }[];
  dimensoesPositivas: {
    dimensao: string;
    score: number;
    ranking: number;
  }[];
  mudancas: DimensaoMudanca[];
  comparacaoCiclo: ComparacaoCiclo;
  alertas: Alerta[];
  recomendacoes: Recomendacao[];
  pontosFortesEFracos: {
    pontosFracos: string[];
    pontosMelhorias: string[];
    pontosFortes: string[];
  };
}

/**
 * Dados para exportação PDF
 */
export interface DadosExportPDF {
  empresa: {
    nome: string;
    logo?: string;
  };
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumo: {
    totalColaboradores: number;
    totalRespostas: number;
    taxaAdesao: number;
    scoreGlobal: number;
    classificacao: string;
  };
  distribuicaoRisco: {
    satisfatorio: number;
    atencao: number;
    critico: number;
  };
  scoresPorDimensao: {
    dimensao: string;
    score: number;
    classificacao: string;
  }[];
  estatisticas: {
    mediana: number;
    desvioPadrao: number;
    percentis: Percentis;
  };
  graficos: {
    boxPlot: BoxPlotData;
    histograma: HistogramaData;
    heatmap: HeatmapData;
  };
  insights: InsightsData;
  analiseSegmentos?: AnaliseSegmento[];
  metadata: {
    geradoEm: Date;
    versaoAlgoritmo: string;
  };
}

/**
 * Dados para exportação Excel
 */
export interface DadosExportExcel {
  // Aba: Resumo Executivo
  resumo: {
    totalColaboradores: number;
    totalRespostas: number;
    taxaAdesao: number;
    scoreGlobal: number;
    scoreMediano: number;
    desvioPadrao: number;
    classificacao: string;
  };

  // Aba: Distribuição
  distribuicao: {
    faixa: string;
    quantidade: number;
    percentual: number;
  }[];

  // Aba: Scores por Dimensão
  dimensoes: {
    dimensao: string;
    scoreMedia: number;
    desvioPadrao: number;
    minimo: number;
    maximo: number;
    mediana: number;
  }[];

  // Aba: Percentis
  percentis: {
    metrica: string;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  }[];

  // Aba: Análise por Segmento (se disponível)
  segmentos?: {
    tipo: string;
    segmento: string;
    totalRespostas: number;
    scoreMedia: number;
    classificacao: string;
  }[];

  // Aba: Tendência Temporal (se disponível)
  tendencia?: {
    periodo: string;
    scoreMedia: number;
    totalRespostas: number;
  }[];

  // Aba: Top Perguntas Críticas
  perguntasCriticas: {
    dimensao: string;
    pergunta: number;
    scoreMedia: number;
    percentualCritico: number;
  }[];

  // Aba: Top Perguntas Positivas
  perguntasPositivas: {
    dimensao: string;
    pergunta: number;
    scoreMedia: number;
    percentualPositivo: number;
  }[];

  // Metadata
  metadata: {
    geradoEm: Date;
    periodo: string;
    versaoAlgoritmo: string;
  };
}

/**
 * Configuração de K-Anonymity
 */
export interface KAnonymityConfig {
  minimoRespondentes: number;
  mostrarMensagemPrivacidade: boolean;
  permitirExportacao: boolean;
}

/**
 * Resultado de verificação de K-Anonymity
 */
export interface KAnonymityResult {
  atendeRequisito: boolean;
  totalRespondentes: number;
  minimoNecessario: number;
  mensagem?: string;
}
