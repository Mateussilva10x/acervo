"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { notesApi, themesApi, authApi, planApi } from "@/lib/api";

/**
 * Garante que há token antes de renderizar a área autenticada.
 * Após confirmar autenticação, faz o fetch inicial de notas, temas, perfil e limites
 * para popular o store com dados reais do backend.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token        = useAppStore((s) => s.token);
  const setNotes     = useAppStore((s) => s.setNotes);
  const setThemes    = useAppStore((s) => s.setThemes);
  const setUser      = useAppStore((s) => s.setUser);
  const setPlanUsage = useAppStore((s) => s.setPlanUsage);
  const router       = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!hydrated || !token || fetchedRef.current) return;
    fetchedRef.current = true;

    Promise.all([
      notesApi.getAll(token).catch(() => null),
      themesApi.getAll(token).catch(() => null),
      authApi.me(token).catch(() => null),
      planApi.getUsage(token).catch(() => null),
    ]).then(([notes, themes, userProfile, planUsage]) => {
      if (notes) setNotes(notes);
      if (themes) setThemes(themes);
      if (userProfile) setUser(userProfile);
      if (planUsage) setPlanUsage(planUsage);
    });
  }, [hydrated, token, setNotes, setThemes, setUser, setPlanUsage]);

  if (!hydrated || !token) return null;

  return <>{children}</>;
}
