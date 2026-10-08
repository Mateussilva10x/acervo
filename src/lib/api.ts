/**
 * API client — todas as chamadas passam pelo proxy Next.js (/api/proxy/*)
 * que repassa server-to-server para o backend, evitando CORS.
 */

import type { BibleRef, Note } from "@/lib/mock-data";
import { toApiBookName } from "@/lib/bible-books";

const BASE_URL = "/api/proxy";

// ─── DTOs (espelham exatamente o Swagger) ────────────────────────

export interface UserResponseDTO {
  id: string;       // UUID
  name: string;
  email: string;
  birthDate: string; // "YYYY-MM-DD"
  role?: string;
  planType?: "FREE" | "PRO";
  firstLogin?: boolean;
}

export interface UserRequestDTO {
  name: string;
  email: string;
  birthDate: string; // "YYYY-MM-DD"
  password: string;
  cpf: string;       // exatamente 11 dígitos numéricos
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  isFirstLogin: boolean;
  planType?: "FREE" | "PRO";
}

export interface FirstAccessPasswordDTO {
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ThemeResponseDTO {
  id: string;   // UUID
  name: string;
}

export interface ThemeRequestDTO {
  name: string;
}

export interface NoteResponseDTO {
  id: string;               // UUID
  title: string;
  content: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  biblicalReferences: string[]; // ex: ["João 3:16", "Romanos 6:1-14"]
  themes: ThemeResponseDTO[];
  planMessage?: string | null;  // preenchido quando o usuário atinge o limite do plano
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteRequestDTO {
  title: string;
  content: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  biblicalReferences: string[]; // pode ser array vazio
  themeIds?: string[];          // UUIDs dos temas
}

// ─── Plan & Payment DTOs ──────────────────────────────────────────

export interface PlanUsageDTO {
  planType: "FREE" | "PRO";
  notes: {
    used: number;
    limit: number | null;
    canCreate: boolean;
  };
  themes: {
    used: number;
    limit: number | null;
    canCreate: boolean;
  };
}

export interface CheckoutResponseDTO {
  checkoutUrl: string;
  referenceId: string;
  amountCents: number;
  currency: string;
  provider: string;
}

// ─── Helpers de mapeamento ────────────────────────────────────────

/**
 * Converte BibleRef → string para o backend.
 * Ex: { book: "João", chapter: 3, verseStart: 16 } → "João 3:16"
 */
export function bibleRefToString(ref: BibleRef): string {
  let s = `${ref.book} ${ref.chapter}`;
  if (ref.verseStart) {
    s += `:${ref.verseStart}`;
    if (ref.verseEnd) s += `-${ref.verseEnd}`;
  }
  return s;
}

/**
 * Converte string do backend → BibleRef.
 * Ex: "João 3:16" → { book: "João", chapter: 3, verseStart: 16 }
 */
export function stringToBibleRef(ref: string): BibleRef {
  const match = ref.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return { book: ref, chapter: 1 };
  return {
    book: match[1],
    chapter: parseInt(match[2]),
    verseStart: match[3] ? parseInt(match[3]) : undefined,
    verseEnd:   match[4] ? parseInt(match[4]) : undefined,
  };
}

/**
 * Mapeia NoteResponseDTO (backend) → Note (frontend).
 */
export function parseNoteResponse(dto: NoteResponseDTO): Note {
  return {
    id:        dto.id,
    title:     dto.title,
    content:   dto.content,
    themes:    dto.themes.map((t) => t.name),
    bibleRefs: (dto.biblicalReferences ?? []).map(stringToBibleRef),
    createdAt: dto.createdAt ? dto.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
    updatedAt: dto.updatedAt ? dto.updatedAt.split("T")[0] : new Date().toISOString().split("T")[0],
  };
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

// ─── Sessão expirada ──────────────────────────────────────────────

let onUnauthorized: (() => void) | null = null;

/**
 * Registra o que fazer quando o backend responder 401. Fica como callback em
 * vez de importar o store aqui para não criar dependência circular.
 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

/**
 * Endpoints em que 401 é resposta de negócio, não sessão expirada:
 * login com senha errada e troca de senha com a senha atual incorreta.
 * Derrubar a sessão nesses casos seria errado.
 */
const AUTH_401_IS_EXPECTED = [
  "/api/v1/auth/login",
  "/api/v1/auth/change-password",
];

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
      /* resposta sem corpo JSON */
    }

