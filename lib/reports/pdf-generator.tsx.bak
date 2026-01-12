/**
 * Gerador de PDF para Relatórios VIVAMENTE360
 * Usando @react-pdf/renderer
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
  Font,
} from "@react-pdf/renderer";
import type {
  DadosRelatorio,
  DadosRelatorioExecutivo,
  DadosRelatorioCompleto,
  DadosRelatorioUnidadeSetor,
  DadosRelatorioEvolucao,
} from "@/types/reports";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #2563eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
    borderBottom: "1 solid #cbd5e1",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    width: "40%",
    color: "#475569",
  },
  value: {
    fontSize: 10,
    width: "60%",
    color: "#1f2937",
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e7ff",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e2e8f0",
    padding: 8,
  },
  tableCell: {
    fontSize: 9,
  },
  badge: {
    padding: "4 8",
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
  badgeSatisfatorio: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  badgeAtencao: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  badgeCritico: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1 solid #e2e8f0",
    paddingTop: 10,
    fontSize: 8,
    color: "#94a3b8",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    fontSize: 8,
    color: "#475569",
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  bullet: {
    width: 15,
    fontSize: 10,
  },
  listContent: {
    flex: 1,
    fontSize: 10,
  },
});

// ============================================================================
// COMPONENTES DO PDF
// ============================================================================

const PDFHeader: React.FC<{ empresa: string; tipo: string; periodo: { inicio: Date; fim: Date } }> = ({
  empresa,
  tipo,
  periodo,
}) => (
  <View style={styles.header}>
    <Text style={styles.title}>Relatório {tipo} - VIVAMENTE360</Text>
    <Text style={styles.subtitle}>{empresa}</Text>
    <Text style={styles.subtitle}>
      Período: {periodo.inicio.toLocaleDateString("pt-BR")} -{" "}
      {periodo.fim.toLocaleDateString("pt-BR")}
    </Text>
  </View>
);

const PDFFooter: React.FC<{ pageNumber: number }> = ({ pageNumber }) => (
  <View style={styles.footer} fixed>
    <Text>VIVAMENTE360 - Relatório Confidencial</Text>
    <Text>Página {pageNumber}</Text>
    <Text>Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
  </View>
);

const DisclaimerLGPD: React.FC = () => (
  <View style={styles.disclaimer}>
    <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
      AVISO DE PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)
    </Text>
    <Text>
      Este relatório contém dados agregados e anonimizados em conformidade com a Lei Geral de
      Proteção de Dados (LGPD - Lei 13.709/2018). Todos os dados foram processados respeitando o
      princípio de K-Anonymity (mínimo de 5 respondentes por grupo). Nenhuma informação individual
      identificável está presente neste documento. O uso inadequado deste relatório pode configurar
      violação à LGPD.
    </Text>
  </View>
);

// ============================================================================
// RELATÓRIO EXECUTIVO
// ============================================================================

function RelatorioExecutivoPDF({ dados }: { dados: DadosRelatorioExecutivo }): React.ReactElement {
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFHeader empresa={dados.empresa.nome} tipo="Executivo" periodo={dados.periodo} />

      {/* Resumo de KPIs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo Executivo</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Colaboradores:</Text>
          <Text style={styles.value}>{dados.resumoKPIs.totalColaboradores}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Respostas:</Text>
          <Text style={styles.value}>{dados.resumoKPIs.totalRespostas}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Taxa de Adesão:</Text>
          <Text style={styles.value}>{dados.resumoKPIs.taxaAdesao.toFixed(1)}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Score Global:</Text>
          <Text style={styles.value}>
            {dados.resumoKPIs.scoreGlobal.toFixed(2)} - {dados.resumoKPIs.classificacao}
          </Text>
        </View>
      </View>

      {/* Top 5 Pontos Críticos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 5 Pontos Críticos</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { width: "50%" }]}>Dimensão</Text>
            <Text style={[styles.tableCell, { width: "25%" }]}>Score</Text>
            <Text style={[styles.tableCell, { width: "25%" }]}>% Crítico</Text>
          </View>
          {dados.top5PontosCriticos.map((ponto, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "50%" }]}>{ponto.dimensao}</Text>
              <Text style={[styles.tableCell, { width: "25%" }]}>{ponto.score.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { width: "25%" }]}>
                {ponto.percentualCritico.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recomendações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendações Prioritárias</Text>
        <View style={styles.list}>
          {dados.recomendacoes.map((rec, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <View style={styles.listContent}>
                <Text style={{ fontWeight: "bold" }}>{rec.titulo}</Text>
                <Text>{rec.descricao}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <DisclaimerLGPD />
      <PDFFooter pageNumber={1} />
    </Page>
  </Document>
  );
}

// ============================================================================
// RELATÓRIO COMPLETO
// ============================================================================

function RelatorioCompletoPDF({ dados }: { dados: DadosRelatorioCompleto }): React.ReactElement {
  return (
  <Document>
    {/* Página 1: Resumo */}
    <Page size="A4" style={styles.page}>
      <PDFHeader empresa={dados.empresa.nome} tipo="Completo" periodo={dados.periodo} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Indicadores Principais</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Colaboradores:</Text>
          <Text style={styles.value}>{dados.kpis.totalColaboradores}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Respostas:</Text>
          <Text style={styles.value}>{dados.kpis.totalRespostas}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Taxa de Adesão:</Text>
          <Text style={styles.value}>{dados.kpis.taxaAdesao.toFixed(1)}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Score Global:</Text>
          <Text style={styles.value}>{dados.kpis.scoreGlobal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Score Mediano:</Text>
          <Text style={styles.value}>{dados.kpis.scoreMediano.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Desvio Padrão:</Text>
          <Text style={styles.value}>{dados.kpis.desvioPadrao.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Classificação:</Text>
          <Text style={styles.value}>{dados.kpis.classificacao}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribuição de Risco</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Satisfatório:</Text>
          <Text style={styles.value}>{dados.distribuicaoRisco.satisfatorio} colaboradores</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Atenção:</Text>
          <Text style={styles.value}>{dados.distribuicaoRisco.atencao} colaboradores</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Crítico:</Text>
          <Text style={styles.value}>{dados.distribuicaoRisco.critico} colaboradores</Text>
        </View>
      </View>

      <PDFFooter pageNumber={1} />
    </Page>

    {/* Página 2: Dimensões */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Análise por Dimensão</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { width: "40%" }]}>Dimensão</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Score</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Desvio</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Classificação</Text>
          </View>
          {dados.dimensoes.map((dim, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "40%" }]}>{dim.nome}</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{dim.score.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                {dim.desvioPadrao.toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{dim.classificacao}</Text>
            </View>
          ))}
        </View>
      </View>

      {dados.segmentos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise por Segmento</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { width: "25%" }]}>Tipo</Text>
              <Text style={[styles.tableCell, { width: "35%" }]}>Segmento</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>Score</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>Respostas</Text>
            </View>
            {dados.segmentos.map((seg, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "25%" }]}>{seg.tipo}</Text>
                <Text style={[styles.tableCell, { width: "35%" }]}>{seg.nome}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{seg.scoreMedia.toFixed(2)}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{seg.totalRespostas}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <PDFFooter pageNumber={2} />
    </Page>

    {/* Página 3: Insights e Recomendações */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pontos Fracos</Text>
        <View style={styles.list}>
          {dados.insights.pontosFracos.map((ponto, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listContent}>{ponto}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pontos Fortes</Text>
        <View style={styles.list}>
          {dados.insights.pontosFortes.map((ponto, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listContent}>{ponto}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendações</Text>
        {dados.recomendacoes.map((rec, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 3 }}>
              {index + 1}. {rec.titulo}
            </Text>
            <Text style={{ marginLeft: 15, marginBottom: 3 }}>{rec.descricao}</Text>
            {rec.acoes && rec.acoes.length > 0 && (
              <View style={{ marginLeft: 15 }}>
                <Text style={{ fontWeight: "bold", fontSize: 9 }}>Ações sugeridas:</Text>
                {rec.acoes.map((acao, aIndex) => (
                  <Text key={aIndex} style={{ fontSize: 9, marginLeft: 10 }}>
                    • {acao}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <DisclaimerLGPD />
      <PDFFooter pageNumber={3} />
    </Page>
  </Document>
);

// ============================================================================
// RELATÓRIO UNIDADE/SETOR
// ============================================================================

function RelatorioUnidadeSetorPDF({ dados }: { dados: DadosRelatorioUnidadeSetor }): React.ReactElement {
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFHeader
        empresa={dados.empresa.nome}
        tipo={`${dados.segmento.tipo} - ${dados.segmento.nome}`}
        periodo={dados.periodo}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Segmento</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Respostas:</Text>
          <Text style={styles.value}>{dados.dadosSegmento.totalRespostas}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Score Médio:</Text>
          <Text style={styles.value}>{dados.dadosSegmento.scoreMedia.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Score Mediano:</Text>
          <Text style={styles.value}>{dados.dadosSegmento.scoreMediano.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comparativo com a Empresa</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Score Médio da Empresa:</Text>
          <Text style={styles.value}>
            {dados.comparativoEmpresa.scoreMediaEmpresa.toFixed(2)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Diferença Percentual:</Text>
          <Text style={styles.value}>
            {dados.comparativoEmpresa.diferencaPercentual.toFixed(2)}%{" "}
            ({dados.comparativoEmpresa.melhorOuPior})
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Análise por Dimensão</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { width: "40%" }]}>Dimensão</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Segmento</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Empresa</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Diferença</Text>
          </View>
          {dados.dimensoes.map((dim, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "40%" }]}>{dim.nome}</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                {dim.scoreSegmento.toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                {dim.scoreEmpresa.toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{dim.diferenca.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      <DisclaimerLGPD />
      <PDFFooter pageNumber={1} />
    </Page>
  </Document>
  );
}

// ============================================================================
// RELATÓRIO DE EVOLUÇÃO
// ============================================================================

function RelatorioEvolucaoPDF({ dados }: { dados: DadosRelatorioEvolucao }): React.ReactElement {
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFHeader empresa={dados.empresa.nome} tipo="Evolução Temporal" periodo={dados.periodo} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Análise de Tendência</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo de Tendência:</Text>
          <Text style={styles.value}>{dados.tendencia.tipo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Percentual de Mudança:</Text>
          <Text style={styles.value}>{dados.tendencia.percentualMudanca.toFixed(2)}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Interpretação:</Text>
          <Text style={styles.value}>{dados.tendencia.interpretacao}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evolução por Ciclo</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { width: "40%" }]}>Ciclo</Text>
            <Text style={[styles.tableCell, { width: "30%" }]}>Score Médio</Text>
            <Text style={[styles.tableCell, { width: "30%" }]}>Respostas</Text>
          </View>
          {dados.ciclos.map((ciclo, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "40%" }]}>{ciclo.nome}</Text>
              <Text style={[styles.tableCell, { width: "30%" }]}>{ciclo.scoreMedia.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { width: "30%" }]}>{ciclo.totalRespostas}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evolução por Dimensão</Text>
        {dados.evolucaoDimensoes.map((dim, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}>
              {dim.dimensao} - Tendência: {dim.tendencia}
            </Text>
            <Text style={{ fontSize: 9, marginLeft: 10 }}>
              Scores: {dim.scores.map((s) => s.toFixed(2)).join(" → ")}
            </Text>
          </View>
        ))}
      </View>

      <DisclaimerLGPD />
      <PDFFooter pageNumber={1} />
    </Page>
  </Document>
  );
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE GERAÇÃO
// ============================================================================

export async function gerarPDF(dados: DadosRelatorio): Promise<{
  caminhoArquivo: string;
  nomeArquivo: string;
}> {
  let documento: React.ReactElement | null = null;

  // Selecionar template baseado no tipo de relatório
  switch (dados.tipo) {
    case "executivo":
      documento = RelatorioExecutivoPDF({ dados });
      break;
    case "completo":
      documento = RelatorioCompletoPDF({ dados });
      break;
    case "unidade":
    case "setor":
      documento = RelatorioUnidadeSetorPDF({ dados });
      break;
    case "evolucao":
      documento = RelatorioEvolucaoPDF({ dados });
      break;
    default:
      throw new Error(`Tipo de relatório não suportado: ${(dados as any).tipo}`);
  }

  if (!documento) {
    throw new Error("Erro ao gerar documento PDF");
  }

  // Gerar PDF
  const pdfBlob = await pdf(documento).toBlob();
  const buffer = Buffer.from(await pdfBlob.arrayBuffer());

  // Criar diretório temporário se não existir
  const tempDir = join(process.cwd(), "temp", "relatorios");
  await mkdir(tempDir, { recursive: true });

  // Gerar nome de arquivo único
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const nomeArquivo = `relatorio-${dados.tipo}-${timestamp}-${nanoid(8)}.pdf`;
  const caminhoArquivo = join(tempDir, nomeArquivo);

  // Salvar arquivo
  await writeFile(caminhoArquivo, buffer);

  return {
    caminhoArquivo,
    nomeArquivo,
  };
}
