"use client";

import { useState } from "react";
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
import { Pencil, Trash2, Lock } from "lucide-react";
import type { User, Empresa, Unidade, Setor } from "@prisma/client";

type UserWithRelations = User & {
  empresa: Empresa | null;
  unidade: Unidade | null;
  setor: Setor | null;
};

type EmpresaWithRelations = Empresa & {
  unidades: (Unidade & {
    setores: Setor[];
  })[];
};

interface UserManagementTableProps {
  usuarios: UserWithRelations[];
  empresas: EmpresaWithRelations[];
}

export default function UserManagementTable({
  usuarios,
  empresas,
}: UserManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsuarios = usuarios.filter((user) =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-yellow-500">ADMIN</Badge>;
      case "RH":
        return <Badge className="bg-blue-500">RH</Badge>;
      case "LIDERANCA":
        return <Badge className="bg-green-500">LIDERANÇA</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por nome, email ou role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsuarios.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.empresa ? (
                      <span className="text-sm">{user.empresa.nome}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.unidade ? (
                      <span className="text-sm">{user.unidade.nome}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.setor ? (
                      <span className="text-sm">{user.setor.nome}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.ativo ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Editar usuário"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Resetar senha"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Desativar usuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resumo */}
      <div className="text-sm text-gray-500">
        Mostrando {filteredUsuarios.length} de {usuarios.length} usuários
      </div>
    </div>
  );
}
