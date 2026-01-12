"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from "recharts";

interface DimensaoConsistencia {
  dimensao: string;
  scoreMedio: number;
  desvioPadrao: number;
  coeficienteVariacao: number;
}

interface ConsistenciaInternaChartProps {
  dimensoes: DimensaoConsistencia[];
}

export default function ConsistenciaInternaChart({ dimensoes }: ConsistenciaInternaChartProps) {
  // Preparar dados para scatter plot
  const scatterData = dimensoes.map((dim) => ({
    ...dim,
  }));

  // Calcular médias para linhas de referência
  const mediaScore = dimensoes.reduce((sum, d) => sum + d.scoreMedio, 0) / dimensoes.length;
  const mediaDP = dimensoes.reduce((sum, d) => sum + d.desvioPadrao, 0) / dimensoes.length;

  // Função para determinar cor baseado na posição no quadrante
  const getPointColor = (score: number, dp: number): string => {
    // Quadrante 1: Alto score, Alto DP - Vermelho (mais crítico)
    if (score > mediaScore && dp > mediaDP) return "#ef4444";
    // Quadrante 2: Baixo score, Alto DP - Laranja (inconsistente)
    if (score <= mediaScore && dp > mediaDP) return "#f97316";
    // Quadrante 3: Baixo score, Baixo DP - Verde (melhor situação)
    if (score <= mediaScore && dp <= mediaDP) return "#22c55e";
    // Quadrante 4: Alto score, Baixo DP - Amarelo (consenso crítico)
    return "#eab308";
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Consistência Interna por Dimensão</CardTitle>
        <CardDescription className="text-zinc-400">
          Relação entre score médio e desvio padrão (dispersão × magnitude)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              type="number"
              dataKey="scoreMedio"
              name="Score Médio"
              tick={{ fill: "#a1a1aa" }}
              label={{ value: "Score Médio", position: "insideBottom", offset: -5, fill: "#a1a1aa" }}
              domain={[0, 20]}
            />
            <YAxis
              type="number"
              dataKey="desvioPadrao"
              name="Desvio Padrão"
              tick={{ fill: "#a1a1aa" }}
              label={{ value: "Desvio Padrão", angle: -90, position: "insideLeft", fill: "#a1a1aa" }}
            />
            <ZAxis range={[100, 400]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "0.5rem",
                color: "#fafafa",
              }}
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload as DimensaoConsistencia;
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs max-w-[250px]">
                      <div className="font-bold text-violet-400 mb-2">{data.dimensao}</div>
                      <div className="space-y-1 text-zinc-300">
                        <div>Score Médio: <span className="font-bold">{data.scoreMedio.toFixed(2)}</span></div>
                        <div>Desvio Padrão: <span className="font-bold">{data.desvioPadrao.toFixed(2)}</span></div>
                        <div>CV: {data.coeficienteVariacao.toFixed(1)}%</div>
                        <div className="mt-2 pt-2 border-t border-zinc-700 text-zinc-400">
                          {data.scoreMedio > mediaScore && data.desvioPadrao > mediaDP && (
                            <span className="text-red-400">⚠️ Alto risco + Alta dispersão</span>
                          )}
                          {data.scoreMedio <= mediaScore && data.desvioPadrao > mediaDP && (
                            <span className="text-orange-400">⚠️ Percepções inconsistentes</span>
                          )}
                          {data.scoreMedio <= mediaScore && data.desvioPadrao <= mediaDP && (
                            <span className="text-green-400">✓ Baixo risco + Consenso</span>
                          )}
                          {data.scoreMedio > mediaScore && data.desvioPadrao <= mediaDP && (
                            <span className="text-yellow-400">⚠️ Consenso em risco</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Linhas de referência para dividir em quadrantes */}
            <ReferenceLine
              x={mediaScore}
              stroke="#8b5cf6"
              strokeDasharray="3 3"
              label={{
                value: `Score médio: ${mediaScore.toFixed(1)}`,
                fill: "#8b5cf6",
                fontSize: 11,
                position: "top",
              }}
            />
            <ReferenceLine
              y={mediaDP}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              label={{
                value: `DP médio: ${mediaDP.toFixed(1)}`,
                fill: "#3b82f6",
                fontSize: 11,
                position: "right",
              }}
            />

            <Scatter
              name="Dimensões"
              data={scatterData}
              fill="#8b5cf6"
              shape="circle"
            >
              {scatterData.map((entry, index) => (
                <circle
                  key={`cell-${index}`}
                  cx={0}
                  cy={0}
                  r={8}
                  fill={getPointColor(entry.scoreMedio, entry.desvioPadrao)}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Análise por Quadrantes */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrante 1: Alto Score + Alto DP */}
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="text-sm font-bold text-red-300">Alto Risco + Alta Dispersão</div>
            </div>
            <div className="text-xs text-zinc-300 mb-2">
              Dimensões com scores altos e opiniões divergentes
            </div>
            <div className="space-y-1">
              {dimensoes
                .filter(d => d.scoreMedio > mediaScore && d.desvioPadrao > mediaDP)
                .map((d, idx) => (
                  <div key={idx} className="text-xs text-red-200 truncate">
                    • {d.dimensao}
                  </div>
                ))}
              {dimensoes.filter(d => d.scoreMedio > mediaScore && d.desvioPadrao > mediaDP).length === 0 && (
                <div className="text-xs text-zinc-500">Nenhuma dimensão</div>
              )}
            </div>
          </div>

          {/* Quadrante 2: Baixo Score + Alto DP */}
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <div className="text-sm font-bold text-orange-300">Percepções Inconsistentes</div>
            </div>
            <div className="text-xs text-zinc-300 mb-2">
              Scores moderados mas com grande variação
            </div>
            <div className="space-y-1">
              {dimensoes
                .filter(d => d.scoreMedio <= mediaScore && d.desvioPadrao > mediaDP)
                .map((d, idx) => (
                  <div key={idx} className="text-xs text-orange-200 truncate">
                    • {d.dimensao}
                  </div>
                ))}
              {dimensoes.filter(d => d.scoreMedio <= mediaScore && d.desvioPadrao > mediaDP).length === 0 && (
                <div className="text-xs text-zinc-500">Nenhuma dimensão</div>
              )}
            </div>
          </div>

          {/* Quadrante 3: Baixo Score + Baixo DP */}
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="text-sm font-bold text-green-300">Baixo Risco + Consenso</div>
            </div>
            <div className="text-xs text-zinc-300 mb-2">
              Melhor situação: baixos scores com concordância
            </div>
            <div className="space-y-1">
              {dimensoes
                .filter(d => d.scoreMedio <= mediaScore && d.desvioPadrao <= mediaDP)
                .map((d, idx) => (
                  <div key={idx} className="text-xs text-green-200 truncate">
                    • {d.dimensao}
                  </div>
                ))}
              {dimensoes.filter(d => d.scoreMedio <= mediaScore && d.desvioPadrao <= mediaDP).length === 0 && (
                <div className="text-xs text-zinc-500">Nenhuma dimensão</div>
              )}
            </div>
          </div>

          {/* Quadrante 4: Alto Score + Baixo DP */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="text-sm font-bold text-yellow-300">Consenso em Risco</div>
            </div>
            <div className="text-xs text-zinc-300 mb-2">
              Todos concordam que há problema
            </div>
            <div className="space-y-1">
              {dimensoes
                .filter(d => d.scoreMedio > mediaScore && d.desvioPadrao <= mediaDP)
                .map((d, idx) => (
                  <div key={idx} className="text-xs text-yellow-200 truncate">
                    • {d.dimensao}
                  </div>
                ))}
              {dimensoes.filter(d => d.scoreMedio > mediaScore && d.desvioPadrao <= mediaDP).length === 0 && (
                <div className="text-xs text-zinc-500">Nenhuma dimensão</div>
              )}
            </div>
          </div>
        </div>

        {/* Interpretação */}
        <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação:</strong> O gráfico divide dimensões em 4 quadrantes.
            Priorize ações no quadrante vermelho (alto risco + dispersão). O quadrante verde representa a situação ideal.
            Alta dispersão sugere que diferentes grupos têm experiências muito distintas.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
