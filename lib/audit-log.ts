/**
 * Sistema de Auditoria e Logs de Acesso a Dados Pessoais
 *
 * Em conformidade com a LGPD (Lei Geral de Proteção de Dados),
 * este sistema registra todos os acessos a dados pessoais,
 * exportações, geração de relatórios e operações sensíveis.
 */

import { prisma } from './prisma';

/**
 * Tipos de ações auditadas
 */
export enum AuditAction {
  // Autenticação
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // Operações CRUD
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',

  // Operações sensíveis
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  SEND_EMAIL = 'SEND_EMAIL',

  // Operações LGPD
  LGPD_DATA_ACCESS = 'LGPD_DATA_ACCESS',
  LGPD_DATA_DELETION = 'LGPD_DATA_DELETION',
  LGPD_DATA_PORTABILITY = 'LGPD_DATA_PORTABILITY',
  LGPD_CONSENT_GIVEN = 'LGPD_CONSENT_GIVEN',
  LGPD_CONSENT_REVOKED = 'LGPD_CONSENT_REVOKED',

  // Relatórios
  REPORT_GENERATED = 'REPORT_GENERATED',
  REPORT_DOWNLOADED = 'REPORT_DOWNLOADED',
  ANALYTICS_VIEWED = 'ANALYTICS_VIEWED',

  // K-Anonymity
  K_ANONYMITY_CHECK = 'K_ANONYMITY_CHECK',
  K_ANONYMITY_BLOCKED = 'K_ANONYMITY_BLOCKED',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Entidades auditadas
 */
export enum AuditEntity {
  USER = 'USER',
  COLABORADOR = 'COLABORADOR',
  EMPRESA = 'EMPRESA',
  RESPOSTA = 'RESPOSTA',
  CICLO = 'CICLO',
  MAGIC_LINK = 'MAGIC_LINK',
  ANALYTICS = 'ANALYTICS',
  REPORT = 'REPORT',
  SISTEMA = 'SISTEMA',
}

/**
 * Interface para log de auditoria
 */
export interface AuditLogData {
  userId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Registra um evento de auditoria no banco de dados
 *
 * @param data - Dados do evento de auditoria
 * @returns Log criado
 *
 * @example
 * ```typescript
 * await registrarAuditLog({
 *   userId: session.user.id,
 *   action: AuditAction.ANALYTICS_VIEWED,
 *   entity: AuditEntity.ANALYTICS,
 *   entityId: empresaId,
 *   details: { filtros: { unidadeId: 'xyz' } },
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent']
 * });
 * ```
 */
export async function registrarAuditLog(data: AuditLogData) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details || {},
        ipAddress: data.ipAddress || 'unknown',
        userAgent: data.userAgent,
        timestamp: new Date(),
      },
    });

    return log;
  } catch (error) {
    console.error('Erro ao registrar audit log:', error);
    // Não falhar a operação principal se o log falhar
    return null;
  }
}

/**
 * Registra acesso a dados pessoais (LGPD)
 * Deve ser chamado sempre que dados pessoais são visualizados
 */
