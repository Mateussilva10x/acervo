"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Check, Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { THEMES } from "@/lib/mock-data";
import type { Note } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { notes, updateNote } = useAppStore();
  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [location, setLocation] = useState(note?.location ?? "");
  const [selectedThemes, setSelectedThemes] = useState<string[]>(
    note?.themes ?? [],
  );
  const [newTheme, setNewTheme] = useState("");
  const [bibleBook, setBibleBook] = useState(note?.bibleRefs[0]?.book ?? "");
  const [bibleChapter, setBibleChapter] = useState(
    note?.bibleRefs[0]?.chapter?.toString() ?? "",
  );
  const [bibleVerseStart, setBibleVerseStart] = useState(
    note?.bibleRefs[0]?.verseStart?.toString() ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">Nota não encontrada.</p>
        <Link
          href="/app/notes"
          className="text-sm text-gold hover:text-gold-dark transition-colors"
        >
          ← Voltar para notas
        </Link>
      </div>
    );
  }

  function toggleTheme(theme: string) {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
    );
  }

  function handleAddTheme() {
    const t = newTheme.trim();
    if (t && !selectedThemes.includes(t)) {
      setSelectedThemes((prev) => [...prev, t]);
      setNewTheme("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const patch: Partial<Note> = {
      title: title.trim(),
      content: content.trim(),
      themes: selectedThemes,
      location: location.trim() || undefined,
      bibleRefs: bibleBook
        ? [
            {
              book: bibleBook,
              chapter: parseInt(bibleChapter) || 1,
              verseStart: bibleVerseStart
                ? parseInt(bibleVerseStart)
                : undefined,
            },
          ]
        : [],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    updateNote(id, patch);

    setSaved(true);
    setSaving(false);
    setTimeout(() => router.push(`/app/notes/${id}`), 800);
  }

  return (
    <div className="w-full max-w-3xl space-y-6 animate-fade-in">
      <Link
        href={`/app/notes/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <h1 className=" text-3xl font-bold text-foreground">Editar Nota</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Título da nota..."
              className="w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Conteúdo
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva aqui sua ideia, ilustração ou reflexão..."
              rows={8}
              className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Local</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Igreja Batista Central"
              className="w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          {/* Themes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Temas</label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => toggleTheme(theme)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                    selectedThemes.includes(theme)
                      ? "bg-gold/20 border-gold/40 text-gold"
                      : "border-border text-muted-foreground hover:border-gold/40 hover:text-gold",
                  )}
                >
                  {selectedThemes.includes(theme) && <Check size={10} />}
                  {theme}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTheme())
                }
                placeholder="Adicionar tema personalizado"
                className="flex-1 rounded-xl border border-input bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTheme}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors"
              >
                <Plus size={14} className="text-foreground" />
              </button>
            </div>
          </div>

          {/* Bible Refs */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <BookOpen size={14} className="text-muted-foreground" />
              Referências Bíblicas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={bibleBook}
                onChange={(e) => setBibleBook(e.target.value)}
                placeholder="Livro"
                className="col-span-2 rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
              <input
                type="number"
                value={bibleChapter}
                onChange={(e) => setBibleChapter(e.target.value)}
                placeholder="Cap."
                className="rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
              <input
                type="text"
                value={bibleVerseStart}
                onChange={(e) => setBibleVerseStart(e.target.value)}
                placeholder="v. ini"
                className="rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-6 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || saved || !title.trim()}
            className="h-10 px-6 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check size={14} />
                Salvo!
              </>
            ) : saving ? (
              "Salvando..."
            ) : (
              "Salvar alterações"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
