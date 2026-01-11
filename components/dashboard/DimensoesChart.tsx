"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface DimensaoData {
  dimensao: string;
  scoreMedio: number;
  desvioPadrao: number;
  polaridade: "positiva" | "negativa";
  count: number;
}

interface DimensoesChartProps {
  dimensoes: DimensaoData[];
}

export default function DimensoesChart({ dimensoes }: DimensoesChartProps) {
  // Ordenar dimensões por score médio (decrescente)
  const dimensoesOrdenadas = [...dimensoes].sort((a, b) => b.scoreMedio - a.scoreMedio);

  // Função para determinar cor baseado no score e polaridade
  const getBarColor = (score: number, polaridade: "positiva" | "negativa"): string => {
    if (polaridade === "negativa") {
      // Para polaridade negativa, scores altos são ruins
      if (score <= 7) return "#22c55e"; // Verde - Baixo risco
      if (score <= 14) return "#eab308"; // Amarelo - Médio risco
      return "#ef4444"; // Vermelho - Alto risco
    } else {
      // Para polaridade positiva, scores altos são bons
      if (score >= 14) return "#22c55e"; // Verde - Alto score positivo
      if (score >= 7) return "#eab308"; // Amarelo - Score moderado
      return "#ef4444"; // Vermelho - Baixo score
    }
  };

  // Determinar status da dimensão
  const getStatusIcon = (score: number, polaridade: "positiva" | "negativa") => {
    if (polaridade === "negativa") {
      if (score <= 7) return <TrendingDown className="h-4 w-4 text-green-400" />;
      if (score <= 14) return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      return <TrendingUp className="h-4 w-4 text-red-400" />;
    } else {
      if (score >= 14) return <TrendingUp className="h-4 w-4 text-green-400" />;
      if (score >= 7) return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      return <TrendingDown className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Scores por Dimensão</CardTitle>
        <CardDescription className="text-zinc-400">
          Score médio (0-20) para cada dimensão com indicador de polaridade
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Gráfico de Barras Horizontal */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dimensoesOrdenadas} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              type="number"
              domain={[0, 20]}
              tick={{ fill: "#a1a1aa" }}
              label={{ value: "Score Médio", position: "insideBottom", offset: -5, fill: "#a1a1aa" }}
            />
            <YAxis
              type="category"
              dataKey="dimensao"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              width={150}
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
                  const data = payload[0].payload as DimensaoData;
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs">
                      <div className="font-bold text-zinc-100 mb-2">{data.dimensao}</div>
                      <div className="space-y-1 text-zinc-300">
                        <div>Score Médio: <span className="font-bold">{data.scoreMedio.toFixed(2)}</span></div>
                        <div>Desvio Padrão: {data.desvioPadrao.toFixed(2)}</div>
                        <div>Respondentes: {data.count}</div>
                        <div className="mt-2 pt-2 border-t border-zinc-700">
                          Polaridade: <span className={`font-bold ${data.polaridade === 'negativa' ? 'text-red-400' : 'text-green-400'}`}>
                            {data.polaridade}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ color: "#a1a1aa" }}
              formatter={() => "Score Médio"}
            />

            {/* Linha de referência para score médio geral (10 pontos) */}
            <ReferenceLine
              x={10}
              stroke="#8b5cf6"
              strokeDasharray="3 3"
              label={{ value: "Média: 10", fill: "#8b5cf6", fontSize: 11 }}
            />

            <Bar dataKey="scoreMedio" radius={[0, 4, 4, 0]}>
              {dimensoesOrdenadas.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.scoreMedio, entry.polaridade)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Lista de Dimensões com Status */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {dimensoesOrdenadas.map((dim) => {
            const polaridadeColor = dim.polaridade === "negativa" ? "text-orange-400" : "text-blue-400";
            const barColor = getBarColor(dim.scoreMedio, dim.polaridade);

            return (
              <div
                key={dim.dimensao}
                className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(dim.scoreMedio, dim.polaridade)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-100">{dim.dimensao}</div>
                    <div className="text-xs text-zinc-400">
                      {dim.polaridade === "negativa" ? "⚠️ Negativa" : "✓ Positiva"} · {dim.count} respostas
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: barColor }}>
                    {dim.scoreMedio.toFixed(1)}
                  </div>
                  <div className="text-xs text-zinc-400">
                    ±{dim.desvioPadrao.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda de Polaridade */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Polaridade das Dimensões:</strong>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠️ Negativa:</span>
                <span className="text-zinc-400">Scores altos indicam maior risco (ex: Exigências Quantitativas)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓ Positiva:</span>
                <span className="text-zinc-400">Scores altos indicam fator protetor (ex: Apoio Social)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
