"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { authApi, planApi, paymentApi, ApiError } from "@/lib/api";
import {
  Sun,
  Moon,
  User,
  Shield,
  Sparkles,
  Zap,
  Loader2,
  Check,
  CreditCard,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const {
    token,
    user,
    setUser,
    setAuth,
    notes,
    themes,
    planUsage,
    setPlanUsage,
    darkMode,
    toggleDarkMode,
  } = useAppStore();

  const [loadingUser, setLoadingUser]       = useState(false);
  const [userError, setUserError]           = useState("");

  // Estados de checkout e simulação
  const [upgrading, setUpgrading]           = useState(false);
  const [simulating, setSimulating]         = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  // Estados de troca de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass]       = useState(false);
  const [passError, setPassError]             = useState("");
  const [passSuccess, setPassSuccess]         = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoadingUser(true);
    setUserError("");

    Promise.all([
      authApi.me(token).catch((err) => {
        if (err instanceof ApiError) {
          setUserError(`Erro ao carregar perfil (${err.status}).`);
        }
        return null;
      }),
      planApi.getUsage(token).catch(() => null),
    ])
      .then(([freshUser, freshUsage]) => {
        if (freshUser) setAuth(token, freshUser);
        if (freshUsage) setPlanUsage(freshUsage);
      })
      .finally(() => setLoadingUser(false));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const planType = user?.planType ?? planUsage?.planType ?? "FREE";
  const isPro = planType === "PRO";
  const notesCount = notes.length;
  const themesCount = themes.length;

  async function handleCheckout() {
    if (!token) return;
    setUpgrading(true);
    try {
      const res = await paymentApi.createCheckout(token);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch {
      alert("Não foi possível iniciar o checkout no momento.");
    } finally {
      setUpgrading(false);
    }
  }

  async function handleSimulateUpgrade() {
    if (!token) return;
    setSimulating(true);
    try {
      const updatedUser = await paymentApi.simulateUpgrade(token);
      setUser(updatedUser);
      // Atualiza o uso
      const freshUsage = await planApi.getUsage(token).catch(() => null);
      if (freshUsage) setPlanUsage(freshUsage);
      setUpgradeSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao simular upgrade.");
    } finally {
      setSimulating(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    setPassSuccess(false);

    if (newPassword.length < 6) {
      setPassError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("As senhas não coincidem.");
      return;
    }

    if (!token) return;
    setChangingPass(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword }, token);
      setPassSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassError(
        err instanceof Error ? err.message : "Erro ao alterar senha.",
      );
    } finally {
      setChangingPass(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Configurações
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Gerencie seu perfil, plano, preferências e credenciais de acesso.
        </p>
      </div>

      {/* ── Plano & Assinatura ─────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles size={18} className="text-gold" />
            Plano & Assinatura
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isPro
                ? "bg-gold text-primary-foreground shadow-sm"
                : "border border-border bg-secondary text-muted-foreground"
            }`}
          >
            {isPro ? (
              <>
                <Zap size={12} className="fill-current" />
                PLANO PRO ATIVO
              </>
            ) : (
              "PLANO GRATUITO (FREE)"
            )}
          </span>
        </div>

        {upgradeSuccess && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-xs text-green-700 dark:text-green-400 flex items-center gap-2">
            <Check size={14} className="shrink-0" />
            Parabéns! Sua conta agora possui o Plano PRO com acesso ilimitado.
          </div>
        )}

        {isPro ? (
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              Você tem acesso total e ilimitado!
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <Check size={12} className="text-gold" /> Notas e sermões ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Check size={12} className="text-gold" /> Temas e categorizações ilimitadas
              </li>
              <li className="flex items-center gap-2">
                <Check size={12} className="text-gold" /> Transcrição de PDFs com Inteligência Artificial
              </li>
              <li className="flex items-center gap-2">
                <Check size={12} className="text-gold" /> Acesso a todas as versões da Bíblia
              </li>
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              No plano gratuito, você pode experimentar o Acervo com limites de armazenamento:
            </p>

            {/* Barras de uso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Notas</span>
                  <span className="text-muted-foreground">{notesCount} / 5</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      notesCount >= 5 ? "bg-destructive" : "bg-gold"
                    }`}
                    style={{ width: `${Math.min(100, (notesCount / 5) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Temas</span>
                  <span className="text-muted-foreground">{themesCount} / 3</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      themesCount >= 3 ? "bg-destructive" : "bg-gold"
                    }`}
                    style={{ width: `${Math.min(100, (themesCount / 3) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Ações de Upgrade */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={handleCheckout}
                disabled={upgrading}
                className="flex-1 h-11 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {upgrading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} />
                )}
                Fazer Upgrade para o PRO (R$ 19,90/mês)
              </button>

              <button
                onClick={handleSimulateUpgrade}
                disabled={simulating}
                title="Ativar instantaneamente para testes locais"
                className="h-11 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {simulating ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                Simular PRO (Dev)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Perfil ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User size={18} className="text-gold" />
          Perfil
        </h2>

        {loadingUser ? (
          <div className="flex items-center gap-2 text-muted-foreground py-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Carregando dados...</span>
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

      {/* ── Segurança (Troca de Senha) ─────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Shield size={18} className="text-gold" />
          Segurança
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Senha atual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repita a nova senha"
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {passError && (
            <p className="text-xs text-destructive">{passError}</p>
          )}

          {passSuccess && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Senha alterada com sucesso!
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={changingPass || !currentPassword || !newPassword}
              className="h-9 px-5 rounded-xl bg-gold text-primary-foreground text-xs font-medium hover:bg-gold-dark transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {changingPass ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Lock size={13} />
              )}
              Alterar senha
            </button>
          </div>
        </form>
      </section>

      {/* ── Aparência ──────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Aparência</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon size={18} className="text-gold" />
            ) : (
              <Sun size={18} className="text-gold" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {darkMode ? "Modo Escuro" : "Modo Claro"}
              </p>
              <p className="text-xs text-muted-foreground">
                Alterne o tema da interface visual
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
    </div>
  );
}
