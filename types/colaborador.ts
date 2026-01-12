import { z } from "zod";

// Schema para validação de CSV
export const csvColaboradorSchema = z.object({
  email: z.string().email("Email inválido"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  setor: z.string().min(1, "Setor é obrigatório"),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  data_nascimento: z.string().optional(),
  sexo: z.enum(["M", "F", "O", ""]).optional(),
});

export type CsvColaboradorInput = z.infer<typeof csvColaboradorSchema>;

// Schema para criar colaborador
export const createColaboradorSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase(),
  unidadeId: z.string().min(1, "Unidade é obrigatória"),
  setorId: z.string().min(1, "Setor é obrigatório"),
  cargoId: z.string().min(1, "Cargo é obrigatório"),
  dataNascimento: z.string().optional().nullable(),
  sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO", "NAO_INFORMADO"]),
});

export type CreateColaboradorInput = z.infer<typeof createColaboradorSchema>;

// Schema para atualizar colaborador
export const updateColaboradorSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().optional(),
  unidadeId: z.string().min(1, "Unidade é obrigatória").optional(),
  setorId: z.string().min(1, "Setor é obrigatório").optional(),
  cargoId: z.string().min(1, "Cargo é obrigatório").optional(),
  dataNascimento: z.string().optional().nullable(),
  sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO", "NAO_INFORMADO"]).optional(),
  ativo: z.boolean().optional(),
});

export type UpdateColaboradorInput = z.infer<typeof updateColaboradorSchema>;

// Tipo para resultados de importação CSV
export interface CsvImportResult {
  success: number;
  errors: Array<{
    linha: number;
    email?: string;
    erro: string;
  }>;
  total: number;
}

// Tipo para o colaborador completo (usado na interface)
export interface ColaboradorDetalhado {
  id: string;
  email: string;
  dataNascimento: Date | null;
  sexo: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  unidade: {
    id: string;
    nome: string;
  };
  setor: {
    id: string;
    nome: string;
  };
  cargo: {
    id: string;
    nome: string;
  };
  magicLinks?: Array<{
    id: string;
    token: string;
    status: string;
    sentAt: Date | null;
    accessedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
  }>;
}

// Tipo para filtros de colaboradores
export interface ColaboradorFilters {
  busca?: string;
  unidadeId?: string;
  setorId?: string;
  cargoId?: string;
  status?: "ativo" | "inativo" | "todos";
  page?: number;
  limit?: number;
}
