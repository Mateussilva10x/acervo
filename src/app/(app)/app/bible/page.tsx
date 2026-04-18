"use client";

import { BookOpen } from "lucide-react";
import { useAppStore } from "@/store/app-store";

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

export default function BiblePage() {
  const { notes } = useAppStore();

  function getNoteCount(book: string) {
    return notes.filter((n) =>
      n.bibleRefs.some((r) => r.book === book)
    ).length;
  }

  function BookButton({ book }: { book: string }) {
    const count = getNoteCount(book);
    return (
      <button
        className={`rounded-xl border px-3 py-2.5 text-sm text-center transition-colors ${
          count > 0
            ? "border-gold/40 bg-gold/10 text-foreground font-medium hover:border-gold/60"
            : "border-border text-muted-foreground hover:border-border/80"
        }`}
      >
        {book}
        {count > 0 && (
          <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gold text-primary-foreground text-[10px] font-bold">
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Referências Bíblicas
      </h1>

      {/* Old Testament */}
      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
          Antigo Testamento
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {OT_BOOKS.map((book) => (
            <BookButton key={book} book={book} />
          ))}
        </div>
      </section>

      {/* New Testament */}
      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
          Novo Testamento
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {NT_BOOKS.map((book) => (
            <BookButton key={book} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
