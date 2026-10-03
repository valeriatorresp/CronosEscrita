import React, { useState, useMemo } from 'react';
import {
  Crown,
  Sparkles,
  CalendarCheck,
  TrendingUp,
  Target,
  BookMarked,
  ArrowRight,
  Zap,
  Clock,
  Compass,
} from 'lucide-react';
import type { WritingSession, Book } from '../types';

interface GoldenStatsCardProps {
  sessions: WritingSession[];
  books: Book[];
  overallGoal: number;
  challengeDays: number;
}

export const GoldenStatsCard: React.FC<GoldenStatsCardProps> = ({
  sessions,
  books,
  overallGoal,
  challengeDays,
}) => {
  // If books exist, allow choosing which book to project, defaulting to first or most recently updated
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    if (books.length > 0) return books[0].id;
    return 'all';
  });

  const selectedBook = books.find((b) => b.id === selectedBookId);

  // Compute statistics
  const stats = useMemo(() => {
    // Filter sessions if specific book is selected
    const relevantSessions =
      selectedBookId === 'all' || !selectedBook
        ? sessions
        : sessions.filter((s) => s.bookId === selectedBookId);

    const totalWords = relevantSessions.reduce((sum, s) => sum + s.words, 0);
    const sessionCount = relevantSessions.length;

    // 1. Média de palavras por sessão
    const avgWordsPerSession = sessionCount > 0 ? Math.round(totalWords / sessionCount) : 0;

    // 2. Média diária (baseada nos dias distintos com escrita)
    const distinctDates = new Set(relevantSessions.map((s) => s.date));
    const activeDaysCount = distinctDates.size;
    const avgWordsPerDay = activeDaysCount > 0 ? Math.round(totalWords / activeDaysCount) : avgWordsPerSession;

    // Target words for this book or overall
    const targetWords = selectedBook ? selectedBook.targetWords || overallGoal : overallGoal;
    const remainingWords = Math.max(0, targetWords - totalWords);
    const progressPct = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;

    // 3. Projeção da data estimada de conclusão
    let estimatedDaysLeft: number | null = null;
    let estimatedDate: Date | null = null;
    let paceEvaluation: 'excellent' | 'steady' | 'building' | 'none' = 'none';

    // Determine pace to use for projection: prefer daily pace, fallback to session pace
    const effectiveDailyPace = avgWordsPerDay > 0 ? avgWordsPerDay : avgWordsPerSession;

    if (remainingWords === 0 && totalWords > 0) {
      paceEvaluation = 'excellent';
    } else if (effectiveDailyPace > 0) {
      estimatedDaysLeft = Math.ceil(remainingWords / effectiveDailyPace);
      const now = new Date();
      estimatedDate = new Date(now.getTime() + estimatedDaysLeft * 24 * 60 * 60 * 1000);

      const idealPace = Math.ceil(overallGoal / (challengeDays || 30));
      if (effectiveDailyPace >= idealPace * 1.15) {
        paceEvaluation = 'excellent';
      } else if (effectiveDailyPace >= idealPace * 0.85) {
        paceEvaluation = 'steady';
      } else {
        paceEvaluation = 'building';
      }
    }

    return {
      totalWords,
      sessionCount,
      avgWordsPerSession,
      avgWordsPerDay,
      targetWords,
      remainingWords,
      progressPct,
      estimatedDaysLeft,
      estimatedDate,
      paceEvaluation,
      activeDaysCount,
    };
  }, [sessions, selectedBookId, selectedBook, overallGoal, challengeDays]);

  const formatDatePT = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-purple-500/10 dark:from-amber-950/25 dark:via-[#160b24] dark:to-purple-950/20 border border-amber-300/50 dark:border-amber-500/30 shadow-md transition-all">
      {/* Decorative Golden Highlights */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-amber-400/20 via-yellow-300/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-radial from-amber-500/15 via-rose-400/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header with Title and Book Selector */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-200/60 dark:border-amber-800/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 via-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
            <Crown className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inteligência de Produtividade</span>
              </span>
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
              Estatísticas de Ouro
            </h3>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">
              Média por sessão e projeção matemática da data de conclusão do seu livro.
            </p>
          </div>
        </div>

        {/* Book Selector Filter */}
        {books.length > 0 && (
          <div className="flex items-center gap-2 bg-white/90 dark:bg-[#1f1033] px-3.5 py-2 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-xs">
            <BookMarked className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] shrink-0">
              Projetar para:
            </span>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] bg-transparent focus:outline-hidden cursor-pointer"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id} className="dark:bg-[#160b24]">
                  {b.title} ({new Intl.NumberFormat('pt-BR').format(b.targetWords)} pal.)
                </option>
              ))}
              <option value="all" className="dark:bg-[#160b24]">
                Meta Global ({new Intl.NumberFormat('pt-BR').format(overallGoal)} pal.)
              </option>
            </select>
          </div>
        )}
      </div>

      {/* Main Grid of Golden Insights */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {/* Metric 1: Média de Palavras por Sessão */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#160b24] border border-amber-200/80 dark:border-[#2d1b42] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Média por Sessão</span>
            </span>
            <span className="text-[11px] font-semibold text-[#8870a0] dark:text-[#9782ad]">
              {stats.sessionCount} {stats.sessionCount === 1 ? 'sessão' : 'sessões'}
            </span>
          </div>

          <div className="mt-2.5">
            <span className="font-serif-display text-3xl sm:text-4xl font-bold text-[#220d3a] dark:text-[#f7f2fc] tracking-tight tabular-nums">
              {new Intl.NumberFormat('pt-BR').format(stats.avgWordsPerSession)}
            </span>
            <span className="text-xs text-[#5c4672] dark:text-[#c4b3d8] ml-2 font-medium">
              palavras / sessão
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between text-xs">
            <span className="text-[#5c4672] dark:text-[#c4b3d8] font-medium">
              Média nos dias ativos:
            </span>
            <span className="font-bold text-[#147d74] dark:text-[#2dd4bf] tabular-nums">
              {new Intl.NumberFormat('pt-BR').format(stats.avgWordsPerDay)} pal./dia
            </span>
          </div>
        </div>

        {/* Metric 2: Data Estimada de Conclusão */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#160b24] border-2 border-amber-300/70 dark:border-amber-600/40 shadow-sm relative overflow-hidden group md:col-span-1 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Previsão de Conclusão da Obra</span>
            </span>

            {stats.remainingWords === 0 && stats.totalWords > 0 ? (
              <span className="text-xs font-bold text-[#147d74] dark:text-[#2dd4bf]">
                🎉 Obra Concluída!
              </span>
            ) : stats.estimatedDaysLeft !== null ? (
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 tabular-nums">
                ~{stats.estimatedDaysLeft} {stats.estimatedDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
              </span>
            ) : null}
          </div>

          <div className="mt-3">
            {stats.remainingWords === 0 && stats.totalWords > 0 ? (
              <div>
                <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#147d74] dark:text-[#2dd4bf]">
                  Parabéns! Ponto Final Atingido!
                </span>
                <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
                  Você completou as {new Intl.NumberFormat('pt-BR').format(stats.targetWords)} palavras estipuladas para este livro.
                </p>
              </div>
            ) : stats.estimatedDate ? (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#220d3a] dark:text-[#f7f2fc] tracking-tight">
                  {formatDatePT(stats.estimatedDate)}
                </span>
                <span className="text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8]">
                  (mantendo o ritmo de ~{new Intl.NumberFormat('pt-BR').format(stats.avgWordsPerDay)} pal./dia)
                </span>
              </div>
            ) : (
              <div>
                <span className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                  Aguardando suas primeiras palavras
                </span>
                <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
                  Registre sua primeira sessão de escrita para que possamos calcular sua data estimada de conclusão.
                </p>
              </div>
            )}
          </div>

          {/* Golden Progress Bar & Context */}
          {stats.remainingWords > 0 && stats.targetWords > 0 && (
            <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-800/40">
              <div className="flex items-center justify-between text-xs font-medium text-[#5c4672] dark:text-[#c4b3d8] mb-1.5">
                <span>
                  Progresso: <strong className="text-[#220d3a] dark:text-[#f7f2fc] tabular-nums">{new Intl.NumberFormat('pt-BR').format(stats.totalWords)}</strong> de{' '}
                  <strong className="text-[#220d3a] dark:text-[#f7f2fc] tabular-nums">{new Intl.NumberFormat('pt-BR').format(stats.targetWords)}</strong> palavras
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">{stats.progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-400 via-[#b83280] to-[#147d74] rounded-full transition-all duration-500"
                  style={{ width: `${stats.progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Golden Insight Footer Strip */}
      <div className="relative z-10 mt-5 p-4 rounded-2xl bg-white/80 dark:bg-[#1f1033] border border-amber-200/60 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#220d3a] dark:text-[#f7f2fc]">
          <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            {stats.paceEvaluation === 'excellent' && (
              <>
                🔥 <strong>Ritmo Acelerado!</strong> Você está escrevendo acima do ritmo diário recomendado. Continue assim!
              </>
            )}
            {stats.paceEvaluation === 'steady' && (
              <>
                ✨ <strong>Ritmo Ideal!</strong> Sua consistência diária está alinhada perfeitamente com o cronograma.
              </>
            )}
            {stats.paceEvaluation === 'building' && (
              <>
                🌱 <strong>Construindo o Hábito:</strong> Um sprint diário de 20 minutos pode antecipar a sua data de conclusão em semanas!
              </>
            )}
            {stats.paceEvaluation === 'none' && (
              <>
                ✍️ <strong>Pronto para começar:</strong> Cada palavra escrita aproxima a sua história do leitor.
              </>
            )}
          </span>
        </div>

        {stats.remainingWords > 0 && (
          <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0 tabular-nums">
            Faltam {new Intl.NumberFormat('pt-BR').format(stats.remainingWords)} palavras para o ponto final
          </span>
        )}
      </div>
    </div>
  );
};
