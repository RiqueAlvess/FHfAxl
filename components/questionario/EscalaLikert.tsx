"use client";

import { motion } from "framer-motion";
import { escalaLikert } from "@/lib/questionario-hseit";
import { cn } from "@/lib/utils";

interface EscalaLikertProps {
  value: number | undefined;
  onChange: (valor: number) => void;
  disabled?: boolean;
}

export function EscalaLikert({ value, onChange, disabled = false }: EscalaLikertProps) {
  return (
    <div className="space-y-4">
      {/* Labels das extremidades (mobile) */}
      <div className="flex justify-between text-xs text-zinc-400 sm:hidden px-1">
        <span>Nunca</span>
        <span>Sempre</span>
      </div>

      {/* Escala de botões */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {escalaLikert.map((opcao) => {
          const isSelected = value === opcao.valor;

          return (
            <motion.button
              key={opcao.valor}
              type="button"
              onClick={() => !disabled && onChange(opcao.valor)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              animate={{
                scale: isSelected ? 1.05 : 1,
              }}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "min-h-[80px] sm:min-h-[100px] p-3 sm:p-4",
                "rounded-xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950",
                "touch-manipulation", // Better touch handling
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && "cursor-pointer hover:shadow-lg",
                // Colors based on selection and value
                isSelected
                  ? [
                      "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20 focus:ring-emerald-500",
                      "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20 focus:ring-green-500",
                      "bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20 focus:ring-yellow-500",
                      "bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/20 focus:ring-orange-500",
                      "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/20 focus:ring-red-500",
                    ][opcao.valor]
                  : [
                      "border-zinc-700/50 hover:border-emerald-500/50 focus:ring-emerald-500",
                      "border-zinc-700/50 hover:border-green-500/50 focus:ring-green-500",
                      "border-zinc-700/50 hover:border-yellow-500/50 focus:ring-yellow-500",
                      "border-zinc-700/50 hover:border-orange-500/50 focus:ring-orange-500",
                      "border-zinc-700/50 hover:border-red-500/50 focus:ring-red-500",
                    ][opcao.valor]
              )}
              aria-label={`${opcao.label} (${opcao.valor})`}
              aria-pressed={isSelected}
            >
              {/* Emoji */}
              <motion.span
                className="text-2xl sm:text-3xl mb-1"
                animate={{
                  scale: isSelected ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                {opcao.emoji}
              </motion.span>

              {/* Label */}
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium text-center leading-tight",
                  isSelected
                    ? [
                        "text-emerald-400",
                        "text-green-400",
                        "text-yellow-400",
                        "text-orange-400",
                        "text-red-400",
                      ][opcao.valor]
                    : "text-zinc-400"
                )}
              >
                {opcao.label}
              </span>

              {/* Valor numérico */}
              <span className="text-xs text-zinc-500 mt-0.5">{opcao.valor}</span>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selected-indicator"
                  className={cn(
                    "absolute inset-0 rounded-xl opacity-10",
                    [
                      "bg-emerald-500",
                      "bg-green-500",
                      "bg-yellow-500",
                      "bg-orange-500",
                      "bg-red-500",
                    ][opcao.valor]
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Labels completas (desktop) */}
      <div className="hidden sm:grid grid-cols-5 gap-3">
        {escalaLikert.map((opcao) => (
          <div
            key={`label-${opcao.valor}`}
            className={cn(
              "text-center text-xs transition-colors",
              value === opcao.valor ? "text-zinc-300 font-medium" : "text-zinc-500"
            )}
          >
            {opcao.label}
          </div>
        ))}
      </div>

      {/* Helper text */}
      <p className="text-xs text-center text-zinc-500 mt-2">
        Selecione a frequência que melhor representa sua experiência
      </p>
    </div>
  );
}
