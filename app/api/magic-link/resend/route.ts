import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { addHours } from "date-fns";
import { sendEmail, getMagicLinkEmailTemplate } from "@/lib/email";
import { withRateLimit } from "@/lib/rate-limit-helpers";

interface ResendMagicLinkRequest {
  magicLinkIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Aplicar rate limiting: 5 requisições por 10 minutos
    const rateLimitCheck = await withRateLimit({
      limiterType: "magic-link:resend",
      identifier: session.user.id,
      request,
      userId: session.user.id,
      auditDetails: { endpoint: "/api/magic-link/resend" },
    });

    if (rateLimitCheck) return rateLimitCheck;

    const body: ResendMagicLinkRequest = await request.json();
    const { magicLinkIds } = body;

    if (!magicLinkIds || !Array.isArray(magicLinkIds) || magicLinkIds.length === 0) {
      return NextResponse.json(
        { error: "IDs de magic links inválidos" },
        { status: 400 }
      );
    }

    // Limite de 500 emails por vez (rate limit Resend)
    if (magicLinkIds.length > 500) {
      return NextResponse.json(
        { error: "Máximo de 500 magic links por vez" },
        { status: 400 }
      );
    }

    const expirationHours = parseInt(
      process.env.MAGIC_LINK_EXPIRATION_HOURS || "48"
    );
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const results = {
      success: 0,
      errors: [] as Array<{ email: string; erro: string }>,
    };

    // Processar cada magic link
    for (const magicLinkId of magicLinkIds) {
      try {
        // Buscar magic link com colaborador e empresa
        const magicLinkExistente = await prisma.magicLink.findUnique({
          where: { id: magicLinkId },
          include: {
            colaborador: {
              include: {
                empresa: {
                  select: {
                    nome: true,
                    logo: true,
                    corPrimaria: true,
                  },
                },
              },
            },
          },
        });

        if (!magicLinkExistente) {
          results.errors.push({
            email: magicLinkId,
            erro: "Magic link não encontrado",
          });
          continue;
        }

        const colaborador = magicLinkExistente.colaborador;

        if (!colaborador || !colaborador.ativo) {
          results.errors.push({
            email: colaborador?.email || magicLinkId,
            erro: "Colaborador não encontrado ou inativo",
          });
          continue;
        }

        // Verificar se já foi completado
        if (magicLinkExistente.status === "COMPLETED") {
          results.errors.push({
            email: colaborador.email,
            erro: "Questionário já foi completado",
          });
          continue;
        }

        // Invalidar magic link anterior
        await prisma.magicLink.update({
          where: { id: magicLinkId },
          data: { status: "EXPIRED" },
        });

        // Gerar novo token seguro
        const token = nanoid(64);
        const expiresAt = addHours(new Date(), expirationHours);

        // Criar novo magic link
        const novoMagicLink = await prisma.magicLink.create({
          data: {
            token,
            colaboradorId: colaborador.id,
            cicloAvaliacaoId: magicLinkExistente.cicloAvaliacaoId,
            expiresAt,
            status: "PENDING",
          },
        });

        // Enviar email
        const linkUrl = `${appUrl}/questionario/${token}`;
        const emailHtml = getMagicLinkEmailTemplate(
          colaborador.email,
          linkUrl,
          expiresAt,
          colaborador.empresa?.nome,
          colaborador.empresa?.logo || undefined,
          colaborador.empresa?.corPrimaria
        );

        const emailResult = await sendEmail({
          to: colaborador.email,
          subject: "Questionário VIVAMENTE360 - Avaliação de Riscos Psicossociais (Reenvio)",
          html: emailHtml,
        });

        if (emailResult.success) {
          // Atualizar status para SENT
          await prisma.magicLink.update({
            where: { id: novoMagicLink.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
            },
          });
          results.success++;
        } else {
          results.errors.push({
            email: colaborador.email,
            erro: "Erro ao enviar email",
          });
        }
      } catch (error) {
        results.errors.push({
          email: magicLinkId,
          erro: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro ao reenviar magic links:", error);
    return NextResponse.json(
      { error: "Erro ao reenviar magic links" },
      { status: 500 }
    );
  }
}
