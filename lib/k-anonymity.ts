/**
 * Sistema de K-Anonymity para proteção de privacidade
 *
 * K-Anonymity garante que cada registro em um dataset não pode ser distinguido
 * de pelo menos K-1 outros registros, protegendo a identidade dos indivíduos.
 *
 * Neste sistema, usamos K=5 (mínimo de 5 respondentes) para garantir que
 * nenhuma resposta individual possa ser identificada ou inferida.
 */

import { prisma } from './prisma';

/**
 * Valor mínimo de K para garantir anonimidade
 * Com K=5, cada grupo deve ter pelo menos 5 respondentes
 */
export const MIN_K_ANONYMITY = 5;

/**
 * Interface para filtros de segmentação
 */
export interface FiltrosSegmentacao {
  unidadeId?: string;
  setorId?: string;
  cargoId?: string;
  cicloAvaliacaoId?: string;
}

/**
 * Interface para resultado da verificação de K-Anonymity
 */
export interface ResultadoKAnonymity {
  passed: boolean;
  count: number;
  minRequired: number;
  message: string;
}

/**
 * Verifica se um grupo de dados atende ao requisito mínimo de K-Anonymity
 *
 * @param empresaId - ID da empresa
 * @param filtros - Filtros opcionais para segmentação (unidade, setor, cargo, ciclo)
 * @returns Resultado da verificação com status e contagem
 *
 * @example
 * ```typescript
 * const result = await verificarKAnonymity('empresa123', {
 *   unidadeId: 'unidade456',
 *   setorId: 'setor789'
 * });
 *
 * if (!result.passed) {
 *   throw new Error(result.message);
 * }
 * ```
 */
export async function verificarKAnonymity(
  empresaId: string,
  filtros?: FiltrosSegmentacao
): Promise<ResultadoKAnonymity> {
  try {
    // Construir query base
    const whereClause: any = {
      colaborador: {
        empresaId,
        ativo: true,
      },
    };

    // Aplicar filtros se fornecidos
    if (filtros?.cicloAvaliacaoId) {
      whereClause.cicloAvaliacaoId = filtros.cicloAvaliacaoId;
    }

    if (filtros?.unidadeId) {
      whereClause.colaborador = {
        ...whereClause.colaborador,
        unidadeId: filtros.unidadeId,
      };
    }

    if (filtros?.setorId) {
      whereClause.colaborador = {
        ...whereClause.colaborador,
        setorId: filtros.setorId,
      };
    }

    if (filtros?.cargoId) {
      whereClause.colaborador = {
        ...whereClause.colaborador,
        cargoId: filtros.cargoId,
      };
    }

    // Contar respostas que atendem os critérios
    const count = await prisma.resposta.count({
      where: whereClause,
    });

    const passed = count >= MIN_K_ANONYMITY;

    return {
      passed,
      count,
      minRequired: MIN_K_ANONYMITY,
      message: passed
        ? `Grupo atende K-Anonymity (${count} respondentes)`
        : `Grupo não atende K-Anonymity. Necessário mínimo ${MIN_K_ANONYMITY} respondentes, encontrados ${count}. Dados não serão exibidos para proteger a privacidade dos participantes.`,
    };
  } catch (error) {
    console.error('Erro ao verificar K-Anonymity:', error);
    return {
      passed: false,
      count: 0,
      minRequired: MIN_K_ANONYMITY,
      message: 'Erro ao verificar requisitos de privacidade.',
    };
  }
}

/**
 * Wrapper genérico para retornar dados apenas se passar verificação K-Anonymity
 *
 * @param empresaId - ID da empresa
 * @param filtros - Filtros de segmentação
 * @param fetchData - Função assíncrona que retorna os dados
 * @returns Dados se passar K-Anonymity, null caso contrário
 *
 * @example
 * ```typescript
 * const analytics = await getDadosProtegidos(
 *   'empresa123',
 *   { unidadeId: 'unidade456' },
 *   async () => {
 *     return await calcularAnalytics('empresa123', { unidadeId: 'unidade456' });
 *   }
 * );
 *
 * if (!analytics) {
 *   return { error: 'Dados insuficientes para K-Anonymity' };
 * }
 * ```
 */
export async function getDadosProtegidos<T>(
  empresaId: string,
  filtros: FiltrosSegmentacao,
  fetchData: () => Promise<T>
): Promise<{ data: T | null; kAnonymity: ResultadoKAnonymity }> {
  // Primeiro verificar K-Anonymity
  const kAnonymity = await verificarKAnonymity(empresaId, filtros);

  // Se não passar, retornar null
  if (!kAnonymity.passed) {
    return {
      data: null,
      kAnonymity,
    };
  }

  // Se passar, buscar e retornar os dados
  const data = await fetchData();

  return {
    data,
    kAnonymity,
  };
}

