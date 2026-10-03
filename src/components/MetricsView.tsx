import React from 'react';
import { TrendingUp, Target, Award, Clock, Feather } from 'lucide-react';
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
import { WritingChart } from './WritingChart';
import { SevenDayRechartsChart } from './SevenDayRechartsChart';

interface MetricsViewProps {
  sessions: WritingSession[];
  books: Book[];
  projects: Project[];
  badges: Badge[];
  goal: number;
  challengeDays: number;
  startDate: string;
  isDarkMode: boolean;
  onNavigateToBadges: () => void;
}

export const MetricsView: React.FC<MetricsViewProps> = ({
  sessions,
  books,
  projects,
  badges,
  goal,
  challengeDays,
  startDate,
  isDarkMode,
  onNavigateToBadges,
}) => {
  const totalWords = sessions.reduce((acc, s) => acc + s.words, 0);
  const completionPct = goal > 0 ? Math.min(100, Math.round((totalWords / goal) * 100)) : 0;
  const unlockedBadges = badges.filter((b) => !!b.unlockedAt).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* Premium Header */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-10 shadow-lg bg-gradient-to-br from-[#120a1f] via-[#1a0f2b] to-[#120721] dark:from-[#0f071a] dark:to-[#0a0413] border border-[#ebdff2]/20 dark:border-[#2d1b42] text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0284c7]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#0ea5e9]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 backdrop-blur-md border border-sky-400/40 text-xs font-bold tracking-wider uppercase text-[#38bdf8] shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>CronosDados · Análise de Produtividade & Rotina</span>
              </div>
              <h1 className="font-serif-display text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                CronosEscrita -{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#0284c7]">
                  Métricas & Desempenho
                </span>{' '}
                📊
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">
                Acompanhe em profundidade sua evolução de palavras escritas, sua consistência semanal de rotina e as conquistas desbloqueadas na sua jornada como escritor profissional.
              </p>
            </div>

            {/* Right Card: Performance Highlights */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shrink-0 flex flex-col justify-between shadow-lg min-w-[260px]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#38bdf8] font-bold block">
                  Total Produzido
                </span>
                <span className="font-serif-display text-3xl font-bold text-white block mt-0.5 tabular-nums">
                  {new Intl.NumberFormat('pt-BR').format(totalWords)}
                </span>
                <span className="text-xs text-white/70 block mt-0.5">palavras registradas</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                <span>Meta ({new Intl.NumberFormat('pt-BR').format(goal)}):</span>
                <span className="text-emerald-400 font-bold">{completionPct}% atingido</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (4 chips row) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Sessões Realizadas</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {sessions.length} {sessions.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Média por Sessão</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {sessions.length > 0 ? Math.round(totalWords / sessions.length) : 0} pals.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Ciclo de Desafio</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {challengeDays} dias
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Badges Conquistadas</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  {unlockedBadges} de {badges.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 1: Ritmo Ideal vs. Progresso Real */}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#e6f7f5] dark:bg-[#122e2b] text-[#147d74] dark:text-[#2dd4bf] border border-[#cbebe7] dark:border-[#1d3d3a] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#147d74] dark:bg-[#2dd4bf]"></span>
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

      {/* Seção 2: Evolução Semanal (Title changed from Evolução nos Últimos 7 Dias) */}
      <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#faeef5] dark:bg-[#2b1424] text-[#b83280] dark:text-[#f472b6]">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Evolução Semanal
              </h3>
            </div>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
              Acompanhe o volume diário e o progresso acumulado recente na última semana.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#e6f7f5] dark:bg-[#122e2b] text-[#147d74] dark:text-[#2dd4bf] border border-[#cbebe7] dark:border-[#1d3d3a]">
              <span className="w-2 h-2 rounded-full bg-[#147d74] dark:bg-[#2dd4bf]"></span>
              <span>No Dia</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#faeef5] dark:bg-[#2b1424] text-[#b83280] dark:text-[#f472b6] border border-[#f5d7e6] dark:border-[#3d192f]">
              <span className="w-2 h-2 rounded-full bg-[#b83280] dark:text-[#f472b6]"></span>
              <span>Acumulado</span>
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SevenDayRechartsChart sessions={sessions} isDarkMode={isDarkMode} />
        </div>
      </section>

      {/* Seção 4: Consistência da Rotina (Title updated: no subtitle in parentheses) */}
      <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf]">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Consistência da Rotina
              </h3>
            </div>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
              Visualize claramente o volume diário de palavras produzidas e a constância da sua rotina recente.
            </p>
          </div>
        </div>

        <div className="mt-6 w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Array.from({ length: 7 }).map((_, idx) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - idx));
                const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
                const dayWords = sessions.filter((s) => s.date === dStr).reduce((sum, s) => sum + s.words, 0);
                return {
                  label: label.replace(/^\w/, (c) => c.toUpperCase()),
                  'Palavras Escritas': dayWords,
                };
              })}
              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#2d1b42' : '#ebdff2'} opacity={0.7} />
              <XAxis dataKey="label" stroke={isDarkMode ? '#372052' : '#ebdff2'} tick={{ fill: isDarkMode ? '#c4b3d8' : '#5c4672', fontSize: 11, fontWeight: 600 }} tickLine={false} />
              <YAxis stroke={isDarkMode ? '#372052' : '#ebdff2'} tick={{ fill: isDarkMode ? '#c4b3d8' : '#5c4672', fontSize: 11, fontWeight: 600 }} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#160b24' : '#ffffff',
                  borderColor: isDarkMode ? '#2d1b42' : '#ebdff2',
                  borderRadius: '16px',
                  color: isDarkMode ? '#f7f2fc' : '#220d3a',
                  fontSize: '12px',
                  fontWeight: '600',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              />
              <Bar dataKey="Palavras Escritas" fill={isDarkMode ? '#2dd4bf' : '#147d74'} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
