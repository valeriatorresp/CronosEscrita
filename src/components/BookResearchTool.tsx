import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  BookmarkPlus,
  Trash2,
  BookOpen,
  Compass,
  History,
  AlertCircle,
  Lightbulb,
  Globe,
  Tag,
  Clock,
  Layers,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import type { Book, GroundingSource, ResearchQueryItem } from '../types';
import { performLiteraryResearch } from '../services/research';

interface BookResearchToolProps {
  book?: Book;
  books?: Book[];
  onUpdateBook?: (updatedBook: Book) => void;
  onSelectBook?: (bookId: string) => void;
  onClose?: () => void;
  initialQuery?: string;
  autoSearchOnMount?: boolean;
  sectionPart?: 'all' | 'search' | 'caderno';
  children?: React.ReactNode;
}

type ResearchCategory = 'all' | 'historical' | 'sensory' | 'technical' | 'fact_check' | 'names';

const CATEGORIES: { id: ResearchCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Todas as Áreas', icon: '✨' },
  { id: 'historical', label: 'História & Época', icon: '🏛️' },
  { id: 'sensory', label: 'Detalhes Sensoriais', icon: '🌿' },
  { id: 'technical', label: 'Termos & Vocabulário', icon: '🗡️' },
  { id: 'fact_check', label: 'Fact-Checking & Ciência', icon: '🔍' },
  { id: 'names', label: 'Nomes & Folclore', icon: '📜' },
];

const SUGGESTIONS = [
  { text: 'Como as pessoas iluminavam tabernas e ruas antes da eletricidade?', category: 'historical' },
  { text: 'Quais os sons e odores característicos de uma ferraria artesanal?', category: 'sensory' },
  { text: 'Termos náuticos de um veleiro de três mastros para marinheiros', category: 'technical' },
  { text: 'Quanto tempo uma tocha realmente queima no escuro?', category: 'fact_check' },
  { text: 'Nomes e títulos nobiliárquicos medievais e suas hierarquias', category: 'names' },
  { text: 'Sintomas e antídotos naturais para envenenamento em florestas', category: 'fact_check' },
];

