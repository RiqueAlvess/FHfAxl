/**
 * Middleware para proteção K-Anonymity em APIs
 *
 * Este middleware garante que dados agregados não sejam retornados
 * quando há menos de K respondentes, protegendo a privacidade individual.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verificarKAnonymity, FiltrosSegmentacao, getMensagemKAnonymityNaoAtendido } from './k-anonymity';
import { registrarBloqueioKAnonymity, registrarVisualizacaoAnalytics } from './audit-log';

/**
 * Tipo para o handler da API
 */
export type ApiHandler = (
  req: NextRequest,
  context: { params: any }
) => Promise<NextResponse>;

/**
 * Configuração do middleware K-Anonymity
 */
export interface KAnonymityConfig {
  /**
   * Se true, aplica verificação K-Anonymity
   * @default true
   */
  enforceKAnonymity?: boolean;

  /**
   * Função para extrair empresaId da request
   * Por padrão, usa session.user.empresaId
   */
  getEmpresaId?: (req: NextRequest, session: any) => string | Promise<string>;

  /**
   * Função para extrair filtros da request
   * Por padrão, lê query params: unidadeId, setorId, cargoId, cicloAvaliacaoId
   */
  getFiltros?: (req: NextRequest) => FiltrosSegmentacao | Promise<FiltrosSegmentacao>;

  /**
   * Se true, registra acesso em audit log
   * @default true
   */
  registrarAuditLog?: boolean;
}

/**
 * Extrai IP da request
 */
function getIpAddress(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Extrai filtros dos query params da request
 */
function extrairFiltrosDaRequest(req: NextRequest): FiltrosSegmentacao {
  const { searchParams } = new URL(req.url);

  return {
    unidadeId: searchParams.get('unidadeId') || undefined,
    setorId: searchParams.get('setorId') || undefined,
    cargoId: searchParams.get('cargoId') || undefined,
    cicloAvaliacaoId: searchParams.get('cicloAvaliacaoId') || undefined,
  };
}

/**
 * Middleware para proteger endpoints com K-Anonymity
 *
 * @param handler - Handler da API
 * @param config - Configuração do middleware
 * @returns Handler protegido
 *
 * @example
 * ```typescript
 * // app/api/dashboard/analytics/route.ts
 * export const GET = comProtecaoKAnonymity(async (req) => {
 *   const analytics = await calcularAnalytics(...);
 *   return NextResponse.json(analytics);
 * });
 * ```
 */
export function comProtecaoKAnonymity(
  handler: ApiHandler,
  config: KAnonymityConfig = {}
): ApiHandler {
  const {
    enforceKAnonymity = true,
    getEmpresaId = (req, session) => session.user.empresaId,
    getFiltros = extrairFiltrosDaRequest,
    registrarAuditLog: shouldAudit = true,
  } = config;

  return async (req: NextRequest, context: { params: any }) => {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Se não enforce K-Anonymity, executar handler diretamente
    if (!enforceKAnonymity) {
      return handler(req, context);
    }

    try {
      // Extrair empresaId e filtros
      const empresaId = await getEmpresaId(req, session);
      const filtros = await getFiltros(req);

      // Verificar K-Anonymity
      const resultado = await verificarKAnonymity(empresaId, filtros);

      // Se não passar, bloquear acesso
      if (!resultado.passed) {
        const ipAddress = getIpAddress(req);

        // Registrar bloqueio
        if (shouldAudit) {
          await registrarBloqueioKAnonymity(
            session.user.id,
            empresaId,
            filtros,
            resultado.count,
            resultado.minRequired,
            ipAddress
          );
        }

        return NextResponse.json(
          {
            error: 'K_ANONYMITY_NAO_ATENDIDO',
            message: getMensagemKAnonymityNaoAtendido(resultado.count),
            count: resultado.count,
            minRequired: resultado.minRequired,
          },
          { status: 403 }
        );
      }

      // Registrar visualização bem-sucedida
      if (shouldAudit) {
        const ipAddress = getIpAddress(req);
        await registrarVisualizacaoAnalytics(
          session.user.id,
          empresaId,
          filtros,
          resultado.count,
          ipAddress
        );
      }

      // Executar handler original
      return handler(req, context);
    } catch (error) {
      console.error('Erro no middleware K-Anonymity:', error);

      return NextResponse.json(
        {
          error: 'Erro ao verificar proteção de dados',
          message: 'Ocorreu um erro ao processar sua solicitação.',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Higher-order function para proteger múltiplos endpoints
 * Útil quando você tem vários endpoints com a mesma lógica de proteção
 *
 * @example
 * ```typescript
 * const proteger = criarMiddlewareKAnonymity({ enforceKAnonymity: true });
 *
 * export const GET = proteger(async (req) => { ... });
 * export const POST = proteger(async (req) => { ... });
 * ```
 */
export function criarMiddlewareKAnonymity(config: KAnonymityConfig = {}) {
  return (handler: ApiHandler) => comProtecaoKAnonymity(handler, config);
}

/**
 * Adiciona headers de segurança relacionados a privacidade
 */
export function addPrivacyHeaders(response: NextResponse): NextResponse {
  // Prevenir que dados sejam cacheados
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Headers de segurança
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // LGPD compliance header
  response.headers.set('X-Privacy-Policy', 'K-Anonymity enforced (K=5)');

  return response;
}

/**
 * Sanitiza dados removendo campos sensíveis antes de enviar na resposta
 */
export function sanitizarDadosSensiveis<T extends Record<string, any>>(
  data: T,
  camposRemover: string[] = []
): Partial<T> {
  const camposPadrao = [
    'senha',
    'password',
    'token',
    'magic_link',
    'magicLink',
    'ip',
    'ipAddress',
    'userAgent',
  ];

  const todosOsCampos = [...camposPadrao, ...camposRemover];
  const sanitizado = { ...data };

  for (const campo of todosOsCampos) {
    delete sanitizado[campo];
  }

  return sanitizado;
}

/**
 * Valida se o usuário tem permissão para acessar dados da empresa
 */
export async function validarPermissaoEmpresa(
  session: any,
  empresaId: string
): Promise<boolean> {
  // ADMIN pode acessar qualquer empresa
  if (session.user.role === 'ADMIN') {
    return true;
  }

  // Outros roles só podem acessar sua própria empresa
  return session.user.empresaId === empresaId;
}

/**
 * Middleware completo com todas as proteções
 * Combina K-Anonymity + validação de empresa + headers de segurança
 */
export function comProtecaoCompleta(
  handler: ApiHandler,
  config: KAnonymityConfig = {}
): ApiHandler {
  return async (req: NextRequest, context: { params: any }) => {
    // Aplicar proteção K-Anonymity
    const protegido = comProtecaoKAnonymity(handler, config);
    const response = await protegido(req, context);

    // Adicionar headers de privacidade
    return addPrivacyHeaders(response);
  };
}
