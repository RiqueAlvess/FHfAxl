import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';

const updateUsuarioSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'RH', 'LIDERANCA']).optional(),
  empresaId: z.string().nullable().optional(),
  unidadeId: z.string().nullable().optional(),
  setorId: z.string().nullable().optional(),
  senha: z.string().min(8).optional(),
  ativo: z.boolean().optional(),
  forcarTrocaSenha: z.boolean().optional(),
});

// GET - Buscar usuário por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        empresa: { select: { id: true, nome: true } },
        unidade: { select: { id: true, nome: true } },
        setor: { select: { id: true, nome: true } },
        _count: { select: { auditLogs: true } },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Remover senha do retorno
    const { senha, senhasAnteriores, ...usuarioSemSenha } = usuario;

    await createAuditLog(
      session.user.id,
      'READ',
      'User',
      params.id,
      req
    );

    return NextResponse.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const data = updateUsuarioSchema.parse(body);

    // Verificar se usuário existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Validações de negócio
    const role = data.role || usuarioExistente.role;
    const empresaId = data.empresaId !== undefined ? data.empresaId : usuarioExistente.empresaId;

    if (role === 'RH' && !empresaId) {
      return NextResponse.json(
        { error: 'RH deve estar vinculado a uma empresa' },
        { status: 400 }
      );
    }

    if (role === 'LIDERANCA' && !empresaId) {
      return NextResponse.json(
        { error: 'LIDERANCA deve estar vinculado a uma empresa' },
        { status: 400 }
      );
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (data.email && data.email !== usuarioExistente.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (data.nome) updateData.nome = data.nome;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.empresaId !== undefined) updateData.empresaId = data.empresaId;
    if (data.unidadeId !== undefined) updateData.unidadeId = data.unidadeId;
    if (data.setorId !== undefined) updateData.setorId = data.setorId;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.forcarTrocaSenha !== undefined) updateData.forcarTrocaSenha = data.forcarTrocaSenha;

    // Se senha foi fornecida, fazer hash
    if (data.senha) {
      updateData.senha = await hash(data.senha, 12);
      updateData.forcarTrocaSenha = true; // Forçar troca quando admin altera senha
    }

    // Atualizar usuário
    const usuario = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        empresa: { select: { id: true, nome: true } },
        unidade: { select: { id: true, nome: true } },
        setor: { select: { id: true, nome: true } },
      },
    });

    // Remover senha do retorno
    const { senha, senhasAnteriores, ...usuarioSemSenha } = usuario;

    await createAuditLog(
      session.user.id,
      'UPDATE',
      'User',
      params.id,
      req,
      { changes: data }
    );

    return NextResponse.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar usuário (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Não permitir que o admin delete a si mesmo
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const usuario = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Soft delete: apenas marcar como inativo
    await prisma.user.update({
      where: { id: params.id },
      data: { ativo: false },
    });

    await createAuditLog(
      session.user.id,
      'DELETE',
      'User',
      params.id,
      req,
      {
        nome: usuario.nome,
        email: usuario.email,
        action: 'soft_delete',
      }
    );

    return NextResponse.json({ success: true, message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar usuário' },
      { status: 500 }
    );
  }
}
