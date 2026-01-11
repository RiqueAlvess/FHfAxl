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

interface DimensaoVariabilidade {
  dimensao: string;
  desvioPadrao: number;
  coeficienteVariacao: number;
  scoreMedio: number;
}

interface VariabilidadeDimensoesChartProps {
  dimensoes: DimensaoVariabilidade[];
}

export default function VariabilidadeDimensoesChart({ dimensoes }: VariabilidadeDimensoesChartProps) {
  // Ordenar por desvio padrão (decrescente)
  const dimensoesOrdenadas = [...dimensoes].sort((a, b) => b.desvioPadrao - a.desvioPadrao);

  // Calcular desvio padrão médio
  const dpMedio = dimensoes.reduce((sum, d) => sum + d.desvioPadrao, 0) / dimensoes.length;

  // Função para determinar cor baseado no desvio padrão
  const getBarColor = (dp: number): string => {
    if (dp > dpMedio * 1.5) return "#ef4444"; // Alto - Vermelho
    if (dp > dpMedio) return "#eab308"; // Médio-Alto - Amarelo
    if (dp > dpMedio * 0.5) return "#3b82f6"; // Médio - Azul
    return "#22c55e"; // Baixo - Verde
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Variabilidade por Dimensão</CardTitle>
        <CardDescription className="text-zinc-400">
          Desvio padrão dos scores em cada dimensão (dispersão das respostas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dimensoesOrdenadas} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              type="number"
              tick={{ fill: "#a1a1aa" }}
              label={{ value: "Desvio Padrão", position: "insideBottom", offset: -5, fill: "#a1a1aa" }}
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
                  const data = payload[0].payload as DimensaoVariabilidade;
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs">
                      <div className="font-bold text-zinc-100 mb-2">{data.dimensao}</div>
                      <div className="space-y-1 text-zinc-300">
                        <div>Desvio Padrão: <span className="font-bold text-violet-400">{data.desvioPadrao.toFixed(2)}</span></div>
                        <div>Score Médio: {data.scoreMedio.toFixed(2)}</div>
                        <div>Coef. Variação: {data.coeficienteVariacao.toFixed(1)}%</div>
                        <div className="mt-2 pt-2 border-t border-zinc-700 text-zinc-400">
                          {data.desvioPadrao > dpMedio * 1.5 ? (
                            <span className="text-red-400">⚠️ Alta variabilidade</span>
                          ) : data.desvioPadrao > dpMedio ? (
                            <span className="text-yellow-400">⚠️ Variabilidade média-alta</span>
                          ) : data.desvioPadrao > dpMedio * 0.5 ? (
                            <span className="text-blue-400">● Variabilidade moderada</span>
                          ) : (
                            <span className="text-green-400">✓ Baixa variabilidade</span>
                          )}
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
              formatter={() => "Desvio Padrão"}
            />

            {/* Linha de referência para DP médio */}
            <ReferenceLine
              x={dpMedio}
              stroke="#8b5cf6"
              strokeDasharray="3 3"
              label={{
                value: `Média: ${dpMedio.toFixed(2)}`,
                fill: "#8b5cf6",
                fontSize: 11,
                position: "top",
              }}
            />

            <Bar dataKey="desvioPadrao" radius={[0, 4, 4, 0]}>
              {dimensoesOrdenadas.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.desvioPadrao)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Estatísticas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">DP Médio</div>
            <div className="text-xl font-bold text-violet-400">
              {dpMedio.toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-xs text-red-300 mb-1">Maior DP</div>
            <div className="text-xl font-bold text-red-400">
              {Math.max(...dimensoes.map(d => d.desvioPadrao)).toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 truncate">
              {dimensoesOrdenadas[0].dimensao.split(' ')[0]}...
            </div>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-xs text-green-300 mb-1">Menor DP</div>
            <div className="text-xl font-bold text-green-400">
              {Math.min(...dimensoes.map(d => d.desvioPadrao)).toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 truncate">
              {dimensoesOrdenadas[dimensoesOrdenadas.length - 1].dimensao.split(' ')[0]}...
            </div>
          </div>
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Alta Variabilidade</div>
            <div className="text-xl font-bold text-orange-400">
              {dimensoes.filter(d => d.desvioPadrao > dpMedio * 1.5).length}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              dimensões
            </div>
          </div>
        </div>

        {/* Legenda de Cores */}
        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-zinc-400">Alta (&gt; {(dpMedio * 1.5).toFixed(1)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-zinc-400">Média-Alta (&gt; {dpMedio.toFixed(1)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-zinc-400">Moderada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-zinc-400">Baixa (&lt; {(dpMedio * 0.5).toFixed(1)})</span>
          </div>
        </div>

        {/* Interpretação */}
        <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação:</strong> Alto desvio padrão indica grande dispersão nas respostas,
            sugerindo percepções heterogêneas entre respondentes. Baixo desvio indica consenso nas avaliações.
            Dimensões com alta variabilidade podem indicar experiências muito díspares entre grupos.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
