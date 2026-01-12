import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';

const updateEmpresaSchema = z.object({
  nome: z.string().min(3).optional(),
  cnpj: z.string().regex(/^\d{14}$/).optional(),
  logo: z.string().url().nullable().optional(),
  corPrimaria: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  ativo: z.boolean().optional(),
});

// GET - Buscar empresa por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await params;

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        unidades: {
          include: {
            setores: {
              include: {
                cargos: true,
              },
            },
          },
        },
        _count: {
          select: {
            usuarios: true,
            unidades: true,
            colaboradores: true,
            ciclosAvaliacao: true,
          },
        },
      },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    await createAuditLog(
      session.user.id,
      'READ',
      'Empresa',
      id,
      req
    );

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar empresa' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar empresa
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await params;

    const body = await req.json();
    const data = updateEmpresaSchema.parse(body);

    // Verificar se empresa existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresaExistente) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (data.cnpj && data.cnpj !== empresaExistente.cnpj) {
      const cnpjExists = await prisma.empresa.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (cnpjExists) {
        return NextResponse.json(
          { error: 'CNPJ já está em uso' },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (data.nome) updateData.nome = data.nome;
    if (data.cnpj) updateData.cnpj = data.cnpj;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.corPrimaria) updateData.corPrimaria = data.corPrimaria;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    // Atualizar empresa
    const empresa = await prisma.empresa.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            usuarios: true,
            unidades: true,
            colaboradores: true,
            ciclosAvaliacao: true,
          },
        },
      },
    });

    await createAuditLog(
      session.user.id,
      'UPDATE',
      'Empresa',
      id,
      req,
      { changes: data }
    );

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar empresa' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar empresa (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await params;

    // Verificar se empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            colaboradores: true,
          },
        },
      },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há usuários ou colaboradores ativos
    if (empresa._count.usuarios > 0 || empresa._count.colaboradores > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível desativar uma empresa com usuários ou colaboradores ativos. Desative-os primeiro.',
          details: {
            usuarios: empresa._count.usuarios,
            colaboradores: empresa._count.colaboradores,
          },
        },
        { status: 400 }
      );
    }

    // Soft delete: apenas marcar como inativo
    await prisma.empresa.update({
      where: { id },
      data: { ativo: false },
    });

    await createAuditLog(
      session.user.id,
      'DELETE',
      'Empresa',
      id,
      req,
      {
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        action: 'soft_delete',
      }
    );

    return NextResponse.json({ success: true, message: 'Empresa desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar empresa' },
      { status: 500 }
    );
  }
}
