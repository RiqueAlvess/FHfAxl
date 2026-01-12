import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * Configuração central de Rate Limiting do VIVAMENTE360
 *
 * Utiliza Upstash Redis para gerenciar limites de requisições
 * em diferentes endpoints críticos da aplicação.
 *
 * @see https://upstash.com/docs/oss/sdks/ts/ratelimit/overview
 */

// Verificar se as variáveis de ambiente estão configuradas
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

// Flag para indicar se o Redis está disponível
export const isRedisAvailable = !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)

// Criar instância do Redis apenas se as credenciais existirem
let redis: Redis | null = null

if (isRedisAvailable) {
  try {
    redis = new Redis({
      url: UPSTASH_REDIS_REST_URL!,
      token: UPSTASH_REDIS_REST_TOKEN!,
    })
    console.log("✅ Upstash Redis configurado para rate limiting")
  } catch (error) {
    console.error("❌ Erro ao configurar Upstash Redis:", error)
    console.warn("⚠️  Rate limiting funcionará em modo fallback (in-memory)")
  }
} else {
  console.warn("⚠️  Variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN não configuradas")
  console.warn("⚠️  Rate limiting funcionará em modo fallback (in-memory)")
}

/**
 * Rate Limiter para Login/Autenticação
 * Limite: 5 tentativas por 15 minutos por IP
 * Previne: Ataques de força bruta
 */
export const loginLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "auth:login",
}) : null

/**
 * Rate Limiter para Geração de Magic Links
 * Limite: 5 requisições por 10 minutos por usuário
 * Previne: Spam de emails, uso excessivo do serviço Resend
 */
export const magicLinkGenerateLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "magic-link:generate",
}) : null

/**
 * Rate Limiter para Reenvio de Magic Links
 * Limite: 5 requisições por 10 minutos por usuário
 * Previne: Spam de emails
 */
export const magicLinkResendLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "magic-link:resend",
}) : null

/**
 * Rate Limiter para Validação de Magic Links
 * Limite: 10 requisições por minuto por IP
 * Previne: Tentativas de descobrir tokens válidos
 */
export const magicLinkValidateLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "magic-link:validate",
}) : null

/**
 * Rate Limiter para Submissão de Questionário
 * Limite: 1 requisição por 30 segundos por IP+token
 * Previne: Múltiplas submissões duplicadas, spam
 */
export const questionarioSubmitLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "30 s"),
  analytics: true,
  prefix: "questionario:submit",
}) : null

/**
 * Rate Limiter para Importação de CSV
 * Limite: 3 requisições por minuto por usuário
 * Previne: Sobrecarga do banco de dados, processamento excessivo
 */
export const csvImportLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "colaboradores:import-csv",
}) : null

/**
 * Rate Limiter para Geração de Relatórios PDF
 * Limite: 2 requisições por minuto por usuário
 * Previne: Sobrecarga de CPU/IO, uso excessivo de recursos
 */
export const pdfReportLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "1 m"),
  analytics: true,
  prefix: "relatorios:pdf",
}) : null

/**
 * Rate Limiter para Geração de Relatórios Excel
 * Limite: 2 requisições por minuto por usuário
 * Previne: Sobrecarga de CPU/IO, uso excessivo de recursos
 */
export const excelReportLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "1 m"),
  analytics: true,
  prefix: "relatorios:excel",
}) : null

/**
 * Rate Limiter para Dashboard Analytics
 * Limite: 30 requisições por minuto por usuário
 * Previne: Queries excessivas no banco de dados
 */
export const dashboardAnalyticsLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "dashboard:analytics",
}) : null

/**
 * Rate Limiter para APIs de Leitura (GET)
 * Limite: 60 requisições por minuto por usuário
 * Previne: Uso excessivo de APIs de leitura
 */
export const apiReadLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "api:read",
}) : null

/**
 * Rate Limiter para APIs de Escrita (POST/PUT/DELETE)
 * Limite: 30 requisições por minuto por usuário
 * Previne: Modificações excessivas no banco de dados
 */
export const apiWriteLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "api:write",
}) : null

/**
 * Rate Limiter Genérico para APIs
 * Limite: 100 requisições por minuto por usuário/IP
 * Fallback para endpoints sem limitador específico
 */
export const apiGeneralLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "api:general",
}) : null

/**
 * Rate Limiter Global (Middleware)
 * Limite: 100 requisições por 10 segundos por IP
 * Protege: TODA a aplicação contra abuso, DDoS, scrapers
 * Aplicado: Em TODAS as rotas através do middleware
 *
 * Nota: Este é o primeiro nível de proteção. Rotas específicas
 * podem ter limitadores adicionais mais restritivos.
 */
export const globalRateLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "10 s"),
  analytics: true,
  prefix: "middleware:global",
}) : null

/**
 * Tipos de Rate Limiters disponíveis
 */
export type RateLimiterType =
  | "login"
  | "magic-link:generate"
  | "magic-link:resend"
  | "magic-link:validate"
  | "questionario:submit"
  | "csv-import"
  | "pdf-report"
  | "excel-report"
  | "dashboard-analytics"
  | "api-read"
  | "api-write"
  | "api-general"
  | "global"

/**
 * Mapeia o tipo de rate limiter para sua instância
 */
export function getRateLimiter(type: RateLimiterType): Ratelimit | null {
  switch (type) {
    case "login":
      return loginLimiter
    case "magic-link:generate":
      return magicLinkGenerateLimiter
    case "magic-link:resend":
      return magicLinkResendLimiter
    case "magic-link:validate":
      return magicLinkValidateLimiter
    case "questionario:submit":
      return questionarioSubmitLimiter
    case "csv-import":
      return csvImportLimiter
    case "pdf-report":
      return pdfReportLimiter
    case "excel-report":
      return excelReportLimiter
    case "dashboard-analytics":
      return dashboardAnalyticsLimiter
    case "api-read":
      return apiReadLimiter
    case "api-write":
      return apiWriteLimiter
    case "api-general":
      return apiGeneralLimiter
    case "global":
      return globalRateLimiter
    default:
      return null
  }
}
