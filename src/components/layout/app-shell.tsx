"use client";

import { useState } from "react";
import { Menu, BookMarked } from "lucide-react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static on desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out",
          "md:relative md:z-auto md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <BookMarked className="text-gold" size={18} />
            <span className=" text-base font-semibold text-foreground">
              Acervo
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 md:px-10 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
