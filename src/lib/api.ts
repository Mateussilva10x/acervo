/**
 * API client — todas as chamadas passam pelo proxy Next.js (/api/proxy/*)
 * que repassa server-to-server para o backend, evitando CORS.
 */

import type { BibleRef, Note } from "@/lib/mock-data";
import { BIBLE_BOOKS, toApiBookName } from "@/lib/bible-books";

const BASE_URL = "/api/proxy";

// ─── Helpers Utilitários ──────────────────────────────────────────

export function parseJwt<T = Record<string, any>>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ─── DTOs (espelham o Swagger / Backend Spring Boot 3) ────────────

export interface UserResponseDTO {
  id: string;       // UUID
  name: string;
  email: string;
  birthDate?: string; // "YYYY-MM-DD"
  role?: string;
  planType?: "FREE" | "PRO";
  firstLogin?: boolean;
  isFirstLogin?: boolean;
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
  role?: string;
  planType?: "FREE" | "PRO";
  user?: UserResponseDTO;
}

export interface FirstAccessPasswordDTO {
  password?: string;
  newPassword?: string;
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
  referenceId?: string;
  amountCents?: number;
  currency?: string;
  provider?: string;
}

// ─── Bíblia DTOs ──────────────────────────────────────────────────

export interface BibleTranslationDTO {
  code: string;
  name: string;
  language?: string;
}

export interface BibleBookDTO {
  id: number | string;
  name: string;
  abbrev?: string;
  testament: string; // "AT" | "NT"
  chapters?: number;
}

export interface BibleVerseDTO {
  verse: number;
  text: string;
}

export interface BibleChapterResponseDTO {
  bookId?: number | string;
  book?: string;
  chapter: number;
  translation: string;
  verses: BibleVerseDTO[];
}

export interface BibleSearchResultDTO {
  reference?: string;
  bookId?: number | string;
  book?: string;
  chapter?: number;
  verse?: number;
  text: string;
  translation?: string;
}

export interface BiblePassageResponseDTO {
  bookId?: number | string;
  book: string;
  chapter: number;
  verseStart?: number | null;
  verseEnd?: number | null;
  translation: string;
  reference?: string;
  verses: BibleVerseDTO[];
}

// ─── Helpers de Mapeamento de Notas ───────────────────────────────

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

// ─── Erro Tipado ──────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Helper de Fetch ──────────────────────────────────────────────

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
  return res.text() as unknown as T;
}

// ─── Auth API ─────────────────────────────────────────────────────

export const authApi = {
  login: async (data: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const raw = await request<any>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify(data) },
    );

    let token = "";
    let isFirstLogin = false;
    let role = "USER";
    let planType: "FREE" | "PRO" = "FREE";
    let user: UserResponseDTO | undefined = undefined;

    if (typeof raw === "string") {
      token = raw;
    } else if (raw && typeof raw === "object") {
      token = raw.token ?? "";
      isFirstLogin = raw.isFirstLogin ?? raw.firstLogin ?? false;
      role = raw.role ?? "USER";
      planType = raw.planType ?? "FREE";
      if (raw.user) user = raw.user;
    }

    if (token) {
      const claims = parseJwt(token);
      if (claims) {
        if (claims.isFirstLogin !== undefined) isFirstLogin = Boolean(claims.isFirstLogin);
        if (claims.firstLogin !== undefined) isFirstLogin = Boolean(claims.firstLogin);
        if (claims.role) role = claims.role;
        if (claims.planType) planType = claims.planType;
        if (!user && (claims.id || claims.userId || claims.sub)) {
          user = {
            id: String(claims.id || claims.userId || claims.sub),
            name: claims.name || claims.sub || data.email,
            email: claims.email || data.email,
            birthDate: claims.birthDate || "",
            role,
            planType,
            isFirstLogin,
            firstLogin: isFirstLogin,
          };
        }
      }
    }

    return {
      token,
      isFirstLogin,
      role,
      planType,
      user,
    };
  },

  me: (token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>("/api/v1/auth/me", {}, token),

  firstAccessPassword: async (
    idOrData: string | FirstAccessPasswordDTO,
    newPasswordOrToken?: string,
    tokenParam?: string,
  ): Promise<void> => {
    if (typeof idOrData === "string" && newPasswordOrToken) {
      return request<void>(
        `/api/v1/users/${encodeURIComponent(idOrData)}/first-access-password`,
        {
          method: "PATCH",
          body: JSON.stringify({ newPassword: newPasswordOrToken }),
        },
        tokenParam,
      );
    }

    const payload = idOrData as any;
    const pwd = payload.newPassword || payload.password;
    const tok = newPasswordOrToken;

    let userId: string | null = null;
    if (tok) {
      const claims = parseJwt(tok);
      userId = claims?.id || claims?.userId || claims?.sub;
    }

    if (userId) {
      try {
        return await request<void>(
          `/api/v1/users/${encodeURIComponent(userId)}/first-access-password`,
          {
            method: "PATCH",
            body: JSON.stringify({ newPassword: pwd }),
          },
          tok,
        );
      } catch (err: any) {
        if (err?.status !== 404 && err?.status !== 405) throw err;
      }
    }

    return request<void>(
      "/api/v1/auth/first-access-password",
      {
        method: "POST",
        body: JSON.stringify({ newPassword: pwd, password: pwd }),
      },
      tok,
    );
  },

  forgotPassword: (email: string): Promise<void> =>
    request<void>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string): Promise<void> =>
    request<void>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),

  changePassword: (data: ChangePasswordDTO, token: string): Promise<void> =>
    request<void>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// ─── Usuários API ─────────────────────────────────────────────────

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

