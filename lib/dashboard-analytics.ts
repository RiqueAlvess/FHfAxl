import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  Percentis,
  BoxPlotData,
  Outlier,
  HistogramaData,
  HistogramaBin,
  CorrelacaoData,
  TendenciaData,
  PontoTemporal,
  PerguntaCriticaData,
  PerguntaPositivaData,
  HeatmapData,
  HeatmapCelula,
  AnaliseSegmento,
  SegmentoStats,
  InsightsData,
  DadosExportPDF,
  DadosExportExcel,
  KAnonymityResult,
  DimensaoMudanca,
  Alerta,
  Recomendacao,
  ComparacaoCiclo,
} from "@/types/analytics";

// ============================================================================
// INTERFACES LEGADAS (mantidas para compatibilidade)
// ============================================================================

export interface DashboardKPIs {
  totalColaboradores: number;
  taxaAdesao: number;
  indiceGeralRisco: number;
  scoreMediano: number;
  desvioPadrao: number;
  coeficienteVariacao: number;
  taxaRiscoAlto: number;
  tempoMedioResposta: number;
  numeroQuestoesCriticas: number;
}

export interface DistribuicaoRisco {
  satisfatorio: number;
  atencao: number;
  critico: number;
}

export interface ScorePorDimensao {
  dimensao: string;
  scoreMedio: number;
  desvioPadrao: number;
  count: number;
}

export interface PerguntaCritica {
  perguntaId: number;
  texto: string;
  scoreMedia: number;
  percentualCritico: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const MIN_GROUP_SIZE = 5; // K-Anonymity mínimo
const DIMENSOES_CONFIG = [
  { key: "scoreDemandas", nome: "Demandas", tipo: "negativa" },
  { key: "scoreControle", nome: "Controle", tipo: "positiva" },
  { key: "scoreApoioGerencial", nome: "Apoio Gerencial", tipo: "positiva" },
  { key: "scoreApoioColegas", nome: "Apoio de Colegas", tipo: "positiva" },
  { key: "scoreRelacionamentos", nome: "Relacionamentos", tipo: "negativa" },
  { key: "scorePapel", nome: "Papel", tipo: "positiva" },
  { key: "scoreMudancas", nome: "Mudanças", tipo: "positiva" },
] as const;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Calcula percentil de um array ordenado
 */
function calcularPercentil(arrayOrdenado: number[], percentil: number): number {
  if (arrayOrdenado.length === 0) return 0;

  const index = (percentil / 100) * (arrayOrdenado.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return arrayOrdenado[lower];
  }

  return arrayOrdenado[lower] * (1 - weight) + arrayOrdenado[upper] * weight;
}

/**
 * Verifica se um grupo atende K-Anonymity
 */
function atendeKAnonymity(total: number): boolean {
  return total >= MIN_GROUP_SIZE;
}

/**
 * Calcula coeficiente de correlação de Pearson
 */
function correlacaoPearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerador = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerador += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  if (denomX === 0 || denomY === 0) return 0;
  return numerador / Math.sqrt(denomX * denomY);
}

/**
 * Calcula regressão linear simples
 */
