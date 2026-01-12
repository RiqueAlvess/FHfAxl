import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";
import { sendEmail, getPasswordResetEmailTemplate } from "@/lib/email";
import { withRateLimit } from "@/lib/rate-limit-helpers";

const recuperarSenhaSchema = z.object({
  email: z.string().email("Email inválido"),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = recuperarSenhaSchema.parse(body);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Não revelar se o usuário existe ou não (segurança)
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Se o email estiver cadastrado, você receberá um link de recuperação.",
        },
        { status: 200 }
      );
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Se o email estiver cadastrado, você receberá um link de recuperação.",
        },
        { status: 200 }
      );
    }

    // Gerar token único
    const token = randomBytes(32).toString("hex");

    // Criar registro de reset token (expira em 1 hora)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Gerar link de reset
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/redefinir-senha/${token}`;

    // Enviar email
    const emailHtml = getPasswordResetEmailTemplate(
      user.nome,
      resetLink,
      expiresAt
    );

    await sendEmail({
      to: user.email,
      subject: "Redefinir Senha - VIVAMENTE360",
      html: emailHtml,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Se o email estiver cadastrado, você receberá um link de recuperação.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao processar recuperação de senha:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

// Aplicar rate limiting (máximo 3 tentativas por 15 minutos)
export const POST = withRateLimit(handler, {
  limit: 3,
  window: 15 * 60 * 1000, // 15 minutos
});
