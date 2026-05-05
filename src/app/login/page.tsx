"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookMarked, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useAppStore } from "@/store/app-store";

type Step = "login" | "forgot" | "forgot-success";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAppStore((s) => s.setAuth);
  const [step, setStep] = useState<Step>("login");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setResetSuccess(true);
    }
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, isFirstLogin } = await authApi.login({ email, password });
      setAuth(token, null);
      router.push(isFirstLogin ? "/change-password" : "/app/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          setError("Email ou senha incorretos.");
        } else {
          setError(`Erro do servidor (${err.status}). Tente novamente.`);
        }
      } else {
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setStep("forgot-success");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Erro do servidor (${err.status}). Tente novamente.`);
      } else {
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  }

  function goToForgot() {
    setForgotEmail(email);
    setError("");
    setStep("forgot");
  }

  function goToLogin() {
    setError("");
    setStep("login");
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <BookMarked className="text-gold mb-3" size={32} />
            <h1 className="text-2xl font-bold text-foreground">
              {step === "login" ? "Entrar" : "Redefinir senha"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acervo — Segundo Cérebro do Pregador
            </p>
          </div>

          {/* Login */}
          {step === "login" && (
            <>
              {resetSuccess && (
                <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-center text-sm text-green-700">
                  Senha redefinida com sucesso! Faça login com sua nova senha.
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="pastor@igreja.com"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center rounded-lg bg-destructive/10 px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-60"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>

              <button
                onClick={goToForgot}
                className="w-full mt-3 text-sm text-center text-gold hover:text-gold-dark transition-colors"
              >
                Esqueceu a senha?
              </button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Não tem conta?{" "}
                <Link
                  href="/register"
                  className="text-gold hover:text-gold-dark font-medium transition-colors"
                >
                  Cadastrar
                </Link>
              </p>
            </>
          )}

          {/* Forgot password — email form */}
          {step === "forgot" && (
            <>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Informe seu e-mail de cadastro. Você receberá um link para criar uma nova senha.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="pastor@igreja.com"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center rounded-lg bg-destructive/10 px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-60"
                >
                  {loading ? "Enviando..." : "Enviar link"}
                </button>
              </form>

              <button
                onClick={goToLogin}
                className="flex items-center gap-1.5 mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                Voltar ao login
              </button>
            </>
          )}

          {/* Forgot password — success */}
          {step === "forgot-success" && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-foreground font-medium">E-mail enviado!</p>
              <p className="text-sm text-muted-foreground">
                Verifique sua caixa de entrada em{" "}
                <span className="font-medium text-foreground">{forgotEmail}</span>{" "}
                e siga o link para redefinir sua senha.
              </p>
              <button
                onClick={goToLogin}
                className="flex items-center gap-1.5 mx-auto mt-2 text-sm text-gold hover:text-gold-dark transition-colors"
              >
                <ArrowLeft size={14} />
                Voltar ao login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
