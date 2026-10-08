"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  BookOpen,
  Trash2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import { readerUrl } from "@/lib/bible-books";
import { notesApi } from "@/lib/api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { PlanLimitModal } from "@/components/ui/plan-limit-modal";

export default function NotesPage() {
  const token        = useAppStore((s) => s.token);
  const user         = useAppStore((s) => s.user);
  const notes        = useAppStore((s) => s.notes);
  const themes       = useAppStore((s) => s.themes);
  const planUsage    = useAppStore((s) => s.planUsage);
  const deleteNote   = useAppStore((s) => s.deleteNote);

  const [search, setSearch]           = useState("");
  const [filterTheme, setFilterTheme] = useState("");
  const [sortBy, setSortBy]           = useState<"recent" | "oldest">("recent");

  // Exclusão
  const [deleteTarget, setDeleteTarget] = useState<(typeof notes)[0] | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState("");

  // Modal de limite
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Regras de Plano FREE
  const isFree = (user?.planType ?? planUsage?.planType ?? "FREE") === "FREE";
  const maxFreeNotes = 5;
  const notesCount = notes.length;
  const reachedNoteLimit = isFree && notesCount >= maxFreeNotes;

  const themeNames = useMemo(() => {
    if (themes.length > 0) return themes.map((t) => t.name).sort();
    const names = new Set<string>();
    notes.forEach((n) => n.themes.forEach((t) => names.add(t)));
    return [...names].sort();
  }, [themes, notes]);

  const filtered = useMemo(() => {
    let list = [...notes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.themes.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (filterTheme) {
      list = list.filter((n) => n.themes.includes(filterTheme));
    }
    list.sort((a, b) => {
      const diff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortBy === "recent" ? diff : -diff;
    });
    return list;
  }, [notes, search, filterTheme, sortBy]);

  async function handleConfirmDelete() {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await notesApi.delete(deleteTarget.id, token);
      // Só remove do store depois que o backend confirma. Antes, a remoção
      // acontecia no finally mesmo em caso de erro, e o store divergia do banco.
      deleteNote(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Falha ao excluir a nota.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {deleteError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Modal de Limite do Plano */}
      {showPlanModal && (
        <PlanLimitModal
          message="Você atingiu o limite de 5 notas do plano gratuito. Faça upgrade para o PRO para armazenar sermões e estudos bíblicos ilimitados."
          onClose={() => setShowPlanModal(false)}
        />
      )}

      {/* Modal de Exclusão */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title="Deletar nota?"
          description={
            <>
              A nota{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget.title}&rdquo;
              </span>{" "}
              será removida permanentemente. Esta ação não pode ser desfeita.
            </>
          }
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Todas as notas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Seu acervo de sermões, esboços e ministrações.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isFree && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
              <Sparkles size={12} />
              <span>Plano Free: {notesCount}/5 notas</span>
            </div>
          )}

          {reachedNoteLimit ? (
            <button
              onClick={() => setShowPlanModal(true)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-gold/40 bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
            >
              <Sparkles size={14} />
              Nova nota (Limite atingido)
            </button>
          ) : (
            <Link
              href="/app/notes/new"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors"
            >
              <Plus size={15} />
              Nova nota
            </Link>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar nas notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-input bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <SlidersHorizontal
              size={14}
              className="text-muted-foreground shrink-0"
            />
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="flex-1 sm:flex-none h-9 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos os temas</option>
              {themeNames.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
            className="h-9 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="recent">Recentes</option>
            <option value="oldest">Antigas</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} nota{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
            <Search size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {notes.length === 0
                ? "Nenhuma nota ainda. Crie a sua primeira!"
                : "Nenhuma nota encontrada"}
            </p>
          </div>
        ) : (
          filtered.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group flex flex-col"
            >
              {/* Date row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(note.createdAt)}
                </span>
                <div className="flex items-center gap-1.5">
                  {note.location && (
                    <span className="text-xs text-muted-foreground/60 truncate">
                      📍 {note.location}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); setDeleteTarget(note); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Excluir nota"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Title + content */}
              <Link href={`/app/notes/${note.id}`} className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors leading-snug">
                  {note.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
                  {note.content}
                </p>
              </Link>

              {/* Tags + refs */}
              {(note.themes.length > 0 || note.bibleRefs.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                  {note.themes.map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setFilterTheme(theme)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                    >
                      <Tag size={9} />
                      {theme}
                    </button>
                  ))}
                  {note.bibleRefs.map((ref) => (
                    <Link
                      key={`${ref.book}-${ref.chapter}`}
                      href={readerUrl(ref.book, ref.chapter)}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-xs text-gold hover:bg-gold/10 transition-colors"
                    >
                      <BookOpen size={9} />
                      {ref.book} {ref.chapter}
                      {ref.verseStart ? `:${ref.verseStart}` : ""}
                      {ref.verseEnd ? `-${ref.verseEnd}` : ""}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
