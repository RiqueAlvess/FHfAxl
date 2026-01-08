import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, AlertTriangle, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo, {session?.user.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Adesão</CardTitle>
            <FileCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-gray-500">Questionários respondidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Índice de Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-gray-500">Score médio global</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-gray-500">Classificação geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para gráficos */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Riscos Psicossociais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Configure o sistema e envie questionários para visualizar análises
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
