import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar unidades da empresa
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const unidades = await prisma.unidade.findMany({
      where: {
        empresaId: session.user.empresaId,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(unidades);
  } catch (error) {
    console.error("Erro ao buscar unidades:", error);
    return NextResponse.json(
      { error: "Erro ao buscar unidades" },
      { status: 500 }
    );
  }
}
