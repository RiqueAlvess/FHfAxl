"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ColaboradorTableProps {
  colaboradores: Colaborador[];
  onEdit: (colaborador: Colaborador) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export default function ColaboradorTable({
  colaboradores,
  onEdit,
  onDelete,
  canEdit,
}: ColaboradorTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] =
    useState<Colaborador | null>(null);
  const [magicLinks, setMagicLinks] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const columns = useMemo<ColumnDef<Colaborador>[]>(
    () => [
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-zinc-800"
            >
              Email
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium text-zinc-100">{row.original.email}</div>
        ),
      },
      {
        accessorKey: "unidade.nome",
        header: "Unidade",
        cell: ({ row }) => (
          <div className="text-zinc-300">{row.original.unidade.nome}</div>
        ),
      },
      {
        accessorKey: "setor.nome",
        header: "Setor",
        cell: ({ row }) => (
          <div className="text-zinc-300">{row.original.setor.nome}</div>
        ),
      },
      {
        accessorKey: "cargo.nome",
        header: "Cargo",
        cell: ({ row }) => (
          <div className="text-zinc-300">{row.original.cargo.nome}</div>
        ),
      },
      {
        accessorKey: "ativo",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.ativo ? "default" : "outline"}
            className={
              row.original.ativo
                ? "bg-green-600 hover:bg-green-700"
                : "bg-zinc-700 text-zinc-300"
            }
          >
            {row.original.ativo ? "Ativo" : "Inativo"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(row.original)}
              className="hover:bg-zinc-800"
            >
              <Eye className="h-4 w-4 text-violet-400" />
            </Button>
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(row.original)}
                  className="hover:bg-zinc-800"
                >
                  <Pencil className="h-4 w-4 text-blue-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(row.original.id)}
                  className="hover:bg-zinc-800"
                  disabled={!row.original.ativo}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [canEdit, onEdit, onDelete]
  );

  const table = useReactTable({
    data: colaboradores,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleViewDetails = async (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setDetailsOpen(true);
    setLoadingDetails(true);

    try {
      const response = await fetch(`/api/colaboradores/${colaborador.id}`);
      if (response.ok) {
        const data = await response.json();
        setMagicLinks(data.magicLinks || []);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      toast.error("Erro ao carregar detalhes do colaborador");
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: "Pendente", color: "bg-yellow-600" },
      SENT: { label: "Enviado", color: "bg-blue-600" },
      ACCESSED: { label: "Acessado", color: "bg-violet-600" },
      COMPLETED: { label: "Concluído", color: "bg-green-600" },
      EXPIRED: { label: "Expirado", color: "bg-red-600" },
    };

    const info = statusMap[status] || { label: status, color: "bg-zinc-600" };

    return (
      <Badge className={`${info.color} hover:${info.color}`}>
        {info.label}
      </Badge>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Tabela */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-zinc-800 hover:bg-zinc-800/50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-zinc-300">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-zinc-500"
                  >
                    Nenhum colaborador encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              colaboradores.length
            )}{" "}
            de {colaboradores.length} colaboradores
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-zinc-300">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">
              Detalhes do Colaborador
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Informações completas e histórico de magic links
            </DialogDescription>
          </DialogHeader>

          {selectedColaborador && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="history">Histórico de Links</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-400">Email</Label>
                    <p className="text-zinc-100">{selectedColaborador.email}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant={selectedColaborador.ativo ? "default" : "outline"}
                        className={
                          selectedColaborador.ativo
                            ? "bg-green-600"
                            : "bg-zinc-700"
                        }
                      >
                        {selectedColaborador.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Unidade</Label>
                    <p className="text-zinc-100">
                      {selectedColaborador.unidade.nome}
                    </p>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Setor</Label>
                    <p className="text-zinc-100">
                      {selectedColaborador.setor.nome}
                    </p>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Cargo</Label>
                    <p className="text-zinc-100">
                      {selectedColaborador.cargo.nome}
                    </p>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Sexo</Label>
                    <p className="text-zinc-100">
                      {selectedColaborador.sexo === "NAO_INFORMADO"
                        ? "Não Informado"
                        : selectedColaborador.sexo === "MASCULINO"
                        ? "Masculino"
                        : selectedColaborador.sexo === "FEMININO"
                        ? "Feminino"
                        : "Outro"}
                    </p>
                  </div>
                  {selectedColaborador.dataNascimento && (
                    <div>
                      <Label className="text-zinc-400">Data de Nascimento</Label>
                      <p className="text-zinc-100">
                        {format(
                          new Date(selectedColaborador.dataNascimento),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-zinc-400">Cadastrado em</Label>
                    <p className="text-zinc-100">
                      {format(
                        new Date(selectedColaborador.createdAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {loadingDetails ? (
                  <div className="text-center py-8 text-zinc-500">
                    Carregando histórico...
                  </div>
                ) : magicLinks.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    Nenhum magic link enviado ainda
                  </div>
                ) : (
                  <div className="space-y-3">
                    {magicLinks.map((link: any) => (
                      <Card key={link.id} className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-zinc-200">
                              {link.cicloAvaliacao.nome}
                            </CardTitle>
                            {getStatusBadge(link.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="text-sm text-zinc-400 space-y-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Criado:</span>{" "}
                              {format(new Date(link.createdAt), "dd/MM/yyyy HH:mm")}
                            </div>
                            {link.sentAt && (
                              <div>
                                <span className="font-medium">Enviado:</span>{" "}
                                {format(new Date(link.sentAt), "dd/MM/yyyy HH:mm")}
                              </div>
                            )}
                            {link.accessedAt && (
                              <div>
                                <span className="font-medium">Acessado:</span>{" "}
                                {format(new Date(link.accessedAt), "dd/MM/yyyy HH:mm")}
                              </div>
                            )}
                            {link.completedAt && (
                              <div>
                                <span className="font-medium">Concluído:</span>{" "}
                                {format(new Date(link.completedAt), "dd/MM/yyyy HH:mm")}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Expira:</span>{" "}
                              {format(new Date(link.expiresAt), "dd/MM/yyyy HH:mm")}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium ${className || ""}`}>{children}</div>;
}
