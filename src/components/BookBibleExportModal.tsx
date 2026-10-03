import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Download,
  Check,
  FileText,
  BookOpen,
  Users,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Book, Project } from '../types';

interface BookBibleExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  projects: Project[];
}

export const BookBibleExportModal: React.FC<BookBibleExportModalProps> = ({
  isOpen,
  onClose,
  books,
  projects,
}) => {
  if (!isOpen) return null;

  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [includeSynopsis, setIncludeSynopsis] = useState(true);
  const [includeCharacters, setIncludeCharacters] = useState(true);
  const [includeChapters, setIncludeChapters] = useState(true);
  const [includeResearch, setIncludeResearch] = useState(true);
  const [copied, setCopied] = useState(false);

  const currentBook = books.find((b) => b.id === selectedBookId) || books[0];
  const project = projects.find((p) => p.id === currentBook?.projectId);

  // Generate clean markdown text
  const generateMarkdown = (): string => {
    if (!currentBook) return 'Nenhum livro cadastrado.';

    let text = `# ${currentBook.title}\n\n`;
    if (currentBook.subtitle) text += `*${currentBook.subtitle}*\n\n`;
    text += `**Autor(a):** ${currentBook.author || 'Autor(a)'}\n`;
    text += `**Gênero:** ${currentBook.genre || 'Ficção'}\n`;
    if (currentBook.setting) text += `**Ambientação:** ${currentBook.setting}\n`;
    if (currentBook.tone) text += `**Tom / Clima:** ${currentBook.tone}\n`;
    text += `**Status de Publicação:** ${currentBook.publicationStatus || 'Em planejamento'}\n`;
    text += `**Meta de Palavras:** ${currentBook.targetWords?.toLocaleString('pt-BR')} palavras\n`;
    text += `**Data de Criação:** ${currentBook.createdAt || new Date().toISOString().split('T')[0]}\n\n`;
    text += `---\n\n`;

    if (includeSynopsis) {
      text += `## 1. Premissa & Visão Geral\n\n`;
      text += `${currentBook.premise || 'Sem premissa cadastrada ainda.'}\n\n`;
      if (currentBook.generalNotes) {
        text += `**Anotações Gerais:**\n${currentBook.generalNotes}\n\n`;
      }
      text += `---\n\n`;
    }

    if (includeCharacters && currentBook.characters && currentBook.characters.length > 0) {
      text += `## 2. Fichas de Personagens (${currentBook.characters.length})\n\n`;
      currentBook.characters.forEach((char, idx) => {
        text += `### 2.${idx + 1} ${char.name} (${char.role || 'Personagem'})\n`;
        if (char.archetype) text += `* **Arquétipo:** ${char.archetype}\n`;
        if (char.description) text += `* **Descrição:** ${char.description}\n`;
        if (char.notes) text += `* **Anotações:** ${char.notes}\n`;
        text += `\n`;
      });
      text += `---\n\n`;
    }

    if (includeChapters && currentBook.chapters && currentBook.chapters.length > 0) {
      text += `## 3. Estrutura de Capítulos & Cenas (${currentBook.chapters.length})\n\n`;
      currentBook.chapters.forEach((chap, idx) => {
        text += `### Capítulo ${chap.order || idx + 1}: ${chap.title || `Capítulo ${idx + 1}`}\n`;
        text += `* **Status:** ${chap.status}\n`;
        if (chap.targetWords) text += `* **Meta do Capítulo:** ${chap.targetWords.toLocaleString('pt-BR')} palavras\n`;
        if (chap.summary) text += `* **Resumo da Cena:** ${chap.summary}\n`;
        text += `\n`;
      });
      text += `---\n\n`;
    }

    if (includeResearch && currentBook.researchNotes && currentBook.researchNotes.length > 0) {
      text += `## 4. Notas de Pesquisa & Ambientação Literária\n\n`;
      currentBook.researchNotes.forEach((note) => {
        text += `### Pesquisa: ${note.query}\n`;
        text += `${note.answer}\n\n`;
      });
      text += `---\n\n`;
    }

    text += `*Exportado via CronosEscrita em ${new Date().toLocaleDateString('pt-BR')}*`;
    return text;
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Não foi possível copiar automaticamente.');
    }
  };

  const handleDownloadFile = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ficha-editorial-${currentBook?.title || 'livro'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, autorize pop-ups para gerar a impressão da ficha.');
      return;
    }

    const mdContent = generateMarkdown();
    const formattedHtml = mdContent
      .replace(/^# (.*$)/gim, '<h1 style="font-family: serif; font-size: 26pt; margin-bottom: 8px;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="font-family: serif; font-size: 18pt; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 13pt; margin-top: 14px; color: #333;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<p style="line-height: 1.6; margin: 8px 0;"></p>')
      .replace(/\n/g, '<br/>');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha Editorial - ${currentBook?.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            @media print {
              body { padding: 0; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          ${formattedHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-6 my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ebdff2] dark:border-[#2d1b42]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6c2eb9] to-[#2dd4bf] text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Exportar Ficha Editorial (Book Bible) 📄
              </h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8]">
                Exporte todo o planejamento do livro formatado para editoras, leitores beta ou impressão.
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

        {/* Book Selector */}
        <div>
          <label className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] block mb-1.5">
            Selecione o Livro para Exportar:
          </label>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc]"
          >
            {books.length === 0 ? (
              <option value="">Nenhum livro cadastrado</option>
            ) : (
              books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.genre || 'Ficção'}) · {b.targetWords?.toLocaleString('pt-BR')} palavras
                </option>
              ))
            )}
          </select>
        </div>

        {/* Content to include checkboxes */}
        <div className="p-4 rounded-2xl bg-[#faf7fd] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#351e50] space-y-2.5 text-xs">
          <span className="font-bold text-[#6c2eb9] dark:text-[#a875ec] uppercase tracking-wider block text-[10px]">
            Seções a incluir na exportação:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#5c4672] dark:text-[#c4b3d8]">
              <input
                type="checkbox"
                checked={includeSynopsis}
                onChange={(e) => setIncludeSynopsis(e.target.checked)}
                className="w-4 h-4 rounded text-[#6c2eb9] accent-[#6c2eb9] cursor-pointer"
              />
              <span>Sinopse & Visão Geral</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#5c4672] dark:text-[#c4b3d8]">
              <input
                type="checkbox"
                checked={includeCharacters}
                onChange={(e) => setIncludeCharacters(e.target.checked)}
                className="w-4 h-4 rounded text-[#6c2eb9] accent-[#6c2eb9] cursor-pointer"
              />
              <span>Fichas de Personagens</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#5c4672] dark:text-[#c4b3d8]">
              <input
                type="checkbox"
                checked={includeChapters}
                onChange={(e) => setIncludeChapters(e.target.checked)}
                className="w-4 h-4 rounded text-[#6c2eb9] accent-[#6c2eb9] cursor-pointer"
              />
              <span>Capítulos & Estrutura</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#5c4672] dark:text-[#c4b3d8]">
              <input
                type="checkbox"
                checked={includeResearch}
                onChange={(e) => setIncludeResearch(e.target.checked)}
                className="w-4 h-4 rounded text-[#6c2eb9] accent-[#6c2eb9] cursor-pointer"
              />
              <span>Notas de Pesquisa & Mundo</span>
            </label>
          </div>
        </div>

        {/* Export action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="p-3 rounded-xl bg-gradient-to-r from-[#6c2eb9] to-[#823bd8] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFile}
            className="p-3 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#f6f0fb] dark:bg-[#1f1033] hover:bg-white dark:hover:bg-[#2b1646] text-[#220d3a] dark:text-[#f7f2fc] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf]" />
            <span>Baixar (.md / texto)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="p-3 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#f6f0fb] dark:bg-[#1f1033] hover:bg-white dark:hover:bg-[#2b1646] text-[#220d3a] dark:text-[#f7f2fc] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#823bd8]" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
