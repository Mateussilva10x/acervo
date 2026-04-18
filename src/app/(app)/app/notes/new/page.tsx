"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image, Mic, Plus, X, BookOpen, Check } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { THEMES, type Note } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "text" | "image" | "audio";

export default function NewNotePage() {
  const router = useRouter();
  const addNote = useAppStore((s) => s.addNote);

  const [tab, setTab] = useState<Tab>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [newTheme, setNewTheme] = useState("");
  const [bibleBook, setBibleBook] = useState("");
  const [bibleChapter, setBibleChapter] = useState("");
  const [bibleVerseStart, setBibleVerseStart] = useState("");
  const [bibleVerseEnd, setBibleVerseEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleTheme(theme: string) {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
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

    const note: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      themes: selectedThemes,
      location: location.trim() || undefined,
      bibleRefs: bibleBook
        ? [
            {
              book: bibleBook,
              chapter: parseInt(bibleChapter) || 1,
              verseStart: bibleVerseStart ? parseInt(bibleVerseStart) : undefined,
              verseEnd: bibleVerseEnd ? parseInt(bibleVerseEnd) : undefined,
            },
          ]
        : [],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    addNote(note);
    setSaved(true);
    setSaving(false);
    setTimeout(() => router.push("/app/notes"), 800);
  }

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "text", label: "Escrever Texto", icon: FileText },
    { id: "image", label: "Enviar Imagem", icon: Image },
    { id: "audio", label: "Enviar Áudio", icon: Mic },
  ];

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Nova Nota
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors",
              tab === id
                ? "bg-gold text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "text" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Escrever Texto
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Título</label>
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
              <label className="text-sm font-medium text-foreground">Conteúdo</label>
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
                        : "border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
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
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTheme())}
                  placeholder="Adicionar Tema"
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
                "Salvar Nota"
              )}
            </button>
          </div>
        </form>
      )}

      {tab === "image" && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <Image size={40} className="text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">
            Enviar foto de anotação
          </p>
          <p className="text-xs text-muted-foreground">
            A IA irá transcrever e categorizar automaticamente
          </p>
          <label className="inline-flex items-center gap-2 h-9 px-5 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors cursor-pointer">
            <Plus size={14} />
            Selecionar imagem
            <input type="file" accept="image/*" className="sr-only" />
          </label>
        </div>
      )}

      {tab === "audio" && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <Mic size={40} className="text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">
            Gravar ou enviar áudio
          </p>
          <p className="text-xs text-muted-foreground">
            A IA irá transcrever e extrair as referências bíblicas
          </p>
          <button className="inline-flex items-center gap-2 h-9 px-5 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors">
            <Mic size={14} />
            Iniciar gravação
          </button>
        </div>
      )}
    </div>
  );
}
