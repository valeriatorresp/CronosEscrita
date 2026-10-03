import React from 'react';
import { Bell, Sparkles, ArrowRight, X, Clock, PenTool } from 'lucide-react';

interface ReminderBannerProps {
  scheduledTime: string;
  onWriteNow: () => void;
  onOpenGame: () => void;
  onOpenSettings: () => void;
  onDismiss: () => void;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({
  scheduledTime,
  onWriteNow,
  onOpenGame,
  onOpenSettings,
  onDismiss,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-[#1b0e2e] dark:bg-[#140922] border border-[#3b235c]/70 text-white shadow-lg animate-in slide-in-from-top-4 duration-300">
      {/* Decorative soft ambient glows */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#b83280]/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#147d74]/15 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-[#2dd4bf] animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2dd4bf]">
                Lembrete de Escrita
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 border border-white/15 backdrop-blur-xs flex items-center gap-1 text-white/80">
                <Clock className="w-3 h-3 text-[#2dd4bf]" />
                <span>Meta diária até {scheduledTime}</span>
              </span>
            </div>
            <h4 className="font-serif-display text-lg sm:text-xl font-bold mt-0.5 text-white">
              Você ainda não registrou suas palavras de hoje!
            </h4>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
              O horário estipulado chegou. Que tal reservar 15 a 20 minutos de foco agora para
              manter a chama da sua história acesa?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end pt-2 sm:pt-0">
          <button
            onClick={onWriteNow}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer border border-white/10"
          >
            <PenTool className="w-3.5 h-3.5 text-[#2dd4bf]" />
            <span>Registrar Agora</span>
          </button>

          <button
            onClick={onOpenGame}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#b83280] hover:bg-[#9d246b] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
            <span>Treino & Prática</span>
          </button>

          <button
            onClick={onDismiss}
            title="Dispensar lembrete por hoje"
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
