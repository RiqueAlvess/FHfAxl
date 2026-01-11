"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DimensaoRadar {
  dimensao: string;
  score: number;
  max: number;
  polaridade: "positiva" | "negativa";
}

interface RadarDimensoesChartProps {
  dimensoes: DimensaoRadar[];
}

export default function RadarDimensoesChart({ dimensoes }: RadarDimensoesChartProps) {
  // Preparar dados para o radar com nomes abreviados
  const radarData = dimensoes.map((dim) => ({
    // Usar primeira palavra ou abreviação para caber no gráfico
    dimensao: dim.dimensao.length > 20
      ? dim.dimensao.split(" ")[0] + "..."
      : dim.dimensao,
    dimensaoCompleta: dim.dimensao,
    score: dim.score,
    max: 20,
    percentual: (dim.score / 20) * 100,
    polaridade: dim.polaridade,
  }));

  // Calcular score médio geral
  const scoreMedioGeral = dimensoes.reduce((acc, dim) => acc + dim.score, 0) / dimensoes.length;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Radar de Dimensões 360°</CardTitle>
        <CardDescription className="text-zinc-400">
          Visão panorâmica dos riscos psicossociais em todas as dimensões
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico Radar */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={450}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis
                  dataKey="dimensao"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 20]}
                  tick={{ fill: "#a1a1aa" }}
                  tickCount={5}
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
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs">
                          <div className="font-bold text-zinc-100 mb-2">{data.dimensaoCompleta}</div>
                          <div className="space-y-1 text-zinc-300">
                            <div>Score: <span className="font-bold text-violet-400">{data.score.toFixed(2)}</span> / 20</div>
                            <div>Percentual: {data.percentual.toFixed(1)}%</div>
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
                  formatter={() => "Score por Dimensão"}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Estatísticas e Análise */}
          <div className="space-y-4">
            {/* Score Médio Geral */}
            <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <div className="text-xs text-violet-300 mb-1">Score Médio Geral</div>
              <div className="text-3xl font-bold text-violet-400">
                {scoreMedioGeral.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">de 20 pontos</div>
              <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(scoreMedioGeral / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* Dimensões Críticas (scores mais altos com polaridade negativa) */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-sm font-bold text-zinc-100 mb-3">
                Dimensões Críticas
              </div>
              <div className="space-y-2">
                {radarData
                  .filter(d => d.polaridade === "negativa" && d.score > 14)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map((dim, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-red-400">⚠️ {dim.dimensao}</span>
                      <span className="font-bold text-red-300">{dim.score.toFixed(1)}</span>
                    </div>
                  ))}
                {radarData.filter(d => d.polaridade === "negativa" && d.score > 14).length === 0 && (
                  <div className="text-xs text-green-400">
                    ✓ Nenhuma dimensão crítica
                  </div>
                )}
              </div>
            </div>

            {/* Dimensões Fortes (scores altos com polaridade positiva) */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-sm font-bold text-zinc-100 mb-3">
                Fatores Protetores
              </div>
              <div className="space-y-2">
                {radarData
                  .filter(d => d.polaridade === "positiva" && d.score > 14)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map((dim, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-green-400">✓ {dim.dimensao}</span>
                      <span className="font-bold text-green-300">{dim.score.toFixed(1)}</span>
                    </div>
                  ))}
                {radarData.filter(d => d.polaridade === "positiva" && d.score > 14).length === 0 && (
                  <div className="text-xs text-yellow-400">
                    ⚠️ Poucos fatores protetores fortes
                  </div>
                )}
              </div>
            </div>

            {/* Dimensões de Atenção */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-sm font-bold text-zinc-100 mb-3">
                Requerem Atenção
              </div>
              <div className="space-y-2">
                {radarData
                  .filter(d => d.score > 7 && d.score <= 14)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map((dim, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-yellow-400">● {dim.dimensao}</span>
                      <span className="font-bold text-yellow-300">{dim.score.toFixed(1)}</span>
                    </div>
                  ))}
                {radarData.filter(d => d.score > 7 && d.score <= 14).length === 0 && (
                  <div className="text-xs text-zinc-400">
                    Nenhuma dimensão neste nível
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interpretação */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação do Radar:</strong> O gráfico radar proporciona uma visão 360° dos riscos psicossociais.
            Quanto mais próximo do centro, melhor para dimensões negativas (menor risco).
            Quanto mais afastado do centro, melhor para dimensões positivas (maior fator protetor).
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
