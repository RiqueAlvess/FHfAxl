/**
 * Validação de variáveis de ambiente do VIVAMENTE360
 *
 * Este módulo garante que todas as variáveis de ambiente necessárias
 * estejam configuradas corretamente antes da aplicação iniciar.
 */

import { logger } from "./logger";

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // NextAuth
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;

  // Email (Resend)
  RESEND_API_KEY: string;
  EMAIL_FROM: string;

  // Redis (Upstash) - opcional, tem fallback
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;

  // Node Environment
  NODE_ENV: "development" | "production" | "test";
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "RESEND_API_KEY",
  "EMAIL_FROM",
];

const optionalEnvVars: (keyof EnvConfig)[] = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

/**
 * Valida se uma variável de ambiente existe e não está vazia
 */
function validateEnvVar(name: string, value: string | undefined): boolean {
  if (!value || value.trim() === "") {
    return false;
  }
  return true;
}

/**
 * Valida todas as variáveis de ambiente necessárias
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];
  const warnings: string[] = [];

  logger.info("Validando variáveis de ambiente...");

  // Validar variáveis obrigatórias
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!validateEnvVar(envVar, value)) {
      errors.push(`❌ ${envVar} não está configurada ou está vazia`);
    } else {
      logger.debug(`✓ ${envVar} configurada`);
    }
  }

  // Validar variáveis opcionais (apenas avisar)
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar];
    if (!validateEnvVar(envVar, value)) {
      warnings.push(`⚠️  ${envVar} não está configurada (opcional)`);
    } else {
      logger.debug(`✓ ${envVar} configurada`);
    }
  }

  // Validações específicas
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgresql://")) {
    errors.push("❌ DATABASE_URL deve ser uma URL PostgreSQL válida");
  }

  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push("❌ NEXTAUTH_SECRET deve ter no mínimo 32 caracteres");
  }

  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith("http")) {
    errors.push("❌ NEXTAUTH_URL deve ser uma URL válida (http:// ou https://)");
  }

  if (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes("@")) {
    errors.push("❌ EMAIL_FROM deve ser um email válido");
  }

  // Verificar ambiente
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv || !["development", "production", "test"].includes(nodeEnv)) {
    warnings.push("⚠️  NODE_ENV não está definido, usando 'development' como padrão");
  }

  // Exibir warnings
  if (warnings.length > 0) {
    logger.warn("Variáveis de ambiente opcionais não configuradas:", {
      warnings,
    });
    warnings.forEach((warning) => console.warn(warning));
  }

  // Se houver erros, encerrar a aplicação
  if (errors.length > 0) {
    logger.fatal("Falha na validação de variáveis de ambiente", undefined, {
      errors,
    });

    console.error("\n" + "=".repeat(60));
    console.error("❌ ERRO: Variáveis de ambiente ausentes ou inválidas");
    console.error("=".repeat(60));
    errors.forEach((error) => console.error(error));
    console.error("\n📝 Verifique seu arquivo .env e .env.example");
    console.error("=".repeat(60) + "\n");

    throw new Error("Variáveis de ambiente inválidas. Verifique os logs acima.");
  }

  logger.info("✅ Todas as variáveis de ambiente obrigatórias estão configuradas");

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    RESEND_API_KEY: process.env.RESEND_API_KEY!,
    EMAIL_FROM: process.env.EMAIL_FROM!,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
  };
}

/**
 * Exporta uma versão tipada e validada das variáveis de ambiente
 */
export const env = validateEnv();

/**
 * Helper para verificar se está em desenvolvimento
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Helper para verificar se está em produção
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Helper para verificar se está em teste
 */
export const isTest = env.NODE_ENV === "test";
