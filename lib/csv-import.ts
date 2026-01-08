import { prisma } from "@/lib/prisma";
import { csvColaboradorSchema, CsvImportResult } from "@/types/colaborador";
import { parse } from "date-fns";
import { Prisma } from "@prisma/client";

interface CsvRow {
  email: string;
  unidade: string;
  setor: string;
  cargo: string;
  data_nascimento?: string;
  sexo?: string;
}

export async function importColaboradoresFromCsv(
  rows: CsvRow[],
  empresaId: string
): Promise<CsvImportResult> {
  const result: CsvImportResult = {
    success: 0,
    errors: [],
    total: rows.length,
  };

  // Validar limite
  if (rows.length > 5000) {
    throw new Error("Limite de 5.000 linhas por importação excedido");
  }

  // Processar em transação
  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const linha = i + 2; // +2 porque linha 1 é o cabeçalho e arrays começam em 0

        try {
          // Validar dados da linha
          const validatedRow = csvColaboradorSchema.parse(row);

          // Buscar ou criar Unidade
          let unidade = await tx.unidade.findFirst({
            where: {
              nome: validatedRow.unidade,
              empresaId,
            },
          });

          if (!unidade) {
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
            try {
              dataNascimento = parse(
                validatedRow.data_nascimento,
                "dd/MM/yyyy",
                new Date()
              );
            } catch {
              // Ignora data inválida
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
        } catch (error) {
          result.errors.push({
            linha,
            email: row.email,
            erro: error instanceof Error ? error.message : "Erro desconhecido",
          });
        }
      }

      // Se houver muitos erros, cancelar transação
      if (result.errors.length > rows.length * 0.1) {
        throw new Error(
          `Muitos erros na importação (${result.errors.length}/${rows.length}). Transação cancelada.`
        );
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("Erro no banco de dados durante importação");
    }
    throw error;
  }

  return result;
}