    // O backend passou a distinguir 401 (sessão expirada) de 403 (sem
    // permissão). Em 401 não adianta a tela mostrar o erro: a sessão acabou,
    // então o store é limpo e o usuário vai para o login.
    if (res.status === 401 && !AUTH_401_IS_EXPECTED.some((p) => path.startsWith(p))) {
      onUnauthorized?.();
    }

    throw new ApiError(res.status, message);
  }

  // Vários endpoints respondem 200 sem corpo (first-access-password,
  // change-password, forgot-password). Chamar res.json() aí lança SyntaxError,
  // que não é ApiError e acabava virando "não foi possível conectar ao servidor"
  // na tela, apesar do 200. Por isso o corpo é lido como texto primeiro.
  const raw = await res.text();
  if (raw.length === 0) {
    return undefined as T;
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new ApiError(res.status, "Resposta inválida do servidor.");
    }
  }
  return raw as unknown as T;
}

// ─── Auth ─────────────────────────────────────────────────────────

export const authApi = {
  login: async (data: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const raw = await request<string | { token: string; isFirstLogin?: boolean; firstLogin?: boolean; planType?: "FREE" | "PRO" }>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify(data) },
    );
    if (typeof raw === "string") {
      return { token: raw, isFirstLogin: false, planType: "FREE" };
    }
    return {
      token: raw.token,
      isFirstLogin: raw.isFirstLogin ?? raw.firstLogin ?? false,
      planType: raw.planType ?? "FREE",
    };
  },

  me: (token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>("/api/v1/auth/me", {}, token),

  firstAccessPassword: (data: FirstAccessPasswordDTO, token: string): Promise<void> =>
    request<void>("/api/v1/auth/first-access-password", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  changePassword: (data: ChangePasswordDTO, token: string): Promise<void> =>
    request<void>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  forgotPassword: (email: string): Promise<void> =>
    request<void>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string): Promise<void> =>
    request<void>(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}`, {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
};

// ─── Usuários ─────────────────────────────────────────────────────

export const usersApi = {
  create: (data: UserRequestDTO): Promise<UserResponseDTO> =>
    request<UserResponseDTO>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getById: (id: string, token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>(`/api/v1/users/${id}`, {}, token),

  update: (id: string, data: UserRequestDTO, token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>(
      `/api/v1/users/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      token,
    ),

  delete: (id: string, token: string): Promise<void> =>
    request<void>(`/api/v1/users/${id}`, { method: "DELETE" }, token),

  getAll: (token: string): Promise<UserResponseDTO[]> =>
    request<UserResponseDTO[]>("/api/v1/users", {}, token),
};

// ─── Temas ────────────────────────────────────────────────────────

