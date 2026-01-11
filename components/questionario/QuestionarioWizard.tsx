"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  dimensoes,
  perguntas,
  getPerguntasPorDimensao,
  calcularProgresso,
} from "@/lib/questionario-hseit";
import { PerguntaCard } from "./PerguntaCard";
import { ProgressIndicator } from "./ProgressIndicator";
import { ConsentimentoLGPD } from "./ConsentimentoLGPD";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  RotateCcw,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuestionarioWizardProps {
  token: string;
  onSubmit: (data: {
    respostas: Record<number, number>;
    consentimentoLGPD: boolean;
    tempoResposta: number;
  }) => Promise<void>;
  empresaNome?: string;
}

interface ProgressoSalvo {
  respostas: Record<number, number>;
  currentDimensaoIndex: number;
  consentimentoLGPD: boolean;
  startTime: number;
  lastUpdated: number;
}

export function QuestionarioWizard({
  token,
  onSubmit,
  empresaNome,
}: QuestionarioWizardProps) {
  // Estados
  const [etapa, setEtapa] = useState<"consentimento" | "questionario" | "revisao">(
    "consentimento"
  );
  const [currentDimensaoIndex, setCurrentDimensaoIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [consentimentoLGPD, setConsentimentoLGPD] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [showRequiredErrors, setShowRequiredErrors] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressoRecuperado, setProgressoRecuperado] = useState(false);

  const currentDimensao = dimensoes[currentDimensaoIndex];
  const perguntasDimensao = getPerguntasPorDimensao(currentDimensao.codigo);
  const isFirstDimensao = currentDimensaoIndex === 0;
  const isLastDimensao = currentDimensaoIndex === dimensoes.length - 1;

  // LocalStorage keys
  const STORAGE_KEY = `questionario_${token}`;

  // Salvar progresso no localStorage
  const salvarProgresso = useCallback(() => {
    if (typeof window === "undefined") return;

    const progresso: ProgressoSalvo = {
      respostas,
      currentDimensaoIndex,
      consentimentoLGPD,
      startTime,
      lastUpdated: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progresso));
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  }, [respostas, currentDimensaoIndex, consentimentoLGPD, startTime, STORAGE_KEY]);

  // Carregar progresso do localStorage
  useEffect(() => {
    if (typeof window === "undefined" || progressoRecuperado) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progresso: ProgressoSalvo = JSON.parse(saved);

        // Verificar se o progresso não está muito antigo (7 dias)
        const diasDesdeUltimaAtualizacao =
          (Date.now() - progresso.lastUpdated) / (1000 * 60 * 60 * 24);

        if (diasDesdeUltimaAtualizacao <= 7) {
          const totalRespondidas = Object.keys(progresso.respostas).length;

          if (totalRespondidas > 0) {
            // Mostrar toast perguntando se quer continuar
            toast(
              <div className="space-y-3">
                <div className="font-semibold">Progresso anterior encontrado</div>
                <p className="text-sm text-zinc-400">
                  Você respondeu {totalRespondidas} de 35 perguntas.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setRespostas(progresso.respostas);
                      setCurrentDimensaoIndex(progresso.currentDimensaoIndex);
                      setConsentimentoLGPD(progresso.consentimentoLGPD);
                      setStartTime(progresso.startTime);
                      if (progresso.consentimentoLGPD) {
                        setEtapa("questionario");
                      }
                      toast.dismiss();
                      toast.success("Progresso recuperado!");
                    }}
                  >
                    <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                    Continuar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem(STORAGE_KEY);
                      toast.dismiss();
                      toast.success("Progresso apagado. Iniciando do zero.");
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Recomeçar
                  </Button>
                </div>
              </div>,
              {
                duration: 10000,
                closeButton: true,
              }
            );
          }
        } else {
          // Progresso muito antigo, limpar
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
    }

    setProgressoRecuperado(true);
  }, [STORAGE_KEY, progressoRecuperado]);

  // Salvar progresso sempre que mudar
  useEffect(() => {
    if (progressoRecuperado && etapa === "questionario") {
      salvarProgresso();
    }
  }, [respostas, currentDimensaoIndex, consentimentoLGPD, etapa, salvarProgresso, progressoRecuperado]);

  // Timer
  useEffect(() => {
    if (etapa !== "questionario") return;

    const interval = setInterval(() => {
      setTempoDecorrido(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [etapa, startTime]);

  // Handlers
  const handleResposta = (perguntaId: number, valor: number) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: valor,
    }));

    // Limpar erro de required se existir
    setShowRequiredErrors((prev) => ({
      ...prev,
      [perguntaId]: false,
    }));

    // Feedback visual
    toast.success("Resposta salva", {
      duration: 1000,
      position: "bottom-center",
    });
  };

  const handleIniciarQuestionario = () => {
    setEtapa("questionario");
    setStartTime(Date.now());
  };

  const validarDimensaoAtual = (): boolean => {
    let isValid = true;
    const errors: Record<number, boolean> = {};

    perguntasDimensao.forEach((pergunta) => {
      if (respostas[pergunta.id] === undefined) {
        errors[pergunta.id] = true;
        isValid = false;
      }
    });

    setShowRequiredErrors(errors);

    if (!isValid) {
      toast.error("Por favor, responda todas as perguntas desta dimensão", {
        duration: 3000,
      });
    }

    return isValid;
  };

  const handleProximaDimensao = () => {
    if (!validarDimensaoAtual()) return;

    if (isLastDimensao) {
      setEtapa("revisao");
    } else {
      setCurrentDimensaoIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDimensaoAnterior = () => {
    if (!isFirstDimensao) {
      setCurrentDimensaoIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitFinal = async () => {
    if (!validarDimensaoAtual()) return;

    setIsSubmitting(true);

    try {
      const tempoTotal = Math.floor((Date.now() - startTime) / 1000);

      await onSubmit({
        respostas,
        consentimentoLGPD,
        tempoResposta: tempoTotal,
      });

      // Limpar localStorage após submissão bem-sucedida
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Erro ao submeter questionário:", error);
      toast.error("Erro ao enviar questionário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular progresso por dimensão
  const respostasPorDimensao = dimensoes.reduce((acc, dim) => {
    const perguntasDim = getPerguntasPorDimensao(dim.codigo);
    const respondidas = perguntasDim.filter((p) => respostas[p.id] !== undefined).length;
    acc[dim.codigo] = respondidas;
    return acc;
  }, {} as Record<string, number>);

  // Renderização condicional
  if (etapa === "consentimento") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ConsentimentoLGPD
          consentido={consentimentoLGPD}
          onConsentir={setConsentimentoLGPD}
          onIniciar={handleIniciarQuestionario}
          empresaNome={empresaNome}
        />
      </div>
    );
  }

  if (etapa === "revisao") {
    const totalRespondidas = Object.keys(respostas).length;
    const progresso = calcularProgresso(respostas);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl font-bold text-zinc-100">Revisão Final</h1>
          <p className="text-zinc-400">
            Você respondeu {totalRespondidas} de 35 perguntas ({progresso}%)
          </p>
        </motion.div>

        <ProgressIndicator
          currentDimensao={currentDimensao.codigo}
          respostasPorDimensao={respostasPorDimensao}
          tempoDecorrido={tempoDecorrido}
        />

        {progresso === 100 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-sm bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl p-6 text-center space-y-4"
          >
            <AlertCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-semibold text-emerald-400">
              Todas as perguntas respondidas!
            </h3>
            <p className="text-zinc-400">
              Revise suas respostas ou clique em Enviar para finalizar.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-sm bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-6 text-center space-y-4"
          >
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto" />
            <h3 className="text-xl font-semibold text-orange-400">
              Perguntas pendentes
            </h3>
            <p className="text-zinc-400">
              Você ainda tem {35 - totalRespondidas} perguntas para responder.
            </p>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setEtapa("questionario")}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Revisar Respostas
          </Button>

          <Button
            onClick={handleSubmitFinal}
            disabled={progresso !== 100 || isSubmitting}
            size="lg"
            className={cn(
              "min-w-[200px]",
              progresso === 100
                ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                : ""
            )}
          >
            {isSubmitting ? (
              <>Enviando...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Questionário
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Etapa questionário
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentDimensao={currentDimensao.codigo}
        respostasPorDimensao={respostasPorDimensao}
        tempoDecorrido={tempoDecorrido}
      />

      {/* Dimensão atual */}
      <motion.div
        key={currentDimensao.codigo}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30">
          <span className="text-sm font-semibold text-violet-400">
            Dimensão {currentDimensao.ordem} de {dimensoes.length}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">
          {currentDimensao.nome}
        </h2>
        <p className="text-zinc-400">{currentDimensao.descricao}</p>
      </motion.div>

      {/* Perguntas da dimensão */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {perguntasDimensao.map((pergunta) => (
            <PerguntaCard
              key={pergunta.id}
              pergunta={pergunta}
              value={respostas[pergunta.id]}
              onChange={(valor) => handleResposta(pergunta.id, valor)}
              totalPerguntas={perguntas.length}
              showRequiredError={showRequiredErrors[pergunta.id]}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Navegação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-zinc-800">
        <Button
          onClick={handleDimensaoAnterior}
          disabled={isFirstDimensao}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto min-w-[180px]"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Dimensão Anterior
        </Button>

        <div className="text-sm text-zinc-500">
          {respostasPorDimensao[currentDimensao.codigo]} de {currentDimensao.perguntas}{" "}
          respondidas
        </div>

        <Button
          onClick={handleProximaDimensao}
          size="lg"
          className="w-full sm:w-auto min-w-[180px] bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
        >
          {isLastDimensao ? (
            <>
              Revisar e Enviar
              <Send className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Próxima Dimensão
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
