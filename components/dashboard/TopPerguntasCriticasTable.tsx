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
import { AlertTriangle, TrendingUp } from "lucide-react";

interface PerguntaCritica {
  numero: number;
  texto: string;
  dimensao: string;
  scoreMedio: number;
  desvioPadrao: number;
  percentualCritico: number;
  totalRespostas: number;
}

interface TopPerguntasCriticasTableProps {
  perguntas: PerguntaCritica[];
  limite?: number;
}

export default function TopPerguntasCriticasTable({
  perguntas,
  limite = 10,
}: TopPerguntasCriticasTableProps) {
  // Ordenar por score médio (decrescente) e pegar top N
  const topPerguntas = [...perguntas]
    .sort((a, b) => b.scoreMedio - a.scoreMedio)
    .slice(0, limite);

  // Função para obter cor baseado no score
  const getScoreColor = (score: number): string => {
    if (score >= 3.5) return "text-red-400";
    if (score >= 3.0) return "text-orange-400";
    if (score >= 2.5) return "text-yellow-400";
    return "text-zinc-300";
  };

  // Função para obter cor baseado no percentual crítico
  const getCriticoColor = (percentual: number): string => {
    if (percentual >= 50) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (percentual >= 30) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    if (percentual >= 20) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <CardTitle className="text-zinc-100">
            Top {limite} Perguntas Mais Críticas
          </CardTitle>
        </div>
        <CardDescription className="text-zinc-400">
          Perguntas com maior score médio que requerem atenção prioritária
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
                <TableHead className="text-zinc-300 text-center">% Crítico</TableHead>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCriticoColor(pergunta.percentualCritico)}`}>
                      {pergunta.percentualCritico.toFixed(1)}%
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
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-red-400" />
              <div className="text-xs text-red-300">Pergunta Mais Crítica</div>
            </div>
            <div className="text-2xl font-bold text-red-400">
              Q{topPerguntas[0]?.numero}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Score: {topPerguntas[0]?.scoreMedio.toFixed(2)}
            </div>
          </div>

          <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-2">Score Médio (Top {limite})</div>
            <div className="text-2xl font-bold text-orange-400">
              {(topPerguntas.reduce((sum, p) => sum + p.scoreMedio, 0) / topPerguntas.length).toFixed(2)}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Média das mais críticas
            </div>
          </div>

          <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="text-xs text-zinc-400 mb-2">% Crítico Médio</div>
            <div className="text-2xl font-bold text-yellow-400">
              {(topPerguntas.reduce((sum, p) => sum + p.percentualCritico, 0) / topPerguntas.length).toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Proporção média
            </div>
          </div>
        </div>

        {/* Alertas */}
        {topPerguntas.filter(p => p.scoreMedio >= 3.5).length > 0 && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="text-sm text-red-300">
                <strong>Atenção:</strong> {topPerguntas.filter(p => p.scoreMedio >= 3.5).length} pergunta
                {topPerguntas.filter(p => p.scoreMedio >= 3.5).length > 1 ? 's' : ''} com score acima de 3.5,
                indicando risco extremamente elevado. Ação imediata recomendada.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
