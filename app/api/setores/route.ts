import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar setores (pode filtrar por unidadeId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unidadeId = searchParams.get("unidadeId");

    const where: any = {
      ativo: true,
      unidade: {
        empresaId: session.user.empresaId,
      },
    };

    if (unidadeId) {
      where.unidadeId = unidadeId;
    }

    const setores = await prisma.setor.findMany({
      where,
      select: {
        id: true,
        nome: true,
        unidadeId: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(setores);
  } catch (error) {
    console.error("Erro ao buscar setores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar setores" },
      { status: 500 }
    );
  }
}
