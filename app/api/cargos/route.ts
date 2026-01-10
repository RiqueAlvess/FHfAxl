import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar cargos (pode filtrar por setorId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const setorId = searchParams.get("setorId");

    const where: any = {
      ativo: true,
      setor: {
        unidade: {
          empresaId: session.user.empresaId,
        },
      },
    };

    if (setorId) {
      where.setorId = setorId;
    }

    const cargos = await prisma.cargo.findMany({
      where,
      select: {
        id: true,
        nome: true,
        setorId: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(cargos);
  } catch (error) {
    console.error("Erro ao buscar cargos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cargos" },
      { status: 500 }
    );
  }
}
