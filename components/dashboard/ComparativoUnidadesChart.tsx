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
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface UnidadeScore {
  unidade: string;
  scoreMedio: number;
  totalRespondentes: number;
  desvioPadrao: number;
  atendeKAnonymity: boolean;
}

interface ComparativoUnidadesChartProps {
  unidades: UnidadeScore[];
  minGroupSize?: number;
}

export default function ComparativoUnidadesChart({
  unidades,
  minGroupSize = 5,
}: ComparativoUnidadesChartProps) {
  // Filtrar apenas unidades que atendem K-Anonymity
  const unidadesValidas = unidades.filter(u => u.atendeKAnonymity);
  const unidadesOcultas = unidades.filter(u => !u.atendeKAnonymity);

  // Ordenar por score médio (decrescente)
  const unidadesOrdenadas = [...unidadesValidas].sort((a, b) => b.scoreMedio - a.scoreMedio);

  // Calcular média geral
  const mediaGeral = unidadesValidas.length > 0
    ? unidadesValidas.reduce((sum, u) => sum + u.scoreMedio, 0) / unidadesValidas.length
    : 0;

  // Função para determinar cor baseado no score
  const getBarColor = (score: number): string => {
    if (score <= 40) return "#22c55e"; // Verde - Satisfatório
    if (score <= 80) return "#eab308"; // Amarelo - Atenção
    return "#ef4444"; // Vermelho - Crítico
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Comparativo por Unidade</CardTitle>
        <CardDescription className="text-zinc-400">
          Score médio por unidade organizacional (K-Anonymity: mín. {minGroupSize} respondentes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Alerta K-Anonymity */}
        {unidadesOcultas.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <EyeOff className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-300">
                <strong>Proteção de Dados (K-Anonymity):</strong> {unidadesOcultas.length} unidade
                {unidadesOcultas.length > 1 ? 's' : ''} com menos de {minGroupSize} respondente
                {minGroupSize > 1 ? 's' : ''} {unidadesOcultas.length > 1 ? 'foram ocultadas' : 'foi ocultada'} para proteger a privacidade (LGPD).
              </div>
            </div>
          </div>
        )}

        {/* Gráfico */}
        {unidadesOrdenadas.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={Math.max(400, unidadesOrdenadas.length * 60)}>
              <BarChart data={unidadesOrdenadas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  type="number"
                  domain={[0, 140]}
                  tick={{ fill: "#a1a1aa" }}
                  label={{ value: "Score Médio", position: "insideBottom", offset: -5, fill: "#a1a1aa" }}
                />
                <YAxis
                  type="category"
                  dataKey="unidade"
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
                      const data = payload[0].payload as UnidadeScore;
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs">
                          <div className="font-bold text-zinc-100 mb-2">{data.unidade}</div>
                          <div className="space-y-1 text-zinc-300">
                            <div>Score Médio: <span className="font-bold text-violet-400">{data.scoreMedio.toFixed(2)}</span></div>
                            <div>Desvio Padrão: {data.desvioPadrao.toFixed(2)}</div>
                            <div>Respondentes: {data.totalRespondentes}</div>
                            <div className="mt-2 pt-2 border-t border-zinc-700">
                              <div className="flex items-center gap-1 text-green-400">
                                <Eye className="h-3 w-3" />
                                <span>Atende K-Anonymity</span>
                              </div>
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

                {/* Linha de referência para média geral */}
                <ReferenceLine
                  x={mediaGeral}
                  stroke="#8b5cf6"
                  strokeDasharray="3 3"
                  label={{
                    value: `Média Geral: ${mediaGeral.toFixed(1)}`,
                    fill: "#8b5cf6",
                    fontSize: 11,
                    position: "top",
                  }}
                />

                {/* Linhas de referência para classificação */}
                <ReferenceLine
                  x={40}
                  stroke="#22c55e"
                  strokeDasharray="2 2"
                  strokeOpacity={0.3}
                />
                <ReferenceLine
                  x={80}
                  stroke="#eab308"
                  strokeDasharray="2 2"
                  strokeOpacity={0.3}
                />

                <Bar dataKey="scoreMedio" radius={[0, 4, 4, 0]}>
                  {unidadesOrdenadas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.scoreMedio)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Estatísticas */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                <div className="text-xs text-violet-300 mb-1">Média Geral</div>
                <div className="text-2xl font-bold text-violet-400">
                  {mediaGeral.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {unidadesValidas.length} unidade{unidadesValidas.length > 1 ? 's' : ''}
                </div>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-xs text-red-300 mb-1">Score Mais Alto</div>
                <div className="text-2xl font-bold text-red-400">
                  {Math.max(...unidadesValidas.map(u => u.scoreMedio)).toFixed(2)}
                </div>
                <div className="text-xs text-zinc-400 mt-1 truncate">
                  {unidadesOrdenadas[0].unidade}
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="text-xs text-green-300 mb-1">Score Mais Baixo</div>
                <div className="text-2xl font-bold text-green-400">
                  {Math.min(...unidadesValidas.map(u => u.scoreMedio)).toFixed(2)}
                </div>
                <div className="text-xs text-zinc-400 mt-1 truncate">
                  {unidadesOrdenadas[unidadesOrdenadas.length - 1].unidade}
                </div>
              </div>

              <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
                <div className="text-xs text-zinc-400 mb-1">Total Respondentes</div>
                <div className="text-2xl font-bold text-zinc-100">
                  {unidadesValidas.reduce((sum, u) => sum + u.totalRespondentes, 0)}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Em todas as unidades
                </div>
              </div>
            </div>

            {/* Ranking de Unidades */}
            <div className="mt-6">
              <div className="text-sm font-bold text-zinc-100 mb-3">Ranking de Unidades:</div>
              <div className="space-y-2">
                {unidadesOrdenadas.map((unidade, index) => {
                  const cor = getBarColor(unidade.scoreMedio);
                  const classificacao =
                    unidade.scoreMedio <= 40
                      ? "Satisfatório"
                      : unidade.scoreMedio <= 80
                      ? "Atenção"
                      : "Crítico";

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-lg font-bold text-zinc-400 w-8">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-100">{unidade.unidade}</div>
                          <div className="text-xs text-zinc-400">
                            {unidade.totalRespondentes} respondentes · DP: {unidade.desvioPadrao.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: cor }}>
                          {unidade.scoreMedio.toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {classificacao}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legenda */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-zinc-400">0-40 (Satisfatório)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-zinc-400">41-80 (Atenção)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-zinc-400">81-140 (Crítico)</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-zinc-400 mb-2">
              Nenhuma unidade com dados suficientes para exibição
            </p>
            <p className="text-sm text-zinc-500">
              Mínimo de {minGroupSize} respondentes por unidade necessário para K-Anonymity
            </p>
          </div>
        )}

        {/* Interpretação */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação:</strong> Compare os scores entre unidades para identificar
            áreas que necessitam de intervenção prioritária. Grandes diferenças podem indicar condições de trabalho
            díspares ou culturas organizacionais distintas.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
