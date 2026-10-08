import { NextRequest, NextResponse } from "next/server";

import { isTokenExpired } from "@/lib/jwt";

/**
 * Proxy (Next.js 16) — substitui o antigo middleware.ts
 * Roda no Edge antes de qualquer renderização.
 *
 * Rotas públicas: /, /login, /register, /reset-password
 * Tudo mais exige o cookie "acervo-token" (setado pelo store no login).
 */

// /reset-password é alcançada pelo link do e-mail de recuperação, quando o
// usuário por definição não tem sessão. Fora desta lista, o fluxo inteiro de
// "esqueci minha senha" caía em redirect para "/".
const PUBLIC_PATHS = ["/", "/login", "/register", "/reset-password"];

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

  // Antes bastava o cookie existir: qualquer valor liberava a área autenticada,
  // e um token expirado deixava o usuário entrar num app em que toda chamada
  // falha. A assinatura continua sendo verificada pelo backend; aqui só se
  // confere a validade para mandar ao login quem já precisa reautenticar.
  if (isTokenExpired(token)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("expirado", "1");
    const res = NextResponse.redirect(url);
    res.cookies.delete("acervo-token");
    return res;
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
