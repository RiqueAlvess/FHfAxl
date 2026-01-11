/**
 * Serviço de Geração de Dados para Relatórios
 * Consolida dados de diferentes fontes para os relatórios
 */

import { prisma } from "@/lib/prisma";
import * as analytics from "@/lib/dashboard-analytics";
import type {
  DadosRelatorioExecutivo,
  DadosRelatorioCompleto,
  DadosRelatorioUnidadeSetor,
  DadosRelatorioEvolucao,
  FiltrosRelatorio,
} from "@/types/reports";

// ============================================================================
// RELATÓRIO EXECUTIVO
// ============================================================================

export async function gerarDadosRelatorioExecutivo(
  filtros: FiltrosRelatorio
): Promise<DadosRelatorioExecutivo> {
  const { empresaId } = filtros;

  // Buscar dados da empresa
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { nome: true, logo: true },
  });

  if (!empresa) {
    throw new Error("Empresa não encontrada");
  }

  // Determinar período
  const periodo = await determinarPeriodo(filtros);

  // Buscar KPIs
  const kpis = await analytics.calcularKPIs(empresaId);
  const distribuicao = await analytics.getDistribuicaoRisco(empresaId);
  const scoresDimensoes = await analytics.getScoresPorDimensao(empresaId);
  const perguntasCriticas = await analytics.getPerguntasCriticas(empresaId, 5);
  const insights = await analytics.gerarInsights(empresaId);

  // Preparar dados do gráfico radar
  const graficoRadar = {
    dimensoes: scoresDimensoes.map((d) => d.dimensao),
    valores: scoresDimensoes.map((d) => d.scoreMedio),
  };

  // Top 5 pontos críticos
  const top5PontosCriticos = perguntasCriticas.slice(0, 5).map((p) => ({
    dimensao: p.dimensao,
    score: p.scoreMedia,
    percentualCritico: p.percentualCritico,
  }));

  // Recomendações
  const recomendacoes = insights.recomendacoes.map((r) => ({
    titulo: r.titulo,
    descricao: r.descricao,
    prioridade: r.prioridade as "alta" | "media" | "baixa",
  }));

  const totalRespostas = distribuicao.satisfatorio + distribuicao.atencao + distribuicao.critico;

  return {
    tipo: "executivo",
    empresa: {
      nome: empresa.nome,
      logo: empresa.logo || undefined,
    },
    periodo,
    resumoKPIs: {
      totalColaboradores: kpis.totalColaboradores,
      totalRespostas,
      taxaAdesao: kpis.taxaAdesao,
      scoreGlobal: kpis.indiceGeralRisco,
      classificacao: insights.resumoExecutivo.classificacao,
    },
    graficoRadar,
    top5PontosCriticos,
    recomendacoes,
  };
}

// ============================================================================
// RELATÓRIO COMPLETO
// ============================================================================

export async function gerarDadosRelatorioCompleto(
  filtros: FiltrosRelatorio
): Promise<DadosRelatorioCompleto> {
  const { empresaId } = filtros;

  // Buscar dados da empresa
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { nome: true, logo: true },
  });

  if (!empresa) {
    throw new Error("Empresa não encontrada");
  }

  // Determinar período
  const periodo = await determinarPeriodo(filtros);

  // Buscar todos os dados
  const kpis = await analytics.calcularKPIs(empresaId);
  const distribuicao = await analytics.getDistribuicaoRisco(empresaId);
  const scoresDimensoes = await analytics.getScoresPorDimensao(empresaId);
  const insights = await analytics.gerarInsights(empresaId);

  const totalRespostas = distribuicao.satisfatorio + distribuicao.atencao + distribuicao.critico;

  // Verificar K-Anonymity antes de incluir análises segmentadas
  const temDadosSuficientes = await analytics.verificarKAnonymity(empresaId);
  let segmentos: Array<{ tipo: string; nome: string; scoreMedia: number; totalRespostas: number }> = [];

  if (temDadosSuficientes) {
    const analiseUnidade = await analytics.getAnaliseUnidade(empresaId);
    const analiseSetor = await analytics.getAnaliseSetor(empresaId);

    segmentos = [
      ...analiseUnidade.segmentos.map((s) => ({
        tipo: "Unidade",
        nome: s.segmentoNome,
        scoreMedia: s.scoreMedia,
        totalRespostas: s.totalRespostas,
      })),
      ...analiseSetor.segmentos.map((s) => ({
        tipo: "Setor",
        nome: s.segmentoNome,
        scoreMedia: s.scoreMedia,
        totalRespostas: s.totalRespostas,
      })),
    ];
  }

  return {
    tipo: "completo",
    empresa: {
      nome: empresa.nome,
      logo: empresa.logo || undefined,
    },
    periodo,
    kpis: {
      totalColaboradores: kpis.totalColaboradores,
      totalRespostas,
      taxaAdesao: kpis.taxaAdesao,
      scoreGlobal: kpis.indiceGeralRisco,
      scoreMediano: kpis.scoreMediano,
      desvioPadrao: kpis.desvioPadrao,
      classificacao: insights.resumoExecutivo.classificacao,
    },
    distribuicaoRisco: distribuicao,
    dimensoes: scoresDimensoes.map((d) => ({
      nome: d.dimensao,
      score: d.scoreMedio,
      desvioPadrao: d.desvioPadrao,
      classificacao: d.scoreMedio <= 8 ? "Baixo" : d.scoreMedio <= 15 ? "Médio" : "Alto",
    })),
    segmentos,
    insights: insights.pontosFortesEFracos,
    alertas: insights.alertas.map((a) => ({
      tipo: a.tipo,
      titulo: a.titulo,
      descricao: a.descricao,
    })),
    recomendacoes: insights.recomendacoes.map((r) => ({
      titulo: r.titulo,
      descricao: r.descricao,
      prioridade: r.prioridade,
      acoes: r.acoes,
    })),
  };
}