// ─── Temas API ────────────────────────────────────────────────────

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

// ─── Notas API ────────────────────────────────────────────────────

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

// ─── Plano e Pagamento API ────────────────────────────────────────

export const planApi = {
  getUsage: async (token: string): Promise<PlanUsageDTO> => {
    try {
      return await request<PlanUsageDTO>("/api/v1/plans/usage", {}, token);
    } catch (err: any) {
      if (err?.status === 404) {
        return request<PlanUsageDTO>("/api/v1/plan/usage", {}, token);
      }
      throw err;
    }
  },
};

export const paymentApi = {
  createCheckoutSession: async (token: string): Promise<CheckoutResponseDTO> => {
    try {
      return await request<CheckoutResponseDTO>(
        "/api/v1/payments/checkout",
        { method: "POST" },
        token,
      );
    } catch (err: any) {
      if (err?.status === 404) {
        return request<CheckoutResponseDTO>(
          "/api/v1/payment/checkout",
          { method: "POST" },
          token,
        );
      }
      throw err;
    }
  },

  createCheckout: (token: string): Promise<CheckoutResponseDTO> =>
    paymentApi.createCheckoutSession(token),

  simulateUpgrade: (token: string): Promise<UserResponseDTO> =>
    request<UserResponseDTO>("/api/v1/payment/simulate-upgrade", { method: "POST" }, token),
};

export const createCheckoutSession = paymentApi.createCheckoutSession;

// ─── Bíblia API ───────────────────────────────────────────────────

export const bibleApi = {
  getTranslations: async (): Promise<BibleTranslationDTO[]> => {
    try {
      const data = await request<any[]>("/api/v1/bible/translations");
      if (Array.isArray(data) && data.length > 0) {
        return data.map((t) => ({
          code: t.code || t.identifier || t.short_name || t.id || "",
          name: t.name || t.full_name || t.code || "",
          language: t.language,
        }));
      }
    } catch {
      // Fallback gracioso
    }
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
  },

  getBooks: async (testament?: string): Promise<BibleBookDTO[]> => {
    const q = testament ? `?testament=${encodeURIComponent(testament)}` : "";
    try {
      const data = await request<any[]>(`/api/v1/bible/books${q}`);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((b) => ({
          id: b.id ?? b.bookId ?? b.identifier,
          name: b.name,
          abbrev: b.abbrev ?? b.abbreviation ?? "",
          testament: b.testament,
          chapters: b.chapters ?? b.totalChapters ?? 1,
        }));
      }
    } catch {
      // Fallback
    }
    return BIBLE_BOOKS.map((b) => ({
      id: b.id,
      name: b.name,
      abbrev: "",
      testament: b.testament,
      chapters: b.chapters,
    })).filter((b) => !testament || b.testament === testament);
  },

  getChapter: async (
    translation: string,
    bookId: string | number,
    chapter: string | number,
  ): Promise<BibleChapterResponseDTO> => {
    const path = `/api/v1/bible/${encodeURIComponent(translation)}/${encodeURIComponent(bookId)}/${encodeURIComponent(chapter)}`;
    const res = await request<any>(path);

    if (Array.isArray(res)) {
      return {
        bookId,
        chapter: Number(chapter),
        translation,
        verses: res.map((v) => ({
          verse: v.verse ?? v.number ?? v.verseNumber ?? 0,
          text: (v.text ?? v.verseText ?? "").trim(),
        })),
      };
    }

    const rawVerses: any[] = res.verses ?? res.items ?? [];
    return {
      bookId: res.bookId ?? bookId,
      book: res.book,
      chapter: res.chapter ? Number(res.chapter) : Number(chapter),
      translation: res.translation ?? translation,
      verses: rawVerses.map((v) => ({
        verse: v.verse ?? v.number ?? v.verseNumber ?? 0,
        text: (v.text ?? v.verseText ?? "").trim(),
      })),
    };
  },

  searchVerses: async (
    translation: string,
    query: string,
  ): Promise<BibleSearchResultDTO[]> => {
    const params = new URLSearchParams({
      translation,
      query,
    });
    const res = await request<any>(`/api/v1/bible/search?${params}`);
    if (Array.isArray(res)) {
      return res.map((item: any) => ({
        reference: item.reference ?? `${item.book ?? ""} ${item.chapter ?? ""}:${item.verse ?? ""}`.trim(),
        bookId: item.bookId ?? item.id,
        book: item.book,
        chapter: item.chapter,
        verse: item.verse,
        text: item.text,
        translation: item.translation ?? translation,
      }));
    }
    const list = res.verses ?? res.items ?? [];
    return list.map((item: any) => ({
      reference: item.reference ?? `${item.book ?? ""} ${item.chapter ?? ""}:${item.verse ?? ""}`.trim(),
      bookId: item.bookId ?? item.id,
      book: item.book,
      chapter: item.chapter,
      verse: item.verse,
      text: item.text,
      translation: item.translation ?? translation,
    }));
  },

  search: (query: string, translation = "ACF11"): Promise<BibleSearchResultDTO[]> =>
    bibleApi.searchVerses(translation, query),

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
};

// ─── Busca Geral API ──────────────────────────────────────────────

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
