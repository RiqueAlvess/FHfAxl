"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PontoTemporal {
  data: string;
  ciclo: string;
  scoreMedio: number;
  totalRespostas: number;
  desvioPadrao?: number;
}

interface EvolucaoTemporalChartProps {
  evolucao: PontoTemporal[];
  mostrarTendencia?: boolean;
}

export default function EvolucaoTemporalChart({
  evolucao,
  mostrarTendencia = true,
}: EvolucaoTemporalChartProps) {
  // Ordenar por data
  const dadosOrdenados = [...evolucao].sort((a, b) =>
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  // Calcular tendência (regressão linear simples)
  const calcularTendencia = () => {
    if (dadosOrdenados.length < 2) return null;

    const n = dadosOrdenados.length;
    const x = dadosOrdenados.map((_, i) => i);
    const y = dadosOrdenados.map(d => d.scoreMedio);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  const tendencia = calcularTendencia();

  // Adicionar linha de tendência aos dados
  const dadosComTendencia = dadosOrdenados.map((ponto, index) => ({
    ...ponto,
    tendencia: tendencia ? tendencia.slope * index + tendencia.intercept : null,
    dataFormatada: new Date(ponto.data).toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit',
    }),
  }));

  // Determinar direção da tendência
  const direcaoTendencia = tendencia
    ? tendencia.slope > 0.5
      ? "crescente"
      : tendencia.slope < -0.5
      ? "decrescente"
      : "estável"
    : "indeterminada";

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Evolução Temporal dos Scores</CardTitle>
        <CardDescription className="text-zinc-400">
          Variação do score médio ao longo dos ciclos de avaliação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={dadosComTendencia}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="dataFormatada"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fill: "#a1a1aa" }}
              label={{ value: "Score Médio", angle: -90, position: "insideLeft", fill: "#a1a1aa" }}
              domain={[0, 140]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "0.5rem",
                color: "#fafafa",
              }}
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload as PontoTemporal & { dataFormatada: string };
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs">
                      <div className="font-bold text-violet-400 mb-2">{data.ciclo}</div>
                      <div className="space-y-1 text-zinc-300">
                        <div>Data: {new Date(data.data).toLocaleDateString('pt-BR')}</div>
                        <div>Score Médio: <span className="font-bold text-violet-400">{data.scoreMedio.toFixed(2)}</span></div>
                        {data.desvioPadrao && (
                          <div>Desvio Padrão: {data.desvioPadrao.toFixed(2)}</div>
                        )}
                        <div>Respondentes: {data.totalRespostas}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ color: "#a1a1aa" }}
              formatter={(value) => {
                if (value === "scoreMedio") return "Score Médio";
                if (value === "tendencia") return "Linha de Tendência";
                return value;
              }}
            />

            {/* Área de preenchimento */}
            <Area
              type="monotone"
              dataKey="scoreMedio"
              fill="#8b5cf6"
              fillOpacity={0.1}
              stroke="none"
            />

            {/* Linha principal */}
            <Line
              type="monotone"
              dataKey="scoreMedio"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: "#8b5cf6", r: 5 }}
              activeDot={{ r: 7, fill: "#a78bfa" }}
            />

            {/* Linha de tendência */}
            {mostrarTendencia && tendencia && (
              <Line
                type="monotone"
                dataKey="tendencia"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Análise de Tendência */}
        {tendencia && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Direção da Tendência */}
            <div className={`p-4 rounded-lg border ${
              direcaoTendencia === "decrescente"
                ? "bg-green-500/10 border-green-500/30"
                : direcaoTendencia === "crescente"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {direcaoTendencia === "decrescente" ? (
                  <TrendingDown className="h-5 w-5 text-green-400" />
                ) : direcaoTendencia === "crescente" ? (
                  <TrendingUp className="h-5 w-5 text-red-400" />
                ) : (
                  <Minus className="h-5 w-5 text-blue-400" />
                )}
                <div className="text-sm font-bold text-zinc-100">Tendência</div>
              </div>
              <div className={`text-2xl font-bold ${
                direcaoTendencia === "decrescente"
                  ? "text-green-400"
                  : direcaoTendencia === "crescente"
                  ? "text-red-400"
                  : "text-blue-400"
              }`}>
                {direcaoTendencia === "decrescente" ? "Melhora" : direcaoTendencia === "crescente" ? "Piora" : "Estável"}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Slope: {tendencia.slope.toFixed(3)}
              </div>
            </div>

            {/* Variação Total */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-xs text-zinc-400 mb-1">Variação Total</div>
              <div className="text-2xl font-bold text-violet-400">
                {(dadosOrdenados[dadosOrdenados.length - 1].scoreMedio - dadosOrdenados[0].scoreMedio).toFixed(2)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {dadosOrdenados[0].scoreMedio.toFixed(1)} → {dadosOrdenados[dadosOrdenados.length - 1].scoreMedio.toFixed(1)}
              </div>
            </div>

            {/* Total de Ciclos */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-xs text-zinc-400 mb-1">Ciclos Avaliados</div>
              <div className="text-2xl font-bold text-zinc-100">
                {dadosOrdenados.length}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {dadosOrdenados.reduce((sum, p) => sum + p.totalRespostas, 0)} respostas totais
              </div>
            </div>
          </div>
        )}

        {/* Lista de Ciclos */}
        <div className="mt-6">
          <div className="text-sm font-bold text-zinc-100 mb-3">Histórico de Ciclos:</div>
          <div className="space-y-2">
            {dadosOrdenados.map((ponto, index) => {
              const variacao = index > 0
                ? ponto.scoreMedio - dadosOrdenados[index - 1].scoreMedio
                : 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-100">{ponto.ciclo}</div>
                    <div className="text-xs text-zinc-400">
                      {new Date(ponto.data).toLocaleDateString('pt-BR')} · {ponto.totalRespostas} respondentes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-violet-400">
                      {ponto.scoreMedio.toFixed(2)}
                    </div>
                    {index > 0 && (
                      <div className={`text-xs ${
                        variacao < 0 ? "text-green-400" : variacao > 0 ? "text-red-400" : "text-zinc-400"
                      }`}>
                        {variacao > 0 ? "+" : ""}{variacao.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interpretação */}
        {dadosOrdenados.length < 2 && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-sm text-yellow-300">
              <strong>Observação:</strong> São necessários pelo menos 2 ciclos de avaliação para análise de evolução temporal.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
