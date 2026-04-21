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
  const { darkMode, toggleDarkMode, logout } = useAppStore();

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
          <span className=" text-base font-semibold text-foreground">
            Acervo
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/app/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
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

      {/* Footer */}
      <div className="px-2 py-4 border-t border-sidebar-border space-y-0.5">
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
