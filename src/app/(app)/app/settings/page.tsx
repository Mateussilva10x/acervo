"use client";

import { useAppStore } from "@/store/app-store";
import { Sun, Moon, User, Bell } from "lucide-react";

export default function SettingsPage() {
  const { user, darkMode, toggleDarkMode } = useAppStore();

  return (
    <div className="max-w-lg space-y-8 animate-fade-in">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
        Configurações
      </h1>

      {/* Profile */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
          <User size={16} className="text-gold" />
          Perfil
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nome</p>
            <p className="text-sm text-foreground font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">E-mail</p>
            <p className="text-sm text-foreground">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Igreja</p>
            <p className="text-sm text-foreground">{user?.church || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Plano</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-gold/30 text-gold text-xs font-medium capitalize">
              {user?.plan}
            </span>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Aparência
        </h2>
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

      {/* Notifications */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
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
