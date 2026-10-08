import { describe, expect, it } from "vitest";
import { getTokenExpiry, isTokenExpired } from "./jwt";

/**
 * Monta um JWT sem assinatura válida — estas funções só leem o payload,
 * a verificação de assinatura é do backend.
 */
function tokenComExp(expSegundos: number, extra: Record<string, unknown> = {}) {
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
    ...extra,
  })}.assinatura`;
}

const agora = () => Math.floor(Date.now() / 1000);

describe("getTokenExpiry", () => {
  it("devolve o exp em milissegundos", () => {
    const exp = agora() + 7200;
    expect(getTokenExpiry(tokenComExp(exp))).toBe(exp * 1000);
  });

  it("devolve null quando o token nao tem tres partes", () => {
    expect(getTokenExpiry("nao-e-um-jwt")).toBeNull();
  });

  it("devolve null quando o payload nao e JSON valido", () => {
    expect(getTokenExpiry("aaa.!!!nao-base64!!!.ccc")).toBeNull();
  });

  it("devolve null quando nao ha exp no payload", () => {
    const b64 = (o: unknown) =>
      Buffer.from(JSON.stringify(o)).toString("base64url");
    expect(getTokenExpiry(`${b64({})}.${b64({ sub: "x" })}.sig`)).toBeNull();
  });

  it("le payload com acento sem quebrar", () => {
    const exp = agora() + 60;
    const token = tokenComExp(exp, { nome: "João Gonçalves" });
    expect(getTokenExpiry(token)).toBe(exp * 1000);
  });
});

describe("isTokenExpired", () => {
  it("token com exp no futuro nao esta expirado", () => {
    expect(isTokenExpired(tokenComExp(agora() + 7200))).toBe(false);
  });

  it("token com exp no passado esta expirado", () => {
    expect(isTokenExpired(tokenComExp(agora() - 60))).toBe(true);
  });

  it("token ilegivel conta como expirado: exige novo login", () => {
    expect(isTokenExpired("lixo")).toBe(true);
  });

  it("a margem de seguranca descarta token que expira em instantes", () => {
    // Expira em 2s; com skew de 5s deve ser tratado como expirado para não
    // ser usado numa requisição que morre no meio do caminho.
    expect(isTokenExpired(tokenComExp(agora() + 2))).toBe(true);
  });

  it("a margem e configuravel", () => {
    expect(isTokenExpired(tokenComExp(agora() + 2), 0)).toBe(false);
  });
});