export async function registrarAcessoDadosPessoais(
  userId: string,
  colaboradorId: string,
  motivo: string,
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.LGPD_DATA_ACCESS,
    entity: AuditEntity.COLABORADOR,
    entityId: colaboradorId,
    details: {
      motivo,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Registra geração de relatório
 */
export async function registrarGeracaoRelatorio(
  userId: string,
  tipoRelatorio: string,
  filtros: Record<string, any>,
  formato: 'PDF' | 'EXCEL',
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.REPORT_GENERATED,
    entity: AuditEntity.REPORT,
    details: {
      tipoRelatorio,
      filtros,
      formato,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Registra download de relatório
 */
export async function registrarDownloadRelatorio(
  userId: string,
  reportId: string,
  formato: 'PDF' | 'EXCEL',
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.REPORT_DOWNLOADED,
    entity: AuditEntity.REPORT,
    entityId: reportId,
    details: {
      formato,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Registra visualização de analytics/dashboard
 */
export async function registrarVisualizacaoAnalytics(
  userId: string,
  empresaId: string,
  filtros: Record<string, any>,
  respondentes: number,
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.ANALYTICS_VIEWED,
    entity: AuditEntity.ANALYTICS,
    entityId: empresaId,
    details: {
      filtros,
      respondentes,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Registra exportação de dados
 */
export async function registrarExportacaoDados(
  userId: string,
  tipoExportacao: string,
  entidade: AuditEntity,
  quantidade: number,
  filtros?: Record<string, any>,
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.EXPORT,
    entity: entidade,
    details: {
      tipoExportacao,
      quantidade,
      filtros,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Registra importação de dados
 */
export async function registrarImportacaoDados(
  userId: string,
  tipoImportacao: string,
  quantidade: number,
  sucessos: number,
  erros: number,
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.IMPORT,
    entity: AuditEntity.COLABORADOR,
    details: {
      tipoImportacao,
      quantidade,
      sucessos,
      erros,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Registra tentativa de acesso bloqueada por K-Anonymity
 */
export async function registrarBloqueioKAnonymity(
  userId: string,
  empresaId: string,
  filtros: Record<string, any>,
  respondentes: number,
  minRequired: number,
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.K_ANONYMITY_BLOCKED,
    entity: AuditEntity.ANALYTICS,
    entityId: empresaId,
    details: {
      motivo: 'Dados insuficientes para K-Anonymity',
      respondentes,
      minRequired,
      filtros,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Registra consentimento LGPD dado pelo colaborador
 */
export async function registrarConsentimentoLGPD(
  colaboradorId: string,
  magicLinkId: string,
  ipAddress?: string,
  userAgent?: string
) {
  return await registrarAuditLog({
    userId: colaboradorId, // O colaborador é o "usuário" neste contexto
    action: AuditAction.LGPD_CONSENT_GIVEN,
    entity: AuditEntity.RESPOSTA,
    entityId: magicLinkId,
    details: {
      timestamp: new Date().toISOString(),
      consentimento: true,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Registra solicitação de exclusão de dados (direito LGPD)
 */
export async function registrarSolicitacaoExclusao(
  userId: string,
  colaboradorId: string,
  motivo?: string,
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.LGPD_DATA_DELETION,
    entity: AuditEntity.COLABORADOR,
    entityId: colaboradorId,
    details: {
      motivo,
      status: 'SOLICITADO',
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Registra solicitação de portabilidade de dados (direito LGPD)
 */
export async function registrarSolicitacaoPortabilidade(
  userId: string,
  colaboradorId: string,
  formato: string,
  ipAddress?: string
) {
  return await registrarAuditLog({
    userId,
    action: AuditAction.LGPD_DATA_PORTABILITY,
    entity: AuditEntity.COLABORADOR,
    entityId: colaboradorId,
    details: {
      formato,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
  });
}

/**
 * Busca logs de auditoria com filtros
 */
export async function buscarAuditLogs(filtros: {
  userId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};

  if (filtros.userId) where.userId = filtros.userId;
  if (filtros.action) where.action = filtros.action;
  if (filtros.entity) where.entity = filtros.entity;
  if (filtros.entityId) where.entityId = filtros.entityId;

  if (filtros.dataInicio || filtros.dataFim) {
    where.timestamp = {};
    if (filtros.dataInicio) where.timestamp.gte = filtros.dataInicio;
    if (filtros.dataFim) where.timestamp.lte = filtros.dataFim;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filtros.limit || 100,
      skip: filtros.offset || 0,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    hasMore: total > (filtros.offset || 0) + (filtros.limit || 100),
  };
}

/**
 * Busca logs de acesso a dados de um colaborador específico
 * Útil para atender solicitações LGPD de "quem acessou meus dados"
 */
export async function buscarAcessosColaborador(
  colaboradorId: string,
  limit: number = 50
) {
  return await prisma.auditLog.findMany({
    where: {
      entity: AuditEntity.COLABORADOR,
      entityId: colaboradorId,
      action: {
        in: [
          AuditAction.LGPD_DATA_ACCESS,
          AuditAction.VIEW,
          AuditAction.UPDATE,
          AuditAction.EXPORT,
        ],
      },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Gera relatório de auditoria para compliance LGPD
 */
export async function gerarRelatorioAuditoria(
  empresaId: string,
  dataInicio: Date,
  dataFim: Date
) {
  const logs = await prisma.auditLog.findMany({
    where: {
      timestamp: {
        gte: dataInicio,
        lte: dataFim,
      },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          empresaId: true,
        },
      },
    },
  });

  // Filtrar apenas logs da empresa
  const logsDaEmpresa = logs.filter(
    (log) => log.user?.empresaId === empresaId
  );

  // Agrupar por tipo de ação
  const resumo = logsDaEmpresa.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    periodo: {
      inicio: dataInicio,
      fim: dataFim,
    },
    totalLogs: logsDaEmpresa.length,
    resumoPorAcao: resumo,
    logs: logsDaEmpresa,
  };
}

/**
 * Limpa logs antigos (política de retenção)
 * Mantém logs por período definido (ex: 5 anos)
 */
export async function limparLogsAntigos(anosRetencao: number = 5) {
  const dataLimite = new Date();
  dataLimite.setFullYear(dataLimite.getFullYear() - anosRetencao);

  const resultado = await prisma.auditLog.deleteMany({
    where: {
      timestamp: {
        lt: dataLimite,
      },
    },
  });

  console.log(`Logs de auditoria limpos: ${resultado.count} registros removidos`);

  return resultado;
}
