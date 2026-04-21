/**
 * API client — todas as chamadas passam pelo proxy Next.js (/api/proxy/*)
 * que repassa server-to-server para o backend, evitando CORS.
 *
 * Para trocar o backend, altere API_URL no .env.local (server-side).
 * O cliente nunca fala diretamente com localhost:8080.
 */

// Proxy local (mesmo origin que o Next.js, sem CORS)
const BASE_URL = "/api/proxy";

// ─── DTOs (espelham o Swagger) ────────────────────────────────────

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  birthDate: string; // "YYYY-MM-DD"
}

export interface UserRequestDTO {
  name: string;
  email: string;
  birthDate: string; // "YYYY-MM-DD"
  password: string;
  cpf: string; // exatamente 11 dígitos numéricos
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

// ─── Erro tipado ──────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Helper de fetch ──────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? body.error ?? message;
    } catch {
      // resposta sem corpo JSON
    }
    throw new ApiError(res.status, message);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}

// ─── Auth ─────────────────────────────────────────────────────────

export const authApi = {
  /**
   * POST /api/v1/auth/login → retorna { token: string }
   * Extrai apenas a string JWT do objeto de resposta.
   */
  login: async (data: LoginRequestDTO): Promise<string> => {
    const res = await request<{ token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.token;
  },

  /**
   * GET /api/v1/auth/me → dados do usuário logado (requer Bearer token)
   */
  me: (token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>("/api/v1/auth/me", {}, token),
};

// ─── Usuários ─────────────────────────────────────────────────────

export const usersApi = {
  /** POST /api/v1/users — cria novo usuário */
  create: (data: UserRequestDTO): Promise<UserResponseDTO> =>
    request<UserResponseDTO>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** GET /api/v1/users/{id} */
  getById: (id: string, token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>(`/api/v1/users/${id}`, {}, token),

  /** PUT /api/v1/users/{id} */
  update: (
    id: string,
    data: UserRequestDTO,
    token: string,
  ): Promise<UserResponseDTO> =>
    request<UserResponseDTO>(
      `/api/v1/users/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      token,
    ),

  /** DELETE /api/v1/users/{id} */
  delete: (id: string, token: string): Promise<void> =>
    request<void>(`/api/v1/users/${id}`, { method: "DELETE" }, token),

  /** GET /api/v1/users */
  getAll: (token: string): Promise<UserResponseDTO[]> =>
    request<UserResponseDTO[]>("/api/v1/users", {}, token),
};
