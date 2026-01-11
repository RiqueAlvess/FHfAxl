"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DadosRelatorio } from "@/types/reports";

interface ReportPreviewProps {
  dados: DadosRelatorio;
}

export default function ReportPreview({ dados }: ReportPreviewProps) {
  // Renderizar preview baseado no tipo de relatório
  switch (dados.tipo) {
    case "executivo":
      return <PreviewExecutivo dados={dados} />;
    case "completo":
      return <PreviewCompleto dados={dados} />;
    case "unidade":
    case "setor":
      return <PreviewUnidadeSetor dados={dados} />;
    case "evolucao":
      return <PreviewEvolucao dados={dados} />;
    default:
      return null;
  }
}

// ============================================================================
// PREVIEW EXECUTIVO
// ============================================================================

function PreviewExecutivo({ dados }: { dados: DadosRelatorio }) {
  if (dados.tipo !== "executivo") return null;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo - {dados.empresa.nome}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Período: {dados.periodo.inicio.toLocaleDateString("pt-BR")} -{" "}
            {dados.periodo.fim.toLocaleDateString("pt-BR")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Colaboradores</p>
              <p className="text-2xl font-bold">{dados.resumoKPIs.totalColaboradores}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Respostas</p>
              <p className="text-2xl font-bold">{dados.resumoKPIs.totalRespostas}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Adesão</p>
              <p className="text-2xl font-bold">{dados.resumoKPIs.taxaAdesao.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score Global</p>
              <p className="text-2xl font-bold">{dados.resumoKPIs.scoreGlobal.toFixed(2)}</p>
              <Badge
                variant={
                  dados.resumoKPIs.classificacao.includes("SATISF")
                    ? "default"
                    : dados.resumoKPIs.classificacao.includes("ATEN")
                    ? "secondary"
                    : "destructive"
                }
              >
                {dados.resumoKPIs.classificacao}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Pontos Críticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Top 5 Pontos Críticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimensão</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">% Crítico</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.top5PontosCriticos.map((ponto, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{ponto.dimensao}</TableCell>
                  <TableCell className="text-right">{ponto.score.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {ponto.percentualCritico.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Prioritárias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dados.recomendacoes.map((rec, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">{rec.titulo}</h4>
                  <Badge variant={rec.prioridade === "alta" ? "destructive" : "secondary"}>
                    {rec.prioridade}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{rec.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// PREVIEW COMPLETO
// ============================================================================

function PreviewCompleto({ dados }: { dados: DadosRelatorio }) {
  if (dados.tipo !== "completo") return null;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores Principais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard label="Colaboradores" value={dados.kpis.totalColaboradores} />
            <MetricCard label="Respostas" value={dados.kpis.totalRespostas} />
            <MetricCard label="Taxa de Adesão" value={`${dados.kpis.taxaAdesao.toFixed(1)}%`} />
            <MetricCard label="Score Global" value={dados.kpis.scoreGlobal.toFixed(2)} />
            <MetricCard label="Score Mediano" value={dados.kpis.scoreMediano.toFixed(2)} />
            <MetricCard label="Desvio Padrão" value={dados.kpis.desvioPadrao.toFixed(2)} />
          </div>
        </CardContent>
      </Card>

      {/* Distribuição */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">Satisfatório</p>
              <p className="text-2xl font-bold text-green-800">
                {dados.distribuicaoRisco.satisfatorio}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">Atenção</p>
              <p className="text-2xl font-bold text-yellow-800">
                {dados.distribuicaoRisco.atencao}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">Crítico</p>
              <p className="text-2xl font-bold text-red-800">
                {dados.distribuicaoRisco.critico}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensões */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Dimensão</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimensão</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Desvio Padrão</TableHead>
                <TableHead className="text-right">Classificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.dimensoes.map((dim, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{dim.nome}</TableCell>
                  <TableCell className="text-right">{dim.score.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{dim.desvioPadrao.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        dim.classificacao === "Baixo"
                          ? "default"
                          : dim.classificacao === "Médio"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {dim.classificacao}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights */}
      {dados.insights && (
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-destructive mb-2">Pontos Fracos</h4>
              <ul className="list-disc list-inside space-y-1">
                {dados.insights.pontosFracos.map((ponto, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {ponto}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-600 mb-2">Pontos Fortes</h4>
              <ul className="list-disc list-inside space-y-1">
                {dados.insights.pontosFortes.map((ponto, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {ponto}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// PREVIEW UNIDADE/SETOR
// ============================================================================

function PreviewUnidadeSetor({ dados }: { dados: DadosRelatorio }) {
  if (dados.tipo !== "unidade" && dados.tipo !== "setor") return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {dados.segmento.tipo}: {dados.segmento.nome}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Período: {dados.periodo.inicio.toLocaleDateString("pt-BR")} -{" "}
            {dados.periodo.fim.toLocaleDateString("pt-BR")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Respostas" value={dados.dadosSegmento.totalRespostas} />
            <MetricCard label="Score Médio" value={dados.dadosSegmento.scoreMedia.toFixed(2)} />
            <MetricCard label="Score Mediano" value={dados.dadosSegmento.scoreMediano.toFixed(2)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo com a Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Score Médio da Empresa</p>
              <p className="text-2xl font-bold">
                {dados.comparativoEmpresa.scoreMediaEmpresa.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              {dados.comparativoEmpresa.melhorOuPior === "melhor" ? (
                <TrendingDown className="h-8 w-8 text-green-600 mx-auto" />
              ) : dados.comparativoEmpresa.melhorOuPior === "pior" ? (
                <TrendingUp className="h-8 w-8 text-red-600 mx-auto" />
              ) : (
                <Minus className="h-8 w-8 text-gray-600 mx-auto" />
              )}
              <p className="text-lg font-bold mt-2">
                {dados.comparativoEmpresa.diferencaPercentual.toFixed(2)}%
              </p>
              <Badge
                variant={
                  dados.comparativoEmpresa.melhorOuPior === "melhor"
                    ? "default"
                    : dados.comparativoEmpresa.melhorOuPior === "pior"
                    ? "destructive"
                    : "secondary"
                }
              >
                {dados.comparativoEmpresa.melhorOuPior}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise por Dimensão</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimensão</TableHead>
                <TableHead className="text-right">Segmento</TableHead>
                <TableHead className="text-right">Empresa</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.dimensoes.map((dim, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{dim.nome}</TableCell>
                  <TableCell className="text-right">{dim.scoreSegmento.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{dim.scoreEmpresa.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        dim.diferenca < 0
                          ? "text-green-600"
                          : dim.diferenca > 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }
                    >
                      {dim.diferenca > 0 ? "+" : ""}
                      {dim.diferenca.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// PREVIEW EVOLUÇÃO
// ============================================================================

function PreviewEvolucao({ dados }: { dados: DadosRelatorio }) {
  if (dados.tipo !== "evolucao") return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise de Tendência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Tendência</p>
              <div className="flex items-center gap-2 mt-1">
                {dados.tendencia.tipo === "crescente" ? (
                  <TrendingUp className="h-5 w-5 text-red-600" />
                ) : dados.tendencia.tipo === "decrescente" ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-600" />
                )}
                <span className="font-medium capitalize">{dados.tendencia.tipo}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Percentual de Mudança</p>
              <p className="text-2xl font-bold mt-1">
                {dados.tendencia.percentualMudanca > 0 ? "+" : ""}
                {dados.tendencia.percentualMudanca.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Interpretação</p>
            <p className="mt-1">{dados.tendencia.interpretacao}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolução por Ciclo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ciclo</TableHead>
                <TableHead className="text-right">Score Médio</TableHead>
                <TableHead className="text-right">Respostas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.ciclos.map((ciclo, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{ciclo.nome}</TableCell>
                  <TableCell className="text-right">{ciclo.scoreMedia.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{ciclo.totalRespostas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
