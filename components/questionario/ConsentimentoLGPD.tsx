"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ConsentimentoLGPDProps {
  consentido: boolean;
  onConsentir: (value: boolean) => void;
  onIniciar: () => void;
  empresaNome?: string;
}

export function ConsentimentoLGPD({
  consentido,
  onConsentir,
  onIniciar,
  empresaNome = "sua organização",
}: ConsentimentoLGPDProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-violet-500/10 border-2 border-violet-500/30">
            <Shield className="w-12 h-12 text-violet-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Antes de começar
          </h1>
          <p className="text-zinc-400 text-lg">
            Leia as informações sobre privacidade e proteção de dados
          </p>
        </div>
      </motion.div>

      {/* Cards de informação */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {/* Anonimato */}
        <div className="backdrop-blur-sm bg-zinc-900/50 border-2 border-zinc-800/50 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-zinc-200">Respostas Anônimas</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Suas respostas são completamente anônimas. Utilizamos K-Anonymity para garantir que
            você não possa ser identificado individualmente.
          </p>
        </div>

        {/* Segurança */}
        <div className="backdrop-blur-sm bg-zinc-900/50 border-2 border-zinc-800/50 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-zinc-200">Dados Seguros</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Todas as informações são criptografadas e armazenadas de forma segura, em conformidade
            com a LGPD.
          </p>
        </div>
      </motion.div>

      {/* Informações detalhadas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-sm bg-zinc-900/50 border-2 border-zinc-800/50 rounded-xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-violet-400" />
          <h3 className="text-xl font-semibold text-zinc-200">
            Como tratamos seus dados
          </h3>
        </div>

        <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Dados Coletados
            </h4>
            <ul className="ml-6 space-y-1 list-disc">
              <li>Suas respostas ao questionário HSE-IT (35 perguntas)</li>
              <li>Timestamp de início e conclusão</li>
              <li>Dados demográficos básicos (se fornecidos por {empresaNome})</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Finalidade
            </h4>
            <p>
              Os dados são utilizados exclusivamente para avaliar riscos psicossociais no ambiente
              de trabalho e gerar relatórios agregados para {empresaNome}, conforme NR-1 e normas
              de segurança ocupacional.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              K-Anonymity
            </h4>
            <p>
              Aplicamos técnicas de K-Anonymity nos relatórios. Isso significa que seus dados são
              agrupados com pelo menos K-1 outros participantes, tornando impossível identificar
              respostas individuais.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Seus Direitos (LGPD)
            </h4>
            <p>
              Você tem direito a acessar, corrigir ou excluir seus dados a qualquer momento. Entre
              em contato com o departamento de RH de {empresaNome} para exercer seus direitos.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Retenção de Dados
            </h4>
            <p>
              Os dados serão mantidos pelo período necessário para cumprir obrigações legais e
              regulatórias, sendo excluídos após esse período.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Checkbox de consentimento */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-200",
          consentido
            ? "bg-emerald-500/10 border-emerald-500/50"
            : "bg-zinc-900/50 border-zinc-800/50"
        )}
      >
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-1">
            <input
              type="checkbox"
              checked={consentido}
              onChange={(e) => onConsentir(e.target.checked)}
              className="peer sr-only"
              aria-label="Consentimento LGPD"
            />
            <div
              className={cn(
                "w-6 h-6 rounded-md border-2 transition-all duration-200",
                "flex items-center justify-center",
                consentido
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-zinc-600 group-hover:border-violet-500"
              )}
            >
              {consentido && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm text-zinc-300 leading-relaxed">
              <span className="font-semibold">Li e concordo</span> com o tratamento dos meus dados
              conforme descrito acima. Entendo que minhas respostas são anônimas e serão utilizadas
              exclusivamente para avaliação de riscos psicossociais.
            </p>
            <p className="text-xs text-zinc-500">
              Ao marcar esta caixa, você consente com a coleta e tratamento de dados conforme LGPD
              (Lei 13.709/2018)
            </p>
          </div>
        </label>
      </motion.div>

      {/* Botão de iniciar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          onClick={onIniciar}
          disabled={!consentido}
          size="lg"
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            "min-w-[200px] h-12 text-base font-semibold",
            consentido
              ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          {consentido ? (
            <>
              Iniciar Questionário
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 mr-2" />
              Aceite os termos para continuar
            </>
          )}
        </Button>
      </motion.div>

      {/* Tempo estimado */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-zinc-500"
      >
        Tempo estimado: <span className="font-semibold text-zinc-400">10-15 minutos</span>
      </motion.p>
    </div>
  );
}
