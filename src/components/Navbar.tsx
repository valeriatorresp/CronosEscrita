import React from 'react';
import {
  Feather,
  Home,
  Sparkles,
  BookMarked,
  LogOut,
  User,
  CheckCircle2,
  Sun,
  Moon,
  Bell,
  Award,
  Megaphone,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { AuthUser } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'game' | 'bible' | 'badges' | 'marketing' | 'metrics' | 'automation';
  onSelectTab: (tab: 'dashboard' | 'game' | 'bible' | 'badges' | 'marketing' | 'metrics' | 'automation') => void;
  user: AuthUser | null;
  hasGoogleToken: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  totalWords: number;
  goal: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenReminder: () => void;
  isReminderPending: boolean;
  onOpenImmersive?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  hasGoogleToken,
  onOpenAuth,
  onLogout,
  totalWords,
  goal,
  isDarkMode,
  onToggleTheme,
  onOpenReminder,
  isReminderPending,
}) => {
  const progressPct = Math.min(100, Math.round((totalWords / (goal || 50000)) * 100));
  const firstName = user?.name ? user.name.trim().split(' ')[0] : '';

  const getTabBgClass = (_tab: string) => {
    return 'bg-[#6c2eb9] text-white shadow-xs';
  };

  return (
    <header className="w-full pt-4 pb-2 px-3 sm:px-6 transition-all duration-300">
      {/* SVG Definition for feather gradient: Roxo -> Rosa -> Azul Tiffany */}
      <svg width="0" height="0" className="absolute -z-10 w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="feather-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto">
        <div className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#160b24]/95 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm px-4 sm:px-6 py-2.5 transition-all duration-300">
          <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center gap-3 group text-left focus:outline-hidden cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#130722] border border-[#2b104a] p-0.5 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center">
                  <Feather stroke="url(#feather-logo-gradient)" className="w-5 h-5 stroke-[2.3] animate-pulse" />
                </div>
                <div>
                  <span className="font-serif-display text-xl sm:text-2xl font-bold text-[#130722] dark:text-[#f7f2fc] block leading-tight">
                    CronosEscrita
                  </span>
                  <div className="hidden xs:flex items-center gap-1.5 text-[11px] text-[#5c4672] dark:text-[#c4b3d8] font-medium whitespace-nowrap">
                    <span>Rotina & Metas</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#823bd8] dark:bg-[#a875ec]"></span>
                    <span className="text-[#823bd8] dark:text-[#a875ec] font-semibold tabular-nums">{progressPct}%</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Navigation Tabs - Floating Segmented Nav with responsive sizing for notebooks & monitors (>= 1024px) */}
            <nav className="hidden lg:flex items-center p-1 bg-[#f4edf8] dark:bg-[#1f1033] rounded-2xl border border-[#e6d8ee] dark:border-[#351e50] overflow-x-auto scrollbar-none min-w-0 max-w-full shrink">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  currentTab === 'dashboard'
                    ? getTabBgClass('dashboard')
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/90 dark:hover:bg-[#2b1646] hover:text-[#220d3a] dark:hover:text-white'
                }`}
              >
                <Home className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
                <span>Home</span>
              </button>

              <button
                onClick={() => onSelectTab('game')}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  currentTab === 'game'
                    ? getTabBgClass('game')
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/90 dark:hover:bg-[#2b1646] hover:text-[#220d3a] dark:hover:text-white'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${currentTab === 'game' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
                <span>Prática</span>
              </button>

              <button
                onClick={() => onSelectTab('bible')}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  currentTab === 'bible'
                    ? getTabBgClass('bible')
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/90 dark:hover:bg-[#2b1646] hover:text-[#220d3a] dark:hover:text-white'
                }`}
              >
                <BookMarked className={`w-4 h-4 ${currentTab === 'bible' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
                <span>Guia</span>
              </button>

              <button
                onClick={() => onSelectTab('badges')}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  currentTab === 'badges'
                    ? getTabBgClass('badges')
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/90 dark:hover:bg-[#2b1646] hover:text-[#220d3a] dark:hover:text-white'
                }`}
              >
                <Award className={`w-4 h-4 ${currentTab === 'badges' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
                <span>Conquistas</span>
              </button>

              <button
                onClick={() => onSelectTab('marketing')}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  currentTab === 'marketing'
                    ? getTabBgClass('marketing')
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/90 dark:hover:bg-[#2b1646] hover:text-[#220d3a] dark:hover:text-white'
                }`}
              >
                <Megaphone className={`w-4 h-4 ${currentTab === 'marketing' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
                <span>Marketing</span>
              </button>

              <button
                onClick={() => onSelectTab('automation')}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  currentTab === 'automation'
                    ? getTabBgClass('automation')
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/90 dark:hover:bg-[#2b1646] hover:text-[#220d3a] dark:hover:text-white'
                }`}
              >
                <Zap className={`w-4 h-4 ${currentTab === 'automation' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
                <span>Automação</span>
              </button>

              <button
                onClick={() => onSelectTab('metrics')}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  currentTab === 'metrics'
                    ? getTabBgClass('metrics')
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/90 dark:hover:bg-[#2b1646] hover:text-[#220d3a] dark:hover:text-white'
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${currentTab === 'metrics' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
                <span>Métricas</span>
              </button>
            </nav>

            {/* Direita: Ações + Entrar/Conectar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Grupo de Ícones de Ação (Lembrete + Tema) */}
              <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-[#f4edf8] dark:bg-[#1f1033] border border-[#e6d8ee] dark:border-[#351e50]">
                {/* Lembrete de Escrita */}
                <button
                  onClick={onOpenReminder}
                  title="Configurar Lembrete Diário de Escrita"
                  aria-label="Lembretes"
                  className="relative p-2 rounded-xl text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#2b1646] transition-all duration-200 cursor-pointer"
                >
                  <Bell className="w-5 h-5 stroke-[2.2] text-[#6c2eb9] dark:text-[#a875ec]" />
                  {isReminderPending && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                  )}
                </button>

                {/* Alternador de Tema Claro / Escuro */}
                <button
                  onClick={onToggleTheme}
                  title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
                  aria-label={isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
                  className="p-2 rounded-xl text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#2b1646] hover:text-[#b83280] dark:hover:text-[#a875ec] transition-all duration-200 cursor-pointer"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-amber-400 stroke-[2.2] animate-in spin-in-90 duration-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-[#6c2eb9] stroke-[2.2] animate-in spin-in-90 duration-300" />
                  )}
                </button>
              </div>

              {/* Botão Entrar / Conectar (ou Perfil do Usuário se logado) */}
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3 pl-1">
                  <div className="flex flex-col text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-sm font-bold text-[#220d3a] dark:text-[#f7f2fc]">{firstName}</span>
                      {hasGoogleToken && (
                        <span
                          title="Conectado ao Google Calendar"
                          className="inline-flex items-center justify-center p-0.5 text-[#e11d48] dark:text-[#fb7185] bg-rose-50 dark:bg-rose-950/50 rounded-full"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:inline text-xs text-[#5c4672] dark:text-[#c4b3d8] truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </div>

                  <div className="relative group">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#ebdff2] dark:border-[#2d1b42] bg-[#f6f0fb] dark:bg-[#1f1033] flex items-center justify-center text-[#6c2eb9] dark:text-[#c4b3d8] font-bold shadow-xs">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    title="Sair da conta"
                    className="p-2 text-[#8870a0] hover:text-[#b83280] hover:bg-[#faeef5] dark:hover:bg-[#2b1424] rounded-xl transition-colors focus:outline-hidden cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] shadow-sm shadow-purple-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <User className="w-4 h-4 shrink-0 text-white/90" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile & Tablet Navigation bar (< 1024px) with fluid horizontal scroll */}
          <div className="lg:hidden pt-2.5 mt-1.5 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-start sm:justify-around gap-1 sm:gap-2 text-xs overflow-x-auto scrollbar-none py-1 scroll-smooth">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl font-semibold transition-all shrink-0 cursor-pointer active:scale-95 ${
                currentTab === 'dashboard'
                  ? getTabBgClass('dashboard')
                  : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 ${currentTab === 'dashboard' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
              <span>Home</span>
            </button>
            <button
              onClick={() => onSelectTab('game')}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl font-semibold transition-all shrink-0 cursor-pointer active:scale-95 ${
                currentTab === 'game'
                  ? getTabBgClass('game')
                  : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${currentTab === 'game' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
              <span>Prática</span>
            </button>
            <button
              onClick={() => onSelectTab('bible')}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl font-semibold transition-all shrink-0 cursor-pointer active:scale-95 ${
                currentTab === 'bible'
                  ? getTabBgClass('bible')
                  : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
              }`}
            >
              <BookMarked className={`w-4 h-4 shrink-0 ${currentTab === 'bible' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
              <span>Guia</span>
            </button>
            <button
              onClick={() => onSelectTab('badges')}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl font-semibold transition-all shrink-0 cursor-pointer active:scale-95 ${
                currentTab === 'badges'
                  ? getTabBgClass('badges')
                  : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
              }`}
            >
              <Award className={`w-4 h-4 shrink-0 ${currentTab === 'badges' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
              <span>Conquistas</span>
            </button>
            <button
              onClick={() => onSelectTab('marketing')}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl font-semibold transition-all shrink-0 cursor-pointer active:scale-95 ${
                currentTab === 'marketing'
                  ? getTabBgClass('marketing')
                  : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
              }`}
            >
              <Megaphone className={`w-4 h-4 shrink-0 ${currentTab === 'marketing' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
              <span>Marketing</span>
            </button>
            <button
              onClick={() => onSelectTab('automation')}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl font-semibold transition-all shrink-0 cursor-pointer active:scale-95 ${
                currentTab === 'automation'
                  ? getTabBgClass('automation')
                  : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
              }`}
            >
              <Zap className={`w-4 h-4 shrink-0 ${currentTab === 'automation' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
              <span>Automação</span>
            </button>
            <button
              onClick={() => onSelectTab('metrics')}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl font-semibold transition-all shrink-0 cursor-pointer active:scale-95 ${
                currentTab === 'metrics'
                  ? getTabBgClass('metrics')
                  : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
              }`}
            >
              <TrendingUp className={`w-4 h-4 shrink-0 ${currentTab === 'metrics' ? 'text-white' : 'text-[#823bd8] dark:text-[#a875ec]'}`} />
              <span>Métricas</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
