"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DistribuicaoRiscoChartProps {
  distribuicao: {
    satisfatorio: number;
    atencao: number;
    critico: number;
  };
}

const COLORS = {
  satisfatorio: "#22c55e",
  atencao: "#eab308",
  critico: "#ef4444",
};

export default function DistribuicaoRiscoChart({ distribuicao }: DistribuicaoRiscoChartProps) {
  const total = distribuicao.satisfatorio + distribuicao.atencao + distribuicao.critico;

  const pieData = [
    {
      name: "Satisfatório",
      value: distribuicao.satisfatorio,
      color: COLORS.satisfatorio,
      percentual: total > 0 ? ((distribuicao.satisfatorio / total) * 100).toFixed(1) : 0,
    },
    {
      name: "Atenção",
      value: distribuicao.atencao,
      color: COLORS.atencao,
      percentual: total > 0 ? ((distribuicao.atencao / total) * 100).toFixed(1) : 0,
    },
    {
      name: "Crítico",
      value: distribuicao.critico,
      color: COLORS.critico,
      percentual: total > 0 ? ((distribuicao.critico / total) * 100).toFixed(1) : 0,
    },
  ];

  // Dados para gráfico de barras horizontal com percentuais
  const barData = pieData.map((item) => ({
    ...item,
    percentualNum: parseFloat(item.percentual.toString()),
  }));

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Distribuição de Risco</CardTitle>
        <CardDescription className="text-zinc-400">
          Classificação dos respondentes por nível de risco psicossocial
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
                  label={({ name, percentual }) => `${name}: ${percentual}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "0.5rem",
                    color: "#fafafa",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart Horizontal */}
          <div className="flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "#a1a1aa" }}
                  label={{ value: "Percentual (%)", position: "insideBottom", offset: -5, fill: "#a1a1aa" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#a1a1aa" }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "0.5rem",
                    color: "#fafafa",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Percentual"]}
                />
                <Bar dataKey="percentualNum" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {distribuicao.satisfatorio}
            </div>
            <div className="text-sm text-green-300">Satisfatório</div>
            <div className="text-xs text-zinc-400 mt-1">
              {pieData[0].percentual}% do total
            </div>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {distribuicao.atencao}
            </div>
            <div className="text-sm text-yellow-300">Atenção</div>
            <div className="text-xs text-zinc-400 mt-1">
              {pieData[1].percentual}% do total
            </div>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-2xl font-bold text-red-400">
              {distribuicao.critico}
            </div>
            <div className="text-sm text-red-300">Crítico</div>
            <div className="text-xs text-zinc-400 mt-1">
              {pieData[2].percentual}% do total
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
