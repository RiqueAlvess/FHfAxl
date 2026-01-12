import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'RH', 'LIDERANCA'], {
    errorMap: () => ({ message: 'Role inválido' }),
  }),
  empresaId: z.string().optional(),
  unidadeId: z.string().optional(),
  setorId: z.string().optional(),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').optional(),
  ativo: z.boolean().optional(),
});

// GET - Listar usuários
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          empresa: { select: { id: true, nome: true } },
          unidade: { select: { id: true, nome: true } },
          setor: { select: { id: true, nome: true } },
          _count: { select: { auditLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Remover senhas dos resultados
    const usuariosSemSenha = usuarios.map(({ senha, senhasAnteriores, ...user }) => user);

    await createAuditLog(
      session.user.id,
      'VIEW',
      'User',
      undefined,
      req,
      { action: 'list_users', total }
    );

    return NextResponse.json({
      usuarios: usuariosSemSenha,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

// POST - Criar usuário
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const data = usuarioSchema.parse(body);

    // Validações de negócio
    if (data.role === 'RH' && !data.empresaId) {
      return NextResponse.json(
        { error: 'RH deve estar vinculado a uma empresa' },
        { status: 400 }
      );
    }

    if (data.role === 'LIDERANCA' && !data.empresaId) {
      return NextResponse.json(
        { error: 'LIDERANCA deve estar vinculado a uma empresa' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha (usar senha fornecida ou padrão)
    const senhaHash = await hash(data.senha || 'senha123', 12);

    // Criar usuário
    const usuario = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: senhaHash,
        role: data.role,
        empresaId: data.empresaId,
        unidadeId: data.unidadeId,
        setorId: data.setorId,
        ativo: data.ativo !== undefined ? data.ativo : true,
        forcarTrocaSenha: true, // Sempre forçar troca de senha no primeiro login
      },
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
      'CREATE',
      'User',
      usuario.id,
      req,
      {
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      }
    );

    return NextResponse.json(usuarioSemSenha, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
