import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { type RateLimiterType, getRateLimiter, isRedisAvailable } from "./rate-limit"
import { registrarAuditLog, AuditAction, AuditEntity } from "./audit-log"

/**
 * Rate Limiting Helpers
 *
 * Funções utilitárias para aplicar rate limiting nos endpoints
 * com suporte a fallback in-memory quando Redis não está disponível
 */

// ============================================================================
// IN-MEMORY FALLBACK (quando Redis não está configurado)
// ============================================================================

interface InMemoryRateLimitEntry {
  count: number
  resetAt: number
}

// Map para armazenar rate limits in-memory: "limiterType:identifier" => entry
const inMemoryStore = new Map<string, InMemoryRateLimitEntry>()

// Limpa entradas expiradas a cada 1 minuto
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of inMemoryStore.entries()) {
    if (entry.resetAt < now) {
      inMemoryStore.delete(key)
    }
  }
}, 60_000)

/**
 * Configuração de limites para fallback in-memory
 */
const FALLBACK_LIMITS: Record<RateLimiterType, { limit: number; window: number }> = {
  login: { limit: 5, window: 15 * 60 * 1000 }, // 5 req / 15 min
  "magic-link:generate": { limit: 5, window: 10 * 60 * 1000 }, // 5 req / 10 min
  "magic-link:resend": { limit: 5, window: 10 * 60 * 1000 }, // 5 req / 10 min
  "magic-link:validate": { limit: 10, window: 60 * 1000 }, // 10 req / 1 min
  "questionario:submit": { limit: 1, window: 30 * 1000 }, // 1 req / 30 seg
  "csv-import": { limit: 3, window: 60 * 1000 }, // 3 req / 1 min
  "pdf-report": { limit: 2, window: 60 * 1000 }, // 2 req / 1 min
  "excel-report": { limit: 2, window: 60 * 1000 }, // 2 req / 1 min
  "dashboard-analytics": { limit: 30, window: 60 * 1000 }, // 30 req / 1 min
  "api-read": { limit: 60, window: 60 * 1000 }, // 60 req / 1 min
  "api-write": { limit: 30, window: 60 * 1000 }, // 30 req / 1 min
  "api-general": { limit: 100, window: 60 * 1000 }, // 100 req / 1 min
  global: { limit: 100, window: 10 * 1000 }, // 100 req / 10 seg
}

/**
 * Verifica rate limit usando armazenamento in-memory (fallback)
 */
function checkInMemoryRateLimit(
  limiterType: RateLimiterType,
  identifier: string
): { success: boolean; limit: number; remaining: number; reset: number } {
  const key = `${limiterType}:${identifier}`
  const config = FALLBACK_LIMITS[limiterType]
  const now = Date.now()

  let entry = inMemoryStore.get(key)

  // Se não existe ou expirou, criar nova entrada
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + config.window,
    }
    inMemoryStore.set(key, entry)

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: entry.resetAt,
    }
  }

  // Incrementar contador
  entry.count++

  // Verificar se excedeu o limite
  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetAt,
    }
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: entry.resetAt,
  }
}

// ============================================================================
// EXTRAÇÃO DE IDENTIFICADORES
// ============================================================================

/**
 * Extrai o IP real do cliente considerando proxies e load balancers
 */
export function getClientIp(request: NextRequest): string {
  // Tentar headers comuns de proxies/load balancers
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip") // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for pode conter múltiplos IPs: "client, proxy1, proxy2"
    const ips = forwardedFor.split(",").map((ip) => ip.trim())
    return ips[0] // Retorna o primeiro (cliente original)
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback para IP remoto (não confiável em produção com proxies)
  return (request as any).ip || "unknown"
}

/**
 * Extrai informações do User Agent
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown"
}

// ============================================================================
// APLICAÇÃO DE RATE LIMITING
// ============================================================================

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export interface RateLimitOptions {
  /** Tipo de rate limiter a ser usado */
  limiterType: RateLimiterType

  /** Identificador único (userId, IP, token, etc) */
  identifier: string

  /** Request para extrair informações adicionais */
  request: NextRequest

  /** UserId para audit log (opcional) */
  userId?: string

  /** Informações adicionais para audit log */
  auditDetails?: Record<string, unknown>
}

/**
 * Aplica rate limiting e retorna o resultado
 *
 * @example
 * ```ts
 * const result = await applyRateLimit({
 *   limiterType: "magic-link:generate",
 *   identifier: session.user.id,
 *   request,
 *   userId: session.user.id,
 * })
 *
 * if (!result.success) {
 *   return createRateLimitResponse(result)
 * }
 * ```
 */
export async function applyRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { limiterType, identifier, request, userId, auditDetails } = options

  // Verificar se Redis está disponível
  if (!isRedisAvailable) {
    console.warn(`⚠️  Rate limiting usando fallback in-memory para ${limiterType}`)
    return checkInMemoryRateLimit(limiterType, identifier)
  }

  // Obter rate limiter
  const limiter = getRateLimiter(limiterType)

  if (!limiter) {
    console.error(`❌ Rate limiter não encontrado: ${limiterType}`)
    // Fallback para in-memory se o limiter não existir
    return checkInMemoryRateLimit(limiterType, identifier)
  }

  try {
    // Aplicar rate limit via Upstash
    const { success, limit, reset, remaining } = await limiter.limit(identifier)

    // Registrar no audit log se bloqueado
    if (!success) {
      const ip = getClientIp(request)
      const userAgent = getUserAgent(request)

      await registrarAuditLog({
        userId: userId || "system",
        action: AuditAction.RATE_LIMIT_EXCEEDED,
        entity: AuditEntity.SISTEMA,
        details: {
          limiterType,
          identifier,
          limit,
          reset,
          ip,
          userAgent,
          ...auditDetails,
        },
        ipAddress: ip,
        userAgent,
      })

      console.warn(`🚨 Rate limit excedido: ${limiterType} | ${identifier} | IP: ${ip}`)
    }

    return {
      success,
      limit,
      remaining,
      reset,
    }
  } catch (error) {
    console.error(`❌ Erro ao verificar rate limit (${limiterType}):`, error)
    // Em caso de erro, permitir a requisição (fail open)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    }
  }
}

/**
 * Cria uma resposta 429 (Too Many Requests) com headers apropriados
 *
 * @example
 * ```ts
 * if (!result.success) {
 *   return createRateLimitResponse(result)
 * }
 * ```
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000)

  return NextResponse.json(
    {
      error: "Muitas requisições. Por favor, aguarde antes de tentar novamente.",
      message: `Você excedeu o limite de ${result.limit} requisições. Tente novamente em ${retryAfterSeconds} segundos.`,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  )
}

/**
 * Middleware helper para aplicar rate limiting facilmente em route handlers
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const session = await auth()
 *   if (!session) return unauthorizedResponse()
 *
 *   // Aplicar rate limiting
 *   const rateLimitCheck = await withRateLimit({
 *     limiterType: "magic-link:generate",
 *     identifier: session.user.id,
 *     request,
 *     userId: session.user.id,
 *   })
 *
 *   if (rateLimitCheck) return rateLimitCheck // Retorna 429 se bloqueado
 *
 *   // Continuar processamento normal...
 * }
 * ```
 */
export async function withRateLimit(
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const result = await applyRateLimit(options)

  if (!result.success) {
    return createRateLimitResponse(result)
  }

  return null // Permite continuar
}

/**
 * Adiciona headers de rate limit na resposta de sucesso
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.reset.toString())

  return response
}
