import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { importColaboradoresFromCsv } from "@/lib/csv-import";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!session.user.empresaId) {
      return NextResponse.json({ error: "Usuário sem empresa vinculada" }, { status: 403 });
    }

    const body = await request.json();
    const { rows } = body;

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const result = await importColaboradoresFromCsv(rows, session.user.empresaId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao importar CSV:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao importar CSV"
      },
      { status: 500 }
    );
  }
}
