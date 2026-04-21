"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAppStore((s) => s.token);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [hydrated, token, router]);

  // Aguarda reidratação do Zustand para não redirecionar antes de ler o token
  if (!hydrated || !token) return null;

  return <>{children}</>;
}
