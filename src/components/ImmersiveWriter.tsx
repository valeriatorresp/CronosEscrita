import React, { useState, useEffect, useRef } from 'react';
import {
  Minimize2,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  BookMarked,
  Sun,
  Moon,
  Type,
  Sliders,
  ArrowLeft,
  Volume2,
  VolumeX,
  Headphones,
  Music,
} from 'lucide-react';
import type { Book, WritingSession } from '../types';
import { MilestoneMiniCelebration } from './MilestoneMiniCelebration';
import {
  soundscapeEngine,
  SOUNDSCAPE_OPTIONS,
  type SoundscapeType,
} from '../services/soundscapes';
import {
  ImmersiveMusicPlayer,
  YouTubeIcon,
  SpotifyIcon,
} from './ImmersiveMusicPlayer';
import { loadSavedMusicConfig } from '../services/musicStream';

interface ImmersiveWriterProps {
  books: Book[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onExit: () => void;
  onSaveSession: (sessionData: Omit<WritingSession, 'id' | 'createdAt'>) => void;
  initialText?: string;
  initialBookId?: string;
}

export const ImmersiveWriter: React.FC<ImmersiveWriterProps> = ({
  books,
  isDarkMode,
  onToggleTheme,
  onExit,
  onSaveSession,
  initialText = '',
  initialBookId,
}) => {
  const [content, setContent] = useState(initialText);
  const [selectedBookId, setSelectedBookId] = useState<string>(
    initialBookId || books[0]?.id || ''
  );
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed'>('relaxed');

  // Timer / Stopwatch state
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  // Sprint Goal
  const [sprintGoal, setSprintGoal] = useState<number>(500);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Background Music (YouTube / Spotify) Modal State
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);

  // Soundscape ambient audio state
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>('none');
  const [soundscapeVolume, setSoundscapeVolume] = useState<number>(50);
  const [isSoundscapeOpen, setIsSoundscapeOpen] = useState(false);

  // Play/change soundscape
  const handleSelectSoundscape = (type: SoundscapeType) => {
    setCurrentSoundscape(type);
    soundscapeEngine.play(type);
  };

  const handleChangeVolume = (vol: number) => {
    setSoundscapeVolume(vol);
    soundscapeEngine.setVolume(vol / 100);
  };

