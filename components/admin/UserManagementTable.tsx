'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2, UserPlus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserFormDialog } from './UserFormDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type User = {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'RH' | 'LIDERANCA';
  ativo: boolean;
  empresaId: string | null;
  empresa: { id: string; nome: string } | null;
  unidadeId: string | null;
  unidade: { id: string; nome: string } | null;
  setorId: string | null;
  setor: { id: string; nome: string } | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count?: { auditLogs: number };
};

type Empresa = {
  id: string;
  nome: string;
  unidades: Array<{
    id: string;
    nome: string;
    setores: Array<{
      id: string;
      nome: string;
    }>;
  }>;
};

interface UserManagementTableProps {
  usuarios: User[];
  empresas: Empresa[];
}

export default function UserManagementTable({ usuarios: initialUsuarios, empresas }: UserManagementTableProps) {
  const [usuarios, setUsuarios] = useState<User[]>(initialUsuarios);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/usuarios/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir usuário');
      }

      setUsuarios(usuarios.filter(u => u.id !== selectedUser.id));
      toast.success('Usuário desativado com sucesso');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error('Erro ao desativar usuário', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCreated = (newUser: User) => {
    setUsuarios([newUser, ...usuarios]);
    setIsCreateDialogOpen(false);
    toast.success('Usuário criado com sucesso');
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsuarios(usuarios.map(u => u.id === updatedUser.id ? updatedUser : u));
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    toast.success('Usuário atualizado com sucesso');
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      ADMIN: { variant: 'destructive', label: 'Admin' },
      RH: { variant: 'default', label: 'RH' },
      LIDERANCA: { variant: 'secondary', label: 'Liderança' },
    };
    const config = variants[role] || { variant: 'outline' as const, label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
      <Badge variant="outline" className="bg-emerald-900/30 text-emerald-400 border-emerald-700">
        Ativo
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-700">
        Inativo
      </Badge>
    );
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('nome')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Perfil',
      cell: ({ row }) => getRoleBadge(row.getValue('role')),
    },
    {
      accessorKey: 'empresa',
      header: 'Empresa',
      cell: ({ row }) => {
        const empresa = row.original.empresa;
        return empresa ? (
          <span className="text-sm">{empresa.nome}</span>
        ) : (
          <span className="text-zinc-400 text-sm italic">Nenhuma</span>
        );
      },
    },
    {
      accessorKey: 'unidade',
      header: 'Unidade',
      cell: ({ row }) => {
        const unidade = row.original.unidade;
        return unidade ? (
          <span className="text-sm">{unidade.nome}</span>
        ) : (
          <span className="text-zinc-400 text-sm italic">-</span>
        );
      },
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('ativo')),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Último Login',
      cell: ({ row }) => {
        const lastLogin = row.getValue('lastLoginAt') as string | null;
        return lastLogin ? (
          <span className="text-sm">
            {format(new Date(lastLogin), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        ) : (
          <span className="text-zinc-400 text-sm italic">Nunca</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user);
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user);
                  setIsDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Desativar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa e ações */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={(table.getColumn('nome')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('nome')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
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
                  className="h-24 text-center"
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>

      {/* Diálogo de criação */}
      <UserFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        empresas={empresas}
        onSuccess={handleUserCreated}
      />

      {/* Diálogo de edição */}
      {selectedUser && (
        <UserFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          empresas={empresas}
          user={selectedUser}
          onSuccess={handleUserUpdated}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá desativar o usuário <strong>{selectedUser?.nome}</strong>.
              O usuário não poderá mais fazer login no sistema, mas seus dados serão mantidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
