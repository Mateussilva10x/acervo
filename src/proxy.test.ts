import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

function jwt(expSegundos: number) {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
    iss: "auth-api",
    sub: "pastor@exemplo.com",
    exp: expSegundos,
  })}.assinatura`;
}

const agora = () => Math.floor(Date.now() / 1000);

function requisicao(path: string, token?: string) {
  const req = new NextRequest(new URL(`http://localhost:3000${path}`));
  if (token) req.cookies.set("acervo-token", token);
  return req;
}

/** A resposta de "seguir adiante" não carrega Location. */
function seguiuAdiante(res: Response) {
  return !res.headers.get("location");
}

describe("rotas publicas", () => {
  it.each(["/", "/login", "/register", "/reset-password"])(
    "%s e acessivel sem sessao",
    (path) => {
      expect(seguiuAdiante(proxy(requisicao(path)))).toBe(true);
    },
  );

  it("/reset-password e publica mesmo com o token do e-mail na query", () => {
    const req = new NextRequest(
      new URL("http://localhost:3000/reset-password?token=abc"),
    );
    expect(seguiuAdiante(proxy(req))).toBe(true);
  });
});

describe("rotas protegidas", () => {
  it("sem cookie redireciona para a landing", () => {
    const res = proxy(requisicao("/app/dashboard"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("com token valido segue adiante", () => {
    const res = proxy(requisicao("/app/dashboard", jwt(agora() + 7200)));
    expect(seguiuAdiante(res)).toBe(true);
  });

  it("token expirado vai para o login sinalizando a expiracao", () => {
    const res = proxy(requisicao("/app/dashboard", jwt(agora() - 60)));
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?expirado=1",
    );
  });

  it("cookie inventado nao libera a area autenticada", () => {
    // Antes bastava o cookie existir, com qualquer valor.
    const res = proxy(requisicao("/app/notes", "qualquer-coisa"));
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?expirado=1",
    );
  });

  it("ao expirar, o cookie e removido", () => {
    const res = proxy(requisicao("/app/notes", jwt(agora() - 60)));
    expect(res.headers.get("set-cookie") ?? "").toContain("acervo-token=");
  });
});
