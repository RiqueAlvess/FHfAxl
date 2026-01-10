"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

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

interface ListaCiclosProps {
  ciclos: Ciclo[];
  onEdit: (ciclo: Ciclo) => void;
  onDelete: (cicloId: string) => void;
  onToggleAtivo: (cicloId: string, ativo: boolean) => void;
  onViewDetails: (ciclo: Ciclo) => void;
  onSendEmails: (ciclo: Ciclo) => void;
}

export default function ListaCiclos({
  ciclos,
  onEdit,
  onDelete,
  onToggleAtivo,
  onViewDetails,
  onSendEmails,
}: ListaCiclosProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cicloToDelete, setCicloToDelete] = useState<string | null>(null);

  const handleDeleteClick = (cicloId: string) => {
    setCicloToDelete(cicloId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (cicloToDelete) {
      onDelete(cicloToDelete);
      setDeleteDialogOpen(false);
      setCicloToDelete(null);
    }
  };

  const calculateProgress = (stats: Ciclo["stats"]) => {
    const total = stats.enviados + stats.pendentes;
    if (total === 0) return 0;
    return Math.round((stats.completados / total) * 100);
  };

  const getCicloStatus = (ciclo: Ciclo) => {
    const now = new Date();
    const inicio = new Date(ciclo.dataInicio);
    const fim = new Date(ciclo.dataFim);

    if (!ciclo.ativo) return "inativo";
    if (now < inicio) return "agendado";
    if (now > fim) return "encerrado";
    return "ativo";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      agendado: "secondary",
      encerrado: "outline",
      inativo: "destructive",
    } as const;

    const labels = {
      ativo: "Ativo",
      agendado: "Agendado",
      encerrado: "Encerrado",
      inativo: "Inativo",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (ciclos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Nenhum ciclo de avaliação cadastrado.
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Crie um novo ciclo para começar a enviar questionários.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ciclos.map((ciclo) => {
        const status = getCicloStatus(ciclo);
        const progress = calculateProgress(ciclo.stats);

        return (
          <Card key={ciclo.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{ciclo.nome}</CardTitle>
                    {getStatusBadge(status)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(ciclo.dataInicio), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}{" "}
                    até{" "}
                    {format(new Date(ciclo.dataFim), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(ciclo)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onToggleAtivo(ciclo.id, !ciclo.ativo)}
                    >
                      {ciclo.ativo ? (
                        <>
                          <PauseCircle className="mr-2 h-4 w-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewDetails(ciclo)}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onSendEmails(ciclo)}
                      disabled={!ciclo.ativo}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Emails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(ciclo.id)}
                      className="text-red-600"
                      disabled={ciclo._count.respostas > 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Progresso de Respostas
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Enviados</p>
                    <p className="text-2xl font-bold">{ciclo.stats.enviados}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Acessados</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {ciclo.stats.acessados}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Completados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {ciclo.stats.completados}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {ciclo.stats.pendentes}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Expirados</p>
                    <p className="text-2xl font-bold text-red-600">
                      {ciclo.stats.expirados}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este ciclo de avaliação? Esta ação
              não pode ser desfeita. Todos os magic links associados serão
              removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
