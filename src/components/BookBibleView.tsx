import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  PlusCircle,
  Clock,
  TrendingUp,
  Image as ImageIcon,
  Users,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  FolderPlus,
  Compass,
  FileText,
  Upload,
  FolderGit2,
  ExternalLink,
  RefreshCw,
  FilePlus2,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Search,
  Globe,
  Images,
  Rocket,
  Calendar,
  CalendarCheck,
  Award,
  PartyPopper,
  ArrowLeft,
  X,
  Bookmark,
  Check,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Book, Project, WritingSession, Character, Chapter } from '../types';
import {
  findOrCreateBookMarketingFolder,
  listFolderFiles,
  createMarketingNoteInFolder,
  type DriveFileItem,
  type DriveFolderInfo,
} from '../services/drive';
import { BookResearchTool } from './BookResearchTool';
import { BookMoodboardGalleryModal } from './BookMoodboardGalleryModal';

interface BookBibleViewProps {
  projects: Project[];
  books: Book[];
  sessions: WritingSession[];
  onAddProject: (project: Project) => void;
  onAddBook: (book: Book, project?: Project) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onQuickLogForBook: (bookId: string, projectId: string) => void;
  googleToken?: string | null;
  onConnectGoogle?: () => void;
  initialTab?: 'architecture' | 'research' | 'drive';
  onOpenExportModal?: () => void;
}

