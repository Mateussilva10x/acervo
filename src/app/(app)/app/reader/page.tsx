"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Loader2,
  BookOpen,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { BIBLE_BOOKS, findBookById } from "@/lib/bible-books";
import { bibleApi, ApiError } from "@/lib/api";
import type { Note } from "@/lib/mock-data";

interface Verse {
  verse: number;
  text: string;
}

interface Translation {
  short_name: string;
  full_name: string;
}

const AT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === "AT");
const NT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === "NT");

// ─── Book Grid ────────────────────────────────────────────────────
function BookGrid({
  translation,
  onTranslationChange,
  translations,
  onSelect,
}: {
  translation: string;
  onTranslationChange: (t: string) => void;
  translations: Translation[];
  onSelect: (bookId: number) => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className=" text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <BookOpen className="text-gold" size={26} />
          Ler a Bíblia
        </h1>
        <select
          value={translation}
          onChange={(e) => onTranslationChange(e.target.value)}
          className="h-9 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {translations.map((t) => (
            <option key={t.short_name} value={t.short_name}>
              {t.short_name.toUpperCase()} — {t.full_name}
            </option>
          ))}
        </select>
      </div>

      {[
        { label: "Antigo Testamento", books: AT_BOOKS },
        { label: "Novo Testamento", books: NT_BOOKS },
      ].map(({ label, books }) => (
        <section key={label}>
          <h2 className=" text-xl font-semibold text-foreground mb-4">
            {label}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => onSelect(book.id)}
                className="rounded-xl border border-border bg-card px-3 py-3 text-left hover:border-gold/40 hover:bg-gold/5 transition-colors group"
              >
                <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors truncate">
                  {book.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {book.chapters} cap.
                </p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function getNotesForVerse(
  notes: Note[],
  bookName: string,
  chapter: number,
  verse: number,
): Note[] {
  return notes.filter((n) =>
    n.bibleRefs.some((r) => {
      if (r.book !== bookName || r.chapter !== chapter) return false;
      if (r.verseStart === undefined) return true;
      const end = r.verseEnd ?? r.verseStart;
      return verse >= r.verseStart && verse <= end;
    }),
  );
}

// ─── Note Popover ─────────────────────────────────────────────────
function NotePopover({
  notes,
  onClose,
}: {
  notes: Note[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 left-0 top-6 w-72 rounded-xl border border-border bg-card shadow-xl p-0 overflow-hidden"
      style={{ minWidth: 260 }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/40">
        <span className="text-xs font-semibold text-gold uppercase tracking-wide flex items-center gap-1.5">
          <FileText size={11} />
          {notes.length} nota{notes.length !== 1 ? "s" : ""} vinculada{notes.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={13} />
        </button>
      </div>
      <div className="divide-y divide-border max-h-64 overflow-y-auto">
        {notes.map((n) => (
          <Link
            key={n.id}
            href={`/app/notes/${n.id}`}
            onClick={onClose}
            className="block px-4 py-3 hover:bg-secondary/50 transition-colors group"
          >
            <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-1">
              {n.title}
            </p>
            {n.content && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                {n.content}
              </p>
            )}
            <span className="text-xs text-gold mt-1 inline-block">
              Ver nota →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Verse Note Button ────────────────────────────────────────────
function VerseNoteButton({ notes }: { notes: Note[] }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle ml-1">
      <button
        onClick={() => setOpen((v) => !v)}
        title={`${notes.length} nota${notes.length !== 1 ? "s" : ""} vinculada${notes.length !== 1 ? "s" : ""}`}
        className="inline-flex items-center justify-center text-gold hover:text-gold-dark transition-colors"
      >
        <FileText size={12} />
      </button>
      {open && <NotePopover notes={notes} onClose={() => setOpen(false)} />}
    </span>
  );
}

// ─── Chapter Reader ───────────────────────────────────────────────
function ChapterReader({
  bookId,
  chapter,
  translation,
  translations,
  onBack,
  onNavigate,
  onTranslationChange,
}: {
  bookId: number;
  chapter: number;
  translation: string;
  translations: Translation[];
  onBack: () => void;
  onNavigate: (bookId: number, chapter: number) => void;
  onTranslationChange: (t: string) => void;
}) {
  const { notes } = useAppStore();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentBook = findBookById(bookId)!;
  const isFirst = bookId === 1 && chapter === 1;
  const isLast = bookId === 66 && chapter === currentBook.chapters;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setVerses([]);
    bibleApi.getChapter(currentBook.name, chapter, translation)
      .then((data) => {
        if (data.verses.length === 0)
          throw new Error("Capítulo não encontrado nesta tradução.");
        setVerses(data.verses);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : (e as Error).message))
      .finally(() => setLoading(false));
  }, [bookId, chapter, translation, currentBook.name]);

  useEffect(() => {
    load();
  }, [load]);

  function prev() {
    if (chapter > 1) onNavigate(bookId, chapter - 1);
    else {
      const p = findBookById(bookId - 1);
      if (p) onNavigate(p.id, p.chapters);
    }
  }

  function next() {
    if (chapter < currentBook.chapters) onNavigate(bookId, chapter + 1);
    else {
      const n = findBookById(bookId + 1);
      if (n) onNavigate(n.id, 1);
    }
  }

  // Notes for this chapter (badge + per-verse icons)
  const chapterNotes = notes.filter((n) =>
    n.bibleRefs.some(
      (r) => r.book === currentBook.name && r.chapter === chapter,
    ),
  );

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* ── Controls bar (mobile-first) ───────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Row 1 (mobile): Voltar + book + chapter selects */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          >
            <ChevronLeft size={15} />
            Voltar
          </button>

          <select
            value={bookId}
            onChange={(e) => onNavigate(parseInt(e.target.value), 1)}
            className="flex-1 min-w-[110px] h-9 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <optgroup label="Antigo Testamento">
              {AT_BOOKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Novo Testamento">
              {NT_BOOKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          </select>

          <select
            value={chapter}
            onChange={(e) => onNavigate(bookId, parseInt(e.target.value))}
            className="h-9 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(
              (c) => (
                <option key={c} value={c}>
                  Cap. {c}
                </option>
              ),
            )}
          </select>

          <select
            value={translation}
            onChange={(e) => onTranslationChange(e.target.value)}
            className="h-9 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {translations.map((t) => (
              <option key={t.short_name} value={t.short_name}>
                {t.short_name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Badge notas – fica no canto direito em desktop, linha separada mobile */}
        {chapterNotes.length > 0 && (
          <span className="self-start sm:ml-auto inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold font-medium">
            <FileText size={12} />
            {chapterNotes.length} nota{chapterNotes.length !== 1 ? "s" : ""}{" "}
            vinculada{chapterNotes.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Navigation row: Anterior | Título | Próximo ───── */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={prev}
          disabled={isFirst}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <h1 className="text-lg sm:text-2xl font-bold text-foreground text-center flex-1">
          {currentBook.name} {chapter}
        </h1>

        <button
          onClick={next}
          disabled={isLast}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* ── Verse card ────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-7 min-h-48">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={26} className="text-gold animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <AlertCircle size={26} className="text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={load}
              className="text-xs text-gold hover:text-gold-dark transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && verses.length > 0 && (
          <div className="text-sm sm:text-base text-foreground leading-[2.4] tracking-wide">
            {verses.map((v) => {
              const verseNotes = getNotesForVerse(
                notes,
                currentBook.name,
                chapter,
                v.verse,
              );
              const hasNotes = verseNotes.length > 0;
              return (
                <span
                  key={v.verse}
                  className={
                    hasNotes
                      ? "inline rounded px-0.5 py-px"
                      : undefined
                  }
                  style={
                    hasNotes
                      ? {
                          backgroundColor: "rgba(194,163,112,0.15)",
                          boxShadow: "0 0 0 1.5px rgba(194,163,112,0.35)",
                        }
                      : undefined
                  }
                >
                  <sup className="text-gold text-[10px] font-bold mr-0.5 select-none">
                    {v.verse}
                  </sup>
                  {v.text.trim()}
                  {hasNotes && <VerseNoteButton notes={verseNotes} />}{" "}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom nav ────────────────────────────────────── */}
      {!loading && !error && (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={prev}
            disabled={isFirst}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} />
            Anterior
          </button>
          <button
            onClick={next}
            disabled={isLast}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próximo
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page Root ────────────────────────────────────────────────────
function ReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [translations, setTranslations] = useState<Translation[]>([]);
  const [translation, setTranslation] = useState(
    searchParams.get("tr") || "almeida",
  );
  const paramBook = searchParams.get("book");
  const [bookId, setBookId] = useState<number | null>(
    paramBook ? parseInt(paramBook) : null,
  );
  const [chapter, setChapter] = useState(
    parseInt(searchParams.get("chapter") || "1"),
  );

  useEffect(() => {
    fetch("/api/bible/translations")
      .then((r) => r.json())
      .then(setTranslations)
      .catch(() => {
        setTranslations([
          { short_name: "almeida", full_name: "João Ferreira de Almeida (PT)" },
          { short_name: "web", full_name: "World English Bible" },
          { short_name: "kjv", full_name: "King James Version" },
        ]);
      });
  }, []);

  function pushUrl(bid: number | null, ch: number, tr: string) {
    if (bid === null) router.replace(`/app/reader?tr=${tr}`, { scroll: false });
    else
      router.replace(`/app/reader?book=${bid}&chapter=${ch}&tr=${tr}`, {
        scroll: false,
      });
  }

  function handleSelectBook(id: number) {
    setBookId(id);
    setChapter(1);
    pushUrl(id, 1, translation);
  }

  function handleNavigate(bid: number, ch: number) {
    setBookId(bid);
    setChapter(ch);
    pushUrl(bid, ch, translation);
  }

  function handleBack() {
    setBookId(null);
    setChapter(1);
    pushUrl(null, 1, translation);
  }

  function handleTranslation(t: string) {
    setTranslation(t);
    pushUrl(bookId, chapter, t);
  }

  if (bookId === null) {
    return (
      <BookGrid
        translation={translation}
        onTranslationChange={handleTranslation}
        translations={translations}
        onSelect={handleSelectBook}
      />
    );
  }

  return (
    <ChapterReader
      bookId={bookId}
      chapter={chapter}
      translation={translation}
      translations={translations}
      onBack={handleBack}
      onNavigate={handleNavigate}
      onTranslationChange={handleTranslation}
    />
  );
}

export default function ReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 size={26} className="text-gold animate-spin" />
        </div>
      }
    >
      <ReaderContent />
    </Suspense>
  );
}
