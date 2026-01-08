import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar colaboradores
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar permissão (apenas RH e ADMIN podem listar todos)
    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const colaboradores = await prisma.colaborador.findMany({
      where: {
        empresaId: session.user.empresaId,
        ativo: true,
      },
      include: {
        unidade: true,
        setor: true,
        cargo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(colaboradores);
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

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
    const session = await getServerSession(authOptions);

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
