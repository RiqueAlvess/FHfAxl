import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const path = req.nextUrl.pathname;

  // Rotas públicas
  const isPublicRoute =
    path.startsWith("/login") ||
    path.startsWith("/recuperar-senha") ||
    path.startsWith("/redefinir-senha") ||
    path.startsWith("/questionario") ||
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

  // Proteger rotas de admin
  if (path.startsWith("/admin")) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
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
