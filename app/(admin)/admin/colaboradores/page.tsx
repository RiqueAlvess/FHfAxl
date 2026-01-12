'use client';

import { useState, useEffect } from 'react';
import { useEmpresa } from '@/contexts/EmpresaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Upload, Download, Building2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import ColaboradorTable from '@/components/colaboradores/ColaboradorTable';
import ColaboradorForm from '@/components/colaboradores/ColaboradorForm';
import Papa from 'papaparse';
import ImportCsvDialogAdmin from '@/components/admin/ImportCsvDialogAdmin';

interface Colaborador {
  id: string;
  email: string;
  dataNascimento: Date | null;
  sexo: string;
  ativo: boolean;
  createdAt: Date;
  unidade: { id: string; nome: string };
  setor: { id: string; nome: string };
  cargo: { id: string; nome: string };
}

export default function AdminColaboradoresPage() {
  const { empresaAtiva } = useEmpresa();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);

  useEffect(() => {
    if (empresaAtiva) {
      fetchColaboradores();
    } else {
      setColaboradores([]);
    }
  }, [empresaAtiva]);

  const fetchColaboradores = async () => {
    if (!empresaAtiva) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('empresaId', empresaAtiva);

      const response = await fetch(`/api/colaboradores?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        setColaboradores(result.data || result);
      } else {
        toast.error('Erro ao carregar colaboradores');
      }
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este colaborador?')) {
      return;
    }

    try {
      const response = await fetch(`/api/colaboradores/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Colaborador desativado com sucesso!');
        fetchColaboradores();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao desativar colaborador');
      }
    } catch (error) {
      console.error('Erro ao desativar colaborador:', error);
      toast.error('Erro ao desativar colaborador');
    }
  };

  const handleFormSuccess = () => {
    fetchColaboradores();
    setSelectedColaborador(null);
  };

  const handleImportSuccess = () => {
    fetchColaboradores();
  };

  const handleExportCsv = () => {
    if (colaboradores.length === 0) {
      toast.warning('Não há colaboradores para exportar');
      return;
    }

    const csvData = colaboradores.map((c) => ({
      email: c.email,
      unidade: c.unidade.nome,
      setor: c.setor.nome,
      cargo: c.cargo.nome,
      data_nascimento: c.dataNascimento
        ? new Date(c.dataNascimento).toLocaleDateString('pt-BR')
        : '',
      sexo:
        c.sexo === 'MASCULINO'
          ? 'M'
          : c.sexo === 'FEMININO'
          ? 'F'
          : c.sexo === 'OUTRO'
          ? 'O'
          : '',
      status: c.ativo ? 'Ativo' : 'Inativo',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `colaboradores_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(`${colaboradores.length} colaboradores exportados!`);
  };

  if (!empresaAtiva) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Building2 className="h-16 w-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">
          Selecione uma empresa
        </h2>
        <p className="text-zinc-400 max-w-md">
          Use o seletor de empresas no cabeçalho para visualizar e gerenciar colaboradores de uma empresa específica.
        </p>
      </div>
    );
  }

  // Calcular estatísticas
  const totalColaboradores = colaboradores.length;
  const colaboradoresAtivos = colaboradores.filter((c) => c.ativo).length;
  const totalUnidades = new Set(colaboradores.map((c) => c.unidade.id)).size;
  const totalSetores = new Set(colaboradores.map((c) => c.setor.id)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50">Colaboradores</h1>
          <p className="text-zinc-400 mt-1">
            Gerencie os colaboradores da empresa selecionada
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={colaboradores.length === 0}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => {
              setSelectedColaborador(null);
              setFormOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total de Colaboradores
            </CardTitle>
            <Users className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">
              {totalColaboradores}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Colaboradores Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">
              {colaboradoresAtivos}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {totalColaboradores > 0
                ? `${((colaboradoresAtivos / totalColaboradores) * 100).toFixed(1)}% do total`
                : 'Nenhum colaborador'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Unidades
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">{totalUnidades}</div>
            <p className="text-xs text-zinc-500 mt-1">Unidades diferentes</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Setores
            </CardTitle>
            <Briefcase className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">{totalSetores}</div>
            <p className="text-xs text-zinc-500 mt-1">Setores diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-50">Lista de Colaboradores</CardTitle>
          <p className="text-sm text-zinc-400">
            {isLoading
              ? 'Carregando...'
              : `${colaboradores.length} colaborador(es) encontrado(s)`}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500">
              Carregando colaboradores...
            </div>
          ) : colaboradores.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-400 mb-2">Nenhum colaborador encontrado</p>
              <p className="text-sm text-zinc-500">
                Clique em 'Novo Colaborador' ou 'Importar CSV' para começar
              </p>
            </div>
          ) : (
            <ColaboradorTable
              colaboradores={colaboradores}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ColaboradorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        colaborador={selectedColaborador}
        onSuccess={handleFormSuccess}
      />

      <ImportCsvDialogAdmin
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={handleImportSuccess}
        empresaId={empresaAtiva}
      />
    </div>
  );
}
