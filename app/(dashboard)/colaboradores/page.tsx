"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Upload, Download, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import ColaboradorFilters, {
  type FilterValues,
} from "@/components/colaboradores/ColaboradorFilters";
import ColaboradorTable from "@/components/colaboradores/ColaboradorTable";
import ColaboradorForm from "@/components/colaboradores/ColaboradorForm";
import ImportCsvDialog from "@/components/colaboradores/ImportCsvDialog";
import Papa from "papaparse";

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

export default function ColaboradoresPage() {
  const { data: session } = useSession();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] =
    useState<Colaborador | null>(null);

  const [filters, setFilters] = useState<FilterValues>({
    busca: "",
    unidadeId: "",
    setorId: "",
    cargoId: "",
    status: "ativo",
  });

  // Verificar se o usuário pode editar (RH ou ADMIN)
  const canEdit =
    session?.user?.role === "RH" || session?.user?.role === "ADMIN";

  useEffect(() => {
    fetchColaboradores();
  }, [filters]);

  const fetchColaboradores = async () => {
    setIsLoading(true);
    try {
      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filters.busca) params.append("busca", filters.busca);
      if (filters.unidadeId) params.append("unidadeId", filters.unidadeId);
      if (filters.setorId) params.append("setorId", filters.setorId);
      if (filters.cargoId) params.append("cargoId", filters.cargoId);
      if (filters.status) params.append("status", filters.status);

      const response = await fetch(`/api/colaboradores?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        // A API agora retorna { data, meta }
        setColaboradores(result.data || result);
      } else {
        toast.error("Erro ao carregar colaboradores");
      }
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desativar este colaborador?")) {
      return;
    }

    try {
      const response = await fetch(`/api/colaboradores/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Colaborador desativado com sucesso!");
        fetchColaboradores();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao desativar colaborador");
      }
    } catch (error) {
      console.error("Erro ao desativar colaborador:", error);
      toast.error("Erro ao desativar colaborador");
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
      toast.warning("Não há colaboradores para exportar");
      return;
    }

    // Preparar dados para CSV
    const csvData = colaboradores.map((c) => ({
      email: c.email,
      unidade: c.unidade.nome,
      setor: c.setor.nome,
      cargo: c.cargo.nome,
      data_nascimento: c.dataNascimento
        ? new Date(c.dataNascimento).toLocaleDateString("pt-BR")
        : "",
      sexo:
        c.sexo === "MASCULINO"
          ? "M"
          : c.sexo === "FEMININO"
          ? "F"
          : c.sexo === "OUTRO"
          ? "O"
          : "",
      status: c.ativo ? "Ativo" : "Inativo",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `colaboradores_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(`${colaboradores.length} colaboradores exportados!`);
  };

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
            Gerencie os colaboradores da sua empresa
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <>
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
            </>
          )}
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
            <p className="text-xs text-zinc-500 mt-1">
              Cadastrados no sistema
            </p>
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
                ? `${((colaboradoresAtivos / totalColaboradores) * 100).toFixed(
                    1
                  )}% do total`
                : "Nenhum colaborador"}
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
            <div className="text-2xl font-bold text-zinc-50">
              {totalUnidades}
            </div>
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
            <div className="text-2xl font-bold text-zinc-50">
              {totalSetores}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Setores diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <ColaboradorFilters filters={filters} onFiltersChange={setFilters} />

      {/* Tabela */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-50">
            Lista de Colaboradores
          </CardTitle>
          <p className="text-sm text-zinc-400">
            {isLoading
              ? "Carregando..."
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
              <p className="text-zinc-400 mb-2">
                Nenhum colaborador encontrado
              </p>
              <p className="text-sm text-zinc-500">
                {canEdit
                  ? "Clique em 'Novo Colaborador' ou 'Importar CSV' para começar"
                  : "Não há colaboradores cadastrados com os filtros selecionados"}
              </p>
            </div>
          ) : (
            <ColaboradorTable
              colaboradores={colaboradores}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={canEdit}
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

      <ImportCsvDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