function regressaoLinear(x: number[], y: number[]): { inclinacao: number; intercepto: number; r2: number } {
  const n = x.length;
  if (n === 0) return { inclinacao: 0, intercepto: 0, r2: 0 };

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerador = 0;
  let denominador = 0;

  for (let i = 0; i < n; i++) {
    numerador += (x[i] - meanX) * (y[i] - meanY);
    denominador += (x[i] - meanX) ** 2;
  }

  const inclinacao = denominador === 0 ? 0 : numerador / denominador;
  const intercepto = meanY - inclinacao * meanX;

  // Calcular R²
  const yPred = x.map(xi => inclinacao * xi + intercepto);
  const ssRes = y.reduce((acc, yi, i) => acc + (yi - yPred[i]) ** 2, 0);
  const ssTot = y.reduce((acc, yi) => acc + (yi - meanY) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { inclinacao, intercepto, r2 };
}

// ============================================================================
// FUNÇÕES PRINCIPAIS (LEGADAS)
// ============================================================================

/**
 * Calcula os KPIs principais do dashboard
 */
export async function calcularKPIs(empresaId: string): Promise<DashboardKPIs> {
  // Total de colaboradores
  const totalColaboradores = await prisma.colaborador.count({
    where: { empresaId, ativo: true },
  });

  // Respostas
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: {
      scoreGlobal: true,
      classificacao: true,
      tempoResposta: true,
      scoreDemandas: true,
      scoreControle: true,
      scoreApoioGerencial: true,
      scoreApoioColegas: true,
      scoreRelacionamentos: true,
      scorePapel: true,
      scoreMudancas: true,
    },
  });

  const totalRespostas = respostas.length;

  if (totalRespostas === 0) {
    return {
      totalColaboradores,
      taxaAdesao: 0,
      indiceGeralRisco: 0,
      scoreMediano: 0,
      desvioPadrao: 0,
      coeficienteVariacao: 0,
      taxaRiscoAlto: 0,
      tempoMedioResposta: 0,
      numeroQuestoesCriticas: 0,
    };
  }

  // Taxa de adesão
  const taxaAdesao = (totalRespostas / totalColaboradores) * 100;

  // Índice Geral de Risco (média dos scores)
  const somaScores = respostas.reduce((acc, r) => acc + r.scoreGlobal, 0);
  const indiceGeralRisco = somaScores / totalRespostas;

  // Score mediano
  const scoresSorted = respostas.map((r) => r.scoreGlobal).sort((a, b) => a - b);
  const scoreMediano =
    totalRespostas % 2 === 0
      ? (scoresSorted[totalRespostas / 2 - 1] + scoresSorted[totalRespostas / 2]) / 2
      : scoresSorted[Math.floor(totalRespostas / 2)];

  // Desvio padrão
  const variancia =
    respostas.reduce((acc, r) => acc + Math.pow(r.scoreGlobal - indiceGeralRisco, 2), 0) /
    totalRespostas;
  const desvioPadrao = Math.sqrt(variancia);

  // Coeficiente de variação
  const coeficienteVariacao = indiceGeralRisco === 0 ? 0 : (desvioPadrao / indiceGeralRisco) * 100;

  // Taxa de risco alto (crítico)
  const riscoAlto = respostas.filter((r) => r.classificacao === "CRITICO").length;
  const taxaRiscoAlto = (riscoAlto / totalRespostas) * 100;

  // Tempo médio de resposta
  const tempoTotal = respostas.reduce((acc, r) => acc + (r.tempoResposta || 0), 0);
  const tempoMedioResposta = Math.floor(tempoTotal / totalRespostas);

  // Número de questões críticas (score > 15 em alguma dimensão)
  const dimensoesCriticas = respostas.filter(
    (r) =>
      r.scoreDemandas > 15 ||
      r.scoreControle > 15 ||
      r.scoreApoioGerencial > 15 ||
      r.scoreApoioColegas > 15 ||
      r.scoreRelacionamentos > 15 ||
      r.scorePapel > 15 ||
      r.scoreMudancas > 15
  );
  const numeroQuestoesCriticas = dimensoesCriticas.length;

  return {
    totalColaboradores,
    taxaAdesao: Number(taxaAdesao.toFixed(1)),
    indiceGeralRisco: Number(indiceGeralRisco.toFixed(2)),
    scoreMediano: Number(scoreMediano.toFixed(2)),
    desvioPadrao: Number(desvioPadrao.toFixed(2)),
    coeficienteVariacao: Number(coeficienteVariacao.toFixed(2)),
    taxaRiscoAlto: Number(taxaRiscoAlto.toFixed(1)),
    tempoMedioResposta,
    numeroQuestoesCriticas,
  };
}

/**
 * Retorna a distribuição de respostas por nível de risco
 */
export async function getDistribuicaoRisco(empresaId: string): Promise<DistribuicaoRisco> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: { classificacao: true },
  });

  const satisfatorio = respostas.filter((r) => r.classificacao === "SATISFATORIO").length;
  const atencao = respostas.filter((r) => r.classificacao === "ATENCAO").length;
  const critico = respostas.filter((r) => r.classificacao === "CRITICO").length;

  return {
    satisfatorio,
    atencao,
    critico,
  };
}

/**
 * Retorna scores médios por dimensão
 */
export async function getScoresPorDimensao(empresaId: string): Promise<ScorePorDimensao[]> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: {
      scoreDemandas: true,
      scoreControle: true,
      scoreApoioGerencial: true,
      scoreApoioColegas: true,
      scoreRelacionamentos: true,
      scorePapel: true,
      scoreMudancas: true,
    },
  });

  if (respostas.length === 0) return [];

  return DIMENSOES_CONFIG.map((dim) => {
    const scores = respostas.map((r) => r[dim.key as keyof typeof r] as number);
    const media = scores.reduce((acc, s) => acc + s, 0) / scores.length;
    const variancia =
      scores.reduce((acc, s) => acc + Math.pow(s - media, 2), 0) / scores.length;
    const desvioPadrao = Math.sqrt(variancia);

    return {
      dimensao: dim.nome,
      scoreMedio: Number(media.toFixed(2)),
      desvioPadrao: Number(desvioPadrao.toFixed(2)),
      count: scores.length,
    };
  });
}

/**
 * Verifica K-Anonymity (mínimo de respondentes)
 */
export async function verificarKAnonymity(empresaId: string): Promise<boolean> {
  const minGroupSize = parseInt(process.env.MIN_GROUP_SIZE || "5");

  const totalRespostas = await prisma.resposta.count({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
  });

  return totalRespostas >= minGroupSize;
}

// ============================================================================
// FUNÇÕES ESTATÍSTICAS AVANÇADAS
// ============================================================================

/**
 * Calcula percentis (P10, P25, P50, P75, P90) dos scores globais
 */
export async function calcularPercentis(empresaId: string): Promise<Percentis> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: { scoreGlobal: true },
  });

  if (respostas.length === 0) {
    return { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 };
  }

  const scores = respostas.map((r) => r.scoreGlobal).sort((a, b) => a - b);

  return {
    p10: Number(calcularPercentil(scores, 10).toFixed(2)),
    p25: Number(calcularPercentil(scores, 25).toFixed(2)),
    p50: Number(calcularPercentil(scores, 50).toFixed(2)),
    p75: Number(calcularPercentil(scores, 75).toFixed(2)),
    p90: Number(calcularPercentil(scores, 90).toFixed(2)),
  };
}

