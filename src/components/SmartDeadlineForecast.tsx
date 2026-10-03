import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Share2,
  ChevronRight,
  Zap,
  CheckCircle2,
  Award,
} from 'lucide-react';
import type { WritingSession, Book } from '../types';

interface SmartDeadlineForecastProps {
  goal: number;
  totalWords: number;
  dailyGoal: number;
  sessions: WritingSession[];
  books?: Book[];
  onOpenStoryModal?: () => void;
}

export const SmartDeadlineForecast: React.FC<SmartDeadlineForecastProps> = ({
  goal,
  totalWords,
  dailyGoal,
  sessions,
  books = [],
  onOpenStoryModal,
}) => {
  const remainingWords = Math.max(0, goal - totalWords);
  const isGoalReached = remainingWords === 0 && totalWords > 0;

  // Calculate actual pace in the last 14 days
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentSessions = sessions.filter((s) => {
    const sDate = new Date(s.date);
    return sDate >= fourteenDaysAgo;
  });

  const recentWords = recentSessions.reduce((acc, s) => acc + s.words, 0);
  const activeDaysInPeriod = new Set(recentSessions.map((s) => s.date)).size;

  // Actual daily average (considering active days or default to dailyGoal)
  const actualAvgPace =
    activeDaysInPeriod > 0
      ? Math.max(50, Math.round(recentWords / activeDaysInPeriod))
      : Math.max(100, Math.round(dailyGoal * 0.75));

  // Interactive custom pace simulator
  const [simulatedPace, setSimulatedPace] = useState<number>(() => {
    return Math.max(100, actualAvgPace || dailyGoal);
  });

  // Calculate completion date based on pace
  const calculateCompletionDate = (pace: number): { date: Date; days: number } => {
    if (remainingWords <= 0) return { date: new Date(), days: 0 };
    const days = Math.ceil(remainingWords / Math.max(1, pace));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return { date: targetDate, days };
  };

  const actualForecast = calculateCompletionDate(actualAvgPace);
  const goalForecast = calculateCompletionDate(dailyGoal);
  const simForecast = calculateCompletionDate(simulatedPace);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const daysSaved = Math.max(0, actualForecast.days - simForecast.days);

  return (
    <section className="bg-gradient-to-br from-white via-[#faf7fd] to-[#f4ebfa] dark:from-[#160b24] dark:via-[#190d2a] dark:to-[#12071f] rounded-3xl p-5 sm:p-7 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#823bd8]/10 text-[#823bd8] dark:text-[#a875ec] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Previsão Inteligente de Conclusão</span>
          </div>
          <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
            Quando seu rascunho estará pronto? 📖
          </h3>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8]">
            Projeção em tempo real baseada no seu ritmo médio de escrita diária e metas de palavras.
          </p>
        </div>

        {onOpenStoryModal && (
          <button
            onClick={onOpenStoryModal}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#b83280] to-[#823bd8] hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>Gerar Card de Story</span>
          </button>
        )}
      </div>

      {isGoalReached ? (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-serif-display text-xl font-bold text-emerald-900 dark:text-emerald-200">
            Parabéns! Sua meta de {new Intl.NumberFormat('pt-BR').format(goal)} palavras foi alcançada!
          </h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            Seu primeiro rascunho está completo. Que tal definir uma nova meta de revisão ou iniciar um novo projeto?
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Card: Actual Pace Forecast (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#823bd8] dark:text-[#a875ec] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Previsão no Ritmo Atual</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f6f0fb] dark:bg-[#25133d] text-[#5c4672] dark:text-[#c4b3d8]">
                ~{new Intl.NumberFormat('pt-BR').format(actualAvgPace)} palavras/dia
              </span>
            </div>

            <div>
              <span className="text-xs text-[#5c4672] dark:text-[#c4b3d8] block">Data estimada de término:</span>
              <h4 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-0.5">
                {formatDate(actualForecast.date)}
              </h4>
              <span className="text-xs font-semibold text-[#b83280] dark:text-[#f472b6] mt-1 block">
                Faltam {actualForecast.days} dias ({Math.round((actualForecast.days / 7) * 10) / 10} semanas) para concluir as {new Intl.NumberFormat('pt-BR').format(remainingWords)} palavras restantes.
              </span>
            </div>

            {/* Comparison with official Daily Goal */}
            <div className="pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42]/60 flex items-center justify-between text-xs text-[#5c4672] dark:text-[#c4b3d8]">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#147d74] dark:text-[#2dd4bf]" />
                Escrevendo sua meta fixa ({dailyGoal} pal/dia):
              </span>
              <span className="font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                {formatDate(goalForecast.date)} ({goalForecast.days} dias)
              </span>
            </div>
          </div>

          {/* Interactive Simulator (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#faf7fd] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#351e50] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#b83280] dark:text-[#f472b6] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Simulador de Aceleração</span>
              </span>
              <span className="text-xs font-bold text-[#b83280] dark:text-[#f472b6] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900 tabular-nums">
                {simulatedPace} pal/dia
              </span>
            </div>

            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8]">
              Arraste para ver como aumentar sua dedicação diária antecipa a data final:
            </p>

            <input
              type="range"
              min="200"
              max="2500"
              step="50"
              value={simulatedPace}
              onChange={(e) => setSimulatedPace(Number(e.target.value))}
              className="w-full h-2 bg-[#ebdff2] dark:bg-[#2d1b42] rounded-lg appearance-none cursor-pointer accent-[#b83280]"
            />

            <div className="p-3 bg-white dark:bg-[#160b24] rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                <span>Nova Data Prevista:</span>
                <span className="text-[#823bd8] dark:text-[#a875ec]">{formatDate(simForecast.date)}</span>
              </div>
              {daysSaved > 0 && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                  ⚡ Você ganha {daysSaved} dias de folga adiantando o lançamento!
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