  // Fullscreen API state & container ref
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return Boolean(
      typeof document !== 'undefined' &&
        (document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement)
    );
  });

  // Listen for Fullscreen state changes (ESC, F11, or browser controls)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      const isDocFullscreen = Boolean(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );

      if (!isDocFullscreen) {
        const elem = containerRef.current || document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
        setFeedback('🖥️ Tela Cheia Ativada! Foco total na sua escrita.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        }
        setFeedback('Modo janela restaurado.');
        setTimeout(() => setFeedback(null), 2000);
      }
    } catch (err) {
      console.warn('Fullscreen toggle error:', err);
      setFeedback('⚠️ Não foi possível alternar tela cheia (permissão bloqueada).');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSafeExit = () => {
    if (document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
          (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
        }
      } catch {
        // ignore
      }
    }
    onExit();
  };

  // Stop audio and ensure fullscreen is released on unmount
  useEffect(() => {
    return () => {
      soundscapeEngine.stop();
      if (document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Track 500-words milestones in session for real-time mini-celebration
  const celebratedMilestonesRef = useRef<Set<number>>(new Set());
  const [milestoneCelebration, setMilestoneCelebration] = useState<{ show: boolean; words: number } | null>(null);

  // Auto-hide controls bar on typing
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const isDocFullscreen = Boolean(
          document.fullscreenElement ||
          (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
        );
        // If in fullscreen, native browser Esc exits fullscreen first. If not, exit immersive mode.
        if (!isDocFullscreen) {
          handleSafeExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Words and characters count
  const wordsCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charsCount = content.length;
  const sprintProgress = sprintGoal > 0 ? Math.min(100, Math.round((wordsCount / sprintGoal) * 100)) : 0;

  // Detect 500-word milestones live during immersive writing session
  useEffect(() => {
    if (wordsCount >= 500) {
      const milestone = Math.floor(wordsCount / 500) * 500;
      if (!celebratedMilestonesRef.current.has(milestone)) {
        celebratedMilestonesRef.current.add(milestone);
        setMilestoneCelebration({ show: true, words: milestone });
      }
    }
  }, [wordsCount]);

  // Format time mm:ss or hh:mm:ss
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleUserActivity = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  };

  const currentBook = books.find((b) => b.id === selectedBookId);

  const handleFinishAndSave = () => {
    if (wordsCount === 0) {
      setFeedback('⚠️ Escreva algumas palavras antes de salvar a sessão.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const durationMinutes = Math.max(1, Math.round(seconds / 60));
    const todayStr = new Date().toISOString().split('T')[0];

    onSaveSession({
      projectId: currentBook?.projectId || '',
      bookId: selectedBookId,
      words: wordsCount,
      date: todayStr,
      durationMinutes,
      notes: `Sessão Imersiva: ${content.slice(0, 60)}...`,
      source: 'manual',
    });

    setFeedback(`🎉 Sessão salva! +${wordsCount} palavras registradas com sucesso.`);
    setTimeout(() => {
      handleSafeExit();
    }, 1500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      className="fixed inset-0 z-50 flex flex-col bg-[#faf7fd] dark:bg-[#12081f] text-[#220d3a] dark:text-[#f7f2fc] transition-colors duration-300 overflow-hidden select-text"
    >
      {/* Floating Top Minimalist Control Bar */}
      <header
        className={`w-full px-6 py-3.5 backdrop-blur-md bg-white/80 dark:bg-[#160b24]/90 border-b border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between transition-all duration-300 z-30 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6c2eb9] dark:bg-[#a875ec] animate-pulse"></span>
            <span className="font-serif-display font-bold text-sm tracking-wide text-[#220d3a] dark:text-[#f7f2fc]">
              Modo Imersivo
            </span>
          </div>

          {/* Book selector */}
          <div className="hidden sm:flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#ebdff2] dark:border-[#2d1b42] bg-white/80 dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:outline-hidden"
            >
              {books.length === 0 ? (
                <option value="">Sem livro vinculado</option>
              ) : (
                books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Stopwatch */}
          <div className="flex items-center gap-1.5 bg-[#f6f0fb] dark:bg-[#1f1033] px-3 py-1 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] text-xs font-mono font-bold text-[#220d3a] dark:text-[#f7f2fc]">
            <Clock className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
            <span>{formatTime(seconds)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              title={timerRunning ? 'Pausar cronômetro' : 'Continuar cronômetro'}
              className="p-1 hover:text-[#6c2eb9] dark:hover:text-[#a875ec] transition-colors cursor-pointer"
            >
              {timerRunning ? <Pause className="w-3 h-3 text-[#6c2eb9] dark:text-[#a875ec]" /> : <Play className="w-3 h-3 text-[#6c2eb9] dark:text-[#a875ec]" />}
            </button>
            <button
              onClick={() => setSeconds(0)}
              title="Zerar cronômetro"
              className="p-1 hover:text-[#6c2eb9] dark:hover:text-[#a875ec] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#6c2eb9] dark:text-[#a875ec]" />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Typography Switcher */}
          <button
            onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
            title={`Fonte: ${fontFamily === 'serif' ? 'Serifada' : 'Sem serifa'}`}
            className="p-2 rounded-xl text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Type className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
            <span className="hidden md:inline uppercase text-[10px]">{fontFamily}</span>
          </button>

          {/* Font size +/- */}
          <div className="hidden md:flex items-center rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white/50 dark:bg-[#160b24] p-0.5 text-xs">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-colors ${
                fontSize === 'normal'
                  ? 'bg-[#6c2eb9] text-white'
                  : 'text-[#5c4672] dark:text-[#c4b3d8]'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded-lg font-bold text-sm cursor-pointer transition-colors ${
                fontSize === 'large'
                  ? 'bg-[#6c2eb9] text-white'
                  : 'text-[#5c4672] dark:text-[#c4b3d8]'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2 py-0.5 rounded-lg font-bold text-base cursor-pointer transition-colors ${
                fontSize === 'huge'
                  ? 'bg-[#6c2eb9] text-white'
                  : 'text-[#5c4672] dark:text-[#c4b3d8]'
              }`}
            >
              A++
            </button>
          </div>

          {/* Background Music Selector (YouTube / Spotify) */}
          <button
            onClick={() => setIsMusicModalOpen(true)}
            title="Música de Fundo (YouTube ou Spotify)"
            className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border text-[#5c4672] dark:text-[#c4b3d8] border-[#ebdff2] dark:border-[#2d1b42] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] hover:border-[#6c2eb9]/40 group"
          >
            <Music className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec] group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline">Música</span>
            <div className="hidden sm:flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <YouTubeIcon className="w-3.5 h-3.5" />
              <SpotifyIcon className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Soundscapes Ambient Audio Selector */}
          <div className="relative">
            <button
              onClick={() => setIsSoundscapeOpen(!isSoundscapeOpen)}
              title="Sons Ambientes de Foco"
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                currentSoundscape !== 'none'
                  ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-[#5c4672] dark:text-[#c4b3d8] border-[#ebdff2] dark:border-[#2d1b42] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
              }`}
            >
              <Headphones className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
              <span className="hidden lg:inline">
                {currentSoundscape === 'none' ? 'Sons de Foco' : SOUNDSCAPE_OPTIONS.find(s => s.id === currentSoundscape)?.emoji}
              </span>
            </button>

            {isSoundscapeOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-72 p-4 bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#ebdff2] dark:border-[#2d1b42] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
                    <span className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                      Sons Ambientes para Foco
                    </span>
                  </div>
                  {currentSoundscape !== 'none' && (
                    <button
                      onClick={() => handleSelectSoundscape('none')}
                      className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                    >
                      Silenciar
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {SOUNDSCAPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSoundscape(opt.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        currentSoundscape === opt.id
                          ? 'bg-[#6c2eb9] text-white font-bold shadow-xs'
                          : 'hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] text-[#5c4672] dark:text-[#c4b3d8]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{opt.emoji}</span>
                        <div>
                          <span className="block leading-tight">{opt.label}</span>
                          <span className={`text-[10px] block opacity-70`}>{opt.description}</span>
                        </div>
                      </div>
                      {currentSoundscape === opt.id && (
                        <span className="w-2 h-2 rounded-full bg-[#a875ec] animate-ping" />
                      )}
                    </button>
                  ))}
                </div>

                {currentSoundscape !== 'none' && (
                  <div className="pt-2 border-t border-[#ebdff2] dark:border-[#2d1b42] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#5c4672] dark:text-[#c4b3d8]">
                      <span>Volume do Som</span>
                      <span>{soundscapeVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soundscapeVolume}
                      onChange={(e) => handleChangeVolume(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#6c2eb9]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen Mode Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia (Remover todas as barras do navegador)'}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isFullscreen
                ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 shadow-xs'
                : 'text-[#5c4672] dark:text-[#c4b3d8] border-[#ebdff2] dark:border-[#2d1b42] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033]'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
                <span className="hidden md:inline">Janela</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
                <span className="hidden md:inline">Tela Cheia</span>
              </>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
            className="p-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" /> : <Moon className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />}
          </button>

          {/* Save & Finish */}
          <button
            onClick={handleFinishAndSave}
            disabled={wordsCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-white" />
            <span>Salvar Sessão</span>
          </button>

          {/* Exit Immersive Mode */}
          <button
            onClick={handleSafeExit}
            title="Voltar ao App (Esc)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] hover:bg-white dark:hover:bg-[#2b1646] border border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8] text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
            <span>Voltar ao App (Esc)</span>
          </button>
        </div>
      </header>

      {/* Always-accessible floating buttons if header autohides */}
      {!controlsVisible && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 animate-in fade-in">
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold backdrop-blur-md border shadow-xl transition-all cursor-pointer active:scale-95 group ${
              isFullscreen
                ? 'bg-[#3b1268]/95 hover:bg-[#4a1882] border-purple-400/40 text-purple-200'
                : 'bg-[#1b0e2e]/90 hover:bg-[#1b0e2e] border-white/20'
            }`}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-purple-300" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-purple-300" />
            )}
            <span className="hidden sm:inline">{isFullscreen ? 'Janela' : 'Tela Cheia'}</span>
          </button>

          <button
            onClick={handleSafeExit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1b0e2e]/90 hover:bg-[#1b0e2e] text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer active:scale-95 group"
            title="Sair do Modo Imersivo e Voltar ao App (Esc)"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar ao App (Esc)</span>
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 p-3 px-5 rounded-2xl bg-[#e6f7f5] dark:bg-[#122e2b] border border-[#cbebe7] dark:border-[#1d3d3a] text-[#147d74] dark:text-[#2dd4bf] text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Focus Canvas Area */}
      <main className="flex-1 flex flex-col items-center justify-start overflow-y-auto px-4 sm:px-8 pt-8 pb-20">
        <div className="w-full max-w-3xl flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Deixe sua mente fluir livremente. Apenas você e suas palavras..."
            className={`w-full flex-1 bg-transparent border-none outline-hidden resize-none placeholder-[#8870a0]/40 ${
              fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            } ${
              fontSize === 'normal'
                ? 'text-base sm:text-lg'
                : fontSize === 'large'
                ? 'text-lg sm:text-xl'
                : 'text-xl sm:text-2xl'
            } ${lineHeight === 'relaxed' ? 'leading-loose' : 'leading-relaxed'}`}
            style={{ minHeight: '65vh' }}
          />
        </div>
      </main>

      {/* Discreet Bottom Stats Bar */}
      <footer
        className={`w-full py-3 px-6 backdrop-blur-md bg-white/70 dark:bg-[#160b24]/80 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between text-xs text-[#5c4672] dark:text-[#c4b3d8] transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-30 hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#220d3a] dark:text-[#f7f2fc] tabular-nums">
            {wordsCount} palavras
          </span>
          <span className="text-[#8870a0]">·</span>
          <span className="tabular-nums">{charsCount} caracteres</span>
        </div>

        {/* Sprint Target Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Meta do sprint:</span>
            <input
              type="number"
              min="50"
              step="50"
              value={sprintGoal}
              onChange={(e) => setSprintGoal(Number(e.target.value))}
              className="w-16 text-center font-bold px-1.5 py-0.5 rounded-md border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] text-xs tabular-nums"
            />
            <span className="font-bold text-[#147d74] dark:text-[#2dd4bf] tabular-nums">{sprintProgress}%</span>
          </div>

          <div className="w-24 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-linear-to-r from-[#6c2eb9] via-[#b83280] to-[#147d74] transition-all duration-300"
              style={{ width: `${sprintProgress}%` }}
            />
          </div>
        </div>
      </footer>

      {/* Floating 500-words Milestone Mini Celebration */}
      {milestoneCelebration && (
        <MilestoneMiniCelebration
          show={milestoneCelebration.show}
          wordCount={milestoneCelebration.words}
          onClose={() => setMilestoneCelebration(null)}
          customTitle={`🎉 Marca de ${milestoneCelebration.words} Palavras Atingida!`}
          customMessage="Que ritmo inspirador! O fluxo das palavras está a todo vapor. Pequena dose de dopamina merecida para a sua sessão!"
        />
      )}

      {/* Background Music Player & Modal (YouTube / Spotify) */}
      <ImmersiveMusicPlayer
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onOpen={() => setIsMusicModalOpen(true)}
      />
    </div>
  );
};
