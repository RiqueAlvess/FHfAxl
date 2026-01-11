import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { limparArquivosExpirados, listarArquivosTemporarios } from "@/lib/reports/cleanup-service";

/**
 * GET - Lista arquivos temporários
 * Apenas para ADMIN
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas ADMIN pode listar arquivos
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const arquivos = await listarArquivosTemporarios();

    return NextResponse.json({
      sucesso: true,
      arquivos,
      total: arquivos.length,
      expirados: arquivos.filter((a) => a.expirado).length,
    });
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao listar arquivos" },
      { status: 500 }
    );
  }
}

/**
 * POST - Executa limpeza de arquivos expirados
 * Pode ser chamado por ADMIN ou via cron job (com token)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se é uma chamada via cron (com token)
    const authHeader = request.headers.get("authorization");
    const cronToken = process.env.CRON_SECRET;

    if (authHeader && cronToken && authHeader === `Bearer ${cronToken}`) {
      // Executar limpeza via cron
      const resultado = await limparArquivosExpirados();
      return NextResponse.json({
        sucesso: true,
        ...resultado,
        fonte: "cron",
      });
    }

    // Verificar autenticação normal
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas ADMIN pode executar limpeza manual
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const resultado = await limparArquivosExpirados();

    return NextResponse.json({
      sucesso: true,
      ...resultado,
      fonte: "manual",
    });
  } catch (error) {
    console.error("Erro ao limpar arquivos:", error);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao limpar arquivos" },
      { status: 500 }
    );
  }
}
