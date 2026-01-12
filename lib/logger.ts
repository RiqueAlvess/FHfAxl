/**
 * Sistema de logging estruturado para VIVAMENTE360
 *
 * Níveis de log:
 * - DEBUG: Informações detalhadas para debug
 * - INFO: Informações gerais sobre o funcionamento do sistema
 * - WARN: Avisos sobre situações potencialmente problemáticas
 * - ERROR: Erros que afetam funcionalidades mas não param o sistema
 * - FATAL: Erros críticos que podem parar o sistema
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private minLevel: LogLevel;

  constructor() {
    // Define nível mínimo baseado no ambiente
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.minLevel);
    return currentLevelIndex >= minLevelIndex;
  }

  private sanitize(data: any): any {
    // Remove dados sensíveis antes de logar
    if (typeof data !== "object" || data === null) {
      return data;
    }

    const sensitiveKeys = [
      "password",
      "senha",
      "token",
      "secret",
      "apiKey",
      "authorization",
      "creditCard",
      "ssn",
      "cpf",
    ];

    const sanitized = { ...data };

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;

    if (this.isDevelopment) {
      // Formato legível para desenvolvimento
      let log = `[${timestamp}] ${level}: ${message}`;

      if (context && Object.keys(context).length > 0) {
        log += `\n  Context: ${JSON.stringify(this.sanitize(context), null, 2)}`;
      }

      if (error) {
        log += `\n  Error: ${error.message}`;
        if (error.stack) {
          log += `\n  Stack: ${error.stack}`;
        }
      }

      return log;
    } else {
      // Formato JSON estruturado para produção
      return JSON.stringify({
        level,
        message,
        timestamp,
        context: context ? this.sanitize(context) : undefined,
        error: error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : undefined,
      });
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedLog = this.formatLog(entry);

    // Log para console apropriado
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedLog);
        break;
    }

    // Em produção, você poderia enviar logs para serviços externos
    // como Sentry, DataDog, CloudWatch, etc.
    if (!this.isDevelopment && level === LogLevel.ERROR || level === LogLevel.FATAL) {
      // TODO: Integrar com serviço de monitoramento
      // exemplo: Sentry.captureException(error)
    }
  }

  /**
   * Loga informações de debug (apenas em desenvolvimento)
   */
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Loga informações gerais
   */
  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Loga avisos
   */
  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Loga erros
   */
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Loga erros fatais
   */
  fatal(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.FATAL, message, context, error);
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Exemplo de uso:
 *
 * logger.info("Usuário fez login", { userId: "123", email: "user@example.com" });
 * logger.error("Falha ao processar pagamento", error, { orderId: "456" });
 * logger.warn("Taxa de erro elevada", { errorRate: 0.15 });
 * logger.debug("Query executada", { query: "SELECT * FROM users", duration: 45 });
 */
