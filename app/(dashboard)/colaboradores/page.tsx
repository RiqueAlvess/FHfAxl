"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Users, Download } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface Colaborador {
  id: string;
  email: string;
  unidade: { nome: string };
  setor: { nome: string };
  cargo: { nome: string };
  sexo: string;
  ativo: boolean;
  createdAt: string;
}

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const response = await fetch("/api/colaboradores");
      if (response.ok) {
        const data = await response.json();
        setColaboradores(data);
      }
    } catch (error) {
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await fetch("/api/colaboradores/import-csv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: results.data }),
          });

          if (response.ok) {
            const result = await response.json();
            toast.success(
              `Importação concluída! ${result.success} de ${result.total} colaboradores importados.`
            );
            if (result.errors.length > 0) {
              toast.warning(`${result.errors.length} erros encontrados`);
              console.error("Erros de importação:", result.errors);
            }
            fetchColaboradores();
          } else {
            const error = await response.json();
            toast.error(error.error || "Erro ao importar arquivo");
          }
        } catch (error) {
          toast.error("Erro ao processar arquivo");
        } finally {
          setIsImporting(false);
        }
      },
      error: () => {
        toast.error("Erro ao ler arquivo CSV");
        setIsImporting(false);
      },
    });

    // Reset input
    event.target.value = "";
  };

  const downloadTemplate = () => {
    const template = `email,unidade,setor,cargo,data_nascimento,sexo
funcionario@empresa.com,Matriz,TI,Desenvolvedor,15/03/1990,M
exemplo@empresa.com,Filial São Paulo,RH,Analista,20/05/1985,F`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_colaboradores.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <p className="text-gray-500">Gerencie os colaboradores da empresa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Template CSV
          </Button>
          <Button asChild>
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Importando..." : "Importar CSV"}
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{colaboradores.length}</div>
            <p className="text-xs text-gray-500">Colaboradores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {colaboradores.filter((c) => c.ativo).length}
            </div>
            <p className="text-xs text-gray-500">Com status ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unidades</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(colaboradores.map((c) => c.unidade.nome)).size}
            </div>
            <p className="text-xs text-gray-500">Unidades diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
          <CardDescription>
            {colaboradores.length} colaboradores encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : colaboradores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum colaborador cadastrado. Importe um arquivo CSV para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id}>
                    <TableCell className="font-medium">{colaborador.email}</TableCell>
                    <TableCell>{colaborador.unidade.nome}</TableCell>
                    <TableCell>{colaborador.setor.nome}</TableCell>
                    <TableCell>{colaborador.cargo.nome}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          colaborador.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {colaborador.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Instruções de Importação */}
      <Card>
        <CardHeader>
          <CardTitle>Como Importar Colaboradores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">📋 Formato do CSV</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <strong>email</strong>: Email do colaborador (obrigatório)</li>
                <li>• <strong>unidade</strong>: Nome da unidade (obrigatório)</li>
                <li>• <strong>setor</strong>: Nome do setor (obrigatório)</li>
                <li>• <strong>cargo</strong>: Nome do cargo (obrigatório)</li>
                <li>• <strong>data_nascimento</strong>: Formato DD/MM/AAAA (opcional)</li>
                <li>• <strong>sexo</strong>: M, F ou O (opcional)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✅ Regras de Importação</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Máximo de 5.000 linhas por arquivo</li>
                <li>• Emails duplicados atualizam dados existentes</li>
                <li>• Unidades/Setores/Cargos são criados automaticamente</li>
                <li>• Importação é atômica (tudo ou nada)</li>
                <li>• Erros superiores a 10% cancelam a importação</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
