import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/authorization";
import { importColaboradoresFromCsv } from "@/lib/csv-import";
import { withRateLimit } from "@/lib/rate-limit-helpers";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("[API Admin] Iniciando importação de CSV");

    const session = await auth();

    if (!session) {
      console.warn("[API Admin] Tentativa de importação sem autenticação");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem permissão de admin
    if (!canAccessAdminPanel(session)) {
      console.warn(
        `[API Admin] Usuário ${session.user.email} sem permissão de admin`
      );
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Aplicar rate limiting: 3 requisições por minuto
    const rateLimitCheck = await withRateLimit({
      limiterType: "csv-import",
      identifier: session.user.id,
      request,
      userId: session.user.id,
      auditDetails: { endpoint: "/api/admin/colaboradores/import-csv" },
    });

    if (rateLimitCheck) return rateLimitCheck;

    const body = await request.json();
    const { rows, empresaId } = body;

    // Validar empresaId
    if (!empresaId) {
      return NextResponse.json(
        { error: "empresaId é obrigatório" },
        { status: 400 }
      );
    }

    // Validações
    if (!rows || !Array.isArray(rows)) {
      console.error("[API Admin] Dados inválidos recebidos");
      return NextResponse.json(
        { error: "Dados inválidos: esperado um array de linhas" },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      console.warn("[API Admin] Arquivo CSV vazio");
      return NextResponse.json(
        { error: "Arquivo CSV vazio" },
        { status: 400 }
      );
    }

    if (rows.length > 5000) {
      console.warn(`[API Admin] Limite excedido: ${rows.length} linhas`);
      return NextResponse.json(
        { error: `Limite de 5.000 linhas excedido (recebido: ${rows.length})` },
        { status: 400 }
      );
    }

    console.log(
      `[API Admin] Importando ${rows.length} linhas para empresa ${empresaId}`
    );

    const result = await importColaboradoresFromCsv(rows, empresaId);

    const duration = Date.now() - startTime;
    console.log(
      `[API Admin] Importação finalizada em ${duration}ms: ${result.success} sucessos, ${result.errors.length} erros`
    );

    return NextResponse.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API Admin] Erro ao importar CSV após ${duration}ms:`, error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao importar CSV",
      },
      { status: 500 }
    );
  }
}
