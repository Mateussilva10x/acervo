"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, MapPin } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { Note } from "@/lib/mock-data";

const OT_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
  "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras",
  "Neemias", "Ester", "Jó", "Salmos", "Provérbios",
  "Eclesiastes", "Cânticos", "Isaías", "Jeremias", "Lamentações",
  "Ezequiel", "Daniel", "Oseias", "Joel", "Amós",
  "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque",
  "Sofonias", "Ageu", "Zacarias", "Malaquias",
];

const NT_BOOKS = [
  "Mateus", "Marcos", "Lucas", "João", "Atos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios",
  "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo",
  "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago",
  "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João",
  "Judas", "Apocalipse",
];

function BookGrid({
  title,
  books,
  getCount,
  onSelect,
}: {
  title: string;
  books: string[];
  getCount: (book: string) => number;
  onSelect: (book: string) => void;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2 gap-y-4 pt-2 pr-2">
        {books.map((book) => {
          const count = getCount(book);
          return (
            <div key={book} className="relative">
              {count > 0 && (
                <span className="absolute -top-2 -right-2 z-10 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-primary-foreground text-[10px] font-bold shadow-sm pointer-events-none">
                  {count}
                </span>
              )}
              <button
                title={book}
                onClick={() => onSelect(book)}
                className={`w-full h-10 rounded-xl border px-2 flex items-center justify-center text-center transition-colors ${
                  count > 0
                    ? "border-gold/40 bg-gold/10 text-foreground font-medium hover:border-gold/60 hover:bg-gold/20"
                    : "border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/50"
                }`}
              >
                <span className="text-xs sm:text-sm truncate w-full leading-tight">
                  {book}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BookDetail({
  book,
  notes,
  onBack,
}: {
  book: string;
  notes: Note[];
  onBack: () => void;
}) {
  const bookNotes = notes.filter((n) =>
    n.bibleRefs.some((r) => r.book === book)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          {book}
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold font-medium">
          <BookOpen size={11} />
          {bookNotes.length} nota{bookNotes.length !== 1 ? "s" : ""} vinculada{bookNotes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Notes */}
      {bookNotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <BookOpen size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma nota vinculada a {book}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookNotes.map((note) => {
            const ref = note.bibleRefs.find((r) => r.book === book);
            const refLabel = ref
              ? `${ref.book} ${ref.chapter}${ref.verseStart ? `:${ref.verseStart}` : ""}${ref.verseEnd ? `–${ref.verseEnd}` : ""}`
              : book;

            return (
              <Link
                key={note.id}
                href={`/app/notes/${note.id}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group"
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
                <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-gold transition-colors mb-1">
                  {note.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {note.content}
                </p>
                {note.location && (
                  <p className="text-xs text-muted-foreground/60 mt-2 flex items-center gap-1">
                    <MapPin size={10} />
                    {note.location}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BiblePage() {
  const { notes } = useAppStore();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  function getNoteCount(book: string) {
    return notes.filter((n) => n.bibleRefs.some((r) => r.book === book)).length;
  }

  if (selectedBook) {
    return (
      <BookDetail
        book={selectedBook}
        notes={notes}
        onBack={() => setSelectedBook(null)}
      />
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
        Referências Bíblicas
      </h1>

      <BookGrid
        title="Antigo Testamento"
        books={OT_BOOKS}
        getCount={getNoteCount}
        onSelect={setSelectedBook}
      />

      <BookGrid
        title="Novo Testamento"
        books={NT_BOOKS}
        getCount={getNoteCount}
        onSelect={setSelectedBook}
      />
    </div>
  );
}
