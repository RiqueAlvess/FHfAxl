import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarPDF } from "@/lib/reports/pdf-generator";
import * as reportService from "@/lib/reports/report-data-service";
import type { GerarRelatorioRequest } from "@/types/reports";
import { readFile } from "fs/promises";
import { withRateLimit } from "@/lib/rate-limit-helpers";

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

    // Aplicar rate limiting: 2 requisições por minuto
    const rateLimitCheck = await withRateLimit({
      limiterType: "pdf-report",
      identifier: session.user.id,
      request,
      userId: session.user.id,
      auditDetails: { endpoint: "/api/relatorios/pdf" },
    });

    if (rateLimitCheck) return rateLimitCheck;

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

    // Verificar K-Anonymity com filtros
    const { verificarKAnonymity, getMensagemKAnonymityNaoAtendido } = await import("@/lib/k-anonymity");
    const filtrosKAnonymity = {
      unidadeId: filtros.unidadeId,
      setorId: filtros.setorId,
      cargoId: filtros.cargoId,
      cicloAvaliacaoId: filtros.cicloAvaliacaoId,
    };

    const resultado = await verificarKAnonymity(filtros.empresaId, filtrosKAnonymity);

    if (!resultado.passed) {
      return NextResponse.json(
        {
          error: "K_ANONYMITY_NAO_ATENDIDO",
          message: getMensagemKAnonymityNaoAtendido(resultado.count),
          count: resultado.count,
          minRequired: resultado.minRequired,
        },
        { status: 403 }
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

    // Gerar PDF
    const { caminhoArquivo, nomeArquivo } = await gerarPDF(dadosRelatorio);

    // Ler arquivo para retornar
    const arquivoBuffer = await readFile(caminhoArquivo);
    const base64 = arquivoBuffer.toString("base64");

    // Registrar auditoria usando o novo sistema
    const { registrarGeracaoRelatorio } = await import("@/lib/audit-log");
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    await registrarGeracaoRelatorio(
      session.user.id,
      filtros.tipoRelatorio,
      {
        empresaId: filtros.empresaId,
        unidadeId: filtros.unidadeId,
        setorId: filtros.setorId,
        cargoId: filtros.cargoId,
        cicloAvaliacaoId: filtros.cicloAvaliacaoId,
      },
      "PDF",
      ipAddress
    );

    // Definir expiração (1 hora)
    const expiracaoUrl = new Date();
    expiracaoUrl.setHours(expiracaoUrl.getHours() + 1);

    return NextResponse.json({
      sucesso: true,
      arquivoNome: nomeArquivo,
      arquivoBase64: base64,
      expiracaoUrl,
      mensagem: "Relatório PDF gerado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao gerar relatório PDF:", error);
    return NextResponse.json(
      {
        sucesso: false,
        erro: error instanceof Error ? error.message : "Erro ao gerar relatório PDF",
      },
      { status: 500 }
    );
  }
}
