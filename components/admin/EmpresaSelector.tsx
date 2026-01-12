'use client';

import { useEffect, useState } from 'react';
import { useEmpresa } from '@/contexts/EmpresaContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type Empresa = {
  id: string;
  nome: string;
  cnpj: string;
};

export function EmpresaSelector() {
  const { empresaAtiva, setEmpresaAtiva } = useEmpresa();

  // Buscar lista de empresas
  const { data: empresas, isLoading } = useQuery<Empresa[]>({
    queryKey: ['empresas-list'],
    queryFn: async () => {
      const response = await fetch('/api/admin/empresas');
      if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
      }
      const data = await response.json();
      return data.empresas || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (!empresas || empresas.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Nenhuma empresa cadastrada</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={empresaAtiva || 'all'}
        onValueChange={(value) => setEmpresaAtiva(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as empresas</SelectItem>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id}>
              {empresa.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
