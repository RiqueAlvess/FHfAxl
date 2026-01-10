"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const cicloSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  ativo: z.boolean(),
}).refine((data) => {
  const inicio = new Date(data.dataInicio);
  const fim = new Date(data.dataFim);
  return inicio < fim;
}, {
  message: "Data de início deve ser anterior à data de fim",
  path: ["dataFim"],
});

type CicloFormData = z.infer<typeof cicloSchema>;

interface CicloFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ciclo?: any; // Se fornecido, é modo edição
  onSuccess: () => void;
}

export default function CicloForm({
  open,
  onOpenChange,
  ciclo,
  onSuccess,
}: CicloFormProps) {
  const isEditing = !!ciclo;
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CicloFormData>({
    resolver: zodResolver(cicloSchema),
    defaultValues: {
      nome: "",
      dataInicio: "",
      dataFim: "",
      ativo: false,
    },
  });

  const ativo = watch("ativo");

  // Preencher formulário ao editar
  useEffect(() => {
    if (open && ciclo) {
      setValue("nome", ciclo.nome);
      setValue("dataInicio", format(new Date(ciclo.dataInicio), "yyyy-MM-dd"));
      setValue("dataFim", format(new Date(ciclo.dataFim), "yyyy-MM-dd"));
      setValue("ativo", ciclo.ativo);
    } else if (open && !ciclo) {
      // Resetar ao criar novo
      reset();
    }
  }, [open, ciclo, setValue, reset]);

  const onSubmit = async (data: CicloFormData) => {
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/ciclos/${ciclo.id}` : "/api/ciclos";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar ciclo");
      }

      toast.success(
        isEditing
          ? "Ciclo atualizado com sucesso!"
          : "Ciclo criado com sucesso!"
      );
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Erro ao salvar ciclo:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar ciclo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Ciclo de Avaliação" : "Novo Ciclo de Avaliação"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do ciclo de avaliação."
              : "Crie um novo ciclo de avaliação para envio de questionários."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Ciclo</Label>
            <Input
              id="nome"
              placeholder="Ex: Avaliação 1º Semestre 2024"
              {...register("nome")}
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dataInicio"
                  type="date"
                  className="pl-10"
                  {...register("dataInicio")}
                />
              </div>
              {errors.dataInicio && (
                <p className="text-sm text-red-500">
                  {errors.dataInicio.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dataFim"
                  type="date"
                  className="pl-10"
                  {...register("dataFim")}
                />
              </div>
              {errors.dataFim && (
                <p className="text-sm text-red-500">{errors.dataFim.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={(checked) => setValue("ativo", checked)}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Ciclo Ativo
            </Label>
          </div>
          {ativo && (
            <p className="text-sm text-muted-foreground">
              Este ciclo estará disponível para envio de questionários.
            </p>
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
              {isEditing ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
