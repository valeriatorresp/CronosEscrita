import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  CalendarPlus,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import type { ReminderSettings } from '../types';
import {
  requestBrowserNotificationPermission,
  sendBrowserNotification,
} from '../services/reminder';
import { createDailyWritingReminder } from '../services/calendar';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onSaveSettings: (settings: ReminderSettings) => void;
  wordsToday: number;
  googleToken: string | null;
  onConnectGoogle: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  wordsToday,
  googleToken,
  onConnectGoogle,
}) => {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [time, setTime] = useState(settings.time || '20:00');
  const [browserNotif, setBrowserNotif] = useState(settings.browserNotifications);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    settings.daysOfWeek && settings.daysOfWeek.length > 0
      ? settings.daysOfWeek
      : [0, 1, 2, 3, 4, 5, 6]
  );
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      setEnabled(settings.enabled);
      setTime(settings.time || '20:00');
      setBrowserNotif(settings.browserNotifications);
      setDaysOfWeek(
        settings.daysOfWeek && settings.daysOfWeek.length > 0
          ? settings.daysOfWeek
          : [0, 1, 2, 3, 4, 5, 6]
      );
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, settings, onClose]);

  const WEEK_DAYS = [
    { day: 1, label: 'Seg', full: 'Segunda-feira' },
    { day: 2, label: 'Ter', full: 'Terça-feira' },
    { day: 3, label: 'Qua', full: 'Quarta-feira' },
    { day: 4, label: 'Qui', full: 'Quinta-feira' },
    { day: 5, label: 'Sex', full: 'Sexta-feira' },
    { day: 6, label: 'Sáb', full: 'Sábado' },
    { day: 0, label: 'Dom', full: 'Domingo' },
  ];

  const handleToggleDay = (day: number) => {
    setDaysOfWeek((prev) => {
      if (prev.includes(day)) {
        // Evita desmarcar todos os dias (mínimo de 1 dia)
        if (prev.length <= 1) {
          setFeedback({
            type: 'error',
            message: 'Selecione pelo menos um dia da semana para o lembrete.',
          });
          setTimeout(() => setFeedback(null), 3000);
          return prev;
        }
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleSelectAllDays = () => {
    setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSelectWeekdaysOnly = () => {
    setDaysOfWeek([1, 2, 3, 4, 5]); // Seg a Sex
  };

  const handleSelectWeekendOnly = () => {
    setDaysOfWeek([6, 0]); // Sáb e Dom
  };

  if (!isOpen) return null;

  const handleToggleBrowserNotif = async () => {
    if (!browserNotif) {
      const granted = await requestBrowserNotificationPermission();
      if (granted) {
        setBrowserNotif(true);
        setFeedback({
          type: 'success',
          message: 'Permissão concedida! As notificações do navegador estão ativas.',
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: 'Permissão de notificação negada no navegador.',
        });
        setTimeout(() => setFeedback(null), 4000);
      }
    } else {
      setBrowserNotif(false);
    }
  };

  const handleTestNotification = () => {
    sendBrowserNotification(
      '✍️ Hora de Escrever no CronosEscrita!',
      'Você ainda não registrou suas palavras de hoje. Reserve 20 minutos de foco para avançar na sua história.'
    );
    setFeedback({
      type: 'success',
      message: 'Notificação de teste disparada!',
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSyncToGoogleCalendar = async () => {
    if (!googleToken) {
      onConnectGoogle();
      return;
    }

    try {
      setIsSyncingCalendar(true);
      await createDailyWritingReminder(googleToken, 50000, time, daysOfWeek);
      setFeedback({
        type: 'success',
        message: `Lembrete recorrente às ${time} agendado no seu Google Calendar para os dias escolhidos!`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao agendar no Google Calendar';
      setFeedback({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleSave = () => {
    const updated: ReminderSettings = {
      ...settings,
      enabled,
      time,
      browserNotifications: browserNotif,
      daysOfWeek,
    };
    onSaveSettings(updated);
    setFeedback({
      type: 'success',
      message: 'Configurações de lembrete salvas com sucesso!',
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0f0717]/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#160b24] rounded-3xl shadow-2xl border border-[#ebdff2] dark:border-[#2d1b42] overflow-hidden transition-colors duration-300 my-auto">
        {/* Header Banner */}
        <div className="shrink-0 bg-[#1b0e2e] dark:bg-[#140922] border-b border-[#3b235c]/70 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Voltar / Fechar (Esc)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
            <X className="w-3.5 h-3.5 opacity-70" />
          </button>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2dd4bf] font-bold mb-1">
            <Bell className="w-4 h-4 text-[#2dd4bf]" />
            <span>Hábitos & Disciplina de Escrita</span>
          </div>
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold">Lembretes Diários</h2>
          <p className="text-white/80 text-xs mt-1 max-w-md">
            Receba um aviso motivador caso não tenha registrado progresso até o horário escolhido.
          </p>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                feedback.type === 'success'
                  ? 'bg-[#e6f7f5] dark:bg-[#122e2b] text-[#147d74] dark:text-[#2dd4bf] border border-[#cbebe7] dark:border-[#1d3d3a]'
                  : 'bg-[#faeef5] dark:bg-[#2b1424] text-[#b83280] dark:text-[#f472b6] border border-[#f5d7e6] dark:border-[#3d192f]'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#b83280] dark:text-[#f472b6] shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Today's Status Banner */}
          <div className="p-4 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] block">
                Status de Hoje:
              </span>
              <span className="text-sm font-semibold text-[#5c4672] dark:text-[#c4b3d8] mt-0.5 block">
                {wordsToday > 0
                  ? `🎉 Parabéns! Você já escreveu ${new Intl.NumberFormat('pt-BR').format(
                      wordsToday
                    )} palavras hoje.`
                  : '⏳ Nenhuma palavra registrada ainda hoje.'}
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                wordsToday > 0
                  ? 'bg-[#e6f7f5] dark:bg-[#122e2b] text-[#147d74] dark:text-[#2dd4bf] border border-[#cbebe7] dark:border-[#1d3d3a]'
                  : 'bg-[#faeef5] dark:bg-[#2b1424] text-[#b83280] dark:text-[#f472b6] border border-[#f5d7e6] dark:border-[#3d192f]'
              }`}
            >
              {wordsToday > 0 ? 'Concluído' : 'Pendente'}
            </span>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24]">
            <div>
              <span className="font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc] block">
                Ativar Lembretes Diários
              </span>
              <span className="text-xs text-[#5c4672] dark:text-[#c4b3d8] block mt-0.5">
                Alerta no app e nos canais selecionados quando o horário chegar
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#ebdff2] dark:bg-[#2d1b42] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#ebdff2] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#147d74]"></div>
            </label>
          </div>

          {enabled && (
            <div className="space-y-4 animate-in fade-in">
              {/* Scheduled Time Input */}
              <div className="p-4 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1a0e2a]">
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
                  <span>Horário Limite Estipulado para Escrita</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="text-lg font-bold text-[#220d3a] dark:text-[#f7f2fc] px-4 py-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] focus:border-[#823bd8] outline-hidden"
                  />
                  <span className="text-xs text-[#5c4672] dark:text-[#c4b3d8]">
                    Se você não tiver escrito até as <strong>{time}</strong>, o lembrete será
                    ativado.
                  </span>
                </div>
              </div>

              {/* Dias da Semana Específicos */}
              <div className="p-4 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1a0e2a]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf]" />
                      <span>Dias Específicos da Semana</span>
                    </label>
                    <span className="text-[11px] text-[#5c4672] dark:text-[#c4b3d8] block mt-0.5">
                      Escolha em quais dias você quer ser lembrado
                    </span>
                  </div>

                  {/* Atalhos Rápidos */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSelectAllDays}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] transition-colors cursor-pointer"
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectWeekdaysOnly}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] transition-colors cursor-pointer"
                    >
                      Seg-Sex
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectWeekendOnly}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] transition-colors cursor-pointer"
                    >
                      Fins de Semana
                    </button>
                  </div>
                </div>

                {/* Seletor de Dias */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {WEEK_DAYS.map((w) => {
                    const isSelected = daysOfWeek.includes(w.day);
                    return (
                      <button
                        key={w.day}
                        type="button"
                        onClick={() => handleToggleDay(w.day)}
                        title={w.full}
                        className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 border ${
                          isSelected
                            ? 'bg-[#6c2eb9] text-white border-[#6c2eb9] shadow-xs'
                            : 'bg-white dark:bg-[#160b24] text-[#5c4672] dark:text-[#c4b3d8] border-[#ebdff2] dark:border-[#2d1b42] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
                        }`}
                      >
                        <span>{w.label}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            isSelected ? 'bg-[#2dd4bf]' : 'bg-transparent'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 text-[11px] text-[#5c4672] dark:text-[#c4b3d8] text-right">
                  {daysOfWeek.length === 7
                    ? '🔔 Notificações ativas todos os dias'
                    : daysOfWeek.length === 5 && !daysOfWeek.includes(0) && !daysOfWeek.includes(6)
                    ? '💼 Notificações de Segunda a Sexta'
                    : daysOfWeek.length === 2 && daysOfWeek.includes(0) && daysOfWeek.includes(6)
                    ? '☕ Notificações aos Sábados e Domingos'
                    : `✨ Notificações ativas em ${daysOfWeek.length} ${
                        daysOfWeek.length === 1 ? 'dia' : 'dias'
                      } da semana`}
                </div>
              </div>

              {/* Browser Notification Channel */}
              <div className="p-4 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1a0e2a] flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-[#b83280] dark:text-[#f472b6]" />
                    <span>Notificações do Navegador / Sistema</span>
                  </span>
                  <span className="text-[11px] text-[#5c4672] dark:text-[#c4b3d8] block mt-0.5">
                    Emite um aviso pop-up nativo mesmo que a aba esteja em segundo plano
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {browserNotif && (
                    <button
                      type="button"
                      onClick={handleTestNotification}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#6c2eb9] dark:text-[#a875ec] bg-[#f6f0fb] dark:bg-[#1f1033] rounded-lg hover:bg-white dark:hover:bg-[#2b1646] cursor-pointer"
                    >
                      Testar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleToggleBrowserNotif}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      browserNotif
                        ? 'bg-[#147d74] text-white'
                        : 'bg-[#f6f0fb] dark:bg-[#1f1033] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#2b1646] border border-[#ebdff2] dark:border-[#2d1b42]'
                    }`}
                  >
                    {browserNotif ? 'Ativado' : 'Ativar'}
                  </button>
                </div>
              </div>

              {/* Google Calendar Sync Channel */}
              <div className="p-4 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1a0e2a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#e11d48] dark:text-[#fb7185]" />
                    <span>Sincronizar no Google Calendar</span>
                  </span>
                  <span className="text-[11px] text-[#5c4672] dark:text-[#c4b3d8] block mt-0.5">
                    Cria um compromisso diário às {time} com alerta no seu celular e e-mail
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSyncToGoogleCalendar}
                  disabled={isSyncingCalendar}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm shadow-rose-500/25 active:scale-95 disabled:opacity-50"
                >
                  {isSyncingCalendar ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <CalendarPlus className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>{googleToken ? 'Agendar no Google Calendar' : 'Conectar Google Calendar'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer - Fixed at bottom */}
        <div className="shrink-0 p-4 sm:px-6 bg-[#faf7fd] dark:bg-[#1a0e2a] border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer transition-colors shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar / Cancelar</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] shadow-sm shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
