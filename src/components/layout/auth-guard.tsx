"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import {
  notesApi,
  themesApi,
  authApi,
  planApi,
  setUnauthorizedHandler,
  ApiError,
} from "@/lib/api";
import { isTokenExpired } from "@/lib/jwt";

/**
 * Garante que há sessão válida antes de renderizar a área autenticada.
 * Após confirmar autenticação, faz o fetch inicial de notas, temas, perfil e limites
 * para popular o store com dados reais do backend.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token        = useAppStore((s) => s.token);
  const setNotes     = useAppStore((s) => s.setNotes);
  const setThemes    = useAppStore((s) => s.setThemes);
  const setUser      = useAppStore((s) => s.setUser);
  const setPlanUsage = useAppStore((s) => s.setPlanUsage);
  const logout       = useAppStore((s) => s.logout);
  const router       = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const fetchedRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Qualquer 401 vindo da API derruba a sessão e manda para o login, em vez de
  // deixar o usuário num app autenticado em que nada carrega.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      router.push("/login?expirado=1");
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, router]);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.push("/login");
      return;
    }

    // O cookie já é limpo pelo middleware, mas o token persistido no
    // localStorage sobrevive a ele; sem esta checagem o app tentaria carregar
    // tudo com um token morto.
    if (isTokenExpired(token)) {
      logout();
      router.push("/login?expirado=1");
    }
  }, [hydrated, token, router, logout]);

  useEffect(() => {
    if (!hydrated || !token || fetchedRef.current) return;
    fetchedRef.current = true;

    Promise.all([
      notesApi.getAll(token),
      themesApi.getAll(token),
      authApi.me(token),
      planApi.getUsage(token),
    ])
      .then(([notes, themes, userProfile, planUsage]) => {
        setNotes(notes);
        setThemes(themes);
        setUser(userProfile);
        setPlanUsage(planUsage);
      })
      .catch((err) => {
        // 401 já é tratado pelo handler acima (logout + redirect).
        if (err instanceof ApiError && err.status === 401) return;
        // Antes cada chamada tinha .catch(() => null): o app renderizava vazio,
        // sem erro e sem explicação, como se o acervo tivesse sumido.
        setLoadError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar seus dados.",
        );
      });
  }, [hydrated, token, reloadKey, setNotes, setThemes, setUser, setPlanUsage]);

  if (!hydrated || !token) return null;

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 px-4 text-center">
        <AlertCircle size={32} className="text-destructive" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            Não foi possível carregar seus dados
          </p>
          <p className="text-sm text-muted-foreground">{loadError}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            fetchedRef.current = false;
            setLoadError("");
            setReloadKey((k) => k + 1);
          }}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors"
        >
          <RefreshCw size={14} />
          Tentar novamente
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
