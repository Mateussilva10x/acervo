"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookMarked, Eye, EyeOff } from "lucide-react";
import { authApi, usersApi, ApiError } from "@/lib/api";
import { useAppStore } from "@/store/app-store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Remove máscara do CPF antes de enviar (apenas dígitos)
  function rawCpf(v: string) {
    return v.replace(/\D/g, "");
  }

  function formatCpf(v: string) {
    const digits = rawCpf(v).slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cpfDigits = rawCpf(cpf);
    if (cpfDigits.length !== 11) {
      setError("CPF deve conter 11 dígitos.");
      return;
    }

    setLoading(true);
    try {
      // 1. Cria o usuário
      await usersApi.create({
        name,
        email,
        birthDate,
        password,
        cpf: cpfDigits,
      });

      // 2. Faz login automático e vai ao dashboard
      const token = await authApi.login({ email, password });
      setAuth(token, null); // user será carregado sob demanda (Settings)
      router.push("/app/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("E-mail já cadastrado. Tente fazer login.");
        } else if (err.status === 400) {
          setError("Dados inválidos. Verifique as informações e tente novamente.");
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
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <BookMarked className="text-gold mb-3" size={32} />
            <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comece gratuitamente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Pastor Carlos Silva"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>

            {/* E-mail */}
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

            {/* Data de nascimento + CPF na mesma linha */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Nascimento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  required
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>
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
                  autoComplete="new-password"
                  placeholder="Mín. 8 caracteres"
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
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-gold hover:text-gold-dark font-medium transition-colors"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
