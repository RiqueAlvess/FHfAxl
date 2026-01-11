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
    console.log("[API] Iniciando criação de usuário");
    const body = await request.json();
    console.log("[API] Body recebido:", JSON.stringify(body, null, 2));

    // Validar dados de entrada
    const data = createUserSchema.parse(body);
    console.log("[API] Dados validados:", { ...data, senha: "***" });

    // Converter strings vazias em undefined para campos opcionais
    const empresaId = data.empresaId && data.empresaId.trim() !== "" ? data.empresaId : undefined;
    const unidadeId = data.unidadeId && data.unidadeId.trim() !== "" ? data.unidadeId : undefined;
    const setorId = data.setorId && data.setorId.trim() !== "" ? data.setorId : undefined;

    console.log("[API] IDs processados:", { empresaId, unidadeId, setorId, role: data.role });

    // VALIDAÇÃO: RH e LIDERANCA DEVEM ter empresa vinculada
    if ((data.role === "RH" || data.role === "LIDERANCA") && !empresaId) {
      console.log("[API] Validação falhou: perfil requer empresa");
      return NextResponse.json(
        { error: `Usuários com perfil ${data.role} devem estar vinculados a uma empresa` },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    console.log("[API] Verificando se email já existe:", data.email);
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log("[API] Email já existe");
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hashear senha
    console.log("[API] Hasheando senha...");
    const senhaHash = await hash(data.senha, 10);
    console.log("[API] Senha hasheada com sucesso");

    // Criar usuário
    console.log("[API] Criando usuário no banco...");
    const userData = {
      email: data.email,
      nome: data.nome,
      senha: senhaHash,
      role: data.role,
      empresaId,
      unidadeId,
      setorId,
      ativo: data.ativo,
    };
    console.log("[API] Dados que serão salvos:", { ...userData, senha: "***" });

    const user = await prisma.user.create({
      data: userData,
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

    console.log("[API] Usuário criado com sucesso:", user.id);
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
      console.error("[API] Erro de validação Zod:", error.errors);
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] Erro ao criar usuário:", error);
    console.error("[API] Stack trace:", error instanceof Error ? error.stack : "N/A");
    console.error("[API] Tipo do erro:", error instanceof Error ? error.constructor.name : typeof error);

    return NextResponse.json(
      {
        error: "Erro ao criar usuário",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        type: error instanceof Error ? error.constructor.name : typeof error
      },
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
