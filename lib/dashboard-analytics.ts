import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
  scoreM

edio: number;
  desvioPadrao: number;
  count: number;
}

export interface PerguntaCritica {
  perguntaId: number;
  texto: string;
  scoreMedia: number;
  percentualCritico: number;
}

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
  const coeficienteVariacao = (desvioPadrao / indiceGeralRisco) * 100;

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

  const dimensoes = [
    { key: "scoreDemandas", nome: "Demandas" },
    { key: "scoreControle", nome: "Controle" },
    { key: "scoreApoioGerencial", nome: "Apoio Gerencial" },
    { key: "scoreApoioColegas", nome: "Apoio de Colegas" },
    { key: "scoreRelacionamentos", nome: "Relacionamentos" },
    { key: "scorePapel", nome: "Papel" },
    { key: "scoreMudancas", nome: "Mudanças" },
  ];

  return dimensoes.map((dim) => {
    const scores = respostas.map((r) => r[dim.key as keyof typeof r] as number);
    const media = scores.reduce((acc, s) => acc + s, 0) / scores.length;
    const variancia =
      scores.reduce((acc, s) => acc + Math.pow(s - media, 2), 0) / scores.length;
    const desvioPadrao = Math.sqrt(variancia);

    return {
      dimensao: dim.nome,
      scoreM

edio: Number(media.toFixed(2)),
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
