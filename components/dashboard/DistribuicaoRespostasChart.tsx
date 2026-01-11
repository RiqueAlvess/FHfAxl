"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface DistribuicaoEscala {
  valor: number;
  rotulo: string;
  frequencia: number;
  percentual: number;
}

interface DistribuicaoRespostasChartProps {
  distribuicao: DistribuicaoEscala[];
}

const CORES_ESCALA = {
  0: "#22c55e", // Verde - Nunca
  1: "#84cc16", // Verde claro - Raramente
  2: "#eab308", // Amarelo - Às vezes
  3: "#f97316", // Laranja - Frequentemente
  4: "#ef4444", // Vermelho - Sempre
};

export default function DistribuicaoRespostasChart({ distribuicao }: DistribuicaoRespostasChartProps) {
  // Ordenar por valor da escala
  const distribuicaoOrdenada = [...distribuicao].sort((a, b) => a.valor - b.valor);

  // Preparar dados para os gráficos
  const pieData = distribuicaoOrdenada.map((item) => ({
    name: `${item.valor} - ${item.rotulo}`,
    value: item.frequencia,
    percentual: item.percentual,
    cor: CORES_ESCALA[item.valor as keyof typeof CORES_ESCALA],
    ...item,
  }));

  // Calcular total de respostas
  const totalRespostas = distribuicao.reduce((sum, item) => sum + item.frequencia, 0);

  // Calcular score médio ponderado
  const scoreMedio = distribuicao.reduce((sum, item) => sum + (item.valor * item.frequencia), 0) / totalRespostas;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Distribuição de Respostas na Escala</CardTitle>
        <CardDescription className="text-zinc-400">
          Frequência de respostas na escala Likert (0 = Nunca, 4 = Sempre)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pizza Chart */}
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentual, valor }) => `${valor}: ${percentual.toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "0.5rem",
                    color: "#fafafa",
                  }}
                  formatter={(value: number, name: string) => {
                    const item = pieData.find(d => `${d.valor} - ${d.rotulo}` === name);
                    return [
                      `${value} respostas (${item?.percentual.toFixed(1)}%)`,
                      item?.rotulo
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  dataKey="valor"
                  tick={{ fill: "#a1a1aa" }}
                  label={{ value: "Valor na Escala", position: "insideBottom", offset: -5, fill: "#a1a1aa" }}
                />
                <YAxis
                  tick={{ fill: "#a1a1aa" }}
                  label={{ value: "Frequência", angle: -90, position: "insideLeft", fill: "#a1a1aa" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "0.5rem",
                    color: "#fafafa",
                  }}
                  formatter={(value: number) => [`${value} respostas`, "Frequência"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estatísticas por Escala */}
        <div className="mt-6 grid grid-cols-5 gap-3">
          {distribuicaoOrdenada.map((item) => {
            const cor = CORES_ESCALA[item.valor as keyof typeof CORES_ESCALA];
            return (
              <div
                key={item.valor}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: `${cor}10`,
                  borderColor: `${cor}30`,
                }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: cor }}>
                    {item.valor}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">{item.rotulo}</div>
                  <div className="text-lg font-semibold text-zinc-100 mt-2">
                    {item.frequencia}
                  </div>
                  <div className="text-xs text-zinc-400">{item.percentual.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Métricas Agregadas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <div className="text-xs text-violet-300 mb-1">Score Médio</div>
            <div className="text-2xl font-bold text-violet-400">
              {scoreMedio.toFixed(2)}
            </div>
            <div className="text-xs text-zinc-400 mt-1">Média ponderada (0-4)</div>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-xs text-green-300 mb-1">Respostas Positivas</div>
            <div className="text-2xl font-bold text-green-400">
              {(distribuicao.filter(d => d.valor <= 1).reduce((sum, d) => sum + d.percentual, 0)).toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-400 mt-1">Nunca + Raramente (0-1)</div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-xs text-yellow-300 mb-1">Respostas Neutras</div>
            <div className="text-2xl font-bold text-yellow-400">
              {(distribuicao.find(d => d.valor === 2)?.percentual || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-400 mt-1">Às vezes (2)</div>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-xs text-red-300 mb-1">Respostas Críticas</div>
            <div className="text-2xl font-bold text-red-400">
              {(distribuicao.filter(d => d.valor >= 3).reduce((sum, d) => sum + d.percentual, 0)).toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-400 mt-1">Frequentemente + Sempre (3-4)</div>
          </div>
        </div>

        {/* Legenda da Escala */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm font-bold text-zinc-100 mb-3">Escala Likert de 5 Pontos:</div>
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES_ESCALA[0] }} />
              <span className="text-zinc-300">0 = Nunca</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES_ESCALA[1] }} />
              <span className="text-zinc-300">1 = Raramente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES_ESCALA[2] }} />
              <span className="text-zinc-300">2 = Às vezes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES_ESCALA[3] }} />
              <span className="text-zinc-300">3 = Frequentemente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES_ESCALA[4] }} />
              <span className="text-zinc-300">4 = Sempre</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
