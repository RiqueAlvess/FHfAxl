'use client';

import { useEmpresa } from '@/contexts/EmpresaContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Building2 } from 'lucide-react';
import KPICards from '@/components/dashboard/KPICards';
import DistribuicaoRiscoChart from '@/components/dashboard/DistribuicaoRiscoChart';
import DimensoesChart from '@/components/dashboard/DimensoesChart';

type DashboardData = {
  kpis: {
    totalColaboradores: number;
    taxaAdesao: number;
    indiceGeralRisco: number;
    scoreMediano: number;
    desvioPadrao: number;
    coeficienteVariacao: number;
    taxaRiscoAlto: number;
    tempoMedioResposta: number;
    scoreMedioTotal: number;
  };
  distribuicao: {
    satisfatorio: number;
    atencao: number;
    critico: number;
  };
  scoresDimensoes: Array<{
    dimensao: string;
    scoreMedio: number;
    desvioPadrao: number;
    polaridade: "positiva" | "negativa";
    count: number;
  }>;
};

export default function DashboardEmpresasPage() {
  const { empresaAtiva } = useEmpresa();

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard', empresaAtiva],
    queryFn: async () => {
      if (!empresaAtiva) {
        throw new Error('Nenhuma empresa selecionada');
      }
      const response = await fetch(`/api/admin/dashboard?empresaId=${empresaAtiva}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }
      return response.json();
    },
    enabled: !!empresaAtiva,
  });

  if (!empresaAtiva) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Building2 className="h-16 w-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">
          Selecione uma empresa
        </h2>
        <p className="text-zinc-400 max-w-md">
          Use o seletor de empresas no cabeçalho para visualizar o dashboard de uma empresa específica.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-zinc-300 mb-2">
              {error instanceof Error ? error.message : 'Erro ao carregar dados do dashboard'}
            </p>
            <p className="text-sm text-zinc-500">
              Verifique se a empresa possui dados de questionários respondidos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">
          Dashboard de Empresa
        </h1>
        <p className="text-zinc-400">
          Visualize métricas e análises detalhadas da empresa selecionada.
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards kpis={data.kpis} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistribuicaoRiscoChart distribuicao={data.distribuicao} />
        <DimensoesChart dimensoes={data.scoresDimensoes} />
      </div>
    </div>
  );
}
