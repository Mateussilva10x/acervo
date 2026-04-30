"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useAppStore } from "@/store/app-store";

export default function ChangePasswordPage() {
  const router   = useRouter();
  const token    = useAppStore((s) => s.token);
  const logout   = useAppStore((s) => s.logout);

  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);

  const passwordsMatch  = newPassword === confirmPassword;
  const passwordTooWeak = newPassword.length > 0 && newPassword.length < 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordsMatch || passwordTooWeak || !token) return;

    setError("");
    setLoading(true);
    try {
      await authApi.changePassword({ newPassword }, token);
      router.push("/app/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Erro ao redefinir senha (${err.status}). Tente novamente.`);
      } else {
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
              <ShieldCheck className="text-gold" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Bem-vindo ao Acervo
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center leading-relaxed">
              Este é o seu primeiro acesso. Por segurança, defina uma senha
              pessoal antes de continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova senha */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Nova senha
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordTooWeak && (
                <p className="text-xs text-destructive">
                  A senha deve ter pelo menos 8 caracteres.
                </p>
              )}
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Confirmar nova senha
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">
                  As senhas não coincidem.
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center rounded-lg bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !passwordsMatch || passwordTooWeak || !newPassword}
              className="w-full h-11 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Salvando..." : "Definir senha e continuar"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookMarked size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Acervo — Segundo Cérebro do Pregador
              </span>
            </div>
            <button
              onClick={logout}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