// ============================================================================
// RELATÓRIO POR UNIDADE/SETOR
// ============================================================================

export async function gerarDadosRelatorioUnidadeSetor(
  filtros: FiltrosRelatorio
): Promise<DadosRelatorioUnidadeSetor> {
  const { empresaId, unidadeId, setorId, tipoRelatorio } = filtros;

  if (!unidadeId && !setorId) {
    throw new Error("É necessário especificar unidadeId ou setorId");
  }

  // Buscar dados da empresa
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { nome: true, logo: true },
  });

  if (!empresa) {
    throw new Error("Empresa não encontrada");
  }

  // Determinar período
  const periodo = await determinarPeriodo(filtros);

  // Buscar dados do segmento
  let segmentoNome: string;
  let analise: any;

  if (tipoRelatorio === "unidade" && unidadeId) {
    const unidade = await prisma.unidade.findUnique({
      where: { id: unidadeId },
      select: { nome: true },
    });
    segmentoNome = unidade?.nome || "Unidade";

    const analiseCompleta = await analytics.getAnaliseUnidade(empresaId);
    analise = analiseCompleta.segmentos.find((s) => s.segmentoNome === segmentoNome);
  } else if (tipoRelatorio === "setor" && setorId) {
    const setor = await prisma.setor.findUnique({
      where: { id: setorId },
      select: { nome: true },
    });
    segmentoNome = setor?.nome || "Setor";

    const analiseCompleta = await analytics.getAnaliseSetor(empresaId);
    analise = analiseCompleta.segmentos.find((s) => s.segmentoNome === segmentoNome);
  } else {
    throw new Error("Tipo de relatório ou IDs inválidos");
  }

  if (!analise) {
    throw new Error("Segmento não encontrado ou dados insuficientes (K-Anonymity)");
  }

  // Buscar dados da empresa para comparação
  const kpisEmpresa = await analytics.calcularKPIs(empresaId);
  const scoresDimensoesEmpresa = await analytics.getScoresPorDimensao(empresaId);

  // Buscar dimensões do segmento (simplificado - requer implementação adicional)
  const dimensoes = scoresDimensoesEmpresa.map((dimEmpresa) => ({
    nome: dimEmpresa.dimensao,
    scoreSegmento: analise.scoreMedia, // Simplificado - idealmente buscar por dimensão
    scoreEmpresa: dimEmpresa.scoreMedio,
    diferenca: analise.scoreMedia - dimEmpresa.scoreMedio,
  }));

  const diferencaPercentual = kpisEmpresa.indiceGeralRisco === 0
    ? 0
    : ((analise.scoreMedia - kpisEmpresa.indiceGeralRisco) / kpisEmpresa.indiceGeralRisco) * 100;

  return {
    tipo: tipoRelatorio === "unidade" ? "unidade" : "setor",
    empresa: {
      nome: empresa.nome,
      logo: empresa.logo || undefined,
    },
    segmento: {
      tipo: tipoRelatorio === "unidade" ? "Unidade" : "Setor",
      nome: segmentoNome,
    },
    periodo,
    dadosSegmento: {
      totalRespostas: analise.totalRespostas,
      scoreMedia: analise.scoreMedia,
      scoreMediano: analise.scoreMediano,
      distribuicao: analise.distribuicao,
    },
    comparativoEmpresa: {
      scoreMediaEmpresa: kpisEmpresa.indiceGeralRisco,
      diferencaPercentual: Number(diferencaPercentual.toFixed(2)),
      melhorOuPior:
        analise.scoreMedia < kpisEmpresa.indiceGeralRisco
          ? "melhor"
          : analise.scoreMedia > kpisEmpresa.indiceGeralRisco
          ? "pior"
          : "igual",
    },
    dimensoes,
  };
}

// ============================================================================
// RELATÓRIO DE EVOLUÇÃO
// ============================================================================

