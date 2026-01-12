import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const apenasNaoLidas = searchParams.get("apenasNaoLidas") === "true";

    const where: any = {
      userId: session.user.id,
    };

    if (apenasNaoLidas) {
      where.lida = false;
    }

    const notificacoes = await prisma.notificacao.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limitar a 50 notificações
    });

    const naoLidasCount = await prisma.notificacao.count({
      where: {
        userId: session.user.id,
        lida: false,
      },
    });

    return NextResponse.json({
      notificacoes,
      naoLidasCount,
    });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    );
  }
}
