"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

export interface FilterValues {
  busca: string;
  unidadeId: string;
  setorId: string;
  cargoId: string;
  status: "ativo" | "inativo" | "todos";
}

interface ColaboradorFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

export default function ColaboradorFilters({
  filters,
  onFiltersChange,
}: ColaboradorFiltersProps) {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [setoresFiltrados, setSetoresFiltrados] = useState<Setor[]>([]);
  const [cargosFiltrados, setCargosFiltrados] = useState<Cargo[]>([]);

  // Carregar unidades
  useEffect(() => {
    fetchUnidades();
  }, []);

  // Carregar setores e cargos
  useEffect(() => {
    fetchSetores();
    fetchCargos();
  }, []);

  // Filtrar setores baseado na unidade selecionada
  useEffect(() => {
    if (filters.unidadeId) {
      const filtered = setores.filter((s) => s.unidadeId === filters.unidadeId);
      setSetoresFiltrados(filtered);

      // Se o setor selecionado não pertence à unidade, limpar
      if (
        filters.setorId &&
        !filtered.find((s) => s.id === filters.setorId)
      ) {
        handleFilterChange("setorId", "");
        handleFilterChange("cargoId", "");
      }
    } else {
      setSetoresFiltrados(setores);
    }
  }, [filters.unidadeId, setores]);

  // Filtrar cargos baseado no setor selecionado
  useEffect(() => {
    if (filters.setorId) {
      const filtered = cargos.filter((c) => c.setorId === filters.setorId);
      setCargosFiltrados(filtered);

      // Se o cargo selecionado não pertence ao setor, limpar
      if (
        filters.cargoId &&
        !filtered.find((c) => c.id === filters.cargoId)
      ) {
        handleFilterChange("cargoId", "");
      }
    } else {
      setCargosFiltrados(cargos);
    }
  }, [filters.setorId, cargos]);

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
        setSetoresFiltrados(data);
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
        setCargosFiltrados(data);
      }
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
    }
  };

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    // Converter "all" para string vazia em filtros de ID
    const normalizedValue = value === "all" ? "" : value;
    onFiltersChange({
      ...filters,
      [key]: normalizedValue,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      busca: "",
      unidadeId: "",
      setorId: "",
      cargoId: "",
      status: "ativo",
    });
  };

  const hasActiveFilters =
    filters.busca ||
    filters.unidadeId ||
    filters.setorId ||
    filters.cargoId ||
    filters.status !== "ativo";

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca por Email */}
          <div className="space-y-2">
            <Label htmlFor="busca" className="text-zinc-300">
              Buscar por Email
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                id="busca"
                type="text"
                placeholder="email@exemplo.com"
                value={filters.busca}
                onChange={(e) => handleFilterChange("busca", e.target.value)}
                className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Filtro por Unidade */}
          <div className="space-y-2">
            <Label htmlFor="unidade" className="text-zinc-300">
              Unidade
            </Label>
            <Select
              value={filters.unidadeId || "all"}
              onValueChange={(value) => handleFilterChange("unidadeId", value)}
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">Todas</SelectItem>
                {unidades.map((unidade) => (
                  <SelectItem key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Setor */}
          <div className="space-y-2">
            <Label htmlFor="setor" className="text-zinc-300">
              Setor
            </Label>
            <Select
              value={filters.setorId || "all"}
              onValueChange={(value) => handleFilterChange("setorId", value)}
              disabled={!filters.unidadeId && setoresFiltrados.length === 0}
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">Todos</SelectItem>
                {setoresFiltrados.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Cargo */}
          <div className="space-y-2">
            <Label htmlFor="cargo" className="text-zinc-300">
              Cargo
            </Label>
            <Select
              value={filters.cargoId || "all"}
              onValueChange={(value) => handleFilterChange("cargoId", value)}
              disabled={!filters.setorId && cargosFiltrados.length === 0}
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">Todos</SelectItem>
                {cargosFiltrados.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-zinc-300">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                handleFilterChange("status", value as FilterValues["status"])
              }
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão para limpar filtros */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
