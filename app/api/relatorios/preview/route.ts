import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as reportService from "@/lib/reports/report-data-service";
import type { PreviewRelatorioRequest } from "@/types/reports";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem permissão (apenas RH e ADMIN)
    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas RH e ADMIN podem visualizar relatórios." },
        { status: 403 }
      );
    }

    const body: PreviewRelatorioRequest = await request.json();
    const { filtros } = body;

    // Validar empresaId
    if (!filtros.empresaId) {
      return NextResponse.json(
        { error: "empresaId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem acesso à empresa
    if (session.user.role === "RH" && session.user.empresaId !== filtros.empresaId) {
      return NextResponse.json(
        { error: "Acesso negado a esta empresa" },
        { status: 403 }
      );
    }

    // Verificar K-Anonymity
    const { verificarKAnonymity } = await import("@/lib/dashboard-analytics");
    const temDadosSuficientes = await verificarKAnonymity(filtros.empresaId);

    if (!temDadosSuficientes) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Dados insuficientes para gerar preview",
          mensagem: "Mínimo de 5 respondentes necessário (K-Anonymity)",
        },
        { status: 400 }
      );
    }

    // Gerar dados do relatório baseado no tipo
    let dadosRelatorio;

    switch (filtros.tipoRelatorio) {
      case "executivo":
        dadosRelatorio = await reportService.gerarDadosRelatorioExecutivo(filtros);
        break;
      case "completo":
        dadosRelatorio = await reportService.gerarDadosRelatorioCompleto(filtros);
        break;
      case "unidade":
      case "setor":
        dadosRelatorio = await reportService.gerarDadosRelatorioUnidadeSetor(filtros);
        break;
      case "evolucao":
        dadosRelatorio = await reportService.gerarDadosRelatorioEvolucao(filtros);
        break;
      default:
        return NextResponse.json(
          {
            sucesso: false,
            erro: "Tipo de relatório inválido",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      sucesso: true,
      dados: dadosRelatorio,
    });
  } catch (error) {
    console.error("Erro ao gerar preview do relatório:", error);
    return NextResponse.json(
      {
        sucesso: false,
        erro: error instanceof Error ? error.message : "Erro ao gerar preview do relatório",
      },
      { status: 500 }
    );
  }
}
