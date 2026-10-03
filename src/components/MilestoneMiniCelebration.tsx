import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Zap, X, Flame } from 'lucide-react';

interface MilestoneMiniCelebrationProps {
  show: boolean;
  wordCount: number;
  onClose: () => void;
  customTitle?: string;
  customMessage?: string;
}

export const MilestoneMiniCelebration: React.FC<MilestoneMiniCelebrationProps> = ({
  show,
  wordCount,
  onClose,
  customTitle,
  customMessage,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!show) {
      setProgress(100);
      return;
    }

    // Fire confetti bursts for celebration
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.25, x: 0.5 },
        colors: ['#6c2eb9', '#b83280', '#147d74', '#2dd4bf', '#f59e0b', '#eab308'],
      });
    } catch {
      // ignore
    }

    // Auto dismiss countdown
    const duration = 4500;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose, wordCount]);

  if (!show) return null;

  const milestoneLabel = wordCount >= 500 ? `${Math.floor(wordCount / 500) * 500}` : '500';

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="relative rounded-3xl p-4 sm:p-5 bg-[#1b0e2e]/95 dark:bg-[#12071f]/95 text-white backdrop-blur-xl border-2 border-[#b83280] shadow-2xl shadow-[#6c2eb9]/40 overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#b83280]/30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#147d74]/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-3.5">
          {/* Animated Icon Avatar */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#b83280] via-[#6c2eb9] to-[#147d74] p-0.5 shadow-lg shrink-0 flex items-center justify-center animate-bounce">
            <div className="w-full h-full rounded-[14px] bg-[#1b0e2e] flex items-center justify-center">
              <Flame className="w-6 h-6 text-[#2dd4bf] animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Mini-Comemoração</span>
              </span>
              <span className="text-[11px] font-bold text-[#f472b6] flex items-center gap-0.5">
                <Zap className="w-3 h-3" />
                <span>+{milestoneLabel} Palavras!</span>
              </span>
            </div>

            <h4 className="font-serif-display font-bold text-base sm:text-lg text-white mt-1 leading-snug">
              {customTitle || '🎉 Marco de 500 Palavras Alcançado!'}
            </h4>

            <p className="text-xs text-[#f7f2fc]/85 mt-1 leading-relaxed">
              {customMessage ||
                'Seu fluxo criativo está voando alto! O cérebro adora pequenas conquistas: respire fundo, celebre o foco e continue nesse embalo maravilhoso.'}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
            title="Fechar notificação (Esc)"
          >
            <span>Fechar</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dismiss countdown progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#2dd4bf] via-[#b83280] to-[#6c2eb9] transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
