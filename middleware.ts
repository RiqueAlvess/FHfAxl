import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessAdminPanel } from "@/lib/authorization";
import { globalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit-helpers";

export default auth(async (req: any) => {
  const session = req.auth;
  const path = req.nextUrl.pathname;

  // ============================================================================
  // RATE LIMITING GLOBAL - Primeira camada de proteção
  // ============================================================================
  // Protege TODA a aplicação contra abuso, DDoS e scrapers
  // Aplica-se a rotas públicas e privadas

  if (globalRateLimiter) {
    try {
      const ip = getClientIp(req as unknown as NextRequest);
      const { success, limit, remaining, reset } = await globalRateLimiter.limit(ip);

      if (!success) {
        const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);

        console.warn(`🚨 Rate limit global excedido: IP ${ip} | Path: ${path}`);

        return new NextResponse(
          JSON.stringify({
            error: "Muitas requisições. Por favor, aguarde antes de tentar novamente.",
            message: `Você excedeu o limite de ${limit} requisições. Tente novamente em ${retryAfterSeconds} segundos.`,
            retryAfter: retryAfterSeconds,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": retryAfterSeconds.toString(),
            },
          }
        );
      }
    } catch (error) {
      // Em caso de erro, permitir a requisição (fail open)
      console.error("❌ Erro ao verificar rate limit global:", error);
    }
  }

  // ============================================================================
  // AUTENTICAÇÃO E AUTORIZAÇÃO - Segunda camada de proteção
  // ============================================================================

  // Rotas públicas
  const isPublicRoute =
    path.startsWith("/login") ||
    path.startsWith("/recuperar-senha") ||
    path.startsWith("/redefinir-senha") ||
    path.startsWith("/questionario") ||
    path.startsWith("/FHfAxl") ||
    path === "/";

  // Se é rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar se está autenticado
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verificar se usuário precisa trocar senha
  if (session.user.forcarTrocaSenha && !path.startsWith("/trocar-senha")) {
    return NextResponse.redirect(new URL("/trocar-senha", req.url));
  }

  // Proteger rotas de admin - apenas ADMIN pode acessar
  if (path.startsWith("/admin")) {
    if (!canAccessAdminPanel(session)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirecionar ADMIN para painel admin se tentar acessar dashboard
  if (path === "/dashboard" && session.user.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Permitir acesso
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)",
  ],
};
