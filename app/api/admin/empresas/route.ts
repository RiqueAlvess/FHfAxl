import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';

const empresaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
  logo: z.string().url().optional(),
  corPrimaria: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor primária deve ser um código hexadecimal válido').optional(),
  ativo: z.boolean().optional(),
});

// GET - Listar empresas
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
        { cnpj: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.empresa.count({ where }),
    ]);

    await createAuditLog(
      session.user.id,
      'VIEW',
      'Empresa',
      undefined,
      req,
      { action: 'list_empresas', total }
    );

    return NextResponse.json({
      empresas,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return NextResponse.json(
      { error: 'Erro ao listar empresas' },
      { status: 500 }
    );
  }
}

// POST - Criar empresa
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const data = empresaSchema.parse(body);

    // Verificar se CNPJ já existe
    const cnpjExists = await prisma.empresa.findUnique({
      where: { cnpj: data.cnpj },
    });

    if (cnpjExists) {
      return NextResponse.json(
        { error: 'CNPJ já está cadastrado' },
        { status: 400 }
      );
    }

    // Criar empresa
    const empresa = await prisma.empresa.create({
      data: {
        nome: data.nome,
        cnpj: data.cnpj,
        logo: data.logo,
        corPrimaria: data.corPrimaria || '#2563eb',
        ativo: data.ativo !== undefined ? data.ativo : true,
      },
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
      'CREATE',
      'Empresa',
      empresa.id,
      req,
      {
        nome: empresa.nome,
        cnpj: empresa.cnpj,
      }
    );

    return NextResponse.json(empresa, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar empresa' },
      { status: 500 }
    );
  }
}
