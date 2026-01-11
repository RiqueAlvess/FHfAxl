"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  Percent,
  AlertTriangle,
  Clock,
  Users
} from "lucide-react";

interface KPICardsProps {
  kpis: {
    totalColaboradores: number;
    taxaAdesao: number;
    indiceGeralRisco: number;
    scoreMediano: number;
    desvioPadrao: number;
    coeficienteVariacao: number;
    taxaRiscoAlto: number;
    tempoMedioResposta: number;
    scoreMedioTotal: number;
  };
}

export default function KPICards({ kpis }: KPICardsProps) {
  // Classificação do índice geral de risco
  const classificacaoIGRP =
    kpis.indiceGeralRisco <= 40
      ? { label: "Satisfatório", color: "text-green-500", bg: "bg-green-500/10" }
      : kpis.indiceGeralRisco <= 80
      ? { label: "Atenção", color: "text-yellow-500", bg: "bg-yellow-500/10" }
      : { label: "Crítico", color: "text-red-500", bg: "bg-red-500/10" };

  // Classificação do CV
  const classificacaoCV =
    kpis.coeficienteVariacao < 15
      ? { label: "Baixa variabilidade", color: "text-green-500" }
      : kpis.coeficienteVariacao < 30
      ? { label: "Variabilidade moderada", color: "text-yellow-500" }
      : { label: "Alta variabilidade", color: "text-red-500" };

  // Formatar tempo de resposta
  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}m ${segs}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Índice Geral de Risco (0-100) */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Índice Geral de Risco
          </CardTitle>
          <TrendingUp className={`h-4 w-4 ${classificacaoIGRP.color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-50">
            {kpis.indiceGeralRisco.toFixed(1)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${classificacaoIGRP.bg} ${classificacaoIGRP.color}`}>
              {classificacaoIGRP.label}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Escala 0-100 (IGRP)</p>
        </CardContent>
      </Card>

      {/* Score Médio Total (de 140) */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Score Médio Total
          </CardTitle>
          <Target className="h-4 w-4 text-violet-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-50">
            {kpis.scoreMedioTotal.toFixed(1)}
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 mt-3">
            <div
              className="bg-violet-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(kpis.scoreMedioTotal / 140) * 100}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 mt-1">De 140 pontos possíveis</p>
        </CardContent>
      </Card>

      {/* Mediana dos Scores */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Mediana dos Scores
          </CardTitle>
          <Activity className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-50">
            {kpis.scoreMediano.toFixed(1)}
          </div>
          <p className="text-xs text-zinc-400 mt-2">Valor central da distribuição</p>
        </CardContent>
      </Card>

      {/* Desvio Padrão */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Desvio Padrão
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-50">
            {kpis.desvioPadrao.toFixed(2)}
          </div>
          <p className="text-xs text-zinc-400 mt-2">Dispersão dos scores</p>
        </CardContent>
      </Card>

      {/* Coeficiente de Variação */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Coeficiente de Variação
          </CardTitle>
          <Percent className="h-4 w-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-50">
            {kpis.coeficienteVariacao.toFixed(1)}%
          </div>
          <p className={`text-xs ${classificacaoCV.color} mt-2`}>
            {classificacaoCV.label}
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Risco Alto */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Taxa de Risco Alto
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-500">
            {kpis.taxaRiscoAlto.toFixed(1)}%
          </div>
          <p className="text-xs text-zinc-400 mt-2">Respondentes em nível crítico</p>
        </CardContent>
      </Card>

      {/* Tempo Médio de Resposta */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Tempo Médio de Resposta
          </CardTitle>
          <Clock className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-50">
            {formatarTempo(kpis.tempoMedioResposta)}
          </div>
          <p className="text-xs text-zinc-400 mt-2">Duração média do questionário</p>
        </CardContent>
      </Card>

      {/* Taxa de Adesão */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Taxa de Adesão
          </CardTitle>
          <Users className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-50">
            {kpis.taxaAdesao.toFixed(1)}%
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 mt-3">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${kpis.taxaAdesao}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Participação dos colaboradores
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
