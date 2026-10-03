import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  Copy,
  Check,
  Feather,
  RefreshCw,
  Flame,
  Lightbulb,
  ArrowRight,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import type { Book } from '../types';

export interface PlotIdea {
  title: string;
  tropeOrTheme: string;
  premise: string;
  conflict: string;
  writingPrompt: string;
}

interface PlotIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onStartWritingWithPrompt?: (promptText: string, bookId?: string) => void;
}

export const PlotIdeasModal: React.FC<PlotIdeasModalProps> = ({
  isOpen,
  onClose,
  books,
  onStartWritingWithPrompt,
}) => {
  // Determine the most recent book by createdAt
  const mostRecentBook = books.length > 0
    ? [...books].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )[0]
    : null;

  const [selectedBookId, setSelectedBookId] = useState<string>(mostRecentBook?.id || '');
  const [customGenre, setCustomGenre] = useState<string>(mostRecentBook?.genre || 'Ficção / Fantasia');
  const [ideas, setIdeas] = useState<PlotIdea[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Update selected book and genre when modal opens or books change
  useEffect(() => {
    if (mostRecentBook) {
      setSelectedBookId(mostRecentBook.id);
      setCustomGenre(mostRecentBook.genre || 'Ficção Geral');
    }
  }, [books.length, isOpen]);

  const activeBook = books.find((b) => b.id === selectedBookId) || mostRecentBook;

  // Handle book selection change
  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    const chosen = books.find((b) => b.id === bookId);
    if (chosen && chosen.genre) {
      setCustomGenre(chosen.genre);
    }
  };

  // Fetch 3 plot ideas from backend Gemini route
  const handleGenerateIdeas = async (overrideGenre?: string) => {
    const genreToUse = (overrideGenre || customGenre || activeBook?.genre || 'Ficção Geral').trim();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-plot-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genre: genreToUse,
          bookTitle: activeBook?.title,
          premise: activeBook?.premise,
          tone: activeBook?.tone,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o serviço de IA.');
      }

      const data = await response.json();
      if (Array.isArray(data.ideas) && data.ideas.length > 0) {
        setIdeas(data.ideas);
      } else {
        throw new Error('Nenhuma ideia retornada pela IA.');
      }
    } catch (err: any) {
      console.error('Erro ao gerar ideias de enredo:', err);
      setError(err?.message || 'Não foi possível gerar novas ideias no momento.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first open if ideas are empty
  useEffect(() => {
    if (isOpen && ideas.length === 0 && !loading) {
      handleGenerateIdeas();
    }
  }, [isOpen]);

  const handleCopyPrompt = (text: string, index: number) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleWriteNow = (prompt: PlotIdea) => {
    if (onStartWritingWithPrompt) {
      const headerNote = `[Ideia de Enredo: ${prompt.title} • Trope: ${prompt.tropeOrTheme}]\n\n${prompt.writingPrompt}\n\n`;
      onStartWritingWithPrompt(headerNote, activeBook?.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between bg-[#faf7fd] dark:bg-[#1f1033]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#6c2eb9] to-[#b83280] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#220d3a] dark:text-[#f7f2fc] leading-tight">
                  Gerador de Ideias de Enredo com IA
                </h3>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Gemini API
                </span>
              </div>
              <p className="text-xs text-[#8870a0] dark:text-[#9782ad]">
                3 prompts ricos em conflito, mistério e ganchos dramáticos para destravar o seu fluxo de escrita
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8870a0] hover:text-[#220d3a] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book / Genre Selection Context Bar */}
        <div className="px-6 py-3 bg-[#f6f0fb] dark:bg-[#190d29] border-b border-[#ebdff2] dark:border-[#2d1b42] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <BookOpen className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec] shrink-0" />
            <span className="font-semibold text-[#5c4672] dark:text-[#c4b3d8]">Livro Mais Recente:</span>
            {books.length > 0 ? (
              <select
                value={selectedBookId}
                onChange={(e) => handleBookChange(e.target.value)}
                className="font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-[#140922] border border-[#ebdff2] dark:border-[#2d1b42] text-[#220d3a] dark:text-[#f7f2fc] cursor-pointer focus:outline-hidden"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.genre || 'Ficção'})
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-bold text-[#220d3a] dark:text-[#f7f2fc]">Sem livro cadastrado</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#5c4672] dark:text-[#c4b3d8] font-semibold shrink-0">Gênero:</span>
            <input
              type="text"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              placeholder="Ex: Fantasia Sombria, Romance, Sci-Fi..."
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#140922] border border-[#ebdff2] dark:border-[#2d1b42] text-[#220d3a] dark:text-[#f7f2fc] text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#6c2eb9]"
            />
            <button
              onClick={() => handleGenerateIdeas()}
              disabled={loading}
              className="px-3 py-1 bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerar</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Ideas Cards */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-4 py-8">
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 mx-auto flex items-center justify-center text-[#6c2eb9] dark:text-[#a875ec] animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <h4 className="font-serif-display font-bold text-base text-[#220d3a] dark:text-[#f7f2fc]">
                  A IA Gemini está desenhando 3 enredos únicos...
                </h4>
                <p className="text-xs text-[#8870a0] dark:text-[#9782ad]">
                  Criando reviravoltas, conflitos dramáticos e ganchos de abertura para o gênero <strong>{customGenre}</strong>.
                </p>
              </div>

              {/* Shimmer Skeletons */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-[#ebdff2]/60 dark:border-[#2d1b42]/60 bg-[#faf7fd] dark:bg-[#1a0e2e]/50 animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-800" />
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded-md" />
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded-md" />
                  </div>
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-md" />
                  <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-800 rounded-md" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Lightbulb className="w-10 h-10 text-[#8870a0] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#5c4672] dark:text-[#c4b3d8]">
                Clique no botão abaixo para gerar seus 3 primeiros prompts de enredo!
              </p>
              <button
                onClick={() => handleGenerateIdeas()}
                className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-[#6c2eb9] to-[#b83280] text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition-all"
              >
                Gerar Ideias de Enredo Agora
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.map((idea, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1a0e2e] shadow-sm hover:border-[#6c2eb9]/50 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#6c2eb9] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {idx + 1}
                        </span>
                        <h4 className="font-serif-display font-bold text-base text-[#220d3a] dark:text-[#f7f2fc] group-hover:text-[#6c2eb9] dark:group-hover:text-[#a875ec] transition-colors">
                          {idea.title}
                        </h4>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f3e8ff] dark:bg-[#2b104a] text-[#6c2eb9] dark:text-[#c084fc] border border-[#e9d5ff] dark:border-[#3b1268]">
                        {idea.tropeOrTheme}
                      </span>
                    </div>

                    {/* Premise */}
                    <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed mb-2.5">
                      {idea.premise}
                    </p>

                    {/* Conflict & Stakes */}
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-xs mb-3">
                      <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-rose-900 dark:text-rose-200">
                        <strong className="font-bold">Conflito & O que está em jogo:</strong> {idea.conflict}
                      </div>
                    </div>

                    {/* Writing Prompt Hook Block */}
                    <div className="relative p-3 rounded-xl bg-white dark:bg-[#12081f] border border-[#ebdff2] dark:border-[#2d1b42] shadow-inner">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c2eb9] dark:text-[#a875ec] flex items-center gap-1 mb-1">
                        <Feather className="w-3 h-3" />
                        <span>Gancho para Iniciar o Rascunho</span>
                      </span>
                      <blockquote className="font-serif text-xs sm:text-sm text-[#220d3a] dark:text-[#f7f2fc] italic leading-relaxed">
                        “{idea.writingPrompt}”
                      </blockquote>
                    </div>
                  </div>

                  {/* Action buttons on card */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ebdff2]/60 dark:border-[#2d1b42]/60">
                    <button
                      onClick={() => handleCopyPrompt(idea.writingPrompt, idx)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#140922] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      title="Copiar frase de abertura"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
                          <span>Copiar Gancho</span>
                        </>
                      )}
                    </button>

                    {onStartWritingWithPrompt && (
                      <button
                        onClick={() => handleWriteNow(idea)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Abrir no Modo Imersivo com este prompt pré-carregado"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                        <span>Escrever Agora</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between bg-[#faf7fd] dark:bg-[#1f1033]">
          <span className="text-[11px] text-[#8870a0] dark:text-[#9782ad]">
            💡 Dica: Você pode copiar o gancho ou clicar em <strong>Escrever Agora</strong> para abrir o Modo Imersivo direto.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateIdeas()}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#140922] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-[#6c2eb9] dark:text-[#a875ec] text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Novas Ideias</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
