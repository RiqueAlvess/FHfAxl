"use client";

import { motion } from "framer-motion";
import { Pergunta } from "@/lib/questionario-hseit";
import { EscalaLikert } from "./EscalaLikert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerguntaCardProps {
  pergunta: Pergunta;
  value: number | undefined;
  onChange: (valor: number) => void;
  isRequired?: boolean;
  showRequiredError?: boolean;
  totalPerguntas: number;
}

export function PerguntaCard({
  pergunta,
  value,
  onChange,
  isRequired = true,
  showRequiredError = false,
  totalPerguntas,
}: PerguntaCardProps) {
  const isAnswered = value !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative backdrop-blur-sm rounded-2xl p-6 sm:p-8",
        "border-2 transition-all duration-300",
        showRequiredError
          ? "border-red-500/50 bg-red-500/5"
          : isAnswered
          ? "border-emerald-500/30 bg-zinc-900/80"
          : "border-zinc-800/50 bg-zinc-900/50"
      )}
    >
      {/* Header com número da pergunta */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              "text-sm font-bold transition-colors",
              isAnswered
                ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50"
                : "bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700/50"
            )}
          >
            {pergunta.id}
          </div>

          <div className="text-xs text-zinc-500">
            Pergunta {pergunta.id} de {totalPerguntas}
          </div>
        </div>

        {/* Status indicator */}
        {isAnswered ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 text-emerald-400"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-medium">Respondida</span>
          </motion.div>
        ) : (
          isRequired && (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Obrigatória</span>
            </div>
          )
        )}
      </div>

      {/* Texto da pergunta */}
      <div className="mb-8">
        <h3 className="text-lg sm:text-xl font-medium text-zinc-100 leading-relaxed">
          {pergunta.texto}
        </h3>

        {/* Polaridade indicator (apenas para debug, pode remover) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-2 text-xs text-zinc-600">
            Dimensão: {pergunta.dimensao} | Polaridade: {pergunta.polaridade}
          </div>
        )}
      </div>

      {/* Escala Likert */}
      <EscalaLikert value={value} onChange={onChange} />

      {/* Error message */}
      {showRequiredError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 flex items-center gap-2 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Por favor, responda esta pergunta para continuar</span>
        </motion.div>
      )}

      {/* Saved indicator */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs text-zinc-600 text-center"
        >
          ✓ Resposta salva automaticamente
        </motion.div>
      )}
    </motion.div>
  );
}
