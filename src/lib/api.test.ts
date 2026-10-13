import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  authApi,
  notesApi,
  setUnauthorizedHandler,
  themesApi,
} from "./api";

/** Resposta real do fetch, para exercitar o caminho inteiro de `request`. */
function resposta(
  status: number,
  body: string | null,
  contentType?: string,
): Response {
  const headers = new Headers();
  if (contentType) headers.set("content-type", contentType);
  return new Response(body, { status, headers });
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  setUnauthorizedHandler(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

describe("corpo vazio", () => {
  it("204 sem corpo nao quebra o cliente", async () => {
    fetchMock.mockResolvedValue(resposta(204, null));
    await expect(notesApi.delete("abc", "tok")).resolves.toBeUndefined();
  });

  it("200 com corpo vazio e Content-Type JSON nao tenta parsear", async () => {
    // Era isto que virava SyntaxError e aparecia como
    // "Não foi possível conectar ao servidor" apesar do 200.
    fetchMock.mockResolvedValue(resposta(200, "", "application/json"));
    await expect(
      authApi.firstAccessPassword({ password: "NovaSenha123" }, "tok"),
    ).resolves.toBeUndefined();
  });

  it("200 com corpo vazio sem Content-Type tambem resolve", async () => {
    fetchMock.mockResolvedValue(resposta(200, ""));
    await expect(authApi.forgotPassword("a@b.com")).resolves.toBeUndefined();
  });
});

describe("erros", () => {
  it("usa a mensagem do backend no ApiError", async () => {
    fetchMock.mockResolvedValue(
      resposta(
        409,
        JSON.stringify({ status: 409, message: "Este e-mail já está cadastrado." }),
        "application/json",
      ),
    );

    await expect(themesApi.getAll("tok")).rejects.toMatchObject({
      status: 409,
      message: "Este e-mail já está cadastrado.",
    });
  });

  it("corpo nao-JSON num erro ainda produz ApiError com o status", async () => {
    fetchMock.mockResolvedValue(resposta(500, "<html>erro</html>", "text/html"));

    const erro = await themesApi.getAll("tok").catch((e) => e);
    expect(erro).toBeInstanceOf(ApiError);
    expect(erro.status).toBe(500);
  });

  it("JSON malformado numa resposta de sucesso vira ApiError, nao excecao solta", async () => {
    fetchMock.mockResolvedValue(resposta(200, "{isso nao e json", "application/json"));

    const erro = await themesApi.getAll("tok").catch((e) => e);
    expect(erro).toBeInstanceOf(ApiError);
    expect(erro.message).toBe("Resposta inválida do servidor.");
  });
});

describe("401 e sessao expirada", () => {
  it("401 numa rota comum dispara o handler", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValue(
      resposta(401, JSON.stringify({ message: "Sessão inválida" }), "application/json"),
    );

    await themesApi.getAll("tok").catch(() => null);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("401 no login NAO derruba a sessao: e senha errada", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValue(
      resposta(401, JSON.stringify({ message: "E-mail ou senha inválidos." }), "application/json"),
    );

    await authApi.login({ email: "a@b.com", password: "errada" }).catch(() => null);
    expect(handler).not.toHaveBeenCalled();
  });

  it("401 no change-password NAO derruba a sessao: e a senha atual errada", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValue(
      resposta(401, JSON.stringify({ message: "Senha atual incorreta." }), "application/json"),
    );

    await authApi
      .changePassword({ currentPassword: "x", newPassword: "y" }, "tok")
      .catch(() => null);
    expect(handler).not.toHaveBeenCalled();
  });

  it("403 nao dispara o handler: e falta de permissao, nao sessao expirada", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValue(
      resposta(403, JSON.stringify({ message: "Sem permissão" }), "application/json"),
    );

    await themesApi.getAll("tok").catch(() => null);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("requisicao", () => {
  it("envia o Bearer token quando ha token", async () => {
    fetchMock.mockResolvedValue(resposta(200, "[]", "application/json"));
    await themesApi.getAll("meu-token");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["Authorization"]).toBe("Bearer meu-token");
  });

  it("passa pelo proxy do Next, nunca direto no backend", async () => {
    fetchMock.mockResolvedValue(resposta(200, "[]", "application/json"));
    await themesApi.getAll("tok");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/proxy/api/v1/themes");
  });
});
