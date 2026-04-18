"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, BookOpen, MapPin, Calendar, Trash2, Pencil, AlertTriangle, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import { readerUrl } from "@/lib/bible-books";

function DeleteModal({
  noteTitle,
  onConfirm,
  onCancel,
}: {
  noteTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle size={22} className="text-destructive" />
          </div>

          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-1">
              Deletar nota?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A nota{" "}
              <span className="font-medium text-foreground">
                &ldquo;{noteTitle}&rdquo;
              </span>{" "}
              será removida permanentemente. Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={onCancel}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Deletar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { notes, deleteNote } = useAppStore();
  const note = notes.find((n) => n.id === id);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  function handleConfirmDelete() {
    deleteNote(id);
    router.push("/app/notes");
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          noteTitle={note.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div className="max-w-2xl space-y-6 animate-fade-in">
        {/* Back */}
        <Link
          href="/app/notes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Todas as notas
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {note.title}
          </h1>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <Link
              href={`/app/notes/${id}/edit`}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil size={14} />
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(note.createdAt)}
          </span>
          {note.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              {note.location}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {note.themes.map((theme) => (
            <Link
              key={theme}
              href={`/app/themes?tag=${encodeURIComponent(theme)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
            >
              <Tag size={10} />
              {theme}
            </Link>
          ))}
        </div>

        {/* Bible Refs */}
        {note.bibleRefs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.bibleRefs.map((ref) => (
              <Link
                key={`${ref.book}-${ref.chapter}`}
                href={readerUrl(ref.book, ref.chapter)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
              >
                <BookOpen size={10} />
                {ref.book} {ref.chapter}
                {ref.verseStart ? `:${ref.verseStart}` : ""}
                {ref.verseEnd ? `–${ref.verseEnd}` : ""}
              </Link>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Content */}
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
      </div>
    </>
  );
}
