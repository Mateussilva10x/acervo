"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookMarked, Eye, EyeOff } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useAppStore } from "@/store/app-store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Autentica → recebe JWT → vai direto ao dashboard
      const token = await authApi.login({ email, password });
      setAuth(token, null); // user será carregado sob demanda (ex: Settings)
      router.push("/app/dashboard");
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

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <BookMarked className="text-gold mb-3" size={32} />
            <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acervo — Segundo Cérebro do Pregador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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

            {/* Senha */}
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

          <button className="w-full mt-3 text-sm text-center text-gold hover:text-gold-dark transition-colors">
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
        </div>
      </div>
    </div>
  );
}