/**
 * Calcula dados para Box Plot
 */
export async function calcularBoxPlot(empresaId: string): Promise<BoxPlotData> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: { scoreGlobal: true },
  });

  if (respostas.length === 0) {
    return {
      min: 0,
      q1: 0,
      mediana: 0,
      q3: 0,
      max: 0,
      outliers: [],
      iqr: 0,
    };
  }

  const scores = respostas.map((r) => r.scoreGlobal).sort((a, b) => a - b);

  const q1 = calcularPercentil(scores, 25);
  const mediana = calcularPercentil(scores, 50);
  const q3 = calcularPercentil(scores, 75);
  const iqr = q3 - q1;

  // Detectar outliers (método IQR)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers: Outlier[] = [];
  let min = Infinity;
  let max = -Infinity;

  for (const score of scores) {
    if (score < lowerBound) {
      outliers.push({ valor: score, tipo: "inferior" });
    } else if (score > upperBound) {
      outliers.push({ valor: score, tipo: "superior" });
    } else {
      // Valores dentro dos limites
      if (score < min) min = score;
      if (score > max) max = score;
    }
  }

  // Se todos são outliers, usar valores reais
  if (min === Infinity) min = scores[0];
  if (max === -Infinity) max = scores[scores.length - 1];

  return {
    min: Number(min.toFixed(2)),
    q1: Number(q1.toFixed(2)),
    mediana: Number(mediana.toFixed(2)),
    q3: Number(q3.toFixed(2)),
    max: Number(max.toFixed(2)),
    outliers,
    iqr: Number(iqr.toFixed(2)),
  };
}

/**
 * Calcula histograma de distribuição de scores
 */
export async function calcularHistograma(empresaId: string, numeroBins: number = 10): Promise<HistogramaData> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: { scoreGlobal: true },
  });

  if (respostas.length === 0) {
    return { bins: [], total: 0 };
  }

  const scores = respostas.map((r) => r.scoreGlobal);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const binSize = (max - min) / numeroBins;

  const bins: HistogramaBin[] = [];

  for (let i = 0; i < numeroBins; i++) {
    const inicio = min + i * binSize;
    const fim = i === numeroBins - 1 ? max : inicio + binSize;

    const frequencia = scores.filter((s) => s >= inicio && s <= fim).length;

    bins.push({
      inicio: Number(inicio.toFixed(2)),
      fim: Number(fim.toFixed(2)),
      frequencia,
      percentual: Number(((frequencia / scores.length) * 100).toFixed(2)),
    });
  }

  return {
    bins,
    total: scores.length,
  };
}

/**
 * Calcula correlação entre tempo de resposta e score
 */
export async function calcularCorrelacao(empresaId: string): Promise<CorrelacaoData> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
      tempoResposta: { not: null },
    },
    select: {
      tempoResposta: true,
      scoreGlobal: true,
    },
  });

  if (respostas.length < 3) {
    return {
      coeficientePearson: 0,
      coeficienteSpearman: 0,
      pValor: 1,
      significativo: false,
      interpretacao: "Dados insuficientes para análise de correlação",
    };
  }

  const tempos = respostas.map((r) => r.tempoResposta || 0);
  const scores = respostas.map((r) => r.scoreGlobal);

  const pearson = correlacaoPearson(tempos, scores);

  // Spearman (correlação de ranks)
  const ranksTempos = tempos.map((t, i) => ({ valor: t, index: i }))
    .sort((a, b) => a.valor - b.valor)
    .map((item, rank) => ({ index: item.index, rank: rank + 1 }))
    .sort((a, b) => a.index - b.index)
    .map((item) => item.rank);

  const ranksScores = scores.map((s, i) => ({ valor: s, index: i }))
    .sort((a, b) => a.valor - b.valor)
    .map((item, rank) => ({ index: item.index, rank: rank + 1 }))
    .sort((a, b) => a.index - b.index)
    .map((item) => item.rank);

  const spearman = correlacaoPearson(ranksTempos, ranksScores);

  // P-valor simplificado (aproximação)
  const n = respostas.length;
  const t = Math.abs(pearson) * Math.sqrt((n - 2) / (1 - pearson * pearson));
  const pValor = t > 2 ? 0.05 : 0.5; // Simplificado
  const significativo = pValor < 0.05;

  let interpretacao = "";
  const absPearson = Math.abs(pearson);
  if (absPearson < 0.3) {
    interpretacao = "Correlação fraca ou inexistente";
  } else if (absPearson < 0.7) {
    interpretacao = "Correlação moderada";
  } else {
    interpretacao = "Correlação forte";
  }

  if (pearson > 0) {
    interpretacao += " positiva (maior tempo = maior score)";
  } else if (pearson < 0) {
    interpretacao += " negativa (maior tempo = menor score)";
  }

  return {
    coeficientePearson: Number(pearson.toFixed(3)),
    coeficienteSpearman: Number(spearman.toFixed(3)),
    pValor: Number(pValor.toFixed(3)),
    significativo,
    interpretacao,
  };
}

/**
 * Calcula tendência temporal dos scores
 */
