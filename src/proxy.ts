import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy (Next.js 16) — substitui o antigo middleware.ts
 * Roda no Edge antes de qualquer renderização.
 *
 * Rotas públicas: /, /login, /register
 * Tudo mais exige o cookie "acervo-token" (setado pelo store no login).
 */

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Libera rotas públicas exatas
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Lê o cookie sincronizado pelo setAuth/logout do store
  const token = req.cookies.get("acervo-token")?.value;

  if (!token) {
    // Sem autenticação → redireciona para a landing page
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Aplica o proxy em todas as rotas exceto:
   * - arquivos estáticos do Next.js (_next/*)
   * - rotas de API internas (/api/*)
   * - arquivos com extensão (favicon.ico, imagens, etc.)
   */
  matcher: ["/((?!_next/static|_next/image|api|favicon\\.ico|.*\\..*).*)" ],
};
