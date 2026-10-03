import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Lock,
  Sparkles,
  Zap,
  PenTool,
  BookOpen,
  Compass,
  Flame,
  Trophy,
  Moon,
  Castle,
  Users,
  Feather,
  Clock,
  CheckCircle,
  Bookmark,
  FileText,
  Sun,
  CalendarCheck,
  Heart,
  Crown,
  Coffee,
  Hourglass,
  BookMarked,
  PartyPopper,
  X,
  Target,
  ChevronRight,
  TrendingUp,
  Smile,
  ShieldCheck,
  Rocket,
  Library,
  ArrowLeft,
} from 'lucide-react';
import type { Badge, WritingSession, Book, Project, BadgeLevel } from '../types';
import {
  calculateBadgeProgress,
  LEVEL_DEFINITIONS,
  formatProgressRatio,
  formatCompactNumber,
  checkSevenDaysWithoutBadges,
  CONSTANCY_7_DAYS_CELEBRATION,
} from '../data/badges';

interface BadgesSectionProps {
  badges: Badge[];
  sessions?: WritingSession[];
  books?: Book[];
  projects?: Project[];
  savedStoriesCount?: number;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({
  badges,
  sessions = [],
  books = [],
  projects = [],
  savedStoriesCount = 0,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | BadgeLevel>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showConstancyModal, setShowConstancyModal] = useState(false);

  const unlockedCount = badges.filter((b) => b.unlockedAt).length;
  const progressPct = Math.round((unlockedCount / badges.length) * 100);

  // Check 7 days constancy without recent badges
  const constancyInfo = checkSevenDaysWithoutBadges(badges, sessions);

  // Close modals on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBadge(null);
        setShowConstancyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine Overall Writer Rank
  let currentRankLevel: BadgeLevel = 'novato';
  if (unlockedCount >= 18) {
    currentRankLevel = 'bom_demais';
  } else if (unlockedCount >= 8) {
    currentRankLevel = 'mediano';
  }
  const currentRankInfo = LEVEL_DEFINITIONS[currentRankLevel];

  // Badges count per level
  const novatoBadges = badges.filter((b) => b.level === 'novato');
  const medianoBadges = badges.filter((b) => b.level === 'mediano');
  const bomDemaisBadges = badges.filter((b) => b.level === 'bom_demais');

  const novatoUnlocked = novatoBadges.filter((b) => b.unlockedAt).length;
  const medianoUnlocked = medianoBadges.filter((b) => b.unlockedAt).length;
  const bomDemaisUnlocked = bomDemaisBadges.filter((b) => b.unlockedAt).length;

  const filteredBadges = badges.filter((b) => {
    // Status filter
    if (filter === 'unlocked' && !b.unlockedAt) return false;
    if (filter === 'locked' && b.unlockedAt) return false;

    // Level filter
    if (levelFilter !== 'all' && b.level !== levelFilter) return false;

    return true;
  });

  const triggerConfetti = (originY = 0.6) => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: originY },
      colors: ['#6c2eb9', '#b83280', '#147d74', '#2dd4bf', '#f472b6', '#eab308'],
    });
  };

  const handleCelebrateBadge = (badge: Badge, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerConfetti(0.5);
    setSelectedBadge(badge);
  };

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { className: 'w-6 h-6 stroke-[2.2]' };
    switch (iconName) {
      case 'PenTool':
        return <PenTool {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Trophy':
        return <Trophy {...props} />;
      case 'Moon':
        return <Moon {...props} />;
      case 'Castle':
        return <Castle {...props} />;
      case 'Users':
        return <Users {...props} />;
      case 'Feather':
        return <Feather {...props} />;
      case 'Clock':
        return <Clock {...props} />;
      case 'Bookmark':
        return <Bookmark {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Sun':
        return <Sun {...props} />;
      case 'CalendarCheck':
        return <CalendarCheck {...props} />;
      case 'Heart':
        return <Heart {...props} />;
      case 'Crown':
        return <Crown {...props} />;
      case 'Coffee':
        return <Coffee {...props} />;
      case 'Hourglass':
        return <Hourglass {...props} />;
      case 'BookMarked':
        return <BookMarked {...props} />;
      case 'CheckCircle':
        return <CheckCircle {...props} />;
      case 'Rocket':
        return <Rocket {...props} />;
      case 'Library':
        return <Library {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. Hero Header Banner */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-10 shadow-lg bg-gradient-to-br from-[#120a1f] via-[#1a0f2b] to-[#120721] dark:from-[#0f071a] dark:to-[#0a0413] border border-[#ebdff2]/20 dark:border-[#2d1b42] text-white">
        {/* Ambient glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#e11d48]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#f43f5e]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-400/40 text-xs font-bold tracking-wider uppercase text-[#fb7185] shadow-xs">
                <Award className="w-3.5 h-3.5 text-[#fb7185]" />
                <span>CronosPrêmio · Mural de Troféus Literários</span>
              </div>
              <h1 className="font-serif-display text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                CronosEscrita -{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#ec4899]">
                  Mural de Conquistas
                </span>{' '}
                🏆
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">
                Cada palavra registrada e cada obstáculo superado acendem a dopamina da vitória.
                Acompanhe seu progresso métrico por nível, celebre suas conquistas com pequenas recompensas
                e lembre-se: <strong>a verdadeira obra-prima nasce da constância diária</strong>.
              </p>
            </div>

            {/* Current Rank Badge Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shrink-0 flex flex-col sm:flex-row items-center gap-5 shadow-lg min-w-[260px]">
              <div className="text-center sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-[#2dd4bf] font-bold block">
                  Seu Nível Atual
                </span>
                <span className="font-serif-display text-2xl font-bold text-white block mt-0.5">
                  {currentRankInfo.name}
                </span>
                <span className="text-xs text-[#f472b6] font-semibold block mt-0.5">
                  “{currentRankInfo.funRankName}”
                </span>
                <span className="text-[11px] text-white/70 block mt-1 tabular-nums">
                  {unlockedCount} de {badges.length} badges
                </span>
              </div>

              <div className="relative w-16 h-16 rounded-full border-4 border-white/20 border-t-[#2dd4bf] border-r-[#f472b6] border-b-[#6c2eb9] flex items-center justify-center font-bold text-sm text-white tabular-nums shadow-inner shrink-0">
                {progressPct}%
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (4 chips row) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Badges Desbloqueadas</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {unlockedCount} de {badges.length}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Progresso Geral</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {progressPct}% atingido
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Microcelebrações</span>
                <span className="text-base font-bold text-emerald-400">
                  Liberadas
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Grau de Mestre</span>
                <span className="text-base font-bold text-white truncate max-w-[130px] block">
                  {currentRankInfo.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Banner Educativo: O Sistema Dopaminérgico & A Constância */}
      <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-7 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6] flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#b83280] dark:text-[#f472b6]">
                  Neurologia da Criação
                </span>
                <span className="text-xs text-[#8870a0] dark:text-[#9782ad]">·</span>
                <span className="text-xs font-semibold text-[#147d74] dark:text-[#2dd4bf]">
                  Pequenas Vitórias
                </span>
              </div>
              <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-0.5">
                Celebre a Conquista, mas Viva pela Constância
              </h3>
              <p className="text-xs sm:text-sm text-[#5c4672] dark:text-[#c4b3d8] mt-1 max-w-3xl leading-relaxed">
                Cada conquista no CronosEscrita sugere uma <strong>minicomemoração sensorial</strong> (um café saboreado, uma música alegre, um alongamento) para liberar dopamina saudável. Porém, lembre-se: o verdadeiro troféu de um autor não é a medalha na parede, mas a tranquilidade de sentar amanhã e escrever mais algumas linhas.
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerConfetti(0.4)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <PartyPopper className="w-4 h-4 text-[#2dd4bf]" />
            <span>Fazer Chuva de Vitória!</span>
          </button>
        </div>
      </section>

      {/* 3. Seletor de Níveis de Escritor */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nível 1: Novato */}
        <div
          onClick={() => setLevelFilter(levelFilter === 'novato' ? 'all' : 'novato')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            levelFilter === 'novato'
              ? 'bg-[#e6f7f5] dark:bg-[#102c29] border-[#147d74] dark:border-[#2dd4bf] shadow-md ring-2 ring-[#147d74]/30'
              : 'bg-white dark:bg-[#160b24] border-[#ebdff2] dark:border-[#2d1b42] hover:border-[#147d74] hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5" />
              <span>Nível 1 · Escritor Novato</span>
            </span>
            <span className="text-xs font-bold text-[#147d74] dark:text-[#2dd4bf] tabular-nums">
              {novatoUnlocked} / {novatoBadges.length}
            </span>
          </div>

          <h4 className="font-serif-display font-bold text-lg text-[#220d3a] dark:text-[#f7f2fc]">
            “Explorador da Folha em Branco”
          </h4>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1 leading-snug">
            Superando o bloqueio da tela vazia, primeiras centenas de palavras e o despertar do hábito.
          </p>

          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-3">
            <div
              className="h-full bg-[#147d74] dark:bg-[#2dd4bf] rounded-full transition-all duration-500"
              style={{
                width: `${novatoBadges.length > 0 ? (novatoUnlocked / novatoBadges.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Nível 2: Em Ascensão (Embalado) */}
        <div
          onClick={() => setLevelFilter(levelFilter === 'mediano' ? 'all' : 'mediano')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            levelFilter === 'mediano'
              ? 'bg-[#f6f0fb] dark:bg-[#231238] border-[#6c2eb9] dark:border-[#a875ec] shadow-md ring-2 ring-[#6c2eb9]/30'
              : 'bg-white dark:bg-[#160b24] border-[#ebdff2] dark:border-[#2d1b42] hover:border-[#6c2eb9] hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6c2eb9] dark:text-[#a875ec] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Nível 2 · Escritor em Ascensão</span>
            </span>
            <span className="text-xs font-bold text-[#6c2eb9] dark:text-[#a875ec] tabular-nums">
              {medianoUnlocked} / {medianoBadges.length}
            </span>
          </div>

          <h4 className="font-serif-display font-bold text-lg text-[#220d3a] dark:text-[#f7f2fc]">
            “Artesão dos Parágrafos”
          </h4>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1 leading-snug">
            Segurando a linha no segundo ato, desenvolvendo personagens e mantendo a constância semanal.
          </p>

          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-3">
            <div
              className="h-full bg-[#6c2eb9] dark:bg-[#a875ec] rounded-full transition-all duration-500"
              style={{
                width: `${medianoBadges.length > 0 ? (medianoUnlocked / medianoBadges.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Nível 3: Bom Demais */}
        <div
          onClick={() => setLevelFilter(levelFilter === 'bom_demais' ? 'all' : 'bom_demais')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            levelFilter === 'bom_demais'
              ? 'bg-[#fae8f2] dark:bg-[#341628] border-[#b83280] dark:border-[#f472b6] shadow-md ring-2 ring-[#b83280]/30'
              : 'bg-white dark:bg-[#160b24] border-[#ebdff2] dark:border-[#2d1b42] hover:border-[#b83280] hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b83280] dark:text-[#f472b6] flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Nível 3 · Escritor Bom Demais</span>
            </span>
            <span className="text-xs font-bold text-[#b83280] dark:text-[#f472b6] tabular-nums">
              {bomDemaisUnlocked} / {bomDemaisBadges.length}
            </span>
          </div>

          <h4 className="font-serif-display font-bold text-lg text-[#220d3a] dark:text-[#f7f2fc]">
            “Lenda Viva dos Finais Épicos”
          </h4>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1 leading-snug">
            Grandes marcos de 25k a 50k palavras, rotinas monásticas e romances concluídos com maestria.
          </p>

          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-3">
            <div
              className="h-full bg-[#b83280] dark:bg-[#f472b6] rounded-full transition-all duration-500"
              style={{
                width: `${bomDemaisBadges.length > 0 ? (bomDemaisUnlocked / bomDemaisBadges.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* 2.1 Celebração da Constância: 7 Dias sem Conquistas? Celebramos o Hábito! */}
      <section className="rounded-3xl p-6 sm:p-7 border border-[#bbf0eb] dark:border-[#134e4a] bg-gradient-to-br from-[#e6f7f5] via-white to-[#f0fbf9] dark:from-[#0d2825] dark:via-[#160b24] dark:to-[#0f2321] shadow-sm relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#2dd4bf]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-13 h-13 rounded-2xl bg-[#147d74] text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-7 h-7 text-[#2dd4bf]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] px-2.5 py-0.5 rounded-full bg-[#147d74]/15 border border-[#147d74]/25">
                  🏆 Celebração Especial da Constância
                </span>
                <span className="text-xs font-semibold text-[#8870a0] dark:text-[#9782ad]">
                  · 7 Dias de Foco Silencioso
                </span>
              </div>

              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1">
                Sem Conquistas nos Últimos 7 Dias? Brinde à Constância Silenciosa!
              </h3>

              <p className="text-xs sm:text-sm text-[#5c4672] dark:text-[#c4b3d8] mt-1.5 leading-relaxed">
                Nem toda semana gera medalhas douradas, e esse é o sinal de um escritor maduro! O trabalho mais profundo e transformador de um livro acontece no silêncio da rotina diária.
              </p>

              {/* Unique suggested mini celebration for constancy */}
              <div className="mt-3.5 p-3 rounded-2xl bg-white/80 dark:bg-[#141d22]/80 border border-[#bbf0eb] dark:border-[#1a4440] text-xs text-[#220d3a] dark:text-[#f7f2fc] flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-[#b83280] dark:text-[#f472b6] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#147d74] dark:text-[#2dd4bf]">Minicomemoração de Constância: </strong>
                  <span>{constancyInfo.celebrationSuggestion}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => {
                triggerConfetti(0.45);
                setShowConstancyModal(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#147d74] hover:bg-[#0f635c] text-white text-xs font-bold shadow-md shadow-[#147d74]/20 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
              <span>Celebrar Minha Constância! 🌿</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Main Badges Catalog Card */}
      <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6]">
                <Trophy className="w-5 h-5" />
              </span>
              <h2 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Catálogo de Conquistas & Metas
              </h2>
            </div>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
              Visualize suas barras de progresso contínuo, descubra pequenas celebrações e acesse os desafios.
            </p>
          </div>

          {/* Quick Active Filters Summary */}
          {levelFilter !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] text-[#6c2eb9] dark:text-[#a875ec] border border-[#ebdff2] dark:border-[#2d1b42]">
                Filtrando por: {LEVEL_DEFINITIONS[levelFilter].name}
              </span>
              <button
                onClick={() => setLevelFilter('all')}
                className="text-xs text-[#b83280] dark:text-[#f472b6] hover:underline cursor-pointer font-bold"
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs by Status and Level */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#6c2eb9] text-white shadow-xs'
                  : 'bg-[#faf7fd] dark:bg-[#1f1033] text-[#5c4672] dark:text-[#c4b3d8] border border-[#ebdff2] dark:border-[#2d1b42] hover:bg-white dark:hover:bg-[#25133c]'
              }`}
            >
              Todas ({badges.length})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'unlocked'
                  ? 'bg-[#147d74] text-white shadow-xs'
                  : 'bg-[#faf7fd] dark:bg-[#1f1033] text-[#5c4672] dark:text-[#c4b3d8] border border-[#ebdff2] dark:border-[#2d1b42] hover:bg-white dark:hover:bg-[#25133c]'
              }`}
            >
              Desbloqueadas ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'locked'
                  ? 'bg-[#b83280] text-white shadow-xs'
                  : 'bg-[#faf7fd] dark:bg-[#1f1033] text-[#5c4672] dark:text-[#c4b3d8] border border-[#ebdff2] dark:border-[#2d1b42] hover:bg-white dark:hover:bg-[#25133c]'
              }`}
            >
              A Conquistar ({badges.length - unlockedCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#5c4672] dark:text-[#c4b3d8]">
            <span className="font-semibold">Nível:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1f1033] text-[#220d3a] dark:text-[#f7f2fc] text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">Todos os Níveis</option>
              <option value="novato">Nível 1 · Escritor Novato</option>
              <option value="mediano">Nível 2 · Escritor em Ascensão</option>
              <option value="bom_demais">Nível 3 · Escritor Bom Demais</option>
            </select>
          </div>
        </div>

        {/* Badges Grid with Progress Bars & Celebrations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            const progress = calculateBadgeProgress(badge, sessions, books, projects, savedStoriesCount);

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                  isUnlocked
                    ? 'bg-white dark:bg-[#1c0e2e] border-[#ebdff2] dark:border-[#382052] shadow-sm hover:border-[#6c2eb9] hover:-translate-y-1'
                    : 'bg-[#faf7fd]/60 dark:bg-[#130720]/60 border-dashed border-[#ebdff2] dark:border-[#2d1b42] hover:border-[#6c2eb9] hover:bg-white dark:hover:bg-[#1a0e2a]'
                }`}
              >
                {/* Top ambient glow for unlocked badge */}
                {isUnlocked && (
                  <div
                    className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-20 blur-xl pointer-events-none"
                    style={{ backgroundColor: badge.color }}
                  />
                )}

                <div>
                  {/* Top Bar: Icon, Level Badge & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs shrink-0 ${
                        isUnlocked
                          ? 'text-white'
                          : 'bg-[#f4ecf8] dark:bg-[#26133a] text-[#6c2eb9] dark:text-[#c4b3d8]'
                      }`}
                      style={
                        isUnlocked
                          ? {
                              background: `linear-gradient(135deg, ${badge.color}, #532380)`,
                              boxShadow: `0 6px 14px -3px ${badge.color}44`,
                            }
                          : undefined
                      }
                    >
                      {renderBadgeIcon(badge.iconName, isUnlocked)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#0c2a27] px-2.5 py-0.5 rounded-full border border-[#bbf0eb] dark:border-[#14534f]">
                          <CheckCircle className="w-3 h-3 text-[#147d74] dark:text-[#2dd4bf]" />
                          <span>Conquistado</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8870a0] dark:text-[#9782ad] bg-[#faf7fd] dark:bg-[#1f1033] px-2.5 py-0.5 rounded-full border border-[#ebdff2] dark:border-[#2d1b42]">
                          <Lock className="w-3 h-3" />
                          <span>Bloqueado</span>
                        </span>
                      )}

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          badge.level === 'novato'
                            ? 'text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#102c29]'
                            : badge.level === 'mediano'
                            ? 'text-[#6c2eb9] dark:text-[#a875ec] bg-[#f6f0fb] dark:bg-[#231238]'
                            : 'text-[#b83280] dark:text-[#f472b6] bg-[#fae8f2] dark:bg-[#341628]'
                        }`}
                      >
                        {badge.level === 'mediano' ? 'Escritor em Ascensão' : badge.levelName || 'Escritor'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Nickname */}
                  <div>
                    <h4
                      className={`font-serif-display font-bold text-base leading-snug ${
                        isUnlocked ? 'text-[#220d3a] dark:text-[#f7f2fc]' : 'text-[#220d3a]/80 dark:text-[#f7f2fc]/80'
                      }`}
                    >
                      {badge.title}
                    </h4>
                    {badge.funRankName && (
                      <span className="text-[11px] font-semibold text-[#b83280] dark:text-[#f472b6] block mt-0.5">
                        “{badge.funRankName}”
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-2 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>

                  {/* PROGRESS BAR - BARRINHA DE QUANTIDADE CONCLUÍDA COM NÚMERO REAL À DIREITA (0/40k) */}
                  <div className="mt-4 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42]">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-[#5c4672] dark:text-[#c4b3d8] flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
                        <span>Progresso</span>
                      </span>
                      {/* O número real que precisa alcançar exibido no lado direito da barra (0/40k) */}
                      <span className="font-mono text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] px-2 py-0.5 rounded-lg bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] tabular-nums shadow-2xs">
                        {formatProgressRatio(progress.current, progress.target)}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${progress.percentage}%`,
                          background: isUnlocked
                            ? 'linear-gradient(90deg, #147d74, #2dd4bf)'
                            : 'linear-gradient(90deg, #6c2eb9, #b83280)',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#8870a0] dark:text-[#9782ad] mt-1">
                      <span>
                        {isUnlocked
                          ? '🎉 Requisito completo!'
                          : `${new Intl.NumberFormat('pt-BR').format(progress.current)} de ${new Intl.NumberFormat('pt-BR').format(progress.target)} ${progress.unit}`}
                      </span>
                      <span className="font-bold tabular-nums text-[#6c2eb9] dark:text-[#a875ec]">
                        {progress.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Mini-comemoração Dopaminérgica Preview */}
                  {badge.celebrationSuggestion && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#faf7fd] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-[11px] text-[#5c4672] dark:text-[#c4b3d8]">
                      <div className="flex items-center gap-1.5 font-bold text-[#b83280] dark:text-[#f472b6] mb-0.5">
                        <PartyPopper className="w-3.5 h-3.5" />
                        <span>Minicomemoração:</span>
                      </div>
                      <p className="line-clamp-2 leading-relaxed text-[11px]">
                        {badge.celebrationSuggestion}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer of Card with Celebrate Button */}
                <div className="mt-4 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between text-[11px]">
                  <span className="text-[#8870a0] dark:text-[#9782ad] font-medium">
                    {badge.unlockedAt ? `Conquistado em ${badge.unlockedAt.split('-').reverse().join('/')}` : 'Meta pendente'}
                  </span>

                  {isUnlocked ? (
                    <button
                      onClick={(e) => handleCelebrateBadge(badge, e)}
                      title="Celebrar conquista com confetes!"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fae8f2] dark:bg-[#341628] hover:bg-[#b83280] text-[#b83280] dark:text-[#f472b6] hover:text-white font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Celebrar!</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#6c2eb9] dark:text-[#a875ec] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Ver detalhes</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. MODAL DE DETALHES DA CONQUISTA (Celebration & Constancy) */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f0717]/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#160b24] rounded-3xl shadow-2xl border border-[#ebdff2] dark:border-[#2d1b42] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#1b0e2e] dark:bg-[#140922] p-6 text-white border-b border-[#3b235c]/70 relative">
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Voltar às Conquistas (Esc)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
                <X className="w-3.5 h-3.5 opacity-70" />
              </button>

              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${selectedBadge.color || '#6c2eb9'}, #532380)`,
                  }}
                >
                  {renderBadgeIcon(selectedBadge.iconName, !!selectedBadge.unlockedAt)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2dd4bf]">
                      {selectedBadge.level === 'mediano'
                        ? 'Escritor em Ascensão'
                        : selectedBadge.levelName || 'Escritor'}
                    </span>
                    <span className="text-white/60">·</span>
                    <span className="text-xs text-[#f472b6] font-semibold">
                      “{selectedBadge.funRankName}”
                    </span>
                  </div>
                  <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-white mt-0.5">
                    {selectedBadge.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Description */}
              <p className="text-sm text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed">
                {selectedBadge.description}
              </p>

              {/* Progress Detail */}
              {(() => {
                const prog = calculateBadgeProgress(
                  selectedBadge,
                  sessions,
                  books,
                  projects,
                  savedStoriesCount
                );
                return (
                  <div className="p-4 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42]">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-[#5c4672] dark:text-[#c4b3d8]">Métrica Cumprida</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#220d3a] dark:text-[#f7f2fc] font-bold tabular-nums">
                          {new Intl.NumberFormat('pt-BR').format(prog.current)} de{' '}
                          {new Intl.NumberFormat('pt-BR').format(prog.target)} {prog.unit}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#6c2eb9] dark:text-[#a875ec] px-2 py-0.5 rounded-md bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42]">
                          {formatProgressRatio(prog.current, prog.target)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${prog.percentage}%`,
                          background: selectedBadge.unlockedAt
                            ? 'linear-gradient(90deg, #147d74, #2dd4bf)'
                            : 'linear-gradient(90deg, #6c2eb9, #b83280)',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium mt-2">
                      <span className="text-[#8870a0] dark:text-[#9782ad]">
                        {selectedBadge.unlockedAt ? 'Status: Conquistado com Sucesso!' : 'Status: Em evolução'}
                      </span>
                      <span className="font-bold text-[#6c2eb9] dark:text-[#a875ec] tabular-nums">
                        {prog.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Minicomemoração Dopaminérgica */}
              {selectedBadge.celebrationSuggestion && (
                <div className="p-4 rounded-2xl bg-[#fae8f2] dark:bg-[#2e1424] border border-[#f5d7e6] dark:border-[#4d1f3b]">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#b83280] dark:text-[#f472b6] mb-1">
                    <PartyPopper className="w-4 h-4 text-[#b83280] dark:text-[#f472b6]" />
                    <span>Minicomemoração Recomendada (Reforço Dopaminérgico)</span>
                  </div>
                  <p className="text-xs text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed font-medium">
                    {selectedBadge.celebrationSuggestion}
                  </p>
                </div>
              )}

              {/* Lembrete de Constância */}
              {selectedBadge.consistencyReminder && (
                <div className="p-4 rounded-2xl bg-[#e6f7f5] dark:bg-[#122e2b] border border-[#cbebe7] dark:border-[#1d3d3a]">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf]" />
                    <span>Lembrete de Constância & Equilíbrio</span>
                  </div>
                  <p className="text-xs text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed italic">
                    “{selectedBadge.consistencyReminder}”
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42]">
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#faf7fd] dark:hover:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar às Conquistas</span>
                </button>

                <button
                  onClick={() => triggerConfetti(0.5)}
                  className="px-5 py-2.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PartyPopper className="w-4 h-4 text-[#2dd4bf]" />
                  <span>Comemorar Agora!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE CELEBRAÇÃO DA CONSTÂNCIA (Quando não há conquistas em 7 dias) */}
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
                title="Voltar / Fechar (Esc)"
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
                    Constância Literária
                  </span>
                  <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-white mt-0.5">
                    Celebração dos 7 Dias de Foco
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-sm text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed">
                Nem toda semana rende troféus visíveis, e está tudo bem! O trabalho mais profundo de um escritor acontece no silêncio dos dias comuns. Escrever com constância, mesmo sem medalhas na parede, é o que transforma sonhos em obras publicadas.
              </p>

              {/* Minicomemoração Especial */}
              <div className="p-4 rounded-2xl bg-[#e6f7f5] dark:bg-[#122e2b] border border-[#bbf0eb] dark:border-[#1d4d47]">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] mb-1">
                  <PartyPopper className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf]" />
                  <span>Minicomemoração Sugerida para a Constância</span>
                </div>
                <p className="text-xs text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed font-medium">
                  {constancyInfo.celebrationSuggestion}
                </p>
              </div>

              {/* Lembrete de Sabedoria */}
              <div className="p-4 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42]">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#8870a0] dark:text-[#9782ad] mb-1">
                  <Heart className="w-4 h-4 text-[#b83280] dark:text-[#f472b6]" />
                  <span>Reflexão do Autor</span>
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
                  <span>Voltar / Fechar</span>
                </button>

                <button
                  onClick={() => triggerConfetti(0.4)}
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
    </div>
  );
};
