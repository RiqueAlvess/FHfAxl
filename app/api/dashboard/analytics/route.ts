import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  calcularKPIs,
  getDistribuicaoRisco,
  getScoresPorDimensao,
  verificarKAnonymity,
} from "@/lib/dashboard-analytics";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar K-Anonymity
    const temDadosSuficientes = await verificarKAnonymity(session.user.empresaId);

    if (!temDadosSuficientes) {
      return NextResponse.json({
        error: "Dados insuficientes",
        message: "Mínimo de 5 respondentes necessário para exibir análises (K-Anonymity)",
        kAnonymity: false,
      });
    }

    // Buscar dados
    const [kpis, distribuicao, scoresDimensoes] = await Promise.all([
      calcularKPIs(session.user.empresaId),
      getDistribuicaoRisco(session.user.empresaId),
      getScoresPorDimensao(session.user.empresaId),
    ]);

    return NextResponse.json({
      kAnonymity: true,
      kpis,
      distribuicao,
      scoresDimensoes,
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de analytics" },
      { status: 500 }
    );
  }
}
