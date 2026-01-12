import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit-helpers";

interface CreateCicloRequest {
  nome: string;
  dataInicio: string;
  dataFim: string;
  ativo?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!session.user.empresaId) {
      return NextResponse.json(
        { error: "Usuário não vinculado a uma empresa" },
        { status: 400 }
      );
    }

    // Aplicar rate limiting: 30 requisições por minuto
    const rateLimitCheck = await withRateLimit({
      limiterType: "api-write",
      identifier: session.user.id,
      request,
      userId: session.user.id,
      auditDetails: { endpoint: "/api/ciclos", method: "POST" },
    });

    if (rateLimitCheck) return rateLimitCheck;

    const body: CreateCicloRequest = await request.json();
    const { nome, dataInicio, dataFim, ativo = false } = body;

    if (!nome || !dataInicio || !dataFim) {
      return NextResponse.json(
        { error: "Nome, data de início e data de fim são obrigatórios" },
        { status: 400 }
      );
    }

    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);

    if (dataInicioDate >= dataFimDate) {
      return NextResponse.json(
        { error: "Data de início deve ser anterior à data de fim" },
        { status: 400 }
      );
    }

    const ciclo = await prisma.cicloAvaliacao.create({
      data: {
        nome,
        dataInicio: dataInicioDate,
        dataFim: dataFimDate,
        ativo,
        empresaId: session.user.empresaId,
      },
      include: {
        _count: {
          select: {
            magicLinks: true,
            respostas: true,
          },
        },
      },
    });

    return NextResponse.json(ciclo);
  } catch (error) {
    console.error("Erro ao criar ciclo:", error);
    return NextResponse.json(
      { error: "Erro ao criar ciclo de avaliação" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!session.user.empresaId) {
      return NextResponse.json(
        { error: "Usuário não vinculado a uma empresa" },
        { status: 400 }
      );
    }

    // Aplicar rate limiting: 60 requisições por minuto
    const rateLimitCheck = await withRateLimit({
      limiterType: "api-read",
      identifier: session.user.id,
      request,
      userId: session.user.id,
      auditDetails: { endpoint: "/api/ciclos", method: "GET" },
    });

    if (rateLimitCheck) return rateLimitCheck;

    const { searchParams } = new URL(request.url);
    const ativo = searchParams.get("ativo");

    const whereClause: any = {
      empresaId: session.user.empresaId,
    };

    if (ativo !== null) {
      whereClause.ativo = ativo === "true";
    }

    const ciclos = await prisma.cicloAvaliacao.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            magicLinks: true,
            respostas: true,
          },
        },
      },
      orderBy: {
        dataInicio: "desc",
      },
    });

    // Adicionar estatísticas de magic links por status
    const ciclosComStats = await Promise.all(
      ciclos.map(async (ciclo: any) => {
        const stats = await prisma.magicLink.groupBy({
          by: ["status"],
          where: {
            cicloAvaliacaoId: ciclo.id,
          },
          _count: true,
        });

        const statusMap = {
          enviados: 0,
          acessados: 0,
          completados: 0,
          pendentes: 0,
          expirados: 0,
        };

        stats.forEach((stat: any) => {
          switch (stat.status) {
            case "SENT":
              statusMap.enviados = stat._count;
              break;
            case "ACCESSED":
              statusMap.acessados = stat._count;
              break;
            case "COMPLETED":
              statusMap.completados = stat._count;
              break;
            case "PENDING":
              statusMap.pendentes = stat._count;
              break;
            case "EXPIRED":
              statusMap.expirados = stat._count;
              break;
          }
        });

        return {
          ...ciclo,
          stats: statusMap,
        };
      })
    );

    return NextResponse.json(ciclosComStats);
  } catch (error) {
    console.error("Erro ao listar ciclos:", error);
    return NextResponse.json(
      { error: "Erro ao listar ciclos de avaliação" },
      { status: 500 }
    );
  }
}
