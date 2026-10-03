import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  Image as ImageIcon,
  Plus,
  BookOpen,
  Trash2,
  Eye,
  Sparkles,
  Upload,
  Copy,
  Check,
  Folder,
  Tag,
  Maximize2,
  ArrowLeft,
} from 'lucide-react';
import type { Book, Project, MoodboardItem } from '../types';

interface BookMoodboardGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  projects: Project[];
  onSelectBook: (bookId: string) => void;
  onUpdateBook: (updatedBook: Book) => void;
}

interface FlattenedImageItem {
  id: string;
  url: string;
  title: string;
  type: 'capa' | 'moodboard' | 'cenario' | 'personagem' | 'objeto' | 'atmosfera' | 'figurino' | 'outro';
  bookId: string;
  bookTitle: string;
  bookGenre: string;
  projectName: string;
  notes?: string;
  createdAt?: string;
  isCover?: boolean;
}

export const BookMoodboardGalleryModal: React.FC<BookMoodboardGalleryModalProps> = ({
  isOpen,
  onClose,
  books,
  projects,
  onSelectBook,
  onUpdateBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [activeLightboxImage, setActiveLightboxImage] = useState<FlattenedImageItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Image Form state
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [newImageBookId, setNewImageBookId] = useState<string>(books[0]?.id || '');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCategory, setNewImageCategory] = useState<'cenario' | 'personagem' | 'objeto' | 'atmosfera' | 'figurino' | 'outro'>('cenario');
  const [newImageNotes, setNewImageNotes] = useState('');

  // Handle ESC key to close modal or lightbox
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeLightboxImage) {
          setActiveLightboxImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeLightboxImage, onClose]);

  // Collect all images across all registered books
  const allImages = useMemo<FlattenedImageItem[]>(() => {
    const list: FlattenedImageItem[] = [];

    books.forEach((b) => {
      const proj = projects.find((p) => p.id === b.projectId);
      const projName = proj ? proj.name : 'Projeto';

      // 1. Book Cover (if exists)
      if (b.coverUrl) {
        list.push({
          id: `cover_${b.id}`,
          url: b.coverUrl,
          title: `Capa Principal: ${b.title}`,
          type: 'capa',
          bookId: b.id,
          bookTitle: b.title,
          bookGenre: b.genre,
          projectName: projName,
          notes: b.premise || b.subtitle || 'Capa oficial cadastrada para a obra.',
          createdAt: b.createdAt,
          isCover: true,
        });
      }

      // 2. Moodboard & Reference items
      if (b.moodboardItems && b.moodboardItems.length > 0) {
        b.moodboardItems.forEach((item) => {
          list.push({
            id: item.id,
            url: item.url,
            title: item.title,
            type: (item.category as any) || 'moodboard',
            bookId: b.id,
            bookTitle: b.title,
            bookGenre: b.genre,
            projectName: projName,
            notes: item.notes,
            createdAt: item.createdAt,
            isCover: false,
          });
        });
      }
    });

    return list;
  }, [books, projects]);

  // Filtered images
  const filteredImages = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return allImages.filter((img) => {
      // Book filter
      if (selectedBookFilter !== 'all' && img.bookId !== selectedBookFilter) {
        return false;
      }

      // Type filter
      if (selectedTypeFilter !== 'all') {
        if (selectedTypeFilter === 'capa' && !img.isCover) return false;
        if (selectedTypeFilter === 'moodboard' && img.isCover) return false;
        if (selectedTypeFilter !== 'capa' && selectedTypeFilter !== 'moodboard') {
          if (img.type !== selectedTypeFilter) return false;
        }
      }

      // Search term
      if (term) {
        const matchesTitle = img.title.toLowerCase().includes(term);
        const matchesBook = img.bookTitle.toLowerCase().includes(term);
        const matchesProj = img.projectName.toLowerCase().includes(term);
        const matchesGenre = img.bookGenre.toLowerCase().includes(term);
        const matchesNotes = img.notes ? img.notes.toLowerCase().includes(term) : false;
        return matchesTitle || matchesBook || matchesProj || matchesGenre || matchesNotes;
      }

      return true;
    });
  }, [allImages, searchTerm, selectedBookFilter, selectedTypeFilter]);

  if (!isOpen) return null;

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewImageUrl(result);
        if (!newImageTitle) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          setNewImageTitle(cleanName);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Save new moodboard image
  const handleSaveNewImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !newImageBookId) return;

    const targetBook = books.find((b) => b.id === newImageBookId);
    if (!targetBook) return;

    const newItem: MoodboardItem = {
      id: `mb_${Date.now()}`,
      url: newImageUrl.trim(),
      title: newImageTitle.trim() || 'Referência Visual',
      category: newImageCategory,
      notes: newImageNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const existingItems = targetBook.moodboardItems || [];
    const updatedBook: Book = {
      ...targetBook,
      moodboardItems: [newItem, ...existingItems],
    };

    onUpdateBook(updatedBook);

    // Reset form
    setNewImageUrl('');
    setNewImageTitle('');
    setNewImageNotes('');
    setIsAddingImage(false);
  };

  // Delete moodboard item
  const handleDeleteItem = (item: FlattenedImageItem) => {
    if (item.isCover) {
      if (window.confirm(`Deseja remover a imagem de capa do livro "${item.bookTitle}"?`)) {
        const book = books.find((b) => b.id === item.bookId);
        if (book) {
          onUpdateBook({ ...book, coverUrl: undefined });
        }
      }
      return;
    }

    const book = books.find((b) => b.id === item.bookId);
    if (!book) return;

    if (window.confirm(`Excluir a imagem "${item.title}" do moodboard deste livro?`)) {
      const updated = (book.moodboardItems || []).filter((mb) => mb.id !== item.id);
      onUpdateBook({ ...book, moodboardItems: updated });
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGoToBook = (bookId: string) => {
    onSelectBook(bookId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0f0717]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#faf7fd] dark:bg-[#160b24] rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-2xl overflow-hidden transition-all">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-[#1b0e2e] dark:bg-[#140922] text-white flex items-center justify-between gap-4 border-b border-[#3b235c]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-[#2dd4bf] flex items-center justify-center shadow-xs shrink-0 border border-white/15">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#2dd4bf] border border-white/15 text-[10px] font-bold uppercase tracking-wider">
                  Galeria Geral de Obras
                </span>
                <span className="text-xs text-white/70 font-medium hidden sm:inline">
                  {allImages.length} {allImages.length === 1 ? 'imagem cadastrada' : 'imagens cadastradas'}
                </span>
              </div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Pesquisa de Imagens & Moodboards dos Livros</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingImage(!isAddingImage)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] border border-white/10 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Imagem / Moodboard</span>
              <span className="sm:hidden">Adicionar</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
              title="Voltar ao Manual do Livro (Esc)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>

        {/* Panel for adding a new moodboard image */}
        {isAddingImage && (
          <div className="p-4 sm:p-5 bg-[#faf7fd] dark:bg-[#1a0e2a] border-b border-[#ebdff2] dark:border-[#2d1b42] animate-in slide-in-from-top-3 duration-200 shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#b83280] dark:text-[#f472b6]" />
                  <span>Cadastrar Nova Imagem / Referência Visual no Livro</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingImage(false)}
                  className="text-xs text-[#6c2eb9] dark:text-[#a875ec] hover:underline cursor-pointer"
                >
                  Fechar formulário
                </button>
              </div>

              <form onSubmit={handleSaveNewImage} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Book select */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                    Vincular ao Livro
                  </label>
                  <select
                    value={newImageBookId}
                    onChange={(e) => setNewImageBookId(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#823bd8] outline-hidden"
                  >
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                    Título / Descrição Curta
                  </label>
                  <input
                    type="text"
                    value={newImageTitle}
                    onChange={(e) => setNewImageTitle(e.target.value)}
                    placeholder="Ex: Palácio de Inverno, Figurino da Princesa..."
                    className="w-full text-xs p-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#823bd8] outline-hidden"
                  />
                </div>

                {/* Category */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                    Categoria
                  </label>
                  <select
                    value={newImageCategory}
                    onChange={(e) => setNewImageCategory(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#823bd8] outline-hidden"
                  >
                    <option value="cenario">Cenário & Arquitetura</option>
                    <option value="personagem">Personagem & Expressão</option>
                    <option value="figurino">Figurino & Trajes</option>
                    <option value="objeto">Objeto, Arma & Relíquia</option>
                    <option value="atmosfera">Atmosfera, Cores & Luz</option>
                    <option value="outro">Outro / Inspiração Geral</option>
                  </select>
                </div>

                {/* Image URL & File Upload */}
                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                    URL da Imagem ou Arquivo do Computador
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Cole o link da imagem (https://...) ou escolha um arquivo"
                      className="flex-1 text-xs p-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#823bd8] outline-hidden"
                    />
                    <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <div className="sm:col-span-4 flex items-end">
                  <button
                    type="submit"
                    disabled={!newImageUrl.trim() || !newImageBookId}
                    className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-[#6c2eb9] hover:bg-[#5b24a0] shadow-xs disabled:opacity-50 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Salvar no Livro</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 bg-white/70 dark:bg-[#160b24]/70 border-b border-[#ebdff2] dark:border-[#2d1b42] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8870a0] dark:text-[#9782ad] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por título do livro, tema, cenário, personagem, projeto..."
              className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] placeholder-[#8870a0]/60 focus:border-[#823bd8] outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-[#8870a0] hover:text-[#220d3a] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Book Filter */}
            <div className="flex items-center gap-1 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-[#b83280] dark:text-[#f472b6] shrink-0" />
              <select
                value={selectedBookFilter}
                onChange={(e) => setSelectedBookFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#823bd8] outline-hidden cursor-pointer"
              >
                <option value="all">Todos os Livros ({books.length})</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#147d74] dark:text-[#2dd4bf] shrink-0" />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#823bd8] outline-hidden cursor-pointer"
              >
                <option value="all">Todas as Imagens</option>
                <option value="capa">Apenas Capas</option>
                <option value="moodboard">Moodboards & Referências</option>
                <option value="cenario">Cenários</option>
                <option value="personagem">Personagens</option>
                <option value="figurino">Figurinos</option>
                <option value="objeto">Objetos & Relíquias</option>
                <option value="atmosfera">Atmosfera & Cores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[300px]">
          {filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-[#f6f0fb] dark:bg-[#1f1033] text-[#b83280] dark:text-[#f472b6] flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 opacity-75" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Nenhuma imagem ou moodboard encontrado
              </h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1 leading-relaxed">
                {searchTerm
                  ? `Nenhum resultado corresponde à busca "${searchTerm}". Tente outros termos.`
                  : 'Os livros cadastrados ainda não possuem capas ou imagens de referências. Você pode adicionar imagens diretamente pelo botão acima!'}
              </p>
              <button
                onClick={() => setIsAddingImage(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Primeira Imagem</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredImages.map((img) => {
                return (
                  <div
                    key={img.id}
                    className="group relative bg-white dark:bg-[#160b24] rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] overflow-hidden shadow-xs hover:border-[#6c2eb9] transition-all flex flex-col"
                  >
                    {/* Image Thumbnail */}
                    <div className="relative aspect-3/4 bg-black/10 dark:bg-black/30 overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />

                      {/* Tag Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider ${
                            img.isCover
                              ? 'bg-[#b83280] text-white shadow-xs'
                              : 'bg-[#1b0e2e]/90 text-[#2dd4bf] border border-[#2dd4bf]/30'
                          }`}
                        >
                          {img.isCover ? 'Capa' : img.type}
                        </span>
                      </div>

                      {/* Hover Overlay with Quick Actions */}
                      <div className="absolute inset-0 bg-[#1b0e2e]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          onClick={() => setActiveLightboxImage(img)}
                          title="Visualizar em tamanho grande"
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-4 h-4 text-[#2dd4bf]" />
                        </button>

                        <button
                          onClick={() => handleCopyUrl(img.url, img.id)}
                          title="Copiar link da imagem"
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors cursor-pointer"
                        >
                          {copiedId === img.id ? (
                            <Check className="w-4 h-4 text-[#2dd4bf]" />
                          ) : (
                            <Copy className="w-4 h-4 text-[#f472b6]" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteItem(img)}
                          title="Excluir imagem"
                          className="p-2 rounded-xl bg-white/20 hover:bg-[#b83280] text-white backdrop-blur-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Image Details Card */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b83280] dark:text-[#f472b6] block truncate">
                          {img.bookTitle}
                        </span>
                        <h4 className="text-xs font-semibold text-[#220d3a] dark:text-[#f7f2fc] mt-0.5 line-clamp-1" title={img.title}>
                          {img.title}
                        </h4>
                        {img.notes && (
                          <p className="text-[11px] text-[#5c4672] dark:text-[#c4b3d8] mt-1 line-clamp-2 leading-tight">
                            {img.notes}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleGoToBook(img.bookId)}
                        className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-[#f6f0fb] dark:bg-[#1f1033] hover:bg-[#6c2eb9] text-[#6c2eb9] dark:text-[#a875ec] hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Abrir Livro</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 sm:p-4 bg-[#faf7fd] dark:bg-[#1a0e2a] border-t border-[#ebdff2] dark:border-[#2d1b42] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5c4672] dark:text-[#c4b3d8] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#147d74] dark:text-[#2dd4bf]" />
            <span>
              Mostrando {filteredImages.length} de {allImages.length} imagens no seu acervo
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <span className="text-[11px] text-[#b83280] dark:text-[#f472b6] font-medium">
              Dica: Você pode pesquisar capas e moodboards por qualquer detalhe ou palavra-chave
            </span>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] text-[#220d3a] dark:text-[#f7f2fc] text-xs font-bold hover:bg-[#faf7fd] dark:hover:bg-[#1a0e2a] transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
              <span>Voltar ao Manual do Livro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / High-Res View Modal */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#1b0e2e] rounded-3xl overflow-hidden border border-[#3b235c]/70 shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Large Image Preview */}
            <div className="flex-1 bg-black/50 flex items-center justify-center p-4 min-h-[320px] max-h-[75vh]">
              <img
                src={activeLightboxImage.url}
                alt={activeLightboxImage.title}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Info Sidebar */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#3b235c]/70 text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/30 text-[10px] font-bold uppercase">
                    {activeLightboxImage.isCover ? 'Capa Oficial' : activeLightboxImage.type}
                  </span>
                  <span className="text-xs text-[#f472b6] font-semibold truncate">
                    {activeLightboxImage.bookGenre}
                  </span>
                </div>

                <h3 className="font-serif-display text-2xl font-bold leading-tight">
                  {activeLightboxImage.title}
                </h3>

                <p className="text-sm font-semibold text-[#2dd4bf] mt-1">
                  Livro: {activeLightboxImage.bookTitle}
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  Projeto: {activeLightboxImage.projectName}
                </p>

                {activeLightboxImage.notes && (
                  <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[10px] uppercase font-bold text-[#f472b6] block mb-1">
                      Anotações da Autora
                    </span>
                    <p className="text-xs text-white/90 leading-relaxed">
                      {activeLightboxImage.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2 pt-4 border-t border-[#3b235c]/70">
                <button
                  onClick={() => handleGoToBook(activeLightboxImage.bookId)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Abrir Livro no Manual</span>
                </button>

                <button
                  onClick={() => handleCopyUrl(activeLightboxImage.url, activeLightboxImage.id)}
                  className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedId === activeLightboxImage.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2dd4bf]" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link da Imagem</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
