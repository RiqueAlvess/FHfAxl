import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export default async function DashboardPage() {
  const session = await auth();

  // Buscar dados básicos do servidor
  const totalColaboradores = await prisma.colaborador.count({
    where: { empresaId: session!.user.empresaId, ativo: true },
  });

  const totalRespostas = await prisma.resposta.count({
    where: {
      colaborador: {
        empresaId: session!.user.empresaId,
        ativo: true,
      },
    },
  });

  const taxaAdesao = totalColaboradores > 0
    ? ((totalRespostas / totalColaboradores) * 100).toFixed(1)
    : "0";

  // Calcular IGRP (Índice Geral de Risco Psicossocial)
  const scoresGlobais = await prisma.resposta.findMany({
    where: {
      colaborador: {
        empresaId: session!.user.empresaId,
        ativo: true,
      },
    },
    select: { scoreGlobal: true, classificacao: true },
  });

  const igrp = scoresGlobais.length > 0
    ? (scoresGlobais.reduce((acc: number, r: any) => acc + r.scoreGlobal, 0) / scoresGlobais.length).toFixed(2)
    : "-";

  const classificacaoGeral =
    igrp === "-" ? "-" : parseFloat(igrp) <= 40 ? "Satisfatório" : parseFloat(igrp) <= 80 ? "Atenção" : "Crítico";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo, {session?.user.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-gray-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{totalColaboradores}</div>
            <p className="text-xs text-gray-600">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black">Taxa de Adesão</CardTitle>
            <FileCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{taxaAdesao}%</div>
            <p className="text-xs text-gray-600">
              {totalRespostas} de {totalColaboradores} responderam
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black">IGRP</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{igrp}</div>
            <p className="text-xs text-gray-600">Índice Geral de Risco (0-140)</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              classificacaoGeral === "Satisfatório" ? "text-green-600" :
              classificacaoGeral === "Atenção" ? "text-amber-600" :
              classificacaoGeral === "Crítico" ? "text-red-600" : "text-gray-600"
            }`}>
              {classificacaoGeral}
            </div>
            <p className="text-xs text-gray-600">Classificação geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <DashboardCharts />
    </div>
  );
}
