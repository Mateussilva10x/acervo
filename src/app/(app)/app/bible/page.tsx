"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Search,
  Copy,
  Check,
  PenLine,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import {
  bibleApi,
  type BibleBookDTO,
  type BibleTranslationDTO,
  type BibleSearchResultDTO,
  ApiError,
} from "@/lib/api";
import type { Note } from "@/lib/mock-data";

type Tab = "catalog" | "search";

export default function BiblePage() {
  const router = useRouter();
  const { notes } = useAppStore();

  const [tab, setTab] = useState<Tab>("catalog");

  // Estados dos livros
  const [books, setBooks] = useState<BibleBookDTO[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);

  // Livro selecionado
  const [selectedBook, setSelectedBook] = useState<BibleBookDTO | null>(null);

  // Estados de busca textual
  const [translations, setTranslations] = useState<BibleTranslationDTO[]>([]);
  const [searchTranslation, setSearchTranslation] = useState("ACF11");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BibleSearchResultDTO[]>([]);
  const [searched, setSearched] = useState(false);
  const [copiedVerseRef, setCopiedVerseRef] = useState<string | null>(null);

  // Carrega livros e traduções da API
  useEffect(() => {
    setLoadingBooks(true);
    setBooksError(null);

    Promise.all([
      bibleApi.getBooks().catch(() => []),
      bibleApi.getTranslations().catch(() => []),
    ])
      .then(([booksData, transData]) => {
        setBooks(booksData);
        setTranslations(transData);
      })
      .catch((err) => {
        setBooksError(err?.message || "Falha ao carregar livros da Bíblia.");
      })
      .finally(() => {
        setLoadingBooks(false);
      });
  }, []);

  function getNoteCount(bookName: string) {
    return notes.filter((n) =>
      n.bibleRefs.some(
        (r) => r.book.toLowerCase() === bookName.toLowerCase()
      )
    ).length;
  }

  // Divide livros em AT e NT
  const { atBooks, ntBooks } = useMemo(() => {
    const at = books.filter(
      (b) =>
        b.testament === "AT" ||
        b.testament === "OLD" ||
        b.testament.toLowerCase().includes("antigo")
    );
    const nt = books.filter(
      (b) =>
        b.testament === "NT" ||
        b.testament === "NEW" ||
        b.testament.toLowerCase().includes("novo")
    );
    return { atBooks: at, ntBooks: nt };
  }, [books]);

  // Busca textual de versículos
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearched(true);
    try {
      const results = await bibleApi.searchVerses(
        searchTranslation,
        searchQuery.trim()
      );
      setSearchResults(results);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao realizar busca de versículos.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleCopyVerse(item: BibleSearchResultDTO) {
    const ref = item.reference || `${item.book} ${item.chapter}:${item.verse}`;
    const textToCopy = `"${item.text}" — ${ref} (${item.translation || searchTranslation})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedVerseRef(ref);
      toast.success("Versículo copiado!");
      setTimeout(() => setCopiedVerseRef(null), 2500);
    } catch {
      toast.error("Erro ao copiar.");
    }
  }

  // ─── Visão Detalhada de um Livro ────────────────────────────────
  if (selectedBook) {
    const bookNotes = notes.filter((n) =>
      n.bibleRefs.some(
        (r) => r.book.toLowerCase() === selectedBook.name.toLowerCase()
      )
    );

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header do Livro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedBook(null)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                {selectedBook.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedBook.chapters ? `${selectedBook.chapters} capítulos` : "Livro bíblico"} •{" "}
                {selectedBook.testament === "AT" ? "Antigo Testamento" : "Novo Testamento"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold font-medium">
              <BookOpen size={12} />
              {bookNotes.length} nota{bookNotes.length !== 1 ? "s" : ""} vinculada
              {bookNotes.length !== 1 ? "s" : ""}
            </span>

            <Link
              href={`/app/reader?book=${encodeURIComponent(selectedBook.id)}&chapter=1`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gold text-primary-foreground text-xs font-semibold hover:bg-gold-dark transition-colors shadow-xs"
            >
              <ExternalLink size={13} />
              Ler no Leitor
            </Link>
          </div>
        </div>

        {/* Lista de Notas do Livro */}
        {bookNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <BookOpen size={36} className="text-muted-foreground/60 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Nenhuma nota vinculada a {selectedBook.name} ainda.
            </p>
            <div className="pt-2">
              <Link
                href={`/app/notes/new?book=${encodeURIComponent(selectedBook.name)}&chapter=1`}
                className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-dark font-medium"
              >
                <PenLine size={13} />
                Criar primeira nota sobre {selectedBook.name} →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Notas e Sermões com Referências em {selectedBook.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookNotes.map((note) => {
                const ref = note.bibleRefs.find(
                  (r) => r.book.toLowerCase() === selectedBook.name.toLowerCase()
                );
                const refLabel = ref
                  ? `${ref.book} ${ref.chapter}${ref.verseStart ? `:${ref.verseStart}` : ""}${ref.verseEnd ? `–${ref.verseEnd}` : ""}`
                  : selectedBook.name;

                return (
                  <Link
                    key={note.id}
                    href={`/app/notes/${note.id}`}
                    className="block rounded-xl border border-border bg-card p-4 hover:border-gold/40 hover:shadow-xs transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs text-gold font-medium shrink-0">
                        <BookOpen size={10} />
                        {refLabel}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-gold transition-colors mb-1 truncate">
                      {note.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                    {note.location && (
                      <p className="text-xs text-muted-foreground/70 mt-2 flex items-center gap-1">
                        <MapPin size={10} />
                        {note.location}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Visão Principal (Catálogo ou Busca) ─────────────────────────
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Título e Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Bíblia & Referências
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Explore os livros bíblicos, encontre versículos e visualize suas notas associadas.
          </p>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary rounded-xl border border-border self-start sm:self-auto">
          <button
            onClick={() => setTab("catalog")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === "catalog"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Catálogo de Livros
          </button>
          <button
            onClick={() => setTab("search")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              tab === "search"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search size={12} />
            Buscar Versículos
          </button>
        </div>
      </div>

      {/* ─── ABA 1: Catálogo de Livros ────────────────────────────── */}
      {tab === "catalog" && (
        <>
          {loadingBooks ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={32} className="text-gold animate-spin" />
              <p className="text-sm text-muted-foreground">
                Carregando catálogo de livros da Bíblia...
              </p>
            </div>
          ) : booksError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertCircle size={28} className="text-destructive" />
              <p className="text-sm text-muted-foreground">{booksError}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-gold hover:underline mt-1"
              >
                Recarregar página
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Antigo Testamento */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    Antigo Testamento ({atBooks.length} livros)
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {atBooks.map((book) => {
                    const count = getNoteCount(book.name);
                    return (
                      <div key={book.id} className="relative">
                        {count > 0 && (
                          <span className="absolute -top-2 -right-2 z-10 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-gold text-primary-foreground text-[10px] font-bold shadow-xs pointer-events-none">
                            {count}
                          </span>
                        )}
                        <button
                          title={`${book.name} (${book.chapters || ""} capítulos)`}
                          onClick={() => setSelectedBook(book)}
                          className={`w-full h-11 rounded-xl border px-3 flex flex-col items-center justify-center text-center transition-all ${
                            count > 0
                              ? "border-gold/40 bg-gold/10 text-foreground font-semibold hover:border-gold hover:bg-gold/15"
                              : "border-border text-foreground hover:border-gold/40 hover:bg-card hover:shadow-xs"
                          }`}
                        >
                          <span className="text-xs sm:text-sm truncate w-full leading-tight font-medium">
                            {book.name}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Novo Testamento */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    Novo Testamento ({ntBooks.length} livros)
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {ntBooks.map((book) => {
                    const count = getNoteCount(book.name);
                    return (
                      <div key={book.id} className="relative">
                        {count > 0 && (
                          <span className="absolute -top-2 -right-2 z-10 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-gold text-primary-foreground text-[10px] font-bold shadow-xs pointer-events-none">
                            {count}
                          </span>
                        )}
                        <button
                          title={`${book.name} (${book.chapters || ""} capítulos)`}
                          onClick={() => setSelectedBook(book)}
                          className={`w-full h-11 rounded-xl border px-3 flex flex-col items-center justify-center text-center transition-all ${
                            count > 0
                              ? "border-gold/40 bg-gold/10 text-foreground font-semibold hover:border-gold hover:bg-gold/15"
                              : "border-border text-foreground hover:border-gold/40 hover:bg-card hover:shadow-xs"
                          }`}
                        >
                          <span className="text-xs sm:text-sm truncate w-full leading-tight font-medium">
                            {book.name}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </>
      )}

      {/* ─── ABA 2: Busca Textual de Versículos ───────────────────── */}
      {tab === "search" && (
        <div className="space-y-6">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs"
          >
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Search size={18} className="text-gold" />
              Pesquisar Passagens e Versículos
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                  placeholder="Digite palavras-chave (ex: amor, fé, esperança, salvação)..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <select
                value={searchTranslation}
                onChange={(e) => setSearchTranslation(e.target.value)}
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {translations.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.code} — {t.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="h-11 px-6 rounded-xl bg-gold text-primary-foreground text-sm font-semibold hover:bg-gold-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
              >
                {searching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Buscar
              </button>
            </div>
          </form>

          {/* Resultados da Busca */}
          {searching && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={30} className="text-gold animate-spin" />
              <p className="text-sm text-muted-foreground">
                Pesquisando versículos com &ldquo;{searchQuery}&rdquo;...
              </p>
            </div>
          )}

          {!searching && searched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {searchResults.length} versículo{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
                </span>
                <span>Versão: {searchTranslation}</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
                  Nenhum versículo encontrado para &ldquo;{searchQuery}&rdquo; na tradução selecionada.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((item, index) => {
                    const ref = item.reference || `${item.book} ${item.chapter}:${item.verse}`;
                    const isCopied = copiedVerseRef === ref;

                    return (
                      <div
                        key={`${ref}-${index}`}
                        className="rounded-xl border border-border bg-card p-4 hover:border-gold/40 transition-colors space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
                            <BookOpen size={11} />
                            {ref}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Copiar */}
                            <button
                              onClick={() => handleCopyVerse(item)}
                              title="Copiar versículo"
                              className="h-8 px-2.5 rounded-lg border border-border hover:bg-secondary text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                              {isCopied ? (
                                <>
                                  <Check size={12} className="text-green-600" />
                                  <span>Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>

                            {/* Criar Nota */}
                            <Link
                              href={`/app/notes/new?book=${encodeURIComponent(item.book || "")}&chapter=${item.chapter || 1}&verseStart=${item.verse || 1}&content=${encodeURIComponent(item.text)}`}
                              title="Criar nota sobre este versículo"
                              className="h-8 px-2.5 rounded-lg border border-border hover:bg-secondary text-xs text-muted-foreground hover:text-gold flex items-center gap-1 transition-colors"
                            >
                              <PenLine size={12} />
                              <span>Nota</span>
                            </Link>

                            {/* Ler no contexto */}
                            {item.bookId && item.chapter && (
                              <Link
                                href={`/app/reader?book=${encodeURIComponent(item.bookId)}&chapter=${item.chapter}&tr=${searchTranslation}`}
                                title="Abrir capítulo no leitor"
                                className="h-8 px-2.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-medium flex items-center gap-1 transition-colors"
                              >
                                <ExternalLink size={12} />
                                <span>Ler</span>
                              </Link>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-foreground/90 leading-relaxed italic">
                          &ldquo;{item.text}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
