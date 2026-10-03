import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Share2,
  BookOpen,
  Calendar,
  Flame,
  Feather,
} from 'lucide-react';
import type { Book, WritingSession } from '../types';

interface StoryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  sessions: WritingSession[];
  goal: number;
  totalWords: number;
  challengeDays: number;
}

type CardTheme = 'dark-purple' | 'golden-rose' | 'tiffany-emerald' | 'minimal-clean';
type CardFormat = 'story' | 'square';

export const StoryGeneratorModal: React.FC<StoryGeneratorModalProps> = ({
  isOpen,
  onClose,
  books,
  sessions,
  goal,
  totalWords,
  challengeDays,
}) => {
  if (!isOpen) return null;

  const [selectedFormat, setSelectedFormat] = useState<CardFormat>('story');
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('dark-purple');
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [customQuote, setCustomQuote] = useState<string>(
    '“Uma palavra de cada vez constrói mundos inteiros.”'
  );
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const previewCardRef = useRef<HTMLDivElement | null>(null);

  // Selected book or fallback
  const currentBook = books.find((b) => b.id === selectedBookId);
  const bookTitle = currentBook ? currentBook.title : 'Meu Novo Livro';

  // Words in the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last7DaysWords = sessions
    .filter((s) => new Date(s.date) >= sevenDaysAgo)
    .reduce((acc, s) => acc + s.words, 0);

  const activeDaysCount = new Set(sessions.map((s) => s.date)).size;
  const progressPct = goal > 0 ? Math.min(100, Math.round((totalWords / goal) * 100)) : 0;

  // Caption ready for Instagram / TikTok
  const generateCaption = () => {
    return `Mais uma semana dedicada às palavras! ✍️📖\n\n` +
      `Já são ${new Intl.NumberFormat('pt-BR').format(totalWords)} palavras escritas no manuscrito de "${bookTitle}" (${progressPct}% da meta concluída)! 🚀\n\n` +
      `Constância e foco transformam rascunhos em histórias inesquecíveis.\n\n` +
      `Acompanhando minha rotina literária no @CronosEscrita ✨\n\n` +
      `#escritora #autoresnacionais #livros #booktokbrasil #escrita #cronosescrita #habitosdeescrita`;
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(generateCaption());
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      alert('Não foi possível copiar automaticamente. Selecione e copie o texto.');
    }
  };

  // Export card via Canvas
  const handleDownloadCard = async () => {
    if (!previewCardRef.current) return;
    setIsExporting(true);

    try {
      const card = previewCardRef.current;
      const width = selectedFormat === 'story' ? 1080 : 1080;
      const height = selectedFormat === 'story' ? 1920 : 1080;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas not supported');

      // Draw background gradient based on theme
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (selectedTheme === 'dark-purple') {
        bgGrad.addColorStop(0, '#10071c');
        bgGrad.addColorStop(0.5, '#210d3a');
        bgGrad.addColorStop(1, '#0c0514');
      } else if (selectedTheme === 'golden-rose') {
        bgGrad.addColorStop(0, '#2b091e');
        bgGrad.addColorStop(0.5, '#4a1135');
        bgGrad.addColorStop(1, '#1b0413');
      } else if (selectedTheme === 'tiffany-emerald') {
        bgGrad.addColorStop(0, '#062423');
        bgGrad.addColorStop(0.5, '#0a3b37');
        bgGrad.addColorStop(1, '#041716');
      } else {
        bgGrad.addColorStop(0, '#faf7fd');
        bgGrad.addColorStop(1, '#efe6f6');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Inner Border
      ctx.strokeStyle = selectedTheme === 'minimal-clean' ? 'rgba(108, 46, 185, 0.2)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 14;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Header Tag: CRONOSESCRITA
      ctx.textAlign = 'center';
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#6c2eb9' : '#2dd4bf';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CRONOSESCRITA · DIÁRIO DA AUTORA', width / 2, selectedFormat === 'story' ? 220 : 160);

      // Book Title
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#220d3a' : '#ffffff';
      ctx.font = 'bold 64px "Playfair Display", serif';
      ctx.fillText(`“${bookTitle}”`, width / 2, selectedFormat === 'story' ? 360 : 270);

      // Big Metric: Palavras
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#823bd8' : '#f472b6';
      ctx.font = 'bold 130px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${new Intl.NumberFormat('pt-BR').format(totalWords)}`, width / 2, selectedFormat === 'story' ? 620 : 470);

      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#5c4672' : 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PALAVRAS ESCRITAS NO MANUSCRITO', width / 2, selectedFormat === 'story' ? 680 : 530);

      // Progress pill
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? 'rgba(108, 46, 185, 0.1)' : 'rgba(255, 255, 255, 0.1)';
      const pillY = selectedFormat === 'story' ? 780 : 620;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 250, pillY, 500, 70, 35);
      ctx.fill();

      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#6c2eb9' : '#2dd4bf';
      ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Meta Geral: ${progressPct}% Concluída`, width / 2, pillY + 46);

      // 2 Cards: Esta Semana & Dias Ativos
      const boxY = selectedFormat === 'story' ? 980 : 750;
      const boxW = 420;
      const boxH = 180;

      // Box 1
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#ffffff' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - boxW - 20, boxY, boxW, boxH, 25);
      ctx.fill();
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#220d3a' : '#ffffff';
      ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`+${new Intl.NumberFormat('pt-BR').format(last7DaysWords)}`, width / 2 - boxW / 2 - 20, boxY + 80);
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#5c4672' : 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Nesta Semana', width / 2 - boxW / 2 - 20, boxY + 130);

      // Box 2
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#ffffff' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(width / 2 + 20, boxY, boxW, boxH, 25);
      ctx.fill();
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#220d3a' : '#ffffff';
      ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${activeDaysCount} Dias`, width / 2 + boxW / 2 + 20, boxY + 80);
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#5c4672' : 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Constância Ativa', width / 2 + boxW / 2 + 20, boxY + 130);

      // Quote at bottom
      if (selectedFormat === 'story') {
        ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#220d3a' : 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'italic 34px "Playfair Display", serif';
        ctx.fillText(customQuote, width / 2, 1400);

        ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#8870a0' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = '24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('cronosescrita.app · Foco & Produtividade Literária', width / 2, 1750);
      } else {
        ctx.fillStyle = selectedTheme === 'minimal-clean' ? '#8870a0' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = '22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('cronosescrita.app · Foco & Produtividade Literária', width / 2, 1000);
      }

      // Convert to downloadable image
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `progresso-escrita-${selectedFormat}-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar imagem para download.');
    } finally {
      setIsExporting(false);
    }
  };

  // Theme-based style classes
  const getThemeClass = () => {
    switch (selectedTheme) {
      case 'dark-purple':
        return 'bg-gradient-to-b from-[#130723] via-[#220d3a] to-[#0d0417] text-white border-purple-500/20';
      case 'golden-rose':
        return 'bg-gradient-to-b from-[#2d091f] via-[#4d1237] to-[#1a0413] text-white border-pink-500/20';
      case 'tiffany-emerald':
        return 'bg-gradient-to-b from-[#062423] via-[#0b3d39] to-[#041716] text-white border-teal-500/20';
      case 'minimal-clean':
        return 'bg-gradient-to-b from-[#faf7fd] to-[#efe6f6] text-[#220d3a] border-[#ebdff2]';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl space-y-6 my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#b83280] to-[#823bd8] text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Gerador de Story de Progresso 📲
              </h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8]">
                Crie um card visual elegante para compartilhar sua rotina no Instagram, TikTok ou Status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {/* Format toggle */}
            <div>
              <label className="font-bold text-[#220d3a] dark:text-[#f7f2fc] block mb-1.5">
                1. Formato do Card:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('story')}
                  className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                    selectedFormat === 'story'
                      ? 'bg-[#6c2eb9] text-white border-[#6c2eb9] shadow-xs'
                      : 'border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8]'
                  }`}
                >
                  📱 Story (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('square')}
                  className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                    selectedFormat === 'square'
                      ? 'bg-[#6c2eb9] text-white border-[#6c2eb9] shadow-xs'
                      : 'border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8]'
                  }`}
                >
                  ⏹️ Quadrado (1:1)
                </button>
              </div>
            </div>

            {/* Theme selector */}
            <div>
              <label className="font-bold text-[#220d3a] dark:text-[#f7f2fc] block mb-1.5">
                2. Paleta de Cores:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTheme('dark-purple')}
                  className={`p-2 rounded-xl border text-left cursor-pointer flex items-center gap-2 ${
                    selectedTheme === 'dark-purple'
                      ? 'border-[#823bd8] bg-[#f6f0fb] dark:bg-[#25133d] font-bold text-[#823bd8]'
                      : 'border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#3b1263] border border-white/30" />
                  <span>Roxo Noturno</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTheme('golden-rose')}
                  className={`p-2 rounded-xl border text-left cursor-pointer flex items-center gap-2 ${
                    selectedTheme === 'golden-rose'
                      ? 'border-[#b83280] bg-[#fdf2f8] dark:bg-[#341126] font-bold text-[#b83280]'
                      : 'border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#b83280] border border-white/30" />
                  <span>Rosa Dourado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTheme('tiffany-emerald')}
                  className={`p-2 rounded-xl border text-left cursor-pointer flex items-center gap-2 ${
                    selectedTheme === 'tiffany-emerald'
                      ? 'border-[#0f766e] bg-[#e6f7f5] dark:bg-[#0c2a27] font-bold text-[#0f766e]'
                      : 'border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0f766e] border border-white/30" />
                  <span>Tiffany Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTheme('minimal-clean')}
                  className={`p-2 rounded-xl border text-left cursor-pointer flex items-center gap-2 ${
                    selectedTheme === 'minimal-clean'
                      ? 'border-[#6c2eb9] bg-white font-bold text-[#6c2eb9]'
                      : 'border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400" />
                  <span>Clean Claro</span>
                </button>
              </div>
            </div>

            {/* Book selector */}
            <div>
              <label className="font-bold text-[#220d3a] dark:text-[#f7f2fc] block mb-1.5">
                3. Livro em Destaque:
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] font-semibold"
              >
                {books.length === 0 ? (
                  <option value="">Sem livro vinculado (Geral)</option>
                ) : (
                  books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.genre || 'Ficção'})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Custom Quote */}
            <div>
              <label className="font-bold text-[#220d3a] dark:text-[#f7f2fc] block mb-1.5">
                4. Frase Inspiradora do Card:
              </label>
              <input
                type="text"
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                placeholder="Frase inspiradora..."
                className="w-full p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc]"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42] space-y-2">
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isExporting}
                className="w-full py-3 bg-gradient-to-r from-[#b83280] to-[#6c2eb9] hover:opacity-95 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Renderizando imagem...' : 'Baixar Imagem (.png)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCaption}
                className="w-full py-2.5 border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#1f1033] hover:bg-white dark:hover:bg-[#2b1646] font-bold text-[#5c4672] dark:text-[#c4b3d8] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedCaption ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCaption ? 'Legenda Copiada!' : 'Copiar Legenda para o Post'}</span>
              </button>
            </div>
          </div>

          {/* Visual Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-[#8870a0] uppercase tracking-wider mb-2">
              Pré-visualização em Tempo Real
            </span>

            <div
              ref={previewCardRef}
              className={`w-full max-w-[320px] rounded-3xl p-6 border shadow-2xl flex flex-col justify-between transition-all duration-300 ${
                selectedFormat === 'story' ? 'aspect-[9/16] min-h-[520px]' : 'aspect-square min-h-[340px]'
              } ${getThemeClass()}`}
            >
              {/* Card Header */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 block">
                  CRONOSESCRITA · DIÁRIO DA AUTORA
                </span>
                <h4 className="font-serif-display text-xl font-bold line-clamp-1">
                  “{bookTitle}”
                </h4>
              </div>

              {/* Main Metric */}
              <div className="text-center my-auto space-y-1">
                <span className="font-serif-display text-4xl sm:text-5xl font-bold tracking-tight block tabular-nums">
                  {new Intl.NumberFormat('pt-BR').format(totalWords)}
                </span>
                <span className="text-xs uppercase tracking-wider font-bold opacity-80 block">
                  palavras escritas
                </span>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold mt-2">
                  <Sparkles className="w-3 h-3 text-[#2dd4bf]" />
                  <span>Meta: {progressPct}% concluída</span>
                </div>
              </div>

              {/* 2 Mini Stats */}
              <div className="grid grid-cols-2 gap-2 my-2 text-center">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-lg font-bold block tabular-nums">
                    +{new Intl.NumberFormat('pt-BR').format(last7DaysWords)}
                  </span>
                  <span className="text-[10px] opacity-70 block">Nesta semana</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-lg font-bold block tabular-nums">
                    {activeDaysCount} dias
                  </span>
                  <span className="text-[10px] opacity-70 block">Constância ativa</span>
                </div>
              </div>

              {/* Quote Footer */}
              <div className="text-center pt-2 border-t border-white/10">
                <p className="font-serif italic text-xs leading-relaxed opacity-90 line-clamp-2">
                  {customQuote}
                </p>
                <span className="text-[9px] opacity-50 block mt-1">
                  cronosescrita.app
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
