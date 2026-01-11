"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Shield,
  BarChart3,
  Users,
  Lightbulb,
  Clock,
  Lock,
  Eye,
} from "lucide-react";

export default function ObrigadoPage() {
  // Animação de entrada escalonada
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl space-y-8"
      >
        {/* Success Icon */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/50">
              <CheckCircle2 className="h-16 w-16 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
            Obrigado por participar!
          </h1>
          <p className="text-xl text-zinc-400">
            Seu questionário foi enviado com sucesso
          </p>
        </motion.div>

        {/* Main message */}
        <motion.div variants={itemVariants}>
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardContent className="pt-6 space-y-6 text-center">
              <p className="text-lg text-zinc-300 leading-relaxed">
                Sua contribuição é <span className="font-semibold text-emerald-400">fundamental</span>{" "}
                para melhorarmos o ambiente de trabalho e promovermos o bem-estar de todos os
                colaboradores.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security highlights */}
        <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
          <Card className="border-emerald-500/30 bg-emerald-500/5 backdrop-blur">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <Lock className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <h3 className="font-semibold text-zinc-200">Confidencial</h3>
              <p className="text-sm text-zinc-400">
                Suas respostas são protegidas e criptografadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-blue-500/5 backdrop-blur">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Eye className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="font-semibold text-zinc-200">Anônimo</h3>
              <p className="text-sm text-zinc-400">
                K-Anonymity garante que você não seja identificado
              </p>
            </CardContent>
          </Card>

          <Card className="border-violet-500/30 bg-violet-500/5 backdrop-blur">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 rounded-lg bg-violet-500/10">
                  <Shield className="h-8 w-8 text-violet-400" />
                </div>
              </div>
              <h3 className="font-semibold text-zinc-200">LGPD</h3>
              <p className="text-sm text-zinc-400">
                Em conformidade com a Lei Geral de Proteção de Dados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next steps */}
        <motion.div variants={itemVariants}>
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardContent className="pt-6 space-y-6">
              <h3 className="text-xl font-semibold text-zinc-200 text-center flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-violet-400" />
                Próximos passos
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-zinc-300">Respostas Registradas</h4>
                    <p className="text-sm text-zinc-500">
                      Seus dados foram salvos com segurança em nosso sistema
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-zinc-300">Análise Agregada</h4>
                    <p className="text-sm text-zinc-500">
                      Dados serão analisados junto com outros colaboradores
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-violet-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-zinc-300">Relatórios Gerados</h4>
                    <p className="text-sm text-zinc-500">
                      Insights serão compartilhados com a gestão
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-orange-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-zinc-300">Ações de Melhoria</h4>
                    <p className="text-sm text-zinc-500">
                      Planos serão criados com base nos resultados
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info box */}
        <motion.div variants={itemVariants}>
          <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10 flex-shrink-0">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-zinc-200">
                    Como garantimos sua privacidade
                  </h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Utilizamos técnicas avançadas de anonimização, incluindo K-Anonymity, para
                    garantir que suas respostas individuais nunca possam ser identificadas. Todos
                    os dados são agregados e apenas estatísticas gerais são compartilhadas com a
                    gestão.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
              <Shield className="h-3 w-3" />
              NR-1
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
              <Lock className="h-3 w-3" />
              LGPD
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
              <BarChart3 className="h-3 w-3" />
              GRO/PGR
            </span>
          </div>

          <p className="text-sm text-zinc-600">
            Powered by{" "}
            <span className="font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              VIVAMENTE360
            </span>
          </p>

          <p className="text-xs text-zinc-700">
            Plataforma de Avaliação de Riscos Psicossociais
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
