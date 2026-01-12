import { prisma } from './prisma';
import { AcaoAuditoria } from '@prisma/client';
import type { NextRequest } from 'next/server';

interface AuditLogData {
  userId: string;
  action: AcaoAuditoria;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Cria um log de auditoria
 */
export async function createAuditLog(
  userId: string,
  action: AcaoAuditoria,
  entity: string,
  entityId?: string,
  request?: NextRequest,
  details?: Record<string, any>
): Promise<void> {
  try {
    const ipAddress = request?.headers.get('x-forwarded-for') ||
                      request?.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request?.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log de auditoria não deve quebrar a aplicação
    console.error('Erro ao criar log de auditoria:', error);
  }
}

/**
 * Busca logs de auditoria com filtros
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: AcaoAuditoria;
  entity?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.entity) where.entity = filters.entity;

  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
