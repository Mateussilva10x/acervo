"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { authApi, ApiError } from "@/lib/api";
import { Sun, Moon, User, Bell, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const { token, user, setAuth, darkMode, toggleDarkMode } = useAppStore();
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState("");

  // Carrega dados do usuário via /me apenas nessa tela
  useEffect(() => {
    if (!token || user) return; // já tem dados ou sem token
    setLoadingUser(true);
    setUserError("");
    authApi
      .me(token)
      .then((freshUser) => setAuth(token, freshUser))
      .catch((err) => {
        if (err instanceof ApiError) {
          setUserError(`Erro ao carregar perfil (${err.status}).`);
        } else {
          setUserError("Não foi possível conectar ao servidor.");
        }
      })
      .finally(() => setLoadingUser(false));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-lg space-y-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
        Configurações
      </h1>

      {/* Perfil */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User size={16} className="text-gold" />
          Perfil
        </h2>

        {loadingUser ? (
          <div className="flex items-center gap-2 text-muted-foreground py-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Carregando perfil...</span>
          </div>
        ) : userError ? (
          <p className="text-sm text-destructive">{userError}</p>
        ) : (
          <div className="divide-y divide-border">
            <div className="py-3 first:pt-0">
              <p className="text-xs text-muted-foreground mb-0.5">Nome</p>
              <p className="text-sm text-foreground font-medium">
                {user?.name ?? "—"}
              </p>
            </div>
            <div className="py-3">
              <p className="text-xs text-muted-foreground mb-0.5">E-mail</p>
              <p className="text-sm text-foreground">{user?.email ?? "—"}</p>
            </div>
            <div className="py-3 last:pb-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                Data de nascimento
              </p>
              <p className="text-sm text-foreground">
                {user?.birthDate ? formatDate(user.birthDate) : "—"}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Aparência */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Aparência</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon size={16} className="text-gold" />
            ) : (
              <Sun size={16} className="text-gold" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {darkMode ? "Modo Escuro" : "Modo Claro"}
              </p>
              <p className="text-xs text-muted-foreground">
                Alterne o tema da interface
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              darkMode ? "bg-gold" : "bg-secondary"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                darkMode ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Notificações */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bell size={16} className="text-gold" />
          Notificações
        </h2>
        <p className="text-sm text-muted-foreground">
          Configurações de notificação estarão disponíveis em breve.
        </p>
      </section>
    </div>
  );
}
