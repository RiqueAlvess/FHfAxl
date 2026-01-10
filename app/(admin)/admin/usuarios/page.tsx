import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import UserManagementTable from "@/components/admin/UserManagementTable";

export default async function UsuariosAdminPage() {
  const session = await auth();

  // Buscar todos os usuários com suas relações
  const usuarios = await prisma.user.findMany({
    include: {
      empresa: true,
      unidade: true,
      setor: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Buscar empresas para o formulário
  const empresas = await prisma.empresa.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-gray-500">Controle total de acessos ao sistema</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementTable
            usuarios={usuarios}
            empresas={empresas}
          />
        </CardContent>
      </Card>

      {/* Informações sobre Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Informações sobre Roles (Perfis de Acesso)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-yellow-700">ADMIN</h3>
              <p className="text-sm text-gray-600">
                Usuário master do sistema. Independente de empresa, acessa tudo e vê tudo.
                Tem acesso ao painel de administração para controlar acessos e criar usuários.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Campos obrigatórios:</strong> Nome, Email, Senha
              </p>
              <p className="text-xs text-gray-500">
                <strong>Campos opcionais:</strong> Empresa, Unidade, Setor (geralmente não preenchidos)
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-700">RH</h3>
              <p className="text-sm text-gray-600">
                Usuário vinculado a UMA empresa específica. Pode ver todo conteúdo voltado à sua empresa.
                Acessa todos os dados da empresa (todas unidades, setores e cargos). Não lida com regras da plataforma.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Campos obrigatórios:</strong> Nome, Email, Senha, Empresa
              </p>
              <p className="text-xs text-gray-500">
                <strong>Campos opcionais:</strong> Unidade, Setor (não utilizados para RH)
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-700">LIDERANÇA</h3>
              <p className="text-sm text-gray-600">
                Usuário vinculado a uma empresa, geralmente limitado a uma única unidade e/ou setor.
                Vê apenas dados da sua unidade/setor específico.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Campos obrigatórios:</strong> Nome, Email, Senha, Empresa
              </p>
              <p className="text-xs text-gray-500">
                <strong>Campos opcionais:</strong> Unidade (limita acesso à unidade), Setor (limita acesso ao setor)
              </p>
              <p className="text-xs text-gray-400 mt-1 italic">
                Se apenas Unidade for preenchida: acessa toda a unidade.
                Se Unidade e Setor forem preenchidos: acessa apenas o setor.
                Se apenas Setor for preenchido: acessa apenas o setor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
