import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/authorization";
import {
  calcularKPIs,
  getDistribuicaoRisco,
  getScoresPorDimensao,
} from "@/lib/dashboard-analytics";
import { getCached, CacheKeys } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem permissão de admin
    if (!canAccessAdminPanel(session)) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    // Extrair empresaId dos query params
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json(
        { error: "empresaId é obrigatório" },
        { status: 400 }
      );
    }

    // Cache de 5 minutos para melhorar performance
    const cacheKey = CacheKeys.analytics(empresaId, 'all');

    const analyticsData = await getCached(
      cacheKey,
      async () => {
        const [kpis, distribuicao, scoresDimensoes] = await Promise.all([
          calcularKPIs(empresaId),
          getDistribuicaoRisco(empresaId),
          getScoresPorDimensao(empresaId),
        ]);
        return { kpis, distribuicao, scoresDimensoes };
      },
      300 // 5 minutos
    );

    const { kpis, distribuicao, scoresDimensoes } = analyticsData;

    return NextResponse.json({
      kpis,
      distribuicao,
      scoresDimensoes,
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard admin:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do dashboard" },
      { status: 500 }
    );
  }
}
