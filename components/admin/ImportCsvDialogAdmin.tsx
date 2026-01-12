'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Download,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { csvColaboradorSchema } from '@/types/colaborador';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ImportCsvDialogAdminProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  empresaId: string;
}

interface ParsedRow {
  data: any;
  isValid: boolean;
  errors: string[];
  lineNumber: number;
}

export default function ImportCsvDialogAdmin({
  open,
  onOpenChange,
  onSuccess,
  empresaId,
}: ImportCsvDialogAdminProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar uma linha do CSV
  const validateRow = useCallback((row: any, index: number): ParsedRow => {
    const errors: string[] = [];
    let isValid = true;

    try {
      csvColaboradorSchema.parse(row);
    } catch (error: any) {
      isValid = false;
      if (error.errors) {
        errors.push(...error.errors.map((e: any) => e.message));
      }
    }

    return {
      data: row,
      isValid,
      errors,
      lineNumber: index + 2,
    };
  }, []);

  // Processar arquivo CSV
  const processFile = useCallback(
    (file: File) => {
      setParsedData([]);
      setImportResult(null);
      setShowPreview(false);
      setProgress(0);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            toast.error('Arquivo CSV vazio');
            return;
          }

          if (results.data.length > 5000) {
            toast.error(`Limite de 5.000 linhas excedido (${results.data.length} linhas)`);
            return;
          }

          const validated = results.data.map((row, index) =>
            validateRow(row, index)
          );

          setParsedData(validated);
          setShowPreview(true);

          const validCount = validated.filter((r) => r.isValid).length;
          const invalidCount = validated.length - validCount;

          toast.info(
            `Arquivo carregado: ${validCount} linhas válidas, ${invalidCount} inválidas`
          );
        },
        error: () => {
          toast.error('Erro ao ler arquivo CSV');
        },
      });
    },
    [validateRow]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV');
        return;
      }

      processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    processFile(file);
    event.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;

    const validRows = parsedData.filter((r) => r.isValid).map((r) => r.data);

    if (validRows.length === 0) {
      toast.error('Nenhuma linha válida para importar');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setShowPreview(false);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const response = await fetch('/api/admin/colaboradores/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows, empresaId }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        toast.success(
          `Importação concluída! ${result.success} de ${result.total} colaboradores importados.`
        );

        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} erros encontrados`);
        }

        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 3000);
      } else {
        toast.error(result.error || 'Erro ao importar arquivo');
        setImportResult({
          success: 0,
          total: validRows.length,
          errors: [{ linha: 0, erro: result.error }],
        });
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo');
    } finally {
      clearInterval(progressInterval);
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `email,unidade,setor,cargo,data_nascimento,sexo
funcionario1@empresa.com,Matriz,TI,Desenvolvedor,15/03/1990,M
funcionario2@empresa.com,Matriz,TI,Analista,20/05/1985,F
funcionario3@empresa.com,Filial SP,RH,Gerente,10/12/1988,F
funcionario4@empresa.com,Filial RJ,Comercial,Vendedor,25/07/1992,M`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_colaboradores.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Template baixado com sucesso!');
  };

  const downloadErrorReport = () => {
    if (!importResult || importResult.errors.length === 0) return;

    const errorLines = [
      'Linha,Email,Erro',
      ...importResult.errors.map(
        (err: any) => `${err.linha},${err.email || ''},${err.erro}`
      ),
    ];

    const csv = errorLines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erros_importacao_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Relatório de erros baixado!');
  };

  const handleClose = () => {
    setParsedData([]);
    setShowPreview(false);
    setImportResult(null);
    setProgress(0);
    onOpenChange(false);
  };

  const validCount = parsedData.filter((r) => r.isValid).length;
  const invalidCount = parsedData.length - validCount;
  const previewRows = parsedData.slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-50">
            Importar Colaboradores via CSV
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Faça upload de um arquivo CSV para importar múltiplos colaboradores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showPreview && !isImporting && !importResult && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 text-zinc-200 flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-violet-400" />
                      Formato do CSV
                    </h3>
                    <ul className="text-sm space-y-1 text-zinc-400">
                      <li>
                        • <strong className="text-zinc-300">email</strong>: Email do
                        colaborador (obrigatório)
                      </li>
                      <li>
                        • <strong className="text-zinc-300">unidade</strong>: Nome da
                        unidade (obrigatório)
                      </li>
                      <li>
                        • <strong className="text-zinc-300">setor</strong>: Nome do
                        setor (obrigatório)
                      </li>
                      <li>
                        • <strong className="text-zinc-300">cargo</strong>: Nome do
                        cargo (obrigatório)
                      </li>
                      <li>
                        • <strong className="text-zinc-300">data_nascimento</strong>:
                        DD/MM/AAAA ou AAAA-MM-DD (opcional)
                      </li>
                      <li>
                        • <strong className="text-zinc-300">sexo</strong>: M, F ou O
                        (opcional)
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 text-zinc-200 flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-yellow-400" />
                      Regras de Importação
                    </h3>
                    <ul className="text-sm space-y-1 text-zinc-400">
                      <li>• Máximo de 5.000 linhas por arquivo</li>
                      <li>• Emails duplicados atualizam dados</li>
                      <li>• Unidades/Setores/Cargos criados automaticamente</li>
                      <li>• Importação é atômica (tudo ou nada)</li>
                      <li>• Máximo de 10% de erros permitidos</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Template CSV
                </Button>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-zinc-700 hover:border-violet-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <Upload className="h-12 w-12 mx-auto text-zinc-500 mb-3" />
                <p className="text-zinc-300 font-medium">
                  {isDragging
                    ? 'Solte o arquivo aqui'
                    : 'Arraste um arquivo CSV ou clique para selecionar'}
                </p>
                <p className="text-sm text-zinc-500 mt-1 mb-4">
                  Arquivos .csv com até 5.000 linhas
                </p>
                <Button
                  onClick={handleFileSelect}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Arquivo
                </Button>
              </div>
            </>
          )}

          {showPreview && !isImporting && !importResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-violet-400" />
                  <h3 className="font-semibold text-zinc-200">
                    Preview - Primeiras 10 linhas
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                    {validCount} válidas
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
                      {invalidCount} inválidas
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border border-zinc-700 rounded-lg overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-800 hover:bg-zinc-800">
                      <TableHead className="text-zinc-300 w-12">#</TableHead>
                      <TableHead className="text-zinc-300">Email</TableHead>
                      <TableHead className="text-zinc-300">Unidade</TableHead>
                      <TableHead className="text-zinc-300">Setor</TableHead>
                      <TableHead className="text-zinc-300">Cargo</TableHead>
                      <TableHead className="text-zinc-300 w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, idx) => (
                      <TableRow
                        key={idx}
                        className={
                          row.isValid
                            ? 'bg-green-500/5 hover:bg-green-500/10'
                            : 'bg-red-500/5 hover:bg-red-500/10'
                        }
                      >
                        <TableCell className="text-zinc-400">{row.lineNumber}</TableCell>
                        <TableCell className="text-zinc-300">
                          {row.data.email || '-'}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {row.data.unidade || '-'}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {row.data.setor || '-'}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {row.data.cargo || '-'}
                        </TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <div className="group relative">
                              <AlertCircle className="h-4 w-4 text-red-400" />
                              <div className="hidden group-hover:block absolute z-10 bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-red-400 whitespace-nowrap -right-2 top-6">
                                {row.errors.join(', ')}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {parsedData.length > 10 && (
                <p className="text-sm text-zinc-500 text-center">
                  ... e mais {parsedData.length - 10} linhas
                </p>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setParsedData([]);
                    setShowPreview(false);
                  }}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={validCount === 0}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Confirmar Importação ({validCount} linhas)
                </Button>
              </div>
            </div>
          )}

          {isImporting && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-300">Importando colaboradores...</p>
                  <p className="text-sm text-zinc-500">{progress}%</p>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex items-center justify-center gap-3 text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm">
                  Por favor, aguarde. Isso pode levar alguns instantes.
                </p>
              </div>
            </div>
          )}

          {importResult && !isImporting && (
            <div className="space-y-4">
              {importResult.success > 0 ? (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                    <p className="text-zinc-300 font-medium">
                      Importação concluída com sucesso!
                    </p>
                  </div>

                  <div className="flex justify-center gap-6 text-sm">
                    <div>
                      <span className="text-zinc-500">Sucesso: </span>
                      <span className="text-green-400 font-medium">
                        {importResult.success}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Total: </span>
                      <span className="text-zinc-300 font-medium">
                        {importResult.total}
                      </span>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div>
                        <span className="text-zinc-500">Erros: </span>
                        <span className="text-red-400 font-medium">
                          {importResult.errors.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {importResult.errors.length > 0 && (
                    <>
                      <div className="mt-4 max-h-40 overflow-y-auto">
                        <div className="text-left bg-zinc-950 rounded p-3 text-xs space-y-1">
                          {importResult.errors
                            .slice(0, 10)
                            .map((error: any, idx: number) => (
                              <div key={idx} className="text-red-400">
                                Linha {error.linha}: {error.erro}
                              </div>
                            ))}
                          {importResult.errors.length > 10 && (
                            <div className="text-zinc-500">
                              ... e mais {importResult.errors.length - 10} erros
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={downloadErrorReport}
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Baixar Relatório de Erros
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="h-12 w-12 text-red-400" />
                    <p className="text-zinc-300 font-medium">Erro na importação</p>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="mt-4 max-h-40 overflow-y-auto">
                      <div className="text-left bg-zinc-950 rounded p-3 text-xs space-y-1">
                        {importResult.errors.map((error: any, idx: number) => (
                          <div key={idx} className="text-red-400">
                            {error.erro}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            {importResult ? 'Fechar' : 'Cancelar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
