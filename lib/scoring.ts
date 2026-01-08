// Algoritmo de Scoring para Questionário HSE-IT
// Score Global: 0-140 pontos

export interface RespostasQuestionario {
  demandas: number[]; // 8 respostas (0-4)
  controle: number[]; // 6 respostas (0-4)
  apoioGerencial: number[]; // 5 respostas (0-4)
  apoioColegas: number[]; // 4 respostas (0-4)
  relacionamentos: number[]; // 4 respostas (0-4)
  papel: number[]; // 5 respostas (0-4)
  mudancas: number[]; // 3 respostas (0-4)
}

export interface ScoresDimensoes {
  scoreDemandas: number;
  scoreControle: number;
  scoreApoioGerencial: number;
  scoreApoioColegas: number;
  scoreRelacionamentos: number;
  scorePapel: number;
  scoreMudancas: number;
  scoreGlobal: number;
}

export interface ResultadoCompleto extends ScoresDimensoes {
  classificacao: "SATISFATORIO" | "ATENCAO" | "CRITICO";
  mediaDemandas: number;
  mediaControle: number;
  mediaApoioGerencial: number;
  mediaApoioColegas: number;
  mediaRelacionamentos: number;
  mediaPapel: number;
  mediaMudancas: number;
}

/**
 * Calcula a média de um array de respostas
 */
function calcularMedia(respostas: number[]): number {
  const soma = respostas.reduce((acc, val) => acc + val, 0);
  return soma / respostas.length;
}

/**
 * Calcula o score de uma dimensão POSITIVA
 * Quanto menor a média, MAIOR o risco (invertido)
 * Score = (4 - média) * 5
 */
function calcularScorePositiva(media: number): number {
  return (4 - media) * 5;
}

/**
 * Calcula o score de uma dimensão NEGATIVA
 * Quanto maior a média, MAIOR o risco (direto)
 * Score = média * 5
 */
function calcularScoreNegativa(media: number): number {
  return media * 5;
}

/**
 * Calcula todos os scores do questionário HSE-IT
 */
export function calcularScores(respostas: RespostasQuestionario): ResultadoCompleto {
  // Validar quantidade de respostas
  if (respostas.demandas.length !== 8) throw new Error("Demandas: esperadas 8 respostas");
  if (respostas.controle.length !== 6) throw new Error("Controle: esperadas 6 respostas");
  if (respostas.apoioGerencial.length !== 5) throw new Error("Apoio Gerencial: esperadas 5 respostas");
  if (respostas.apoioColegas.length !== 4) throw new Error("Apoio de Colegas: esperadas 4 respostas");
  if (respostas.relacionamentos.length !== 4) throw new Error("Relacionamentos: esperadas 4 respostas");
  if (respostas.papel.length !== 5) throw new Error("Papel: esperadas 5 respostas");
  if (respostas.mudancas.length !== 3) throw new Error("Mudanças: esperadas 3 respostas");

  // Calcular médias
  const mediaDemandas = calcularMedia(respostas.demandas);
  const mediaControle = calcularMedia(respostas.controle);
  const mediaApoioGerencial = calcularMedia(respostas.apoioGerencial);
  const mediaApoioColegas = calcularMedia(respostas.apoioColegas);
  const mediaRelacionamentos = calcularMedia(respostas.relacionamentos);
  const mediaPapel = calcularMedia(respostas.papel);
  const mediaMudancas = calcularMedia(respostas.mudancas);

  // Calcular scores por dimensão
  const scoreDemandas = calcularScoreNegativa(mediaDemandas); // NEGATIVA
  const scoreControle = calcularScorePositiva(mediaControle); // POSITIVA
  const scoreApoioGerencial = calcularScorePositiva(mediaApoioGerencial); // POSITIVA
  const scoreApoioColegas = calcularScorePositiva(mediaApoioColegas); // POSITIVA
  const scoreRelacionamentos = calcularScoreNegativa(mediaRelacionamentos); // NEGATIVA
  const scorePapel = calcularScorePositiva(mediaPapel); // POSITIVA
  const scoreMudancas = calcularScorePositiva(mediaMudancas); // POSITIVA

  // Score Global (soma de todas as dimensões)
  const scoreGlobal =
    scoreDemandas +
    scoreControle +
    scoreApoioGerencial +
    scoreApoioColegas +
    scoreRelacionamentos +
    scorePapel +
    scoreMudancas;

  // Classificação de Risco
  let classificacao: "SATISFATORIO" | "ATENCAO" | "CRITICO";
  if (scoreGlobal <= 40) {
    classificacao = "SATISFATORIO";
  } else if (scoreGlobal <= 80) {
    classificacao = "ATENCAO";
  } else {
    classificacao = "CRITICO";
  }

  return {
    // Scores
    scoreDemandas: Number(scoreDemandas.toFixed(2)),
    scoreControle: Number(scoreControle.toFixed(2)),
    scoreApoioGerencial: Number(scoreApoioGerencial.toFixed(2)),
    scoreApoioColegas: Number(scoreApoioColegas.toFixed(2)),
    scoreRelacionamentos: Number(scoreRelacionamentos.toFixed(2)),
    scorePapel: Number(scorePapel.toFixed(2)),
    scoreMudancas: Number(scoreMudancas.toFixed(2)),
    scoreGlobal: Number(scoreGlobal.toFixed(2)),

    // Classificação
    classificacao,

    // Médias (para referência)
    mediaDemandas: Number(mediaDemandas.toFixed(2)),
    mediaControle: Number(mediaControle.toFixed(2)),
    mediaApoioGerencial: Number(mediaApoioGerencial.toFixed(2)),
    mediaApoioColegas: Number(mediaApoioColegas.toFixed(2)),
    mediaRelacionamentos: Number(mediaRelacionamentos.toFixed(2)),
    mediaPapel: Number(mediaPapel.toFixed(2)),
    mediaMudancas: Number(mediaMudancas.toFixed(2)),
  };
}

/**
 * Retorna a cor associada à classificação
 */
export function getCorClassificacao(classificacao: string): string {
  switch (classificacao) {
    case "SATISFATORIO":
      return "green";
    case "ATENCAO":
      return "yellow";
    case "CRITICO":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Retorna o texto descritivo da classificação
 */
export function getDescricaoClassificacao(classificacao: string): string {
  switch (classificacao) {
    case "SATISFATORIO":
      return "Nível de risco psicossocial satisfatório";
    case "ATENCAO":
      return "Atenção: riscos psicossociais identificados";
    case "CRITICO":
      return "Crítico: intervenção urgente necessária";
    default:
      return "Classificação não disponível";
  }
}
