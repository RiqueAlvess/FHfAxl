import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateCicloRequest {
  nome?: string;
  dataInicio?: string;
  dataFim?: string;
  ativo?: boolean;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body: UpdateCicloRequest = await request.json();

    // Verificar se o ciclo existe e pertence à empresa do usuário
    const cicloExistente = await prisma.cicloAvaliacao.findFirst({
      where: {
        id,
        empresaId: session.user.empresaId,
      },
    });

    if (!cicloExistente) {
      return NextResponse.json(
        { error: "Ciclo não encontrado" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (body.nome !== undefined) {
      updateData.nome = body.nome;
    }

    if (body.dataInicio !== undefined) {
      updateData.dataInicio = new Date(body.dataInicio);
    }

    if (body.dataFim !== undefined) {
      updateData.dataFim = new Date(body.dataFim);
    }

    if (body.ativo !== undefined) {
      updateData.ativo = body.ativo;
    }

    // Validar datas se ambas foram fornecidas
    const dataInicio = updateData.dataInicio || cicloExistente.dataInicio;
    const dataFim = updateData.dataFim || cicloExistente.dataFim;

    if (dataInicio >= dataFim) {
      return NextResponse.json(
        { error: "Data de início deve ser anterior à data de fim" },
        { status: 400 }
      );
    }

    const cicloAtualizado = await prisma.cicloAvaliacao.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            magicLinks: true,
            respostas: true,
          },
        },
      },
    });

    return NextResponse.json(cicloAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar ciclo:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ciclo de avaliação" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!session.user.empresaId) {
      return NextResponse.json(
        { error: "Usuário não vinculado a uma empresa" },
        { status: 400 }
      );
    }

    const { id } = params;

    // Verificar se o ciclo existe e pertence à empresa do usuário
    const cicloExistente = await prisma.cicloAvaliacao.findFirst({
      where: {
        id,
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

    if (!cicloExistente) {
      return NextResponse.json(
        { error: "Ciclo não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se há respostas vinculadas
    if (cicloExistente._count.respostas > 0) {
      return NextResponse.json(
        {
          error: "Não é possível deletar um ciclo com respostas vinculadas",
        },
        { status: 400 }
      );
    }

    // Deletar magic links primeiro (cascade)
    await prisma.magicLink.deleteMany({
      where: { cicloAvaliacaoId: id },
    });

    // Deletar ciclo
    await prisma.cicloAvaliacao.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar ciclo:", error);
    return NextResponse.json(
      { error: "Erro ao deletar ciclo de avaliação" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const ciclo = await prisma.cicloAvaliacao.findFirst({
      where: {
        id,
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

    if (!ciclo) {
      return NextResponse.json(
        { error: "Ciclo não encontrado" },
        { status: 404 }
      );
    }

    // Adicionar estatísticas de magic links por status
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

    stats.forEach((stat) => {
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

    return NextResponse.json({
      ...ciclo,
      stats: statusMap,
    });
  } catch (error) {
    console.error("Erro ao buscar ciclo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ciclo de avaliação" },
      { status: 500 }
    );
  }
}
