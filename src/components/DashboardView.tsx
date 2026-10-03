import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Edit3,
  Check,
  Maximize2,
  ArrowRight,
  BookOpen,
  PartyPopper,
  ShieldCheck,
  Award,
  X,
  Heart,
  ArrowLeft,
  Megaphone,
  Plus,
  Trash2,
  Feather,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { WritingSession, Project, Book, Badge } from '../types';
import { getTodayDateString } from '../services/storage';
import { checkSevenDaysWithoutBadges } from '../data/badges';
import { WritingChart } from './WritingChart';
import { SevenDayRechartsChart } from './SevenDayRechartsChart';
import { QuickLogSection } from './QuickLogSection';
import { MonthlyCalendar } from './MonthlyCalendar';
import { BadgesMiniPreview } from './BadgesMiniPreview';
import { SessionHistory } from './SessionHistory';
import { ReminderBanner } from './ReminderBanner';
import { GoldenStatsCard } from './GoldenStatsCard';
import { SmartDeadlineForecast } from './SmartDeadlineForecast';
import { PlotIdeasModal } from './PlotIdeasModal';
import type { ReminderSettings } from '../types';

interface DashboardViewProps {
  goal: number;
  onUpdateGoal: (newGoal: number) => void;
  dailyGoal: number;
  onUpdateDailyGoal: (newDailyGoal: number) => void;
  challengeDays: number;
  startDate: string;
  sessions: WritingSession[];
  projects: Project[];
  books: Book[];
  badges: Badge[];
  hasGoogleToken: boolean;
  googleToken: string | null;
  onConnectGoogle: () => void;
  onAddSession: (sessionData: Omit<WritingSession, 'id' | 'createdAt'>) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSession: (session: WritingSession) => void;
  onNavigateToBible: () => void;
  onNavigateToGame: () => void;
  onNavigateToBadges: () => void;
  isDarkMode: boolean;
  reminderSettings: ReminderSettings;
  isReminderPending: boolean;
  reminderDismissed: boolean;
  onDismissReminder: () => void;
  onOpenReminderSettings: () => void;
  onOpenImmersive?: () => void;
  onStartWritingWithPrompt?: (promptText: string, bookId?: string) => void;
  hasPostedToday?: boolean;
  onNavigateToMarketing?: () => void;
  onOpenStoryModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  goal,
  onUpdateGoal,
  dailyGoal,
  onUpdateDailyGoal,
  challengeDays,
  startDate,
  sessions,
  projects,
  books,
  badges,
  hasGoogleToken,
  googleToken,
  onConnectGoogle,
  onAddSession,
  onDeleteSession,
  onUpdateSession,
  onNavigateToBible,
  onNavigateToGame,
  onNavigateToBadges,
  isDarkMode,
  reminderSettings,
  isReminderPending,
  reminderDismissed,
  onDismissReminder,
  onOpenReminderSettings,
  onOpenImmersive,
  onStartWritingWithPrompt,
  hasPostedToday = false,
  onNavigateToMarketing,
  onOpenStoryModal,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);
  const [isEditingDailyGoal, setIsEditingDailyGoal] = useState(false);
  const [tempDailyGoal, setTempDailyGoal] = useState(dailyGoal);
  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);
  const [showConstancyModal, setShowConstancyModal] = useState(false);
  const [showPlotIdeasModal, setShowPlotIdeasModal] = useState(false);

  const [dismissedMarketingNotice, setDismissedMarketingNotice] = useState(() => {
    try {
      const saved = localStorage.getItem('cronos_home_marketing_dismissed_time');
      if (saved) {
        const diff = Date.now() - parseInt(saved, 10);
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        if (diff < ONE_DAY_MS) {
          return true; // Keep it dismissed if dismissed in last 24 hours
        }
      }
    } catch {}
    return false;
  });

  const handleDismissMarketingNotice = () => {
    setDismissedMarketingNotice(true);
    try {
      localStorage.setItem('cronos_home_marketing_dismissed_time', String(Date.now()));
    } catch {}
  };

  // STATES FOR METAS DE LONGO PRAZO
  const [longTermGoals, setLongTermGoals] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cronos_long_term_goals');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const [isAddingLTGoal, setIsAddingLTGoal] = useState(false);
  const [ltTitle, setLtTitle] = useState('');
  const [ltTarget, setLtTarget] = useState(20000);
  const [ltDeadline, setLtDeadline] = useState('');

  const saveLongTermGoals = (newGoals: any[]) => {
    setLongTermGoals(newGoals);
    try {
      localStorage.setItem('cronos_long_term_goals', JSON.stringify(newGoals));
    } catch {}
  };

  const handleAddLTGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ltTitle.trim() || ltTarget <= 0) return;

    const newGoal = {
      id: `lt_${Date.now()}`,
      title: ltTitle.trim(),
      targetWords: Number(ltTarget),
      deadline: ltDeadline.trim() || 'Sem prazo',
      createdAt: new Date().toISOString(),
    };

    const updated = [...longTermGoals, newGoal];
    saveLongTermGoals(updated);
    
    // Reset form fields
    setLtTitle('');
    setLtTarget(20000);
    setLtDeadline('');
    setIsAddingLTGoal(false);
    triggerHomeConfetti(0.4);
  };

  const handleDeleteLTGoal = (id: string) => {
    const updated = longTermGoals.filter(g => g.id !== id);
    saveLongTermGoals(updated);
  };

  // Calculations
  const totalWords = sessions.reduce((sum, s) => sum + s.words, 0);
  const remainingWords = Math.max(0, goal - totalWords);
  const progressPct = Math.min(100, Math.round((totalWords / goal) * 100));

  const todayStr = getTodayDateString();
  const wordsToday = sessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.words, 0);
  const dailyProgressPct = Math.min(100, Math.round((wordsToday / dailyGoal) * 100));
  const remainingToday = Math.max(0, dailyGoal - wordsToday);
  const isDailyGoalReached = wordsToday >= dailyGoal;

  const handleSaveDailyGoal = (val: number) => {
    if (val > 0) {
      onUpdateDailyGoal(val);
      setIsEditingDailyGoal(false);
      if (val <= wordsToday) {
        triggerHomeConfetti(0.5);
      }
    }
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  const idealDailyPace = Math.ceil(goal / (challengeDays || 30));

  // Badge notices calculation
  const unlockedBadges = badges.filter((b) => !!b.unlockedAt);
  const latestUnlockedBadge = unlockedBadges.length > 0 ? unlockedBadges[unlockedBadges.length - 1] : null;
  const constancyInfo = checkSevenDaysWithoutBadges(badges, sessions);

  const triggerHomeConfetti = (originY = 0.5) => {
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: originY },
        colors: ['#823bd8', '#a875ec', '#6c2eb9', '#b83280', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  };

  const handleOpenConstancyCelebration = () => {
    triggerHomeConfetti(0.4);
    setShowConstancyModal(true);
  };

  const handleSaveGoal = () => {
    if (tempGoal && tempGoal > 0) {
      onUpdateGoal(tempGoal);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Reminder Alert Banner if pending and not dismissed */}
      {isReminderPending && !reminderDismissed && (
        <ReminderBanner
          scheduledTime={reminderSettings.time}
          onWriteNow={() => {
            const el = document.getElementById('quick-log-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOpenGame={onNavigateToGame}
          onOpenSettings={onOpenReminderSettings}
          onDismiss={onDismissReminder}
        />
      )}

      {/* Persistente Aviso de Marketing/Postagem Literária no Topo da Home */}
      {!hasPostedToday && !dismissedMarketingNotice && (
        <div className="relative rounded-3xl p-5 bg-gradient-to-r from-amber-500/10 via-rose-500/15 to-purple-600/10 border-2 border-rose-500/40 shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10 sm:pr-12">
          {/* Close button inside floating alert banner */}
          <button
            type="button"
            onClick={handleDismissMarketingNotice}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-rose-500/10 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
            title="Fechar / Dispensar por 24h"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-1 min-w-0">
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-2xl text-white shrink-0 shadow-md self-start sm:self-auto">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                Lembrete de Social Media 📢
              </span>
              <h4 className="font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc] mt-0.5">
                Mídias Sociais Inativas Hoje!
              </h4>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed mt-0.5">
                Sua marca literária precisa de constância! Siga a sugestão do seu Calendário Editorial de hoje para engajar leitores e expandir sua audiência.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleDismissMarketingNotice}
              className="px-3.5 py-2 text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#6c2eb9]/5 rounded-xl transition-all cursor-pointer"
            >
              Dispensar por 24h
            </button>
            <button
              type="button"
              onClick={onNavigateToMarketing}
              className="px-4 py-2 bg-gradient-to-r from-[#b83280] to-[#6c2eb9] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>✍️ Postar Agora</span>
            </button>
          </div>
        </div>
      )}

      {/* AVISO NA HOME: Conquista Desbloqueada */}
      {latestUnlockedBadge && dismissedNotice !== 'badge' && (
        <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#1b0e2e] via-[#2a133d] to-[#1b0e2e] text-white border-2 border-[#b83280]/60 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-3">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#b83280]/20 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b83280] to-[#6c2eb9] p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#1b0e2e] flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#f472b6] animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#b83280]/20 text-[#f472b6] border border-[#b83280]/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Conquista Desbloqueada!</span>
                  </span>
                  <span className="text-xs font-semibold text-[#2dd4bf]">
                    Nível: {latestUnlockedBadge.level === 'mediano' ? 'Escritor em Ascensão' : latestUnlockedBadge.levelName || 'Escritor'}
                  </span>
                </div>
                <h3 className="font-serif-display text-lg sm:text-xl font-bold text-white mt-1">
                  {latestUnlockedBadge.title} · “{latestUnlockedBadge.funRankName}”
                </h3>
                <p className="text-xs text-[#f7f2fc]/80 mt-1 max-w-2xl leading-relaxed">
                  {latestUnlockedBadge.celebrationSuggestion || latestUnlockedBadge.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => triggerHomeConfetti(0.4)}
                className="px-4 py-2 rounded-xl bg-[#b83280] hover:bg-[#a0286e] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PartyPopper className="w-3.5 h-3.5 text-[#2dd4bf]" />
                <span>Celebrar!</span>
              </button>
              <button
                onClick={onNavigateToBadges}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Ver no Mural</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2dd4bf]" />
              </button>
              <button
                onClick={() => setDismissedNotice('badge')}
                title="Dispensar aviso"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AVISO NA HOME: 7 Dias sem Conquistas / Microcelebração de Constância */}
      {constancyInfo.eligible && dismissedNotice !== 'constancy' && (
        <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#1c0a2e] via-[#2d114c] to-[#1c0a2e] text-white border-2 border-[#823bd8]/80 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-3">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#a875ec]/20 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#823bd8] to-[#a875ec] p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#1a0e2e] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#a875ec] animate-bounce" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#a875ec]/20 text-[#a875ec] border border-[#a875ec]/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Microcelebração de Constância</span>
                  </span>
                  <span className="text-xs font-semibold text-[#f472b6]">
                    🌿 7 Dias Escrevendo com Foco Silencioso
                  </span>
                </div>
                <h3 className="font-serif-display text-lg sm:text-xl font-bold text-white mt-1">
                  Nem tudo é troféu: sua constância silenciosa merece brinde!
                </h3>
                <p className="text-xs text-[#f7f2fc]/80 mt-1 max-w-2xl leading-relaxed">
                  Você está criando o hábito sagrado dos grandes autores. Mesmo sem medalhas visíveis nos últimos 7 dias, cada linha rascunhada é uma vitória real. Resgate sua microcelebração agora!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={handleOpenConstancyCelebration}
                className="px-4 py-2 rounded-xl bg-[#823bd8] hover:bg-[#6c2eb9] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-[#a875ec]/40"
              >
                <PartyPopper className="w-3.5 h-3.5 text-[#a875ec]" />
                <span>Resgatar Microcelebração</span>
              </button>
              <button
                onClick={onNavigateToBadges}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Ver Conquistas</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#a875ec]" />
              </button>
              <button
                onClick={() => setDismissedNotice('constancy')}
                title="Dispensar aviso"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Progress Banner */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-10 shadow-lg bg-gradient-to-br from-[#120a1f] via-[#1a0f2b] to-[#120721] dark:from-[#0f071a] dark:to-[#0a0413] border border-[#ebdff2]/20 dark:border-[#2d1b42] text-white">
        {/* Glow Circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#823bd8]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#b83280]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-400/40 text-xs font-bold tracking-wider uppercase text-[#c084fc] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
                <span>CronosEstúdio · Rotina & Metas Diárias de Escrita</span>
              </div>
              <h1 className="font-serif-display text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                CronosEscrita -{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#e879f9]">
                  Ritmo & Metas de Escrita
                </span>{' '}
                🎯
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
                Cada palavra aproxima suas ideias da versão final — seja livro, artigo, ensaio ou projeto autoral. Acompanhe a curva do seu progresso, mantenha o foco diário e celebre cada marco concluído.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                {onOpenImmersive && (
                  <button
                    onClick={onOpenImmersive}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-purple-300" />
                    <span>Escrever em Modo Imersivo</span>
                  </button>
                )}

                <button
                  onClick={() => setShowPlotIdeasModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#6c2eb9] to-[#823bd8] hover:from-[#5b24a0] hover:to-[#732ec7] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gerar Ideias de Enredo (IA)</span>
                </button>
              </div>
            </div>

            {/* Big Numbers & Goal Setter */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shrink-0 flex flex-col sm:flex-row items-center gap-6 shadow-lg min-w-[260px]">
              <div className="text-center sm:text-right">
                <span className="text-xs uppercase tracking-wider text-[#f472b6] font-bold block">
                  Total Acumulado
                </span>
                <span className="font-serif-display text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
                  {new Intl.NumberFormat('pt-BR').format(totalWords)}
                </span>
                <span className="text-xs text-white/70 block mt-0.5">palavras escritas</span>
              </div>

              <div className="h-12 w-px bg-white/20 hidden sm:block" />

              <div className="text-center sm:text-left">
                <span className="text-xs uppercase tracking-wider text-[#2dd4bf] font-bold block flex items-center justify-center sm:justify-start gap-1">
                  <span>Meta Final</span>
                  <button
                    onClick={() => {
                      setTempGoal(goal);
                      setIsEditingGoal(!isEditingGoal);
                    }}
                    title="Ajustar meta"
                    className="p-1 hover:text-white text-[#2dd4bf] cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </span>

                {isEditingGoal ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      value={tempGoal}
                      onChange={(e) => setTempGoal(Number(e.target.value))}
                      className="w-24 text-sm font-bold bg-white text-[#220d3a] px-2 py-1 rounded-lg border border-white/30"
                    />
                    <button
                      onClick={handleSaveGoal}
                      className="p-1.5 bg-[#147d74] hover:bg-[#0f635c] rounded-lg text-white font-bold cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="font-serif-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                    {new Intl.NumberFormat('pt-BR').format(goal)}
                  </span>
                )}
                <span className="text-xs text-white/70 block mt-0.5">meta de escrita</span>
              </div>
            </div>
          </div>

          {/* Prominent Progress Bar in Highlight */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-3">
              <span className="flex items-center gap-2 text-[#2dd4bf]">
                <Target className="w-4 h-4 text-[#2dd4bf]" />
                <span>Progresso Global da Obra</span>
              </span>
              <span className="text-[#f472b6] font-semibold text-xs tabular-nums">
                {progressPct}% Concluído
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-black/30 p-0.5 backdrop-blur-md shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                style={{
                  width: `${progressPct}%`,
                  background:
                    'linear-gradient(90deg, #6c2eb9 0%, #823bd8 50%, #b83280 100%)',
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white/80 mt-2 font-medium">
              <span>{remainingWords > 0 ? `${new Intl.NumberFormat('pt-BR').format(remainingWords)} palavras para o objetivo` : '🎉 Meta Total Conquistada!'}</span>
              <span>Ciclo: {challengeDays} dias</span>
            </div>
          </div>

          {/* Quick Metrics Bar (4 chips row) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Produção Total</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {new Intl.NumberFormat('pt-BR').format(totalWords)} pals.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Meta da Obra</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {new Intl.NumberFormat('pt-BR').format(goal)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Projetos Ativos</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {projects.length} obras
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Rotina Contínua</span>
                <span className="text-base font-bold text-emerald-400">
                  {challengeDays} dias
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seletor Visual de Meta Diária de Escrita Personalizada */}
      <section className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-[#faf7fd] to-[#f6f0fb] dark:from-[#160b24] dark:via-[#190d29] dark:to-[#12081d] border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#db2777] via-[#ec4899] to-[#f43f5e] p-0.5 shadow-md shadow-pink-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#240b1c] dark:bg-[#1a0815] flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#f472b6] dark:text-[#fb7185] animate-pulse fill-[#ec4899]/30 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#823bd8]/15 text-[#823bd8] dark:text-[#a875ec] border border-[#823bd8]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Meta Diária Personalizada</span>
                </span>
                {isDailyGoalReached && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Meta de Hoje Batida!</span>
                  </span>
                )}
              </div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1">
                Progresso de Hoje: {new Intl.NumberFormat('pt-BR').format(wordsToday)} / {new Intl.NumberFormat('pt-BR').format(dailyGoal)} palavras
              </h2>
              <p className="text-xs sm:text-sm text-[#5c4672] dark:text-[#c4b3d8] mt-1 max-w-xl leading-relaxed">
                {isDailyGoalReached
                  ? '🎉 Parabéns! Você atingiu sua meta diária de escrita hoje. Cada palavra extra é puro bônus criativo!'
                  : `Faltam ${new Intl.NumberFormat('pt-BR').format(remainingToday)} palavras para concluir sua meta de hoje. Mantenha o ritmo!`}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            {isEditingDailyGoal ? (
              <div className="flex items-center gap-2 bg-[#f6f0fb] dark:bg-[#1f1033] p-2 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42]">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={tempDailyGoal}
                  onChange={(e) => setTempDailyGoal(Number(e.target.value))}
                  className="w-28 text-sm font-bold bg-white dark:bg-[#140922] text-[#220d3a] dark:text-[#f7f2fc] px-3 py-1.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] focus:outline-none focus:ring-2 focus:ring-[#823bd8]"
                  placeholder="Ex: 1000"
                />
                <button
                  onClick={() => handleSaveDailyGoal(tempDailyGoal)}
                  className="px-3 py-1.5 bg-[#823bd8] hover:bg-[#6c2eb9] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
                <button
                  onClick={() => setIsEditingDailyGoal(false)}
                  className="px-2 py-1.5 text-xs text-[#5c4672] dark:text-[#c4b3d8] hover:text-[#220d3a] dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#5c4672]/70 dark:text-[#c4b3d8]/70 block font-bold">
                    Alvo Diário Atual
                  </span>
                  <span className="font-serif-display text-2xl font-bold text-[#823bd8] dark:text-[#a875ec] tabular-nums">
                    {new Intl.NumberFormat('pt-BR').format(dailyGoal)} <span className="text-xs font-sans font-normal text-[#5c4672] dark:text-[#c4b3d8]">palavras</span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTempDailyGoal(dailyGoal);
                    setIsEditingDailyGoal(true);
                  }}
                  className="p-2.5 rounded-xl bg-[#823bd8]/10 hover:bg-[#823bd8]/20 text-[#823bd8] dark:text-[#a875ec] transition-all cursor-pointer border border-[#823bd8]/20"
                  title="Ajustar meta diária"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Progress Bar */}
        <div className="mt-6 pt-5 border-t border-[#ebdff2] dark:border-[#2d1b42]">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[#5c4672] dark:text-[#c4b3d8] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#823bd8]" />
              <span>Progresso em Tempo Real (Hoje)</span>
            </span>
            <span className="text-[#823bd8] dark:text-[#a875ec] tabular-nums">
              {dailyProgressPct}% Concluído
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#ebdff2] dark:bg-[#2d1b42] p-0.5 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
              style={{
                width: `${dailyProgressPct}%`,
                background: isDailyGoalReached
                  ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(90deg, #823bd8 0%, #b83280 100%)',
              }}
            />
          </div>
        </div>

        {/* Preset Selector Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] mr-2">Metas Rápidas:</span>
          {[500, 1000, 1500, 2000, 3000].map((preset) => {
            const isSelected = dailyGoal === preset;
            return (
              <button
                key={preset}
                onClick={() => {
                  onUpdateDailyGoal(preset);
                  if (wordsToday >= preset) {
                    triggerHomeConfetti(0.5);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#823bd8] text-white border-[#823bd8] shadow-xs scale-105'
                    : 'bg-white dark:bg-[#140922] text-[#5c4672] dark:text-[#c4b3d8] border-[#ebdff2] dark:border-[#2d1b42] hover:border-[#823bd8]/50'
                }`}
              >
                {new Intl.NumberFormat('pt-BR').format(preset)} palavras
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick Log Input Section - Diretamente abaixo do dashboard inicial */}
      <QuickLogSection
        projects={projects}
        books={books}
        onAddSession={onAddSession}
        onNavigateToBible={onNavigateToBible}
        googleToken={googleToken}
        totalWords={totalWords}
      />

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Palavras Escritas */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#f6f0fb] dark:bg-[#1f1033] text-[#6c2eb9] dark:text-[#a875ec] flex items-center justify-center mb-3 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#6c2eb9] dark:text-[#a875ec] uppercase tracking-wider block">
            Palavras Escritas
          </span>
          <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1 block tabular-nums">
            {new Intl.NumberFormat('pt-BR').format(totalWords)}
          </span>
          <span className="text-[11px] text-[#5c4672]/70 dark:text-[#c4b3d8]/70 font-semibold mt-1 block">
            {sessions.length === 1 ? '1 sessão registrada' : `${sessions.length} sessões registradas`}
          </span>
        </div>

        {/* Card 2: Restantes */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#160b24] border border-[#f5d7e6] dark:border-[#3d192f] shadow-sm transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#fdf4f8] dark:bg-[#251221] text-[#b83280] dark:text-[#f472b6] flex items-center justify-center mb-3 shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#b83280] dark:text-[#f472b6] uppercase tracking-wider block">
            Palavras Restantes
          </span>
          <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1 block tabular-nums">
            {new Intl.NumberFormat('pt-BR').format(remainingWords)}
          </span>
          <span className="text-[11px] text-[#b83280]/70 dark:text-[#f472b6]/70 font-semibold mt-1 block">
            {remainingWords === 0 ? 'Meta atingida!' : 'Para alcançar a meta'}
          </span>
        </div>

        {/* Card 3: Ritmo Diário */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#f6f0fb] dark:bg-[#1f1033] text-[#823bd8] dark:text-[#a875ec] flex items-center justify-center mb-3 shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#823bd8] dark:text-[#a875ec] uppercase tracking-wider block">
            Ritmo Diário Ideal
          </span>
          <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1 block tabular-nums">
            {new Intl.NumberFormat('pt-BR').format(idealDailyPace)}
          </span>
          <span className="text-[11px] text-[#823bd8]/70 dark:text-[#a875ec]/70 font-semibold mt-1 block">
            palavras/dia (ciclo de {challengeDays} dias)
          </span>
        </div>

        {/* Card 4: Tempo Total Focado */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#160b24] border border-[#d8dcf5] dark:border-[#222846] shadow-sm transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#f4f5fc] dark:bg-[#161a32] text-[#4f46e5] dark:text-[#a5b4fc] flex items-center justify-center mb-3 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#4f46e5] dark:text-[#a5b4fc] uppercase tracking-wider block">
            Tempo de Escrita
          </span>
          <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1 block tabular-nums">
            {totalHours}h {remMinutes}m
          </span>
          <span className="text-[11px] text-[#4f46e5]/70 dark:text-[#a5b4fc]/70 font-semibold mt-1 block">
            tempo total dedicado à produção
          </span>
        </div>
      </section>

      {/* 🔮 Previsão Inteligente de Conclusão do Livro */}
      <SmartDeadlineForecast
        goal={goal}
        totalWords={totalWords}
        dailyGoal={dailyGoal}
        sessions={sessions}
        books={books}
        onOpenStoryModal={onOpenStoryModal}
      />

      {/* Seção: Metas de Longo Prazo */}
      <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42] mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#532380] dark:text-[#c4b3d8]">
                <Target className="w-5 h-5 text-[#532380] dark:text-[#c4b3d8]" />
              </span>
              <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Metas de Longo Prazo
              </h3>
            </div>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
              Defina grandes marcos de conclusão de manuscritos e acompanhe o avanço acumulado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingLTGoal(!isAddingLTGoal)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Nova Meta de Longo Prazo</span>
          </button>
        </div>

        {/* Form to Add Long-term Goal */}
        {isAddingLTGoal && (
          <form
            onSubmit={handleAddLTGoal}
            className="mb-6 p-5 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] space-y-4 animate-in fade-in"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#532380] dark:text-[#c4b3d8]">
              Cadastrar Novo Marco de Conclusão
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Título da Meta / Objetivo *
                </label>
                <input
                  type="text"
                  required
                  value={ltTitle}
                  onChange={(e) => setLtTitle(e.target.value)}
                  placeholder="Ex: Terminar primeiro rascunho em 3 meses"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden focus:border-[#532380]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Prazo / Data Estimada
                </label>
                <input
                  type="text"
                  value={ltDeadline}
                  onChange={(e) => setLtDeadline(e.target.value)}
                  placeholder="Ex: em 3 meses, 31/12/2026"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden focus:border-[#532380]"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Meta de Palavras Acumuladas *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="500"
                  value={ltTarget}
                  onChange={(e) => setLtTarget(Number(e.target.value))}
                  placeholder="Ex: 50000"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden focus:border-[#532380]"
                />
                <span className="text-[10px] text-[#5c4672]/70 dark:text-[#c4b3d8]/70 mt-1 block">
                  A barra de progresso será calculada com base nas {new Intl.NumberFormat('pt-BR').format(totalWords)} palavras que você já escreveu até agora no total acumulado.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingLTGoal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5c4672] bg-white dark:bg-[#160b24] border border-[#ebdff2]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#532380] hover:bg-[#6c2ea6]"
              >
                Salvar Meta
              </button>
            </div>
          </form>
        )}

        {/* Goals List */}
        {longTermGoals.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#5c4672]/70 dark:text-[#c4b3d8]/70 border border-dashed border-[#ebdff2] dark:border-[#2d1b42] rounded-2xl">
            Nenhuma meta de longo prazo cadastrada. Estabeleça seus objetivos literários!
          </div>
        ) : (
          <div className="space-y-5">
            {longTermGoals.map((ltGoal) => {
              const progress = Math.min(100, Math.round((totalWords / ltGoal.targetWords) * 100));
              const remaining = Math.max(0, ltGoal.targetWords - totalWords);
              return (
                <div
                  key={ltGoal.id}
                  className="p-5 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd]/60 dark:bg-[#1c0e2e]/40 hover:border-[#532380]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-serif-display font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc] truncate">
                        {ltGoal.title}
                      </h4>
                      {/* Zero-Pill unboxed metadata */}
                      <div className="flex items-center gap-2 text-xs text-[#5c4672]/70 dark:text-[#c4b3d8]/70 mt-1">
                        <span>Prazo: {ltGoal.deadline}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Alvo: {new Intl.NumberFormat('pt-BR').format(ltGoal.targetWords)} palavras
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-[#147d74] dark:text-[#2dd4bf] tabular-nums">
                        {progress}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteLTGoal(ltGoal.id)}
                        className="text-[#5c4672]/70 hover:text-[#b83280] dark:hover:text-[#f472b6] p-1.5 cursor-pointer rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Remover ou marcar como concluída"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-3 mb-2">
                    <div
                      className="h-full bg-linear-to-r from-[#6c2eb9] via-[#b83280] to-[#147d74] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5c4672]/80 dark:text-[#c4b3d8]/80">
                    <span className="font-mono tabular-nums">
                      Escrito: {new Intl.NumberFormat('pt-BR').format(totalWords)} / {new Intl.NumberFormat('pt-BR').format(ltGoal.targetWords)} pal.
                    </span>
                    <span>
                      {remaining > 0
                        ? `Faltam ${new Intl.NumberFormat('pt-BR').format(remaining)} pal.`
                        : '🎉 Concluído com Sucesso!'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Meus Livros & Projetos */}
      <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#faeef5] dark:bg-[#2b1424] text-[#b83280] dark:text-[#f472b6]">
                <BookOpen className="w-5 h-5" />
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Meus Livros & Projetos
              </h3>
            </div>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
              Acompanhe o andamento detalhado e as metas de cada projeto literário individual.
            </p>
          </div>
          <button
            onClick={onNavigateToBible}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#f6f0fb] dark:bg-[#1f1033] hover:bg-white dark:hover:bg-[#2b1646] text-[#5c4672] dark:text-[#c4b3d8] hover:text-[#220d3a] dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Manual do Livro</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
          </button>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#5c4672]/70 dark:text-[#c4b3d8]/70">
            Nenhum livro cadastrado. Cadastre um novo livro na aba "Manual do Livro"!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {books.map((book) => {
              const bookSessions = sessions.filter((s) => s.bookId === book.id);
              const bookWords = bookSessions.reduce((sum, s) => sum + s.words, 0);
              const progressPct = book.targetWords > 0 ? Math.min(100, Math.round((bookWords / book.targetWords) * 100)) : 0;
              const remaining = Math.max(0, book.targetWords - bookWords);

              return (
                <div
                  key={book.id}
                  className="p-5 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1a0e2a] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-serif-display font-bold text-lg text-[#220d3a] dark:text-[#f7f2fc]">
                          {book.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">
                          <span>{book.genre || 'Ficção'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">Meta: {new Intl.NumberFormat('pt-BR').format(book.targetWords)} pal.</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#147d74] dark:text-[#2dd4bf] tabular-nums">
                        {progressPct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-3 mb-4">
                      <div
                        className="h-full bg-linear-to-r from-[#6c2eb9] via-[#b83280] to-[#147d74] rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between text-xs text-[#5c4672] dark:text-[#c4b3d8]">
                    <div>
                      <span className="block text-[11px] text-[#8870a0] dark:text-[#9782ad]">Progresso</span>
                      <strong className="text-[#220d3a] dark:text-[#f7f2fc] tabular-nums">
                        {new Intl.NumberFormat('pt-BR').format(bookWords)}
                      </strong>{' '}
                      / {new Intl.NumberFormat('pt-BR').format(book.targetWords)} pal.
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] text-[#8870a0] dark:text-[#9782ad]">Faltam</span>
                      <strong className="text-[#b83280] dark:text-[#f472b6] tabular-nums">
                        {remaining > 0 ? `${new Intl.NumberFormat('pt-BR').format(remaining)} pal.` : 'Concluído! 🎉'}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Estatísticas de Ouro - Média por sessão & Previsão de Conclusão */}
      <GoldenStatsCard
        sessions={sessions}
        books={books}
        overallGoal={goal}
        challengeDays={challengeDays}
      />

      {/* Seção: Conquistas em Destaque (Cópia restaurada na Home diretamente abaixo de Estatísticas de Ouro) */}
      <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="pb-4 border-b border-[#ebdff2]/40 dark:border-[#2d1b42]/40 mb-6">
          <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#b83280]" />
            <span>Conquistas em Destaque</span>
          </h3>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
            Seus primeiros e mais marcantes troféus de escrita conquistados na plataforma.
          </p>
        </div>
        <BadgesMiniPreview
          badges={badges}
          onNavigateToBadges={onNavigateToBadges}
        />
      </section>

      {/* Seção: Ritmo Ideal vs. Progresso Real (Cópia restaurada na Home) */}
      <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] text-[#6c2eb9] dark:text-[#a875ec] shrink-0">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Ritmo Ideal vs. Progresso Real
              </h3>
            </div>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
              Compare a meta ideal de palavras proporcional com o seu progresso diário acumulado.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#f6f0fb] dark:bg-[#1f1033] text-[#823bd8] dark:text-[#a875ec] border border-[#ebdff2] dark:border-[#2d1b42] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#823bd8] dark:bg-[#a875ec]"></span>
              <span>Ritmo Ideal</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#faeef5] dark:bg-[#2b1424] text-[#b83280] dark:text-[#f472b6] border border-[#f5d7e6] dark:border-[#3d192f] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#b83280] dark:text-[#f472b6]"></span>
              <span>Palavras Escritas</span>
            </span>
          </div>
        </div>

        <div className="mt-6">
          <WritingChart
            sessions={sessions}
            goal={goal}
            challengeDays={challengeDays}
            startDate={startDate}
            isDarkMode={isDarkMode}
          />
        </div>
      </section>

      {/* Monthly Calendar connected to Google - Acima do histórico */}
      <MonthlyCalendar
        sessions={sessions}
        books={books}
        hasGoogleToken={hasGoogleToken}
        googleToken={googleToken}
        onConnectGoogle={onConnectGoogle}
        targetGoal={goal}
        reminderSettings={reminderSettings}
        dailyGoal={idealDailyPace}
      />

      {/* History of Sessions */}
      <SessionHistory
        sessions={sessions}
        books={books}
        projects={projects}
        onDeleteSession={onDeleteSession}
        onUpdateSession={onUpdateSession}
      />

      {/* MODAL DE CELEBRAÇÃO DA CONSTÂNCIA NA HOME */}
      {showConstancyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f0717]/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowConstancyModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#160b24] rounded-3xl shadow-2xl border border-[#bbf0eb] dark:border-[#1d4d47] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#147d74] via-[#0f635c] to-[#1b0e2e] p-6 text-white relative">
              <button
                onClick={() => setShowConstancyModal(false)}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Voltar ao Início (Esc)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
                <X className="w-3.5 h-3.5 opacity-70" />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-[#2dd4bf] shadow-lg shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2dd4bf]">
                    Microcelebração de Constância
                  </span>
                  <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-white mt-0.5">
                    7 Dias de Foco Silencioso
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-sm text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed">
                Nem toda semana precisa render troféus visíveis na parede: os clássicos da literatura nascem no silêncio da rotina comum e paciente. Escrever com constância por 7 dias é a verdadeira força do escritor!
              </p>

              {/* Ritual Reconfortante */}
              <div className="p-4 rounded-2xl bg-[#e6f7f5] dark:bg-[#122e2b] border border-[#bbf0eb] dark:border-[#1d4d47]">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] mb-1">
                  <PartyPopper className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf]" />
                  <span>Ritual Reconfortante Sugerido</span>
                </div>
                <p className="text-xs text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed font-medium">
                  {constancyInfo.celebrationSuggestion}
                </p>
              </div>

              {/* Lembrete de Sabedoria */}
              <div className="p-4 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42]">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#8870a0] dark:text-[#9782ad] mb-1">
                  <Heart className="w-4 h-4 text-[#b83280] dark:text-[#f472b6]" />
                  <span>Lembrete de Equilíbrio & Sabedoria</span>
                </div>
                <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed italic">
                  “{constancyInfo.consistencyReminder}”
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42]">
                <button
                  onClick={() => setShowConstancyModal(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#faf7fd] dark:hover:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Início</span>
                </button>

                <button
                  onClick={() => triggerHomeConfetti(0.4)}
                  className="px-5 py-2.5 rounded-xl bg-[#147d74] hover:bg-[#0f635c] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PartyPopper className="w-4 h-4 text-[#2dd4bf]" />
                  <span>Brindar à Minha Constância! 🌿</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Geração de Ideias de Enredo com Gemini IA */}
      <PlotIdeasModal
        isOpen={showPlotIdeasModal}
        onClose={() => setShowPlotIdeasModal(false)}
        books={books}
        onStartWritingWithPrompt={onStartWritingWithPrompt}
      />
    </div>
  );
};
