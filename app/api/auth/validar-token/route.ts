import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const validarTokenSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = validarTokenSchema.parse(body);

    // Buscar token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Validar token
    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: "Token inválido" },
        { status: 400 }
      );
    }

    // Verificar se token já foi usado
    if (resetToken.usado) {
      return NextResponse.json(
        { valid: false, error: "Este link já foi utilizado" },
        { status: 400 }
      );
    }

    // Verificar se token expirou
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "Token expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        user: {
          nome: resetToken.user.nome,
          email: resetToken.user.email,
        },
        expiresAt: resetToken.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao validar token:", error);
    return NextResponse.json(
      { valid: false, error: "Erro ao validar token" },
      { status: 500 }
    );
  }
}