export async function calcularTendencia(empresaId: string): Promise<TendenciaData> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: {
      scoreGlobal: true,
      criadoEm: true,
    },
    orderBy: {
      criadoEm: "asc",
    },
  });

  if (respostas.length < 2) {
    return {
      pontos: [],
      tendencia: "estavel",
      taxaCrescimento: 0,
      regressaoLinear: {
        inclinacao: 0,
        intercepto: 0,
        r2: 0,
      },
    };
  }

  // Agrupar por mês
  const pontosPorMes = new Map<string, { soma: number; count: number; data: Date }>();

  respostas.forEach((r) => {
    const mes = `${r.criadoEm.getFullYear()}-${String(r.criadoEm.getMonth() + 1).padStart(2, "0")}`;
    if (!pontosPorMes.has(mes)) {
      pontosPorMes.set(mes, { soma: 0, count: 0, data: r.criadoEm });
    }
    const ponto = pontosPorMes.get(mes)!;
    ponto.soma += r.scoreGlobal;
    ponto.count += 1;
  });

  const pontos: PontoTemporal[] = Array.from(pontosPorMes.entries()).map(([_, v]) => ({
    data: v.data,
    scoreMedia: Number((v.soma / v.count).toFixed(2)),
    totalRespostas: v.count,
  }));

  // Regressão linear
  const x = pontos.map((_, i) => i); // Índices temporais
  const y = pontos.map((p) => p.scoreMedia);
  const regressao = regressaoLinear(x, y);

  // Determinar tendência
  let tendencia: "crescente" | "decrescente" | "estavel";
  if (Math.abs(regressao.inclinacao) < 0.5) {
    tendencia = "estavel";
  } else if (regressao.inclinacao > 0) {
    tendencia = "crescente";
  } else {
    tendencia = "decrescente";
  }

  // Taxa de crescimento (% por período)
  const primeiroScore = pontos[0].scoreMedia;
  const ultimoScore = pontos[pontos.length - 1].scoreMedia;
  const taxaCrescimento = primeiroScore === 0 ? 0 :
    Number((((ultimoScore - primeiroScore) / primeiroScore) * 100).toFixed(2));

  return {
    pontos,
    tendencia,
    taxaCrescimento,
    regressaoLinear: {
      inclinacao: Number(regressao.inclinacao.toFixed(3)),
      intercepto: Number(regressao.intercepto.toFixed(2)),
      r2: Number(regressao.r2.toFixed(3)),
    },
  };
}

/**
 * Retorna top N perguntas mais críticas
 */
export async function getPerguntasCriticas(empresaId: string, top: number = 10): Promise<PerguntaCriticaData[]> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: {
      respostasDemandas: true,
      respostasControle: true,
      respostasApoioGerencial: true,
      respostasApoioColegas: true,
      respostasRelacionamentos: true,
      respostasPapel: true,
      respostasMudancas: true,
    },
  });

  if (respostas.length === 0) return [];

  const analise: Map<string, { soma: number; count: number; criticos: number }> = new Map();

  const dimensoes = [
    { key: "respostasDemandas", nome: "Demandas", total: 8 },
    { key: "respostasControle", nome: "Controle", total: 6 },
    { key: "respostasApoioGerencial", nome: "Apoio Gerencial", total: 5 },
    { key: "respostasApoioColegas", nome: "Apoio de Colegas", total: 4 },
    { key: "respostasRelacionamentos", nome: "Relacionamentos", total: 4 },
    { key: "respostasPapel", nome: "Papel", total: 5 },
    { key: "respostasMudancas", nome: "Mudanças", total: 3 },
  ];

  respostas.forEach((resposta) => {
    dimensoes.forEach((dim) => {
      const respostasArray = resposta[dim.key as keyof typeof resposta] as number[];
      if (!respostasArray || !Array.isArray(respostasArray)) return;

      respostasArray.forEach((valor, index) => {
        const chave = `${dim.nome}:${index}`;
        if (!analise.has(chave)) {
          analise.set(chave, { soma: 0, count: 0, criticos: 0 });
        }
        const stats = analise.get(chave)!;
        stats.soma += valor;
        stats.count += 1;
        if (valor >= 3) stats.criticos += 1; // Respostas 3 ou 4 são críticas
      });
    });
  });

  const resultados: PerguntaCriticaData[] = [];

  analise.forEach((stats, chave) => {
    const [dimensao, indexStr] = chave.split(":");
    const scoreMedia = stats.soma / stats.count;
    const percentualCritico = (stats.criticos / stats.count) * 100;

    // Calcular desvio padrão (simplificado)
    const desvioPadrao = Math.sqrt(
      (stats.soma / stats.count) * (1 - stats.soma / stats.count)
    );

    resultados.push({
      dimensao,
      perguntaIndex: parseInt(indexStr),
      scoreMedia: Number(scoreMedia.toFixed(2)),
      desvioPadrao: Number(desvioPadrao.toFixed(2)),
      percentualCritico: Number(percentualCritico.toFixed(1)),
      totalRespostas: stats.count,
    });
  });

  // Ordenar por percentual crítico (maior para menor)
  return resultados
    .sort((a, b) => b.percentualCritico - a.percentualCritico)
    .slice(0, top);
}

/**
 * Retorna top N perguntas mais positivas
 */