export async function gerarDadosRelatorioEvolucao(
  filtros: FiltrosRelatorio
): Promise<DadosRelatorioEvolucao> {
  const { empresaId } = filtros;

  // Buscar dados da empresa
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { nome: true, logo: true },
  });

  if (!empresa) {
    throw new Error("Empresa não encontrada");
  }

  // Determinar período
  const periodo = await determinarPeriodo(filtros);

  // Buscar ciclos de avaliação
  const ciclosAvaliacao = await prisma.cicloAvaliacao.findMany({
    where: {
      empresaId,
      dataInicio: { gte: periodo.inicio },
      dataFim: { lte: periodo.fim },
    },
    orderBy: { dataInicio: "asc" },
    include: {
      respostas: {
        select: {
          scoreGlobal: true,
          scoreDemandas: true,
          scoreControle: true,
          scoreApoioGerencial: true,
          scoreApoioColegas: true,
          scoreRelacionamentos: true,
          scorePapel: true,
          scoreMudancas: true,
        },
      },
    },
  });

  if (ciclosAvaliacao.length === 0) {
    throw new Error("Nenhum ciclo de avaliação encontrado no período");
  }

  // Preparar dados dos ciclos
  const ciclos = ciclosAvaliacao.map((ciclo) => {
    const scoreMedia =
      ciclo.respostas.length > 0
        ? ciclo.respostas.reduce((acc, r) => acc + r.scoreGlobal, 0) / ciclo.respostas.length
        : 0;

    return {
      nome: ciclo.nome,
      periodo: `${ciclo.dataInicio.toLocaleDateString("pt-BR")} - ${ciclo.dataFim.toLocaleDateString("pt-BR")}`,
      scoreMedia: Number(scoreMedia.toFixed(2)),
      totalRespostas: ciclo.respostas.length,
    };
  });

  // Calcular tendência
  const scores = ciclos.map((c) => c.scoreMedia);
  const primeiroScore = scores[0];
  const ultimoScore = scores[scores.length - 1];
  const percentualMudanca = primeiroScore === 0
    ? 0
    : ((ultimoScore - primeiroScore) / primeiroScore) * 100;

  let tipoTendencia: "crescente" | "decrescente" | "estavel";
  let interpretacao: string;

  if (Math.abs(percentualMudanca) < 5) {
    tipoTendencia = "estavel";
    interpretacao = "Os scores permaneceram relativamente estáveis ao longo do período";
  } else if (percentualMudanca > 0) {
    tipoTendencia = "crescente";
    interpretacao = `Os scores aumentaram ${percentualMudanca.toFixed(1)}% (indicando piora na saúde ocupacional)`;
  } else {
    tipoTendencia = "decrescente";
    interpretacao = `Os scores diminuíram ${Math.abs(percentualMudanca).toFixed(1)}% (indicando melhora na saúde ocupacional)`;
  }

  // Evolução por dimensões
  const dimensoesNomes = [
    "Demandas",
    "Controle",
    "Apoio Gerencial",
    "Apoio de Colegas",
    "Relacionamentos",
    "Papel",
    "Mudanças",
  ];

  const evolucaoDimensoes = dimensoesNomes.map((nomeDimensao, index) => {
    const scoresPorCiclo = ciclosAvaliacao.map((ciclo) => {
      if (ciclo.respostas.length === 0) return 0;

      const campo = [
        "scoreDemandas",
        "scoreControle",
        "scoreApoioGerencial",
        "scoreApoioColegas",
        "scoreRelacionamentos",
        "scorePapel",
        "scoreMudancas",
      ][index] as keyof typeof ciclo.respostas[0];

      const soma = ciclo.respostas.reduce((acc, r) => acc + (r[campo] as number), 0);
      return Number((soma / ciclo.respostas.length).toFixed(2));
    });

    const primeiroScoreDim = scoresPorCiclo[0];
    const ultimoScoreDim = scoresPorCiclo[scoresPorCiclo.length - 1];
    const mudanca = ultimoScoreDim - primeiroScoreDim;

    let tendenciaDim: "crescente" | "decrescente" | "estavel";
    if (Math.abs(mudanca) < 1) {
      tendenciaDim = "estavel";
    } else if (mudanca > 0) {
      tendenciaDim = "crescente";
    } else {
      tendenciaDim = "decrescente";
    }

    return {
      dimensao: nomeDimensao,
      scores: scoresPorCiclo,
      tendencia: tendenciaDim,
    };
  });

  return {
    tipo: "evolucao",
    empresa: {
      nome: empresa.nome,
      logo: empresa.logo || undefined,
    },
    periodo,
    ciclos,
    tendencia: {
      tipo: tipoTendencia,
      percentualMudanca: Number(percentualMudanca.toFixed(2)),
      interpretacao,
    },
    evolucaoDimensoes,
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

async function determinarPeriodo(filtros: FiltrosRelatorio): Promise<{ inicio: Date; fim: Date }> {
  if (filtros.periodoInicio && filtros.periodoFim) {
    return {
      inicio: filtros.periodoInicio,
      fim: filtros.periodoFim,
    };
  }

  if (filtros.cicloAvaliacaoId) {
    const ciclo = await prisma.cicloAvaliacao.findUnique({
      where: { id: filtros.cicloAvaliacaoId },
      select: { dataInicio: true, dataFim: true },
    });

    if (ciclo) {
      return {
        inicio: ciclo.dataInicio,
        fim: ciclo.dataFim,
      };
    }
  }

  // Padrão: últimos 30 dias
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 30);

  return { inicio, fim };
}
