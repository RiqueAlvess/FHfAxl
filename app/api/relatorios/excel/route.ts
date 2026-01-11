import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarExcel } from "@/lib/reports/excel-generator";
import * as reportService from "@/lib/reports/report-data-service";
import type { GerarRelatorioRequest } from "@/types/reports";
import { readFile } from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem permissão (apenas RH e ADMIN)
    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas RH e ADMIN podem gerar relatórios." },
        { status: 403 }
      );
    }

    const body: GerarRelatorioRequest = await request.json();
    const { filtros, configuracao } = body;

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
          error: "Dados insuficientes para gerar relatório",
          message: "Mínimo de 5 respondentes necessário (K-Anonymity)",
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
          { error: "Tipo de relatório inválido" },
          { status: 400 }
        );
    }

    // Gerar Excel
    const { caminhoArquivo, nomeArquivo } = await gerarExcel(dadosRelatorio);

    // Ler arquivo para retornar
    const arquivoBuffer = await readFile(caminhoArquivo);
    const base64 = arquivoBuffer.toString("base64");

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        acao: "EXPORT",
        entidade: "Relatorio",
        detalhes: JSON.stringify({
          tipo: filtros.tipoRelatorio,
          formato: "excel",
          empresaId: filtros.empresaId,
          unidadeId: filtros.unidadeId,
          setorId: filtros.setorId,
        }),
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Definir expiração (1 hora)
    const expiracaoUrl = new Date();
    expiracaoUrl.setHours(expiracaoUrl.getHours() + 1);

    return NextResponse.json({
      sucesso: true,
      arquivoNome: nomeArquivo,
      arquivoBase64: base64,
      expiracaoUrl,
      mensagem: "Relatório Excel gerado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao gerar relatório Excel:", error);
    return NextResponse.json(
      {
        sucesso: false,
        erro: error instanceof Error ? error.message : "Erro ao gerar relatório Excel",
      },
      { status: 500 }
    );
  }
}
