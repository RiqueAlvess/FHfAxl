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

interface CorrelacaoPonto {
  tempoResposta: number; // em segundos
  scoreTotal: number;
}

interface CorrelacaoData {
  pontos: CorrelacaoPonto[];
  coeficientePearson: number;
  pValor: number;
  interpretacao: string;
}

interface CorrelacaoTempoChartProps {
  correlacao: CorrelacaoData;
}

export default function CorrelacaoTempoChart({ correlacao }: CorrelacaoTempoChartProps) {
  // Converter tempo para minutos para melhor visualização
  const scatterData = correlacao.pontos.map((ponto, index) => ({
    tempoMinutos: ponto.tempoResposta / 60,
    score: ponto.scoreTotal,
    index,
  }));

  // Calcular médias para linhas de referência
  const mediaTempoMinutos = scatterData.reduce((sum, p) => sum + p.tempoMinutos, 0) / scatterData.length;
  const mediaScore = scatterData.reduce((sum, p) => sum + p.score, 0) / scatterData.length;

  // Determinar cor baseado no coeficiente
  const getCorrelationColor = (coef: number): string => {
    if (Math.abs(coef) < 0.3) return "text-zinc-400";
    if (Math.abs(coef) < 0.5) return "text-yellow-400";
    if (Math.abs(coef) < 0.7) return "text-orange-400";
    return "text-red-400";
  };

  const getCorrelationStrength = (coef: number): string => {
    const abs = Math.abs(coef);
    if (abs < 0.3) return "Fraca";
    if (abs < 0.5) return "Moderada";
    if (abs < 0.7) return "Forte";
    return "Muito Forte";
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Correlação: Tempo de Resposta vs Score</CardTitle>
        <CardDescription className="text-zinc-400">
          Análise da relação entre tempo de resposta e score total (Pearson)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Gráfico de Dispersão */}
          <div className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  type="number"
                  dataKey="tempoMinutos"
                  name="Tempo"
                  tick={{ fill: "#a1a1aa" }}
                  label={{ value: "Tempo de Resposta (minutos)", position: "insideBottom", offset: -5, fill: "#a1a1aa" }}
                />
                <YAxis
                  type="number"
                  dataKey="score"
                  name="Score"
                  tick={{ fill: "#a1a1aa" }}
                  label={{ value: "Score Total", angle: -90, position: "insideLeft", fill: "#a1a1aa" }}
                  domain={[0, 140]}
                />
                <ZAxis range={[50, 50]} />
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
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs">
                          <div className="font-bold text-violet-400 mb-2">Respondente #{data.index + 1}</div>
                          <div className="space-y-1 text-zinc-300">
                            <div>Tempo: <span className="font-bold">{data.tempoMinutos.toFixed(1)}</span> min</div>
                            <div>Score: <span className="font-bold">{data.score.toFixed(1)}</span></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Linhas de referência para médias */}
                <ReferenceLine
                  x={mediaTempoMinutos}
                  stroke="#8b5cf6"
                  strokeDasharray="3 3"
                  label={{ value: `Tempo médio: ${mediaTempoMinutos.toFixed(1)}m`, fill: "#8b5cf6", fontSize: 11 }}
                />
                <ReferenceLine
                  y={mediaScore}
                  stroke="#3b82f6"
                  strokeDasharray="3 3"
                  label={{ value: `Score médio: ${mediaScore.toFixed(1)}`, fill: "#3b82f6", fontSize: 11 }}
                />

                <Scatter
                  name="Respondentes"
                  data={scatterData}
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Estatísticas de Correlação */}
          <div className="space-y-4">
            {/* Coeficiente de Pearson */}
            <div className={`p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg`}>
              <div className="text-xs text-violet-300 mb-1">Coeficiente de Pearson</div>
              <div className={`text-3xl font-bold ${getCorrelationColor(correlacao.coeficientePearson)}`}>
                {correlacao.coeficientePearson.toFixed(3)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Correlação {getCorrelationStrength(correlacao.coeficientePearson)}
              </div>
            </div>

            {/* P-Valor */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-xs text-zinc-400 mb-1">P-Valor</div>
              <div className="text-2xl font-bold text-zinc-100">
                {correlacao.pValor.toFixed(4)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {correlacao.pValor < 0.05 ? (
                  <span className="text-green-400">✓ Significativo (p &lt; 0.05)</span>
                ) : (
                  <span className="text-yellow-400">⚠️ Não significativo</span>
                )}
              </div>
            </div>

            {/* Quantidade de Pontos */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-xs text-zinc-400 mb-1">N (Respondentes)</div>
              <div className="text-2xl font-bold text-zinc-100">
                {correlacao.pontos.length}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Pontos analisados
              </div>
            </div>

            {/* Tempo Médio */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-xs text-zinc-400 mb-1">Tempo Médio</div>
              <div className="text-2xl font-bold text-violet-400">
                {mediaTempoMinutos.toFixed(1)}m
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {Math.floor(mediaTempoMinutos)}min {Math.round((mediaTempoMinutos % 1) * 60)}s
              </div>
            </div>

            {/* Score Médio */}
            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <div className="text-xs text-zinc-400 mb-1">Score Médio</div>
              <div className="text-2xl font-bold text-blue-400">
                {mediaScore.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                De 140 pontos
              </div>
            </div>
          </div>
        </div>

        {/* Interpretação */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação:</strong> {correlacao.interpretacao}
            {correlacao.coeficientePearson > 0 && (
              <span className="text-orange-400"> Correlação positiva indica que tempos maiores tendem a associar-se com scores mais altos (maior risco).</span>
            )}
            {correlacao.coeficientePearson < 0 && (
              <span className="text-green-400"> Correlação negativa indica que tempos maiores tendem a associar-se com scores mais baixos (menor risco).</span>
            )}
            {Math.abs(correlacao.coeficientePearson) < 0.3 && (
              <span className="text-zinc-400"> Correlação fraca sugere pouca relação entre tempo de resposta e score.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
