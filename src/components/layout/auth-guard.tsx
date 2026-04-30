"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { notesApi, themesApi } from "@/lib/api";

/**
 * Garante que há token antes de renderizar a área autenticada.
 * Após confirmar autenticação, faz o fetch inicial de notas e temas
 * para popular o store com dados reais do backend.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token     = useAppStore((s) => s.token);
  const setNotes  = useAppStore((s) => s.setNotes);
  const setThemes = useAppStore((s) => s.setThemes);
  const router    = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const fetchedRef = useRef(false); // evita re-fetch em re-renders

  // Aguarda reidratação do Zustand (localStorage → state)
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Redireciona se não houver token após hidratação
  useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [hydrated, token, router]);

  // Fetch inicial de dados quando token confirmado
  useEffect(() => {
    if (!hydrated || !token || fetchedRef.current) return;
    fetchedRef.current = true;

    Promise.all([
      notesApi.getAll(token).catch(() => null),
      themesApi.getAll(token).catch(() => null),
    ]).then(([notes, themes]) => {
      if (notes)  setNotes(notes);
      if (themes) setThemes(themes);
    });
  }, [hydrated, token, setNotes, setThemes]);

  if (!hydrated || !token) return null;

  return <>{children}</>;
}
