"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import type { TipoRelatorio, FiltrosRelatorio } from "@/types/reports";

interface FilterOptions {
  ciclos: { id: string; nome: string }[];
  unidades: { id: string; nome: string }[];
  setores: { id: string; nome: string }[];
}

interface FilterSelectorProps {
  empresaId: string;
  options: FilterOptions;
  onFilterChange: (filtros: FiltrosRelatorio) => void;
  isLoading?: boolean;
}

const TIPOS_RELATORIO: Array<{ value: TipoRelatorio; label: string; descricao: string }> = [
  {
    value: "executivo",
    label: "Relatório Executivo",
    descricao: "Resumo de KPIs, Top 5 pontos críticos e recomendações",
  },
  {
    value: "completo",
    label: "Relatório Completo",
    descricao: "Análise detalhada com todos os KPIs, gráficos e insights",
  },
  {
    value: "unidade",
    label: "Relatório por Unidade",
    descricao: "Dados filtrados por unidade com comparativo da empresa",
  },
  {
    value: "setor",
    label: "Relatório por Setor",
    descricao: "Dados filtrados por setor com comparativo da empresa",
  },
  {
    value: "evolucao",
    label: "Relatório de Evolução",
    descricao: "Comparativo entre ciclos e análise de tendências",
  },
];

export default function FilterSelector({
  empresaId,
  options,
  onFilterChange,
  isLoading = false,
}: FilterSelectorProps) {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("executivo");
  const [cicloId, setCicloId] = useState<string>();
  const [unidadeId, setUnidadeId] = useState<string>();
  const [setorId, setSetorId] = useState<string>();
  const [periodo, setPeriodo] = useState<DateRange | undefined>();

  // Filtrar setores baseado na unidade selecionada
  const setoresFiltrados = unidadeId
    ? options.setores.filter((setor) => {
        // Aqui assumimos que os setores tem uma propriedade unidadeId
        // Se não tiver, precisaremos buscar essa informação
        return true; // Simplificado
      })
    : options.setores;

  const handleApplyFilters = () => {
    const filtros: FiltrosRelatorio = {
      empresaId,
      tipoRelatorio,
      cicloAvaliacaoId: cicloId,
      unidadeId: tipoRelatorio === "unidade" ? unidadeId : undefined,
      setorId: tipoRelatorio === "setor" ? setorId : undefined,
      periodoInicio: periodo?.from,
      periodoFim: periodo?.to,
    };

    onFilterChange(filtros);
  };

  const handleResetFilters = () => {
    setTipoRelatorio("executivo");
    setCicloId(undefined);
    setUnidadeId(undefined);
    setSetorId(undefined);
    setPeriodo(undefined);
  };

  // Aplicar filtros automaticamente quando mudarem
  useEffect(() => {
    handleApplyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoRelatorio, cicloId, unidadeId, setorId, periodo]);

  const tipoSelecionado = TIPOS_RELATORIO.find((t) => t.value === tipoRelatorio);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros do Relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Relatório */}
        <div className="space-y-2">
          <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
          <Select
            value={tipoRelatorio}
            onValueChange={(value) => setTipoRelatorio(value as TipoRelatorio)}
            disabled={isLoading}
          >
            <SelectTrigger id="tipo-relatorio">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_RELATORIO.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{tipo.label}</span>
                    <span className="text-xs text-muted-foreground">{tipo.descricao}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tipoSelecionado && (
            <p className="text-sm text-muted-foreground">{tipoSelecionado.descricao}</p>
          )}
        </div>

        {/* Ciclo de Avaliação */}
        <div className="space-y-2">
          <Label htmlFor="ciclo">Ciclo de Avaliação (Opcional)</Label>
          <Select value={cicloId} onValueChange={setCicloId} disabled={isLoading}>
            <SelectTrigger id="ciclo">
              <SelectValue placeholder="Todos os ciclos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os ciclos</SelectItem>
              {options.ciclos.map((ciclo) => (
                <SelectItem key={ciclo.id} value={ciclo.id}>
                  {ciclo.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unidade (apenas para relatório por unidade) */}
        {tipoRelatorio === "unidade" && (
          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade *</Label>
            <Select value={unidadeId} onValueChange={setUnidadeId} disabled={isLoading}>
              <SelectTrigger id="unidade">
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {options.unidades.map((unidade) => (
                  <SelectItem key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!unidadeId && (
              <p className="text-xs text-destructive">Unidade é obrigatória para este tipo de relatório</p>
            )}
          </div>
        )}

        {/* Setor (apenas para relatório por setor) */}
        {tipoRelatorio === "setor" && (
          <div className="space-y-2">
            <Label htmlFor="setor">Setor *</Label>
            <Select value={setorId} onValueChange={setSetorId} disabled={isLoading}>
              <SelectTrigger id="setor">
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
              <SelectContent>
                {setoresFiltrados.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!setorId && (
              <p className="text-xs text-destructive">Setor é obrigatório para este tipo de relatório</p>
            )}
          </div>
        )}

        {/* Período (opcional) */}
        <div className="space-y-2">
          <Label>Período (Opcional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {periodo?.from ? (
                  periodo.to ? (
                    <>
                      {format(periodo.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(periodo.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(periodo.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={periodo?.from}
                selected={periodo}
                onSelect={setPeriodo}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Se não selecionado, serão considerados os últimos 30 dias
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={isLoading}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