export const BookResearchTool: React.FC<BookResearchToolProps> = ({
  book,
  books = [],
  onUpdateBook,
  onSelectBook,
  onClose,
  initialQuery = '',
  autoSearchOnMount = false,
  sectionPart = 'all',
  children,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<ResearchCategory>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initialQuery when passed from parent
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      if (autoSearchOnMount) {
        handleSearch(initialQuery);
      }
    }
  }, [initialQuery]);

  // Current search result
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [currentSources, setCurrentSources] = useState<GroundingSource[]>([]);
  const [currentSearchQueries, setCurrentSearchQueries] = useState<string[]>([]);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Standalone notes fallback if no book is attached
  const [standaloneNotes, setStandaloneNotes] = useState<ResearchQueryItem[]>(() => {
    try {
      const stored = localStorage.getItem('cronos_standalone_research_notes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filter for saved history
  const [savedFilter, setSavedFilter] = useState<string>('');

  // IMMERSIVE READING MODE FOR RESEARCH NOTES
  const [immersiveReadingItem, setImmersiveReadingItem] = useState<{
    title: string;
    content: string;
    subtitle?: string;
  } | null>(null);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [readingFontSize, setReadingFontSize] = useState<number>(18); // Font size in px
  const [readingFontFamily, setReadingFontFamily] = useState<'serif' | 'sans'>('serif');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setImmersiveReadingItem(null);
      }
    };
    if (immersiveReadingItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [immersiveReadingItem]);

  const savedNotes = book ? book.researchNotes || [] : standaloneNotes;

  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentAnswer(null);
    setCurrentSources([]);
    setCurrentSearchQueries([]);
    setLastQuery(q);
    setCopied(false);
    setSavedSuccess(false);

    try {
      const result = await performLiteraryResearch({
        query: q,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        bookContext: book
          ? {
              title: book.title,
              genre: book.genre,
              setting: book.setting,
              premise: book.premise,
            }
          : undefined,
      });

      setCurrentAnswer(result.answer);
      setCurrentSources(result.sources || []);
      setCurrentSearchQueries(result.searchQueries || []);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Falha ao buscar referências. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToBook = () => {
    if (!currentAnswer || !lastQuery) return;

    const newItem: ResearchQueryItem = {
      id: `res_${Date.now()}`,
      bookId: book ? book.id : 'standalone',
      query: lastQuery,
      category: selectedCategory !== 'all' ? selectedCategory : 'general',
      answer: currentAnswer,
      sources: currentSources,
      createdAt: new Date().toISOString(),
    };

    if (book && onUpdateBook) {
      const updated = {
        ...book,
        researchNotes: [newItem, ...(book.researchNotes || [])],
      };
      onUpdateBook(updated);
    } else {
      const updated = [newItem, ...standaloneNotes];
      setStandaloneNotes(updated);
      try {
        localStorage.setItem('cronos_standalone_research_notes', JSON.stringify(updated));
      } catch {}
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteSavedNote = (id: string) => {
    if (book && onUpdateBook) {
      const updatedNotes = (book.researchNotes || []).filter((n) => n.id !== id);
      onUpdateBook({
        ...book,
        researchNotes: updatedNotes,
      });
    } else {
      const updated = standaloneNotes.filter((n) => n.id !== id);
      setStandaloneNotes(updated);
      try {
        localStorage.setItem('cronos_standalone_research_notes', JSON.stringify(updated));
      } catch {}
    }
  };

  const filteredSavedNotes = savedNotes.filter(
    (n) =>
      !savedFilter.trim() ||
      n.query.toLowerCase().includes(savedFilter.toLowerCase()) ||
      n.answer.toLowerCase().includes(savedFilter.toLowerCase())
  );

  const renderSearchSection = () => (
    <>
      {/* Section 3: Pesquisa & Referências Literárias */}
      <div id="literary-research-section" className="bg-[#1b0e2e] dark:bg-[#140922] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-[#3b235c]/70">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#b83280]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#147d74]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-[#2dd4bf] mb-2">
              <Globe className="w-3.5 h-3.5 text-[#2dd4bf]" />
              <span>Google Search Integrado · Sem Distrações</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold">
              Pesquisa & Referências Literárias
            </h2>
            <p className="text-[#f7f2fc]/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Tire dúvidas de época, verifique fatos históricos, explore texturas sensoriais e descubra termos
              técnicos diretamente no app, sem abrir abas que quebram o seu fluxo criativo.
            </p>

            {book ? (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/15 text-xs text-[#f7f2fc]/90 font-medium">
                <span className="font-bold text-white flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  Livro Ativo:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/15 text-white font-semibold">
                  {book.title}
                </span>
                <span className="text-white/60">· Gênero: {book.genre}</span>
                {book.setting && <span className="text-white/60">· Cenário: {book.setting}</span>}
              </div>
            ) : books.length > 0 && onSelectBook ? (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/15 text-xs">
                <span className="text-white/70">Vincular a um livro:</span>
                <select
                  onChange={(e) => onSelectBook(e.target.value)}
                  className="bg-white/15 text-white border border-white/20 rounded-lg px-2 py-1 text-xs outline-hidden cursor-pointer"
                >
                  <option value="" className="bg-[#1b0e2e] text-white">Pesquisa Geral (Sem livro)</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#1b0e2e] text-white">
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer shrink-0 self-start"
            >
              Fechar Pesquisa
            </button>
          )}
        </div>
      </div>

      {/* Section 4: Pesquise Dúvidas & Referências Sem Sair do Manual */}
      <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm space-y-5 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <span className="p-2 rounded-xl bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6]">
            <Search className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
              Pesquise Dúvidas & Referências Sem Sair do Manual
            </h3>
            <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-0.5">
              Consulte fatos de época, detalhes sensoriais e vocabulário com fontes reais verificadas.
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#532380] text-white shadow-xs'
                  : 'bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#5c4672] dark:text-[#c4b3d8] border border-[#ebdff2] dark:border-[#2d1b42] hover:bg-[#f4ecf8] dark:hover:bg-[#25133c]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#5c4672]/50 pointer-events-none" />
            <input
              id="research-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite sua dúvida de época, fato, detalhe sensorial ou termo..."
              className="w-full pl-12 pr-28 sm:pr-32 py-3.5 text-sm sm:text-base rounded-2xl border-2 border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#12071f] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden transition-all font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 px-4 sm:px-5 py-2 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
              <span>{isLoading ? 'Buscando...' : 'Pesquisar'}</span>
            </button>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-[#5c4672]/70 dark:text-[#c4b3d8]/70 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            Exemplos rápidos para inspirar:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item.text);
                  handleSearch(item.text);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f4ecf8] hover:text-[#220d3a] dark:hover:bg-[#25133c] dark:hover:text-[#f7f2fc] transition-all text-left cursor-pointer"
              >
                “{item.text}”
              </button>
            ))}
          </div>
        </div>

        {/* Error Feedback with Retry Button */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-[#fae8f2] dark:bg-[#341628] border border-[#f5cbe2] dark:border-[#521c3c] text-[#b83280] dark:text-[#f472b6] text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#b83280] shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSearch(query || lastQuery)}
              className="px-3.5 py-1.5 rounded-xl bg-[#b83280] hover:bg-[#992266] text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] text-center space-y-3 animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-[#532380] text-[#2dd4bf] flex items-center justify-center mx-auto animate-spin">
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#220d3a] dark:text-[#f7f2fc]">
              Consultando o Google Search com dados atualizados...
            </p>
            <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 max-w-md mx-auto">
              Sintetizando detalhes práticos, vocabulário e referências precisas para o contexto de{' '}
              <span className="font-bold text-[#532380] dark:text-[#c4b3d8]">
                {book?.title || 'sua obra literária'}
              </span>.
            </p>
          </div>
        )}

        {/* Active Search Result */}
        {currentAnswer && !isLoading && (
          <div className="p-6 rounded-3xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs space-y-4 animate-in fade-in">
            {/* Result Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ebdff2] dark:border-[#2d1b42]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] block">
                  Pesquisa Realizada
                </span>
                <h3 className="font-serif-display text-lg font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                  “{lastQuery}”
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(currentAnswer)}
                  className="px-3 py-1.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#faf7fd] dark:hover:bg-[#1c0e2e] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#147d74]" />
                      <span className="text-[#147d74] dark:text-[#2dd4bf]">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#532380]" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToBook}
                  className="px-3.5 py-1.5 rounded-xl bg-[#147d74] hover:bg-[#0f625b] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2dd4bf]" />
                      <span>Salvo no Livro!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Salvar no Manual</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Answer Content */}
            <div className="prose max-w-none text-xs sm:text-sm text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed whitespace-pre-line space-y-2 font-normal">
              {currentAnswer}
            </div>

            {/* Google Search Grounding Sources */}
            {currentSources.length > 0 && (
              <div className="pt-4 border-t border-[#ebdff2] dark:border-[#2d1b42] space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#147d74] dark:text-[#2dd4bf]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Fontes Verificadas no Google Search:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#e6f7f5] dark:bg-[#0c2a27] border border-[#bbf0eb] dark:border-[#14534f] text-[#147d74] dark:text-[#2dd4bf] hover:opacity-85 transition-opacity"
                      title={src.url}
                    >
                      <span className="truncate max-w-[240px]">{src.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  const renderCadernoSection = () => (
    /* Section 6: Caderno de Pesquisa deste Livro */
    <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6]">
              <BookmarkPlus className="w-4 h-4" />
            </span>
            <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
              Caderno de Pesquisa deste Livro
            </h3>
          </div>
          <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-0.5">
            {savedNotes.length} consulta{savedNotes.length === 1 ? '' : 's'} salva
            {savedNotes.length === 1 ? '' : 's'} para o livro{' '}
            <strong className="text-[#532380] dark:text-[#c4b3d8]">
              {book?.title || 'sua biblioteca'}
            </strong>
          </p>
        </div>

        {savedNotes.length > 0 && (
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={savedFilter}
              onChange={(e) => setSavedFilter(e.target.value)}
              placeholder="Filtrar notas salvas..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#12071f] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
            />
          </div>
        )}
      </div>

      {savedNotes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-dashed border-[#ebdff2] dark:border-[#2d1b42] space-y-2">
          <Compass className="w-8 h-8 text-[#532380]/50 dark:text-[#c4b3d8]/50 mx-auto" />
          <h4 className="text-sm font-bold text-[#220d3a] dark:text-[#f7f2fc]">
            Nenhuma nota de pesquisa salva ainda
          </h4>
          <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 max-w-md mx-auto">
            Quando você pesquisar dúvidas de época, vocabulário ou cenários acima, clique em{' '}
            <strong>"Salvar no Manual"</strong> para que as referências fiquem guardadas para sempre no
            planejamento deste livro.
          </p>
        </div>
      ) : filteredSavedNotes.length === 0 ? (
        <div className="p-6 text-center text-xs text-[#5c4672]/70 dark:text-[#c4b3d8]/70">
          Nenhuma nota encontrada com o termo "{savedFilter}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSavedNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-[#faf7fd]/60 dark:bg-[#1c0e2e]/60 border border-[#ebdff2] dark:border-[#2d1b42] space-y-3 flex flex-col justify-between hover:border-[#532380]/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#220d3a] dark:text-[#f7f2fc] leading-snug">
                    {note.query}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleDeleteSavedNote(note.id)}
                    title="Excluir nota"
                    className="p-1 text-[#5c4672]/60 hover:text-[#b83280] dark:hover:text-[#f472b6] rounded-lg hover:bg-[#fae8f2] dark:hover:bg-[#341628] transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#220d3a]/80 dark:text-[#f7f2fc]/80 whitespace-pre-line line-clamp-6 leading-relaxed">
                  {note.answer}
                </p>
              </div>

              <div className="pt-2 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between text-[11px]">
                <span className="text-[#5c4672]/70 dark:text-[#c4b3d8]/70 flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setImmersiveReadingItem({
                      title: `Pesquisa: ${note.query}`,
                      content: note.answer,
                      subtitle: `Nota de Pesquisa · ${book?.title || 'Biblioteca Geral'}`
                    })}
                    className="text-[#532380] dark:text-[#caaee6] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
                    title="Ler esta nota de pesquisa em tela cheia imersiva"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ler Nota</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(note.answer)}
                    className="text-[#b83280] dark:text-[#f472b6] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (sectionPart === 'search') {
    return <div className="space-y-6 animate-in fade-in">{renderSearchSection()}</div>;
  }

  if (sectionPart === 'caderno') {
    return <div className="space-y-6 animate-in fade-in">{renderCadernoSection()}</div>;
  }

  return (
    <div id="literary-research-section" className="space-y-8 animate-in fade-in">
      {/* 3. Pesquisa & Referências Literárias e 4. Pesquise Dúvidas & Referências Sem Sair do Manual */}
      {renderSearchSection()}

      {/* 5. Menu com os botões e aba de pesquisa (e seu respectivo conteúdo) */}
      {children}

      {/* 6. Caderno de Pesquisa deste Livro */}
      {renderCadernoSection()}

      {/* MODAL: MODO DE LEITURA IMERSIVO (NOTAS DE PESQUISA) */}
      {immersiveReadingItem && (
        <div
          className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 overflow-hidden ${
            readingTheme === 'light'
              ? 'bg-white text-gray-900'
              : readingTheme === 'sepia'
              ? 'bg-[#f5ebd2] text-[#3e2c1c]'
              : 'bg-[#0f0717] text-[#e0daf8]'
          }`}
        >
          {/* Immersive Top Navigation Header */}
          <header className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b transition-colors duration-300 ${
            readingTheme === 'light'
              ? 'border-gray-100 bg-gray-50/50'
              : readingTheme === 'sepia'
              ? 'border-[#e4d6bc] bg-[#ebe0c5]/40'
              : 'border-[#23153c] bg-[#140924]/40'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setImmersiveReadingItem(null)}
                className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  readingTheme === 'light'
                    ? 'hover:bg-gray-200/60 text-gray-600'
                    : readingTheme === 'sepia'
                    ? 'hover:bg-[#e4d6bc]/80 text-[#3e2c1c]'
                    : 'hover:bg-[#23153c]/80 text-[#caaee6]'
                }`}
                title="Sair do modo leitura (Esc)"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sair do Modo Imersivo</span>
              </button>
              {immersiveReadingItem.subtitle && (
                <span className={`text-xs opacity-75 hidden md:inline border-l pl-3 ${
                  readingTheme === 'sepia' ? 'border-[#3e2c1c]/20' : 'border-current/20'
                }`}>
                  {immersiveReadingItem.subtitle}
                </span>
              )}
            </div>

            {/* Immersive Controls */}
            <div className="flex flex-wrap items-center gap-4.5">
              {/* Font Family Selector */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setReadingFontFamily('serif')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    readingFontFamily === 'serif'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  Serif
                </button>
                <button
                  onClick={() => setReadingFontFamily('sans')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    readingFontFamily === 'sans'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  Sans
                </button>
              </div>

              {/* Font Size Adjusters */}
              <div className="flex items-center gap-1 border-l pl-4 border-current/20">
                <button
                  onClick={() => setReadingFontSize(prev => Math.max(14, prev - 2))}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    readingTheme === 'light'
                      ? 'hover:bg-gray-200'
                      : readingTheme === 'sepia'
                      ? 'hover:bg-[#e4d6bc]'
                      : 'hover:bg-[#23153c]'
                  }`}
                  title="Diminuir texto"
                >
                  A-
                </button>
                <span className="text-xs font-bold min-w-10 text-center">{readingFontSize}px</span>
                <button
                  onClick={() => setReadingFontSize(prev => Math.min(36, prev + 2))}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    readingTheme === 'light'
                      ? 'hover:bg-gray-200'
                      : readingTheme === 'sepia'
                      ? 'hover:bg-[#e4d6bc]'
                      : 'hover:bg-[#23153c]'
                  }`}
                  title="Aumentar texto"
                >
                  A+
                </button>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center gap-1.5 border-l pl-4 border-current/20">
                {(['light', 'sepia', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setReadingTheme(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer border ${
                      readingTheme === t
                        ? 'border-purple-600 bg-purple-600/10 text-purple-600'
                        : 'border-current/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {t === 'light' ? 'Claro' : t === 'sepia' ? 'Sépia' : 'Escuro'}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Reading Scroll Container */}
          <div className="flex-1 overflow-y-auto px-6 py-12 md:py-16 scrollbar-thin">
            <article
              className={`max-w-2xl mx-auto space-y-6 md:space-y-8 select-text ${
                readingFontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
              style={{ fontSize: `${readingFontSize}px` }}
            >
              <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight border-b pb-6 border-current/10">
                {immersiveReadingItem.title}
              </h1>

              <div className="leading-relaxed whitespace-pre-line tracking-wide font-normal">
                {immersiveReadingItem.content}
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
};
