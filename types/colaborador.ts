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
  email: z.string().email(),
  empresaId: z.string(),
  unidadeId: z.string(),
  setorId: z.string(),
  cargoId: z.string(),
  dataNascimento: z.date().optional(),
  sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO", "NAO_INFORMADO"]).default("NAO_INFORMADO"),
});

export type CreateColaboradorInput = z.infer<typeof createColaboradorSchema>;

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
