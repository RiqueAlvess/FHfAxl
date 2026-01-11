"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface BoxPlotData {
  min: number;
  q1: number;
  mediana: number;
  q3: number;
  max: number;
  outliers: number[];
  iqr: number;
  mean: number;
}

interface BoxPlotChartProps {
  boxplot: BoxPlotData;
  titulo?: string;
}

export default function BoxPlotChart({ boxplot, titulo = "Distribuição Estatística dos Scores" }: BoxPlotChartProps) {
  // Preparar dados para visualização
  const boxData = [
    {
      name: "Box Plot",
      min: boxplot.min,
      q1: boxplot.q1,
      mediana: boxplot.mediana,
      q3: boxplot.q3,
      max: boxplot.max,
      // Para a barra do box
      lowerWhisker: boxplot.q1 - boxplot.min,
      box: boxplot.q3 - boxplot.q1,
      upperWhisker: boxplot.max - boxplot.q3,
    },
  ];

  // Dados dos outliers para scatter plot
  const outliersData = boxplot.outliers.map((value, index) => ({
    name: "Outliers",
    x: 0.5,
    y: value,
    index,
  }));

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">{titulo}</CardTitle>
        <CardDescription className="text-zinc-400">
          Análise estatística: mínimo, quartis, mediana, máximo e outliers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visualização Box Plot */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={boxData}
                layout="horizontal"
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#a1a1aa" }}
                />
                <YAxis
                  type="number"
                  domain={[0, 140]}
                  tick={{ fill: "#a1a1aa" }}
                  label={{ value: "Score", angle: -90, position: "insideLeft", fill: "#a1a1aa" }}
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
                          <div className="font-bold text-zinc-100 mb-2">Estatísticas</div>
                          <div className="space-y-1 text-zinc-300">
                            <div>Máximo: {data.max.toFixed(1)}</div>
                            <div>Q3 (75%): {data.q3.toFixed(1)}</div>
                            <div className="font-bold text-violet-400">Mediana: {data.mediana.toFixed(1)}</div>
                            <div>Q1 (25%): {data.q1.toFixed(1)}</div>
                            <div>Mínimo: {data.min.toFixed(1)}</div>
                            <div className="mt-2 pt-2 border-t border-zinc-700">IQR: {boxplot.iqr.toFixed(1)}</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Linha da mediana */}
                <ReferenceLine
                  y={boxplot.mediana}
                  stroke="#8b5cf6"
                  strokeDasharray="3 3"
                  label={{ value: `Mediana: ${boxplot.mediana.toFixed(1)}`, fill: "#8b5cf6", fontSize: 12 }}
                />

                {/* Linha da média */}
                <ReferenceLine
                  y={boxplot.mean}
                  stroke="#3b82f6"
                  strokeDasharray="5 5"
                  label={{ value: `Média: ${boxplot.mean.toFixed(1)}`, fill: "#3b82f6", fontSize: 12 }}
                />

                {/* Whiskers e Box usando barras empilhadas */}
                <Bar dataKey="min" stackId="a" fill="transparent" />
                <Bar dataKey="lowerWhisker" stackId="a" fill="#3f3f46" barSize={2} />
                <Bar dataKey="box" stackId="a" fill="#8b5cf6" fillOpacity={0.6} barSize={60} radius={4} />
                <Bar dataKey="upperWhisker" stackId="a" fill="#3f3f46" barSize={2} />

                {/* Outliers */}
                {outliersData.length > 0 && (
                  <Scatter
                    data={outliersData}
                    fill="#ef4444"
                    shape="circle"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Estatísticas Detalhadas */}
          <div className="space-y-3">
            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="text-xs text-zinc-400">Mínimo</div>
              <div className="text-2xl font-bold text-zinc-100">{boxplot.min.toFixed(1)}</div>
            </div>

            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="text-xs text-zinc-400">Q1 (25º percentil)</div>
              <div className="text-2xl font-bold text-zinc-100">{boxplot.q1.toFixed(1)}</div>
            </div>

            <div className="p-3 bg-violet-500/10 rounded-lg border border-violet-500/30">
              <div className="text-xs text-violet-300">Mediana (Q2)</div>
              <div className="text-2xl font-bold text-violet-400">{boxplot.mediana.toFixed(1)}</div>
            </div>

            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="text-xs text-zinc-400">Q3 (75º percentil)</div>
              <div className="text-2xl font-bold text-zinc-100">{boxplot.q3.toFixed(1)}</div>
            </div>

            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="text-xs text-zinc-400">Máximo</div>
              <div className="text-2xl font-bold text-zinc-100">{boxplot.max.toFixed(1)}</div>
            </div>

            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="text-xs text-blue-300">Média</div>
              <div className="text-2xl font-bold text-blue-400">{boxplot.mean.toFixed(1)}</div>
            </div>

            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="text-xs text-zinc-400">IQR (Amplitude Interquartil)</div>
              <div className="text-2xl font-bold text-zinc-100">{boxplot.iqr.toFixed(1)}</div>
            </div>

            {boxplot.outliers.length > 0 && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="text-xs text-red-300">Outliers</div>
                <div className="text-2xl font-bold text-red-400">{boxplot.outliers.length}</div>
                <div className="text-xs text-zinc-400 mt-1">
                  {boxplot.outliers.length === 1 ? 'valor atípico' : 'valores atípicos'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interpretação */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação:</strong> 50% dos scores estão entre{" "}
            <span className="text-violet-400 font-semibold">{boxplot.q1.toFixed(1)}</span> e{" "}
            <span className="text-violet-400 font-semibold">{boxplot.q3.toFixed(1)}</span> (IQR).
            {boxplot.outliers.length > 0 && (
              <span className="text-red-400">
                {" "}Foram detectados {boxplot.outliers.length} outlier{boxplot.outliers.length > 1 ? 's' : ''} que merecem atenção especial.
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
