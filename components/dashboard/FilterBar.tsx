"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface FilterOptions {
  ciclos: { id: string; nome: string }[];
  unidades: { id: string; nome: string }[];
  setores: { id: string; nome: string }[];
}

interface FilterValues {
  cicloId?: string;
  unidadeId?: string;
  setorId?: string;
  periodo?: DateRange;
}

interface FilterBarProps {
  options: FilterOptions;
  onFilterChange: (filters: FilterValues) => void;
  isLoading?: boolean;
}

export default function FilterBar({ options, onFilterChange, isLoading = false }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros
  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  // Limpar filtros
  const handleClearFilters = () => {
    const emptyFilters: FilterValues = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Contar filtros ativos
  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <Card className="bg-zinc-900 border-zinc-800 mb-6">
      <CardContent className="pt-6">
        {/* Cabeçalho do Filtro */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-zinc-100">Filtros</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 text-xs font-semibold bg-violet-500/20 text-violet-300 rounded-full">
                {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-zinc-400 hover:text-zinc-100"
          >
            {showFilters ? "Ocultar" : "Mostrar"}
          </Button>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro de Ciclo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Ciclo de Avaliação
                </label>
                <Select
                  value={filters.cicloId || ""}
                  onValueChange={(value) =>
                    setFilters({ ...filters, cicloId: value || undefined })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Todos os ciclos" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">Todos os ciclos</SelectItem>
                    {options.ciclos.map((ciclo) => (
                      <SelectItem key={ciclo.id} value={ciclo.id}>
                        {ciclo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Unidade */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Unidade Organizacional
                </label>
                <Select
                  value={filters.unidadeId || ""}
                  onValueChange={(value) =>
                    setFilters({ ...filters, unidadeId: value || undefined })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Todas as unidades" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    {options.unidades.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Setor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Setor
                </label>
                <Select
                  value={filters.setorId || ""}
                  onValueChange={(value) =>
                    setFilters({ ...filters, setorId: value || undefined })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {options.setores.map((setor) => (
                      <SelectItem key={setor.id} value={setor.id}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Período */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Período
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700"
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.periodo?.from ? (
                        filters.periodo.to ? (
                          <>
                            {format(filters.periodo.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                            {format(filters.periodo.to, "dd/MM/yy", { locale: ptBR })}
                          </>
                        ) : (
                          format(filters.periodo.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        <span>Selecione o período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.periodo?.from}
                      selected={filters.periodo}
                      onSelect={(range) =>
                        setFilters({ ...filters, periodo: range })
                      }
                      numberOfMonths={2}
                      locale={ptBR}
                      className="bg-zinc-800 text-zinc-100"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                disabled={isLoading || activeFiltersCount === 0}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
              {isLoading && (
                <span className="text-sm text-zinc-400 ml-2">Carregando...</span>
              )}
            </div>

            {/* Resumo dos Filtros Ativos */}
            {activeFiltersCount > 0 && (
              <div className="pt-3 border-t border-zinc-700">
                <div className="text-sm text-zinc-400 mb-2">Filtros ativos:</div>
                <div className="flex flex-wrap gap-2">
                  {filters.cicloId && (
                    <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs font-medium">
                      Ciclo: {options.ciclos.find(c => c.id === filters.cicloId)?.nome || filters.cicloId}
                    </span>
                  )}
                  {filters.unidadeId && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                      Unidade: {options.unidades.find(u => u.id === filters.unidadeId)?.nome || filters.unidadeId}
                    </span>
                  )}
                  {filters.setorId && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                      Setor: {options.setores.find(s => s.id === filters.setorId)?.nome || filters.setorId}
                    </span>
                  )}
                  {filters.periodo?.from && (
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium">
                      Período: {format(filters.periodo.from, "dd/MM/yy", { locale: ptBR })}
                      {filters.periodo.to && ` - ${format(filters.periodo.to, "dd/MM/yy", { locale: ptBR })}`}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
