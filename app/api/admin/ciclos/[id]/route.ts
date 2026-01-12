import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';

const updateCicloSchema = z.object({
  nome: z.string().min(3).optional(),
  dataInicio: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de início inválida').optional(),
  dataFim: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de fim inválida').optional(),
  ativo: z.boolean().optional(),
});

// GET - Buscar ciclo por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'RH')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await params;

    const ciclo = await prisma.cicloAvaliacao.findUnique({
      where: { id },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
          },
        },
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
        { error: 'Ciclo não encontrado' },
        { status: 404 }
      );
    }

    // Se for RH, validar que o ciclo pertence à sua empresa
    if (session.user.role === 'RH' && ciclo.empresaId !== session.user.empresaId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    await createAuditLog(
      session.user.id,
      'READ',
      'CicloAvaliacao',
      id,
      req
    );

    return NextResponse.json(ciclo);
  } catch (error) {
    console.error('Erro ao buscar ciclo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ciclo' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar ciclo
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'RH')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateCicloSchema.parse(body);

    // Verificar se ciclo existe
    const cicloExistente = await prisma.cicloAvaliacao.findUnique({
      where: { id },
    });

    if (!cicloExistente) {
      return NextResponse.json(
        { error: 'Ciclo não encontrado' },
        { status: 404 }
      );
    }

    // Se for RH, validar que o ciclo pertence à sua empresa
    if (session.user.role === 'RH' && cicloExistente.empresaId !== session.user.empresaId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (data.nome) updateData.nome = data.nome;
    if (data.dataInicio) updateData.dataInicio = new Date(data.dataInicio);
    if (data.dataFim) updateData.dataFim = new Date(data.dataFim);
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    // Validar datas se ambas forem fornecidas
    const dataInicio = data.dataInicio ? new Date(data.dataInicio) : cicloExistente.dataInicio;
    const dataFim = data.dataFim ? new Date(data.dataFim) : cicloExistente.dataFim;

    if (dataFim <= dataInicio) {
      return NextResponse.json(
        { error: 'Data de fim deve ser posterior à data de início' },
        { status: 400 }
      );
    }

    // Atualizar ciclo
    const ciclo = await prisma.cicloAvaliacao.update({
      where: { id },
      data: updateData,
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            magicLinks: true,
            respostas: true,
          },
        },
      },
    });

    await createAuditLog(
      session.user.id,
      'UPDATE',
      'CicloAvaliacao',
      id,
      req,
      { changes: data }
    );

    return NextResponse.json(ciclo);
  } catch (error) {
    console.error('Erro ao atualizar ciclo:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar ciclo' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar ciclo (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'RH')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await params;

    // Verificar se ciclo existe
    const ciclo = await prisma.cicloAvaliacao.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            respostas: true,
          },
        },
      },
    });

    if (!ciclo) {
      return NextResponse.json(
        { error: 'Ciclo não encontrado' },
        { status: 404 }
      );
    }

    // Se for RH, validar que o ciclo pertence à sua empresa
    if (session.user.role === 'RH' && ciclo.empresaId !== session.user.empresaId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Verificar se há respostas associadas
    if (ciclo._count.respostas > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível desativar um ciclo com respostas associadas',
          details: {
            respostas: ciclo._count.respostas,
          },
        },
        { status: 400 }
      );
    }

    // Soft delete: apenas marcar como inativo
    await prisma.cicloAvaliacao.update({
      where: { id },
      data: { ativo: false },
    });

    await createAuditLog(
      session.user.id,
      'DELETE',
      'CicloAvaliacao',
      id,
      req,
      {
        nome: ciclo.nome,
        empresaId: ciclo.empresaId,
        action: 'soft_delete',
      }
    );

    return NextResponse.json({ success: true, message: 'Ciclo desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar ciclo:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar ciclo' },
      { status: 500 }
    );
  }
}