export const themesApi = {
  getAll: (token: string): Promise<ThemeResponseDTO[]> =>
    request<ThemeResponseDTO[]>("/api/v1/themes", {}, token),

  create: (data: ThemeRequestDTO, token: string): Promise<ThemeResponseDTO> =>
    request<ThemeResponseDTO>("/api/v1/themes", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (id: string, data: ThemeRequestDTO, token: string): Promise<ThemeResponseDTO> =>
    request<ThemeResponseDTO>(`/api/v1/themes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  delete: (id: string, token: string): Promise<void> =>
    request<void>(`/api/v1/themes/${id}`, { method: "DELETE" }, token),
};

// ─── Notas ────────────────────────────────────────────────────────

export const notesApi = {
  getAll: async (token: string): Promise<Note[]> => {
    const dtos = await request<NoteResponseDTO[]>("/api/v1/notes", {}, token);
    return dtos.map(parseNoteResponse);
  },

  create: async (data: NoteRequestDTO, token: string): Promise<Note> => {
    const dto = await request<NoteResponseDTO>("/api/v1/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
    return parseNoteResponse(dto);
  },

  getById: async (id: string, token: string): Promise<Note> => {
    const dto = await request<NoteResponseDTO>(`/api/v1/notes/${id}`, {}, token);
    return parseNoteResponse(dto);
  },

  update: async (id: string, data: NoteRequestDTO, token: string): Promise<Note> => {
    const dto = await request<NoteResponseDTO>(`/api/v1/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
    return parseNoteResponse(dto);
  },

  delete: (id: string, token: string): Promise<void> =>
    request<void>(`/api/v1/notes/${id}`, { method: "DELETE" }, token),

  createRaw: (data: NoteRequestDTO, token: string): Promise<NoteResponseDTO> =>
    request<NoteResponseDTO>("/api/v1/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// ─── Plano e Pagamento ────────────────────────────────────────────

export const planApi = {
  getUsage: (token: string): Promise<PlanUsageDTO> =>
    request<PlanUsageDTO>("/api/v1/plan/usage", {}, token),
};

export const paymentApi = {
  createCheckout: (token: string): Promise<CheckoutResponseDTO> =>
    request<CheckoutResponseDTO>("/api/v1/payment/checkout", { method: "POST" }, token),

  simulateUpgrade: (token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>("/api/v1/payment/simulate-upgrade", { method: "POST" }, token),
};

// ─── Busca Generalizada ───────────────────────────────────────────

export interface BibleSearchResultDTO {
  reference: string;
  bookId: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

export interface SearchResultsDTO {
  notes: NoteResponseDTO[];
  biblePassages: BibleSearchResultDTO[];
}

export const searchApi = {
  search: (query: string, token: string): Promise<SearchResultsDTO> =>
    request<SearchResultsDTO>(
      `/api/v1/search?${new URLSearchParams({ q: query })}`,
      {},
      token,
    ),
};

// ─── Bíblia ───────────────────────────────────────────────────────

export interface BibleTranslationDTO {
  code: string;
  name: string;
}

export interface BibleBookDTO {
  id: number;
  name: string;
  abbrev: string;
  testament: string;
  chapters: number;
}

export interface BibleVerseDTO {
  verse: number;
  text: string;
}

export interface BiblePassageResponseDTO {
  bookId: number;
  book: string;
  chapter: number;
  verseStart?: number | null;
  verseEnd?: number | null;
  translation: string;
  reference: string;
  verses: BibleVerseDTO[];
}

export const bibleApi = {
  getTranslations: async (): Promise<BibleTranslationDTO[]> => {
    try {
      return await request<BibleTranslationDTO[]>("/api/v1/bible/translations");
    } catch {
      return [
        { code: "ACF11", name: "Almeida Corrigida Fiel (2011)" },
        { code: "ARA",   name: "Almeida Revista e Atualizada (1993)" },
        { code: "ARC09", name: "Almeida Revista e Corrigida (2009)" },
        { code: "NAA",   name: "Nova Almeida Atualizada (2017)" },
        { code: "NVT",   name: "Nova Versão Transformadora (2016)" },
        { code: "NTLH",  name: "Nova Tradução na Linguagem de Hoje (2000)" },
        { code: "TB10",  name: "Tradução Brasileira (2010)" },
        { code: "KJA",   name: "King James Atualizada (2001)" },
      ];
    }
  },

  getBooks: async (testament?: string): Promise<BibleBookDTO[]> => {
    const q = testament ? `?testament=${encodeURIComponent(testament)}` : "";
    return request<BibleBookDTO[]>(`/api/v1/bible/books${q}`);
  },

  getChapter: async (
    book: string,
    chapter: number,
    translation = "ACF11",
  ): Promise<BiblePassageResponseDTO> => {
    const params = new URLSearchParams({
      book: toApiBookName(book),
      chapter: String(chapter),
      translation,
    });
    return request<BiblePassageResponseDTO>(`/api/v1/bible/passages?${params}`);
  },

  getPassage: async (
    book: string,
    chapter: number,
    translation = "ACF11",
    verseStart?: number,
    verseEnd?: number,
  ): Promise<BiblePassageResponseDTO> => {
    const params = new URLSearchParams({
      book: toApiBookName(book),
      chapter: String(chapter),
      translation,
    });
    if (verseStart !== undefined) params.set("verseStart", String(verseStart));
    if (verseEnd !== undefined) params.set("verseEnd", String(verseEnd));
    return request<BiblePassageResponseDTO>(`/api/v1/bible/passages?${params}`);
  },

  getByReference: async (
    reference: string,
    translation = "ACF11",
  ): Promise<BiblePassageResponseDTO> => {
    const params = new URLSearchParams({
      ref: reference,
      translation,
    });
    return request<BiblePassageResponseDTO>(`/api/v1/bible/reference?${params}`);
  },

  search: async (
    query: string,
    translation = "ACF11",
    limit = 20,
  ): Promise<BibleSearchResultDTO[]> => {
    const params = new URLSearchParams({
      q: query,
      translation,
      limit: String(limit),
    });
    return request<BibleSearchResultDTO[]>(`/api/v1/bible/search?${params}`);
  },
};
