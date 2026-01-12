/**
 * Sistema de Cache com Redis
 * Otimiza queries pesadas do Prisma
 */

import Redis from 'ioredis';

// Inicializar Redis
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null; // Se não houver Redis configurado, funciona sem cache

/**
 * Busca dados do cache ou executa função e armazena resultado
 * @param key - Chave única do cache
 * @param fetcher - Função que busca os dados
 * @param ttl - Tempo de vida do cache em segundos (padrão: 5 minutos)
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutos
): Promise<T> {
  // Se Redis não está configurado, apenas executa a função
  if (!redis) {
    return await fetcher();
  }

  try {
    // Tentar buscar do cache
    const cached = await redis.get(key);

    if (cached) {
      console.log(`[Cache HIT] ${key}`);
      return JSON.parse(cached) as T;
    }

    // Se não encontrou no cache, busca os dados
    console.log(`[Cache MISS] ${key}`);
    const data = await fetcher();

    // Armazena no cache (fire-and-forget)
    redis.setex(key, ttl, JSON.stringify(data)).catch((err) => {
      console.error(`[Cache ERROR] Falha ao armazenar ${key}:`, err);
    });

    return data;
  } catch (error) {
    console.error(`[Cache ERROR] ${key}:`, error);
    // Se houver erro no cache, apenas executa a função
    return await fetcher();
  }
}

/**
 * Invalida cache baseado em padrão
 * @param pattern - Padrão de chaves a invalidar (ex: "empresa:123:*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Cache INVALIDATE] ${keys.length} chaves removidas: ${pattern}`);
    }
  } catch (error) {
    console.error(`[Cache ERROR] Falha ao invalidar ${pattern}:`, error);
  }
}

/**
 * Invalida múltiplos padrões de cache
 * @param patterns - Array de padrões a invalidar
 */
export async function invalidateCacheMultiple(patterns: string[]): Promise<void> {
  if (!redis) return;

  await Promise.all(patterns.map(pattern => invalidateCache(pattern)));
}

/**
 * Remove uma chave específica do cache
 * @param key - Chave a remover
 */
export async function removeCache(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
    console.log(`[Cache REMOVE] ${key}`);
  } catch (error) {
    console.error(`[Cache ERROR] Falha ao remover ${key}:`, error);
  }
}

/**
 * Verifica se uma chave existe no cache
 * @param key - Chave a verificar
 */
export async function hasCache(key: string): Promise<boolean> {
  if (!redis) return false;

  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`[Cache ERROR] Falha ao verificar ${key}:`, error);
    return false;
  }
}

/**
 * Define o tempo de vida de uma chave existente
 * @param key - Chave a atualizar
 * @param ttl - Novo tempo de vida em segundos
 */
export async function setCacheTTL(key: string, ttl: number): Promise<void> {
  if (!redis) return;

  try {
    await redis.expire(key, ttl);
    console.log(`[Cache TTL] ${key} -> ${ttl}s`);
  } catch (error) {
    console.error(`[Cache ERROR] Falha ao definir TTL de ${key}:`, error);
  }
}

// Funções auxiliares para padrões comuns de cache

/**
 * Cache para dashboard de empresa
 */
export const CacheKeys = {
  dashboard: (empresaId: string) => `dashboard:${empresaId}`,
  stats: (empresaId: string) => `stats:${empresaId}`,
  cicloAtivo: (empresaId: string) => `ciclo:ativo:${empresaId}`,
  respostas: (cicloId: string) => `respostas:ciclo:${cicloId}`,
  colaboradores: (empresaId: string) => `colaboradores:${empresaId}`,
  empresa: (empresaId: string) => `empresa:${empresaId}`,
  unidades: (empresaId: string) => `unidades:${empresaId}`,
  setores: (empresaId: string) => `setores:${empresaId}`,
  analytics: (empresaId: string, cicloId: string) => `analytics:${empresaId}:${cicloId}`,
} as const;

/**
 * Invalida todo o cache de uma empresa
 */
export async function invalidateEmpresaCache(empresaId: string): Promise<void> {
  await invalidateCacheMultiple([
    `dashboard:${empresaId}*`,
    `stats:${empresaId}*`,
    `ciclo:ativo:${empresaId}*`,
    `colaboradores:${empresaId}*`,
    `empresa:${empresaId}*`,
    `unidades:${empresaId}*`,
    `setores:${empresaId}*`,
    `analytics:${empresaId}*`,
  ]);
}

/**
 * Invalida cache de um ciclo específico
 */
export async function invalidateCicloCache(cicloId: string, empresaId?: string): Promise<void> {
  const patterns = [`respostas:ciclo:${cicloId}*`];

  if (empresaId) {
    patterns.push(`analytics:${empresaId}:${cicloId}*`);
    patterns.push(`ciclo:ativo:${empresaId}*`);
  }

  await invalidateCacheMultiple(patterns);
}
