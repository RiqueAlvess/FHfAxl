import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { importColaboradoresFromCsv } from "@/lib/csv-import";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
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
