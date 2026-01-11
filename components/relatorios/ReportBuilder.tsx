"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, FileSpreadsheet, Eye, AlertCircle } from "lucide-react";
import type { FiltrosRelatorio, DadosRelatorio } from "@/types/reports";
import FilterSelector from "./FilterSelector";
import ReportPreview from "./ReportPreview";

interface FilterOptions {
  ciclos: { id: string; nome: string }[];
  unidades: { id: string; nome: string }[];
  setores: { id: string; nome: string }[];
}

interface ReportBuilderProps {
  empresaId: string;
  options: FilterOptions;
}

export default function ReportBuilder({ empresaId, options }: ReportBuilderProps) {
  const [filtros, setFiltros] = useState<FiltrosRelatorio | null>(null);
  const [previewData, setPreviewData] = useState<DadosRelatorio | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar preview
  const handleLoadPreview = async () => {
    if (!filtros) return;

    setError(null);
    setIsLoadingPreview(true);

    try {
      const response = await fetch("/api/relatorios/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filtros }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar preview");
      }

      if (!data.sucesso) {
        throw new Error(data.erro || "Erro ao carregar preview");
      }

      setPreviewData(data.dados);
    } catch (err) {
      console.error("Erro ao carregar preview:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar preview");
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Gerar PDF
  const handleGeneratePDF = async () => {
    if (!filtros) return;

    setError(null);
    setIsGeneratingPDF(true);

    try {
      const response = await fetch("/api/relatorios/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filtros,
          formato: "pdf",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao gerar PDF");
      }

      if (!data.sucesso) {
        throw new Error(data.erro || "Erro ao gerar PDF");
      }

      // Download do arquivo
      const base64 = data.arquivoBase64;
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.arquivoNome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("Relatório PDF gerado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setError(err instanceof Error ? err.message : "Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Gerar Excel
  const handleGenerateExcel = async () => {
    if (!filtros) return;

    setError(null);
    setIsGeneratingExcel(true);

    try {
      const response = await fetch("/api/relatorios/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filtros,
          formato: "excel",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao gerar Excel");
      }

      if (!data.sucesso) {
        throw new Error(data.erro || "Erro ao gerar Excel");
      }

      // Download do arquivo
      const base64 = data.arquivoBase64;
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.arquivoNome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("Relatório Excel gerado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar Excel:", err);
      setError(err instanceof Error ? err.message : "Erro ao gerar Excel");
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  // Atualizar filtros e carregar preview automaticamente
  const handleFilterChange = (newFiltros: FiltrosRelatorio) => {
    setFiltros(newFiltros);
    setPreviewData(null);
    setError(null);
  };

  // Verificar se pode gerar relatório
  const canGenerateReport = filtros && (
    filtros.tipoRelatorio === "executivo" ||
    filtros.tipoRelatorio === "completo" ||
    filtros.tipoRelatorio === "evolucao" ||
    (filtros.tipoRelatorio === "unidade" && filtros.unidadeId) ||
    (filtros.tipoRelatorio === "setor" && filtros.setorId)
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <FilterSelector
        empresaId={empresaId}
        options={options}
        onFilterChange={handleFilterChange}
        isLoading={isLoadingPreview || isGeneratingPDF || isGeneratingExcel}
      />

      {/* Ações */}
      {filtros && (
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleLoadPreview}
                disabled={!canGenerateReport || isLoadingPreview}
                variant="outline"
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar Preview
                  </>
                )}
              </Button>

              <Button
                onClick={handleGeneratePDF}
                disabled={!canGenerateReport || isGeneratingPDF}
                variant="default"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar PDF
                  </>
                )}
              </Button>

              <Button
                onClick={handleGenerateExcel}
                disabled={!canGenerateReport || isGeneratingExcel}
                variant="default"
              >
                {isGeneratingExcel ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Excel...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Gerar Excel
                  </>
                )}
              </Button>
            </div>

            {!canGenerateReport && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {filtros.tipoRelatorio === "unidade" && !filtros.unidadeId
                    ? "Selecione uma unidade para gerar o relatório"
                    : filtros.tipoRelatorio === "setor" && !filtros.setorId
                    ? "Selecione um setor para gerar o relatório"
                    : "Configure os filtros para gerar o relatório"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview */}
      {isLoadingPreview && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando preview do relatório...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {previewData && !isLoadingPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview do Relatório</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualização dos dados que serão incluídos no relatório
            </p>
          </CardHeader>
          <CardContent>
            <ReportPreview dados={previewData} />
          </CardContent>
        </Card>
      )}

      {/* Disclaimer LGPD */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Aviso de Privacidade (LGPD):</strong> Os relatórios gerados contêm dados
          agregados e anonimizados em conformidade com a LGPD. Todos os dados foram processados
          respeitando o princípio de K-Anonymity (mínimo de 5 respondentes por grupo). O uso
          inadequado deste relatório pode configurar violação à LGPD.
        </AlertDescription>
      </Alert>
    </div>
  );
}
