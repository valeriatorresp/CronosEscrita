import React, { useState, useEffect } from 'react';
import {
  PenLine,
  Calendar,
  Clock,
  FileText,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import type { Project, Book, WritingSession } from '../types';
import { createCalendarWritingEvent } from '../services/calendar';
import confetti from 'canvas-confetti';

interface QuickLogSectionProps {
  projects: Project[];
  books: Book[];
  onAddSession: (sessionData: Omit<WritingSession, 'id' | 'createdAt'>) => void;
  onNavigateToBible: () => void;
  googleToken: string | null;
  totalWords: number;
}

export const QuickLogSection: React.FC<QuickLogSectionProps> = ({
  projects,
  books,
  onAddSession,
  onNavigateToBible,
  googleToken,
  totalWords,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [selectedBookId, setSelectedBookId] = useState<string>(
    books.find((b) => b.projectId === projects[0]?.id)?.id || books[0]?.id || ''
  );
  const [wordsCount, setWordsCount] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [syncToCalendar, setSyncToCalendar] = useState<boolean>(!!googleToken);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  // Keep project selection synced when projects change or are loaded
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Keep book selection synced when books or selected project changes
  useEffect(() => {
    if (books.length > 0) {
      const isCurrentValid = books.some((b) => b.id === selectedBookId);
      if (!isCurrentValid) {
        const match = books.find((b) => !selectedProjectId || b.projectId === selectedProjectId) || books[0];
        setSelectedBookId(match.id);
        if (match.projectId && match.projectId !== selectedProjectId) {
          setSelectedProjectId(match.projectId);
        }
      }
    }
  }, [books, selectedProjectId, selectedBookId]);

  // Available books for selected project
  const availableBooks = books.filter((b) => !selectedProjectId || b.projectId === selectedProjectId);

  const handleProjectChange = (pId: string) => {
    setSelectedProjectId(pId);
    const firstBook = books.find((b) => b.projectId === pId);
    setSelectedBookId(firstBook?.id || '');
  };

  const currentBook = books.find((b) => b.id === selectedBookId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const words = parseInt(wordsCount, 10);
    if (isNaN(words) || words <= 0) {
      setFeedback({ type: 'error', message: 'Por favor, informe uma contagem válida de palavras.' });
      return;
    }

    if (!selectedProjectId || !selectedBookId) {
      setFeedback({
        type: 'error',
        message: 'Cadastre ou selecione um projeto e um livro no Manual do Livro antes de registrar.',
      });
      return;
    }

    try {
      setSubmitting(true);
      const duration = durationMinutes ? parseInt(durationMinutes, 10) : undefined;

      // 1. Add session locally
      onAddSession({
        projectId: selectedProjectId,
        bookId: selectedBookId,
        words,
        date: sessionDate,
        durationMinutes: duration,
        notes: notes.trim() || undefined,
        source: 'manual',
      });

      // 2. Sync to Google Calendar if selected & token exists
      let calendarMsg = '';
      if (syncToCalendar && googleToken && currentBook) {
        try {
          await createCalendarWritingEvent(googleToken, {
            title: `Escrita: ${currentBook.title}`,
            bookTitle: currentBook.title,
            words,
            date: sessionDate,
            durationMinutes: duration,
            notes: notes.trim() || undefined,
          });
          calendarMsg = ' e sincronizado no Google Calendar!';
        } catch (calErr) {
          console.warn('Google Calendar sync warning:', calErr);
          calendarMsg = ' (mas houve uma falha ao adicionar no Google Calendar).';
        }
      }

      if (words >= 500) {
        try {
          confetti({
            particleCount: 80,
            spread: 65,
            origin: { y: 0.5 },
            colors: ['#6c2eb9', '#b83280', '#147d74', '#2dd4bf', '#f59e0b'],
          });
        } catch {
          // ignore
        }
      }

      setFeedback({
        type: 'success',
        message: `🎉 Fantástico! +${new Intl.NumberFormat('pt-BR').format(
          words
        )} palavras registradas com sucesso${calendarMsg}`,
      });

      // Reset form fields
      setWordsCount('');
      setDurationMinutes('');
      setNotes('');

      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao registrar a sessão.' });
    } finally {
      setSubmitting(false);
    }
  };

  const parsedWords = parseInt(wordsCount, 10) || 0;

  return (
    <div id="quick-log-section" className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm relative overflow-hidden transition-colors duration-300">
      {/* Decorative soft glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#b83280]/8 dark:from-[#b83280]/12 to-transparent blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] text-[#6c2eb9] dark:text-[#a875ec]">
              <PenLine className="w-5 h-5" />
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
              Registrar Sessão de Escrita
            </h3>
          </div>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
            Registre sua contagem diária ou sprint recente. O progresso do seu projeto é atualizado imediatamente.
          </p>
        </div>

        {books.length === 0 && (
          <button
            type="button"
            onClick={onNavigateToBible}
            className="flex items-center gap-2 px-4 py-2 bg-[#6c2eb9] hover:bg-[#5b24a0] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Livro no Manual</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`mt-4 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-[#e6f7f5] dark:bg-[#122e2b] border border-[#cbebe7] dark:border-[#1d3d3a] text-[#147d74] dark:text-[#2dd4bf]'
              : 'bg-[#faeef5] dark:bg-[#2b1424] border border-[#f5d7e6] dark:border-[#3d192f] text-[#b83280] dark:text-[#f472b6]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#147d74] dark:text-[#2dd4bf]" />
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Words input - Highlighted */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1.5 flex items-center justify-between">
              <span>Palavras Escritas *</span>
              <span className="text-[10px] text-[#b83280] dark:text-[#f472b6] font-bold uppercase tracking-wider">Destaque</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={wordsCount}
                onChange={(e) => setWordsCount(e.target.value)}
                placeholder="Ex: 1667"
                className="w-full text-lg font-bold text-[#220d3a] dark:text-[#f7f2fc] px-4 py-3 rounded-2xl border-2 border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#1f1033] focus:border-[#823bd8] outline-hidden transition-all tabular-nums"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-[#8870a0] dark:text-[#9782ad] font-semibold">
                palavras
              </span>
            </div>
          </div>

          {/* Project selector */}
          <div>
            <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1.5">
              Projeto
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full text-sm text-[#220d3a] dark:text-[#f7f2fc] px-4 py-3 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#1f1033] focus:border-[#823bd8] outline-hidden transition-all"
            >
              {projects.length === 0 ? (
                <option value="">Nenhum projeto cadastrado</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-[#1f1033]">
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Book selector */}
          <div>
            <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1.5 flex items-center justify-between">
              <span>Livro</span>
              {currentBook && (
                <span className="text-[10px] text-[#147d74] dark:text-[#2dd4bf] font-semibold truncate max-w-[100px]">
                  {currentBook.genre}
                </span>
              )}
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full text-sm text-[#220d3a] dark:text-[#f7f2fc] px-4 py-3 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#1f1033] focus:border-[#823bd8] outline-hidden transition-all"
            >
              {availableBooks.length === 0 ? (
                <option value="">Nenhum livro disponível</option>
              ) : (
                availableBooks.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-[#1f1033]">
                    {b.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Session Date */}
          <div>
            <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
              <span>Data da Sessão</span>
            </label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full text-sm text-[#220d3a] dark:text-[#f7f2fc] px-4 py-3 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#1f1033] focus:border-[#823bd8] outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Secondary options row: Duration & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
              <span>Duração em Minutos (opcional)</span>
            </label>
            <input
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="Ex: 45 min"
              className="w-full text-sm text-[#220d3a] dark:text-[#f7f2fc] px-4 py-3 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#1f1033] focus:border-[#823bd8] outline-hidden transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
              <span>Observações / Trecho escrito (opcional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Capítulo 4 concluído; revelação do amuleto arcano."
              className="w-full text-sm text-[#220d3a] dark:text-[#f7f2fc] px-4 py-3 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#1f1033] focus:border-[#823bd8] outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Bottom bar with Live Preview & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#ebdff2] dark:border-[#2d1b42]">
          <div className="flex items-center gap-4 text-xs">
            <div className="bg-[#f6f0fb] dark:bg-[#1f1033] px-3.5 py-1.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42]">
              <span className="text-[#6c2eb9] dark:text-[#a875ec] block text-[10px] uppercase font-bold">Nesta sessão</span>
              <strong className="text-sm text-[#220d3a] dark:text-[#f7f2fc] font-bold tabular-nums">
                +{new Intl.NumberFormat('pt-BR').format(parsedWords)}
              </strong>
            </div>

            <div className="bg-[#e6f7f5] dark:bg-[#122e2b] px-3.5 py-1.5 rounded-xl border border-[#cbebe7] dark:border-[#1d3d3a]">
              <span className="text-[#147d74] dark:text-[#2dd4bf] block text-[10px] uppercase font-bold">Novo Total Geral</span>
              <strong className="text-sm text-[#147d74] dark:text-[#2dd4bf] font-bold tabular-nums">
                {new Intl.NumberFormat('pt-BR').format(totalWords + parsedWords)}
              </strong>
            </div>

            {googleToken && (
              <label className="hidden lg:flex items-center gap-2 cursor-pointer select-none text-[#5c4672] dark:text-[#c4b3d8] font-medium">
                <input
                  type="checkbox"
                  checked={syncToCalendar}
                  onChange={(e) => setSyncToCalendar(e.target.checked)}
                  className="rounded border-[#ebdff2] text-[#147d74] focus:ring-[#147d74] w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1 text-[11px] text-[#147d74] dark:text-[#2dd4bf] font-semibold">
                  <CalendarCheck className="w-3.5 h-3.5 text-[#147d74] dark:text-[#2dd4bf]" />
                  Sincronizar com Google Agenda
                </span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white font-semibold text-sm shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
            <span>{submitting ? 'Salvando...' : 'Registrar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
