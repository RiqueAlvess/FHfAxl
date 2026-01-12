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
} from "recharts";

interface HistogramaBin {
  faixa: string;
  frequencia: number;
  percentual: number;
  rangeStart: number;
  rangeEnd: number;
}

interface HistogramaScoresChartProps {
  histograma: HistogramaBin[];
}

export default function HistogramaScoresChart({ histograma }: HistogramaScoresChartProps) {
  // Função para determinar cor baseado na faixa de score
  const getBarColor = (rangeStart: number): string => {
    if (rangeStart <= 40) return "#22c55e"; // Verde - Satisfatório
    if (rangeStart <= 80) return "#eab308"; // Amarelo - Atenção
    return "#ef4444"; // Vermelho - Crítico
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Histograma de Scores</CardTitle>
        <CardDescription className="text-zinc-400">
          Distribuição de frequência dos scores em 10 faixas (bins de 14 pontos)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={histograma}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="faixa"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              label={{ value: "Faixa de Score", position: "insideBottom", offset: -15, fill: "#a1a1aa" }}
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
              formatter={(value: number | undefined, name: string | undefined) => {
                const val = value ?? 0;
                if (name === "frequencia") return [val, "Frequência"];
                if (name === "percentual") return [`${val.toFixed(1)}%`, "Percentual"];
                return [val, name];
              }}
            />
            <Legend
              wrapperStyle={{ color: "#a1a1aa" }}
              formatter={(value) => {
                if (value === "frequencia") return "Frequência";
                if (value === "percentual") return "Percentual (%)";
                return value;
              }}
            />
            <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
              {histograma.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.rangeStart)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Estatísticas do Histograma */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="text-xs text-zinc-400">Total de Bins</div>
            <div className="text-xl font-bold text-zinc-100 mt-1">
              {histograma.length}
            </div>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="text-xs text-zinc-400">Total Respostas</div>
            <div className="text-xl font-bold text-zinc-100 mt-1">
              {histograma.reduce((sum, bin) => sum + bin.frequencia, 0)}
            </div>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="text-xs text-zinc-400">Bin com Maior Freq.</div>
            <div className="text-xl font-bold text-zinc-100 mt-1">
              {Math.max(...histograma.map(b => b.frequencia))}
            </div>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="text-xs text-zinc-400">Faixa Dominante</div>
            <div className="text-sm font-bold text-zinc-100 mt-1">
              {histograma.reduce((max, bin) =>
                bin.frequencia > max.frequencia ? bin : max
              ).faixa}
            </div>
          </div>
        </div>

        {/* Legenda de Cores */}
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
      </CardContent>
    </Card>
  );
}
