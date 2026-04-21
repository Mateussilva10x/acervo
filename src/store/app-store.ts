"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/auth";
import { MOCK_NOTES, type Note } from "@/lib/mock-data";

interface AppState {
  // Auth
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User | null) => void;
  logout: () => void;

  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Notes
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      token: null,
      user: null,
      setAuth: (token, user) => {
        // Sincroniza com cookie para o middleware conseguir ler server-side
        if (typeof document !== "undefined") {
          const expires = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toUTCString();
          document.cookie = `acervo-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
        }
        set({ token, user });
      },
      logout: () => {
        // Remove cookie
        if (typeof document !== "undefined") {
          document.cookie =
            "acervo-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ token: null, user: null });
      },

      // Dark Mode
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // Notes
      notes: MOCK_NOTES,
      addNote: (note) =>
        set((s) => ({ notes: [note, ...s.notes] })),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    {
      name: "acervo-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        darkMode: state.darkMode,
        notes: state.notes,
      }),
    }
  )
);
