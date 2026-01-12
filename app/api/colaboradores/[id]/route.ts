import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateColaboradorSchema } from "@/types/colaborador";

// GET - Detalhes do colaborador (com histórico de magic links)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permissão
    if (session.user.role !== "RH" && session.user.role !== "ADMIN" && session.user.role !== "LIDERANCA") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const colaborador = await prisma.colaborador.findUnique({
      where: {
        id: (await params).id,
      },
      include: {
        unidade: true,
        setor: true,
        cargo: true,
        magicLinks: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            cicloAvaliacao: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!colaborador) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o colaborador pertence à empresa do usuário
    if (colaborador.empresaId !== session.user.empresaId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    return NextResponse.json(colaborador);
  } catch (error) {
    console.error("Erro ao buscar colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao buscar colaborador" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar colaborador
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Apenas RH e ADMIN podem editar
    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Verificar se colaborador existe e pertence à empresa
    const colaboradorExistente = await prisma.colaborador.findUnique({
      where: { id: (await params).id },
    });

    if (!colaboradorExistente) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      );
    }

    if (colaboradorExistente.empresaId !== session.user.empresaId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = await request.json();

    // Validar dados
    const validation = updateColaboradorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Se o email estiver sendo alterado, verificar se já existe
    if (data.email && data.email !== colaboradorExistente.email) {
      const emailExiste = await prisma.colaborador.findUnique({
        where: { email: data.email },
      });

      if (emailExiste) {
        return NextResponse.json(
          { error: "Este email já está cadastrado" },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (data.email) updateData.email = data.email;
    if (data.unidadeId) updateData.unidadeId = data.unidadeId;
    if (data.setorId) updateData.setorId = data.setorId;
    if (data.cargoId) updateData.cargoId = data.cargoId;
    if (data.sexo) updateData.sexo = data.sexo;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    if (data.dataNascimento !== undefined) {
      updateData.dataNascimento = data.dataNascimento
        ? new Date(data.dataNascimento)
        : null;
    }

    const colaborador = await prisma.colaborador.update({
      where: { id: (await params).id },
      data: updateData,
      include: {
        unidade: true,
        setor: true,
        cargo: true,
      },
    });

    return NextResponse.json(colaborador);
  } catch (error) {
    console.error("Erro ao atualizar colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar colaborador" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete do colaborador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Apenas RH e ADMIN podem deletar
    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Verificar se colaborador existe e pertence à empresa
    const colaborador = await prisma.colaborador.findUnique({
      where: { id: (await params).id },
    });

    if (!colaborador) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      );
    }

    if (colaborador.empresaId !== session.user.empresaId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Soft delete
    await prisma.colaborador.update({
      where: { id: (await params).id },
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