export async function getPerguntasPositivas(empresaId: string, top: number = 10): Promise<PerguntaPositivaData[]> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: {
      respostasDemandas: true,
      respostasControle: true,
      respostasApoioGerencial: true,
      respostasApoioColegas: true,
      respostasRelacionamentos: true,
      respostasPapel: true,
      respostasMudancas: true,
    },
  });

  if (respostas.length === 0) return [];

  const analise: Map<string, { soma: number; count: number; positivos: number }> = new Map();

  const dimensoes = [
    { key: "respostasDemandas", nome: "Demandas" },
    { key: "respostasControle", nome: "Controle" },
    { key: "respostasApoioGerencial", nome: "Apoio Gerencial" },
    { key: "respostasApoioColegas", nome: "Apoio de Colegas" },
    { key: "respostasRelacionamentos", nome: "Relacionamentos" },
    { key: "respostasPapel", nome: "Papel" },
    { key: "respostasMudancas", nome: "Mudanças" },
  ];

  respostas.forEach((resposta) => {
    dimensoes.forEach((dim) => {
      const respostasArray = resposta[dim.key as keyof typeof resposta] as number[];
      if (!respostasArray || !Array.isArray(respostasArray)) return;

      respostasArray.forEach((valor, index) => {
        const chave = `${dim.nome}:${index}`;
        if (!analise.has(chave)) {
          analise.set(chave, { soma: 0, count: 0, positivos: 0 });
        }
        const stats = analise.get(chave)!;
        stats.soma += valor;
        stats.count += 1;
        if (valor <= 1) stats.positivos += 1; // Respostas 0 ou 1 são positivas
      });
    });
  });

  const resultados: PerguntaPositivaData[] = [];

  analise.forEach((stats, chave) => {
    const [dimensao, indexStr] = chave.split(":");
    const scoreMedia = stats.soma / stats.count;
    const percentualPositivo = (stats.positivos / stats.count) * 100;

    const desvioPadrao = Math.sqrt(
      (stats.soma / stats.count) * (1 - stats.soma / stats.count)
    );

    resultados.push({
      dimensao,
      perguntaIndex: parseInt(indexStr),
      scoreMedia: Number(scoreMedia.toFixed(2)),
      desvioPadrao: Number(desvioPadrao.toFixed(2)),
      percentualPositivo: Number(percentualPositivo.toFixed(1)),
      totalRespostas: stats.count,
    });
  });

  // Ordenar por percentual positivo (maior para menor)
  return resultados
    .sort((a, b) => b.percentualPositivo - a.percentualPositivo)
    .slice(0, top);
}

/**
 * Gera dados para heatmap (dimensão x faixa de score)
 */
export async function getHeatmapData(empresaId: string): Promise<HeatmapData> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    select: {
      scoreDemandas: true,
      scoreControle: true,
      scoreApoioGerencial: true,
      scoreApoioColegas: true,
      scoreRelacionamentos: true,
      scorePapel: true,
      scoreMudancas: true,
    },
  });

  if (respostas.length === 0) {
    return { celulas: [], dimensoes: [], faixas: [] };
  }

  const faixas = ["0-5", "5-10", "10-15", "15-20"];
  const dimensoes = DIMENSOES_CONFIG.map((d) => d.nome);

  const celulas: HeatmapCelula[] = [];

  DIMENSOES_CONFIG.forEach((dim) => {
    const scores = respostas.map((r) => r[dim.key as keyof typeof r] as number);

    faixas.forEach((faixa) => {
      const [min, max] = faixa.split("-").map(Number);
      const frequencia = scores.filter((s) => s >= min && s < max).length;
      const percentual = (frequencia / scores.length) * 100;

      celulas.push({
        dimensao: dim.nome,
        faixaScore: faixa,
        frequencia,
        percentual: Number(percentual.toFixed(2)),
      });
    });
  });

  return {
    celulas,
    dimensoes,
    faixas,
  };
}

// ============================================================================
// ANÁLISE POR SEGMENTO COM K-ANONYMITY
// ============================================================================

/**
 * Função genérica para análise por segmento
 */
