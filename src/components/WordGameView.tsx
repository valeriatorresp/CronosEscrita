import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Shuffle,
  Search,
  BookOpen,
  Feather,
  Send,
  Save,
  CheckCircle2,
  Trash2,
  Copy,
  Lightbulb,
  Maximize2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Target,
  Flame,
  BookMarked,
  Filter,
  HelpCircle,
  Info,
} from 'lucide-react';
import type { DailyPromptWord, SavedMicroStory, Book } from '../types';
import {
  PROMPT_WORDS,
  getRandomPromptWord,
  searchPromptWord,
} from '../data/wordsDictionary';
import {
  CREATIVE_CHALLENGES,
  CreativeChallenge,
  getRandomChallenge,
  getChallengeByCategory,
} from '../data/creativePrompts';

interface WordGameViewProps {
  books: Book[];
  savedStories: SavedMicroStory[];
  onSaveStory: (story: SavedMicroStory) => void;
  onDeleteStory: (storyId: string) => void;
  onRegisterSession: (bookId: string, words: number, notes: string) => void;
  onOpenImmersive?: (text?: string, bookId?: string) => void;
}

export const WordGameView: React.FC<WordGameViewProps> = ({
  books,
  savedStories,
  onSaveStory,
  onDeleteStory,
  onRegisterSession,
  onOpenImmersive,
}) => {
  // --- Sessão 1: Desafios Criativos de Escrita ---
  const [selectedCategory, setSelectedCategory] = useState<
    CreativeChallenge['category'] | 'todos'
  >('todos');
  const [currentChallenge, setCurrentChallenge] = useState<CreativeChallenge>(() => CREATIVE_CHALLENGES[0]);

  // --- Sessão 2: Palavra-Puxa-Palavra ---
  const [currentWord, setCurrentWord] = useState<DailyPromptWord>(() => PROMPT_WORDS[0]);
  const [customSearch, setCustomSearch] = useState('');

  // --- Sessão 3: Sprint de Foco & Cronômetro ---
  const [sprintMinutes, setSprintMinutes] = useState<number>(10);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(10 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [continuousFlowMode, setContinuousFlowMode] = useState<boolean>(false);
  const [showSprintHelp, setShowSprintHelp] = useState<boolean>(false);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(Date.now());
  const [isIdleWarning, setIsIdleWarning] = useState<boolean>(false);

  // --- Sessão 4: Área de Escrita & Caderno de Rascunhos ---
  const [writtenText, setWrittenText] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [feedback, setFeedback] = useState<string | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Contadores ao vivo
  const wordsCount = writtenText.trim() ? writtenText.trim().split(/\s+/).length : 0;
  const charsCount = writtenText.length;

  // Sinal sonoro suave ao término do sprint
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio não suportado ou bloqueado pelo navegador
    }
  };

  // Efeito do cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playChime();
            setFeedback('🔔 Tempo concluído! Parabéns pelo sprint de escrita!');
            setTimeout(() => setFeedback(null), 5000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeftSeconds]);

  // Alerta de fluxo contínuo (>8s sem digitar no modo fluxo)
  useEffect(() => {
    if (!continuousFlowMode || !isTimerRunning) {
      setIsIdleWarning(false);
      return;
    }

    const checkInterval = setInterval(() => {
      const idleTime = Date.now() - lastKeystrokeTime;
      if (idleTime > 8000 && writtenText.trim().length > 0) {
        setIsIdleWarning(true);
      } else {
        setIsIdleWarning(false);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [continuousFlowMode, isTimerRunning, lastKeystrokeTime, writtenText]);

  // Digitação
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWrittenText(e.target.value);
    setLastKeystrokeTime(Date.now());
    if (isIdleWarning) setIsIdleWarning(false);
  };

  // Filtro de categoria de desafios
  const handleCategoryChange = (cat: CreativeChallenge['category'] | 'todos') => {
    setSelectedCategory(cat);
    const filtered = getChallengeByCategory(cat);
    if (filtered.length > 0) {
      setCurrentChallenge(filtered[0]);
    }
  };

  // Sortear desafio
  const handleShuffleChallenge = () => {
    const list = getChallengeByCategory(selectedCategory);
    const candidates = list.filter((c) => c.id !== currentChallenge.id);
    if (candidates.length > 0) {
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      setCurrentChallenge(next);
    } else {
      setCurrentChallenge(getRandomChallenge(currentChallenge.id));
    }
  };

  // Inserir desafio no editor
  const handleUseChallengeInEditor = () => {
    const header = currentChallenge.category === 'primeira_frase'
      ? `${currentChallenge.statement.replace(/[“”]/g, '')}\n\n`
      : `/* Desafio: ${currentChallenge.title} */\n/* Provocação: ${currentChallenge.provocation} */\n\n`;

    setWrittenText((prev) => (prev ? `${prev}\n\n${header}` : header));
    editorRef.current?.focus();
    setFeedback('✨ Desafio inserido na sua área de escrita!');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Iniciar sprint com tempo sugerido
  const handleStartChallengeSprint = (minutes?: number) => {
    const mins = minutes || currentChallenge.suggestedDurationMinutes || 10;
    setSprintMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setIsTimerRunning(true);
    handleUseChallengeInEditor();
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sortear Palavra-Puxa-Palavra
  const handleShuffleWord = () => {
    const next = getRandomPromptWord(currentWord.word);
    setCurrentWord(next);
    setCustomSearch('');
  };

  // Buscar Palavra-Puxa-Palavra
  const handleSearchWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    const found = searchPromptWord(customSearch.trim());
    setCurrentWord(found);
  };

  // Inserir palavra no editor
  const handleUseWordInEditor = () => {
    const note = `[Palavra-Puxa-Palavra: ${currentWord.word} — ${currentWord.meaning.slice(0, 80)}...]\n\n`;
    setWrittenText((prev) => (prev ? `${prev}\n\n${note}` : note));
    editorRef.current?.focus();
    setFeedback(`🌿 “${currentWord.word}” inserida na sua área de escrita!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Presets do cronômetro
  const handleSetTimerMinutes = (mins: number) => {
    setSprintMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setIsTimerRunning(false);
  };

  const handleToggleTimer = () => {
    if (timeLeftSeconds === 0) {
      setTimeLeftSeconds(sprintMinutes * 60);
    }
    setIsTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeftSeconds(sprintMinutes * 60);
    setIsIdleWarning(false);
  };

  // Guardar apenas no caderno de rascunhos
  const handleSaveOnly = () => {
    if (!writtenText.trim()) return;
    const story: SavedMicroStory = {
      id: `practice_${Date.now()}`,
      word: currentWord.word,
      promptTitle: currentChallenge.title,
      category: currentChallenge.categoryLabel,
      text: writtenText.trim(),
      wordCount: wordsCount,
      durationMinutes: sprintMinutes,
      createdAt: new Date().toISOString(),
      transferredToSession: false,
    };
    onSaveStory(story);
    setFeedback('✨ Rascunho guardado com sucesso no seu Caderno de Prática!');
    setTimeout(() => setFeedback(null), 4000);
  };

  // Registrar como Sessão Oficial na meta
  const handleRegisterAsSession = () => {
    if (!writtenText.trim()) {
      setFeedback('⚠️ Escreva um texto antes de registrar como sessão.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    if (!selectedBookId) {
      setFeedback('⚠️ Selecione ou cadastre um projeto para receber as palavras escritas.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const story: SavedMicroStory = {
      id: `practice_${Date.now()}`,
      word: currentWord.word,
      promptTitle: currentChallenge.title,
      category: currentChallenge.categoryLabel,
      text: writtenText.trim(),
      wordCount: wordsCount,
      durationMinutes: sprintMinutes,
      createdAt: new Date().toISOString(),
      transferredToSession: true,
    };
    onSaveStory(story);

    onRegisterSession(
      selectedBookId,
      wordsCount,
      `Treino & Prática: “${currentChallenge.title}” / Palavra “${currentWord.word}” — ${writtenText.slice(0, 60)}...`
    );

    setFeedback(
      `🎉 Sensacional! +${wordsCount} palavras somadas à sua meta oficial e salvas no projeto!`
    );
    setWrittenText('');
    setIsTimerRunning(false);
    setTimeout(() => setFeedback(null), 5000);
  };

  // Formato MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerPercentage = sprintMinutes > 0 ? ((sprintMinutes * 60 - timeLeftSeconds) / (sprintMinutes * 60)) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Hero Header */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-10 shadow-lg bg-gradient-to-br from-[#120a1f] via-[#1a0f2b] to-[#120721] dark:from-[#0f071a] dark:to-[#0a0413] border border-[#ebdff2]/20 dark:border-[#2d1b42] text-white">
        {/* Soft ambient glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#9333ea]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#ec4899]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9333ea]/20 backdrop-blur-md border border-[#a855f7]/40 text-xs font-bold tracking-wider uppercase text-[#c084fc] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
                <span>CronosFoco · Arena de Criatividade & Sprints</span>
              </div>

              <h1 className="font-serif-display text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                CronosEscrita -{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#ec4899]">
                  Prática de Escrita
                </span>{' '}
                ✍️
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">
                O músculo da escrita se fortalece com constância e liberdade. Explore desafios provocativos,
                brinque com o jogo palavra-puxa-palavra, realize sprints cronometrados de foco e guarde
                seus rascunhos para alimentar seus livros e projetos.
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('sessao-palavra-puxa');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all backdrop-blur-md border border-white/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  <span>1. Palavra-Puxa</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('sessao-desafios');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all backdrop-blur-md border border-white/20 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  <span>2. Desafios</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('sessao-sprint');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all backdrop-blur-md border border-white/20 cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  <span>3. Sprints</span>
                </button>
                <button
                  onClick={() => {
                    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
                    editorRef.current?.focus();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] text-xs font-semibold text-white transition-all shadow-xs active:scale-95 cursor-pointer border border-[#c084fc]/40"
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>4. Escrever Agora</span>
                </button>
              </div>
            </div>

            {/* Right-side Sprint Status Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shrink-0 flex flex-col justify-between shadow-lg min-w-[260px]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#c084fc] font-bold block">
                  Status do Sprint
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isTimerRunning ? 'bg-amber-400 opacity-75' : 'bg-purple-400 opacity-50'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isTimerRunning ? 'bg-amber-500' : 'bg-purple-500'}`}></span>
                  </span>
                  <span className="font-serif-display text-xl font-bold text-white">
                    {isTimerRunning ? 'Sprint em Andamento' : 'Pronto para Escrever'}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                <span>Tempo Alvo: <strong>{sprintMinutes} min</strong></span>
                <span className="text-[#2dd4bf] font-bold">{wordsCount} palavras</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (4 chips row) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Palavra Sorteada</span>
                <span className="text-base font-bold text-white truncate max-w-[130px] block">
                  {currentWord.word}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Desafio Criativo</span>
                <span className="text-base font-bold text-white">
                  {currentChallenge.categoryLabel}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Caderno de Rascunhos</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {savedStories.length} histórias
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Modo Anti-Bloqueio</span>
                <span className="text-base font-bold text-emerald-400">
                  {continuousFlowMode ? 'Ativado' : 'Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SESSÃO 1: PALAVRA-PUXA-PALAVRA                           */}
      {/* ======================================================== */}
      <section
        id="sessao-palavra-puxa"
        className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6]">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Palavra-Puxa-Palavra
              </h2>
            </div>
            <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
              Uma semente lexical para acordar os sentidos: consulte significados poéticos, explore contrastes e ressonâncias.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleWord}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#25133c] text-xs font-semibold transition-all border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-[#b83280]" />
              <span>Trocar Palavra</span>
            </button>
          </div>
        </div>

        {/* Busca de palavras */}
        <form onSubmit={handleSearchWord} className="mt-6 flex flex-wrap gap-2 max-w-lg">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#5c4672]/50 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="Pesquise uma palavra (ex: Saudade, Maresia, Labirinto...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#12071f] border border-[#ebdff2] dark:border-[#2d1b42] text-[#220d3a] dark:text-[#f7f2fc] placeholder-[#5c4672]/50 text-xs focus:outline-hidden focus:border-[#532380]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] font-semibold text-xs text-white transition-all shadow-xs active:scale-95 cursor-pointer border border-[#6c2ea6]/40"
          >
            Consultar
          </button>
        </form>

        {/* Card da Palavra-Puxa-Palavra */}
        <div className="mt-6 p-6 sm:p-8 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1c0e2e]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#b83280] dark:text-[#f472b6] bg-[#fae8f2] dark:bg-[#341628] px-2.5 py-0.5 rounded-md border border-[#f5cbe2] dark:border-[#521c3c]">
                {currentWord.category}
              </span>
              <h3 className="font-serif-display text-4xl sm:text-5xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-2">
                {currentWord.word}
              </h3>
            </div>

            <button
              onClick={handleUseWordInEditor}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer border border-[#6c2ea6]/40"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Usar “{currentWord.word}” no Editor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* Significado Poético */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#532380] dark:text-[#c4b3d8] block mb-2">
                  📖 Significado Poético
                </span>
                <p className="text-xs text-[#220d3a]/90 dark:text-[#f7f2fc]/90 leading-relaxed font-medium">
                  {currentWord.meaning}
                </p>
              </div>
              {currentWord.poeticExample && (
                <div className="mt-3 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42] text-xs italic text-[#5c4672] dark:text-[#c4b3d8]">
                  {currentWord.poeticExample}
                </div>
              )}
            </div>

            {/* Sinônimos & Ressonâncias */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#160b24] border border-[#bbf0eb] dark:border-[#14534f]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] block mb-2">
                🌿 Ressonâncias & Sinônimos
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentWord.synonyms.map((syn, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf] text-xs font-semibold border border-[#bbf0eb] dark:border-[#14534f]"
                  >
                    {syn}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[#147d74]/80 dark:text-[#2dd4bf]/80 mt-3 leading-relaxed">
                Use variações para ampliar a textura do seu texto sem cair na redundância.
              </p>
            </div>

            {/* Antônimos & Tensões */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#160b24] border border-[#f5cbe2] dark:border-[#521c3c]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b83280] dark:text-[#f472b6] block mb-2">
                ⚡ Tensões & Antônimos
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentWord.antonyms.map((ant, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6] text-xs font-semibold border border-[#f5cbe2] dark:border-[#521c3c]"
                  >
                    {ant}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[#b83280]/80 dark:text-[#f472b6]/80 mt-3 leading-relaxed">
                O choque de opostos é a matéria-prima do conflito dramático.
              </p>
            </div>
          </div>

          {currentWord.sparkIdea && (
            <div className="mt-5 p-4 rounded-xl bg-[#faf7fd] dark:bg-[#1f0f33] border border-[#ebdff2] dark:border-[#2d1b42] flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-[#b83280] dark:text-[#f472b6] shrink-0 mt-0.5" />
              <p className="text-xs text-[#220d3a]/90 dark:text-[#f7f2fc]/90">
                <strong className="text-[#532380] dark:text-[#c4b3d8]">Gatilho de Cena: </strong>
                {currentWord.sparkIdea}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SESSÃO 2: DESAFIOS CRIATIVOS                            */}
      {/* ======================================================== */}
      <section
        id="sessao-desafios"
        className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#f4ecf8] dark:bg-[#26133a] text-[#532380] dark:text-[#c4b3d8]">
                <Target className="w-5 h-5" />
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Desafios Criativos
              </h2>
            </div>
            <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
              Provocações literárias desenhadas para destravar o fluxo, experimentar novos pontos de vista e escapar do óbvio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleChallenge}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#25133c] text-xs font-semibold transition-all border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-[#b83280]" />
              <span>Sortear Novo Desafio</span>
            </button>
          </div>
        </div>

        {/* Categorias dos desafios */}
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[#ebdff2]/60 dark:border-[#2d1b42]/60 text-xs">
          <span className="text-[11px] font-bold text-[#5c4672]/70 dark:text-[#c4b3d8]/70 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Categorias:
          </span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'primeira_frase', label: 'Primeira Frase' },
            { id: 'conflito', label: 'Conflito & Dilema' },
            { id: 'personagem', label: 'Personagem' },
            { id: 'sensorial', label: 'Sensorial & Clima' },
            { id: 'dialogo_voz', label: 'Diálogo & Voz' },
            { id: 'cenario_mundo', label: 'Cenário & Mundo' },
            { id: 'desafio_restricao', label: 'Com Restrição' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as CreativeChallenge['category'] | 'todos')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer select-none active:scale-95 ${
                selectedCategory === cat.id
                  ? 'bg-[#532380] text-white shadow-xs'
                  : 'bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#25133c] border border-[#ebdff2] dark:border-[#2d1b42]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Card do Desafio Selecionado */}
        <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-white dark:bg-[#160b24] text-[#532380] dark:text-[#c4b3d8] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
                {currentChallenge.categoryLabel}
              </span>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                {currentChallenge.title}
              </h3>
            </div>

            {currentChallenge.suggestedDurationMinutes && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf] border border-[#bbf0eb] dark:border-[#14534f]">
                <Timer className="w-3.5 h-3.5 text-[#147d74] dark:text-[#2dd4bf]" />
                <span>Sugestão: {currentChallenge.suggestedDurationMinutes} min</span>
              </span>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
            <p className="font-serif text-lg sm:text-xl text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed italic">
              {currentChallenge.statement}
            </p>
          </div>

          <div className="mt-4 flex items-start gap-3 text-xs sm:text-sm text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed font-medium">
            <Lightbulb className="w-4 h-4 text-[#b83280] dark:text-[#f472b6] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#220d3a] dark:text-[#f7f2fc]">Provocação: </strong>
              {currentChallenge.provocation}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#ebdff2] dark:border-[#2d1b42] flex flex-wrap items-center gap-3">
            <button
              onClick={handleUseChallengeInEditor}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer border border-[#6c2ea6]/40"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Usar este Desafio no Editor</span>
            </button>

            <button
              onClick={() => handleStartChallengeSprint(currentChallenge.suggestedDurationMinutes)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#147d74] hover:bg-[#0f625b] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer border border-[#147d74]/40"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Iniciar Sprint de {currentChallenge.suggestedDurationMinutes || 10} min</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SESSÃO 3: SPRINT DE FOCO COM CRONÔMETRO                  */}
      {/* ======================================================== */}
      <section
        id="sessao-sprint"
        className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf]">
                <Timer className="w-5 h-5" />
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Sprint de Foco & Cronômetro
              </h2>
            </div>
            <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
              Escreva sem interrupções por um bloco fechado de tempo. A regra de ouro: <strong>não pause para editar</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão de Ajuda e Explicação */}
            <button
              onClick={() => setShowSprintHelp((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#0c2a27] border border-[#bbf0eb] dark:border-[#14534f] hover:bg-white dark:hover:bg-[#123835] transition-all cursor-pointer"
              title="Entenda como funciona o Sprint e os modos de escrita"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#147d74] dark:text-[#2dd4bf]" />
              <span>Como funciona?</span>
            </button>

            {/* Alternância do modo fluxo contínuo */}
            <button
              onClick={() => setContinuousFlowMode((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer active:scale-95 ${
                continuousFlowMode
                  ? 'bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6] border-[#f5cbe2] dark:border-[#521c3c] shadow-xs'
                  : 'bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#5c4672] dark:text-[#c4b3d8] border-[#ebdff2] dark:border-[#2d1b42] hover:bg-white dark:hover:bg-[#25133c]'
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  continuousFlowMode
                    ? 'text-[#b83280] dark:text-[#f472b6]'
                    : 'text-[#b83280]/60 dark:text-[#f472b6]/60'
                }`}
              />
              <span>Modo Fluxo Contínuo {continuousFlowMode ? '(Ativo)' : ''}</span>
            </button>
          </div>
        </div>

        {/* Guia explicativo expansível */}
        {showSprintHelp && (
          <div className="mt-5 p-5 rounded-2xl bg-[#e6f7f5] dark:bg-[#0c2a27] border border-[#bbf0eb] dark:border-[#14534f] text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#0d4f49] dark:text-[#b4f0eb] font-bold text-sm">
              <Info className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf] shrink-0" />
              <span>Guia do Treino de Escrita: O que é e como aproveitar?</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#160b24] border border-[#bbf0eb] dark:border-[#14534f]">
                <span className="font-bold text-[#147d74] dark:text-[#2dd4bf] block mb-1">
                  ⏱️ O que é “Sprint”?
                </span>
                <p className="text-[#220d3a]/80 dark:text-[#f7f2fc]/80 leading-relaxed text-[11px]">
                  É uma corrida curta de escrita com tempo fixo (5 a 20 min). Seu único objetivo é produzir sem interrupções do mundo exterior até o alarme tocar.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#160b24] border border-[#f5cbe2] dark:border-[#521c3c]">
                <span className="font-bold text-[#b83280] dark:text-[#f472b6] block mb-1">
                  🚫 Por que “Não pause para editar”?
                </span>
                <p className="text-[#220d3a]/80 dark:text-[#f7f2fc]/80 leading-relaxed text-[11px]">
                  O cérebro tem dois modos: o <em>Criador</em> (que inventa) e o <em>Editor</em> (que julga e corta). Se você parar para corrigir pontuação, concordância ou trocar adjetivos durante a criação, a inspiração trava. <strong>Escreva imperfeito agora, revise amanhã!</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42]">
                <span className="font-bold text-[#532380] dark:text-[#c4b3d8] block mb-1">
                  🔥 O que é o “Modo Fluxo Contínuo”?
                </span>
                <p className="text-[#220d3a]/80 dark:text-[#f7f2fc]/80 leading-relaxed text-[11px]">
                  Técnica de <em>escrita livre</em>: você treina digitar sem parar a mão. Se ficar mais de 8 segundos hesitando na tela, um aviso gentil lembra você de não se censurar e continuar a narrativa.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Painel do Cronômetro */}
        <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Botões de presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] block w-full mb-1">
              Escolha a Duração do Sprint:
            </span>
            {[
              { mins: 5, label: '5 min', desc: 'Aquecimento Expresso' },
              { mins: 10, label: '10 min', desc: 'Sprint Clássico' },
              { mins: 15, label: '15 min', desc: 'Imersão Criativa' },
              { mins: 20, label: '20 min', desc: 'Ritmo Profundo' },
            ].map((p) => (
              <button
                key={p.mins}
                onClick={() => handleSetTimerMinutes(p.mins)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  sprintMinutes === p.mins
                    ? 'bg-[#532380] text-white shadow-xs'
                    : 'bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] border border-[#ebdff2] dark:border-[#2d1b42] hover:border-[#532380]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Display Digital */}
          <div className="flex flex-col items-center gap-3">
            <div className="font-mono text-4xl sm:text-5xl font-bold text-[#220d3a] dark:text-[#f7f2fc] tracking-tight tabular-nums">
              {formatTime(timeLeftSeconds)}
            </div>

            {/* Barra de progresso */}
            <div className="w-48 sm:w-60 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#532380] via-[#b83280] to-[#147d74] transition-all duration-300"
                style={{ width: `${timerPercentage}%` }}
              />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleToggleTimer}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-xs active:scale-95 cursor-pointer ${
                  isTimerRunning
                    ? 'bg-[#b83280] hover:bg-[#992266]'
                    : 'bg-[#147d74] hover:bg-[#0f625b]'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Iniciar Sprint</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimer}
                title="Reiniciar Cronômetro"
                className="p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#160b24] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Alerta de fluxo contínuo */}
        {isIdleWarning && (
          <div className="mt-4 p-3 rounded-xl bg-[#fae8f2] dark:bg-[#341628] border border-[#f5cbe2] dark:border-[#521c3c] text-[#b83280] dark:text-[#f472b6] text-xs font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#b83280] dark:text-[#f472b6] shrink-0" />
            <span>Mantenha o fluxo! Continue digitando sem parar, deixe a autocensura para depois!</span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* SESSÃO 4: ÁREA DE ESCRITA & CADERNO DE RASCUNHOS         */}
      {/* ======================================================== */}
      <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6]">
                <Feather className="w-5 h-5" />
              </span>
              <h2 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Área de Escrita
              </h2>
            </div>
            <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
              Escreva livremente seus rascunhos, microcontos e cenas do dia.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenImmersive && (
              <button
                type="button"
                onClick={() => onOpenImmersive(writtenText, selectedBookId)}
                title="Abre o editor em tela cheia, sem menus e sem distrações visuais"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1c0e2e] hover:bg-white dark:hover:bg-[#25133c] text-[#5c4672] dark:text-[#c4b3d8] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#b83280] dark:text-[#f472b6]" />
                <span>Modo Imersivo (Tela Cheia)</span>
              </button>
            )}
            <span className="px-3 py-1.5 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#532380] dark:text-[#c4b3d8] font-bold text-xs border border-[#ebdff2] dark:border-[#2d1b42] tabular-nums">
              {wordsCount} palavras
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#5c4672]/70 dark:text-[#c4b3d8]/70 font-semibold text-xs border border-[#ebdff2] dark:border-[#2d1b42] tabular-nums">
              {charsCount} caracteres
            </span>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#e6f7f5] dark:bg-[#0c2a27] border border-[#bbf0eb] dark:border-[#14534f] text-[#0d4f49] dark:text-[#b4f0eb] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf] shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Editor de Texto */}
        <div className="mt-5">
          <textarea
            ref={editorRef}
            rows={10}
            value={writtenText}
            onChange={handleTextChange}
            placeholder="Deixe suas ideias correrem livremente no papel digital... Pode ser um fragmento, uma cena, um poema ou o começo de um capítulo."
            className="w-full p-5 rounded-2xl border-2 border-[#ebdff2] dark:border-[#2d1b42] bg-[#fdfcff] dark:bg-[#12071f] focus:border-[#532380] outline-hidden text-sm sm:text-base leading-relaxed text-[#220d3a] dark:text-[#f7f2fc] placeholder-[#5c4672]/40 dark:placeholder-[#c4b3d8]/40 font-serif"
          />
        </div>

        {/* Ações e Vinculação ao Livro */}
        <div className="mt-6 pt-5 border-t border-[#ebdff2] dark:border-[#2d1b42]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Seletor de Livro / Projeto */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <label className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] shrink-0 flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-[#532380] dark:text-[#c4b3d8]" />
                <span>Vincular ao Projeto:</span>
              </label>
              <div className="relative min-w-[220px]">
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full text-xs font-semibold text-[#220d3a] dark:text-[#f7f2fc] pl-3.5 pr-8 py-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] focus:border-[#532380] outline-hidden transition-all cursor-pointer truncate"
                >
                  {books.length === 0 ? (
                    <option value="">Nenhum livro cadastrado</option>
                  ) : (
                    books.map((b) => (
                      <option key={b.id} value={b.id} className="dark:bg-[#1c0e2e]">
                        {b.title}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={handleSaveOnly}
                disabled={!writtenText.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1c0e2e] hover:bg-white dark:hover:bg-[#25133c] text-[#5c4672] dark:text-[#c4b3d8] text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4 text-[#532380] dark:text-[#c4b3d8] shrink-0" />
                <span>Guardar Rascunho</span>
              </button>

              <button
                type="button"
                onClick={handleRegisterAsSession}
                disabled={!writtenText.trim() || !selectedBookId}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-[#6c2ea6]/40"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Registrar como Sessão (+{wordsCount} pal.)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* CADERNO DE RASCUNHOS & ESCRITAS DA PRÁTICA               */}
      {/* ======================================================== */}
      {savedStories.length > 0 && (
        <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf]">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Caderno de Rascunhos da Prática ({savedStories.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {savedStories.map((story) => (
              <div
                key={story.id}
                className="p-5 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd]/60 dark:bg-[#1c0e2e]/60 hover:border-[#532380]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif-display font-bold text-base text-[#220d3a] dark:text-[#f7f2fc]">
                      {story.promptTitle || story.word}
                    </span>
                    <span className="text-[10px] font-semibold text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#0c2a27] px-2 py-0.5 rounded-md border border-[#bbf0eb] dark:border-[#14534f] tabular-nums">
                      {story.wordCount} palavras
                    </span>
                  </div>
                  <p className="text-xs text-[#220d3a]/80 dark:text-[#f7f2fc]/80 leading-relaxed font-serif whitespace-pre-wrap line-clamp-6">
                    {story.text}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between text-[11px] text-[#5c4672]/70 dark:text-[#c4b3d8]/70">
                  <span className="tabular-nums">{new Date(story.createdAt).toLocaleDateString('pt-BR')}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(story.text);
                        setFeedback('Texto copiado para a área de transferência!');
                        setTimeout(() => setFeedback(null), 3000);
                      }}
                      title="Copiar texto"
                      className="p-1 hover:text-[#532380] dark:hover:text-[#c4b3d8] rounded-md cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStory(story.id)}
                      title="Excluir"
                      className="p-1 hover:text-[#b83280] dark:hover:text-[#f472b6] rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