export const BookBibleView: React.FC<BookBibleViewProps> = ({
  projects,
  books,
  sessions,
  onAddProject,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onQuickLogForBook,
  googleToken,
  onConnectGoogle,
  initialTab,
  onOpenExportModal,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [formError, setFormError] = useState<string>('');

  // IMMERSIVE READING MODE FOR BIBLE VIEWER
  const [immersiveReadingItem, setImmersiveReadingItem] = useState<{
    title: string;
    content: string;
    subtitle?: string;
  } | null>(null);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [readingFontSize, setReadingFontSize] = useState<number>(20); // Font size in px
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
  const [activeBookTab, setActiveBookTab] = useState<
    'architecture' | 'research' | 'drive' | 'publication'
  >(initialTab || 'architecture');
  const [showEmptyResearch, setShowEmptyResearch] = useState(false);
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [researchInitialQuery, setResearchInitialQuery] = useState('');
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);

  // Sync initialTab when changed from parent
  useEffect(() => {
    if (initialTab) {
      setActiveBookTab(initialTab);
    }
  }, [initialTab]);

  // New Project State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // New Book State
  const [newBookProjectId, setNewBookProjectId] = useState(projects[0]?.id || '');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSubtitle, setNewBookSubtitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookGenre, setNewBookGenre] = useState('Fantasia & Ficção');
  const [newBookTarget, setNewBookTarget] = useState(50000);
  const [newBookCover, setNewBookCover] = useState('');
  const [newBookPremise, setNewBookPremise] = useState('');
  const [newBookSetting, setNewBookSetting] = useState('');
  const [newBookTone, setNewBookTone] = useState('');
  const [newBookTargetPubDate, setNewBookTargetPubDate] = useState('');
  const [newBookPubStatus, setNewBookPubStatus] = useState<
    'planejado' | 'em_preparacao' | 'pronto' | 'publicado'
  >('planejado');
  const [newBookPubFormat, setNewBookPubFormat] = useState('E-book');

  // Ensure selectedBookId stays in sync when books change
  useEffect(() => {
    if (books.length > 0 && (!selectedBookId || !books.some((b) => b.id === selectedBookId))) {
      setSelectedBookId(books[books.length - 1]?.id || books[0].id);
    }
  }, [books, selectedBookId]);

  // Keep newBookProjectId updated if projects list is populated
  useEffect(() => {
    if (projects.length > 0 && !newBookProjectId) {
      setNewBookProjectId(projects[0].id);
    }
  }, [projects, newBookProjectId]);

  const handleOpenCreateBook = () => {
    setFormError('');
    setIsCreatingBook(true);
    setTimeout(() => {
      const panel = document.getElementById('book-creator-panel');
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = document.getElementById('new-book-title-input');
      input?.focus();
    }, 100);
  };

  const handleOpenResearch = () => {
    setActiveBookTab('research');
    setShowEmptyResearch(true);
    setTimeout(() => {
      const section = document.getElementById('literary-research-section');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = document.getElementById('research-search-input');
      input?.focus();
    }, 100);
  };

  const handleTriggerQuickSearch = (queryText: string) => {
    const q = queryText.trim();
    if (q) {
      setResearchInitialQuery(q);
    }
    setActiveBookTab('research');
    setShowEmptyResearch(true);
    setTimeout(() => {
      const section = document.getElementById('literary-research-section');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = document.getElementById('research-search-input') as HTMLInputElement | null;
      if (input) {
        if (q) input.value = q;
        input.focus();
      }
    }, 100);
  };

  // Character Form state for selected book
  const [isAddingChar, setIsAddingChar] = useState(false);
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('Protagonista');
  const [charArchetype, setCharArchetype] = useState('');
  const [charDesc, setCharDesc] = useState('');

  // Chapter Form state for selected book
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [chapTitle, setChapTitle] = useState('');
  const [chapSummary, setChapSummary] = useState('');
  const [chapStatus, setChapStatus] = useState<'planejado' | 'escrevendo' | 'concluido'>('planejado');

  // Currently viewed book
  const currentBook = books.find((b) => b.id === selectedBookId) || books[0];
  const currentProject = projects.find((p) => p.id === currentBook?.projectId);

  // Google Drive Marketing & Promotional Materials state
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveFolder, setDriveFolder] = useState<DriveFolderInfo | null>(null);
  const [driveFeedback, setDriveFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isCreatingPromoNote, setIsCreatingPromoNote] = useState(false);
  const [promoNoteTitle, setPromoNoteTitle] = useState('');
  const [promoNoteType, setPromoNoteType] = useState('plano_lancamento');

  // Publication and Launch State for currentBook
  const [pubTargetDate, setPubTargetDate] = useState(currentBook?.targetPublicationDate || '');
  const [pubStatus, setPubStatus] = useState<Book['publicationStatus']>(
    currentBook?.publicationStatus || 'planejado'
  );
  const [pubFormat, setPubFormat] = useState(currentBook?.publicationFormat || 'E-book');
  const [pubPlatform, setPubPlatform] = useState(currentBook?.publisherOrPlatform || '');
  const [pubUrl, setPubUrl] = useState(currentBook?.publicationUrl || '');
  const [pubNotes, setPubNotes] = useState(currentBook?.publicationNotes || '');
  const [isEditingPubDetails, setIsEditingPubDetails] = useState(false);
  const [publicationFeedback, setPublicationFeedback] = useState<string | null>(null);

  // Sync publication fields when currentBook changes
  useEffect(() => {
    if (currentBook) {
      setPubTargetDate(currentBook.targetPublicationDate || '');
      setPubStatus(currentBook.publicationStatus || 'planejado');
      setPubFormat(currentBook.publicationFormat || 'E-book');
      setPubPlatform(currentBook.publisherOrPlatform || '');
      setPubUrl(currentBook.publicationUrl || '');
      setPubNotes(currentBook.publicationNotes || '');
    }
  }, [currentBook?.id]);

  const handleSavePublicationDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentBook) return;
    const updatedBook: Book = {
      ...currentBook,
      targetPublicationDate: pubTargetDate.trim() || undefined,
      publicationStatus: pubStatus,
      publicationFormat: pubFormat.trim() || undefined,
      publisherOrPlatform: pubPlatform.trim() || undefined,
      publicationUrl: pubUrl.trim() || undefined,
      publicationNotes: pubNotes.trim() || undefined,
    };
    onUpdateBook(updatedBook);
    setIsEditingPubDetails(false);
    setPublicationFeedback('✅ Planejamento de publicação atualizado com sucesso!');
    setTimeout(() => setPublicationFeedback(null), 4000);
  };

  const handleConfirmPublication = () => {
    if (!currentBook) return;
    const currentCount = currentBook.publicationCount || (currentBook.publishedAt ? 1 : 0);
    const now = new Date().toISOString();
    const updatedBook: Book = {
      ...currentBook,
      publicationStatus: 'publicado',
      publishedAt: currentBook.publishedAt || now,
      publicationCount: Math.max(1, currentCount + (currentBook.publicationStatus === 'publicado' ? 0 : 1)),
      targetPublicationDate: pubTargetDate.trim() || currentBook.targetPublicationDate || now.split('T')[0],
      publicationFormat: pubFormat.trim() || currentBook.publicationFormat || 'E-book',
      publisherOrPlatform: pubPlatform.trim() || currentBook.publisherOrPlatform || 'Publicação Independente',
      publicationUrl: pubUrl.trim() || currentBook.publicationUrl,
      publicationNotes: pubNotes.trim() || currentBook.publicationNotes,
    };
    onUpdateBook(updatedBook);
    setPubStatus('publicado');
    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#147d74', '#2dd4bf', '#6c2eb9', '#b83280', '#f59e0b', '#10b981'],
      });
    } catch {
      // ignore
    }
    setPublicationFeedback(
      '🎉 Publicação confirmada com sucesso! Suas conquistas de publicação foram atualizadas no mural!'
    );
    setTimeout(() => setPublicationFeedback(null), 6000);
  };

  const handleIncrementPublication = () => {
    if (!currentBook) return;
    const currentCount = currentBook.publicationCount || 1;
    const updatedBook: Book = {
      ...currentBook,
      publicationStatus: 'publicado',
      publishedAt: currentBook.publishedAt || new Date().toISOString(),
      publicationCount: currentCount + 1,
    };
    onUpdateBook(updatedBook);
    try {
      confetti({
        particleCount: 95,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#6c2eb9', '#b83280', '#147d74', '#2dd4bf', '#f59e0b'],
      });
    } catch {
      // ignore
    }
    setPublicationFeedback(
      `🚀 Nova edição/publicação registrada! Total desta obra: ${currentCount + 1} publicações/edições!`
    );
    setTimeout(() => setPublicationFeedback(null), 5000);
  };

  // Load / Check Drive folder and files when currentBook changes or googleToken is present
  useEffect(() => {
    let isCancelled = false;

    const fetchDriveAssets = async () => {
      if (!currentBook || !googleToken) {
        setDriveFolder(null);
        setDriveFiles([]);
        return;
      }

      try {
        setIsDriveLoading(true);
        // Find existing folder or use the stored one
        const folder = await findOrCreateBookMarketingFolder(googleToken, currentBook.title);
        if (isCancelled) return;

        setDriveFolder(folder);

        // Update book with drive folder links if not present
        if (!currentBook.driveFolderId || currentBook.driveFolderId !== folder.id) {
          onUpdateBook({
            ...currentBook,
            driveFolderId: folder.id,
            driveFolderUrl: folder.webViewLink,
          });
        }

        // List files in folder
        const files = await listFolderFiles(googleToken, folder.id);
        if (!isCancelled) {
          setDriveFiles(files);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.warn('Erro ao carregar pasta do Drive:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsDriveLoading(false);
        }
      }
    };

    fetchDriveAssets();

    return () => {
      isCancelled = true;
    };
  }, [currentBook?.id, googleToken]);

  const handleRefreshDrive = async () => {
    if (!currentBook || !googleToken || !driveFolder) return;
    try {
      setIsDriveLoading(true);
      const files = await listFolderFiles(googleToken, driveFolder.id);
      setDriveFiles(files);
      setDriveFeedback({ type: 'success', message: 'Arquivos do Google Drive atualizados!' });
      setTimeout(() => setDriveFeedback(null), 3000);
    } catch {
      setDriveFeedback({ type: 'error', message: 'Erro ao atualizar arquivos do Drive.' });
      setTimeout(() => setDriveFeedback(null), 3000);
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleCreatePromoDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBook || !googleToken || !driveFolder || !promoNoteTitle.trim()) return;

    try {
      setIsDriveLoading(true);
      let defaultTemplate = '';
      if (promoNoteType === 'plano_lancamento') {
        defaultTemplate = `=========================================================\nPLANO DE LANÇAMENTO E CRONOGRAMA DE MARKETING\nLivro: ${currentBook.title}\nAutor(a): ${currentBook.author}\nGênero: ${currentBook.genre}\n=========================================================\n\n1. FASE PRÉ-LANÇAMENTO (30 a 60 dias antes)\n- [ ] Revelação de Capa (Cover Reveal no Instagram/TikTok/Newsletter)\n- [ ] Envio de cópias antecipadas (ARCs) para leitores beta e booktubers\n- [ ] Disponibilizar primeiro capítulo em degustação\n- [ ] Contagem regressiva com teasers e quotes dos personagens\n\n2. FASE DO LANÇAMENTO (Semana do Lançamento)\n- [ ] Live ou evento presencial/online de estreia\n- [ ] Divulgação do link de compra com promoção especial de estreia\n- [ ] Campanha de avaliações na Amazon / Skoob / Goodreads\n\n3. FASE PÓS-LANÇAMENTO (Sustentação)\n- [ ] Entrevistas em podcasts literários\n- [ ] Participação em clubes do livro\n- [ ] Vídeos curtos (Reels/Shorts) sobre a criação dos personagens\n\nNotas e Ideias Adicionais:\n${currentBook.premise ? `Premissa: ${currentBook.premise}\n` : ''}`;
      } else if (promoNoteType === 'posts_redes') {
        defaultTemplate = `=========================================================\nBANCO DE IDEIAS E COPYS PARA REDES SOCIAIS\nObra: ${currentBook.title}\n=========================================================\n\nPost 1: O Conflito Central\n- Hook: "E se você descobrisse que toda a sua vida foi construída sobre uma farsa?"\n- Legenda: Apresentar o dilema do protagonista (${currentBook.characters[0]?.name || 'Protagonista'}).\n- Call to Action: Comente abaixo o que você faria!\n\nPost 2: Bastidores da Escrita\n- Mostre a rotina, o processo de criação de mundos (${currentBook.setting || 'cenário'}) e as pesquisas feitas.\n\nPost 3: Frase de Impacto (Quote Card)\n- Selecionar uma frase marcante de um capítulo.\n`;
      } else {
        defaultTemplate = `=========================================================\nBRIEFING DE MATERIAIS PROMOCIONAIS\nLivro: ${currentBook.title}\n=========================================================\n\n- Paleta de Cores & Estética: Tom ${currentBook.tone || 'narrativo'}.\n- Ativos a produzir: Marcadores de página, banners de divulgação, cards de personagens.\n- Links e Parcerias:\n`;
      }

      await createMarketingNoteInFolder(
        googleToken,
        driveFolder.id,
        promoNoteTitle.trim(),
        defaultTemplate
      );

      // Refresh list
      const files = await listFolderFiles(googleToken, driveFolder.id);
      setDriveFiles(files);
      setIsCreatingPromoNote(false);
      setPromoNoteTitle('');
      setDriveFeedback({
        type: 'success',
        message: 'Documento criado e salvo com sucesso na sua pasta do Google Drive!',
      });
      setTimeout(() => setDriveFeedback(null), 4000);
    } catch {
      setDriveFeedback({
        type: 'error',
        message: 'Houve uma falha ao criar o documento no Drive.',
      });
      setTimeout(() => setDriveFeedback(null), 4000);
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Statistics for this specific book
  const bookSessions = currentBook ? sessions.filter((s) => s.bookId === currentBook.id) : [];
  const bookWords = bookSessions.reduce((sum, s) => sum + s.words, 0);
  const bookMinutes = bookSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const bookHours = Math.floor(bookMinutes / 60);
  const bookRemMinutes = bookMinutes % 60;
  const bookProgressPct = currentBook
    ? Math.min(100, Math.round((bookWords / currentBook.targetWords) * 100))
    : 0;
  const avgWordsPerHour =
    bookMinutes > 0 ? Math.round((bookWords / bookMinutes) * 60) : bookWords;

  // Handle Cover image file upload (dataURL)
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isNewBook: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isNewBook) {
        setNewBookCover(result);
      } else if (currentBook) {
        onUpdateBook({ ...currentBook, coverUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const project: Project = {
      id: `proj_${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      createdAt: new Date().toISOString(),
    };
    onAddProject(project);
    setNewBookProjectId(project.id);
    setNewProjectName('');
    setNewProjectDesc('');
    setIsCreatingProject(false);
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) {
      setFormError('Por favor, informe o título do livro para cadastrar.');
      return;
    }
    setFormError('');

    // If no project exists yet or selected, create a default project for this book
    let projId = newBookProjectId;
    let projToPass: Project | undefined = undefined;

    if (!projId || !projects.some((p) => p.id === projId)) {
      projToPass = {
        id: `proj_${Date.now()}`,
        name: `Projeto ${newBookTitle.trim()}`,
        description: 'Projeto criado automaticamente para o livro',
        createdAt: new Date().toISOString(),
      };
      onAddProject(projToPass);
      projId = projToPass.id;
    }

    const newBook: Book = {
      id: `book_${Date.now()}`,
      projectId: projId,
      title: newBookTitle.trim(),
      subtitle: newBookSubtitle.trim() || undefined,
      author: newBookAuthor.trim() || 'Autor(a)',
      genre: newBookGenre.trim() || 'Ficção',
      targetWords: Number(newBookTarget) > 0 ? Number(newBookTarget) : 50000,
      coverUrl:
        newBookCover ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
      premise: newBookPremise.trim(),
      setting: newBookSetting.trim(),
      tone: newBookTone.trim(),
      targetPublicationDate: newBookTargetPubDate.trim() || undefined,
      publicationStatus: newBookPubStatus,
      publicationFormat: newBookPubFormat,
      characters: [],
      chapters: [],
      createdAt: new Date().toISOString(),
    };

    onAddBook(newBook, projToPass);
    setSelectedBookId(newBook.id);
    setIsCreatingBook(false);

    // Reset book fields
    setNewBookTitle('');
    setNewBookSubtitle('');
    setNewBookAuthor('');
    setNewBookGenre('Fantasia & Ficção');
    setNewBookTarget(50000);
    setNewBookPremise('');
    setNewBookSetting('');
    setNewBookTone('');
    setNewBookCover('');
    setNewBookTargetPubDate('');
    setNewBookPubStatus('planejado');
    setNewBookPubFormat('E-book');
  };

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBook || !charName.trim()) return;
    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: charName.trim(),
      role: charRole,
      archetype: charArchetype.trim() || undefined,
      description: charDesc.trim(),
    };
    const updatedChars = [...(currentBook.characters || []), newChar];
    onUpdateBook({ ...currentBook, characters: updatedChars });
    setCharName('');
    setCharArchetype('');
    setCharDesc('');
    setIsAddingChar(false);
  };

  const handleDeleteCharacter = (charId: string) => {
    if (!currentBook) return;
    const updated = currentBook.characters.filter((c) => c.id !== charId);
    onUpdateBook({ ...currentBook, characters: updated });
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBook || !chapTitle.trim()) return;
    const currentChaps = currentBook.chapters || [];
    const newChap: Chapter = {
      id: `chap_${Date.now()}`,
      order: currentChaps.length + 1,
      title: chapTitle.trim(),
      summary: chapSummary.trim(),
      status: chapStatus,
    };
    onUpdateBook({ ...currentBook, chapters: [...currentChaps, newChap] });
    setChapTitle('');
    setChapSummary('');
    setIsAddingChapter(false);
  };

  const handleDeleteChapter = (chapId: string) => {
    if (!currentBook) return;
    const updated = currentBook.chapters.filter((c) => c.id !== chapId);
    onUpdateBook({ ...currentBook, chapters: updated });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Banner - Manual do Livro & Arquitetura */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-10 shadow-lg bg-gradient-to-br from-[#120a1f] via-[#1a0f2b] to-[#120721] dark:from-[#0f071a] dark:to-[#0a0413] border border-[#ebdff2]/20 dark:border-[#2d1b42] text-white">
        {/* Soft, delicate ambient glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#be185d]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#f472b6]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-400/40 text-xs font-bold tracking-wider uppercase text-[#f472b6] shadow-xs">
                <BookMarked className="w-3.5 h-3.5 text-[#f472b6]" />
                <span>CronosBíblia · Arquitetura & Universo do Livro</span>
              </div>
              <h1 className="font-serif-display text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                CronosEscrita -{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f472b6] via-[#ec4899] to-[#fb7185]">
                  Manual & Arquitetura do Livro
                </span>{' '}
                📖
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">
                Estruture a alma das suas histórias. Cada livro possui suas próprias imagens,
                personagens, capítulos, cenários e registra com precisão cada minuto e palavra
                trabalhados pelo autor.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* Botão de Pesquisa Geral de Imagens e Moodboards de todos os livros */}
                <button
                  onClick={() => setIsImageGalleryOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#b83280] hover:bg-[#992266] font-semibold text-xs text-white transition-all shadow-sm active:scale-95 cursor-pointer border border-[#f472b6]/40"
                  title="Pesquisar todas as imagens, capas e moodboards de todos os livros cadastrados sem abrir projeto por projeto"
                >
                  <Images className="w-4 h-4 text-[#2dd4bf]" />
                  <span>Pesquisar Imagens & Moodboards</span>
                </button>

                <button
                  onClick={handleOpenCreateBook}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] font-semibold text-xs text-white transition-all shadow-xs active:scale-95 cursor-pointer border border-[#6c2ea6]/40"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Criar Novo Livro</span>
                </button>

                <button
                  onClick={() => setIsCreatingProject(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-xs text-white transition-all shadow-xs active:scale-95 cursor-pointer border border-white/20"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Novo Projeto / Série</span>
                </button>

                {onOpenExportModal && (
                  <button
                    onClick={onOpenExportModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6c2eb9] to-[#2dd4bf] hover:opacity-95 font-semibold text-xs text-white transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Exportar Ficha Editorial</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Card: Obra em Foco */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shrink-0 flex flex-col justify-between shadow-lg min-w-[260px]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#f472b6] font-bold block">
                  Obra Selecionada
                </span>
                <span className="font-serif-display text-xl font-bold text-white block mt-0.5 truncate max-w-[220px]">
                  {currentBook ? currentBook.title : 'Nenhum Livro'}
                </span>
                <span className="text-xs text-[#2dd4bf] font-semibold block mt-0.5">
                  {currentProject ? currentProject.name : 'Projeto Geral'}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                <span>Progresso da Obra:</span>
                <span className="text-emerald-400 font-bold">{bookProgressPct}% ({bookWords} pals.)</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (4 chips row) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Livros Cadastrados</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {books.length} {books.length === 1 ? 'obra' : 'obras'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <FolderPlus className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Projetos & Séries</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {projects.length} ativos
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Personagens</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {currentBook?.characters?.length || 0} fichas
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Capítulos Planejados</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {currentBook?.chapters?.length || 0} capítulos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Creator Modal */}
      {isCreatingProject && (
        <div className="p-6 bg-[#faf7fd] dark:bg-[#1c0e2e] rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] animate-in fade-in">
          <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-2">
            Adicionar Novo Projeto / Série
          </h3>
          <form onSubmit={handleCreateProject} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                Nome do Projeto *
              </label>
              <input
                type="text"
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ex: Trilogia de Eldoria"
                className="w-full text-sm p-3 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                Descrição Curta
              </label>
              <input
                type="text"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Ex: Série épica de fantasia com foco em conspirações."
                className="w-full text-sm p-3 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer hover:bg-[#faf7fd] dark:hover:bg-[#1c0e2e]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#532380] hover:bg-[#6c2ea6] shadow-xs active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40"
              >
                Salvar Projeto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Book Creator Panel */}
      {isCreatingBook && (
        <div
          id="book-creator-panel"
          className="p-6 sm:p-8 bg-white dark:bg-[#160b24] rounded-3xl border-2 border-[#ebdff2] dark:border-[#2d1b42] shadow-2xl animate-in fade-in space-y-4"
        >
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#ebdff2] dark:border-[#2d1b42]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf] text-xs font-bold uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#147d74] dark:text-[#2dd4bf]" />
                <span>{books.length === 0 ? 'Primeiro Livro' : 'Novo Livro no Catálogo'}</span>
              </div>
              <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                {books.length === 0 ? 'Cadastrar Meu Primeiro Livro' : 'Cadastrar Novo Livro no Manual'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingBook(false);
                setFormError('');
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#faf7fd] dark:hover:bg-[#1c0e2e] cursor-pointer"
            >
              Fechar
            </button>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-[#fae8f2] dark:bg-[#341628] border border-[#f5cbe2] dark:border-[#521c3c] text-[#b83280] dark:text-[#f472b6] text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form id="create-book-form" onSubmit={handleCreateBook} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Projeto Pai
                </label>
                <select
                  value={newBookProjectId}
                  onChange={(e) => setNewBookProjectId(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                >
                  {projects.length === 0 ? (
                    <option value="">Novo Projeto Automático</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Título do Livro *
                </label>
                <input
                  id="new-book-title-input"
                  type="text"
                  required
                  value={newBookTitle}
                  onChange={(e) => {
                    setNewBookTitle(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Ex: O Canto dos Corvos"
                  className="w-full text-sm p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={newBookSubtitle}
                  onChange={(e) => setNewBookSubtitle(e.target.value)}
                  placeholder="Ex: Parte I da Saga"
                  className="w-full text-sm p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Autor(a)
                </label>
                <input
                  type="text"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  placeholder="Ex: Seu Nome / Pseudônimo"
                  className="w-full text-sm p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Gênero
                </label>
                <input
                  type="text"
                  value={newBookGenre}
                  onChange={(e) => setNewBookGenre(e.target.value)}
                  placeholder="Ex: Fantasia Sombria / Romance"
                  className="w-full text-sm p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Meta de Palavras do Livro
                </label>
                <input
                  type="number"
                  min="1000"
                  value={newBookTarget}
                  onChange={(e) => setNewBookTarget(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full text-sm p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                />
              </div>
            </div>

            {/* Cover Image Upload / URL */}
            <div className="p-4 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-28 rounded-xl bg-white dark:bg-[#160b24] overflow-hidden shrink-0 border border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-center">
                {newBookCover ? (
                  <img src={newBookCover} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#5c4672]/50 dark:text-[#c4b3d8]/50" />
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                  Capa / Moodboard Visual do Livro
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newBookCover}
                    onChange={(e) => setNewBookCover(e.target.value)}
                    placeholder="URL da imagem (ou faça upload ao lado)"
                    className="flex-1 text-xs p-2 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                  />
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Arquivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Premissa / Logline
                </label>
                <textarea
                  rows={2}
                  value={newBookPremise}
                  onChange={(e) => setNewBookPremise(e.target.value)}
                  placeholder="Qual é o cerne dramático do livro em 1 ou 2 frases?"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                  Cenário (Worldbuilding)
                </label>
                <textarea
                  rows={2}
                  value={newBookSetting}
                  onChange={(e) => setNewBookSetting(e.target.value)}
                  placeholder="Onde e quando a história se passa? Regras do mundo."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                />
              </div>
            </div>

            {/* Planejamento de Publicação no Cadastro Inicial */}
            <div className="p-4 rounded-2xl bg-[#e6f7f5]/50 dark:bg-[#0c2a27]/40 border border-[#bbf0eb] dark:border-[#14534f] space-y-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf]" />
                <span className="text-xs font-bold text-[#0d4f49] dark:text-[#b4f0eb]">
                  Planejamento de Publicação & Lançamento (Quando será publicado)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0d4f49] dark:text-[#b4f0eb] mb-1">
                    Previsão de Publicação (Data)
                  </label>
                  <input
                    type="date"
                    value={newBookTargetPubDate}
                    onChange={(e) => setNewBookTargetPubDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#bbf0eb] dark:border-[#14534f] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#147d74] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0d4f49] dark:text-[#b4f0eb] mb-1">
                    Status Inicial da Publicação
                  </label>
                  <select
                    value={newBookPubStatus}
                    onChange={(e) =>
                      setNewBookPubStatus(
                        e.target.value as 'planejado' | 'em_preparacao' | 'pronto' | 'publicado'
                      )
                    }
                    className="w-full text-xs p-2 rounded-xl border border-[#bbf0eb] dark:border-[#14534f] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#147d74] outline-hidden"
                  >
                    <option value="planejado">Planejado (Em Escrita)</option>
                    <option value="em_preparacao">Em Preparação / Revisão</option>
                    <option value="pronto">Pronto para Publicar</option>
                    <option value="publicado">Já Publicado!</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0d4f49] dark:text-[#b4f0eb] mb-1">
                    Formato Previsto
                  </label>
                  <select
                    value={newBookPubFormat}
                    onChange={(e) => setNewBookPubFormat(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#bbf0eb] dark:border-[#14534f] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#147d74] outline-hidden"
                  >
                    <option value="E-book">E-book (Amazon KDP / Digital)</option>
                    <option value="Livro Físico">Livro Físico (Impresso / UICLAP)</option>
                    <option value="E-book & Físico">E-book & Físico</option>
                    <option value="Webnovel / Serial">Webnovel / Serializado (Wattpad / Substack)</option>
                    <option value="Antologia / Conto">Antologia / Conto Avulso</option>
                    <option value="Artigo / Ensaio">Artigo / Ensaio</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42]">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingBook(false);
                  setFormError('');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer hover:bg-[#faf7fd] dark:hover:bg-[#1c0e2e]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#532380] hover:bg-[#6c2ea6] shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 border border-[#6c2ea6]/40"
              >
                <BookMarked className="w-4 h-4 text-white" />
                <span>{books.length === 0 ? 'Cadastrar Meu Primeiro Livro' : 'Cadastrar Livro no Manual'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Nenhum livro cadastrado ainda (quando necessario) / Seletor e Ficha de Livros Cadastrados */}
      {books.length === 0 ? (
        !isCreatingBook ? (
          <div className="bg-white dark:bg-[#160b24] rounded-3xl p-8 sm:p-10 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f4ecf8] dark:bg-[#26133a] text-[#532380] dark:text-[#c4b3d8] flex items-center justify-center mx-auto">
              <BookMarked className="w-8 h-8" />
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
              Nenhum livro cadastrado ainda
            </h3>
            <p className="text-sm text-[#5c4672]/80 dark:text-[#c4b3d8]/80 max-w-md mx-auto">
              Comece criando o primeiro livro do seu projeto literário! Você poderá definir personagens,
              capítulos, imagem de capa e acompanhar cada palavra escrita nele.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenCreateBook}
                className="px-6 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                Cadastrar Meu Primeiro Livro
              </button>
            </div>
          </div>
        ) : null
      ) : (
        <div className="space-y-6">
          {/* Seletor de Livros Cadastrados */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {books.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBookId(b.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border cursor-pointer ${
                  b.id === currentBook?.id
                    ? 'bg-[#532380] text-white border-[#532380] shadow-xs'
                    : 'bg-white dark:bg-[#160b24] text-[#5c4672] dark:text-[#c4b3d8] border-[#ebdff2] dark:border-[#2d1b42] hover:bg-[#faf7fd] dark:hover:bg-[#1c0e2e]'
                }`}
              >
                <span>{b.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${
                    b.id === currentBook?.id
                      ? 'bg-black/20 text-[#2dd4bf]'
                      : 'bg-[#f4ecf8] dark:bg-[#26133a] text-[#532380] dark:text-[#c4b3d8]'
                  }`}
                >
                  {new Intl.NumberFormat('pt-BR').format(
                    sessions.filter((s) => s.bookId === b.id).reduce((sum, s) => sum + s.words, 0)
                  )}{' '}
                  pal.
                </span>
              </button>
            ))}
          </div>

          {currentBook && (
            /* Ficha do Livro Ativo e Métricas */
            <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Cover Image & Upload trigger */}
                <div className="w-full sm:w-48 h-64 rounded-2xl overflow-hidden border-2 border-[#ebdff2] dark:border-[#2d1b42] shrink-0 bg-[#faf7fd] dark:bg-[#12071f] relative group shadow-sm">
                  <img
                    src={
                      currentBook.coverUrl ||
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80'
                    }
                    alt={currentBook.title}
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-[#1b0e2e]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer p-2 text-center">
                    <Upload className="w-6 h-6 mb-1 text-[#2dd4bf]" />
                    <span>Trocar Imagem de Capa</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverFileUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Book Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf]">
                        {currentProject?.name || 'Projeto'} · {currentBook.genre}
                      </span>
                      <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1">
                        {currentBook.title}
                      </h2>
                      {currentBook.subtitle && (
                        <p className="text-sm font-medium text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-0.5">
                          {currentBook.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-[#5c4672]/70 dark:text-[#c4b3d8]/70 mt-1">
                        Por {currentBook.author}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onQuickLogForBook(currentBook.id, currentBook.projectId)}
                        className="px-4 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40"
                      >
                        Registrar Escrita Neste Livro
                      </button>
                      <button
                        onClick={() => onDeleteBook(currentBook.id)}
                        title="Excluir livro"
                        className="p-2.5 text-[#5c4672]/60 hover:text-[#b83280] dark:hover:text-[#f472b6] rounded-xl hover:bg-[#fae8f2] dark:hover:bg-[#341628] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* COMPUTED METRICS: Palavras e Tempo Dedicado */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                    <div className="p-3.5 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42]">
                      <span className="text-[11px] font-bold text-[#532380] dark:text-[#c4b3d8] block uppercase">
                        Palavras Escritas
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-0.5 block tabular-nums">
                        {new Intl.NumberFormat('pt-BR').format(bookWords)}
                      </span>
                      <span className="text-[10px] text-[#5c4672]/70 dark:text-[#c4b3d8]/70 tabular-nums">
                        de {new Intl.NumberFormat('pt-BR').format(currentBook.targetWords)} meta
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#e6f7f5] dark:bg-[#0c2a27] border border-[#bbf0eb] dark:border-[#14534f]">
                      <span className="text-[11px] font-bold text-[#147d74] dark:text-[#2dd4bf] block uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#147d74] dark:text-[#2dd4bf]" />
                        <span>Tempo Dedicado</span>
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-[#0d4f49] dark:text-[#b4f0eb] mt-0.5 block tabular-nums">
                        {bookHours}h {bookRemMinutes}m
                      </span>
                      <span className="text-[10px] text-[#147d74]/70 dark:text-[#2dd4bf]/70 tabular-nums">
                        {bookSessions.length} sessões gravadas
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#fae8f2] dark:bg-[#341628] border border-[#f5cbe2] dark:border-[#521c3c]">
                      <span className="text-[11px] font-bold text-[#b83280] dark:text-[#f472b6] block uppercase">
                        Ritmo Médio
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-[#701a4e] dark:text-[#f472b6] mt-0.5 block tabular-nums">
                        {avgWordsPerHour}
                      </span>
                      <span className="text-[10px] text-[#b83280]/70 dark:text-[#f472b6]/70">
                        palavras por hora
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42]">
                      <span className="text-[11px] font-bold text-[#532380] dark:text-[#c4b3d8] block uppercase">
                        Conclusão
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-0.5 block tabular-nums">
                        {bookProgressPct}%
                      </span>
                      <span className="text-[10px] text-[#5c4672]/70 dark:text-[#c4b3d8]/70">
                        do objetivo desta obra
                      </span>
                    </div>
                  </div>

                  {/* Book Word Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-semibold text-[#5c4672]/70 dark:text-[#c4b3d8]/70 mb-1">
                      <span>Avanço no manuscrito</span>
                      <span className="text-[#147d74] dark:text-[#2dd4bf] font-bold tabular-nums">{bookProgressPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#f4ecf8] dark:bg-[#26133a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#532380] via-[#b83280] to-[#147d74] rounded-full transition-all duration-500"
                        style={{ width: `${bookProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* 3. Pesquisa & Referências Literárias */}
      {/* 4. Pesquise Dúvidas & Referências Sem Sair do Manual */}
      {/* 5. Menu com os botões e aba de pesquisa (passed via children) */}
      {/* 6. Caderno de Pesquisa deste Livro */}
      <BookResearchTool
        book={currentBook}
        books={books}
        onUpdateBook={onUpdateBook}
        onSelectBook={(id) => setSelectedBookId(id)}
        initialQuery={researchInitialQuery}
        autoSearchOnMount={!!researchInitialQuery}
      >
        {currentBook && (
          <div className="space-y-6 pt-2">
            {/* 5. Menu com os botões e aba de pesquisa */}
            <div className="flex items-center gap-2 p-1.5 bg-[#faf7fd] dark:bg-[#1c0e2e] rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveBookTab('architecture')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeBookTab === 'architecture'
                    ? 'bg-[#532380] text-white shadow-xs'
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/80 dark:hover:bg-[#25133c]'
                }`}
              >
                <BookMarked className="w-4 h-4 text-[#2dd4bf]" />
                <span>Arquitetura da Obra (Personagens & Capítulos)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveBookTab('research');
                  setTimeout(() => {
                    const input = document.getElementById('research-search-input');
                    input?.focus();
                  }, 100);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeBookTab === 'research'
                    ? 'bg-[#b83280] text-white shadow-xs'
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/80 dark:hover:bg-[#25133c]'
                }`}
              >
                <Search className="w-4 h-4 text-[#f472b6]" />
                <span>Pesquisa & Referências (Google Search)</span>
                {currentBook.researchNotes && currentBook.researchNotes.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6] text-[10px] font-bold tabular-nums">
                    {currentBook.researchNotes.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveBookTab('drive')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeBookTab === 'drive'
                    ? 'bg-[#532380] text-white shadow-xs'
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/80 dark:hover:bg-[#25133c]'
                }`}
              >
                <HardDrive className="w-4 h-4 text-[#2dd4bf]" />
                <span>Google Drive & MKT</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBookTab('publication')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeBookTab === 'publication'
                    ? 'bg-[#147d74] text-white shadow-xs'
                    : 'text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white/80 dark:hover:bg-[#25133c]'
                }`}
              >
                <Rocket className="w-4 h-4 text-[#2dd4bf]" />
                <span>Publicação & Lançamentos</span>
                {currentBook.publicationStatus === 'publicado' && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#2dd4bf]/20 text-[#2dd4bf] text-[10px] font-bold">
                    Publicado ✓
                  </span>
                )}
              </button>
            </div>

            {/* Aviso quando a aba ativa é Pesquisa */}
            {activeBookTab === 'research' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fae8f2]/80 dark:bg-[#341628]/50 border border-[#f5cbe2] dark:border-[#521c3c] text-xs text-[#701a4e] dark:text-[#f472b6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#b83280] shrink-0" />
                  <span>Aba de Pesquisa ativa: utilize o campo de pesquisa acima para novas dúvidas e consulte as notas salvas no Caderno logo abaixo.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBookTab('architecture')}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#160b24] border border-[#f5cbe2] dark:border-[#521c3c] text-xs font-semibold text-[#701a4e] dark:text-[#f472b6] hover:bg-[#fae8f2] cursor-pointer shrink-0"
                >
                  Ver Arquitetura da Obra
                </button>
              </div>
            )}

              {/* PUBLICATION TAB: Lançamentos & Confirmação de Publicação */}
              {activeBookTab === 'publication' && (
                <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300 animate-in fade-in space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf]">
                          <Rocket className="w-5 h-5" />
                        </span>
                        <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                          Planejamento de Publicação & Lançamento
                        </h3>
                      </div>
                      <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
                        Gerencie a data de lançamento, formato, plataforma e confirme a publicação desta obra para disparar conquistas e celebrar no mural.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingPubDetails(!isEditingPubDetails)}
                        className="px-4 py-2.5 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8] text-xs font-bold hover:bg-white transition-colors cursor-pointer"
                      >
                        {isEditingPubDetails ? 'Fechar Edição' : 'Editar Dados de Publicação'}
                      </button>
                    </div>
                  </div>

                  {publicationFeedback && (
                    <div className="p-4 rounded-2xl bg-[#e6f7f5] dark:bg-[#122e2b] border border-[#bbf0eb] dark:border-[#1d4d47] text-xs font-bold text-[#147d74] dark:text-[#2dd4bf] flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf] shrink-0" />
                      <span>{publicationFeedback}</span>
                    </div>
                  )}

                  {/* Edit Form or Summary Cards */}
                  {isEditingPubDetails ? (
                    <form onSubmit={handleSavePublicationDetails} className="p-5 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#532380] dark:text-[#c4b3d8]">
                        Configurar Detalhes de Lançamento
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                            Previsão ou Data de Publicação
                          </label>
                          <input
                            type="date"
                            value={pubTargetDate}
                            onChange={(e) => setPubTargetDate(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                            Status da Publicação
                          </label>
                          <select
                            value={pubStatus}
                            onChange={(e) => setPubStatus(e.target.value as any)}
                            className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden"
                          >
                            <option value="planejado">Planejado (Em Escrita)</option>
                            <option value="em_preparacao">Em Preparação / Revisão</option>
                            <option value="pronto">Pronto para Publicar</option>
                            <option value="publicado">Publicado Oficialmente</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                            Formato Principal
                          </label>
                          <input
                            type="text"
                            value={pubFormat}
                            onChange={(e) => setPubFormat(e.target.value)}
                            placeholder="Ex: E-book, Livro Físico, Antologia"
                            className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                            Plataforma / Editora
                          </label>
                          <input
                            type="text"
                            value={pubPlatform}
                            onChange={(e) => setPubPlatform(e.target.value)}
                            placeholder="Ex: Amazon KDP, UICLAP, Wattpad"
                            className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                            Link da Publicação / Onde Encontrar (URL)
                          </label>
                          <input
                            type="url"
                            value={pubUrl}
                            onChange={(e) => setPubUrl(e.target.value)}
                            placeholder="https://amazon.com.br/dp/..."
                            className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                            Notas de Lançamento / Sinopse Comercial
                          </label>
                          <textarea
                            rows={2}
                            value={pubNotes}
                            onChange={(e) => setPubNotes(e.target.value)}
                            placeholder="Detalhes sobre a recepção dos leitores, ISBN ou notas de divulgação..."
                            className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] outline-hidden"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingPubDetails(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-[#5c4672] bg-white border border-[#ebdff2]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#532380] hover:bg-[#6c2ea6]"
                        >
                          Salvar Detalhes
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {/* Main Status & Confirmation Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-5 rounded-3xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#532380] dark:text-[#c4b3d8] uppercase tracking-wider block">
                          Status de Publicação
                        </span>
                        <span className="text-xl font-serif-display font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1 block">
                          {currentBook.publicationStatus === 'publicado'
                            ? '✅ Publicado Oficialmente'
                            : currentBook.publicationStatus === 'pronto'
                            ? '🚀 Pronto para Publicar'
                            : currentBook.publicationStatus === 'em_preparacao'
                            ? '🔍 Em Preparação'
                            : '📝 Em Escrita (Planejado)'}
                        </span>
                        <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-2">
                          {currentBook.publicationStatus === 'publicado'
                            ? `Data: ${currentBook.publishedAt ? currentBook.publishedAt.split('T')[0].split('-').reverse().join('/') : 'Confirmada'}`
                            : `Previsão: ${currentBook.targetPublicationDate || 'A definir'}`}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42] text-xs font-bold text-[#147d74] dark:text-[#2dd4bf]">
                        Total de Publicações / Edições: {currentBook.publicationCount || (currentBook.publicationStatus === 'publicado' ? 1 : 0)}
                      </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#b83280] dark:text-[#f472b6] uppercase tracking-wider block">
                          Formato & Plataforma
                        </span>
                        <span className="text-base font-bold text-[#220d3a] dark:text-[#f7f2fc] mt-1 block">
                          {currentBook.publicationFormat || 'E-book'}
                        </span>
                        <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
                          {currentBook.publisherOrPlatform || 'Publicação Independente'}
                        </p>
                        {currentBook.publicationUrl && (
                          <a
                            href={currentBook.publicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#147d74] dark:text-[#2dd4bf] hover:underline font-bold mt-2"
                          >
                            <span>Acessar Link da Obra</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#ebdff2] dark:border-[#2d1b42] text-xs text-[#5c4672] dark:text-[#c4b3d8]">
                        {currentBook.publicationNotes || 'Nenhuma nota adicional cadastrada.'}
                      </div>
                    </div>

                    {/* Action Confirmation Card */}
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1b0e2e] to-[#2b1646] text-white border border-[#3b235c] flex flex-col justify-between shadow-md">
                      <div>
                        <span className="text-[11px] font-bold text-[#2dd4bf] uppercase tracking-wider block">
                          Confirmação de Lançamento
                        </span>
                        <h4 className="font-serif-display text-lg font-bold text-white mt-1">
                          {currentBook.publicationStatus === 'publicado' ? 'Parabéns pela Obra!' : 'Pronto para o Mundo?'}
                        </h4>
                        <p className="text-xs text-white/80 mt-1 leading-relaxed">
                          {currentBook.publicationStatus === 'publicado'
                            ? 'Sua obra está publicada. Deseja registrar uma nova edição, conto extra ou capítulo adicional?'
                            : 'Confirme a publicação deste livro para desbloquear badges como Primeira Publicação, 5ª, 10ª e muito mais!'}
                        </p>
                      </div>

                      <div className="mt-5 space-y-2">
                        {currentBook.publicationStatus !== 'publicado' ? (
                          <button
                            type="button"
                            onClick={handleConfirmPublication}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#147d74] to-[#2dd4bf] hover:opacity-95 text-[#0f0717] font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Rocket className="w-4 h-4" />
                            <span>🎉 Confirmar Publicação Deste Livro!</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleIncrementPublication}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#b83280] hover:bg-[#a0286e] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <FilePlus2 className="w-4 h-4 text-[#2dd4bf]" />
                            <span>🚀 Registrar Nova Publicação/Edição (+1)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* GOOGLE DRIVE: Planejamento de Marketing & Material Promocional */}
              {activeBookTab === 'drive' && (
                <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf]">
                        <HardDrive className="w-5 h-5" />
                      </span>
                      <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                        Google Drive · Material Promocional & MKT
                      </h3>
                    </div>
                    <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
                      Acesso centralizado para criar, armazenar e consultar materiais de divulgação, copys para redes e cronogramas de lançamento desta obra.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {googleToken ? (
                      <>
                        <button
                          onClick={handleRefreshDrive}
                          disabled={isDriveLoading}
                          title="Atualizar lista de arquivos do Drive"
                          className="p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#faf7fd] dark:hover:bg-[#1c0e2e] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${isDriveLoading ? 'animate-spin' : ''}`} />
                        </button>

                        {driveFolder?.webViewLink && (
                          <a
                            href={driveFolder.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] hover:bg-white text-[#5c4672] dark:text-[#c4b3d8] text-xs font-bold border border-[#ebdff2] dark:border-[#2d1b42] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#532380] dark:text-[#c4b3d8]" />
                            <span>Abrir Pasta no Drive</span>
                          </a>
                        )}

                        <button
                          onClick={() => setIsCreatingPromoNote(!isCreatingPromoNote)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40"
                        >
                          <FilePlus2 className="w-4 h-4" />
                          <span>Novo Documento de MKT</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={onConnectGoogle}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40"
                      >
                        <HardDrive className="w-4 h-4 text-[#2dd4bf]" />
                        <span>Conectar ao Google Drive</span>
                      </button>
                    )}
                  </div>
                </div>

                {driveFeedback && (
                  <div
                    className={`my-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                      driveFeedback.type === 'success'
                        ? 'bg-[#f0f7f6] dark:bg-[#152726] text-[#184643] dark:text-[#b4f0eb] border border-[#d2e8e6] dark:border-[#224442]'
                        : 'bg-[#faf1f5] dark:bg-[#2b1924] text-[#8a4a6c] dark:text-[#e89dbd] border border-[#f3d9e5] dark:border-[#4b273b]'
                    }`}
                  >
                    {driveFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#377570] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#8a4a6c] shrink-0" />
                    )}
                    <span>{driveFeedback.message}</span>
                  </div>
                )}

                {/* Form to create a promotional document/checklist directly in Google Drive */}
                {isCreatingPromoNote && googleToken && (
                  <form
                    onSubmit={handleCreatePromoDoc}
                    className="my-5 p-5 rounded-2xl bg-[#f0f7f6]/60 dark:bg-[#152726]/40 border border-[#d2e8e6] dark:border-[#224442] animate-in fade-in space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#184643] dark:text-[#b4f0eb] uppercase tracking-wide">
                        Adicionar Documento ao Google Drive
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingPromoNote(false)}
                        className="text-xs text-[#5c4075] dark:text-[#caaee6] hover:underline cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2e1d40] dark:text-[#f2ebf8] mb-1">
                          Nome do Documento / Nota *
                        </label>
                        <input
                          type="text"
                          required
                          value={promoNoteTitle}
                          onChange={(e) => setPromoNoteTitle(e.target.value)}
                          placeholder="Ex: Cronograma de Teasers no Instagram"
                          className="w-full text-xs p-2.5 rounded-xl border border-[#d2e8e6] dark:border-[#224442] bg-white dark:bg-[#160f21] text-[#2e1d40] dark:text-[#f2ebf8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2e1d40] dark:text-[#f2ebf8] mb-1">
                          Modelo Pronto de Marketing
                        </label>
                        <select
                          value={promoNoteType}
                          onChange={(e) => setPromoNoteType(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-[#d2e8e6] dark:border-[#224442] bg-white dark:bg-[#160f21] text-[#2e1d40] dark:text-[#f2ebf8]"
                        >
                          <option value="plano_lancamento">
                            🚀 Plano de Lançamento (Pré, Estreia e Pós)
                          </option>
                          <option value="posts_redes">
                            📱 Banco de Ideias & Roteiros de Redes Sociais
                          </option>
                          <option value="briefing">
                            🎨 Briefing de Materiais Promocionais (Artes e Brindes)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingPromoNote(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-[#5c4075] dark:text-[#caaee6] bg-white dark:bg-[#160f21] border border-[#e8dff0] dark:border-[#332448] cursor-pointer hover:bg-[#f6f0fa] dark:hover:bg-[#20152f]"
                      >
                        Descartar
                      </button>
                      <button
                        type="submit"
                        disabled={isDriveLoading}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#674885] hover:bg-[#5b3c78] shadow-xs active:scale-95 transition-all cursor-pointer border border-[#8964ac]/40 disabled:opacity-50"
                      >
                        {isDriveLoading ? 'Salvando no Drive...' : 'Criar no Google Drive'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Drive Files List / Status */}
                {!googleToken ? (
                  <div className="my-6 p-6 rounded-2xl bg-[#f7f2fa]/70 dark:bg-[#20152f]/70 border border-[#e8dff0] dark:border-[#332448] text-center space-y-3">
                    <HardDrive className="w-10 h-10 text-[#674885]/60 dark:text-[#caaee6]/60 mx-auto" />
                    <p className="text-xs text-[#5d4773] dark:text-[#caaee6] max-w-lg mx-auto">
                      Conecte sua conta do Google para sincronizar automaticamente uma pasta exclusiva de materiais promocionais e planejamento de marketing para o livro <strong>"{currentBook.title}"</strong>.
                    </p>
                    <button
                      onClick={onConnectGoogle}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#674885] hover:bg-[#5b3c78] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer border border-[#8964ac]/40"
                    >
                      <HardDrive className="w-4 h-4 text-[#9ed3cf]" />
                      <span>Conectar com Google Workspace</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {/* Folder Info Banner */}
                    <div className="p-3.5 rounded-2xl bg-[#f0f7f6] dark:bg-[#152726] border border-[#d2e8e6] dark:border-[#224442] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderGit2 className="w-4 h-4 text-[#377570] dark:text-[#8bd8d3] shrink-0" />
                        <span className="font-bold text-[#184643] dark:text-[#b4f0eb] truncate">
                          Pasta Vinculada: {driveFolder ? driveFolder.name : `MKT & Promoção - ${currentBook.title}`}
                        </span>
                      </div>
                      {driveFolder?.webViewLink && (
                        <a
                          href={driveFolder.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#377570] dark:text-[#8bd8d3] font-bold hover:underline flex items-center gap-1 shrink-0"
                        >
                          <span>Acessar no Google Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {isDriveLoading && driveFiles.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#5d4773]/60 dark:text-[#caaee6]/60 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#377570]" />
                        <span>Carregando materiais do Google Drive...</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#5d4773]/70 dark:text-[#caaee6]/70 bg-[#faf7fc]/50 dark:bg-[#160f21]/50 rounded-2xl border border-dashed border-[#e8dff0] dark:border-[#332448]">
                        Nenhum arquivo encontrado nesta pasta ainda. Clique em <strong>"Novo Documento de MKT"</strong> acima ou envie artes e cronogramas direto pelo Google Drive!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {driveFiles.map((file) => (
                          <a
                            key={file.id}
                            href={file.webViewLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 rounded-2xl border border-[#e8dff0] dark:border-[#332448] bg-white dark:bg-[#160f21] hover:border-[#377570] dark:hover:border-[#4a9891] hover:shadow-xs transition-all flex items-start gap-3 group"
                          >
                            <span className="w-8 h-8 rounded-xl bg-[#f0f7f6] dark:bg-[#152726] text-[#377570] dark:text-[#8bd8d3] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <FileText className="w-4 h-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-xs text-[#2e1d40] dark:text-[#f2ebf8] block truncate group-hover:text-[#377570] dark:group-hover:text-[#8bd8d3] transition-colors">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-[#5d4773]/60 dark:text-[#caaee6]/60 block mt-0.5">
                                {file.modifiedTime
                                  ? new Date(file.modifiedTime).toLocaleDateString('pt-BR')
                                  : 'Arquivo do Drive'}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-[#8a65ad] group-hover:text-[#377570] shrink-0 transition-colors" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
              )}

              {/* ARCHITECTURE TAB: Worldbuilding, Characters, Chapters */}
              {activeBookTab === 'architecture' && (
                <div className="space-y-8 animate-in fade-in">
                  {/* Worldbuilding & Story Details */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Premissa */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#532380] dark:text-[#c4b3d8] flex items-center gap-1.5 mb-2">
                    <Compass className="w-4 h-4 text-[#532380] dark:text-[#c4b3d8]" />
                    <span>Premissa / Logline</span>
                  </span>
                  <p className="text-xs text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed font-serif">
                    {currentBook.premise ||
                      'Nenhuma premissa descrita ainda. Adicione o cerne dramático da sua narrativa.'}
                  </p>
                </div>

                {/* Cenário & Universo */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#147d74] dark:text-[#2dd4bf] flex items-center gap-1.5 mb-2">
                    <Layers className="w-4 h-4 text-[#147d74] dark:text-[#2dd4bf]" />
                    <span>Cenário & Worldbuilding</span>
                  </span>
                  <p className="text-xs text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed font-serif">
                    {currentBook.setting ||
                      'Descreva os reinos, cidades, atmosferas e leis do mundo onde seus personagens habitam.'}
                  </p>
                </div>

                {/* Tom Narrativo & Notas */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#b83280] dark:text-[#f472b6] flex items-center gap-1.5 mb-2">
                    <FileText className="w-4 h-4 text-[#b83280] dark:text-[#f472b6]" />
                    <span>Tom & Voz Narrativa</span>
                  </span>
                  <p className="text-xs text-[#220d3a] dark:text-[#f7f2fc] leading-relaxed font-serif">
                    {currentBook.tone ||
                      'Defina o clima emocional, ritmo das frases e sensações que o leitor deve vivenciar.'}
                  </p>
                </div>
              </section>

              {/* Characters Section */}
              <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-[#f4ecf8] dark:bg-[#26133a] text-[#532380] dark:text-[#c4b3d8]">
                        <Users className="w-5 h-5" />
                      </span>
                      <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                        Galeria de Personagens ({currentBook.characters?.length || 0})
                      </h3>
                    </div>
                    <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
                      Protagonistas, antagonistas e aliados que movem os conflitos da trama.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingChar(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>Adicionar Personagem</span>
                  </button>
                </div>

                {isAddingChar && (
                  <form
                    onSubmit={handleAddCharacter}
                    className="my-5 p-5 rounded-2xl bg-[#faf7fd] dark:bg-[#1c0e2e] border border-[#ebdff2] dark:border-[#2d1b42] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                        Nome do Personagem *
                      </label>
                      <input
                        type="text"
                        required
                        value={charName}
                        onChange={(e) => setCharName(e.target.value)}
                        placeholder="Ex: Kaelen Vane"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                        Papel
                      </label>
                      <select
                        value={charRole}
                        onChange={(e) => setCharRole(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                      >
                        <option value="Protagonista">Protagonista</option>
                        <option value="Antagonista">Antagonista</option>
                        <option value="Mentor">Mentor(a)</option>
                        <option value="Aliado(a)">Aliado(a)</option>
                        <option value="Interesse Romântico">Interesse Romântico</option>
                        <option value="Secundário">Secundário</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                        Arquétipo
                      </label>
                      <input
                        type="text"
                        value={charArchetype}
                        onChange={(e) => setCharArchetype(e.target.value)}
                        placeholder="Ex: O Buscador / O Guardião"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-1">
                        Descrição & Motivação
                      </label>
                      <textarea
                        rows={2}
                        value={charDesc}
                        onChange={(e) => setCharDesc(e.target.value)}
                        placeholder="Quem é esse personagem? O que ele mais deseja e o que teme?"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#532380] outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingChar(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer hover:bg-[#faf7fd] dark:hover:bg-[#1c0e2e]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#532380] hover:bg-[#6c2ea6] shadow-xs active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40 flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Salvar Personagem</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {(!currentBook.characters || currentBook.characters.length === 0) && (
                    <div className="sm:col-span-3 text-center py-8 text-xs text-[#5c4672]/60 dark:text-[#c4b3d8]/60">
                      Nenhum personagem cadastrado ainda. Dê vida ao seu primeiro herói ou vilão!
                    </div>
                  )}

                  {currentBook.characters?.map((char) => (
                    <div
                      key={char.id}
                      className="p-4 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd]/60 dark:bg-[#1c0e2e]/60 hover:border-[#532380]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc]">{char.name}</span>
                          <span className="text-[10px] font-bold text-[#532380] dark:text-[#c4b3d8] bg-[#f4ecf8] dark:bg-[#26133a] px-2 py-0.5 rounded-md border border-[#ebdff2] dark:border-[#2d1b42]">
                            {char.role}
                          </span>
                        </div>
                        {char.archetype && (
                          <span className="text-[11px] text-[#b83280] dark:text-[#f472b6] font-semibold block mt-0.5">
                            {char.archetype}
                          </span>
                        )}
                        <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-2 leading-relaxed">
                          {char.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-[#ebdff2]/60 dark:border-[#2d1b42]/60 flex justify-end">
                        <button
                          onClick={() => handleDeleteCharacter(char.id)}
                          className="text-[#5c4672]/70 hover:text-[#b83280] dark:hover:text-[#f472b6] p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Chapters Outline */}
              <section className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf]">
                        <Layers className="w-5 h-5" />
                      </span>
                      <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                        Estrutura de Capítulos ({currentBook.chapters?.length || 0})
                      </h3>
                    </div>
                    <p className="text-xs text-[#5c4672]/80 dark:text-[#c4b3d8]/80 mt-1">
                      Trace o arco dos acontecimentos e acompanhe o status de cada cena.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingChapter(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#532380] hover:bg-[#6c2ea6] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>Adicionar Capítulo</span>
                  </button>
                </div>

                {isAddingChapter && (
                  <form
                    onSubmit={handleAddChapter}
                    className="my-5 p-5 rounded-2xl bg-[#e6f7f5]/60 dark:bg-[#0c2a27]/40 border border-[#bbf0eb] dark:border-[#14534f] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in"
                  >
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#0d4f49] dark:text-[#b4f0eb] mb-1">
                        Título do Capítulo *
                      </label>
                      <input
                        type="text"
                        required
                        value={chapTitle}
                        onChange={(e) => setChapTitle(e.target.value)}
                        placeholder="Ex: Capítulo 4: A Chave de Prata"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#bbf0eb] dark:border-[#14534f] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#147d74] outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0d4f49] dark:text-[#b4f0eb] mb-1">
                        Status
                      </label>
                      <select
                        value={chapStatus}
                        onChange={(e) =>
                          setChapStatus(e.target.value as 'planejado' | 'escrevendo' | 'concluido')
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-[#bbf0eb] dark:border-[#14534f] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#147d74] outline-hidden"
                      >
                        <option value="planejado">Planejado</option>
                        <option value="escrevendo">Escrevendo</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-[#0d4f49] dark:text-[#b4f0eb] mb-1">
                        Resumo do que acontece neste capítulo
                      </label>
                      <textarea
                        rows={2}
                        value={chapSummary}
                        onChange={(e) => setChapSummary(e.target.value)}
                        placeholder="Principais batidas dramáticas, revelações e clímax da cena..."
                        className="w-full text-xs p-2.5 rounded-xl border border-[#bbf0eb] dark:border-[#14534f] bg-white dark:bg-[#160b24] text-[#220d3a] dark:text-[#f7f2fc] focus:border-[#147d74] outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingChapter(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer hover:bg-[#faf7fd] dark:hover:bg-[#1c0e2e]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#532380] hover:bg-[#6c2ea6] shadow-xs active:scale-95 transition-all cursor-pointer border border-[#6c2ea6]/40 flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Salvar Capítulo</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3 mt-6">
                  {(!currentBook.chapters || currentBook.chapters.length === 0) && (
                    <div className="text-center py-8 text-xs text-[#5c4672]/60 dark:text-[#c4b3d8]/60">
                      Nenhum capítulo cadastrado ainda. Trace a jornada do seu livro!
                    </div>
                  )}

                  {currentBook.chapters?.map((chap, idx) => (
                    <div
                      key={chap.id}
                      className="p-4 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] hover:border-[#532380]/40 transition-all flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-xl bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#532380] dark:text-[#c4b3d8] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#ebdff2] dark:border-[#2d1b42] tabular-nums">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc]">
                              {chap.title}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                chap.status === 'concluido'
                                  ? 'bg-[#e6f7f5] dark:bg-[#0c2a27] text-[#147d74] dark:text-[#2dd4bf] border border-[#bbf0eb] dark:border-[#14534f]'
                                  : chap.status === 'escrevendo'
                                  ? 'bg-[#fae8f2] dark:bg-[#341628] text-[#b83280] dark:text-[#f472b6] border border-[#f5cbe2] dark:border-[#521c3c]'
                                  : 'bg-[#faf7fd] dark:bg-[#1c0e2e] text-[#532380] dark:text-[#c4b3d8] border border-[#ebdff2] dark:border-[#2d1b42]'
                              }`}
                            >
                              {chap.status}
                            </span>
                          </div>
                          {chap.summary && (
                            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1 leading-relaxed">
                              {chap.summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setImmersiveReadingItem({
                            title: chap.title,
                            content: chap.summary || 'Este capítulo não possui resumo cadastrado ainda.',
                            subtitle: `Capítulo ${idx + 1} · ${currentBook.title}`
                          })}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-[#6c2eb9] dark:text-[#a875ec] hover:bg-purple-100 dark:hover:bg-purple-950/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          title="Visualizar capítulo em modo de leitura limpo e focado"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#6c2eb9] dark:text-[#a875ec]" />
                          <span>Ler</span>
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chap.id)}
                          className="text-[#5c4672]/70 hover:text-[#b83280] dark:hover:text-[#f472b6] p-1.5 cursor-pointer rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Excluir capítulo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
                </div>
              )}
          </div>
        )}
      </BookResearchTool>

      {/* Galeria Centralizada de Imagens & Moodboards dos Livros */}
      <BookMoodboardGalleryModal
        isOpen={isImageGalleryOpen}
        onClose={() => setIsImageGalleryOpen(false)}
        books={books}
        projects={projects}
        onSelectBook={(bookId) => {
          setSelectedBookId(bookId);
          setActiveBookTab('architecture');
        }}
        onUpdateBook={onUpdateBook}
      />

      {/* MODAL: MODO DE LEITURA IMERSIVO (LIVRO & CAPÍTULOS) */}
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