async function analisarPorSegmento(
  empresaId: string,
  campo: string,
  tipoSegmento: "unidade" | "setor" | "cargo" | "faixaEtaria" | "genero"
): Promise<AnaliseSegmento> {
  const respostas = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
    include: {
      colaborador: {
        select: {
          [campo]: true,
        },
      },
    },
  });

  if (respostas.length === 0) {
    return {
      tipoSegmento,
      segmentos: [],
      totalGeral: 0,
      mediaGeral: 0,
    };
  }

  // Agrupar por segmento
  const segmentosMap = new Map<string, any[]>();

  respostas.forEach((resposta) => {
    const valorSegmento = (resposta.colaborador as any)[campo];
    const segmentoNome = valorSegmento || "Não informado";

    if (!segmentosMap.has(segmentoNome)) {
      segmentosMap.set(segmentoNome, []);
    }
    segmentosMap.get(segmentoNome)!.push(resposta);
  });

  // Calcular estatísticas por segmento
  const segmentos: SegmentoStats[] = [];

  segmentosMap.forEach((respostasSegmento, segmentoNome) => {
    const totalRespostas = respostasSegmento.length;
    const atendeK = atendeKAnonymity(totalRespostas);

    if (!atendeK) {
      // Não incluir segmentos que não atendem K-Anonymity
      return;
    }

    const scores = respostasSegmento.map((r) => r.scoreGlobal).sort((a, b) => a - b);
    const scoreMedia = scores.reduce((a, b) => a + b, 0) / scores.length;
    const scoreMediano = calcularPercentil(scores, 50);

    const variancia = scores.reduce((acc, s) => acc + Math.pow(s - scoreMedia, 2), 0) / scores.length;
    const desvioPadrao = Math.sqrt(variancia);

    const percentis: Percentis = {
      p10: Number(calcularPercentil(scores, 10).toFixed(2)),
      p25: Number(calcularPercentil(scores, 25).toFixed(2)),
      p50: Number(calcularPercentil(scores, 50).toFixed(2)),
      p75: Number(calcularPercentil(scores, 75).toFixed(2)),
      p90: Number(calcularPercentil(scores, 90).toFixed(2)),
    };

    const distribuicao = {
      satisfatorio: respostasSegmento.filter((r) => r.classificacao === "SATISFATORIO").length,
      atencao: respostasSegmento.filter((r) => r.classificacao === "ATENCAO").length,
      critico: respostasSegmento.filter((r) => r.classificacao === "CRITICO").length,
    };

    segmentos.push({
      segmentoNome,
      totalRespostas,
      scoreMedia: Number(scoreMedia.toFixed(2)),
      scoreMediano: Number(scoreMediano.toFixed(2)),
      desvioPadrao: Number(desvioPadrao.toFixed(2)),
      distribuicao,
      percentis,
      atendeKAnonymity: true,
    });
  });

  const totalGeral = respostas.length;
  const mediaGeral = respostas.reduce((a, b) => a + b.scoreGlobal, 0) / totalGeral;

  return {
    tipoSegmento,
    segmentos: segmentos.sort((a, b) => b.scoreMedia - a.scoreMedia),
    totalGeral,
    mediaGeral: Number(mediaGeral.toFixed(2)),
  };
}

/**
 * Análise por Unidade
 */
export async function getAnaliseUnidade(empresaId: string): Promise<AnaliseSegmento> {
  return analisarPorSegmento(empresaId, "unidade", "unidade");
}

/**
 * Análise por Setor
 */
export async function getAnaliseSetor(empresaId: string): Promise<AnaliseSegmento> {
  return analisarPorSegmento(empresaId, "setor", "setor");
}

/**
 * Análise por Cargo
 */
export async function getAnaliseCargo(empresaId: string): Promise<AnaliseSegmento> {
  return analisarPorSegmento(empresaId, "cargo", "cargo");
}

/**
 * Análise por Faixa Etária
 */
export async function getAnaliseFaixaEtaria(empresaId: string): Promise<AnaliseSegmento> {
  return analisarPorSegmento(empresaId, "faixaEtaria", "faixaEtaria");
}

/**
 * Análise por Gênero
 */
export async function getAnaliseGenero(empresaId: string): Promise<AnaliseSegmento> {
  return analisarPorSegmento(empresaId, "genero", "genero");
}

// ============================================================================
// INSIGHTS AUTOMÁTICOS
// ============================================================================

/**
 * Gera insights automáticos completos
 */
