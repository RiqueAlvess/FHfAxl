import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const notificacao = await prisma.notificacao.findUnique({
      where: { id: params.id },
    });

    if (!notificacao) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se a notificação pertence ao usuário
    if (notificacao.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    // Marcar como lida
    const notificacaoAtualizada = await prisma.notificacao.update({
      where: { id: params.id },
      data: { lida: true },
    });

    return NextResponse.json(notificacaoAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar notificação" },
      { status: 500 }
    );
  }
}
