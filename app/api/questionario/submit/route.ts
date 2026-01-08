import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularScores, RespostasQuestionario } from "@/lib/scoring";

interface SubmitQuestionarioRequest {
  token: string;
  respostas: RespostasQuestionario;
  consentimentoLGPD: boolean;
  tempoResposta: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitQuestionarioRequest = await request.json();
    const { token, respostas, consentimentoLGPD, tempoResposta } = body;

    if (!token || !respostas || !consentimentoLGPD) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Buscar magic link
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: { resposta: true },
    });

    if (!magicLink) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    // Verificar se já foi respondido
    if (magicLink.resposta || magicLink.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Questionário já respondido" },
        { status: 400 }
      );
    }

    // Verificar se expirou
    if (magicLink.expiresAt < new Date()) {
      return NextResponse.json({ error: "Link expirado" }, { status: 400 });
    }

    // Calcular scores
    const resultado = calcularScores(respostas);

    // Salvar resposta em transação
    const resposta = await prisma.$transaction(async (tx) => {
      // Criar resposta
      const novaResposta = await tx.resposta.create({
        data: {
          magicLinkId: magicLink.id,
          colaboradorId: magicLink.colaboradorId,
          cicloAvaliacaoId: magicLink.cicloAvaliacaoId,
          consentimentoLGPD,
          demandas: respostas.demandas,
          controle: respostas.controle,
          apoioGerencial: respostas.apoioGerencial,
          apoioColegas: respostas.apoioColegas,
          relacionamentos: respostas.relacionamentos,
          papel: respostas.papel,
          mudancas: respostas.mudancas,
          scoreDemandas: resultado.scoreDemandas,
          scoreControle: resultado.scoreControle,
          scoreApoioGerencial: resultado.scoreApoioGerencial,
          scoreApoioColegas: resultado.scoreApoioColegas,
          scoreRelacionamentos: resultado.scoreRelacionamentos,
          scorePapel: resultado.scorePapel,
          scoreMudancas: resultado.scoreMudancas,
          scoreGlobal: resultado.scoreGlobal,
          classificacao: resultado.classificacao,
          tempoResposta,
        },
      });

      // Atualizar magic link para COMPLETED
      await tx.magicLink.update({
        where: { id: magicLink.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      return novaResposta;
    });

    return NextResponse.json({
      success: true,
      respostaId: resposta.id,
      scoreGlobal: resposta.scoreGlobal,
      classificacao: resposta.classificacao,
    });
  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    return NextResponse.json(
      { error: "Erro ao salvar resposta do questionário" },
      { status: 500 }
    );
  }
}
