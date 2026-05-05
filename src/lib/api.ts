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
}

export interface FirstAccessPasswordDTO {
  password: string;
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
}

export interface NoteRequestDTO {
  title: string;
  content: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  biblicalReferences: string[]; // obrigatório (pode ser array vazio)
  themeIds?: string[];          // UUIDs dos temas
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
 * Campos ausentes no backend (location, createdAt, updatedAt) ficam como defaults.
 */
export function parseNoteResponse(dto: NoteResponseDTO): Note {
  return {
    id:        dto.id,
    title:     dto.title,
    content:   dto.content,
    themes:    dto.themes.map((t) => t.name),
    bibleRefs: (dto.biblicalReferences ?? []).map(stringToBibleRef),
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
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
    throw new ApiError(res.status, message);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  // Resposta texto puro (ex: login retornando JWT como string)
  return res.text() as unknown as T;
}

// ─── Auth ─────────────────────────────────────────────────────────

export const authApi = {
  /**
   * POST /api/v1/auth/login
   * Retorna token + isFirstLogin. Suporta resposta como string pura (JWT) ou objeto.
   */
  login: async (data: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const raw = await request<string | { token: string; isFirstLogin?: boolean }>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify(data) },
    );
    if (typeof raw === "string") {
      return { token: raw, isFirstLogin: false };
    }
    return {
      token: raw.token,
      isFirstLogin: raw.isFirstLogin ?? false,
    };
  },

