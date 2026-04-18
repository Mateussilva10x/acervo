"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/auth";
import { MOCK_NOTES, type Note } from "@/lib/mock-data";

interface AppState {
  // Auth
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;

  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Notes
  notes: Note[];
  addNote: (note: Note) => void;
  deleteNote: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),

      // Dark Mode
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // Notes
      notes: MOCK_NOTES,
      addNote: (note) =>
        set((s) => ({ notes: [note, ...s.notes] })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    {
      name: "segundo-cerebro-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        darkMode: state.darkMode,
        notes: state.notes,
      }),
    }
  )
);
