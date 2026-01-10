import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!session.user.empresaId) {
      return NextResponse.json(
        { error: "Usuário não vinculado a uma empresa" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cicloAvaliacaoId = searchParams.get("cicloAvaliacaoId");
    const colaboradorId = searchParams.get("colaboradorId");
    const status = searchParams.get("status");

    const whereClause: any = {
      colaborador: {
        empresaId: session.user.empresaId,
      },
    };

    if (cicloAvaliacaoId) {
      whereClause.cicloAvaliacaoId = cicloAvaliacaoId;
    }

    if (colaboradorId) {
      whereClause.colaboradorId = colaboradorId;
    }

    if (status) {
      whereClause.status = status;
    }

    const magicLinks = await prisma.magicLink.findMany({
      where: whereClause,
      include: {
        colaborador: {
          select: {
            id: true,
            email: true,
            unidade: {
              select: {
                id: true,
                nome: true,
              },
            },
            setor: {
              select: {
                id: true,
                nome: true,
              },
            },
            cargo: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        cicloAvaliacao: {
          select: {
            id: true,
            nome: true,
            dataInicio: true,
            dataFim: true,
            ativo: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    // Verificar se há expirados que precisam ser atualizados
    const now = new Date();
    const magicLinksAtualizados = await Promise.all(
      magicLinks.map(async (link) => {
        if (
          link.status !== "COMPLETED" &&
          link.status !== "EXPIRED" &&
          link.expiresAt < now
        ) {
          // Atualizar status para expirado
          const updated = await prisma.magicLink.update({
            where: { id: link.id },
            data: { status: "EXPIRED" },
          });
          return { ...link, status: updated.status };
        }
        return link;
      })
    );

    return NextResponse.json(magicLinksAtualizados);
  } catch (error) {
    console.error("Erro ao buscar status de magic links:", error);
    return NextResponse.json(
      { error: "Erro ao buscar status de magic links" },
      { status: 500 }
    );
  }
}
