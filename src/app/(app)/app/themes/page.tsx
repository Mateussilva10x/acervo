"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Tag, BookOpen, Plus, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import { Suspense, useMemo, useState } from "react";
import { themesApi, ApiError } from "@/lib/api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { PlanLimitModal } from "@/components/ui/plan-limit-modal";

function ThemesContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const activeTag    = searchParams.get("tag");

  const token        = useAppStore((s) => s.token);
  const user         = useAppStore((s) => s.user);
  const notes        = useAppStore((s) => s.notes);
  const themes       = useAppStore((s) => s.themes);
  const planUsage    = useAppStore((s) => s.planUsage);
  const addTheme     = useAppStore((s) => s.addTheme);
  const updateTheme  = useAppStore((s) => s.updateTheme);
  const deleteTheme  = useAppStore((s) => s.deleteTheme);

  // Estados de criação
  const [newThemeName, setNewThemeName] = useState("");
  const [creating, setCreating]         = useState(false);
  const [createError, setCreateError]   = useState("");

  // Estados de edição
  const [editingTheme, setEditingTheme] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName]         = useState("");
  const [updating, setUpdating]         = useState(false);
  const [editError, setEditError]       = useState("");

  // Estados de exclusão
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // Modal de limite de plano
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Verificação de limite
  const isFree = (user?.planType ?? planUsage?.planType ?? "FREE") === "FREE";
  const themesCount = themes.length;
  const maxFreeThemes = 3;
  const reachedThemeLimit = isFree && themesCount >= maxFreeThemes;

  // Contagem de notas por tema
  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) =>
      n.themes.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; }),
    );
    themes.forEach((t) => {
      if (counts[t.name] === undefined) counts[t.name] = 0;
    });
    return counts;
  }, [notes, themes]);

  const filteredNotes = activeTag
    ? notes.filter((n) => n.themes.includes(activeTag))
    : [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newThemeName.trim() || !token) return;

    if (reachedThemeLimit) {
      setShowPlanModal(true);
      return;
    }

    setCreating(true);
    setCreateError("");
    try {
      const created = await themesApi.create({ name: newThemeName.trim() }, token);
      addTheme(created);
      setNewThemeName("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setShowPlanModal(true);
      } else {
        setCreateError(err instanceof Error ? err.message : "Erro ao criar tema.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTheme || !editName.trim() || !token) return;

    setUpdating(true);
    setEditError("");
    try {
      const updated = await themesApi.update(editingTheme.id, { name: editName.trim() }, token);
      updateTheme(updated.id, updated.name);
      setEditingTheme(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erro ao atualizar tema.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await themesApi.delete(deleteTarget.id, token);
      deleteTheme(deleteTarget.id);
      if (activeTag === deleteTarget.name) {
        router.push("/app/themes");
      }
      setDeleteTarget(null);
    } catch {
      deleteTheme(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modal de Limite do Plano */}
      {showPlanModal && (
        <PlanLimitModal
          message="Você atingiu o limite de 3 temas do plano gratuito. Faça upgrade para o PRO para criar temas ilimitados e organizar todo o seu acervo."
          onClose={() => setShowPlanModal(false)}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title="Excluir tema?"
          description={
            <>
              O tema <span className="font-semibold text-foreground">&ldquo;{deleteTarget.name}&rdquo;</span> será
              removido do acervo. As notas associadas a ele continuarão salvas, mas sem essa etiqueta.
            </>
          }
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Modal de Edição de Tema */}
      {editingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingTheme(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Editar Tema</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {editError && (
                <p className="text-xs text-destructive">{editError}</p>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTheme(null)}
                  className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating || !editName.trim()}
                  className="h-9 px-4 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {updating ? <Loader2 size={13} className="animate-spin" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Temas</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Categorize e relacione seus sermões e estudos bíblicos.
          </p>
        </div>

        {/* Indicador de plano */}
        {isFree && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
            <Sparkles size={12} />
            <span>Plano Free: {themesCount}/3 temas utilizados</span>
          </div>
        )}
      </div>

      {/* Formulário de Criação de Tema */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={reachedThemeLimit ? "Limite de 3 temas atingido (Plano Free)" : "Nome do novo tema (ex: Graça, Oração, Família)..."}
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              disabled={reachedThemeLimit}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={creating || (!reachedThemeLimit && !newThemeName.trim())}
            onClick={(e) => {
              if (reachedThemeLimit) {
                e.preventDefault();
                setShowPlanModal(true);
              }
            }}
            className={`inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-sm font-medium transition-colors shrink-0 ${
              reachedThemeLimit
                ? "bg-secondary text-muted-foreground hover:border-gold hover:text-gold border border-border cursor-pointer"
                : "bg-gold text-primary-foreground hover:bg-gold-dark disabled:opacity-60"
            }`}
          >
            {creating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : reachedThemeLimit ? (
              <>
                <Sparkles size={14} className="text-gold" />
                Limite atingido (Upgrade)
              </>
            ) : (
              <>
                <Plus size={15} />
                Adicionar Tema
              </>
            )}
          </button>
        </form>
        {createError && (
          <p className="text-xs text-destructive mt-2">{createError}</p>
        )}
      </div>

      {/* Grid de Temas com Ações de Edição e Exclusão */}
      {themes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum tema cadastrado ainda. Use o campo acima para criar seu primeiro tema!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {themes.map((theme) => {
            const count = themeCounts[theme.name] ?? 0;
            const isSelected = activeTag === theme.name;
            return (
              <div
                key={theme.id}
                className={`group flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? "border-gold bg-gold/10 shadow-sm"
                    : "border-border bg-card hover:border-gold/40"
                }`}
              >
                <Link
                  href={`/app/themes?tag=${encodeURIComponent(theme.name)}`}
                  className="flex items-center gap-2.5 min-w-0 flex-1"
                >
                  <Tag size={14} className={isSelected ? "text-gold" : "text-muted-foreground"} />
                  <span className="text-sm font-medium text-foreground truncate">
                    {theme.name}
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">
                    {count}
                  </span>
                </Link>

                {/* Botões de Ação */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingTheme(theme);
                      setEditName(theme.name);
                      setEditError("");
                    }}
                    title="Editar tema"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteTarget(theme);
                    }}
                    title="Excluir tema"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notas Filtradas pelo Tema Selecionado */}
      {activeTag && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              Notas em <span className="text-gold">&ldquo;{activeTag}&rdquo;</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({filteredNotes.length})
              </span>
            </h2>
            <Link
              href="/app/themes"
              className="text-xs text-gold hover:underline"
            >
              Limpar filtro
            </Link>
          </div>

          {filteredNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma nota com esse tema ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/app/notes/${note.id}`}
                  className="flex flex-col rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors leading-snug">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed flex-1">
                    {note.content}
                  </p>
                  {note.bibleRefs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                      {note.bibleRefs.map((ref) => (
                        <span
                          key={`${ref.book}-${ref.chapter}`}
                          className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-xs text-gold"
                        >
                          <BookOpen size={9} />
                          {ref.book} {ref.chapter}
                          {ref.verseStart ? `:${ref.verseStart}` : ""}
                          {ref.verseEnd ? `-${ref.verseEnd}` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ThemesPage() {
  return (
    <Suspense>
      <ThemesContent />
    </Suspense>
  );
}