export async function gerarInsights(empresaId: string): Promise<InsightsData> {
  // Buscar dados necessários
  const kpis = await calcularKPIs(empresaId);
  const scoresDimensoes = await getScoresPorDimensao(empresaId);
  const distribuicao = await getDistribuicaoRisco(empresaId);

  // Resumo executivo
  const resumoExecutivo = {
    scoreGlobal: kpis.indiceGeralRisco,
    classificacao:
      kpis.indiceGeralRisco <= 40 ? "SATISFATÓRIO" :
      kpis.indiceGeralRisco <= 80 ? "ATENÇÃO" : "CRÍTICO",
    totalRespostas: distribuicao.satisfatorio + distribuicao.atencao + distribuicao.critico,
    taxaAdesao: kpis.taxaAdesao,
  };

  // Dimensões críticas (top 3 maiores scores)
  const dimensoesCriticas = scoresDimensoes
    .sort((a, b) => b.scoreMedio - a.scoreMedio)
    .slice(0, 3)
    .map((d, index) => ({
      dimensao: d.dimensao,
      score: d.scoreMedio,
      ranking: index + 1,
    }));

  // Dimensões positivas (top 3 menores scores)
  const dimensoesPositivas = scoresDimensoes
    .sort((a, b) => a.scoreMedio - b.scoreMedio)
    .slice(0, 3)
    .map((d, index) => ({
      dimensao: d.dimensao,
      score: d.scoreMedio,
      ranking: index + 1,
    }));

  // Comparação com ciclo anterior (simplificado - requer dados históricos)
  const comparacaoCiclo: ComparacaoCiclo = {
    cicloAtual: {
      periodo: "Atual",
      scoreMedia: kpis.indiceGeralRisco,
      totalRespostas: resumoExecutivo.totalRespostas,
    },
    cicloAnterior: null,
    diferenca: null,
    percentualMudanca: null,
    melhorou: null,
  };

  // Mudanças (requer dados históricos - placeholder)
  const mudancas: DimensaoMudanca[] = [];

  // Gerar alertas
  const alertas: Alerta[] = [];

  if (kpis.taxaRiscoAlto > 30) {
    alertas.push({
      tipo: "critico",
      titulo: "Alto percentual de risco crítico",
      descricao: `${kpis.taxaRiscoAlto.toFixed(1)}% dos colaboradores apresentam risco crítico`,
      prioridade: "alta",
    });
  }

  if (kpis.taxaAdesao < 50) {
    alertas.push({
      tipo: "atencao",
      titulo: "Taxa de adesão baixa",
      descricao: `Apenas ${kpis.taxaAdesao.toFixed(1)}% dos colaboradores responderam`,
      prioridade: "media",
    });
  }

  dimensoesCriticas.forEach((dim) => {
    if (dim.score > 15) {
      alertas.push({
        tipo: "atencao",
        titulo: `Dimensão "${dim.dimensao}" crítica`,
        descricao: `Score de ${dim.score} indica necessidade de atenção`,
        dimensao: dim.dimensao,
        prioridade: "alta",
      });
    }
  });

  // Gerar recomendações
  const recomendacoes: Recomendacao[] = [];

  if (dimensoesCriticas.length > 0) {
    const dimCritica = dimensoesCriticas[0];
    recomendacoes.push({
      titulo: `Intervir na dimensão "${dimCritica.dimensao}"`,
      descricao: `Esta é a dimensão com maior score (${dimCritica.score})`,
      dimensao: dimCritica.dimensao,
      prioridade: "alta",
      acoes: [
        "Realizar grupos focais para entender causas raízes",
        "Desenvolver plano de ação específico",
        "Monitorar evolução mensalmente",
      ],
    });
  }

  if (kpis.taxaAdesao < 70) {
    recomendacoes.push({
      titulo: "Aumentar engajamento",
      descricao: "Taxa de adesão pode ser melhorada",
      prioridade: "media",
      acoes: [
        "Comunicar importância da pesquisa",
        "Garantir anonimato e confidencialidade",
        "Facilitar acesso ao questionário",
      ],
    });
  }

  // Pontos fracos, melhorias e fortes
  const pontosFortesEFracos = {
    pontosFracos: dimensoesCriticas.map((d) =>
      `${d.dimensao}: Score ${d.score} indica alto risco`
    ),
    pontosMelhorias: [
      kpis.taxaAdesao < 80 ? `Aumentar taxa de adesão (atual: ${kpis.taxaAdesao.toFixed(1)}%)` : null,
      kpis.taxaRiscoAlto > 20 ? `Reduzir percentual de risco crítico (atual: ${kpis.taxaRiscoAlto.toFixed(1)}%)` : null,
    ].filter((p): p is string => p !== null),
    pontosFortes: dimensoesPositivas.map((d) =>
      `${d.dimensao}: Score ${d.score} indica baixo risco`
    ),
  };

  return {
    resumoExecutivo,
    dimensoesCriticas,
    dimensoesPositivas,
    mudancas,
    comparacaoCiclo,
    alertas,
    recomendacoes,
    pontosFortesEFracos,
  };
}

// ============================================================================
// EXPORTAÇÃO DE DADOS
// ============================================================================

/**
 * Gera dados agregados para exportação PDF
 */
export async function getDadosParaPDF(empresaId: string, periodoInicio: Date, periodoFim: Date): Promise<DadosExportPDF> {
  // Buscar dados da empresa
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { nome: true },
  });

  if (!empresa) {
    throw new Error("Empresa não encontrada");
  }

  // Buscar todos os dados necessários
  const kpis = await calcularKPIs(empresaId);
  const distribuicao = await getDistribuicaoRisco(empresaId);
  const scoresDimensoes = await getScoresPorDimensao(empresaId);
  const percentis = await calcularPercentis(empresaId);
  const boxPlot = await calcularBoxPlot(empresaId);
  const histograma = await calcularHistograma(empresaId);
  const heatmap = await getHeatmapData(empresaId);
  const insights = await gerarInsights(empresaId);

  // Verificar K-Anonymity antes de incluir análises segmentadas
  const temDadosSuficientes = await verificarKAnonymity(empresaId);
  let analiseSegmentos: AnaliseSegmento[] | undefined;

  if (temDadosSuficientes) {
    analiseSegmentos = [
      await getAnaliseUnidade(empresaId),
      await getAnaliseSetor(empresaId),
      await getAnaliseCargo(empresaId),
    ];
  }

  return {
    empresa: {
      nome: empresa.nome,
    },
    periodo: {
      inicio: periodoInicio,
      fim: periodoFim,
    },
    resumo: {
      totalColaboradores: kpis.totalColaboradores,
      totalRespostas: distribuicao.satisfatorio + distribuicao.atencao + distribuicao.critico,
      taxaAdesao: kpis.taxaAdesao,
      scoreGlobal: kpis.indiceGeralRisco,
      classificacao: insights.resumoExecutivo.classificacao,
    },
    distribuicaoRisco: distribuicao,
    scoresPorDimensao: scoresDimensoes.map((d) => ({
      dimensao: d.dimensao,
      score: d.scoreMedio,
      classificacao: d.scoreMedio <= 8 ? "Baixo" : d.scoreMedio <= 15 ? "Médio" : "Alto",
    })),
    estatisticas: {
      mediana: kpis.scoreMediano,
      desvioPadrao: kpis.desvioPadrao,
      percentis,
    },
    graficos: {
      boxPlot,
      histograma,
      heatmap,
    },
    insights,
    analiseSegmentos,
    metadata: {
      geradoEm: new Date(),
      versaoAlgoritmo: "1.0.0",
    },
  };
}

