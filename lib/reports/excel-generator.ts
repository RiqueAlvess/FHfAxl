/**
 * Gerador de Excel para Relatórios VIVAMENTE360
 * Usando ExcelJS
 */

import ExcelJS from "exceljs";
import type { DadosRelatorio } from "@/types/reports";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const CORES = {
  primaria: "2563EB",
  secundaria: "E0E7FF",
  satisfatorio: "10B981",
  atencao: "F59E0B",
  critico: "EF4444",
  header: "1E40AF",
  headerText: "FFFFFF",
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function aplicarEstiloHeader(worksheet: ExcelJS.Worksheet, row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: CORES.headerText } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: CORES.header },
  };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.height = 25;
}

function aplicarBordas(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin", color: { argb: "CCCCCC" } },
    left: { style: "thin", color: { argb: "CCCCCC" } },
    bottom: { style: "thin", color: { argb: "CCCCCC" } },
    right: { style: "thin", color: { argb: "CCCCCC" } },
  };
}

function getClassificacaoCor(classificacao: string): string {
  const classif = classificacao.toUpperCase();
  if (classif.includes("SATISF") || classif.includes("BAIXO")) {
    return CORES.satisfatorio;
  } else if (classif.includes("ATEN") || classif.includes("MÉD")) {
    return CORES.atencao;
  } else if (classif.includes("CRÍT") || classif.includes("ALTO")) {
    return CORES.critico;
  }
  return "000000";
}

// ============================================================================
// GERADOR PARA RELATÓRIO EXECUTIVO
// ============================================================================

