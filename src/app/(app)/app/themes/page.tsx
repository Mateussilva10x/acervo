"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tag, BookOpen } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import { Suspense, useMemo } from "react";

function ThemesContent() {
  const searchParams = useSearchParams();
  const activeTag    = searchParams.get("tag");
  const notes        = useAppStore((s) => s.notes);
  const themes       = useAppStore((s) => s.themes);

  // Contagem de temas calculada a partir das notas no store
  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) =>
      n.themes.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; }),
    );
    // Garante que temas do backend sem notas ainda apareçam com count 0
    themes.forEach((t) => {
      if (counts[t.name] === undefined) counts[t.name] = 0;
    });
    return counts;
  }, [notes, themes]);

  const filteredNotes = activeTag
    ? notes.filter((n) => n.themes.includes(activeTag))
    : [];

  const sortedThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Temas</h1>

      {/* Tags Cloud */}
      {sortedThemes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum tema cadastrado ainda.{" "}
            <Link href="/app/notes/new" className="text-gold hover:underline">
              Crie uma nota para começar!
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sortedThemes.map(([theme, count]) => (
            <a
              key={theme}
              href={`/app/themes?tag=${encodeURIComponent(theme)}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTag === theme
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
              }`}
            >
              <Tag size={12} />
              {theme}
              <span className="text-xs opacity-70">({count})</span>
            </a>
          ))}
        </div>
      )}

      {/* Notes filtered by tag */}
      {activeTag && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Notas em &ldquo;{activeTag}&rdquo;
            <span className="text-sm text-muted-foreground font-normal ml-2">
              ({filteredNotes.length})
            </span>
          </h2>

          {filteredNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma nota com esse tema ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredNotes.map((note) => (
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
                  {note.bibleRefs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                      {note.bibleRefs.map((ref) => (
                        <span
                          key={`${ref.book}-${ref.chapter}`}
                          className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-xs text-gold"
                        >
                          <BookOpen size={9} />
                          {ref.book} {ref.chapter}
                          {ref.verseStart ? `:${ref.verseStart}` : ""}
                          {ref.verseEnd ? `-${ref.verseEnd}` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ThemesPage() {
  return (
    <Suspense>
      <ThemesContent />
    </Suspense>
  );
}
