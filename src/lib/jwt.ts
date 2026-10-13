/**
 * Leitura do "exp" do JWT, sem verificar assinatura.
 *
 * A assinatura continua sendo validada pelo backend — isto serve só para o
 * cliente saber quando a sessão expirou, em vez de manter um cookie de 7 dias
 * apontando para um token de 2 horas e deixar o app entrar num estado em que
 * toda chamada falha.
 *
 * Usado tanto no browser quanto no middleware (Edge), portanto não pode
 * depender de APIs do Node.
 */

interface JwtPayload {
  exp?: number; // segundos desde a época
  sub?: string;
}

function decodePayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    // decodeURIComponent/escape preserva acentos em payloads UTF-8
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Instante de expiração em milissegundos, ou `null` se o token for ilegível. */
export function getTokenExpiry(token: string): number | null {
  const payload = decodePayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

/**
 * `true` quando o token está expirado ou é ilegível — ambos exigem novo login.
 * `skewMs` descarta os últimos segundos de validade, evitando usar um token que
 * expira no meio da requisição.
 */
export function isTokenExpired(token: string, skewMs = 5000): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return true;
  return Date.now() + skewMs >= expiry;
}
