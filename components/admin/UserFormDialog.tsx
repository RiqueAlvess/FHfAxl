'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const userSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'RH', 'LIDERANCA']),
  empresaId: z.string().optional(),
  unidadeId: z.string().optional(),
  setorId: z.string().optional(),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').optional(),
  ativo: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

type User = {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'RH' | 'LIDERANCA';
  ativo: boolean;
  empresaId: string | null;
  unidadeId: string | null;
  setorId: string | null;
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

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresas: Empresa[];
  user?: User;
  onSuccess: (user: any) => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  empresas,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');
  const [selectedUnidadeId, setSelectedUnidadeId] = useState<string>('');
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      role: user?.role || 'RH',
      empresaId: user?.empresaId || undefined,
      unidadeId: user?.unidadeId || undefined,
      setorId: user?.setorId || undefined,
      ativo: user?.ativo !== undefined ? user.ativo : true,
    },
  });

  const role = watch('role');
  const empresaId = watch('empresaId');
  const unidadeId = watch('unidadeId');

  // Resetar formulário quando dialog abrir/fechar ou usuário mudar
  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          nome: user.nome,
          email: user.email,
          role: user.role,
          empresaId: user.empresaId || undefined,
          unidadeId: user.unidadeId || undefined,
          setorId: user.setorId || undefined,
          ativo: user.ativo,
        });
        setSelectedEmpresaId(user.empresaId || '');
        setSelectedUnidadeId(user.unidadeId || '');
      } else {
        reset({
          nome: '',
          email: '',
          role: 'RH',
          empresaId: undefined,
          unidadeId: undefined,
          setorId: undefined,
          senha: '',
          ativo: true,
        });
        setSelectedEmpresaId('');
        setSelectedUnidadeId('');
      }
    }
  }, [open, user, reset]);

  // Limpar unidade e setor quando empresa mudar
  useEffect(() => {
    if (empresaId !== selectedEmpresaId) {
      setValue('unidadeId', undefined);
      setValue('setorId', undefined);
      setSelectedEmpresaId(empresaId || '');
      setSelectedUnidadeId('');
    }
  }, [empresaId, selectedEmpresaId, setValue]);

  // Limpar setor quando unidade mudar
  useEffect(() => {
    if (unidadeId !== selectedUnidadeId) {
      setValue('setorId', undefined);
      setSelectedUnidadeId(unidadeId || '');
    }
  }, [unidadeId, selectedUnidadeId, setValue]);

  const selectedEmpresa = empresas.find((e) => e.id === empresaId);
  const selectedUnidade = selectedEmpresa?.unidades.find((u) => u.id === unidadeId);

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      const url = user ? `/api/admin/usuarios/${user.id}` : '/api/admin/usuarios';
      const method = user ? 'PUT' : 'POST';

      // Preparar dados para envio
      const payload: any = {
        nome: data.nome,
        email: data.email,
        role: data.role,
        empresaId: data.empresaId || null,
        unidadeId: data.unidadeId || null,
        setorId: data.setorId || null,
        ativo: data.ativo,
      };

      // Incluir senha apenas se fornecida (criar novo usuário ou alterar senha)
      if (data.senha) {
        payload.senha = data.senha;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar usuário');
      }

      const savedUser = await response.json();
      onSuccess(savedUser);
      reset();
    } catch (error: any) {
      toast.error('Erro ao salvar usuário', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {user
              ? 'Atualize as informações do usuário abaixo.'
              : 'Preencha as informações do novo usuário. A senha padrão é "senha123".'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Nome completo"
              disabled={isLoading}
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@exemplo.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Perfil *</Label>
            <Select
              value={role}
              onValueChange={(value) => setValue('role', value as any)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin (acesso total)</SelectItem>
                <SelectItem value="RH">RH (gestão da empresa)</SelectItem>
                <SelectItem value="LIDERANCA">Liderança (acesso limitado)</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Empresa */}
          {(role === 'RH' || role === 'LIDERANCA') && (
            <div className="space-y-2">
              <Label htmlFor="empresaId">Empresa *</Label>
              <Select
                value={empresaId || ''}
                onValueChange={(value) => setValue('empresaId', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.empresaId && (
                <p className="text-sm text-red-600">{errors.empresaId.message}</p>
              )}
            </div>
          )}

          {/* Unidade (opcional para LIDERANCA) */}
          {role === 'LIDERANCA' && empresaId && selectedEmpresa && (
            <div className="space-y-2">
              <Label htmlFor="unidadeId">Unidade (opcional)</Label>
              <Select
                value={unidadeId || ''}
                onValueChange={(value) => setValue('unidadeId', value || undefined)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (acesso a toda empresa)</SelectItem>
                  {selectedEmpresa.unidades.map((unidade) => (
                    <SelectItem key={unidade.id} value={unidade.id}>
                      {unidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Setor (opcional para LIDERANCA) */}
          {role === 'LIDERANCA' && unidadeId && selectedUnidade && (
            <div className="space-y-2">
              <Label htmlFor="setorId">Setor (opcional)</Label>
              <Select
                value={watch('setorId') || ''}
                onValueChange={(value) => setValue('setorId', value || undefined)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum (acesso a toda unidade)</SelectItem>
                  {selectedUnidade.setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.id}>
                      {setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="senha">
              {user ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </Label>
            <Input
              id="senha"
              type="password"
              {...register('senha')}
              placeholder={user ? 'Deixe em branco para não alterar' : 'Mínimo 8 caracteres'}
              disabled={isLoading}
            />
            {errors.senha && (
              <p className="text-sm text-red-600">{errors.senha.message}</p>
            )}
            {!user && (
              <p className="text-xs text-gray-500">
                Se não informada, a senha padrão será "senha123"
              </p>
            )}
          </div>

          {/* Ativo */}
          {user && (
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={watch('ativo')}
                onCheckedChange={(checked) => setValue('ativo', checked)}
                disabled={isLoading}
              />
              <Label htmlFor="ativo">Usuário ativo</Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
