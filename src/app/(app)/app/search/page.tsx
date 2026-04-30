"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Tag, BookOpen, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { Note } from "@/lib/mock-data";

const SUGGESTIONS = [
  "história sobre superação",
  "oração e ansiedade",
  "família e criação de filhos",
  "o que é graça",
  "missões e evangelismo",
  "dons espirituais",
];

export default function SearchPage() {
  const notes    = useAppStore((s) => s.notes);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSearch(q: string) {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setSearched(false);
    // Busca client-side no store (sem endpoint de busca no backend ainda)
    await new Promise((r) => setTimeout(r, 300));
    const lower = q.toLowerCase();
    setResults(
      notes.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.content.toLowerCase().includes(lower) ||
          n.themes.some((t) => t.toLowerCase().includes(lower)) ||
          n.bibleRefs.some((r) => r.book.toLowerCase().includes(lower)),
      ),
    );
    setSearched(true);
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch(query);
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <h1 className=" text-2xl sm:text-3xl font-bold text-foreground">
        Buscar
      </h1>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busque por intenção: 'história sobre perdão'..."
            className="w-full h-11 rounded-xl border border-input bg-transparent pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-gold text-primary-foreground hover:bg-gold-dark transition-colors disabled:opacity-60 shrink-0"
        >
          <Search size={16} />
        </button>
      </form>

      {/* Suggestions */}
      {!searched && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles size={12} />
            Sugestões de busca
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="text-xs rounded-full border border-border px-3 py-1.5 text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {searched && !loading && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Search size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum resultado para &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {results.length} resultado{results.length !== 1 ? "s" : ""} para{" "}
            <span className="text-foreground">&ldquo;{query}&rdquo;</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {results.map((note, i) => (
              <Link
                key={note.id}
                href={`/app/notes/${note.id}`}
                className="flex flex-col rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-gold bg-gold/10 rounded px-1.5 py-0.5 shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors leading-snug">
                  {note.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-1.5 flex-1">
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
        </div>
      )}

      {/* Empty initial state */}
      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Search size={40} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground text-center">
            Busque por intenção: &lsquo;história sobre perdão&rsquo;...
          </p>
        </div>
      )}
    </div>
  );
}
