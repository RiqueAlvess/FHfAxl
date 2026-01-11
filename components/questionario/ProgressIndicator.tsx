"use client";

import { motion } from "framer-motion";
import { dimensoes, Dimensao } from "@/lib/questionario-hseit";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface ProgressIndicatorProps {
  currentDimensao: string;
  respostasPorDimensao: Record<string, number>;
  tempoDecorrido?: number; // em segundos
}

export function ProgressIndicator({
  currentDimensao,
  respostasPorDimensao,
  tempoDecorrido,
}: ProgressIndicatorProps) {
  const totalPerguntas = 35;
  const totalRespondidas = Object.values(respostasPorDimensao).reduce((a, b) => a + b, 0);
  const progressoPercentual = Math.round((totalRespondidas / totalPerguntas) * 100);

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Barra de progresso global */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Progresso geral</span>
          <div className="flex items-center gap-3">
            {tempoDecorrido !== undefined && (
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-mono">{formatarTempo(tempoDecorrido)}</span>
              </div>
            )}
            <span className="text-zinc-300 font-semibold">
              {totalRespondidas}/{totalPerguntas}
            </span>
          </div>
        </div>

        <div className="relative h-3 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressoPercentual}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>

        <div className="text-center">
          <span className="text-xs text-zinc-500">{progressoPercentual}% concluído</span>
        </div>
      </div>

      {/* Progresso por dimensão */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Dimensões
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
          {dimensoes.map((dimensao, index) => {
            const respostas = respostasPorDimensao[dimensao.codigo] || 0;
            const isCurrent = dimensao.codigo === currentDimensao;
            const isCompleted = respostas === dimensao.perguntas;
            const progressoDimensao = Math.round((respostas / dimensao.perguntas) * 100);

            return (
              <motion.div
                key={dimensao.codigo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative p-3 rounded-lg border-2 transition-all duration-200",
                  isCurrent
                    ? "bg-violet-500/10 border-violet-500/50 shadow-lg shadow-violet-500/20"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-zinc-900/30 border-zinc-800/50"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isCurrent
                        ? "text-violet-400"
                        : isCompleted
                        ? "text-emerald-400"
                        : "text-zinc-500"
                    )}
                  >
                    {dimensao.ordem}
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle
                      className={cn(
                        "w-4 h-4",
                        isCurrent ? "text-violet-400" : "text-zinc-600"
                      )}
                    />
                  )}
                </div>

                {/* Nome da dimensão */}
                <h5
                  className={cn(
                    "text-xs font-semibold leading-tight mb-2 line-clamp-2",
                    isCurrent
                      ? "text-violet-300"
                      : isCompleted
                      ? "text-emerald-300"
                      : "text-zinc-400"
                  )}
                >
                  {dimensao.nome}
                </h5>

                {/* Mini progress bar */}
                <div className="space-y-1">
                  <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        isCurrent
                          ? "bg-violet-500"
                          : isCompleted
                          ? "bg-emerald-500"
                          : "bg-zinc-700"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressoDimensao}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <div className="text-xs text-zinc-600">
                    {respostas}/{dimensao.perguntas}
                  </div>
                </div>

                {/* Current indicator */}
                {isCurrent && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span>Atual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Concluída</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <span>Pendente</span>
        </div>
      </div>
    </div>
  );
}
