"use client";

import { useState, useEffect, useCallback, useRef, Suspense, useMemo } from "react";
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
  Copy,
  Check,
  PenLine,
  Search,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "@/store/app-store";
import {
  bibleApi,
  notesApi,
  parseNoteResponse,
  type BibleTranslationDTO,
  type BibleBookDTO,
  type BibleVerseDTO,
  type ThemeResponseDTO,
  ApiError,
} from "@/lib/api";
import type { Note } from "@/lib/mock-data";

// ─── Modal de Criação Rápida de Nota ──────────────────────────────
interface QuickNoteModalProps {
  book: BibleBookDTO;
  chapter: number;
  verse: BibleVerseDTO;
  translation: string;
  onClose: () => void;
  onSuccess: (newNote: Note) => void;
}

function QuickNoteModal({
  book,
  chapter,
  verse,
  translation,
  onClose,
  onSuccess,
}: QuickNoteModalProps) {
  const router = useRouter();
  const token = useAppStore((s) => s.token);
  const themes = useAppStore((s) => s.themes);

  const reference = `${book.name} ${chapter}:${verse.verse}`;
  const [title, setTitle] = useState(`Reflexão: ${reference}`);
  const [content, setContent] = useState(`"${verse.text}"\n\n`);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleTheme(id: string) {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Informe um título para a nota.");
      return;
    }
    if (!token) {
      setError("Você precisa estar autenticado para criar uma nota.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const dto = await notesApi.createRaw(
        {
          title: title.trim(),
          content: content.trim(),
          biblicalReferences: [reference],
          themeIds: selectedThemes,
        },
        token
      );

      const parsed = parseNoteResponse(dto);
      onSuccess(parsed);
      toast.success("Nota rápida salva com sucesso!");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Não foi possível salvar a nota.");
    } finally {
      setSaving(false);
    }
  }

  function handleOpenFullEditor() {
    const params = new URLSearchParams({
      book: book.name,
      chapter: String(chapter),
      verseStart: String(verse.verse),
      title: title.trim(),
      content: verse.text,
    });
    router.push(`/app/notes/new?${params.toString()}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                <PenLine size={16} />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Criar Nota Rápida
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Referenciando{" "}
              <span className="font-semibold text-gold">{reference}</span> ({translation})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Versículo citado em destaque */}
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-3.5 text-xs text-foreground/90 leading-relaxed italic">
          &ldquo;{verse.text}&rdquo;
        </div>

        {/* Formulário */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Sua Reflexão / Esboço
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Escreva seus pensamentos, contexto ou aplicação pastoral..."
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Seleção de Temas */}
          {themes.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Vincular Temas
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-0.5">
                {themes.map((t) => {
                  const active = selectedThemes.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTheme(t.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors border ${
                        active
                          ? "bg-gold text-primary-foreground border-gold font-medium"
                          : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
                      }`}
                    >
                      {active && <Check size={10} />}
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-2.5">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleOpenFullEditor}
              className="text-xs text-gold hover:text-gold-dark hover:underline flex items-center gap-1"
            >
              <Sparkles size={12} />
              Abrir no editor completo
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="h-9 px-4 rounded-xl bg-gold text-primary-foreground text-xs font-medium hover:bg-gold-dark transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                Salvar Nota
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Popover de Notas Vinculadas a um Versículo ───────────────────
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
      className="absolute z-50 left-0 top-6 w-72 rounded-xl border border-border bg-card shadow-2xl p-0 overflow-hidden animate-fade-in"
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

// ─── Helpers de Filtragem de Notas por Versículo ──────────────────
function getNotesForVerse(
  notes: Note[],
  bookName: string,
  chapter: number,
  verse: number
): Note[] {
  return notes.filter((n) =>
    n.bibleRefs.some((r) => {
      if (r.book.toLowerCase() !== bookName.toLowerCase() || r.chapter !== chapter) {
        return false;
      }
      if (r.verseStart === undefined) return true;
      const end = r.verseEnd ?? r.verseStart;
      return verse >= r.verseStart && verse <= end;
    })
  );
}

// ─── Grade de Livros para Seleção Inicial ─────────────────────────
interface BookGridProps {
  translation: string;
  translations: BibleTranslationDTO[];
  books: BibleBookDTO[];
  loadingBooks: boolean;
  onTranslationChange: (t: string) => void;
  onSelect: (bookId: number | string) => void;
}

function BookGrid({
  translation,
  translations,
  books,
  loadingBooks,
  onTranslationChange,
  onSelect,
}: BookGridProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return books;
    const term = searchTerm.toLowerCase();
    return books.filter((b) => b.name.toLowerCase().includes(term));
  }, [books, searchTerm]);

  const atBooks = filteredBooks.filter(
    (b) =>
      b.testament === "AT" ||
      b.testament === "OLD" ||
      b.testament.toLowerCase().includes("antigo")
  );

  const ntBooks = filteredBooks.filter(
    (b) =>
      b.testament === "NT" ||
      b.testament === "NEW" ||
      b.testament.toLowerCase().includes("novo")
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="text-gold" size={26} />
            Leitor Bíblico
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione uma tradução e um livro para iniciar a leitura e vinculação de sermões.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-medium text-muted-foreground shrink-0">
            Versão:
          </label>
          <select
            value={translation}
            onChange={(e) => onTranslationChange(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {translations.map((t) => (
              <option key={t.code} value={t.code}>
                {t.code} — {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Busca rápida de livros */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar livro bíblico (ex: Gênesis, Salmos, Romanos)..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loadingBooks ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={30} className="text-gold animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando catálogo bíblico...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {atBooks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold" />
                Antigo Testamento ({atBooks.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {atBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => onSelect(book.id)}
                    className="rounded-xl border border-border bg-card p-3 text-left hover:border-gold/50 hover:bg-gold/5 transition-all group"
                  >
                    <p className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors truncate">
                      {book.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {book.chapters ? `${book.chapters} cap.` : "Livro"}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {ntBooks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold" />
                Novo Testamento ({ntBooks.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {ntBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => onSelect(book.id)}
                    className="rounded-xl border border-border bg-card p-3 text-left hover:border-gold/50 hover:bg-gold/5 transition-all group"
                  >
                    <p className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors truncate">
                      {book.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {book.chapters ? `${book.chapters} cap.` : "Livro"}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {atBooks.length === 0 && ntBooks.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
              Nenhum livro encontrado para &ldquo;{searchTerm}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Leitor de Capítulos com Ações nos Versículos ──────────────────
interface ChapterReaderProps {
  bookId: number | string;
  chapter: number;
  translation: string;
  translations: BibleTranslationDTO[];
  books: BibleBookDTO[];
  onBack: () => void;
  onNavigate: (bookId: number | string, chapter: number) => void;
  onTranslationChange: (t: string) => void;
}

function ChapterReader({
  bookId,
  chapter,
  translation,
  translations,
  books,
  onBack,
  onNavigate,
  onTranslationChange,
}: ChapterReaderProps) {
  const { notes, addNote } = useAppStore();
  const [verses, setVerses] = useState<BibleVerseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de ações no versículo
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [activePopoverVerse, setActivePopoverVerse] = useState<number | null>(null);
  const [quickNoteVerse, setQuickNoteVerse] = useState<BibleVerseDTO | null>(null);

  const currentBook = useMemo(() => {
    return books.find((b) => String(b.id) === String(bookId)) || books[0];
  }, [books, bookId]);

  const totalChapters = currentBook?.chapters || 1;

  // Carrega capítulo da API
  const loadChapter = useCallback(() => {
    if (!currentBook) return;
    setLoading(true);
    setError(null);
    setVerses([]);

    bibleApi
      .getChapter(translation, currentBook.id, chapter)
      .then((data) => {
        if (!data.verses || data.verses.length === 0) {
          throw new Error("Nenhum versículo encontrado para este capítulo.");
        }
        setVerses(data.verses);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : err?.message || "Falha ao carregar o capítulo da Bíblia."
        );
      })
      .finally(() => setLoading(false));
  }, [translation, currentBook, chapter]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  // Navegação anterior / próximo
  function prevChapter() {
    if (chapter > 1) {
      onNavigate(currentBook.id, chapter - 1);
    } else {
      const idx = books.findIndex((b) => String(b.id) === String(currentBook.id));
      if (idx > 0) {
        const prevB = books[idx - 1];
        onNavigate(prevB.id, prevB.chapters || 1);
      }
    }
  }

  function nextChapter() {
    if (chapter < totalChapters) {
      onNavigate(currentBook.id, chapter + 1);
    } else {
      const idx = books.findIndex((b) => String(b.id) === String(currentBook.id));
      if (idx < books.length - 1) {
        const nextB = books[idx + 1];
        onNavigate(nextB.id, 1);
      }
    }
  }

  // Copiar versículo
  async function handleCopyVerse(v: BibleVerseDTO) {
    const textToCopy = `"${v.text}" — ${currentBook.name} ${chapter}:${v.verse} (${translation})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedVerse(v.verse);
      toast.success(`Versículo ${v.verse} copiado!`);
      setTimeout(() => setCopiedVerse(null), 2500);
    } catch {
      toast.error("Não foi possível copiar para a área de transferência.");
    }
  }

  // Notas vinculadas a este capítulo
  const chapterNotes = notes.filter((n) =>
    n.bibleRefs.some(
      (r) =>
        r.book.toLowerCase() === currentBook?.name.toLowerCase() &&
        r.chapter === chapter
    )
  );

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* Modal de Nota Rápida */}
      {quickNoteVerse && currentBook && (
        <QuickNoteModal
          book={currentBook}
          chapter={chapter}
          verse={quickNoteVerse}
          translation={translation}
          onClose={() => setQuickNoteVerse(null)}
          onSuccess={(note) => addNote(note)}
        />
      )}

      {/* Barra de Controles e Seletores Dinâmicos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          >
            <ChevronLeft size={14} />
            Livros
          </button>

          {/* Seletor Dinâmico de Livro */}
          <select
            value={String(currentBook?.id ?? "")}
            onChange={(e) => onNavigate(e.target.value, 1)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium"
          >
            {books.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Seletor Dinâmico de Capítulo */}
          <select
            value={chapter}
            onChange={(e) => onNavigate(currentBook.id, parseInt(e.target.value))}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium"
          >
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((c) => (
              <option key={c} value={c}>
                Capítulo {c}
              </option>
            ))}
          </select>

          {/* Seletor Dinâmico de Tradução */}
          <select
            value={translation}
            onChange={(e) => onTranslationChange(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {translations.map((t) => (
              <option key={t.code} value={t.code}>
                {t.code}
              </option>
            ))}
          </select>
        </div>

        {chapterNotes.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold font-medium self-start sm:self-auto">
            <FileText size={12} />
            {chapterNotes.length} nota{chapterNotes.length !== 1 ? "s" : ""} neste capítulo
          </span>
        )}
      </div>

      {/* Barra de Navegação Rápida entre Capítulos */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={prevChapter}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={15} />
          Anterior
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center">
          {currentBook?.name} {chapter}
        </h1>

        <button
          onClick={nextChapter}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          Próximo
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Caixa do Texto Bíblico */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-9 min-h-64 shadow-xs">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={30} className="text-gold animate-spin" />
            <p className="text-sm text-muted-foreground">
              Carregando {currentBook?.name} {chapter} ({translation})...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <AlertCircle size={28} className="text-destructive" />
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            <button
              onClick={loadChapter}
              className="mt-2 text-xs font-semibold text-gold hover:text-gold-dark hover:underline"
            >
              Tentar carregar novamente
            </button>
          </div>
        )}

        {!loading && !error && verses.length > 0 && (
          <div className="space-y-4 text-base sm:text-lg text-foreground leading-[2.3] tracking-normal font-normal">
            {verses.map((v) => {
              const verseNotes = getNotesForVerse(
                notes,
                currentBook.name,
                chapter,
                v.verse
              );
              const hasNotes = verseNotes.length > 0;
              const isCopied = copiedVerse === v.verse;
              const isPopoverOpen = activePopoverVerse === v.verse;

              return (
                <div
                  key={v.verse}
                  className={`group relative rounded-xl px-3 py-2 transition-colors ${
                    hasNotes
                      ? "bg-gold/10 border border-gold/25"
                      : "hover:bg-secondary/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1">
                      <sup className="text-gold text-xs font-bold mr-1.5 select-none">
                        {v.verse}
                      </sup>
                      {v.text}
                    </p>

                    {/* Botões de Ação do Versículo */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {/* Botão Copiar */}
                      <button
                        onClick={() => handleCopyVerse(v)}
                        title="Copiar versículo"
                        className="w-7 h-7 rounded-lg border border-border bg-background/80 hover:bg-secondary hover:text-gold text-muted-foreground flex items-center justify-center transition-colors"
                      >
                        {isCopied ? (
                          <Check size={12} className="text-green-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>

                      {/* Botão Criar Nota Rápida */}
                      <button
                        onClick={() => setQuickNoteVerse(v)}
                        title="Criar nota referenciando este versículo"
                        className="w-7 h-7 rounded-lg border border-border bg-background/80 hover:bg-secondary hover:text-gold text-muted-foreground flex items-center justify-center transition-colors"
                      >
                        <PenLine size={12} />
                      </button>

                      {/* Botão Ver Notas Existentes */}
                      {hasNotes && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActivePopoverVerse(
                                isPopoverOpen ? null : v.verse
                              )
                            }
                            title={`${verseNotes.length} nota(s) vinculada(s)`}
                            className="w-7 h-7 rounded-lg bg-gold/20 text-gold border border-gold/40 flex items-center justify-center hover:bg-gold/30 transition-colors"
                          >
                            <FileText size={12} />
                          </button>
                          {isPopoverOpen && (
                            <NotePopover
                              notes={verseNotes}
                              onClose={() => setActivePopoverVerse(null)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navegação Inferior */}
      {!loading && !error && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={prevChapter}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronLeft size={16} />
            Capítulo anterior
          </button>
          <button
            onClick={nextChapter}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Próximo capítulo
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Página Raiz do Leitor com Leitura de Query Params ─────────────
function ReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [translations, setTranslations] = useState<BibleTranslationDTO[]>([]);
  const [books, setBooks] = useState<BibleBookDTO[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Parâmetros da URL
  const paramTr = (searchParams.get("tr") || "ACF11").toUpperCase();
  const [translation, setTranslation] = useState(paramTr);

  const paramBook = searchParams.get("book");
  const [bookId, setBookId] = useState<string | number | null>(
    paramBook ? (isNaN(Number(paramBook)) ? paramBook : Number(paramBook)) : null
  );

  const [chapter, setChapter] = useState(
    parseInt(searchParams.get("chapter") || "1")
  );

  // Carrega Traduções e Livros da API
  useEffect(() => {
    Promise.all([
      bibleApi.getTranslations(),
      bibleApi.getBooks(),
    ])
      .then(([trList, bookList]) => {
        setTranslations(trList);
        setBooks(bookList);
      })
      .catch(() => {
        // Fallbacks resilientes
      })
      .finally(() => {
        setLoadingBooks(false);
      });
  }, []);

  // Atualiza URL mantendo histórico limpo
  function updateUrl(bid: string | number | null, ch: number, tr: string) {
    if (bid === null) {
      router.replace(`/app/reader?tr=${encodeURIComponent(tr)}`, { scroll: false });
    } else {
      router.replace(
        `/app/reader?book=${encodeURIComponent(bid)}&chapter=${ch}&tr=${encodeURIComponent(tr)}`,
        { scroll: false }
      );
    }
  }

  function handleSelectBook(id: string | number) {
    setBookId(id);
    setChapter(1);
    updateUrl(id, 1, translation);
  }

  function handleNavigate(bid: string | number, ch: number) {
    setBookId(bid);
    setChapter(ch);
    updateUrl(bid, ch, translation);
  }

  function handleBack() {
    setBookId(null);
    setChapter(1);
    updateUrl(null, 1, translation);
  }

  function handleTranslationChange(t: string) {
    setTranslation(t);
    updateUrl(bookId, chapter, t);
  }

  if (bookId === null) {
    return (
      <BookGrid
        translation={translation}
        translations={translations}
        books={books}
        loadingBooks={loadingBooks}
        onTranslationChange={handleTranslationChange}
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
      books={books}
      onBack={handleBack}
      onNavigate={handleNavigate}
      onTranslationChange={handleTranslationChange}
    />
  );
}

export default function ReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 size={30} className="text-gold animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando leitor bíblico...</p>
        </div>
      }
    >
      <ReaderContent />
    </Suspense>
  );
}
