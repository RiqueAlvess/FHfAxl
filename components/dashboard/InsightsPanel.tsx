"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
} from "lucide-react";

interface Alerta {
  tipo: "critico" | "atencao" | "info";
  titulo: string;
  descricao: string;
  prioridade: number;
}

interface Recomendacao {
  titulo: string;
  descricao: string;
  acoes: string[];
  dimensaoRelacionada?: string;
}

interface InsightsData {
  resumoExecutivo: string;
  alertas: Alerta[];
  recomendacoes: Recomendacao[];
  pontosFortes: string[];
  areasPreocupacao: string[];
}

interface InsightsPanelProps {
  insights: InsightsData;
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  // Ordenar alertas por prioridade
  const alertasOrdenados = [...insights.alertas].sort((a, b) => b.prioridade - a.prioridade);

  // Função para obter ícone e cor do alerta
  const getAlertaStyle = (tipo: "critico" | "atencao" | "info") => {
    switch (tipo) {
      case "critico":
        return {
          icon: AlertTriangle,
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          iconColor: "text-red-400",
          textColor: "text-red-300",
        };
      case "atencao":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          iconColor: "text-yellow-400",
          textColor: "text-yellow-300",
        };
      case "info":
        return {
          icon: Info,
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          iconColor: "text-blue-400",
          textColor: "text-blue-300",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card className="bg-gradient-to-br from-violet-500/10 via-zinc-900 to-zinc-900 border-violet-500/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-zinc-100">Resumo Executivo</CardTitle>
          </div>
          <CardDescription className="text-zinc-400">
            Análise interpretativa automatizada dos dados de risco psicossocial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-300 leading-relaxed">{insights.resumoExecutivo}</p>
        </CardContent>
      </Card>

      {/* Grid de Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Críticos */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <CardTitle className="text-zinc-100">Alertas</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              {alertasOrdenados.length} alerta{alertasOrdenados.length !== 1 ? 's' : ''} detectado{alertasOrdenados.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertasOrdenados.length > 0 ? (
                alertasOrdenados.map((alerta, index) => {
                  const style = getAlertaStyle(alerta.tipo);
                  const Icon = style.icon;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${style.bgColor} ${style.borderColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${style.iconColor}`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${style.textColor} mb-1`}>
                            {alerta.titulo}
                          </div>
                          <p className="text-sm text-zinc-300">{alerta.descricao}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                              Prioridade: {alerta.prioridade}/10
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${style.bgColor} ${style.textColor}`}>
                              {alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mb-3" />
                  <p className="text-zinc-400">Nenhum alerta crítico detectado</p>
                  <p className="text-sm text-zinc-500 mt-1">Situação sob controle</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pontos Fortes e Áreas de Preocupação */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-zinc-100">Análise Situacional</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Pontos fortes e áreas que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pontos Fortes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <h4 className="font-semibold text-green-300 text-sm">Pontos Fortes</h4>
                </div>
                <div className="space-y-2">
                  {insights.pontosFortes.length > 0 ? (
                    insights.pontosFortes.map((ponto, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-zinc-300">{ponto}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500 italic">Nenhum ponto forte identificado</p>
                  )}
                </div>
              </div>

              {/* Áreas de Preocupação */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-orange-400" />
                  <h4 className="font-semibold text-orange-300 text-sm">Áreas de Preocupação</h4>
                </div>
                <div className="space-y-2">
                  {insights.areasPreocupacao.length > 0 ? (
                    insights.areasPreocupacao.map((area, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg"
                      >
                        <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-zinc-300">{area}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500 italic">Nenhuma área crítica identificada</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            <CardTitle className="text-zinc-100">Recomendações de Ação</CardTitle>
          </div>
          <CardDescription className="text-zinc-400">
            Sugestões baseadas em evidências para melhorar os indicadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recomendacoes.length > 0 ? (
              insights.recomendacoes.map((recomendacao, index) => (
                <div
                  key={index}
                  className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-300 mb-1">
                        {recomendacao.titulo}
                      </h4>
                      <p className="text-sm text-zinc-300 mb-3">{recomendacao.descricao}</p>

                      {recomendacao.dimensaoRelacionada && (
                        <div className="mb-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                            📊 {recomendacao.dimensaoRelacionada}
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-zinc-400 uppercase">
                          Ações Sugeridas:
                        </div>
                        <ul className="space-y-1">
                          {recomendacao.acoes.map((acao, aIndex) => (
                            <li
                              key={aIndex}
                              className="flex items-start gap-2 text-sm text-zinc-300"
                            >
                              <span className="text-amber-400 mt-0.5">▸</span>
                              <span>{acao}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-zinc-600 mb-3" />
                <p className="text-zinc-400">Nenhuma recomendação disponível no momento</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Continue monitorando os indicadores
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legenda de Prioridades */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="text-xs text-zinc-400">
            <strong className="text-zinc-100">Nota:</strong> Esta análise é gerada automaticamente
            com base nos dados coletados. Para interpretação completa e plano de ação detalhado,
            consulte um profissional especializado em saúde ocupacional.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
