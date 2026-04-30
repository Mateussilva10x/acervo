"use client";

import Link from "next/link";
import { FileText, Tag, Clock, Plus, BookOpen } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import { useMemo } from "react";

export default function DashboardPage() {
  const user  = useAppStore((s) => s.user);
  const notes = useAppStore((s) => s.notes);

  // Contagem de temas calculada a partir das notas no store
  const topThemes = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => n.themes.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [notes]);

  const recentNotes = notes.slice(0, 6);
  const latestNote  = notes[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Bem-vindo de volta, {user?.name ?? "Pastor"}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{user?.email ?? ""}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Notes */}
        <div className="rounded-xl border border-border bg-card p-5 flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total de Notas</p>
            <p className="text-4xl font-bold text-foreground">{notes.length}</p>
          </div>
          <FileText size={18} className="text-muted-foreground mt-1" />
        </div>

        {/* Top Themes */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Temas Mais Usados</p>
            <Tag size={18} className="text-muted-foreground" />
          </div>
          {topThemes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topThemes.map(([theme, count]) => (
                <Link
                  key={theme}
                  href={`/app/themes?tag=${encodeURIComponent(theme)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                >
                  {theme} ({count})
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum tema ainda</p>
          )}
        </div>

        {/* Last Used */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Último uso</p>
            <Clock size={18} className="text-muted-foreground" />
          </div>
          {latestNote ? (
            <div>
              <Link
                href={`/app/notes/${latestNote.id}`}
                className="text-sm font-semibold text-foreground hover:text-gold transition-colors line-clamp-1"
              >
                {latestNote.title}
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(latestNote.createdAt)}
                {latestNote.location && ` — ${latestNote.location}`}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma nota ainda</p>
          )}
        </div>
      </div>

      {/* Quick Capture */}
      <Link
        href="/app/notes/new"
        className="flex items-center justify-center gap-3 w-full rounded-xl border border-dashed border-gold/40 p-4 text-gold hover:bg-gold/5 transition-colors group"
      >
        <Plus size={18} className="group-hover:scale-110 transition-transform" />
        <span className="font-medium text-sm">Captura Rápida</span>
      </Link>

      {/* Recent Notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Notas Recentes</h2>
          <Link
            href="/app/notes"
            className="text-sm text-gold hover:text-gold-dark transition-colors font-medium"
          >
            Ver Todas
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma nota ainda.{" "}
              <Link href="/app/notes/new" className="text-gold hover:underline">
                Crie a primeira!
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                href={`/app/notes/${note.id}`}
                className="flex flex-col rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors leading-snug">
                  {note.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed flex-1">
                  {note.content}
                </p>
                {(note.themes.length > 0 || note.bibleRefs.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                    {note.themes.slice(0, 2).map((theme) => (
                      <span
                        key={theme}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        <Tag size={9} />
                        {theme}
                      </span>
                    ))}
                    {note.bibleRefs.slice(0, 1).map((ref) => (
                      <span
                        key={`${ref.book}-${ref.chapter}`}
                        className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-xs text-gold"
                      >
                        <BookOpen size={9} />
                        {ref.book} {ref.chapter}
                        {ref.verseStart ? `:${ref.verseStart}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
