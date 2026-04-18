import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/layout/auth-guard";
import { DarkModeProvider } from "@/components/layout/dark-mode-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeProvider>
      <AuthGuard>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="px-10 py-8">{children}</div>
          </main>
        </div>
      </AuthGuard>
    </DarkModeProvider>
  );
}
