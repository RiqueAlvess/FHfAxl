import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { addHours } from "date-fns";
import { sendEmail, getMagicLinkEmailTemplate } from "@/lib/email";

interface GenerateMagicLinkRequest {
  colaboradorIds: string[];
  cicloAvaliacaoId: string;
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

    const body: GenerateMagicLinkRequest = await request.json();
    const { colaboradorIds, cicloAvaliacaoId } = body;

    if (!colaboradorIds || !Array.isArray(colaboradorIds) || colaboradorIds.length === 0) {
      return NextResponse.json(
        { error: "IDs de colaboradores inválidos" },
        { status: 400 }
      );
    }

    // Limite de 500 emails por vez (rate limit Resend)
    if (colaboradorIds.length > 500) {
      return NextResponse.json(
        { error: "Máximo de 500 colaboradores por vez" },
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

    // Processar cada colaborador
    for (const colaboradorId of colaboradorIds) {
      try {
        // Buscar colaborador
        const colaborador = await prisma.colaborador.findUnique({
          where: { id: colaboradorId },
        });

        if (!colaborador || !colaborador.ativo) {
          results.errors.push({
            email: colaboradorId,
            erro: "Colaborador não encontrado ou inativo",
          });
          continue;
        }

        // Invalidar magic links anteriores do mesmo ciclo
        await prisma.magicLink.updateMany({
          where: {
            colaboradorId,
            cicloAvaliacaoId,
            status: { in: ["PENDING", "SENT", "ACCESSED"] },
          },
          data: { status: "EXPIRED" },
        });

        // Gerar novo token seguro
        const token = nanoid(64);
        const expiresAt = addHours(new Date(), expirationHours);

        // Criar magic link
        const magicLink = await prisma.magicLink.create({
          data: {
            token,
            colaboradorId,
            cicloAvaliacaoId,
            expiresAt,
            status: "PENDING",
          },
        });

        // Enviar email
        const linkUrl = `${appUrl}/questionario/${token}`;
        const emailHtml = getMagicLinkEmailTemplate(
          colaborador.email,
          linkUrl,
          expiresAt
        );

        const emailResult = await sendEmail({
          to: colaborador.email,
          subject: "Questionário VIVAMENTE360 - Avaliação de Riscos Psicossociais",
          html: emailHtml,
        });

        if (emailResult.success) {
          // Atualizar status para SENT
          await prisma.magicLink.update({
            where: { id: magicLink.id },
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
          email: colaboradorId,
          erro: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro ao gerar magic links:", error);
    return NextResponse.json(
      { error: "Erro ao gerar magic links" },
      { status: 500 }
    );
  }
}
