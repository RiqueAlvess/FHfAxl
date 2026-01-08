import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: {
        colaborador: true,
        resposta: true,
      },
    });

    if (!magicLink) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    // Verificar se já foi completado
    if (magicLink.status === "COMPLETED" || magicLink.resposta) {
      return NextResponse.json({
        valid: false,
        completed: true,
      });
    }

    // Verificar se expirou
    if (magicLink.expiresAt < new Date() || magicLink.status === "EXPIRED") {
      return NextResponse.json({
        valid: false,
        expired: true,
      });
    }

    // Atualizar status para ACCESSED (primeira vez)
    if (magicLink.status === "SENT" || magicLink.status === "PENDING") {
      await prisma.magicLink.update({
        where: { id: magicLink.id },
        data: {
          status: "ACCESSED",
          accessedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      valid: true,
      colaboradorEmail: magicLink.colaborador.email,
    });
  } catch (error) {
    console.error("Erro ao validar magic link:", error);
    return NextResponse.json(
      { valid: false, error: "Erro ao validar link" },
      { status: 500 }
    );
  }
}
