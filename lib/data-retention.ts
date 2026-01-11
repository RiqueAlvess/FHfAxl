/**
 * Política de Retenção de Dados (LGPD)
 *
 * Implementa a política de retenção de dados conforme LGPD Art. 15 e 16.
 * Dados pessoais são mantidos apenas pelo período necessário para cumprimento
 * de obrigações legais (5 anos conforme legislação trabalhista brasileira).
 */

import { prisma } from './prisma';
import { AuditAction, AuditEntity, registrarAuditLog } from './audit-log';

/**
 * Período de retenção padrão em anos
 * Baseado em obrigações legais trabalhistas (CLT Art. 11)
 */
export const ANOS_RETENCAO_PADRAO = 5;

/**
 * Interface para resultado do expurgo
 */
export interface ResultadoExpurgo {
  colaboradoresAnonimizados: number;
  respostasAnonimizadas: number;
  magicLinksRemovidos: number;
  logsAntigos: number;
  timestamp: Date;
  erros: string[];
}

/**
 * Calcula data de retenção (5 anos a partir de uma data base)
 */
export function calcularDataRetencao(dataBase: Date = new Date()): Date {
  const dataRetencao = new Date(dataBase);
  dataRetencao.setFullYear(dataRetencao.getFullYear() + ANOS_RETENCAO_PADRAO);
  return dataRetencao;
}

/**
 * Anonimiza dados de um colaborador
 * Mantém apenas dados agregados estatísticos
 */
async function anonimizarColaborador(colaboradorId: string): Promise<void> {
  await prisma.colaborador.update({
    where: { id: colaboradorId },
    data: {
      email: `anonimo_${colaboradorId}@expurgado.local`,
      dataNascimento: null,
      sexo: 'NAO_INFORMADO',
      ativo: false,
      dataRetencao: null, // Já foi expurgado
    },
  });
}

/**
 * Anonimiza respostas de um colaborador
 * Remove dados identificáveis mas mantém scores agregados
 */
async function anonimizarRespostas(colaboradorId: string): Promise<number> {
  const respostas = await prisma.resposta.findMany({
    where: { colaboradorId },
  });

  for (const resposta of respostas) {
    await prisma.resposta.update({
      where: { id: resposta.id },
      data: {
        // Manter scores para estatísticas agregadas
        // Remover dados de consentimento que identificam o usuário
        consentimentoIp: null,
        consentimentoUserAgent: null,
        // Marcar como anonimizado
        consentimentoDataHora: null,
      },
    });
  }

  return respostas.length;
}

/**
 * Remove magic links expirados e antigos
 */
async function removerMagicLinksAntigos(dataLimite: Date): Promise<number> {
  const resultado = await prisma.magicLink.deleteMany({
    where: {
      createdAt: {
        lt: dataLimite,
      },
      status: {
        in: ['EXPIRED', 'COMPLETED'],
      },
    },
  });

  return resultado.count;
}

/**
 * Executa expurgo de dados antigos conforme política de retenção
 *
 * @param dryRun - Se true, apenas simula sem fazer alterações
 * @param userId - ID do usuário que executou o expurgo (para auditoria)
 * @returns Resultado do expurgo com contagens
 *
 * @example
 * ```typescript
 * // Executar expurgo real
 * const resultado = await executarExpurgoDados('admin-user-id');
 *
 * // Simular expurgo (dry run)
 * const simulacao = await executarExpurgoDados('admin-user-id', true);
 * ```
 */
