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
  const user         = useAppStore((s) => s.user);
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
    if (!hydrated) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (user?.isFirstLogin || user?.firstLogin) {
      router.replace("/change-password");
    }
  }, [hydrated, token, user, router]);

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
      if (userProfile) {
        setUser(userProfile);
        if (userProfile.isFirstLogin || userProfile.firstLogin) {
          router.replace("/change-password");
          return;
        }
      }
      if (planUsage) setPlanUsage(planUsage);
    });
  }, [hydrated, token, router, setNotes, setThemes, setUser, setPlanUsage]);

  if (!hydrated || !token || user?.isFirstLogin || user?.firstLogin) return null;

  return <>{children}</>;
}
