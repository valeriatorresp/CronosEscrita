import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, X } from 'lucide-react';
import type { Badge } from '../types';

interface BadgeCelebrationProps {
  unlockedBadge: Badge | null;
  onDismiss: () => void;
}

export const BadgeCelebration: React.FC<BadgeCelebrationProps> = ({ unlockedBadge, onDismiss }) => {
  useEffect(() => {
    if (unlockedBadge) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6c2eb9', '#b83280', '#147d74', '#2dd4bf', '#f472b6'],
      });

      const timer = setTimeout(() => {
        onDismiss();
      }, 6000);
      return () => clearTimeout(timer);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [unlockedBadge, onDismiss]);

  if (!unlockedBadge) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-white dark:bg-[#160b24] border-2 border-[#ebdff2] dark:border-[#2d1b42] shadow-2xl flex items-start gap-3 relative overflow-hidden">
        <div
          className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 blur-xl pointer-events-none"
          style={{ backgroundColor: unlockedBadge.color }}
        />
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, ${unlockedBadge.color || '#6c2eb9'}, #532380)`,
          }}
        >
          <Award className="w-6 h-6 animate-bounce" />
        </div>
        <div className="flex-1 pr-14">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#b83280] dark:text-[#f472b6]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Conquista Desbloqueada!</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h4 className="font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc]">{unlockedBadge.title}</h4>
            {unlockedBadge.levelName && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#102c29]">
                {unlockedBadge.level === 'mediano' ? 'Escritor em Ascensão' : unlockedBadge.levelName}
              </span>
            )}
          </div>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1 leading-snug">{unlockedBadge.description}</p>

          {unlockedBadge.celebrationSuggestion && (
            <div className="mt-2.5 p-2 rounded-xl bg-[#faf7fd] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-[11px] text-[#220d3a] dark:text-[#f7f2fc]">
              <span className="font-bold text-[#b83280] dark:text-[#f472b6] block text-[10px] uppercase">
                🎉 Minicomemoração:
              </span>
              <span>{unlockedBadge.celebrationSuggestion}</span>
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] hover:text-[#220d3a] dark:hover:text-white bg-[#f6f0fb] dark:bg-[#1f1033] hover:bg-[#ebdff2] dark:hover:bg-[#2d1b42] transition-colors cursor-pointer border border-[#ebdff2] dark:border-[#2d1b42]"
          title="Fechar aviso (Esc)"
        >
          <span>Fechar</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