/**
 * Gera dados agregados para exportação Excel
 */
export async function getDadosParaExcel(empresaId: string, periodoInicio: Date, periodoFim: Date): Promise<DadosExportExcel> {
  const kpis = await calcularKPIs(empresaId);
  const distribuicao = await getDistribuicaoRisco(empresaId);
  const scoresDimensoes = await getScoresPorDimensao(empresaId);
  const percentis = await calcularPercentis(empresaId);
  const perguntasCriticas = await getPerguntasCriticas(empresaId, 10);
  const perguntasPositivas = await getPerguntasPositivas(empresaId, 10);
  const tendencia = await calcularTendencia(empresaId);

  const totalRespostas = distribuicao.satisfatorio + distribuicao.atencao + distribuicao.critico;

  // Verificar K-Anonymity
  const temDadosSuficientes = await verificarKAnonymity(empresaId);
  let segmentos: any[] | undefined;

  if (temDadosSuficientes) {
    const analiseUnidade = await getAnaliseUnidade(empresaId);
    segmentos = analiseUnidade.segmentos.map((s) => ({
      tipo: "Unidade",
      segmento: s.segmentoNome,
      totalRespostas: s.totalRespostas,
      scoreMedia: s.scoreMedia,
      classificacao: s.scoreMedia <= 40 ? "Satisfatório" : s.scoreMedia <= 80 ? "Atenção" : "Crítico",
    }));
  }

  return {
    resumo: {
      totalColaboradores: kpis.totalColaboradores,
      totalRespostas,
      taxaAdesao: kpis.taxaAdesao,
      scoreGlobal: kpis.indiceGeralRisco,
      scoreMediano: kpis.scoreMediano,
      desvioPadrao: kpis.desvioPadrao,
      classificacao: kpis.indiceGeralRisco <= 40 ? "Satisfatório" : kpis.indiceGeralRisco <= 80 ? "Atenção" : "Crítico",
    },
    distribuicao: [
      {
        faixa: "Satisfatório (0-40)",
        quantidade: distribuicao.satisfatorio,
        percentual: Number(((distribuicao.satisfatorio / totalRespostas) * 100).toFixed(1)),
      },
      {
        faixa: "Atenção (41-80)",
        quantidade: distribuicao.atencao,
        percentual: Number(((distribuicao.atencao / totalRespostas) * 100).toFixed(1)),
      },
      {
        faixa: "Crítico (>80)",
        quantidade: distribuicao.critico,
        percentual: Number(((distribuicao.critico / totalRespostas) * 100).toFixed(1)),
      },
    ],
    dimensoes: scoresDimensoes.map((d) => {
      const scores = [d.scoreMedio]; // Simplificado
      return {
        dimensao: d.dimensao,
        scoreMedia: d.scoreMedio,
        desvioPadrao: d.desvioPadrao,
        minimo: d.scoreMedio - d.desvioPadrao,
        maximo: d.scoreMedio + d.desvioPadrao,
        mediana: d.scoreMedio,
      };
    }),
    percentis: [
      {
        metrica: "Score Global",
        p10: percentis.p10,
        p25: percentis.p25,
        p50: percentis.p50,
        p75: percentis.p75,
        p90: percentis.p90,
      },
    ],
    segmentos,
    tendencia: tendencia.pontos.map((p) => ({
      periodo: p.data.toLocaleDateString("pt-BR", { year: "numeric", month: "short" }),
      scoreMedia: p.scoreMedia,
      totalRespostas: p.totalRespostas,
    })),
    perguntasCriticas: perguntasCriticas.map((p) => ({
      dimensao: p.dimensao,
      pergunta: p.perguntaIndex + 1,
      scoreMedia: p.scoreMedia,
      percentualCritico: p.percentualCritico,
    })),
    perguntasPositivas: perguntasPositivas.map((p) => ({
      dimensao: p.dimensao,
      pergunta: p.perguntaIndex + 1,
      scoreMedia: p.scoreMedia,
      percentualPositivo: p.percentualPositivo,
    })),
    metadata: {
      geradoEm: new Date(),
      periodo: `${periodoInicio.toLocaleDateString("pt-BR")} - ${periodoFim.toLocaleDateString("pt-BR")}`,
      versaoAlgoritmo: "1.0.0",
    },
  };
}

/**
 * Verifica K-Anonymity detalhado
 */
export async function verificarKAnonymityDetalhado(empresaId: string): Promise<KAnonymityResult> {
  const totalRespondentes = await prisma.resposta.count({
    where: {
      colaborador: {
        empresaId,
        ativo: true,
      },
    },
  });

  const atendeRequisito = totalRespondentes >= MIN_GROUP_SIZE;

  let mensagem: string | undefined;
  if (!atendeRequisito) {
    mensagem = `Para proteger a privacidade dos respondentes, são necessários no mínimo ${MIN_GROUP_SIZE} respostas. Atualmente há ${totalRespondentes} respostas.`;
  }

  return {
    atendeRequisito,
    totalRespondentes,
    minimoNecessario: MIN_GROUP_SIZE,
    mensagem,
  };
}
