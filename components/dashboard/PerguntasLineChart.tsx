"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PerguntaScore {
  numero: number;
  texto: string;
  scoreMedio: number;
  dimensao: string;
  polaridade: "positiva" | "negativa";
}

interface PerguntasLineChartProps {
  perguntas: PerguntaScore[];
}

export default function PerguntasLineChart({ perguntas }: PerguntasLineChartProps) {
  // Ordenar perguntas por número
  const perguntasOrdenadas = [...perguntas].sort((a, b) => a.numero - b.numero);

  // Preparar dados para o gráfico
  const lineData = perguntasOrdenadas.map(p => ({
    ...p,
    numeroLabel: `Q${p.numero}`,
    score: p.scoreMedio,
  }));

  // Calcular média geral
  const mediaGeral = perguntas.reduce((sum, p) => sum + p.scoreMedio, 0) / perguntas.length;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Score Médio por Pergunta</CardTitle>
        <CardDescription className="text-zinc-400">
          Evolução dos scores médios nas 35 perguntas do questionário HSE-IT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="numeroLabel"
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              domain={[0, 4]}
              tick={{ fill: "#a1a1aa" }}
              label={{ value: "Score Médio", angle: -90, position: "insideLeft", fill: "#a1a1aa" }}
              ticks={[0, 1, 2, 3, 4]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "0.5rem",
                color: "#fafafa",
                maxWidth: "300px",
              }}
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload as PerguntaScore & { numero: string };
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs max-w-[300px]">
                      <div className="font-bold text-violet-400 mb-2">
                        Pergunta {data.numero} - {data.dimensao}
                      </div>
                      <div className="text-zinc-300 mb-2 text-[11px] leading-tight">
                        {data.texto.length > 100 ? data.texto.substring(0, 100) + "..." : data.texto}
                      </div>
                      <div className="space-y-1 text-zinc-300 border-t border-zinc-700 pt-2">
                        <div>Score Médio: <span className="font-bold text-violet-400">{data.scoreMedio.toFixed(2)}</span></div>
                        <div>
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

            {/* Linha de referência para a média geral */}
            <ReferenceLine
              y={mediaGeral}
              stroke="#8b5cf6"
              strokeDasharray="3 3"
              label={{
                value: `Média: ${mediaGeral.toFixed(2)}`,
                fill: "#8b5cf6",
                fontSize: 11,
                position: "right",
              }}
            />

            {/* Linha de referência para score crítico (3.0) */}
            <ReferenceLine
              y={3}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: "Crítico: 3.0",
                fill: "#ef4444",
                fontSize: 11,
                position: "left",
              }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", r: 3 }}
              activeDot={{ r: 5, fill: "#a78bfa" }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Estatísticas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Média Geral</div>
            <div className="text-xl font-bold text-violet-400">
              {mediaGeral.toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Score Mais Alto</div>
            <div className="text-xl font-bold text-red-400">
              {Math.max(...perguntas.map(p => p.scoreMedio)).toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Score Mais Baixo</div>
            <div className="text-xl font-bold text-green-400">
              {Math.min(...perguntas.map(p => p.scoreMedio)).toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Perguntas Críticas</div>
            <div className="text-xl font-bold text-red-400">
              {perguntas.filter(p => p.scoreMedio >= 3).length}
            </div>
          </div>
        </div>

        {/* Interpretação */}
        <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação:</strong> Perguntas com scores acima de 3.0 indicam áreas críticas que requerem atenção imediata.
            Analise as variações para identificar padrões entre dimensões.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
