import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit-helpers";

// GET - Listar colaboradores (com filtros e paginação)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar permissão (apenas RH, ADMIN e LIDERANCA podem listar)
    if (session.user.role !== "RH" && session.user.role !== "ADMIN" && session.user.role !== "LIDERANCA") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Aplicar rate limiting: 60 requisições por minuto
    const rateLimitCheck = await withRateLimit({
      limiterType: "api-read",
      identifier: session.user.id,
      request,
      userId: session.user.id,
      auditDetails: { endpoint: "/api/colaboradores", method: "GET" },
    });

    if (rateLimitCheck) return rateLimitCheck;

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get("busca") || "";
    const unidadeId = searchParams.get("unidadeId") || "";
    const setorId = searchParams.get("setorId") || "";
    const cargoId = searchParams.get("cargoId") || "";
    const status = searchParams.get("status") || "todos";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");

    // Construir filtros
    const where: any = {
      empresaId: session.user.empresaId,
    };

    // Filtro de status
    if (status === "ativo") {
      where.ativo = true;
    } else if (status === "inativo") {
      where.ativo = false;
    }
    // Se status === "todos", não filtra por ativo

    // Filtro de busca por email
    if (busca) {
      where.email = {
        contains: busca,
        mode: "insensitive",
      };
    }

    // Filtros por estrutura organizacional
    if (unidadeId) {
      where.unidadeId = unidadeId;
    }

    if (setorId) {
      where.setorId = setorId;
    }

    if (cargoId) {
      where.cargoId = cargoId;
    }

    // Aplicar filtro de LIDERANCA se for o caso
    if (session.user.role === "LIDERANCA") {
      if (session.user.setorId) {
        where.setorId = session.user.setorId;
      } else if (session.user.unidadeId) {
        where.unidadeId = session.user.unidadeId;
      }
    }

    // Calcular paginação
    const skip = (page - 1) * limit;

    // Buscar total e colaboradores
    const [total, colaboradores] = await Promise.all([
      prisma.colaborador.count({ where }),
      prisma.colaborador.findMany({
        where,
        include: {
          unidade: true,
          setor: true,
          cargo: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    // Retornar com metadados de paginação
    return NextResponse.json({
      data: colaboradores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar colaboradores" },
      { status: 500 }
    );
  }
}

// POST - Criar colaborador individual
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
      return NextResponse.json({ error: "Usuário não está vinculado a uma empresa" }, { status: 400 });
    }

    // Aplicar rate limiting: 30 requisições por minuto
    const rateLimitCheck = await withRateLimit({
      limiterType: "api-write",
      identifier: session.user.id,
      request,
      userId: session.user.id,
      auditDetails: { endpoint: "/api/colaboradores", method: "POST" },
    });

    if (rateLimitCheck) return rateLimitCheck;

    const body = await request.json();

    const colaborador = await prisma.colaborador.create({
      data: {
        email: body.email,
        empresaId: session.user.empresaId,
        unidadeId: body.unidadeId,
        setorId: body.setorId,
        cargoId: body.cargoId,
        dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
        sexo: body.sexo || "NAO_INFORMADO",
      },
      include: {
        unidade: true,
        setor: true,
        cargo: true,
      },
    });

    return NextResponse.json(colaborador, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao criar colaborador" },
      { status: 500 }
    );
  }
}

// DELETE - Desativar colaborador (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    await prisma.colaborador.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desativar colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao desativar colaborador" },
      { status: 500 }
    );
  }
}
