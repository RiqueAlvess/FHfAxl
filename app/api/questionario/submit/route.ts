import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularScores, RespostasQuestionario } from "@/lib/scoring";
import { registrarConsentimentoLGPD } from "@/lib/audit-log";

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
      return NextResponse.json({ error: "Dados incompletos. É necessário consentir com os termos LGPD para prosseguir." }, { status: 400 });
    }

    // Extrair dados do request para LGPD
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const consentimentoDataHora = new Date();

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
      // Criar resposta com dados LGPD completos
      const novaResposta = await tx.resposta.create({
        data: {
          magicLinkId: magicLink.id,
          colaboradorId: magicLink.colaboradorId,
          cicloAvaliacaoId: magicLink.cicloAvaliacaoId,
          // Consentimento LGPD completo
          consentimentoLGPD,
          consentimentoDataHora,
          consentimentoIp: ipAddress,
          consentimentoUserAgent: userAgent,
          // Respostas
          demandas: respostas.demandas,
          controle: respostas.controle,
          apoioGerencial: respostas.apoioGerencial,
          apoioColegas: respostas.apoioColegas,
          relacionamentos: respostas.relacionamentos,
          papel: respostas.papel,
          mudancas: respostas.mudancas,
          // Scores calculados
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

      // Atualizar data de retenção do colaborador (5 anos a partir da última resposta)
      const dataRetencao = new Date();
      dataRetencao.setFullYear(dataRetencao.getFullYear() + 5);

      await tx.colaborador.update({
        where: { id: magicLink.colaboradorId },
        data: {
          dataRetencao,
        },
      });

      return novaResposta;
    });

    // Registrar consentimento LGPD no audit log
    await registrarConsentimentoLGPD(
      magicLink.colaboradorId,
      magicLink.id,
      ipAddress,
      userAgent
    );

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
