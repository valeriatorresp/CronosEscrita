import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarPlus,
  RefreshCw,
  BookOpen,
  Crown,
  Sparkles,
} from 'lucide-react';
import type { WritingSession, Book, ReminderSettings } from '../types';
import { createDailyWritingReminder } from '../services/calendar';

interface MonthlyCalendarProps {
  sessions: WritingSession[];
  books: Book[];
  hasGoogleToken: boolean;
  googleToken: string | null;
  onConnectGoogle: () => void;
  targetGoal: number;
  reminderSettings?: ReminderSettings;
  dailyGoal?: number;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  sessions,
  books,
  hasGoogleToken,
  googleToken,
  onConnectGoogle,
  targetGoal,
  reminderSettings,
  dailyGoal,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    currentDate
  );

  // Group sessions by YYYY-MM-DD
  const sessionsByDate: Record<string, WritingSession[]> = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.date]) {
      sessionsByDate[s.date] = [];
    }
    sessionsByDate[s.date].push(s);
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayKey(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayKey(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayKey(null);
  };

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(new Date().getDate()).padStart(2, '0')}`;

  const selectedSessions = selectedDayKey ? sessionsByDate[selectedDayKey] || [] : [];
  const selectedDayTotal = selectedSessions.reduce((sum, s) => sum + s.words, 0);

  const handleAddDailyReminder = async () => {
    if (!googleToken) {
      onConnectGoogle();
      return;
    }
    try {
      setIsSyncing(true);
      setSyncFeedback(null);
      const reminderTime = reminderSettings?.time || '20:00';
      const reminderDays = reminderSettings?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6];
      await createDailyWritingReminder(googleToken, targetGoal, reminderTime, reminderDays);
      setSyncFeedback(`✅ Lembrete recorrente (${reminderTime}) adicionado ao seu Google Calendar com sucesso!`);
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao conectar ao Google Calendar';
      setSyncFeedback(`⚠️ ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#e6f7f5] dark:bg-[#122e2b] text-[#147d74] dark:text-[#2dd4bf]">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] capitalize">
              {monthName}
            </h3>
          </div>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
            Acompanhe o mapa diário da sua escrita. {dailyGoal && dailyGoal > 0 ? (
              <span>Meta diária atual: <strong className="text-[#147d74] dark:text-[#2dd4bf] tabular-nums">{new Intl.NumberFormat('pt-BR').format(dailyGoal)} palavras</strong>. Dias vitoriosos brilham com uma coroa! 👑</span>
            ) : 'Sincronize com a sua rotina.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasGoogleToken ? (
            <button
              onClick={handleAddDailyReminder}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <CalendarPlus className="w-3.5 h-3.5 text-white" />
              )}
              <span>Agendar no Google Calendar</span>
            </button>
          ) : (
            <button
              onClick={onConnectGoogle}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-white" />
              <span>Conectar Google Calendar</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-[#f6f0fb] dark:bg-[#1f1033] p-1 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42]">
            <button
              onClick={handlePrevMonth}
              title="Mês anterior"
              className="p-1.5 hover:bg-white dark:hover:bg-[#2b1646] rounded-lg text-[#5c4672] dark:text-[#c4b3d8] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#2b1646] rounded-lg transition-colors cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              title="Próximo mês"
              className="p-1.5 hover:bg-white dark:hover:bg-[#2b1646] rounded-lg text-[#5c4672] dark:text-[#c4b3d8] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {syncFeedback && (
        <div className="mt-4 p-3 rounded-xl bg-[#e6f7f5] dark:bg-[#122e2b] border border-[#cbebe7] dark:border-[#1d3d3a] text-[#147d74] dark:text-[#2dd4bf] text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Calendar Table Container with responsive fluid scroll on smaller screens (< 1024px) */}
      <div className="overflow-x-auto scrollbar-thin pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="min-w-[540px] sm:min-w-0">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#8870a0] dark:text-[#9782ad] uppercase tracking-wider mt-6 mb-2">
            <span className="text-[#b83280] dark:text-[#f472b6]">Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span className="text-[#147d74] dark:text-[#2dd4bf]">Sáb</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Leading empty days from prev month */}
        {Array.from({ length: firstDayIndex }).map((_, i) => {
          const prevDay = daysInPrevMonth - firstDayIndex + i + 1;
          return (
            <div
              key={`prev-${i}`}
              className="min-h-[58px] sm:min-h-[72px] p-2 rounded-2xl border border-dashed border-[#ebdff2]/60 dark:border-[#2d1b42]/40 bg-[#f6f0fb]/20 dark:bg-[#160b24]/20 text-[#8870a0]/30 dark:text-[#9782ad]/30 text-xs font-semibold select-none flex flex-col justify-between"
            >
              <span className="tabular-nums">{prevDay}</span>
            </div>
          );
        })}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(
            2,
            '0'
          )}`;
          const daySessions = sessionsByDate[dayKey] || [];
          const dayWords = daySessions.reduce((sum, s) => sum + s.words, 0);
          const isToday = dayKey === todayStr;
          const isSelected = dayKey === selectedDayKey;
          const hasWords = dayWords > 0;
          const metGoal = dailyGoal && dailyGoal > 0 ? dayWords >= dailyGoal : false;

          return (
            <button
              key={dayKey}
              onClick={() => setSelectedDayKey(dayKey === selectedDayKey ? null : dayKey)}
              className={`min-h-[58px] sm:min-h-[72px] p-2 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                isSelected
                  ? 'border-[#6c2eb9] dark:border-[#a875ec] ring-2 ring-[#6c2eb9]/25 bg-[#f6f0fb] dark:bg-[#1f1033] shadow-xs scale-[1.02]'
                  : isToday
                  ? 'border-[#b83280] dark:border-[#f472b6] bg-[#faeef5]/60 dark:bg-[#2b1424]/60 ring-1 ring-[#b83280]/40'
                  : metGoal
                  ? 'border-amber-400 dark:border-amber-500 bg-amber-500/10 dark:bg-amber-950/20 shadow-xs hover:border-amber-500'
                  : hasWords
                  ? 'border-[#ebdff2] dark:border-[#2d1b42] bg-[#fbf8fe] dark:bg-[#1a0e2a] hover:border-[#6c2eb9]'
                  : 'border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] hover:bg-[#faf7fd] dark:hover:bg-[#1f1033]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full tabular-nums ${
                    isToday
                      ? 'bg-[#b83280] text-white'
                      : metGoal
                      ? 'bg-amber-500 text-white font-bold'
                      : hasWords
                      ? 'text-[#220d3a] dark:text-[#f7f2fc] font-bold'
                      : 'text-[#8870a0] dark:text-[#9782ad]'
                  }`}
                >
                  {dayNum}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {metGoal && (
                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                  )}
                  {hasWords && !metGoal && (
                    <span className="w-2 h-2 rounded-full bg-[#147d74] dark:bg-[#2dd4bf] shrink-0"></span>
                  )}
                </div>
              </div>

              {hasWords ? (
                <div className="mt-1">
                  <span className={`inline-block text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md tabular-nums border ${
                    metGoal
                      ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900'
                      : 'text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#122e2b] border-[#cbebe7] dark:border-[#1d3d3a]'
                  }`}>
                    +{new Intl.NumberFormat('pt-BR').format(dayWords)}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-[#8870a0]/30 dark:text-[#9782ad]/30 sm:block hidden">—</span>
              )}
            </button>
          );
        })}
          </div>
        </div>
      </div>

      {/* Day Details Drawer */}
      {selectedDayKey && (
        <div className="mt-6 p-4 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42] animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
              <h4 className="font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc]">
                Sessões em {selectedDayKey.split('-').reverse().join('/')}
              </h4>
            </div>
            <span className="text-xs font-bold text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#122e2b] px-2.5 py-1 rounded-lg border border-[#cbebe7] dark:border-[#1d3d3a] tabular-nums">
              Total do dia: {new Intl.NumberFormat('pt-BR').format(selectedDayTotal)} palavras
            </span>
          </div>

          {selectedSessions.length === 0 ? (
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] py-2">
              Nenhuma sessão de escrita registrada nesta data. Use o campo acima para registrar!
            </p>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map((s) => {
                const book = books.find((b) => b.id === s.bookId);
                return (
                  <div
                    key={s.id}
                    className="p-3 bg-white dark:bg-[#160b24] rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                        {book ? book.title : 'Livro sem título'}
                      </span>
                      {s.notes && (
                        <p className="text-[#5c4672] dark:text-[#c4b3d8] text-[11px] mt-0.5 italic">“{s.notes}”</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {s.durationMinutes && s.durationMinutes > 0 && (
                        <span className="flex items-center gap-1 text-[#5c4672] dark:text-[#c4b3d8] font-medium tabular-nums">
                          <Clock className="w-3 h-3 text-[#6c2eb9] dark:text-[#a875ec]" />
                          <span>{s.durationMinutes} min</span>
                        </span>
                      )}
                      <span className="font-bold text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#122e2b] px-2 py-0.5 rounded-md border border-[#cbebe7] dark:border-[#1d3d3a] tabular-nums">
                        +{new Intl.NumberFormat('pt-BR').format(s.words)} pal.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
