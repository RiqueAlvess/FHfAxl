import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { importColaboradoresFromCsv } from "@/lib/csv-import";
import { withRateLimit } from "@/lib/rate-limit-helpers";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("[API] Iniciando importação de CSV");

    const session = await auth();

    if (!session) {
      console.warn("[API] Tentativa de importação sem autenticação");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      console.warn(
        `[API] Usuário ${session.user.email} sem permissão (role: ${session.user.role})`
      );
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!session.user.empresaId) {
      console.error("[API] Usuário sem empresa vinculada");
      return NextResponse.json(
        { error: "Usuário sem empresa vinculada" },
        { status: 403 }
      );
    }

    // Aplicar rate limiting: 3 requisições por minuto
    const rateLimitCheck = await withRateLimit({
      limiterType: "csv-import",
      identifier: session.user.id,
      request,
      userId: session.user.id,
      auditDetails: { endpoint: "/api/colaboradores/import-csv" },
    });

    if (rateLimitCheck) return rateLimitCheck;

    const body = await request.json();
    const { rows } = body;

    // Validações
    if (!rows || !Array.isArray(rows)) {
      console.error("[API] Dados inválidos recebidos");
      return NextResponse.json(
        { error: "Dados inválidos: esperado um array de linhas" },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      console.warn("[API] Arquivo CSV vazio");
      return NextResponse.json(
        { error: "Arquivo CSV vazio" },
        { status: 400 }
      );
    }

    if (rows.length > 5000) {
      console.warn(`[API] Limite excedido: ${rows.length} linhas`);
      return NextResponse.json(
        { error: `Limite de 5.000 linhas excedido (recebido: ${rows.length})` },
        { status: 400 }
      );
    }

    console.log(
      `[API] Importando ${rows.length} linhas para empresa ${session.user.empresaId}`
    );

    const result = await importColaboradoresFromCsv(rows, session.user.empresaId);

    const duration = Date.now() - startTime;
    console.log(
      `[API] Importação finalizada em ${duration}ms: ${result.success} sucessos, ${result.errors.length} erros`
    );

    return NextResponse.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] Erro ao importar CSV após ${duration}ms:`, error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao importar CSV",
      },
      { status: 500 }
    );
  }
}