  /** GET /api/v1/auth/me → dados do usuário logado */
  me: (token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>("/api/v1/auth/me", {}, token),

  /** POST /api/v1/auth/first-access-password → redefine senha no primeiro login */
  firstAccessPassword: (data: FirstAccessPasswordDTO, token: string): Promise<void> =>
    request<void>("/api/v1/auth/first-access-password", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  /** POST /api/v1/auth/forgot-password → envia email com link de redefinição */
  forgotPassword: (email: string): Promise<void> =>
    request<void>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  /** POST /api/v1/auth/reset-password?token=TOKEN → redefine senha com token do email */
  resetPassword: (token: string, newPassword: string): Promise<void> =>
    request<void>(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
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
  /** GET /api/v1/themes → lista todos os temas */
  getAll: (token: string): Promise<ThemeResponseDTO[]> =>
    request<ThemeResponseDTO[]>("/api/v1/themes", {}, token),

  /** POST /api/v1/themes → cria um novo tema */
  create: (data: ThemeRequestDTO, token: string): Promise<ThemeResponseDTO> =>
    request<ThemeResponseDTO>("/api/v1/themes", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  /** DELETE /api/v1/themes/{id} → remove um tema */
  delete: (id: string, token: string): Promise<void> =>
    request<void>(`/api/v1/themes/${id}`, { method: "DELETE" }, token),
};

// ─── Notas ────────────────────────────────────────────────────────

export const notesApi = {
  /**
   * GET /api/v1/notes → lista todas as notas
   * Mapeia automaticamente para o tipo Note do frontend.
   */
  getAll: async (token: string): Promise<Note[]> => {
    const dtos = await request<NoteResponseDTO[]>("/api/v1/notes", {}, token);
    return dtos.map(parseNoteResponse);
  },

  /**
   * POST /api/v1/notes → cria uma nova nota
   * Retorna a nota criada já mapeada para o tipo Note.
   */
  create: async (data: NoteRequestDTO, token: string): Promise<Note> => {
    const dto = await request<NoteResponseDTO>("/api/v1/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
    return parseNoteResponse(dto);
  },

  /** GET /api/v1/notes/{id} → busca nota por ID */
  getById: async (id: string, token: string): Promise<Note> => {
    const dto = await request<NoteResponseDTO>(`/api/v1/notes/${id}`, {}, token);
    return parseNoteResponse(dto);
  },

  /** PUT /api/v1/notes/{id} → atualiza uma nota */
  update: async (id: string, data: NoteRequestDTO, token: string): Promise<Note> => {
    const dto = await request<NoteResponseDTO>(`/api/v1/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
    return parseNoteResponse(dto);
  },

  /** DELETE /api/v1/notes/{id} → remove uma nota */
  delete: (id: string, token: string): Promise<void> =>
    request<void>(`/api/v1/notes/${id}`, { method: "DELETE" }, token),

  /**
   * Versão raw que preserva planMessage para detecção de limite de plano.
   * Use quando precisar checar se o backend retornou aviso de plano.
   */
  createRaw: (data: NoteRequestDTO, token: string): Promise<NoteResponseDTO> =>
    request<NoteResponseDTO>("/api/v1/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// ─── Busca Generalizada ───────────────────────────────────────────────
// Contrato do endpoint backend (a implementar):
//   GET /api/v1/search?q={query}
//   Headers: Authorization: Bearer {token}
//   Response 200:
//     { notes: NoteResponseDTO[], biblePassages: BibleSearchResultDTO[] }
//   O backend deve buscar notas por título/conteúdo/temas e passagens bíblicas por tema.

export interface BibleSearchResultDTO {
  reference: string;   // ex: "João 3:16"
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
  /** GET /api/v1/search?q={query} → notas + passagens bíblicas */
  search: (query: string, token: string): Promise<SearchResultsDTO> =>
    request<SearchResultsDTO>(
      `/api/v1/search?${new URLSearchParams({ q: query })}`,
      {},
      token,
    ),
};

// ─── Bíblia ───────────────────────────────────────────────────────────
// Contrato do endpoint backend (a implementar no backend):
//   GET /api/v1/bible/passages
//   Query params:
//     book        string  — nome do livro em PT (ex: "João", "Gênesis")
//     chapter     number  — número do capítulo
//     translation string  — código da tradução (ex: "nvi", "almeida")
//     verseStart? number  — versículo inicial (opcional)
//     verseEnd?   number  — versículo final (opcional, requer verseStart)
//   Response 200:
//     { book: string, chapter: number, translation: string,
//       verses: [{ verse: number, text: string }] }

export interface BibleVerseDTO {
  verse: number;
  text: string;
}

export interface BiblePassageResponseDTO {
  book: string;
  chapter: number;
  translation: string;
  verses: BibleVerseDTO[];
}

export const bibleApi = {
  /** Busca capítulo completo. Usa /api/bible/chapter como intermediário até backend estar pronto. */
  getChapter: async (
    book: string,
    chapter: number,
    translation: string,
  ): Promise<BiblePassageResponseDTO> => {
    const params = new URLSearchParams({
      book: toApiBookName(book),
      chapter: String(chapter),
      translation,
    });
    // TODO: quando backend implementar o endpoint, substituir por:
    // const res = await fetch(`/api/proxy/api/v1/bible/passages?${new URLSearchParams({ book, chapter: String(chapter), translation })}`);
    const res = await fetch(`/api/bible/chapter?${params}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.error ?? `Erro ${res.status}`);
    }
    const data = await res.json();
    return {
      book,
      chapter,
      translation,
      verses: (data.verses ?? []).map((v: { verse: number; text: string }) => ({
        verse: v.verse,
        text: v.text,
      })),
    };
  },

  /** Busca trecho específico com versículos inicial/final. Requer backend implementado. */
  getPassage: async (
    book: string,
    chapter: number,
    translation: string,
    verseStart?: number,
    verseEnd?: number,
  ): Promise<BiblePassageResponseDTO> => {
    const params = new URLSearchParams({
      book,
      chapter: String(chapter),
      translation,
    });
    if (verseStart !== undefined) params.set("verseStart", String(verseStart));
    if (verseEnd !== undefined) params.set("verseEnd", String(verseEnd));
    const res = await fetch(`/api/proxy/api/v1/bible/passages?${params}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.error ?? `Erro ${res.status}`);
    }
    return res.json() as Promise<BiblePassageResponseDTO>;
  },
};
