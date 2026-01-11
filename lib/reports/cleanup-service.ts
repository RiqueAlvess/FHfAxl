/**
 * Serviço de Limpeza de Arquivos Temporários
 * Remove arquivos de relatórios com mais de 1 hora
 */

import { readdir, stat, unlink } from "fs/promises";
import { join } from "path";

const TEMP_DIR = join(process.cwd(), "temp", "relatorios");
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hora em milissegundos

/**
 * Limpa arquivos de relatórios que expiraram (mais de 1 hora)
 */
export async function limparArquivosExpirados(): Promise<{
  removidos: number;
  erros: number;
}> {
  let removidos = 0;
  let erros = 0;

  try {
    // Verificar se o diretório existe
    try {
      await stat(TEMP_DIR);
    } catch {
      // Diretório não existe, nada a limpar
      return { removidos: 0, erros: 0 };
    }

    // Ler arquivos do diretório
    const arquivos = await readdir(TEMP_DIR);

    // Verificar idade de cada arquivo
    for (const arquivo of arquivos) {
      try {
        const caminhoCompleto = join(TEMP_DIR, arquivo);
        const stats = await stat(caminhoCompleto);

        // Verificar se é um arquivo (não diretório)
        if (!stats.isFile()) {
          continue;
        }

        // Verificar idade do arquivo
        const idade = Date.now() - stats.mtimeMs;

        if (idade > MAX_AGE_MS) {
          // Remover arquivo expirado
          await unlink(caminhoCompleto);
          removidos++;
          console.log(`Arquivo removido: ${arquivo} (idade: ${Math.round(idade / 1000 / 60)} minutos)`);
        }
      } catch (error) {
        erros++;
        console.error(`Erro ao processar arquivo ${arquivo}:`, error);
      }
    }

    console.log(`Limpeza concluída: ${removidos} arquivos removidos, ${erros} erros`);
  } catch (error) {
    console.error("Erro ao limpar arquivos:", error);
    erros++;
  }

  return { removidos, erros };
}

/**
 * Remove um arquivo específico
 */
export async function removerArquivo(nomeArquivo: string): Promise<boolean> {
  try {
    const caminhoCompleto = join(TEMP_DIR, nomeArquivo);
    await unlink(caminhoCompleto);
    console.log(`Arquivo removido manualmente: ${nomeArquivo}`);
    return true;
  } catch (error) {
    console.error(`Erro ao remover arquivo ${nomeArquivo}:`, error);
    return false;
  }
}

/**
 * Lista arquivos temporários e suas idades
 */
export async function listarArquivosTemporarios(): Promise<
  Array<{
    nome: string;
    tamanhoBytes: number;
    idadeMinutos: number;
    expirado: boolean;
  }>
> {
  const arquivosInfo: Array<{
    nome: string;
    tamanhoBytes: number;
    idadeMinutos: number;
    expirado: boolean;
  }> = [];

  try {
    // Verificar se o diretório existe
    try {
      await stat(TEMP_DIR);
    } catch {
      return [];
    }

    const arquivos = await readdir(TEMP_DIR);

    for (const arquivo of arquivos) {
      try {
        const caminhoCompleto = join(TEMP_DIR, arquivo);
        const stats = await stat(caminhoCompleto);

        if (!stats.isFile()) {
          continue;
        }

        const idade = Date.now() - stats.mtimeMs;
        const idadeMinutos = Math.round(idade / 1000 / 60);

        arquivosInfo.push({
          nome: arquivo,
          tamanhoBytes: stats.size,
          idadeMinutos,
          expirado: idade > MAX_AGE_MS,
        });
      } catch (error) {
        console.error(`Erro ao processar arquivo ${arquivo}:`, error);
      }
    }
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
  }

  return arquivosInfo;
}
