"use client";

import { useSearchParams } from "next/navigation";
import { Tag, BookOpen } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getThemeCounts } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Suspense } from "react";

function ThemesContent() {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const { notes } = useAppStore();
  const themeCounts = getThemeCounts();

  const filteredNotes = activeTag
    ? notes.filter((n) => n.themes.includes(activeTag))
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Temas</h1>

      {/* Tags Cloud */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(themeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([theme, count]) => (
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

      {/* Notes filtered by tag */}
      {activeTag && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
            Notas em &ldquo;{activeTag}&rdquo;
            <span className="text-sm text-muted-foreground font-normal ml-2">
              ({filteredNotes.length})
            </span>
          </h2>
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                      {note.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {note.bibleRefs.map((ref) => (
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
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
