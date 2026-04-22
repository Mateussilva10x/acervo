"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileUp,
  Plus,
  X,
  BookOpen,
  Check,
  Upload,
  Loader2,
  Sparkles,
  AlertCircle,
  File,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { THEMES, type Note } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "text" | "pdf";

interface AiNoteResult {
  title?: string;
  content?: string;
  themes?: string[];
  bibleBook?: string | null;
  bibleChapter?: number | null;
  bibleVerseStart?: number | null;
  bibleVerseEnd?: number | null;
  location?: string | null;
}

export default function NewNotePage() {
  const router = useRouter();
  const addNote = useAppStore((s) => s.addNote);

  const [tab, setTab] = useState<Tab>("text");

  // ── Form fields ───────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [newTheme, setNewTheme] = useState("");
  const [bibleBook, setBibleBook] = useState("");
  const [bibleChapter, setBibleChapter] = useState("");
  const [bibleVerseStart, setBibleVerseStart] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── PDF states ────────────────────────────────────────────────
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── AI result helper ──────────────────────────────────────────
  function applyAiResult(result: AiNoteResult) {
    if (result.title) setTitle(result.title);
    if (result.content) setContent(result.content);
    if (result.themes?.length) setSelectedThemes(result.themes);
    if (result.bibleBook) setBibleBook(result.bibleBook);
    if (result.bibleChapter) setBibleChapter(String(result.bibleChapter));
    if (result.bibleVerseStart) setBibleVerseStart(String(result.bibleVerseStart));
    if (result.location) setLocation(result.location);
    setTab("text");
  }

  // ── PDF handlers ──────────────────────────────────────────────
  function handlePdfSelect(file: File) {
    if (file.type !== "application/pdf") {
      setPdfError("Selecione um arquivo PDF válido.");
      return;
    }
    if (file.size > 32 * 1024 * 1024) {
      setPdfError("O PDF é muito grande. Limite: 32 MB.");
      return;
    }
    setPdfFile(file);
    setPdfError("");
  }

  function handlePdfInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handlePdfSelect(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfSelect(file);
  }

  function clearPdf() {
    setPdfFile(null);
    setPdfError("");
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleTranscribePdf() {
    if (!pdfFile) return;
    setPdfProcessing(true);
    setPdfError("");
    try {
      const form = new FormData();
      form.append("pdf", pdfFile);
      const res = await fetch("/api/ai/transcribe-pdf", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      applyAiResult(data);
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "Falha ao processar PDF.",
      );
    } finally {
      setPdfProcessing(false);
    }
  }

  // ── Form handlers ─────────────────────────────────────────────
  function toggleTheme(theme: string) {
    setSelectedThemes((p) =>
      p.includes(theme) ? p.filter((t) => t !== theme) : [...p, theme],
    );
  }

  function handleAddTheme() {
    const t = newTheme.trim();
    if (t && !selectedThemes.includes(t)) {
      setSelectedThemes((p) => [...p, t]);
      setNewTheme("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

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
    { id: "pdf", label: "Importar PDF", icon: FileUp },
  ];

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-3xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground">Nova Nota</h1>

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
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── TEXT TAB ─────────────────────────────────────────── */}
      {tab === "text" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold text-foreground">
              Escrever Texto
            </h2>

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
                <><Check size={14} /> Salvo!</>
              ) : saving ? (
                "Salvando..."
              ) : (
                "Salvar Nota"
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── PDF TAB ──────────────────────────────────────────── */}
      {tab === "pdf" && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl border-2 border-dashed transition-colors",
              isDragging
                ? "border-gold bg-gold/5"
                : "border-border bg-card",
            )}
          >
            {!pdfFile ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center gap-5 p-12 text-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                  isDragging ? "bg-gold/10 text-gold" : "bg-secondary text-muted-foreground",
                )}>
                  <FileUp size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Arraste seu PDF aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Livros, artigos, esboços e manuscritos — a IA organiza tudo como nota
                  </p>
                  <p className="text-xs text-muted-foreground">Limite: 32 MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors"
                >
                  <Upload size={15} />
                  Selecionar PDF
                </button>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfInputChange}
                  className="sr-only"
                />
              </div>
            ) : (
              /* File selected */
              <div className="p-6 space-y-5">
                {/* File info card */}
                <div className="flex items-center gap-4 rounded-xl bg-secondary/40 border border-border px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0 border border-gold/20">
                    <File size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {pdfFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(pdfFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={clearPdf}
                    disabled={pdfProcessing}
                    className="w-8 h-8 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Description */}
                <div className="rounded-xl bg-gold/5 border border-gold/20 px-4 py-3 flex items-start gap-3">
                  <Sparkles size={16} className="text-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A IA irá ler o PDF, identificar o tema principal, referências bíblicas e
                    organizar o conteúdo como uma nota estruturada para você revisar e salvar.
                  </p>
                </div>

                {/* Error */}
                {pdfError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">
                    <AlertCircle size={14} className="shrink-0" />
                    {pdfError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleTranscribePdf}
                    disabled={pdfProcessing}
                    className="w-full h-11 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {pdfProcessing ? (
                      <><Loader2 size={16} className="animate-spin" /> Analisando PDF...</>
                    ) : (
                      <><Sparkles size={16} /> Estruturar com IA</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={pdfProcessing}
                    className="w-full h-9 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Upload size={14} />
                    Escolher outro PDF
                  </button>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfInputChange}
                    className="sr-only"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
