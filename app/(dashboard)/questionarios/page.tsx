"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Loader2, FileQuestion, Users, Send } from "lucide-react";
import CicloForm from "@/components/questionarios/CicloForm";
import ListaCiclos from "@/components/questionarios/ListaCiclos";
import MagicLinksDashboard from "@/components/questionarios/MagicLinksDashboard";
import BulkSendDialog from "@/components/questionarios/BulkSendDialog";

interface Ciclo {
  id: string;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  ativo: boolean;
  stats: {
    enviados: number;
    acessados: number;
    completados: number;
    pendentes: number;
    expirados: number;
  };
  _count: {
    magicLinks: number;
    respostas: number;
  };
}

interface Colaborador {
  id: string;
  email: string;
  unidade?: { nome: string };
  setor?: { nome: string };
  cargo?: { nome: string };
}

export default function QuestionariosPage() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cicloFormOpen, setCicloFormOpen] = useState(false);
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const [selectedCiclo, setSelectedCiclo] = useState<Ciclo | undefined>();
  const [selectedColaboradores, setSelectedColaboradores] = useState<
    Colaborador[]
  >([]);
  const [activeTab, setActiveTab] = useState("ciclos");
  const [selectedCicloForDashboard, setSelectedCicloForDashboard] = useState<
    string | undefined
  >();

  useEffect(() => {
    fetchCiclos();
    fetchColaboradores();
  }, []);

  const fetchCiclos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ciclos");
      if (!response.ok) throw new Error("Erro ao buscar ciclos");

      const data = await response.json();
      setCiclos(data);
    } catch (error) {
      console.error("Erro ao buscar ciclos:", error);
      toast.error("Erro ao carregar ciclos de avaliação");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchColaboradores = async () => {
    try {
      const response = await fetch("/api/colaboradores");
      if (!response.ok) throw new Error("Erro ao buscar colaboradores");

      const data = await response.json();
      setColaboradores(data.colaboradores || []);
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
      toast.error("Erro ao carregar colaboradores");
    }
  };

  const handleEditCiclo = (ciclo: Ciclo) => {
    setSelectedCiclo(ciclo);
    setCicloFormOpen(true);
  };

  const handleDeleteCiclo = async (cicloId: string) => {
    try {
      const response = await fetch(`/api/ciclos/${cicloId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar ciclo");
      }

      toast.success("Ciclo deletado com sucesso!");
      fetchCiclos();
    } catch (error) {
      console.error("Erro ao deletar ciclo:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao deletar ciclo"
      );
    }
  };

  const handleToggleAtivo = async (cicloId: string, ativo: boolean) => {
    try {
      const response = await fetch(`/api/ciclos/${cicloId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar ciclo");
      }

      toast.success(
        ativo ? "Ciclo ativado com sucesso!" : "Ciclo desativado com sucesso!"
      );
      fetchCiclos();
    } catch (error) {
      console.error("Erro ao atualizar ciclo:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar ciclo"
      );
    }
  };

  const handleViewDetails = (ciclo: Ciclo) => {
    setSelectedCicloForDashboard(ciclo.id);
    setActiveTab("magic-links");
  };

  const handleSendEmails = (ciclo: Ciclo) => {
    // Filtrar colaboradores ativos
    const colaboradoresAtivos = colaboradores.filter((c) => c);
    setSelectedColaboradores(colaboradoresAtivos);
    setBulkSendOpen(true);
  };

  const handleOpenSendDialog = () => {
    const colaboradoresAtivos = colaboradores.filter((c) => c);
    setSelectedColaboradores(colaboradoresAtivos);
    setBulkSendOpen(true);
  };

  const handleCicloFormSuccess = () => {
    fetchCiclos();
    setSelectedCiclo(undefined);
  };

  const handleBulkSendSuccess = () => {
    fetchCiclos();
    if (selectedCicloForDashboard) {
      // Refresh magic links dashboard
      setActiveTab("magic-links");
    }
  };

  const getTotalStats = () => {
    return ciclos.reduce(
      (acc, ciclo) => ({
        enviados: acc.enviados + ciclo.stats.enviados,
        acessados: acc.acessados + ciclo.stats.acessados,
        completados: acc.completados + ciclo.stats.completados,
        pendentes: acc.pendentes + ciclo.stats.pendentes,
        expirados: acc.expirados + ciclo.stats.expirados,
      }),
      { enviados: 0, acessados: 0, completados: 0, pendentes: 0, expirados: 0 }
    );
  };

  const totalStats = getTotalStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileQuestion className="h-8 w-8" />
            Questionários
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie ciclos de avaliação e envio de questionários
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenSendDialog} variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Enviar Questionários
          </Button>
          <Button onClick={() => setCicloFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Ciclo
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Ciclos</CardDescription>
            <CardTitle className="text-3xl">{ciclos.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Enviados</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {totalStats.enviados}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Acessados</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {totalStats.acessados}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completados</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {totalStats.completados}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {totalStats.pendentes}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="ciclos">
            <FileQuestion className="mr-2 h-4 w-4" />
            Ciclos de Avaliação
          </TabsTrigger>
          <TabsTrigger value="magic-links">
            <Users className="mr-2 h-4 w-4" />
            Status dos Envios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ciclos" className="mt-6">
          <ListaCiclos
            ciclos={ciclos}
            onEdit={handleEditCiclo}
            onDelete={handleDeleteCiclo}
            onToggleAtivo={handleToggleAtivo}
            onViewDetails={handleViewDetails}
            onSendEmails={handleSendEmails}
          />
        </TabsContent>

        <TabsContent value="magic-links" className="mt-6">
          <MagicLinksDashboard
            cicloId={selectedCicloForDashboard}
            onResend={() => fetchCiclos()}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CicloForm
        open={cicloFormOpen}
        onOpenChange={(open) => {
          setCicloFormOpen(open);
          if (!open) setSelectedCiclo(undefined);
        }}
        ciclo={selectedCiclo}
        onSuccess={handleCicloFormSuccess}
      />

      <BulkSendDialog
        open={bulkSendOpen}
        onOpenChange={setBulkSendOpen}
        colaboradores={selectedColaboradores}
        onSuccess={handleBulkSendSuccess}
      />
    </div>
  );
}