async function gerarExcelExecutivo(workbook: ExcelJS.Workbook, dados: DadosRelatorio) {
  if (dados.tipo !== "executivo") return;

  const sheet = workbook.addWorksheet("Resumo Executivo");

  // Configurar larguras de colunas
  sheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 15 },
  ];

  // Título
  sheet.mergeCells("A1:C1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `Relatório Executivo - ${dados.empresa.nome}`;
  titleCell.font = { size: 16, bold: true, color: { argb: CORES.primaria } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 30;

  // Período
  sheet.mergeCells("A2:C2");
  const periodCell = sheet.getCell("A2");
  periodCell.value = `Período: ${dados.periodo.inicio.toLocaleDateString("pt-BR")} - ${dados.periodo.fim.toLocaleDateString("pt-BR")}`;
  periodCell.alignment = { horizontal: "center" };
  periodCell.font = { italic: true };

  let currentRow = 4;

  // KPIs
  sheet.getCell(`A${currentRow}`).value = "INDICADORES PRINCIPAIS";
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  currentRow += 2;

  const kpis = [
    ["Total de Colaboradores", dados.resumoKPIs.totalColaboradores],
    ["Total de Respostas", dados.resumoKPIs.totalRespostas],
    ["Taxa de Adesão", `${dados.resumoKPIs.taxaAdesao.toFixed(1)}%`],
    ["Score Global", dados.resumoKPIs.scoreGlobal.toFixed(2)],
    ["Classificação", dados.resumoKPIs.classificacao],
  ];

  kpis.forEach(([label, value]) => {
    sheet.getCell(`A${currentRow}`).value = label;
    sheet.getCell(`B${currentRow}`).value = value;
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    aplicarBordas(sheet.getCell(`A${currentRow}`));
    aplicarBordas(sheet.getCell(`B${currentRow}`));
    currentRow++;
  });

  currentRow += 2;

  // Top 5 Pontos Críticos
  sheet.getCell(`A${currentRow}`).value = "TOP 5 PONTOS CRÍTICOS";
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  currentRow += 2;

  const headerRow = sheet.getRow(currentRow);
  headerRow.values = ["Dimensão", "Score", "% Crítico"];
  aplicarEstiloHeader(sheet, headerRow);
  currentRow++;

  dados.top5PontosCriticos.forEach((ponto) => {
    const row = sheet.getRow(currentRow);
    row.values = [ponto.dimensao, ponto.score.toFixed(2), `${ponto.percentualCritico.toFixed(1)}%`];
    row.eachCell((cell) => aplicarBordas(cell));
    currentRow++;
  });

  currentRow += 2;

  // Recomendações
  sheet.getCell(`A${currentRow}`).value = "RECOMENDAÇÕES PRIORITÁRIAS";
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  currentRow += 2;

  dados.recomendacoes.forEach((rec, index) => {
    sheet.getCell(`A${currentRow}`).value = `${index + 1}. ${rec.titulo}`;
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;
    sheet.mergeCells(`A${currentRow}:C${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = rec.descricao;
    sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
    sheet.getRow(currentRow).height = 40;
    currentRow += 2;
  });
}

// ============================================================================
// GERADOR PARA RELATÓRIO COMPLETO
// ============================================================================

async function gerarExcelCompleto(workbook: ExcelJS.Workbook, dados: DadosRelatorio) {
  if (dados.tipo !== "completo") return;

  // Aba 1: KPIs
  const sheetKPIs = workbook.addWorksheet("KPIs");
  sheetKPIs.columns = [{ width: 30 }, { width: 20 }];

  let row = 1;
  sheetKPIs.getCell(`A${row}`).value = "INDICADORES PRINCIPAIS";
  sheetKPIs.getCell(`A${row}`).font = { bold: true, size: 14 };
  row += 2;

  const kpis = [
    ["Total de Colaboradores", dados.kpis.totalColaboradores],
    ["Total de Respostas", dados.kpis.totalRespostas],
    ["Taxa de Adesão", `${dados.kpis.taxaAdesao.toFixed(1)}%`],
    ["Score Global", dados.kpis.scoreGlobal.toFixed(2)],
    ["Score Mediano", dados.kpis.scoreMediano.toFixed(2)],
    ["Desvio Padrão", dados.kpis.desvioPadrao.toFixed(2)],
    ["Classificação", dados.kpis.classificacao],
  ];

  kpis.forEach(([label, value]) => {
    sheetKPIs.getCell(`A${row}`).value = label;
    sheetKPIs.getCell(`B${row}`).value = value;
    sheetKPIs.getCell(`A${row}`).font = { bold: true };
    aplicarBordas(sheetKPIs.getCell(`A${row}`));
    aplicarBordas(sheetKPIs.getCell(`B${row}`));
    row++;
  });

  // Aba 2: Distribuição de Risco
  const sheetDist = workbook.addWorksheet("Distribuição");
  sheetDist.columns = [{ width: 20 }, { width: 15 }, { width: 15 }];

  const headerDist = sheetDist.getRow(1);
  headerDist.values = ["Classificação", "Quantidade", "Percentual"];
  aplicarEstiloHeader(sheetDist, headerDist);

  const total = dados.distribuicaoRisco.satisfatorio + dados.distribuicaoRisco.atencao + dados.distribuicaoRisco.critico;

  [
    { nome: "Satisfatório", qtd: dados.distribuicaoRisco.satisfatorio, cor: CORES.satisfatorio },
    { nome: "Atenção", qtd: dados.distribuicaoRisco.atencao, cor: CORES.atencao },
    { nome: "Crítico", qtd: dados.distribuicaoRisco.critico, cor: CORES.critico },
  ].forEach((item, index) => {
    const r = sheetDist.getRow(index + 2);
    const perc = total > 0 ? ((item.qtd / total) * 100).toFixed(1) : "0.0";
    r.values = [item.nome, item.qtd, `${perc}%`];
    r.eachCell((cell, colNumber) => {
      aplicarBordas(cell);
      if (colNumber === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: item.cor },
        };
        cell.font = { color: { argb: "FFFFFF" }, bold: true };
      }
    });
  });

  // Aba 3: Dimensões
  const sheetDim = workbook.addWorksheet("Dimensões");
  sheetDim.columns = [{ width: 25 }, { width: 15 }, { width: 15 }, { width: 20 }];

  const headerDim = sheetDim.getRow(1);
  headerDim.values = ["Dimensão", "Score", "Desvio Padrão", "Classificação"];
  aplicarEstiloHeader(sheetDim, headerDim);

  dados.dimensoes.forEach((dim, index) => {
    const r = sheetDim.getRow(index + 2);
    r.values = [dim.nome, dim.score.toFixed(2), dim.desvioPadrao.toFixed(2), dim.classificacao];
    r.eachCell((cell, colNumber) => {
      aplicarBordas(cell);
      if (colNumber === 4) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: getClassificacaoCor(dim.classificacao) },
        };
        cell.font = { color: { argb: "FFFFFF" }, bold: true };
      }
    });
  });

  // Aba 4: Segmentos (se houver dados)
  if (dados.segmentos.length > 0) {
    const sheetSeg = workbook.addWorksheet("Segmentos");
    sheetSeg.columns = [{ width: 20 }, { width: 30 }, { width: 15 }, { width: 15 }];

    const headerSeg = sheetSeg.getRow(1);
    headerSeg.values = ["Tipo", "Segmento", "Score Médio", "Respostas"];
    aplicarEstiloHeader(sheetSeg, headerSeg);

    dados.segmentos.forEach((seg, index) => {
      const r = sheetSeg.getRow(index + 2);
      r.values = [seg.tipo, seg.nome, seg.scoreMedia.toFixed(2), seg.totalRespostas];
      r.eachCell((cell) => aplicarBordas(cell));
    });
  }

  // Aba 5: Insights
  const sheetInsights = workbook.addWorksheet("Insights");
  sheetInsights.columns = [{ width: 50 }];

  let insightRow = 1;

  // Pontos Fracos
  sheetInsights.getCell(`A${insightRow}`).value = "PONTOS FRACOS";
  sheetInsights.getCell(`A${insightRow}`).font = { bold: true, size: 12, color: { argb: CORES.critico } };
  insightRow += 2;

  dados.insights.pontosFracos.forEach((ponto) => {
    sheetInsights.getCell(`A${insightRow}`).value = `• ${ponto}`;
    sheetInsights.getCell(`A${insightRow}`).alignment = { wrapText: true };
    insightRow++;
  });

  insightRow += 2;

  // Pontos Fortes
  sheetInsights.getCell(`A${insightRow}`).value = "PONTOS FORTES";
  sheetInsights.getCell(`A${insightRow}`).font = { bold: true, size: 12, color: { argb: CORES.satisfatorio } };
  insightRow += 2;

  dados.insights.pontosFortes.forEach((ponto) => {
    sheetInsights.getCell(`A${insightRow}`).value = `• ${ponto}`;
    sheetInsights.getCell(`A${insightRow}`).alignment = { wrapText: true };
    insightRow++;
  });
}

// ============================================================================
// GERADOR PARA RELATÓRIO UNIDADE/SETOR
// ============================================================================

async function gerarExcelUnidadeSetor(workbook: ExcelJS.Workbook, dados: DadosRelatorio) {
  if (dados.tipo !== "unidade" && dados.tipo !== "setor") return;

  const sheet = workbook.addWorksheet(`${dados.segmento.tipo} - ${dados.segmento.nome}`);
  sheet.columns = [{ width: 30 }, { width: 20 }];

  let row = 1;

  // Título
  sheet.mergeCells(`A${row}:B${row}`);
  sheet.getCell(`A${row}`).value = `${dados.segmento.tipo}: ${dados.segmento.nome}`;
  sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
  row += 2;

  // Dados do Segmento
  sheet.getCell(`A${row}`).value = "DADOS DO SEGMENTO";
  sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
  row += 2;

  const dadosSeg = [
    ["Total de Respostas", dados.dadosSegmento.totalRespostas],
    ["Score Médio", dados.dadosSegmento.scoreMedia.toFixed(2)],
    ["Score Mediano", dados.dadosSegmento.scoreMediano.toFixed(2)],
  ];

  dadosSeg.forEach(([label, value]) => {
    sheet.getCell(`A${row}`).value = label;
    sheet.getCell(`B${row}`).value = value;
    sheet.getCell(`A${row}`).font = { bold: true };
    aplicarBordas(sheet.getCell(`A${row}`));
    aplicarBordas(sheet.getCell(`B${row}`));
    row++;
  });

  row += 2;

  // Comparativo
  sheet.getCell(`A${row}`).value = "COMPARATIVO COM A EMPRESA";
  sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
  row += 2;

  const comparativo = [
    ["Score Médio da Empresa", dados.comparativoEmpresa.scoreMediaEmpresa.toFixed(2)],
    ["Diferença Percentual", `${dados.comparativoEmpresa.diferencaPercentual.toFixed(2)}%`],
    ["Situação", dados.comparativoEmpresa.melhorOuPior],
  ];

  comparativo.forEach(([label, value]) => {
    sheet.getCell(`A${row}`).value = label;
    sheet.getCell(`B${row}`).value = value;
    sheet.getCell(`A${row}`).font = { bold: true };
    aplicarBordas(sheet.getCell(`A${row}`));
    aplicarBordas(sheet.getCell(`B${row}`));
    row++;
  });

  row += 2;

  // Dimensões
  sheet.getCell(`A${row}`).value = "ANÁLISE POR DIMENSÃO";
  sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
  row += 2;

  // Ajustar colunas para tabela de dimensões
  const sheetDim = workbook.addWorksheet("Dimensões Detalhadas");
  sheetDim.columns = [{ width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }];

  const headerDim = sheetDim.getRow(1);
  headerDim.values = ["Dimensão", "Segmento", "Empresa", "Diferença"];
  aplicarEstiloHeader(sheetDim, headerDim);

  dados.dimensoes.forEach((dim, index) => {
    const r = sheetDim.getRow(index + 2);
    r.values = [
      dim.nome,
      dim.scoreSegmento.toFixed(2),
      dim.scoreEmpresa.toFixed(2),
      dim.diferenca.toFixed(2),
    ];
    r.eachCell((cell) => aplicarBordas(cell));
  });
}

// ============================================================================
// GERADOR PARA RELATÓRIO DE EVOLUÇÃO
// ============================================================================

async function gerarExcelEvolucao(workbook: ExcelJS.Workbook, dados: DadosRelatorio) {
  if (dados.tipo !== "evolucao") return;

  // Aba 1: Tendência Geral
  const sheetTend = workbook.addWorksheet("Tendência Geral");
  sheetTend.columns = [{ width: 30 }, { width: 20 }];

  let row = 1;
  sheetTend.getCell(`A${row}`).value = "ANÁLISE DE TENDÊNCIA";
  sheetTend.getCell(`A${row}`).font = { bold: true, size: 14 };
  row += 2;

  const tendData = [
    ["Tipo de Tendência", dados.tendencia.tipo],
    ["Percentual de Mudança", `${dados.tendencia.percentualMudanca.toFixed(2)}%`],
    ["Interpretação", dados.tendencia.interpretacao],
  ];

  tendData.forEach(([label, value]) => {
    sheetTend.getCell(`A${row}`).value = label;
    sheetTend.getCell(`B${row}`).value = value;
    sheetTend.getCell(`A${row}`).font = { bold: true };
    aplicarBordas(sheetTend.getCell(`A${row}`));
    aplicarBordas(sheetTend.getCell(`B${row}`));
    if (label === "Interpretação") {
      sheetTend.getCell(`B${row}`).alignment = { wrapText: true };
      sheetTend.getRow(row).height = 40;
    }
    row++;
  });

  // Aba 2: Evolução por Ciclo
  const sheetCiclos = workbook.addWorksheet("Evolução por Ciclo");
  sheetCiclos.columns = [{ width: 30 }, { width: 15 }, { width: 15 }];

  const headerCiclos = sheetCiclos.getRow(1);
  headerCiclos.values = ["Ciclo", "Score Médio", "Respostas"];
  aplicarEstiloHeader(sheetCiclos, headerCiclos);

  dados.ciclos.forEach((ciclo, index) => {
    const r = sheetCiclos.getRow(index + 2);
    r.values = [ciclo.nome, ciclo.scoreMedia.toFixed(2), ciclo.totalRespostas];
    r.eachCell((cell) => aplicarBordas(cell));
  });

  // Aba 3: Evolução por Dimensão
  const sheetDimEv = workbook.addWorksheet("Evolução por Dimensão");

  // Criar cabeçalho dinâmico
  const headerDimEv = ["Dimensão", "Tendência", ...dados.ciclos.map((c) => c.nome)];
  sheetDimEv.columns = [
    { width: 25 },
    { width: 15 },
    ...dados.ciclos.map(() => ({ width: 15 })),
  ];

  const headerRow = sheetDimEv.getRow(1);
  headerRow.values = headerDimEv;
  aplicarEstiloHeader(sheetDimEv, headerRow);

  dados.evolucaoDimensoes.forEach((dim, index) => {
    const r = sheetDimEv.getRow(index + 2);
    r.values = [dim.dimensao, dim.tendencia, ...dim.scores.map((s) => s.toFixed(2))];
    r.eachCell((cell) => aplicarBordas(cell));
  });
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE GERAÇÃO
// ============================================================================

export async function gerarExcel(dados: DadosRelatorio): Promise<{
  caminhoArquivo: string;
  nomeArquivo: string;
}> {
  const workbook = new ExcelJS.Workbook();

  // Metadados
  workbook.creator = "VIVAMENTE360";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Gerar abas baseado no tipo de relatório
  switch (dados.tipo) {
    case "executivo":
      await gerarExcelExecutivo(workbook, dados);
      break;
    case "completo":
      await gerarExcelCompleto(workbook, dados);
      break;
    case "unidade":
    case "setor":
      await gerarExcelUnidadeSetor(workbook, dados);
      break;
    case "evolucao":
      await gerarExcelEvolucao(workbook, dados);
      break;
    default:
      throw new Error(`Tipo de relatório não suportado: ${(dados as any).tipo}`);
  }

  // Adicionar aba de disclaimer LGPD
  const sheetDisclaimer = workbook.addWorksheet("Aviso LGPD");
  sheetDisclaimer.columns = [{ width: 80 }];

  sheetDisclaimer.getCell("A1").value = "AVISO DE PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)";
  sheetDisclaimer.getCell("A1").font = { bold: true, size: 14, color: { argb: CORES.critico } };
  sheetDisclaimer.getRow(1).height = 25;

  sheetDisclaimer.getCell("A3").value =
    "Este relatório contém dados agregados e anonimizados em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).";
  sheetDisclaimer.getCell("A3").alignment = { wrapText: true };
  sheetDisclaimer.getRow(3).height = 40;

  sheetDisclaimer.getCell("A5").value =
    "Todos os dados foram processados respeitando o princípio de K-Anonymity (mínimo de 5 respondentes por grupo).";
  sheetDisclaimer.getCell("A5").alignment = { wrapText: true };
  sheetDisclaimer.getRow(5).height = 30;

  sheetDisclaimer.getCell("A7").value =
    "Nenhuma informação individual identificável está presente neste documento.";
  sheetDisclaimer.getCell("A7").alignment = { wrapText: true };

  sheetDisclaimer.getCell("A9").value =
    "O uso inadequado deste relatório pode configurar violação à LGPD.";
  sheetDisclaimer.getCell("A9").font = { bold: true, color: { argb: CORES.critico } };
  sheetDisclaimer.getCell("A9").alignment = { wrapText: true };

  // Criar diretório temporário se não existir
  const tempDir = join(process.cwd(), "temp", "relatorios");
  await mkdir(tempDir, { recursive: true });

  // Gerar nome de arquivo único
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const nomeArquivo = `relatorio-${dados.tipo}-${timestamp}-${nanoid(8)}.xlsx`;
  const caminhoArquivo = join(tempDir, nomeArquivo);

  // Salvar arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  await writeFile(caminhoArquivo, Buffer.from(buffer));

  return {
    caminhoArquivo,
    nomeArquivo,
  };
}
