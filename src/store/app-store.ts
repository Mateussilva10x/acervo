"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/auth";
import type { Note } from "@/lib/mock-data";
import type { ThemeResponseDTO, PlanUsageDTO } from "@/lib/api";
import { getTokenExpiry } from "@/lib/jwt";

interface AppState {
  // Auth
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Notas (sincronizadas com backend; persistidas localmente como cache)
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Temas (sincronizados com backend)
  themes: ThemeResponseDTO[];
  setThemes: (themes: ThemeResponseDTO[]) => void;
  addTheme: (theme: ThemeResponseDTO) => void;
  updateTheme: (id: string, name: string) => void;
  deleteTheme: (id: string) => void;

  // Limite e Uso do Plano
  planUsage: PlanUsageDTO | null;
  setPlanUsage: (usage: PlanUsageDTO | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (typeof document !== "undefined") {
          // O cookie acompanha a validade real do token. Antes durava 7 dias
          // enquanto o JWT valia 2 horas: o middleware continuava liberando as
          // rotas e toda chamada de API falhava, com o app renderizando vazio.
          const expiry = getTokenExpiry(token);
          const expires = new Date(
            expiry ?? Date.now() + 2 * 60 * 60 * 1000,
          ).toUTCString();
          const secure = window.location.protocol === "https:" ? "; Secure" : "";
          document.cookie = `acervo-token=${token}; path=/; expires=${expires}; SameSite=Lax${secure}`;
        }
        set({ token, user });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie =
            "acervo-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ token: null, user: null, notes: [], themes: [], planUsage: null });
      },

      // Dark Mode
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // Notas
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // Temas
      themes: [],
      setThemes: (themes) => set({ themes }),
      addTheme: (theme) => set((s) => ({ themes: [...s.themes, theme] })),
      updateTheme: (id, name) =>
        set((s) => ({
          themes: s.themes.map((t) => (t.id === id ? { ...t, name } : t)),
          // Atualiza também nas notas em memória se o nome mudou
          notes: s.notes.map((n) => {
            const old = s.themes.find((t) => t.id === id);
            if (!old) return n;
            return {
              ...n,
              themes: n.themes.map((th) => (th === old.name ? name : th)),
            };
          }),
        })),
      deleteTheme: (id) =>
        set((s) => {
          const old = s.themes.find((t) => t.id === id);
          return {
            themes: s.themes.filter((t) => t.id !== id),
            notes: s.notes.map((n) =>
              old ? { ...n, themes: n.themes.filter((th) => th !== old.name) } : n
            ),
          };
        }),

      // Limites e Uso
      planUsage: null,
      setPlanUsage: (planUsage) => set({ planUsage }),
    }),
    {
      name: "acervo-store",
      partialize: (state) => ({
        token:     state.token,
        user:      state.user,
        darkMode:  state.darkMode,
        notes:     state.notes,
        themes:    state.themes,
        planUsage: state.planUsage,
      }),
    }
  )
);
