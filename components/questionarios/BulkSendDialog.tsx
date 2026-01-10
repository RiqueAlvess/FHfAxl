"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Colaborador {
  id: string;
  email: string;
  unidade?: { nome: string };
  setor?: { nome: string };
  cargo?: { nome: string };
}

interface Ciclo {
  id: string;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  ativo: boolean;
}

interface BulkSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaboradores: Colaborador[];
  onSuccess: () => void;
}

export default function BulkSendDialog({
  open,
  onOpenChange,
  colaboradores,
  onSuccess,
}: BulkSendDialogProps) {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [selectedCiclo, setSelectedCiclo] = useState<string>("");
  const [isLoadingCiclos, setIsLoadingCiclos] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [sendResults, setSendResults] = useState<{
    success: number;
    errors: Array<{ email: string; erro: string }>;
  } | null>(null);

  useEffect(() => {
    if (open) {
      fetchCiclos();
      setSendResults(null);
      setProgress(0);
    }
  }, [open]);

  const fetchCiclos = async () => {
    setIsLoadingCiclos(true);
    try {
      const response = await fetch("/api/ciclos?ativo=true");
      if (!response.ok) throw new Error("Erro ao buscar ciclos");

      const data = await response.json();
      setCiclos(data);

      // Auto-selecionar se houver apenas um ciclo ativo
      if (data.length === 1) {
        setSelectedCiclo(data[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar ciclos:", error);
      toast.error("Erro ao carregar ciclos ativos");
    } finally {
      setIsLoadingCiclos(false);
    }
  };

  const handleSend = async () => {
    if (!selectedCiclo) {
      toast.error("Selecione um ciclo de avaliação");
      return;
    }

    if (colaboradores.length === 0) {
      toast.error("Nenhum colaborador selecionado");
      return;
    }

    if (colaboradores.length > 500) {
      toast.error("Máximo de 500 colaboradores por envio");
      return;
    }

    setIsSending(true);
    setProgress(0);

    try {
      const colaboradorIds = colaboradores.map((c) => c.id);

      const response = await fetch("/api/magic-link/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colaboradorIds,
          cicloAvaliacaoId: selectedCiclo,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar emails");
      }

      const result = await response.json();
      setSendResults(result);

      if (result.success > 0) {
        toast.success(
          `${result.success} email(s) enviado(s) com sucesso!`
        );
      }

      if (result.errors.length > 0) {
        toast.error(
          `${result.errors.length} erro(s) ao enviar emails`
        );
      }

      setProgress(100);
      onSuccess();

      // Fechar após 2 segundos se tudo deu certo
      if (result.errors.length === 0) {
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao enviar emails:", error);
      toast.error("Erro ao enviar emails em massa");
    } finally {
      setIsSending(false);
    }
  };

  const cicloSelecionado = ciclos.find((c) => c.id === selectedCiclo);

  const getEmailPreview = () => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const exampleToken = "exemplo_token_placeholder";
    const linkUrl = `${appUrl}/questionario/${exampleToken}`;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">VIVAMENTE360</h1>
        </div>
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333;">Olá, colaborador@exemplo.com</h2>
          <p style="color: #666; line-height: 1.6;">
            Você foi convidado(a) a responder o questionário de avaliação de riscos psicossociais
            do ciclo: <strong>${cicloSelecionado?.nome}</strong>
          </p>
          <p style="color: #666; line-height: 1.6;">
            Este questionário é confidencial e anônimo. Suas respostas ajudarão a empresa a
            identificar e prevenir riscos no ambiente de trabalho.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${linkUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 40px;
                      text-decoration: none;
                      border-radius: 8px;
                      display: inline-block;">
              Responder Questionário
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Ou copie e cole este link no navegador:<br/>
            <code>${linkUrl}</code>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Este link expira em 48 horas.
          </p>
        </div>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Conformidade: NR-1 | LGPD | GRO/PGR</p>
        </div>
      </div>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envio em Massa de Questionários
          </DialogTitle>
          <DialogDescription>
            Envie questionários para {colaboradores.length} colaborador(es)
            selecionado(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seleção de Ciclo */}
          <div className="space-y-2">
            <Label htmlFor="ciclo">Ciclo de Avaliação</Label>
            {isLoadingCiclos ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando ciclos...
              </div>
            ) : ciclos.length === 0 ? (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                Nenhum ciclo ativo encontrado. Crie um ciclo primeiro.
              </div>
            ) : (
              <Select value={selectedCiclo} onValueChange={setSelectedCiclo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ciclo" />
                </SelectTrigger>
                <SelectContent>
                  {ciclos.map((ciclo) => (
                    <SelectItem key={ciclo.id} value={ciclo.id}>
                      {ciclo.nome} (
                      {format(new Date(ciclo.dataInicio), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}{" "}
                      -{" "}
                      {format(new Date(ciclo.dataFim), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Preview de Colaboradores */}
          <div className="space-y-2">
            <Label>Colaboradores Selecionados</Label>
            <ScrollArea className="h-[150px] rounded-md border p-4">
              <div className="space-y-2">
                {colaboradores.map((colaborador) => (
                  <div
                    key={colaborador.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{colaborador.email}</span>
                    <div className="flex gap-1">
                      {colaborador.unidade && (
                        <Badge variant="outline" className="text-xs">
                          {colaborador.unidade.nome}
                        </Badge>
                      )}
                      {colaborador.setor && (
                        <Badge variant="outline" className="text-xs">
                          {colaborador.setor.nome}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview do Email */}
          {selectedCiclo && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Ocultar" : "Visualizar"} Preview do Email
              </Button>

              {showPreview && (
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div
                    dangerouslySetInnerHTML={{ __html: getEmailPreview() }}
                  />
                </ScrollArea>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {isSending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Enviando emails...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Resultados */}
          {sendResults && (
            <div className="space-y-2">
              {sendResults.success > 0 && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {sendResults.success} email(s) enviado(s) com sucesso
                </div>
              )}
              {sendResults.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {sendResults.errors.length} erro(s)
                  </div>
                  <ScrollArea className="h-[100px] rounded-md border p-2">
                    <div className="space-y-1">
                      {sendResults.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-600">
                          {error.email}: {error.erro}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Informações */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Informações Importantes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Os links expiram em 48 horas</li>
                  <li>Máximo de 500 emails por envio</li>
                  <li>Links anteriores do mesmo ciclo serão invalidados</li>
                  <li>Emails enviados apenas para colaboradores ativos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !selectedCiclo || ciclos.length === 0}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Emails
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
