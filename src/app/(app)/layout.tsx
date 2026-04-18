import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { DarkModeProvider } from "@/components/layout/dark-mode-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeProvider>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </DarkModeProvider>
  );
}
