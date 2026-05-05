"use client";

import { Sparkles, X, Zap } from "lucide-react";

interface PlanLimitModalProps {
  message: string;
  onClose: () => void;
}

export function PlanLimitModal({ message, onClose }: PlanLimitModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-gold/30 bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Sparkles size={26} className="text-gold" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Limite do plano gratuito
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>

          <div className="w-full rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-left space-y-1.5">
            <p className="text-xs font-semibold text-gold uppercase tracking-wide">
              Plano PRO inclui:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <Zap size={11} className="text-gold shrink-0" />
                Notas e temas ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Zap size={11} className="text-gold shrink-0" />
                Importação de PDF com IA
              </li>
              <li className="flex items-center gap-2">
                <Zap size={11} className="text-gold shrink-0" />
                Upload de áudio e imagem
              </li>
            </ul>
          </div>

          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Agora não
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              Fazer upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
