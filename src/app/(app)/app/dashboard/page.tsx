"use client";

import Link from "next/link";
import { FileText, Tag, Clock, Plus, BookOpen } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getThemeCounts } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user, notes } = useAppStore();
  const themeCounts = getThemeCounts();

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentNotes = notes.slice(0, 6);
  const latestNote = notes[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Bem-vindo de volta, {user?.name ?? "Pastor"}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.church ?? "Sua Igreja"} · Plano:{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-gold/30 text-gold text-xs font-medium capitalize">
            {user?.plan ?? "Pro"}
          </span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Notes */}
        <div className="rounded-xl border border-border bg-card p-5 flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total de Notas</p>
            <p className="font-serif text-4xl font-bold text-foreground">
              {notes.length}
            </p>
          </div>
          <FileText size={18} className="text-muted-foreground mt-1" />
        </div>

        {/* Top Themes */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Temas Mais Usados</p>
            <Tag size={18} className="text-muted-foreground" />
          </div>
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
        </div>

        {/* Last Used */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Último uso</p>
            <Clock size={18} className="text-muted-foreground" />
          </div>
          {latestNote && (
            <div>
              <Link
                href={`/app/notes/${latestNote.id}`}
                className="text-sm font-serif font-semibold text-foreground hover:text-gold transition-colors line-clamp-1"
              >
                {latestNote.title}
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(latestNote.createdAt)}
                {latestNote.location && ` — ${latestNote.location}`}
              </p>
            </div>
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
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Notas Recentes
          </h2>
          <Link
            href="/app/notes"
            className="text-sm text-gold hover:text-gold-dark transition-colors font-medium"
          >
            Ver Todas
          </Link>
        </div>
        <div className="space-y-2">
          {recentNotes.map((note) => (
            <Link
              key={note.id}
              href={`/app/notes/${note.id}`}
              className="block rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-sm font-semibold text-foreground group-hover:text-gold transition-colors truncate">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.themes.map((theme) => (
                      <span
                        key={theme}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        <Tag size={10} />
                        {theme}
                      </span>
                    ))}
                    {note.bibleRefs.slice(0, 1).map((ref) => (
                      <span
                        key={`${ref.book}-${ref.chapter}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        <BookOpen size={10} />
                        {ref.book} {ref.chapter}
                        {ref.verseStart ? `:${ref.verseStart}` : ""}
                        {ref.verseEnd ? `-${ref.verseEnd}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                  {formatDate(note.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
