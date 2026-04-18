"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Tag, BookOpen, Plus, SlidersHorizontal } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { THEMES } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { readerUrl } from "@/lib/bible-books";

export default function NotesPage() {
  const { notes } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterTheme, setFilterTheme] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

  const filtered = useMemo(() => {
    let list = [...notes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.themes.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterTheme) {
      list = list.filter((n) => n.themes.includes(filterTheme));
    }
    list.sort((a, b) => {
      const diff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortBy === "recent" ? diff : -diff;
    });
    return list;
  }, [notes, search, filterTheme, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Todas as notas
        </h1>
        <Link
          href="/app/notes/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors"
        >
          <Plus size={15} />
          Nova nota
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar nas notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-input bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>

        {/* Theme filter + Sort (same row on mobile) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="flex-1 sm:flex-none h-9 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas</option>
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
            className="h-9 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="recent">Recentes</option>
            <option value="oldest">Antigas</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} nota{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Notes List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Search size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Nenhuma nota encontrada
            </p>
          </div>
        ) : (
          filtered.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/app/notes/${note.id}`}>
                  <h3 className="font-serif text-sm font-semibold text-foreground group-hover:text-gold transition-colors cursor-pointer">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                  {note.location && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      📍 {note.location}
                    </p>
                  )}
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setFilterTheme(theme)}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                      >
                        <Tag size={10} />
                        {theme}
                      </button>
                    ))}
                    {note.bibleRefs.map((ref) => (
                      <Link
                        key={`${ref.book}-${ref.chapter}`}
                        href={readerUrl(ref.book, ref.chapter)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
                      >
                        <BookOpen size={10} />
                        {ref.book} {ref.chapter}
                        {ref.verseStart ? `:${ref.verseStart}` : ""}
                        {ref.verseEnd ? `-${ref.verseEnd}` : ""}
                      </Link>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                  {formatDate(note.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
