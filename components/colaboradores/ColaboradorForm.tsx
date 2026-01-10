"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColaboradorSchema, type CreateColaboradorInput } from "@/types/colaborador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Unidade {
  id: string;
  nome: string;
}

interface Setor {
  id: string;
  nome: string;
  unidadeId: string;
}

interface Cargo {
  id: string;
  nome: string;
  setorId: string;
}

interface ColaboradorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaborador?: any; // Se fornecido, é modo edição
  onSuccess: () => void;
}

export default function ColaboradorForm({
  open,
  onOpenChange,
  colaborador,
  onSuccess,
}: ColaboradorFormProps) {
  const isEditing = !!colaborador;

  const [isLoading, setIsLoading] = useState(false);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [setoresFiltrados, setSetoresFiltrados] = useState<Setor[]>([]);
  const [cargosFiltrados, setCargosFiltrados] = useState<Cargo[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateColaboradorInput>({
    resolver: zodResolver(createColaboradorSchema),
    defaultValues: {
      email: "",
      unidadeId: "",
      setorId: "",
      cargoId: "",
      dataNascimento: undefined,
      sexo: "NAO_INFORMADO",
    },
  });

  const unidadeId = watch("unidadeId");
  const setorId = watch("setorId");

  // Carregar dados quando o dialog abrir
  useEffect(() => {
    if (open) {
      fetchUnidades();
      fetchSetores();
      fetchCargos();

      // Se estiver editando, preencher o formulário
      if (colaborador) {
        setValue("email", colaborador.email);
        setValue("unidadeId", colaborador.unidadeId);
        setValue("setorId", colaborador.setorId);
        setValue("cargoId", colaborador.cargoId);
        setValue("sexo", colaborador.sexo);

        if (colaborador.dataNascimento) {
          const date = new Date(colaborador.dataNascimento);
          setValue("dataNascimento", format(date, "yyyy-MM-dd"));
        }
      } else {
        reset();
      }
    }
  }, [open, colaborador]);

  // Filtrar setores quando mudar a unidade
  useEffect(() => {
    if (unidadeId) {
      const filtered = setores.filter((s) => s.unidadeId === unidadeId);
      setSetoresFiltrados(filtered);

      // Se o setor selecionado não pertence à unidade, limpar
      const currentSetorId = watch("setorId");
      if (currentSetorId && !filtered.find((s) => s.id === currentSetorId)) {
        setValue("setorId", "");
        setValue("cargoId", "");
      }
    } else {
      setSetoresFiltrados([]);
      setValue("setorId", "");
      setValue("cargoId", "");
    }
  }, [unidadeId, setores]);

  // Filtrar cargos quando mudar o setor
  useEffect(() => {
    if (setorId) {
      const filtered = cargos.filter((c) => c.setorId === setorId);
      setCargosFiltrados(filtered);

      // Se o cargo selecionado não pertence ao setor, limpar
      const currentCargoId = watch("cargoId");
      if (currentCargoId && !filtered.find((c) => c.id === currentCargoId)) {
        setValue("cargoId", "");
      }
    } else {
      setCargosFiltrados([]);
      setValue("cargoId", "");
    }
  }, [setorId, cargos]);

  const fetchUnidades = async () => {
    try {
      const response = await fetch("/api/unidades");
      if (response.ok) {
        const data = await response.json();
        setUnidades(data);
      }
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
    }
  };

  const fetchSetores = async () => {
    try {
      const response = await fetch("/api/setores");
      if (response.ok) {
        const data = await response.json();
        setSetores(data);
      }
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  };

  const fetchCargos = async () => {
    try {
      const response = await fetch("/api/cargos");
      if (response.ok) {
        const data = await response.json();
        setCargos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
    }
  };

  const onSubmit = async (data: CreateColaboradorInput) => {
    setIsLoading(true);

    try {
      const url = isEditing
        ? `/api/colaboradores/${colaborador.id}`
        : "/api/colaboradores";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          isEditing
            ? "Colaborador atualizado com sucesso!"
            : "Colaborador criado com sucesso!"
        );
        onSuccess();
        onOpenChange(false);
        reset();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao salvar colaborador");
      }
    } catch (error) {
      console.error("Erro ao salvar colaborador:", error);
      toast.error("Erro ao salvar colaborador");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-50">
            {isEditing ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {isEditing
              ? "Atualize as informações do colaborador"
              : "Cadastre um novo colaborador no sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
              placeholder="colaborador@empresa.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="dataNascimento" className="text-zinc-300">
                Data de Nascimento
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="dataNascimento"
                  type="date"
                  {...register("dataNascimento")}
                  className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100"
                />
              </div>
              {errors.dataNascimento && (
                <p className="text-sm text-red-500">
                  {errors.dataNascimento.message}
                </p>
              )}
            </div>

            {/* Sexo */}
            <div className="space-y-2">
              <Label htmlFor="sexo" className="text-zinc-300">
                Sexo
              </Label>
              <Select
                value={watch("sexo")}
                onValueChange={(value) => setValue("sexo", value as any)}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="NAO_INFORMADO">Não Informado</SelectItem>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Unidade */}
          <div className="space-y-2">
            <Label htmlFor="unidade" className="text-zinc-300">
              Unidade <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("unidadeId")}
              onValueChange={(value) => setValue("unidadeId", value)}
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {unidades.map((unidade) => (
                  <SelectItem key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unidadeId && (
              <p className="text-sm text-red-500">{errors.unidadeId.message}</p>
            )}
          </div>

          {/* Setor */}
          <div className="space-y-2">
            <Label htmlFor="setor" className="text-zinc-300">
              Setor <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("setorId")}
              onValueChange={(value) => setValue("setorId", value)}
              disabled={!unidadeId}
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue
                  placeholder={
                    unidadeId
                      ? "Selecione um setor"
                      : "Selecione uma unidade primeiro"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {setoresFiltrados.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.setorId && (
              <p className="text-sm text-red-500">{errors.setorId.message}</p>
            )}
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label htmlFor="cargo" className="text-zinc-300">
              Cargo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("cargoId")}
              onValueChange={(value) => setValue("cargoId", value)}
              disabled={!setorId}
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue
                  placeholder={
                    setorId
                      ? "Selecione um cargo"
                      : "Selecione um setor primeiro"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {cargosFiltrados.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cargoId && (
              <p className="text-sm text-red-500">{errors.cargoId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>{isEditing ? "Atualizar" : "Criar"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