export async function executarExpurgoDados(
  userId: string,
  dryRun: boolean = false
): Promise<ResultadoExpurgo> {
  const resultado: ResultadoExpurgo = {
    colaboradoresAnonimizados: 0,
    respostasAnonimizadas: 0,
    magicLinksRemovidos: 0,
    logsAntigos: 0,
    timestamp: new Date(),
    erros: [],
  };

  try {
    console.log(`Iniciando expurgo de dados (dryRun: ${dryRun})...`);

    // 1. Buscar colaboradores com data de retenção expirada
    const colaboradoresExpirados = await prisma.colaborador.findMany({
      where: {
        dataRetencao: {
          not: null,
          lt: new Date(), // Data de retenção já passou
        },
        ativo: true, // Apenas colaboradores ainda não anonimizados
      },
    });

    console.log(`Encontrados ${colaboradoresExpirados.length} colaboradores para anonimizar`);

    // 2. Anonimizar colaboradores e suas respostas
    for (const colaborador of colaboradoresExpirados) {
      try {
        if (!dryRun) {
          // Anonimizar respostas
          const respostasAnonimizadas = await anonimizarRespostas(colaborador.id);
          resultado.respostasAnonimizadas += respostasAnonimizadas;

          // Anonimizar colaborador
          await anonimizarColaborador(colaborador.id);
          resultado.colaboradoresAnonimizados++;

          console.log(`Colaborador ${colaborador.id} anonimizado (${respostasAnonimizadas} respostas)`);
        } else {
          // Dry run: apenas contar
          const contagem = await prisma.resposta.count({
            where: { colaboradorId: colaborador.id },
          });
          resultado.colaboradoresAnonimizados++;
          resultado.respostasAnonimizadas += contagem;
        }
      } catch (error) {
        const errorMsg = `Erro ao anonimizar colaborador ${colaborador.id}: ${error}`;
        console.error(errorMsg);
        resultado.erros.push(errorMsg);
      }
    }

    // 3. Remover magic links antigos (mais de 1 ano)
    const dataLimiteMagicLinks = new Date();
    dataLimiteMagicLinks.setFullYear(dataLimiteMagicLinks.getFullYear() - 1);

    if (!dryRun) {
      resultado.magicLinksRemovidos = await removerMagicLinksAntigos(dataLimiteMagicLinks);
    } else {
      // Dry run: apenas contar
      resultado.magicLinksRemovidos = await prisma.magicLink.count({
        where: {
          createdAt: { lt: dataLimiteMagicLinks },
          status: { in: ['EXPIRED', 'COMPLETED'] },
        },
      });
    }

    console.log(`Magic links antigos removidos: ${resultado.magicLinksRemovidos}`);

    // 4. Limpar logs de auditoria antigos (manter apenas 5 anos)
    const { limparLogsAntigos } = await import('./audit-log');
    if (!dryRun) {
      const resultadoLogs = await limparLogsAntigos(ANOS_RETENCAO_PADRAO);
      resultado.logsAntigos = resultadoLogs.count;
    }

    // 5. Registrar execução do expurgo no audit log
    if (!dryRun) {
      await registrarAuditLog({
        userId,
        action: AuditAction.DELETE,
        entity: AuditEntity.SISTEMA,
        details: {
          operacao: 'EXPURGO_DADOS',
          resultado,
          dryRun,
        },
      });
    }

    console.log('Expurgo concluído:', resultado);
    return resultado;
  } catch (error) {
    const errorMsg = `Erro ao executar expurgo: ${error}`;
    console.error(errorMsg);
    resultado.erros.push(errorMsg);
    return resultado;
  }
}

/**
 * Atualiza data de retenção de um colaborador
 * Deve ser chamado quando o colaborador responde um novo questionário
 */
export async function atualizarDataRetencao(colaboradorId: string): Promise<void> {
  const dataRetencao = calcularDataRetencao();

  await prisma.colaborador.update({
    where: { id: colaboradorId },
    data: { dataRetencao },
  });

  console.log(`Data de retenção atualizada para colaborador ${colaboradorId}: ${dataRetencao}`);
}

/**
 * Retorna estatísticas sobre dados próximos do expurgo
 */
export async function obterEstatisticasRetencao(): Promise<{
  colaboradoresAtivos: number;
  colaboradoresExpiraramEsteAno: number;
  colaboradoresExpiramProximoAno: number;
  totalDadosAnonimizados: number;
}> {
  const agora = new Date();
  const fimAnoAtual = new Date(agora.getFullYear(), 11, 31);
  const fimProximoAno = new Date(agora.getFullYear() + 1, 11, 31);

  const [
    colaboradoresAtivos,
    colaboradoresExpiraramEsteAno,
    colaboradoresExpiramProximoAno,
    totalDadosAnonimizados,
  ] = await Promise.all([
    prisma.colaborador.count({
      where: { ativo: true },
    }),
    prisma.colaborador.count({
      where: {
        dataRetencao: {
          not: null,
          lt: fimAnoAtual,
          gte: agora,
        },
        ativo: true,
      },
    }),
    prisma.colaborador.count({
      where: {
        dataRetencao: {
          not: null,
          lt: fimProximoAno,
          gte: fimAnoAtual,
        },
        ativo: true,
      },
    }),
    prisma.colaborador.count({
      where: { ativo: false }, // Colaboradores já anonimizados
    }),
  ]);

  return {
    colaboradoresAtivos,
    colaboradoresExpiraramEsteAno,
    colaboradoresExpiramProximoAno,
    totalDadosAnonimizados,
  };
}

/**
 * Verifica se um colaborador está próximo do expurgo (faltam menos de 6 meses)
 */
export async function verificarColaboradorProximoExpurgo(colaboradorId: string): Promise<{
  proximoExpurgo: boolean;
  dataRetencao: Date | null;
  diasRestantes: number | null;
}> {
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
    select: { dataRetencao: true },
  });

  if (!colaborador?.dataRetencao) {
    return {
      proximoExpurgo: false,
      dataRetencao: null,
      diasRestantes: null,
    };
  }

  const agora = new Date();
  const dataRetencao = colaborador.dataRetencao;
  const diasRestantes = Math.floor(
    (dataRetencao.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Considera próximo do expurgo se faltar menos de 6 meses (180 dias)
  const proximoExpurgo = diasRestantes <= 180 && diasRestantes > 0;

  return {
    proximoExpurgo,
    dataRetencao,
    diasRestantes,
  };
}
