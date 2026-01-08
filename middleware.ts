import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Verificar se usuário precisa trocar senha
    if (token?.forcarTrocaSenha && !path.startsWith("/trocar-senha")) {
      return NextResponse.redirect(new URL("/trocar-senha", req.url));
    }

    // Proteger rotas de admin
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Permitir acesso
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Rotas públicas
        if (
          path.startsWith("/login") ||
          path.startsWith("/recuperar-senha") ||
          path.startsWith("/redefinir-senha") ||
          path.startsWith("/questionario") ||
          path === "/"
        ) {
          return true;
        }

        // Rotas protegidas requerem autenticação
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

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
