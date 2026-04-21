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
          n.themes.some((t) => t.toLowerCase().includes(q)),
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
        <h1 className=" text-2xl sm:text-3xl font-bold text-foreground">
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
            <SlidersHorizontal
              size={14}
              className="text-muted-foreground shrink-0"
            />
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
            <Search size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Nenhuma nota encontrada
            </p>
          </div>
        ) : (
          filtered.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group flex flex-col"
            >
              {/* Date row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(note.createdAt)}
                </span>
                {note.location && (
                  <span className="text-xs text-muted-foreground/60 truncate">
                    📍 {note.location}
                  </span>
                )}
              </div>

              {/* Title + content */}
              <Link href={`/app/notes/${note.id}`} className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors leading-snug">
                  {note.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
                  {note.content}
                </p>
              </Link>

              {/* Tags + refs */}
              {(note.themes.length > 0 || note.bibleRefs.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                  {note.themes.map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setFilterTheme(theme)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                    >
                      <Tag size={9} />
                      {theme}
                    </button>
                  ))}
                  {note.bibleRefs.map((ref) => (
                    <Link
                      key={`${ref.book}-${ref.chapter}`}
                      href={readerUrl(ref.book, ref.chapter)}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-xs text-gold hover:bg-gold/10 transition-colors"
                    >
                      <BookOpen size={9} />
                      {ref.book} {ref.chapter}
                      {ref.verseStart ? `:${ref.verseStart}` : ""}
                      {ref.verseEnd ? `-${ref.verseEnd}` : ""}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
