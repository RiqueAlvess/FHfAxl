import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';

const cicloSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  empresaId: z.string().min(1, 'Empresa é obrigatória'),
  dataInicio: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de início inválida'),
  dataFim: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de fim inválida'),
  ativo: z.boolean().optional(),
}).refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['dataFim'],
});

// GET - Listar ciclos
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'RH')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const empresaId = searchParams.get('empresaId');

    const where: any = {};

    // Se não for ADMIN, filtrar pela empresa do usuário
    if (session.user.role !== 'ADMIN' && session.user.empresaId) {
      where.empresaId = session.user.empresaId;
    } else if (empresaId) {
      where.empresaId = empresaId;
    }

    if (search) {
      where.nome = { contains: search, mode: 'insensitive' };
    }

    const [ciclos, total] = await Promise.all([
      prisma.cicloAvaliacao.findMany({
        where,
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
        orderBy: { dataInicio: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.cicloAvaliacao.count({ where }),
    ]);

    await createAuditLog(
      session.user.id,
      'VIEW',
      'CicloAvaliacao',
      undefined,
      req,
      { action: 'list_ciclos', total }
    );

    return NextResponse.json({
      ciclos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar ciclos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar ciclos' },
      { status: 500 }
    );
  }
}

// POST - Criar ciclo
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'RH')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const data = cicloSchema.parse(body);

    // Se for RH, validar que está criando para sua própria empresa
    if (session.user.role === 'RH' && data.empresaId !== session.user.empresaId) {
      return NextResponse.json(
        { error: 'Você só pode criar ciclos para sua própria empresa' },
        { status: 403 }
      );
    }

    // Verificar se empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: data.empresaId },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Criar ciclo
    const ciclo = await prisma.cicloAvaliacao.create({
      data: {
        nome: data.nome,
        empresaId: data.empresaId,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim),
        ativo: data.ativo !== undefined ? data.ativo : true,
      },
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
      'CREATE',
      'CicloAvaliacao',
      ciclo.id,
      req,
      {
        nome: ciclo.nome,
        empresaId: ciclo.empresaId,
        dataInicio: ciclo.dataInicio,
        dataFim: ciclo.dataFim,
      }
    );

    return NextResponse.json(ciclo, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar ciclo:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar ciclo' },
      { status: 500 }
    );
  }
}
