import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { withRateLimit } from "@/lib/rate-limit-helpers";

const redefinirSenhaSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  novaSenha: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter letras maiúsculas, minúsculas e números"
    ),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, novaSenha } = redefinirSenhaSchema.parse(body);

    // Buscar token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Validar token
    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Verificar se token já foi usado
    if (resetToken.usado) {
      return NextResponse.json(
        { success: false, error: "Este link já foi utilizado" },
        { status: 400 }
      );
    }

    // Verificar se token expirou
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { success: false, error: "Token expirado. Solicite um novo link." },
        { status: 400 }
      );
    }

    // Verificar se a nova senha é igual a alguma das últimas 3 senhas
    const senhasAnteriores = resetToken.user.senhasAnteriores || [];
    const ultimasTresSenhas = senhasAnteriores.slice(-3);

    for (const senhaAntiga of ultimasTresSenhas) {
      const isSame = await compare(novaSenha, senhaAntiga);
      if (isSame) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A nova senha não pode ser igual a nenhuma das suas últimas 3 senhas",
          },
          { status: 400 }
        );
      }
    }

    // Verificar se a nova senha é igual à senha atual
    const isSameAsCurrent = await compare(novaSenha, resetToken.user.senha);
    if (isSameAsCurrent) {
      return NextResponse.json(
        {
          success: false,
          error: "A nova senha não pode ser igual à senha atual",
        },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(novaSenha, 12);

    // Atualizar senha do usuário e histórico
    const novasSenhasAnteriores = [
      ...senhasAnteriores,
      resetToken.user.senha,
    ].slice(-3);

    await prisma.user.update({
      where: { id: resetToken.user.id },
      data: {
        senha: hashedPassword,
        senhasAnteriores: novasSenhasAnteriores,
        forcarTrocaSenha: false, // Remove flag de troca obrigatória se existir
      },
    });

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usado: true,
        usedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Senha redefinida com sucesso!",
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

    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

// Aplicar rate limiting (máximo 5 tentativas por 15 minutos)
export const POST = withRateLimit(handler, {
  limit: 5,
  window: 15 * 60 * 1000, // 15 minutos
});
