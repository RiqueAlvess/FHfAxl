"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HeatmapCell {
  dimensao: string;
  faixa: string;
  quantidade: number;
  percentual: number;
}

interface HeatmapChartProps {
  heatmap: HeatmapCell[];
  dimensoes: string[];
  faixas: string[];
}

export default function HeatmapChart({ heatmap, dimensoes, faixas }: HeatmapChartProps) {
  // Encontrar o valor máximo para normalização de cores
  const maxQuantidade = Math.max(...heatmap.map(cell => cell.quantidade), 1);

  // Função para obter intensidade de cor baseado na quantidade
  const getColorIntensity = (quantidade: number): string => {
    const intensity = quantidade / maxQuantidade;

    if (intensity === 0) return "bg-zinc-800/20";
    if (intensity < 0.2) return "bg-violet-500/20";
    if (intensity < 0.4) return "bg-violet-500/40";
    if (intensity < 0.6) return "bg-violet-500/60";
    if (intensity < 0.8) return "bg-violet-500/80";
    return "bg-violet-500";
  };

  // Função para obter cor do texto baseado na intensidade
  const getTextColor = (quantidade: number): string => {
    const intensity = quantidade / maxQuantidade;
    return intensity > 0.6 ? "text-white" : "text-zinc-300";
  };

  // Obter célula do heatmap
  const getCell = (dimensao: string, faixa: string): HeatmapCell | undefined => {
    return heatmap.find(cell => cell.dimensao === dimensao && cell.faixa === faixa);
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Heatmap: Dimensão × Faixa de Score</CardTitle>
        <CardDescription className="text-zinc-400">
          Intensidade de calor representa a quantidade de respondentes em cada combinação
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs font-semibold text-zinc-400 border border-zinc-700 bg-zinc-800/50">
                    Dimensão / Faixa
                  </th>
                  {faixas.map((faixa, idx) => (
                    <th
                      key={idx}
                      className="p-2 text-center text-xs font-semibold text-zinc-400 border border-zinc-700 bg-zinc-800/50 min-w-[80px]"
                    >
                      {faixa}
                    </th>
                  ))}
                  <th className="p-2 text-center text-xs font-semibold text-zinc-400 border border-zinc-700 bg-zinc-800/50">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {dimensoes.map((dimensao, dimIdx) => {
                  const totalDimensao = heatmap
                    .filter(cell => cell.dimensao === dimensao)
                    .reduce((sum, cell) => sum + cell.quantidade, 0);

                  return (
                    <tr key={dimIdx}>
                      <td className="p-2 text-xs font-medium text-zinc-300 border border-zinc-700 bg-zinc-800/30">
                        {dimensao.length > 30 ? dimensao.substring(0, 30) + "..." : dimensao}
                      </td>
                      {faixas.map((faixa, faixaIdx) => {
                        const cell = getCell(dimensao, faixa);
                        const quantidade = cell?.quantidade || 0;
                        const percentual = cell?.percentual || 0;

                        return (
                          <td
                            key={faixaIdx}
                            className={`p-2 text-center text-xs border border-zinc-700 ${getColorIntensity(quantidade)} ${getTextColor(quantidade)} transition-all duration-200 hover:ring-2 hover:ring-violet-400 cursor-pointer`}
                            title={`${dimensao} - ${faixa}: ${quantidade} respondente${quantidade !== 1 ? 's' : ''} (${percentual.toFixed(1)}%)`}
                          >
                            {quantidade > 0 && (
                              <div>
                                <div className="font-bold">{quantidade}</div>
                                <div className="text-[10px] opacity-75">{percentual.toFixed(0)}%</div>
                              </div>
                            )}
                            {quantidade === 0 && <span className="text-zinc-600">-</span>}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center text-xs font-bold text-violet-300 border border-zinc-700 bg-zinc-800/50">
                        {totalDimensao}
                      </td>
                    </tr>
                  );
                })}
                {/* Linha de totais */}
                <tr className="bg-zinc-800/50">
                  <td className="p-2 text-xs font-bold text-zinc-300 border border-zinc-700">
                    Total
                  </td>
                  {faixas.map((faixa, idx) => {
                    const totalFaixa = heatmap
                      .filter(cell => cell.faixa === faixa)
                      .reduce((sum, cell) => sum + cell.quantidade, 0);

                    return (
                      <td
                        key={idx}
                        className="p-2 text-center text-xs font-bold text-violet-300 border border-zinc-700"
                      >
                        {totalFaixa}
                      </td>
                    );
                  })}
                  <td className="p-2 text-center text-xs font-bold text-violet-400 border border-zinc-700">
                    {heatmap.reduce((sum, cell) => sum + cell.quantidade, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda de Cores */}
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <span className="text-xs text-zinc-400">Intensidade:</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-zinc-800/20 border border-zinc-700 rounded" />
            <span className="text-xs text-zinc-400">0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-violet-500/20 border border-zinc-700 rounded" />
            <span className="text-xs text-zinc-400">20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-violet-500/40 border border-zinc-700 rounded" />
            <span className="text-xs text-zinc-400">40%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-violet-500/60 border border-zinc-700 rounded" />
            <span className="text-xs text-zinc-400">60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-violet-500/80 border border-zinc-700 rounded" />
            <span className="text-xs text-zinc-400">80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-violet-500 border border-zinc-700 rounded" />
            <span className="text-xs text-zinc-400">100%</span>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Célula Mais Densa</div>
            <div className="text-sm font-bold text-violet-400">
              {heatmap.reduce((max, cell) => cell.quantidade > max.quantidade ? cell : max).quantidade} respondentes
            </div>
          </div>
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Combinações Não Vazias</div>
            <div className="text-sm font-bold text-zinc-100">
              {heatmap.filter(cell => cell.quantidade > 0).length} de {heatmap.length}
            </div>
          </div>
          <div className="p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Cobertura</div>
            <div className="text-sm font-bold text-zinc-100">
              {((heatmap.filter(cell => cell.quantidade > 0).length / heatmap.length) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Interpretação */}
        <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação:</strong> Células mais escuras indicam maior concentração de respondentes.
            Identifique padrões horizontais (dimensões problemáticas) e verticais (faixas de score predominantes).
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
