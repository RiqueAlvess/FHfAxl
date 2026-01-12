'use server';

import type { DadosRelatorio } from "@/types/reports";

export async function gerarPDFServer(dados: DadosRelatorio): Promise<{
  caminhoArquivo: string;
  nomeArquivo: string;
}> {
  // Import dinâmico para garantir que só roda no servidor
  const { gerarPDF } = await import("./pdf-generator");
  return gerarPDF(dados);
}
