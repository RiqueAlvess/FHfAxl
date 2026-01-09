import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(3),
  senha: z.string().min(8),
  role: z.enum(["ADMIN", "RH", "LIDERANCA"]).default("RH"),
  empresaId: z.string().optional(),
  unidadeId: z.string().optional(),
  setorId: z.string().optional(),
  ativo: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados de entrada
    const data = createUserSchema.parse(body);

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hashear senha
    const senhaHash = await hash(data.senha, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        nome: data.nome,
        senha: senhaHash,
        role: data.role,
        empresaId: data.empresaId,
        unidadeId: data.unidadeId,
        setorId: data.setorId,
        ativo: data.ativo,
      },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        empresaId: true,
        unidadeId: true,
        setorId: true,
        ativo: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuário criado com sucesso!",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}

// GET para listar empresas (útil para criar usuários vinculados)
export async function GET() {
  try {
    const empresas = await prisma.empresa.findMany({
      where: { ativo: true },
      include: {
        unidades: {
          where: { ativo: true },
          include: {
            setores: {
              where: { ativo: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ empresas });
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    return NextResponse.json(
      { error: "Erro ao listar empresas" },
      { status: 500 }
    );
  }
}
