import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Shield, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Estatísticas gerais do sistema
  const totalEmpresas = await prisma.empresa.count({
    where: { ativo: true },
  });

  const totalUsuarios = await prisma.user.count({
    where: { ativo: true },
  });

  const totalColaboradores = await prisma.colaborador.count({
    where: { ativo: true },
  });

  const totalRespostas = await prisma.resposta.count();

  // Usuários por role
  const usuariosPorRole = await prisma.user.groupBy({
    by: ['role'],
    where: { ativo: true },
    _count: true,
  });

  const admins = usuariosPorRole.find(u => u.role === 'ADMIN')?._count || 0;
  const rhs = usuariosPorRole.find(u => u.role === 'ADMIN')?._count || 0;
  const liderancas = usuariosPorRole.find(u => u.role === 'LIDERANCA')?._count || 0;

  // Últimas atividades (logs de auditoria)
  const ultimasAtividades = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          nome: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <p className="text-gray-500">Bem-vindo ao painel master do sistema, {session?.user.name}</p>
      </div>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmpresas}</div>
            <p className="text-xs text-gray-500">Empresas ativas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios}</div>
            <p className="text-xs text-gray-500">
              {admins} admins • {rhs} RHs • {liderancas} lideranças
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalColaboradores}</div>
            <p className="text-xs text-gray-500">Colaboradores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRespostas}</div>
            <p className="text-xs text-gray-500">Questionários respondidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Atividades do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ultimasAtividades.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>
            ) : (
              ultimasAtividades.map((log) => (
                <div key={log.id} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      log.acao === 'CREATE' ? 'bg-green-500' :
                      log.acao === 'UPDATE' ? 'bg-blue-500' :
                      log.acao === 'DELETE' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {log.user.nome} ({log.user.role})
                    </p>
                    <p className="text-sm text-gray-600">
                      {log.acao} em {log.entidade}
                      {log.entidadeId && ` (ID: ${log.entidadeId.substring(0, 8)}...)`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Usuários por Role */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Usuários por Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">ADMIN</span>
                <span className="text-sm text-gray-500">{admins} usuários</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${totalUsuarios > 0 ? (admins / totalUsuarios) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">RH</span>
                <span className="text-sm text-gray-500">{rhs} usuários</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${totalUsuarios > 0 ? (rhs / totalUsuarios) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">LIDERANÇA</span>
                <span className="text-sm text-gray-500">{liderancas} usuários</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${totalUsuarios > 0 ? (liderancas / totalUsuarios) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
