import React, { useEffect } from 'react';
import { X, Search, ArrowLeft } from 'lucide-react';
import type { Book } from '../types';
import { BookResearchTool } from './BookResearchTool';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: Book;
  books: Book[];
  onUpdateBook: (updatedBook: Book) => void;
  onSelectBook?: (bookId: string) => void;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({
  isOpen,
  onClose,
  book,
  books,
  onUpdateBook,
  onSelectBook,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0f0717]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7fd] dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative p-4 sm:p-6">
        <button
          onClick={onClose}
          aria-label="Voltar / Fechar"
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#2b1646] hover:text-[#220d3a] dark:hover:text-white transition-colors z-20 cursor-pointer border border-[#ebdff2] dark:border-[#2d1b42] text-xs font-bold shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
          <span>Voltar</span>
          <X className="w-3.5 h-3.5 opacity-60" />
        </button>

        <BookResearchTool
          book={book}
          books={books}
          onUpdateBook={onUpdateBook}
          onSelectBook={onSelectBook}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
