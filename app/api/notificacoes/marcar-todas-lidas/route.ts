import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Marcar todas as notificações do usuário como lidas
    await prisma.notificacao.updateMany({
      where: {
        userId: session.user.id,
        lida: false,
      },
      data: {
        lida: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
