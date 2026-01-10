import { prisma } from "@/lib/prisma";
import { csvColaboradorSchema, CsvImportResult } from "@/types/colaborador";
import { parse, isValid } from "date-fns";
import { Prisma } from "@prisma/client";

interface CsvRow {
  email: string;
  unidade: string;
  setor: string;
  cargo: string;
  data_nascimento?: string;
  sexo?: string;
}

// Normaliza uma linha do CSV
function normalizeRow(row: CsvRow): CsvRow {
  return {
    email: row.email?.toString().trim().toLowerCase() || "",
    unidade: row.unidade?.toString().trim() || "",
    setor: row.setor?.toString().trim() || "",
    cargo: row.cargo?.toString().trim() || "",
    data_nascimento: row.data_nascimento?.toString().trim() || undefined,
    sexo: row.sexo?.toString().trim().toUpperCase() || undefined,
  };
}

// Tenta fazer o parse da data em múltiplos formatos
function parseDate(dateString: string): Date | undefined {
  const formats = [
    "dd/MM/yyyy",
    "yyyy-MM-dd",
    "dd-MM-yyyy",
    "yyyy/MM/dd",
  ];

  for (const format of formats) {
    try {
      const parsed = parse(dateString, format, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      // Continua tentando outros formatos
    }
  }

  return undefined;
}

// Processa um batch de linhas
async function processBatch(
  rows: CsvRow[],
  empresaId: string,
  startIndex: number,
  tx: Prisma.TransactionClient,
  result: CsvImportResult
): Promise<void> {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const linha = startIndex + i + 2; // +2 porque linha 1 é o cabeçalho e arrays começam em 0

    try {
      console.log(`[CSV Import] Processando linha ${linha}:`, row.email);

      // Normalizar dados
      const normalizedRow = normalizeRow(row);

      // Validar dados da linha
      const validatedRow = csvColaboradorSchema.parse(normalizedRow);

      console.log(`[CSV Import] Linha ${linha} validada com sucesso`);

      // Buscar ou criar Unidade
      let unidade = await tx.unidade.findFirst({
        where: {
          nome: validatedRow.unidade,
          empresaId,
        },
      });

      if (!unidade) {
        console.log(`[CSV Import] Criando nova unidade: ${validatedRow.unidade}`);
        unidade = await tx.unidade.create({
          data: {
            nome: validatedRow.unidade,
            empresaId,
          },
        });
      }

      // Buscar ou criar Setor
      let setor = await tx.setor.findFirst({
        where: {
          nome: validatedRow.setor,
          unidadeId: unidade.id,
        },
      });

      if (!setor) {
        console.log(`[CSV Import] Criando novo setor: ${validatedRow.setor}`);
        setor = await tx.setor.create({
          data: {
            nome: validatedRow.setor,
            unidadeId: unidade.id,
          },
        });
      }

      // Buscar ou criar Cargo
      let cargo = await tx.cargo.findFirst({
        where: {
          nome: validatedRow.cargo,
          setorId: setor.id,
        },
      });

      if (!cargo) {
        console.log(`[CSV Import] Criando novo cargo: ${validatedRow.cargo}`);
        cargo = await tx.cargo.create({
          data: {
            nome: validatedRow.cargo,
            setorId: setor.id,
          },
        });
      }

      // Processar data de nascimento
      let dataNascimento: Date | undefined;
      if (validatedRow.data_nascimento) {
        dataNascimento = parseDate(validatedRow.data_nascimento);
        if (!dataNascimento) {
          console.warn(
            `[CSV Import] Data inválida na linha ${linha}: ${validatedRow.data_nascimento}`
          );
        }
      }

      // Processar sexo
      let sexo: "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO" = "NAO_INFORMADO";
      if (validatedRow.sexo) {
        const sexoMap: Record<string, typeof sexo> = {
          M: "MASCULINO",
          F: "FEMININO",
          O: "OUTRO",
        };
        sexo = sexoMap[validatedRow.sexo] || "NAO_INFORMADO";
      }

      // Verificar se colaborador já existe
      const existingColaborador = await tx.colaborador.findUnique({
        where: { email: validatedRow.email },
      });

      if (existingColaborador) {
        console.log(`[CSV Import] Atualizando colaborador existente: ${validatedRow.email}`);
      } else {
        console.log(`[CSV Import] Criando novo colaborador: ${validatedRow.email}`);
      }

      // Criar ou atualizar colaborador
      await tx.colaborador.upsert({
        where: { email: validatedRow.email },
        update: {
          unidadeId: unidade.id,
          setorId: setor.id,
          cargoId: cargo.id,
          dataNascimento,
          sexo,
          ativo: true,
        },
        create: {
          email: validatedRow.email,
          empresaId,
          unidadeId: unidade.id,
          setorId: setor.id,
          cargoId: cargo.id,
          dataNascimento,
          sexo,
        },
      });

      result.success++;
      console.log(`[CSV Import] Linha ${linha} processada com sucesso (${result.success}/${result.total})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error(`[CSV Import] Erro na linha ${linha}:`, errorMessage);

      result.errors.push({
        linha,
        email: row.email,
        erro: errorMessage,
      });
    }
  }
}

export async function importColaboradoresFromCsv(
  rows: CsvRow[],
  empresaId: string
): Promise<CsvImportResult> {
  console.log(`[CSV Import] Iniciando importação de ${rows.length} linhas`);

  const result: CsvImportResult = {
    success: 0,
    errors: [],
    total: rows.length,
  };

  // Validar limite
  if (rows.length > 5000) {
    throw new Error("Limite de 5.000 linhas por importação excedido");
  }

  // Processar em transação com batches
  const BATCH_SIZE = 100;

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, Math.min(i + BATCH_SIZE, rows.length));
        console.log(
          `[CSV Import] Processando batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)} (${batch.length} linhas)`
        );

        await processBatch(batch, empresaId, i, tx, result);

        // Verificar se há muitos erros após cada batch
        if (result.errors.length > rows.length * 0.1) {
          throw new Error(
            `Muitos erros na importação (${result.errors.length}/${rows.length}). Transação cancelada.`
          );
        }
      }

      console.log(
        `[CSV Import] Importação concluída: ${result.success} sucessos, ${result.errors.length} erros`
      );
    });
  } catch (error) {
    console.error("[CSV Import] Erro durante transação:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("Erro no banco de dados durante importação");
    }
    throw error;
  }

  return result;
}
