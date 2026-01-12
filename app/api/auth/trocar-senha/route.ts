import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { withRateLimit } from "@/lib/rate-limit-helpers";

const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { senhaAtual, novaSenha } = trocarSenhaSchema.parse(body);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar senha atual
    const isValidPassword = await compare(senhaAtual, user.senha);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Verificar se a nova senha é igual à senha atual
    const isSameAsCurrent = await compare(novaSenha, user.senha);
    if (isSameAsCurrent) {
      return NextResponse.json(
        {
          success: false,
          error: "A nova senha não pode ser igual à senha atual",
        },
        { status: 400 }
      );
    }

    // Verificar se a nova senha é igual a alguma das últimas 3 senhas
    const senhasAnteriores = user.senhasAnteriores || [];
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

    // Hash da nova senha
    const hashedPassword = await hash(novaSenha, 12);

    // Atualizar senha do usuário e histórico
    const novasSenhasAnteriores = [...senhasAnteriores, user.senha].slice(-3);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        senha: hashedPassword,
        senhasAnteriores: novasSenhasAnteriores,
        forcarTrocaSenha: false, // Remove flag de troca obrigatória
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Senha alterada com sucesso!",
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

    console.error("Erro ao trocar senha:", error);
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
