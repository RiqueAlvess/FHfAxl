"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingDown, CheckCircle2 } from "lucide-react";

interface PerguntaPositiva {
  numero: number;
  texto: string;
  dimensao: string;
  scoreMedio: number;
  desvioPadrao: number;
  percentualPositivo: number;
  totalRespostas: number;
}

interface TopPerguntasPositivasTableProps {
  perguntas: PerguntaPositiva[];
  limite?: number;
}

export default function TopPerguntasPositivasTable({
  perguntas,
  limite = 10,
}: TopPerguntasPositivasTableProps) {
  // Ordenar por score médio (crescente - menores são melhores) e pegar top N
  const topPerguntas = [...perguntas]
    .sort((a, b) => a.scoreMedio - b.scoreMedio)
    .slice(0, limite);

  // Função para obter cor baseado no score (inverso - menor é melhor)
  const getScoreColor = (score: number): string => {
    if (score <= 1.0) return "text-green-400";
    if (score <= 1.5) return "text-emerald-400";
    if (score <= 2.0) return "text-blue-400";
    return "text-zinc-300";
  };

  // Função para obter cor baseado no percentual positivo
  const getPositivoColor = (percentual: number): string => {
    if (percentual >= 70) return "bg-green-500/20 text-green-300 border-green-500/30";
    if (percentual >= 50) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (percentual >= 30) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <CardTitle className="text-zinc-100">
            Top {limite} Perguntas Mais Positivas
          </CardTitle>
        </div>
        <CardDescription className="text-zinc-400">
          Perguntas com menor score médio, indicando fatores protetores fortes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-800/50 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-300 w-12">#</TableHead>
                <TableHead className="text-zinc-300 w-24">Q</TableHead>
                <TableHead className="text-zinc-300">Pergunta</TableHead>
                <TableHead className="text-zinc-300">Dimensão</TableHead>
                <TableHead className="text-zinc-300 text-center">Score</TableHead>
                <TableHead className="text-zinc-300 text-center">DP</TableHead>
                <TableHead className="text-zinc-300 text-center">% Positivo</TableHead>
                <TableHead className="text-zinc-300 text-center">N</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerguntas.map((pergunta, index) => (
                <TableRow
                  key={pergunta.numero}
                  className="border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                >
                  <TableCell className="font-medium text-zinc-400">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-violet-400">
                    Q{pergunta.numero}
                  </TableCell>
                  <TableCell className="text-zinc-300 max-w-md">
                    <div className="line-clamp-2 text-sm">
                      {pergunta.texto}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-xs">
                    <div className="max-w-[120px] truncate" title={pergunta.dimensao}>
                      {pergunta.dimensao}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-lg font-bold ${getScoreColor(pergunta.scoreMedio)}`}>
                      {pergunta.scoreMedio.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-zinc-400 text-sm">
                    {pergunta.desvioPadrao.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPositivoColor(pergunta.percentualPositivo)}`}>
                      {pergunta.percentualPositivo.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-zinc-400 text-sm">
                    {pergunta.totalRespostas}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-green-400" />
              <div className="text-xs text-green-300">Pergunta Mais Positiva</div>
            </div>
            <div className="text-2xl font-bold text-green-400">
              Q{topPerguntas[0]?.numero}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Score: {topPerguntas[0]?.scoreMedio.toFixed(2)}
            </div>
          </div>

          <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-2">Score Médio (Top {limite})</div>
            <div className="text-2xl font-bold text-emerald-400">
              {(topPerguntas.reduce((sum, p) => sum + p.scoreMedio, 0) / topPerguntas.length).toFixed(2)}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Média das mais positivas
            </div>
          </div>

          <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-2">% Positivo Médio</div>
            <div className="text-2xl font-bold text-blue-400">
              {(topPerguntas.reduce((sum, p) => sum + p.percentualPositivo, 0) / topPerguntas.length).toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Proporção média
            </div>
          </div>
        </div>

        {/* Insights Positivos */}
        {topPerguntas.filter(p => p.scoreMedio <= 1.0).length > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="text-sm text-green-300">
                <strong>Excelente:</strong> {topPerguntas.filter(p => p.scoreMedio <= 1.0).length} pergunta
                {topPerguntas.filter(p => p.scoreMedio <= 1.0).length > 1 ? 's' : ''} com score abaixo de 1.0,
                indicando fatores protetores muito fortes. Estas áreas podem servir de modelo para as demais.
              </div>
            </div>
          </div>
        )}

        {/* Interpretação */}
        <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-300">
            <strong className="text-zinc-100">Interpretação:</strong> Perguntas com scores baixos indicam áreas onde a organização está performando bem.
            Use estes pontos fortes como referência para melhorar outras dimensões.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
