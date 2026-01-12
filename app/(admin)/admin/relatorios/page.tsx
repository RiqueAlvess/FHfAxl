'use client';

import { useEffect, useState } from 'react';
import { useEmpresa } from '@/contexts/EmpresaContext';
import { FileText, Building2 } from 'lucide-react';
import ReportBuilder from '@/components/relatorios/ReportBuilder';

type FilterOptions = {
  ciclos: Array<{ id: string; nome: string }>;
  unidades: Array<{ id: string; nome: string }>;
  setores: Array<{ id: string; nome: string }>;
};

export default function AdminRelatoriosPage() {
  const { empresaAtiva } = useEmpresa();
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (empresaAtiva) {
      fetchOptions();
    } else {
      setOptions(null);
    }
  }, [empresaAtiva]);

  const fetchOptions = async () => {
    if (!empresaAtiva) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/empresas/${empresaAtiva}`);
      if (response.ok) {
        const data = await response.json();

        // Buscar ciclos ativos
        const ciclosResponse = await fetch(`/api/admin/ciclos?empresaId=${empresaAtiva}`);
        const ciclosData = ciclosResponse.ok ? await ciclosResponse.json() : { ciclos: [] };

        setOptions({
          ciclos: ciclosData.ciclos || [],
          unidades: data.unidades || [],
          setores: data.setores || [],
        });
      }
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!empresaAtiva) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Building2 className="h-16 w-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">
          Selecione uma empresa
        </h2>
        <p className="text-zinc-400 max-w-md">
          Use o seletor de empresas no cabeçalho para gerar relatórios de uma empresa específica.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando opções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-50 flex items-center gap-3">
          <FileText className="h-8 w-8" />
          Relatórios
        </h1>
        <p className="text-zinc-400 mt-2">
          Gere relatórios personalizados de saúde ocupacional em PDF ou Excel
        </p>
      </div>

      {options ? (
        <ReportBuilder empresaId={empresaAtiva} options={options} />
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400">
            Nenhuma opção disponível para esta empresa.
          </p>
        </div>
      )}
    </div>
  );
}
