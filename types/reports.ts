/**
 * Tipos para Sistema de Geração de Relatórios VIVAMENTE360
 */

// ============================================================================
// TIPOS DE RELATÓRIO
// ============================================================================

export type TipoRelatorio =
  | "executivo"
  | "completo"
  | "unidade"
  | "setor"
  | "evolucao";

export type FormatoRelatorio = "pdf" | "excel";

// ============================================================================
// FILTROS
// ============================================================================

export interface FiltrosRelatorio {
  empresaId: string;
  tipoRelatorio: TipoRelatorio;
  cicloAvaliacaoId?: string;
  unidadeId?: string;
  setorId?: string;
  cargoId?: string;
  periodoInicio?: Date;
  periodoFim?: Date;
}

// ============================================================================
// DADOS DO RELATÓRIO
// ============================================================================

export interface DadosRelatorioExecutivo {
  tipo: "executivo";
  empresa: {
    nome: string;
    logo?: string;
  };
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumoKPIs: {
    totalColaboradores: number;
    totalRespostas: number;
    taxaAdesao: number;
    scoreGlobal: number;
    classificacao: string;
  };
  graficoRadar: {
    dimensoes: string[];
    valores: number[];
  };
  top5PontosCriticos: Array<{
    dimensao: string;
    score: number;
    percentualCritico: number;
  }>;
  recomendacoes: Array<{
    titulo: string;
    descricao: string;
    prioridade: "alta" | "media" | "baixa";
  }>;
}

export interface DadosRelatorioCompleto {
  tipo: "completo";
  empresa: {
    nome: string;
    logo?: string;
  };
  periodo: {
    inicio: Date;
    fim: Date;
  };
  kpis: {
    totalColaboradores: number;
    totalRespostas: number;
    taxaAdesao: number;
    scoreGlobal: number;
    scoreMediano: number;
    desvioPadrao: number;
    classificacao: string;
  };
  distribuicaoRisco: {
    satisfatorio: number;
    atencao: number;
    critico: number;
  };
  dimensoes: Array<{
    nome: string;
    score: number;
    desvioPadrao: number;
    classificacao: string;
  }>;
  segmentos: Array<{
    tipo: string;
    nome: string;
    scoreMedia: number;
    totalRespostas: number;
  }>;
  insights: {
    pontosFracos: string[];
    pontosMelhorias: string[];
    pontosFortes: string[];
  };
  alertas: Array<{
    tipo: string;
    titulo: string;
    descricao: string;
  }>;
  recomendacoes: Array<{
    titulo: string;
    descricao: string;
    prioridade: string;
    acoes?: string[];
  }>;
}

export interface DadosRelatorioUnidadeSetor {
  tipo: "unidade" | "setor";
  empresa: {
    nome: string;
    logo?: string;
  };
  segmento: {
    tipo: string;
    nome: string;
  };
  periodo: {
    inicio: Date;
    fim: Date;
  };
  dadosSegmento: {
    totalRespostas: number;
    scoreMedia: number;
    scoreMediano: number;
    distribuicao: {
      satisfatorio: number;
      atencao: number;
      critico: number;
    };
  };
  comparativoEmpresa: {
    scoreMediaEmpresa: number;
    diferencaPercentual: number;
    melhorOuPior: "melhor" | "pior" | "igual";
  };
  dimensoes: Array<{
    nome: string;
    scoreSegmento: number;
    scoreEmpresa: number;
    diferenca: number;
  }>;
}

export interface DadosRelatorioEvolucao {
  tipo: "evolucao";
  empresa: {
    nome: string;
    logo?: string;
  };
  periodo: {
    inicio: Date;
    fim: Date;
  };
  ciclos: Array<{
    nome: string;
    periodo: string;
    scoreMedia: number;
    totalRespostas: number;
  }>;
  tendencia: {
    tipo: "crescente" | "decrescente" | "estavel";
    percentualMudanca: number;
    interpretacao: string;
  };
  evolucaoDimensoes: Array<{
    dimensao: string;
    scores: number[];
    tendencia: "crescente" | "decrescente" | "estavel";
  }>;
}

export type DadosRelatorio =
  | DadosRelatorioExecutivo
  | DadosRelatorioCompleto
  | DadosRelatorioUnidadeSetor
  | DadosRelatorioEvolucao;

// ============================================================================
// CONFIGURAÇÃO DE RELATÓRIO
// ============================================================================

export interface ConfiguracaoRelatorio {
  incluirLogo: boolean;
  incluirGraficos: boolean;
  incluirTabelas: boolean;
  incluirInsights: boolean;
  incluirRecomendacoes: boolean;
  corPrimaria?: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface GerarRelatorioRequest {
  filtros: FiltrosRelatorio;
  formato: FormatoRelatorio;
  configuracao?: ConfiguracaoRelatorio;
}

export interface GerarRelatorioResponse {
  sucesso: boolean;
  mensagem?: string;
  arquivoUrl?: string;
  arquivoNome?: string;
  expiracaoUrl?: Date;
  erro?: string;
}

export interface PreviewRelatorioRequest {
  filtros: FiltrosRelatorio;
}

export interface PreviewRelatorioResponse {
  sucesso: boolean;
  dados?: DadosRelatorio;
  erro?: string;
}

// ============================================================================
// METADADOS DE ARQUIVO
// ============================================================================

export interface ArquivoRelatorio {
  id: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  formato: FormatoRelatorio;
  tamanhoBytes: number;
  geradoEm: Date;
  expiracaoEm: Date;
  usuarioId: string;
  empresaId: string;
}

// ============================================================================
// CONFIGURAÇÃO DE GRÁFICOS
// ============================================================================

export interface GraficoConfig {
  tipo: "radar" | "bar" | "line" | "pie" | "boxplot" | "heatmap";
  largura: number;
  altura: number;
  titulo?: string;
  dados: any;
}

export interface GraficoImagem {
  tipo: string;
  base64: string;
  largura: number;
  altura: number;
}
