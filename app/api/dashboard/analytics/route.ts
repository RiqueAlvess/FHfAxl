import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  calcularKPIs,
  getDistribuicaoRisco,
  getScoresPorDimensao,
} from "@/lib/dashboard-analytics";
import { verificarKAnonymity, getMensagemKAnonymityNaoAtendido } from "@/lib/k-anonymity";
import { registrarVisualizacaoAnalytics, registrarBloqueioKAnonymity } from "@/lib/audit-log";
import { addPrivacyHeaders } from "@/lib/k-anonymity-middleware";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem empresaId
    if (!session.user.empresaId) {
      return NextResponse.json(
        {
          error: "Empresa não associada",
          message: "Usuário não está associado a nenhuma empresa. Entre em contato com o administrador."
        },
        { status: 400 }
      );
    }

    // Extrair filtros dos query params
    const { searchParams } = new URL(request.url);
    const filtros = {
      unidadeId: searchParams.get('unidadeId') || undefined,
      setorId: searchParams.get('setorId') || undefined,
      cargoId: searchParams.get('cargoId') || undefined,
      cicloAvaliacaoId: searchParams.get('cicloAvaliacaoId') || undefined,
    };

    // Verificar K-Anonymity com os filtros
    const resultado = await verificarKAnonymity(session.user.empresaId, filtros);

    if (!resultado.passed) {
      // Registrar bloqueio para auditoria
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                       request.headers.get('x-real-ip') ||
                       'unknown';

      await registrarBloqueioKAnonymity(
        session.user.id,
        session.user.empresaId,
        filtros,
        resultado.count,
        resultado.minRequired,
        ipAddress
      );

      return NextResponse.json({
        error: "K_ANONYMITY_NAO_ATENDIDO",
        message: getMensagemKAnonymityNaoAtendido(resultado.count),
        kAnonymity: false,
        count: resultado.count,
        minRequired: resultado.minRequired,
      }, { status: 403 });
    }

    // Registrar visualização para auditoria
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    await registrarVisualizacaoAnalytics(
      session.user.id,
      session.user.empresaId,
      filtros,
      resultado.count,
      ipAddress
    );

    // Buscar dados (com filtros se fornecidos)
    const [kpis, distribuicao, scoresDimensoes] = await Promise.all([
      calcularKPIs(session.user.empresaId, filtros),
      getDistribuicaoRisco(session.user.empresaId, filtros),
      getScoresPorDimensao(session.user.empresaId, filtros),
    ]);

    const response = NextResponse.json({
      kAnonymity: true,
      respondentes: resultado.count,
      kpis,
      distribuicao,
      scoresDimensoes,
    });

    // Adicionar headers de privacidade
    return addPrivacyHeaders(response);
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de analytics" },
      { status: 500 }
    );
  }
}
