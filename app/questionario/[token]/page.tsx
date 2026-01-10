"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { perguntas, escalaLikert, dimensoes } from "@/lib/questionario-hseit";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface MagicLinkData {
  valid: boolean;
  expired?: boolean;
  completed?: boolean;
  colaboradorEmail?: string;
}

export default function QuestionarioPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [magicLinkData, setMagicLinkData] = useState<MagicLinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentimento, setConsentimento] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Respostas organizadas por dimensão
  const [respostas, setRespostas] = useState<Record<number, number>>({});

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/magic-link/validate?token=${token}`);
      const data = await response.json();

      setMagicLinkData(data);

      if (!data.valid) {
        if (data.expired) {
          toast.error("Este link expirou. Solicite um novo link.");
        } else if (data.completed) {
          toast.info("Você já respondeu este questionário.");
        }
      } else {
        setStartTime(Date.now());
      }
    } catch (error) {
      toast.error("Erro ao validar link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespostaChange = (perguntaId: number, valor: number) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
  };

  const getCurrentDimensao = () => {
    return dimensoes[currentStep];
  };

  const getPerguntasDimensao = () => {
    const dimensao = getCurrentDimensao();
    return perguntas.filter((p) => p.dimensao === dimensao.codigo);
  };

  const isDimensaoCompleta = () => {
    const perguntasDimensao = getPerguntasDimensao();
    return perguntasDimensao.every((p) => respostas[p.id] !== undefined);
  };

  const handleNext = () => {
    if (!isDimensaoCompleta()) {
      toast.warning("Por favor, responda todas as perguntas desta seção");
      return;
    }

    if (currentStep < dimensoes.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!consentimento) {
      toast.error("É necessário concordar com os termos LGPD");
      return;
    }

    if (Object.keys(respostas).length !== 35) {
      toast.error("Por favor, responda todas as 35 perguntas");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calcular tempo de resposta em segundos
      const tempoResposta = Math.floor((Date.now() - startTime) / 1000);

      // Organizar respostas por dimensão
      const respostasOrganizadas = {
        demandas: perguntas.filter((p) => p.dimensao === "demandas").map((p) => respostas[p.id]),
        controle: perguntas.filter((p) => p.dimensao === "controle").map((p) => respostas[p.id]),
        apoioGerencial: perguntas.filter((p) => p.dimensao === "apoioGerencial").map((p) => respostas[p.id]),
        apoioColegas: perguntas.filter((p) => p.dimensao === "apoioColegas").map((p) => respostas[p.id]),
        relacionamentos: perguntas.filter((p) => p.dimensao === "relacionamentos").map((p) => respostas[p.id]),
        papel: perguntas.filter((p) => p.dimensao === "papel").map((p) => respostas[p.id]),
        mudancas: perguntas.filter((p) => p.dimensao === "mudancas").map((p) => respostas[p.id]),
      };

      const response = await fetch("/api/questionario/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          respostas: respostasOrganizadas,
          consentimentoLGPD: consentimento,
          tempoResposta,
        }),
      });

      if (response.ok) {
        toast.success("Questionário enviado com sucesso!");
        router.push(`/questionario/${token}/obrigado`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao enviar questionário");
      }
    } catch (error) {
      toast.error("Erro ao enviar questionário");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <Card className="w-full max-w-md border-zinc-700 bg-zinc-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-violet-500" />
              <p className="text-zinc-300">Validando link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!magicLinkData?.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
        <Card className="w-full max-w-md border-zinc-700 bg-zinc-800/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-red-500/10 p-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-center text-zinc-100">Link Inválido</CardTitle>
            <CardDescription className="text-center text-zinc-400">
              {magicLinkData?.expired && "Este link expirou."}
              {magicLinkData?.completed && "Você já respondeu este questionário."}
              {!magicLinkData?.expired && !magicLinkData?.completed && "Link não encontrado."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-zinc-400">
              Entre em contato com o RH para solicitar um novo link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dimensaoAtual = getCurrentDimensao();
  const perguntasDimensao = getPerguntasDimensao();
  const progressoTotal = ((currentStep + 1) / dimensoes.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            VIVAMENTE360
          </h1>
          <p className="text-zinc-400">Questionário de Avaliação de Riscos Psicossociais</p>
          <p className="text-xs text-zinc-500">
            Respondendo como: {magicLinkData.colaboradorEmail}
          </p>
        </div>

        {/* Progresso */}
        <Card className="border-zinc-700 bg-zinc-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-zinc-200">
                  Dimensão {currentStep + 1} de {dimensoes.length}
                </span>
                <span className="text-zinc-400">
                  {Math.round(progressoTotal)}% concluído
                </span>
              </div>
              <Progress value={progressoTotal} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Dimensão Atual */}
        <Card className="border-zinc-700 bg-zinc-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-2xl">{dimensaoAtual.nome}</CardTitle>
            <CardDescription className="text-zinc-400">{dimensaoAtual.descricao}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {perguntasDimensao.map((pergunta) => (
              <div key={pergunta.id} className="space-y-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
                <Label className="text-base font-medium text-zinc-200">{pergunta.texto}</Label>
                <div className="grid grid-cols-5 gap-2">
                  {escalaLikert.map((opcao) => (
                    <button
                      key={opcao.valor}
                      onClick={() => handleRespostaChange(pergunta.id, opcao.valor)}
                      className={`p-3 text-center rounded-md border-2 transition-all ${
                        respostas[pergunta.id] === opcao.valor
                          ? "border-violet-500 bg-violet-500/20 font-medium shadow-lg shadow-violet-500/20"
                          : "border-zinc-700 hover:border-violet-400/50 bg-zinc-800/30"
                      }`}
                    >
                      <div className={`text-lg font-bold ${
                        respostas[pergunta.id] === opcao.valor
                          ? "text-violet-300"
                          : "text-zinc-300"
                      }`}>
                        {opcao.valor}
                      </div>
                      <div className={`text-xs ${
                        respostas[pergunta.id] === opcao.valor
                          ? "text-violet-400"
                          : "text-zinc-500"
                      }`}>
                        {opcao.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Consentimento LGPD (última página) */}
        {currentStep === dimensoes.length - 1 && (
          <Card className="border-zinc-700 bg-zinc-800/50 backdrop-blur border-violet-500/50">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-100">Consentimento LGPD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3 p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
                <input
                  type="checkbox"
                  id="consentimento"
                  checked={consentimento}
                  onChange={(e) => setConsentimento(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-600 text-violet-500 focus:ring-violet-500 focus:ring-offset-zinc-900"
                />
                <Label htmlFor="consentimento" className="text-sm text-zinc-300 cursor-pointer">
                  Concordo com o tratamento dos meus dados conforme a LGPD. Entendo que minhas
                  respostas são anônimas e serão utilizadas apenas para análises agregadas.
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navegação */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-200"
          >
            Anterior
          </Button>

          {currentStep < dimensoes.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isDimensaoCompleta() || isSubmitting}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20"
            >
              Próxima
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isDimensaoCompleta() || !consentimento || isSubmitting}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Questionário"
              )}
            </Button>
          )}
        </div>

        {/* Informações */}
        <div className="text-center text-xs text-zinc-500 space-y-1 pb-4">
          <p>Todas as respostas são confidenciais e anônimas</p>
          <p>Conforme NR-1 • LGPD • GRO/PGR</p>
        </div>
      </div>
    </div>
  );
}
