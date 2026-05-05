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
  AlertCircle,
  File,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import {
  notesApi,
  themesApi,
  bibleRefToString,
  parseNoteResponse,
  type ThemeResponseDTO,
} from "@/lib/api";
import { PlanLimitModal } from "@/components/ui/plan-limit-modal";
import { cn } from "@/lib/utils";

type Tab = "text" | "pdf";

interface PdfImportResult {
  title?: string;
  content?: string;
}

export default function NewNotePage() {
  const router   = useRouter();
  const token    = useAppStore((s) => s.token);
  const addNote  = useAppStore((s) => s.addNote);
  const storeThemes  = useAppStore((s) => s.themes);
  const setStoreThemes = useAppStore((s) => s.setThemes);

  const [tab, setTab] = useState<Tab>("text");

  // ── Form fields ───────────────────────────────────────────────
  const [title,          setTitle]          = useState("");
  const [content,        setContent]        = useState("");
  const [location,       setLocation]       = useState("");
  const [bibleBook,      setBibleBook]      = useState("");
  const [bibleChapter,   setBibleChapter]   = useState("");
  const [bibleVerseStart,setBibleVerseStart]= useState("");
  const [bibleVerseEnd,  setBibleVerseEnd]  = useState("");
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [saveError,      setSaveError]      = useState("");
  const [planMessage,    setPlanMessage]    = useState<string | null>(null);

  // ── Seleção de temas ──────────────────────────────────────────
  // Trabalhamos com os objetos completos { id, name } do backend
  const [selectedThemes, setSelectedThemes] = useState<ThemeResponseDTO[]>([]);
  const [newThemeName,   setNewThemeName]   = useState("");
  const [creatingTheme,  setCreatingTheme]  = useState(false);

  // ── PDF states ────────────────────────────────────────────────
  const [pdfFile,       setPdfFile]       = useState<File | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfError,      setPdfError]      = useState("");
  const [isDragging,    setIsDragging]    = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── PDF import helper ─────────────────────────────────────────
  function applyPdfResult(result: PdfImportResult) {
    if (result.title)   setTitle(result.title);
    if (result.content) setContent(result.content);
    setTab("text");
  }

  // ── Handlers de tema ──────────────────────────────────────────
  function toggleTheme(theme: ThemeResponseDTO) {
    setSelectedThemes((prev) =>
      prev.some((t) => t.id === theme.id)
        ? prev.filter((t) => t.id !== theme.id)
        : [...prev, theme],
    );
  }

  async function handleAddTheme() {
    const name = newThemeName.trim();
    if (!name || !token) return;

    // Já existe no backend?
    const existing = storeThemes.find(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      if (!selectedThemes.some((t) => t.id === existing.id)) {
        setSelectedThemes((prev) => [...prev, existing]);
      }
      setNewThemeName("");
      return;
    }

    // Cria no backend
    setCreatingTheme(true);
    try {
      const created = await themesApi.create({ name }, token);
      const updated = [...storeThemes, created];
      setStoreThemes(updated);
      setSelectedThemes((prev) => [...prev, created]);
      setNewThemeName("");
    } catch {
      // Silencia — usuário pode tentar novamente
    } finally {
      setCreatingTheme(false);
    }
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
      const res  = await fetch("/api/ai/transcribe-pdf", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      applyPdfResult(data);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Falha ao importar PDF.");
    } finally {
      setPdfProcessing(false);
    }
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !token) return;
    setSaving(true);
    setSaveError("");

    // Monta referências bíblicas como string[] para o backend
    const biblicalReferences: string[] = [];
    if (bibleBook.trim()) {
      const ref = {
        book: bibleBook.trim(),
        chapter: parseInt(bibleChapter) || 1,
        verseStart: bibleVerseStart ? parseInt(bibleVerseStart) : undefined,
        verseEnd:   bibleVerseEnd   ? parseInt(bibleVerseEnd)   : undefined,
      };
      biblicalReferences.push(bibleRefToString(ref));
    }

    try {
      const dto = await notesApi.createRaw(
        {
          title:   title.trim(),
          content: content.trim(),
          biblicalReferences,
          themeIds: selectedThemes.map((t) => t.id),
        },
        token,
      );

      if (dto.planMessage) {
        setPlanMessage(dto.planMessage);
        setSaving(false);
        return;
      }

      const created = parseNoteResponse(dto);
      // Adiciona ao store com os campos de localização (não existem no backend)
      addNote({ ...created, location: location.trim() || undefined });
      setSaved(true);
      setTimeout(() => router.push("/app/notes"), 800);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Falha ao salvar nota.",
      );
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "text" as Tab, label: "Escrever Texto", icon: FileText },
    { id: "pdf"  as Tab, label: "Importar PDF",   icon: FileUp   },
  ];

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-3xl space-y-6 animate-fade-in">
      {planMessage && (
        <PlanLimitModal
          message={planMessage}
          onClose={() => setPlanMessage(null)}
        />
      )}

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
            <h2 className="text-lg font-semibold text-foreground">Escrever Texto</h2>

            {/* Título */}
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

            {/* Conteúdo */}
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

            {/* Local */}
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

            {/* Temas */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Temas</label>

              {storeThemes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {storeThemes.map((theme) => {
                    const active = selectedThemes.some((t) => t.id === theme.id);
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => toggleTheme(theme)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                          active
                            ? "bg-gold/20 border-gold/40 text-gold"
                            : "border-border text-muted-foreground hover:border-gold/40 hover:text-gold",
                        )}
                      >
                        {active && <Check size={10} />}
                        {theme.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nenhum tema cadastrado. Crie o primeiro abaixo.
                </p>
              )}

              {/* Novo tema */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTheme())
                  }
                  placeholder="Novo tema..."
                  className="flex-1 rounded-xl border border-input bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddTheme}
                  disabled={creatingTheme || !newThemeName.trim()}
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {creatingTheme
                    ? <Loader2 size={14} className="animate-spin text-foreground" />
                    : <Plus size={14} className="text-foreground" />
                  }
                </button>
              </div>
            </div>

            {/* Referências Bíblicas */}
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
              <input
                type="text"
                value={bibleVerseEnd}
                onChange={(e) => setBibleVerseEnd(e.target.value)}
                placeholder="Verso final (opcional)"
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          {/* Erro de save */}
          {saveError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">
              <AlertCircle size={14} className="shrink-0" />
              {saveError}
            </div>
          )}

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
              isDragging ? "border-gold bg-gold/5" : "border-border bg-card",
            )}
          >
            {!pdfFile ? (
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
                    Livros, artigos, esboços e manuscritos — o texto é extraído para você organizar
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
              <div className="p-6 space-y-5">
                {/* File info */}
                <div className="flex items-center gap-4 rounded-xl bg-secondary/40 border border-border px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0 border border-gold/20">
                    <File size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{pdfFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(pdfFile.size)}</p>
                  </div>
                  <button
                    onClick={clearPdf}
                    disabled={pdfProcessing}
                    className="w-8 h-8 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="rounded-xl bg-secondary/40 border border-border px-4 py-3 flex items-start gap-3">
                  <FileText size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O texto do PDF será extraído e copiado para a nota. Você poderá ajustar
                    título, temas e referências bíblicas antes de salvar.
                  </p>
                </div>

                {pdfError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">
                    <AlertCircle size={14} className="shrink-0" />
                    {pdfError}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleTranscribePdf}
                    disabled={pdfProcessing}
                    className="w-full h-11 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {pdfProcessing ? (
                      <><Loader2 size={16} className="animate-spin" /> Extraindo texto...</>
                    ) : (
                      <><FileUp size={16} /> Importar conteúdo</>
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
