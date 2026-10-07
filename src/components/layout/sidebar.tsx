"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BookOpen,
  BookText,
  Tag,
  Search,
  Settings,
  LogOut,
  Sun,
  Moon,
  BookMarked,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const navItems = [
  { href: "/app/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/app/notes", label: "Notas", icon: FileText },
  { href: "/app/notes/new", label: "Nova Nota", icon: PlusCircle },
  { href: "/app/reader", label: "Ler a Bíblia", icon: BookText },
  { href: "/app/bible", label: "Referências Bíblicas", icon: BookOpen },
  { href: "/app/themes", label: "Temas", icon: Tag },
  { href: "/app/search", label: "Buscar", icon: Search },
  { href: "/app/settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode, toggleDarkMode, logout, user, planUsage, notes, themes } = useAppStore();

  const isPro = (user?.planType ?? planUsage?.planType ?? "FREE") === "PRO";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <Link href="/app/dashboard" className="flex items-center gap-2">
          <BookMarked className="text-gold" size={20} />
          <span className="text-base font-semibold text-foreground">
            Acervo
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map(({ href, label, icon: Icon }) => {
          let active = false;
          if (href === "/app/dashboard" || href === "/app/notes/new") {
            active = pathname === href;
          } else if (href === "/app/notes") {
            active = pathname.startsWith(href) && !pathname.startsWith("/app/notes/new");
          } else {
            active = pathname.startsWith(href);
          }

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-100",
                active
                  ? "bg-sidebar-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon size={16} className={active ? "text-gold" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Plan Card */}
      <div className="px-2 pb-2">
        {isPro ? (
          <div className="rounded-xl border border-gold/30 bg-gold/10 p-2.5 flex items-center gap-2">
            <Zap size={14} className="text-gold shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Plano PRO</p>
              <p className="text-[10px] text-muted-foreground truncate">Acesso ilimitado</p>
            </div>
          </div>
        ) : (
          <Link
            href="/app/settings"
            onClick={onNavigate}
            className="block rounded-xl border border-gold/30 bg-gold/5 p-2.5 hover:bg-gold/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gold flex items-center gap-1">
                <Sparkles size={11} /> Plano Free
              </span>
              <span className="text-[10px] text-gold font-medium">Upgrade</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {notes.length}/5 notas • {themes.length}/3 temas
            </p>
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-sidebar-border space-y-0.5">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors duration-100"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {darkMode ? "Light" : "Dark"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors duration-100"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