/**
 * Verifica K-Anonymity para múltiplos segmentos simultaneamente
 * Útil para relatórios que comparam múltiplas unidades/setores
 *
 * @param empresaId - ID da empresa
 * @param segmentos - Array de filtros para cada segmento
 * @returns Map com resultado de K-Anonymity para cada segmento
 *
 * @example
 * ```typescript
 * const resultados = await verificarKAnonymityMultiplo('empresa123', [
 *   { unidadeId: 'unidade1' },
 *   { unidadeId: 'unidade2' },
 *   { setorId: 'setor1' }
 * ]);
 *
 * // Filtrar apenas segmentos que passaram
 * const segmentosValidos = resultados.filter(r => r.resultado.passed);
 * ```
 */
export async function verificarKAnonymityMultiplo(
  empresaId: string,
  segmentos: FiltrosSegmentacao[]
): Promise<Array<{ filtros: FiltrosSegmentacao; resultado: ResultadoKAnonymity }>> {
  const resultados = await Promise.all(
    segmentos.map(async (filtros) => ({
      filtros,
      resultado: await verificarKAnonymity(empresaId, filtros),
    }))
  );

  return resultados;
}

/**
 * Valida se dados agregados mantêm K-Anonymity após aplicar filtros
 * Previne drill-down que possa identificar indivíduos
 *
 * @param empresaId - ID da empresa
 * @param filtrosBase - Filtros base aplicados
 * @param filtrosAdicionais - Novos filtros a serem aplicados
 * @returns true se os filtros combinados ainda atendem K-Anonymity
 */
export async function validarFiltrosCombinados(
  empresaId: string,
  filtrosBase: FiltrosSegmentacao,
  filtrosAdicionais: FiltrosSegmentacao
): Promise<ResultadoKAnonymity> {
  const filtrosCombinados = {
    ...filtrosBase,
    ...filtrosAdicionais,
  };

  return await verificarKAnonymity(empresaId, filtrosCombinados);
}

/**
 * Retorna mensagem amigável para o usuário quando K-Anonymity não é atendido
 */
export function getMensagemKAnonymityNaoAtendido(
  count: number,
  tipoSegmento?: string
): string {
  const segmento = tipoSegmento || 'este grupo';

  if (count === 0) {
    return `Não há respostas disponíveis para ${segmento}.`;
  }

  if (count < MIN_K_ANONYMITY) {
    return `Para proteger a privacidade dos participantes, ${segmento} precisa ter pelo menos ${MIN_K_ANONYMITY} respondentes. Atualmente há ${count} resposta(s). Os dados não podem ser exibidos para evitar identificação individual.`;
  }

  return 'Dados insuficientes para exibição.';
}

/**
 * Verifica se um ciclo específico tem respostas suficientes
 * para análise com K-Anonymity
 */
export async function verificarCicloKAnonymity(
  cicloAvaliacaoId: string
): Promise<ResultadoKAnonymity> {
  try {
    const count = await prisma.resposta.count({
      where: {
        cicloAvaliacaoId,
      },
    });

    const passed = count >= MIN_K_ANONYMITY;

    return {
      passed,
      count,
      minRequired: MIN_K_ANONYMITY,
      message: passed
        ? `Ciclo atende K-Anonymity (${count} respondentes)`
        : getMensagemKAnonymityNaoAtendido(count, 'o ciclo de avaliação'),
    };
  } catch (error) {
    console.error('Erro ao verificar K-Anonymity do ciclo:', error);
    return {
      passed: false,
      count: 0,
      minRequired: MIN_K_ANONYMITY,
      message: 'Erro ao verificar requisitos de privacidade.',
    };
  }
}

/**
 * Registra tentativa de acesso a dados que não atendem K-Anonymity
 * para auditoria de segurança
 */
export async function registrarTentativaAcessoNegada(
  userId: string,
  empresaId: string,
  filtros: FiltrosSegmentacao,
  count: number
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'VIEW',
        entity: 'ANALYTICS',
        entityId: empresaId,
        details: {
          motivo: 'K_ANONYMITY_NAO_ATENDIDO',
          count,
          minRequired: MIN_K_ANONYMITY,
          filtros: filtros as any,
          timestamp: new Date().toISOString(),
        } as any,
        ipAddress: 'internal',
      },
    });
  } catch (error) {
    console.error('Erro ao registrar tentativa de acesso negada:', error);
  }
}
