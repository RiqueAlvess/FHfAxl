"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { QuestionarioWizard } from "@/components/questionario/QuestionarioWizard";
import { AlertCircle } from "lucide-react";
import { perguntas } from "@/lib/questionario-hseit";

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
      }
    } catch (error) {
      toast.error("Erro ao validar link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: {
    respostas: Record<number, number>;
    consentimentoLGPD: boolean;
    tempoResposta: number;
  }) => {
    try {
      // Organizar respostas por dimensão
      const respostasOrganizadas = {
        demandas: perguntas
          .filter((p) => p.dimensao === "demandas")
          .map((p) => data.respostas[p.id]),
        controle: perguntas
          .filter((p) => p.dimensao === "controle")
          .map((p) => data.respostas[p.id]),
        apoioGerencial: perguntas
          .filter((p) => p.dimensao === "apoioGerencial")
          .map((p) => data.respostas[p.id]),
        apoioColegas: perguntas
          .filter((p) => p.dimensao === "apoioColegas")
          .map((p) => data.respostas[p.id]),
        relacionamentos: perguntas
          .filter((p) => p.dimensao === "relacionamentos")
          .map((p) => data.respostas[p.id]),
        papel: perguntas.filter((p) => p.dimensao === "papel").map((p) => data.respostas[p.id]),
        mudancas: perguntas
          .filter((p) => p.dimensao === "mudancas")
          .map((p) => data.respostas[p.id]),
      };

      const response = await fetch("/api/questionario/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          respostas: respostasOrganizadas,
          consentimentoLGPD: data.consentimentoLGPD,
          tempoResposta: data.tempoResposta,
        }),
      });

      if (response.ok) {
        toast.success("Questionário enviado com sucesso!");
        router.push(`/questionario/${token}/obrigado`);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar questionário");
      }
    } catch (error) {
      console.error("Erro ao enviar questionário:", error);
      throw error; // Re-throw para o QuestionarioWizard tratar
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
              <p className="text-zinc-300">Validando link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid link state
  if (!magicLinkData?.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur">
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

  // Main questionnaire
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-900/30 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              VIVAMENTE360
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base">
              Questionário de Avaliação de Riscos Psicossociais
            </p>
            {magicLinkData.colaboradorEmail && (
              <p className="text-xs text-zinc-500">
                Respondendo como: {magicLinkData.colaboradorEmail}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Wizard Component */}
      <QuestionarioWizard
        token={token}
        onSubmit={handleSubmit}
        empresaNome={magicLinkData.colaboradorEmail?.split("@")[1] || "sua organização"}
      />

      {/* Footer */}
      <div className="border-t border-zinc-800/50 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center text-xs text-zinc-500 space-y-1">
            <p>Todas as respostas são confidenciais e anônimas</p>
            <p className="flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/50">
                NR-1
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/50">
                LGPD
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/50">
                GRO/PGR
              </span>
            </p>
            <p className="pt-2 text-zinc-600">
              Powered by <span className="font-semibold text-violet-500">VIVAMENTE360</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
