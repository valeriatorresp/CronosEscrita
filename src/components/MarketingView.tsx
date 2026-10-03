import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Calendar,
  Share2,
  Instagram,
  Facebook,
  Video,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Heart,
  ShieldCheck,
  Clock,
  Send,
  Globe,
  Tag,
  AlertCircle,
  X,
  Check,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  FileImage,
  Layers,
  HelpCircle,
  CalendarPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { MarketingPost, CustomDateItem, ConnectedSocialAccounts, Book } from '../types';
import { getTodayDateString } from '../services/storage';

interface MarketingViewProps {
  marketingPosts: MarketingPost[];
  customDates: CustomDateItem[];
  connectedAccounts: ConnectedSocialAccounts;
  books: Book[];
  googleToken?: string | null;
  onConnectGoogle?: () => void;
  onAddPost: (post: Omit<MarketingPost, 'id'>) => void;
  onUpdatePost: (post: MarketingPost) => void;
  onDeletePost: (postId: string) => void;
  onAddCustomDate: (item: Omit<CustomDateItem, 'id'>) => void;
  onDeleteCustomDate: (dateId: string) => void;
  onUpdateConnectedAccounts: (accounts: ConnectedSocialAccounts) => void;
  onOpenStoryModal?: () => void;
}

// Curated fixed important dates for literary authors (Holidays, Literary, Publishing Professions, Diversity & Human Rights)
const CURATED_IMPORTANT_DATES = [
  // Feriados Nacionais & Datas Cívicas
  { date: '2026-01-01', title: 'Confraternização Universal (Ano Novo)', category: 'feriado' },
  { date: '2026-04-21', title: 'Tiradentes (Inconfidência Mineira)', category: 'feriado' },
  { date: '2026-05-01', title: 'Dia Mundial do Trabalhador', category: 'feriado' },
  { date: '2026-09-07', title: 'Independência do Brasil', category: 'feriado' },
  { date: '2026-10-12', title: 'Nossa Senhora Aparecida (Padroeira do Brasil)', category: 'feriado' },
  { date: '2026-11-02', title: 'Finados', category: 'feriado' },
  { date: '2026-11-15', title: 'Proclamação da República', category: 'feriado' },
  { date: '2026-12-25', title: 'Natal', category: 'feriado' },

  // Marcos Históricos & Celebrações da Literatura
  { date: '2026-01-07', title: 'Dia do Leitor', category: 'literaria' },
  { date: '2026-03-14', title: 'Dia Nacional da Poesia (Castro Alves)', category: 'literaria' },
  { date: '2026-04-09', title: 'Dia Nacional da Biblioteca', category: 'literaria' },
  { date: '2026-04-18', title: 'Dia Nacional do Livro Infantil (Monteiro Lobato)', category: 'literaria' },
  { date: '2026-04-23', title: 'Dia Mundial do Livro e do Direito Autoral (UNESCO)', category: 'literaria' },
  { date: '2026-05-25', title: 'Dia do Orgulho Nerd & Dia da Toalha (Cultura Geek)', category: 'literaria' },
  { date: '2026-06-21', title: 'Aniversário de Machado de Assis & Dia da Mídia Literária', category: 'literaria' },
  { date: '2026-07-25', title: 'Dia Nacional do Escritor', category: 'literaria' },
  { date: '2026-10-20', title: 'Dia do Poeta', category: 'literaria' },
  { date: '2026-10-29', title: 'Dia Nacional do Livro', category: 'literaria' },
  { date: '2026-11-23', title: 'Dia do Quadrinho Nacional', category: 'literaria' },

  // Profissões do Ecossistema Editorial & Criativo
  { date: '2026-02-07', title: 'Dia do Tipógrafo & Diagramador Editorial', category: 'profissao' },
  { date: '2026-03-12', title: 'Dia do Bibliotecário', category: 'profissao' },
  { date: '2026-03-28', title: 'Dia do Revisor de Texto Editorial', category: 'profissao' },
  { date: '2026-04-07', title: 'Dia do Jornalista', category: 'profissao' },
  { date: '2026-05-18', title: 'Dia do Editor de Livros', category: 'profissao' },
  { date: '2026-09-30', title: 'Dia Internacional do Tradutor', category: 'profissao' },
  { date: '2026-10-15', title: 'Dia do Professor & Educador', category: 'profissao' },
  { date: '2026-10-18', title: 'Dia do Ilustrador', category: 'profissao' },
  { date: '2026-11-05', title: 'Dia do Designer Gráfico & Capista', category: 'profissao' },

  // Diversidade, Direitos Humanos, Combate ao Racismo, à Misoginia & Orgulho LGBT+
  { date: '2026-01-29', title: 'Dia Nacional da Visibilidade Trans', category: 'diversidade' },
  { date: '2026-03-08', title: 'Dia Internacional da Mulher & Combate à Misoginia', category: 'diversidade' },
  { date: '2026-03-21', title: 'Dia Internacional de Luta pela Eliminação da Discriminação Racial', category: 'diversidade' },
  { date: '2026-04-19', title: 'Dia Nacional de Combate à Xenofobia', category: 'diversidade' },
  { date: '2026-05-17', title: 'Dia Internacional de Luta contra a LGBTfobia', category: 'diversidade' },
  { date: '2026-06-28', title: 'Dia Internacional do Orgulho LGBT+', category: 'diversidade' },
  { date: '2026-07-25', title: 'Dia Internacional da Mulher Negra Latino-Americana e Caribenha', category: 'diversidade' },
  { date: '2026-08-29', title: 'Dia Nacional da Visibilidade Lésbica', category: 'diversidade' },
  { date: '2026-09-23', title: 'Dia da Visibilidade Bissexual', category: 'diversidade' },
  { date: '2026-11-20', title: 'Dia Nacional de Zumbi e da Consciência Negra (Combate ao Racismo)', category: 'diversidade' },
  { date: '2026-11-25', title: 'Dia Internacional de Combate à Violência contra a Mulher', category: 'diversidade' },
];

const BOOKTOK_TEMPLATES = [
  {
    type: 'reel' as const,
    badge: 'Roteiro de Vídeo Curto / TikTok',
    badgeColor: 'bg-[#b83280]/20 text-[#b83280] dark:text-[#f472b6]',
    title: '🎬 Tropes, Personagens & Estética do Livro',
    plainText: 'Se você ama o trope X, prepare-se porque este parágrafo vai te destruir...\n\nMostre pequenas imagens estéticas (uma xícara de café, uma espada, chuva na janela, etc.) e resuma o conflito principal do casal ou protagonista.\n\nChamada para Ação (CTA): Adicione meu novo livro à sua wishlist no Kindle! Link oficial de pré-venda na bio do perfil.',
    content: 'Se você ama o trope X, prepare-se porque este parágrafo vai te destruir...\n\nMostre pequenas imagens estéticas (uma xícara de café, uma espada, chuva na janela, etc.) e resuma o conflito principal do casal ou protagonista.\n\nChamada para Ação (CTA): Adicione meu novo livro à sua wishlist no Kindle! Link oficial de pré-venda na bio do perfil.'
  },
  {
    type: 'post' as const,
    badge: 'Post Estático / Carrossel no Instagram',
    badgeColor: 'bg-[#147d74]/20 text-[#147d74] dark:text-[#2dd4bf]',
    title: '📸 Bastidores Vulneráveis & Rotina do Escritor',
    plainText: 'Slide 1 (Capa): Uma captura de tela elegante de um trecho da história em um aplicativo de escrita ou bloco de notas, com a frase: "Escrevi isso às 3h da manhã e ainda estou chorando...".\n\nSlides seguintes (Bastidores): Mostre fotos reais da sua mesa, sua xícara, ou as anotações manuscritas dos personagens da bíblia de escrita do seu livro.\n\nLegenda: Compartilhe o quão complexo e recompensador é colocar mundos de fantasia e emoções reais em parágrafos. Peça para outros escritores nos comentários deixarem suas maiores metas e dores da semana.',
    content: 'Slide 1 (Capa): Uma captura de tela elegante de um trecho da história em um aplicativo de escrita ou bloco de notas, com a frase: "Escrevi isso às 3h da manhã e ainda estou chorando...".\n\nSlides seguintes (Bastidores): Mostre fotos reais da sua mesa, sua xícara, ou as anotações manuscritas dos personagens da bíblia de escrita do seu livro.\n\nLegenda: Compartilhe o quão complexo e recompensador é colocar mundos de fantasia e emoções reais em parágrafos. Peça para outros escritores nos comentários deixarem suas maiores metas e dores da semana.'
  },
  {
    type: 'reel' as const,
    badge: 'POV / Roteiro Dinâmico',
    badgeColor: 'bg-[#b83280]/20 text-[#b83280] dark:text-[#f472b6]',
    title: '🎭 POV: Você é o vilão e se apaixonou pelo herói',
    plainText: 'Olhar fixo para a câmera com um sorriso irônico e o texto na tela: "Eu deveria te eliminar, não te proteger."\n\nDublagem de áudio em alta enquanto mostra trechos selecionados do livro onde o vilão hesita em atacar o herói. Use uma iluminação dramática ou sombras.\n\nChamada para Ação (CTA): Disponível no link da bio! Comente qual é o seu trope favorito.',
    content: 'Olhar fixo para a câmera com um sorriso irônico e o texto na tela: "Eu deveria te eliminar, não te proteger."\n\nDublagem de áudio em alta enquanto mostra trechos selecionados do livro onde o vilão hesita em atacar o herói. Use uma iluminação dramática ou sombras.\n\nChamada para Ação (CTA): Disponível no link da bio! Comente qual é o seu trope favorito.'
  },
  {
    type: 'story' as const,
    badge: 'Story Interativo',
    badgeColor: 'bg-[#147d74]/20 text-[#147d74] dark:text-[#2dd4bf]',
    title: '🗳️ Quiz de Sobrevivência no Universo do Livro',
    plainText: 'Design do Story: Fundo com imagem estética medieval/suspense e caixa de enquete interativa.\n\nPergunta: "Se você fosse enviado para o Reino de [Reino], qual dessas habilidades escolheria para sobreviver?"\n\nOpções: A) Diplomacia afiada, B) Magia proibida, C) Espadachim implacável, D) Roubo furtivo.\n\nPróximo Story: Revelação de como o seu protagonista lidaria com isso e link direto para ler o primeiro capítulo gratuito.',
    content: 'Design do Story: Fundo com imagem estética medieval/suspense e caixa de enquete interativa.\n\nPergunta: "Se você fosse enviado para o Reino de [Reino], qual dessas habilidades escolheria para sobreviver?"\n\nOpções: A) Diplomacia afiada, B) Magia proibida, C) Espadachim implacável, D) Roubo furtivo.\n\nPróximo Story: Revelação de como o seu protagonista lidaria com isso e link direto para ler o primeiro capítulo gratuito.'
  },
  {
    type: 'reel' as const,
    badge: 'React Literário / Reels',
    badgeColor: 'bg-[#b83280]/20 text-[#b83280] dark:text-[#f472b6]',
    title: '🥺 O parágrafo que fez meus leitores beta surtarem',
    plainText: 'Mostre sua reação fingindo chorar ou em choque completo, com o texto: "Eles nunca vão me perdoar por escrever essa página..."\n\nMostre o trecho borrado do manuscrito ou leia em voz alta apenas a frase crucial que muda o rumo da história de amor ou do mistério.\n\nChamada para Ação (CTA): Adicione [Título do Livro] à sua lista de leitura! O link está disponível no meu perfil.',
    content: 'Mostre sua reação fingindo chorar ou em choque completo, com o texto: "Eles nunca vão me perdoar por escrever essa página..."\n\nMostre o trecho borrado do manuscrito ou leia em voz alta apenas a frase crucial que muda o rumo da história de amor ou do mistério.\n\nChamada para Ação (CTA): Adicione [Título do Livro] à sua lista de leitura! O link está disponível no meu perfil.'
  },
  {
    type: 'carousel' as const,
    badge: 'Carrossel Estético',
    badgeColor: 'bg-[#147d74]/20 text-[#147d74] dark:text-[#2dd4bf]',
    title: '🕯️ Se os personagens tivessem playlists no Spotify',
    plainText: 'Slide 1: Arte elegante com o título: "Se [Personagem] tivesse um celular, estas seriam as 5 músicas mais tocadas dele."\n\nSlides seguintes: Capas de álbuns ou trechos de letras de músicas que combinam perfeitamente com a personalidade sombria ou alegre do personagem.\n\nLegenda: "Qual música você acha que é a cara do [Personagem]? Ouça a playlist oficial do livro no link da bio!"',
    content: 'Slide 1: Arte elegante com o título: "Se [Personagem] tivesse um celular, estas seriam as 5 músicas mais tocadas dele."\n\nSlides seguintes: Capas de álbuns ou trechos de letras de músicas que combinam perfeitamente com a personalidade sombria ou alegre do personagem.\n\nLegenda: "Qual música você acha que é a cara do [Personagem]? Ouça a playlist oficial do livro no link da bio!"'
  },
  {
    type: 'reel' as const,
    badge: 'Unboxing Estético / TikTok',
    badgeColor: 'bg-[#b83280]/20 text-[#b83280] dark:text-[#f472b6]',
    title: '📦 Desembalando o primeiro exemplar físico',
    plainText: 'Mostre a caixa fechada do correio com som de batimentos cardíacos acelerados. "Depois de 2 anos escrevendo, finalmente chegou..."\n\nAbra a caixa devagar, mostre o brilho da capa, folheie as páginas com cuidado e mostre os detalhes da diagramação interna.\n\nChamada para Ação (CTA): Garanta seu exemplar autografado no link do perfil!',
    content: 'Mostre a caixa fechada do correio com som de batimentos cardíacos acelerados. "Depois de 2 anos escrevendo, finalmente chegou..."\n\nAbra a caixa devagar, mostre o brilho da capa, folheie as páginas com cuidado e mostre os detalhes da diagramação interna.\n\nChamada para Ação (CTA): Garanta seu exemplar autografado no link do perfil!'
  },
  {
    type: 'post' as const,
    badge: 'Post Estático / Feed',
    badgeColor: 'bg-[#147d74]/20 text-[#147d74] dark:text-[#2dd4bf]',
    title: '🔍 5 Curiosidades secretas sobre a criação do livro',
    plainText: 'Texto da Imagem: "5 coisas que mudei na história na hora de publicar."\n\nPontos: 1) O vilão era para ser o melhor amigo; 2) O final original era trágico; 3) Escrevi a cena do baile ouvindo música clássica de terror; 4) O cenário é inspirado em uma cidade real que visitei; 5) Um dos personagens secundários foi criado de última hora.\n\nLegenda: Desenvolva uma dessas curiosidades e pergunte aos leitores qual delas mais os surpreendeu.',
    content: 'Texto da Imagem: "5 coisas que mudei na história na hora de publicar."\n\nPontos: 1) O vilão era para ser o melhor amigo; 2) O final original era trágico; 3) Escrevi a cena do baile ouvindo música clássica de terror; 4) O cenário é inspirado em uma cidade real que visitei; 5) Um dos personagens secundários foi criado de última hora.\n\nLegenda: Desenvolva uma dessas curiosidades e pergunte aos leitores qual delas mais os surpreendeu.'
  }
];

export const MarketingView: React.FC<MarketingViewProps> = ({
  marketingPosts,
  customDates,
  connectedAccounts,
  books,
  googleToken,
  onConnectGoogle,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  onAddCustomDate,
  onDeleteCustomDate,
  onUpdateConnectedAccounts,
  onOpenStoryModal,
}) => {
  // Calendar states
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    currentDate
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayKey(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayKey(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayKey(null);
  };

  const todayStr = getTodayDateString();

  // Group marketing posts by YYYY-MM-DD
  const postsByDate: Record<string, MarketingPost[]> = {};
  marketingPosts.forEach((post) => {
    if (!postsByDate[post.date]) {
      postsByDate[post.date] = [];
    }
    postsByDate[post.date].push(post);
  });

  // Group custom dates by YYYY-MM-DD
  const customDatesByDate: Record<string, CustomDateItem[]> = {};
  customDates.forEach((d) => {
    if (!customDatesByDate[d.date]) {
      customDatesByDate[d.date] = [];
    }
    customDatesByDate[d.date].push(d);
  });

  // Curated dates matched by current year and MM-DD
  const curatedDatesByDate: Record<string, typeof CURATED_IMPORTANT_DATES> = {};
  CURATED_IMPORTANT_DATES.forEach((d) => {
    const MM_DD = d.date.substring(5); // "MM-DD"
    const matchedDateKey = `${year}-${MM_DD}`;
    if (!curatedDatesByDate[matchedDateKey]) {
      curatedDatesByDate[matchedDateKey] = [];
    }
    curatedDatesByDate[matchedDateKey].push(d);
  });

  // Google Calendar Sync States
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const handleSyncGoogleCalendar = async () => {
    if (!googleToken) {
      onConnectGoogle?.();
      return;
    }
    setIsSyncingCalendar(true);
    setSyncSuccessMsg(null);
    try {
      let count = 0;
      for (const post of marketingPosts) {
        const startTime = new Date(`${post.date}T${post.time || '18:00'}:00`);
        const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);
        const eventPayload = {
          summary: `🚀 [Marketing] ${post.title} (${post.mediaType === 'carousel' ? 'CARROSSEL' : post.mediaType.toUpperCase()})`,
          description: `Post agendado via CronosEscrita.\nPlataformas: ${post.platforms.join(', ')}\nLegenda: ${post.content}`,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          colorId: '2',
        };
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventPayload),
        });
        if (res.ok) count++;
      }

      for (const d of customDates) {
        const eventPayload = {
          summary: `📌 [Marco] ${d.title} (${d.category})`,
          description: `Data importante cadastrada no CronosEscrita.`,
          start: { date: d.date },
          end: { date: d.date },
          colorId: '5',
        };
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventPayload),
        });
        if (res.ok) count++;
      }

      triggerConfetti();
      setSyncSuccessMsg(`🎉 Sincronização realizada com sucesso! ${count} eventos adicionados ao seu Google Calendar.`);
      setTimeout(() => setSyncSuccessMsg(null), 7000);
    } catch (err: any) {
      alert('Erro ao sincronizar com Google Calendar: ' + (err.message || err));
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // State for adding custom date via Modal
  const [showDateModal, setShowDateModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDateVal, setCustomDateVal] = useState(getTodayDateString());
  const [customCategory, setCustomCategory] = useState<'lancamento' | 'literaria' | 'diversidade' | 'outro'>('lancamento');

  // Social account linking modals
  const [connectingPlatform, setConnectingPlatform] = useState<'instagram' | 'facebook' | 'tiktok' | null>(null);
  const [connectUsernameInput, setConnectUsernameInput] = useState('');

  // PUBLISHING PANEL STATES
  const [pubTitle, setPubTitle] = useState('');
  const [pubContent, setPubContent] = useState('');
  const [pubPlatforms, setPubPlatforms] = useState<Record<'instagram' | 'facebook' | 'tiktok', boolean>>({
    instagram: false,
    facebook: false,
    tiktok: false,
  });
  const [pubMediaType, setPubMediaType] = useState<'reel' | 'carousel' | 'story' | 'video' | 'post'>('reel');
  const [pubDate, setPubDate] = useState(getTodayDateString());
  const [pubTime, setPubTime] = useState('18:00');
  const [pubSelectedBookId, setPubSelectedBookId] = useState<string>('');
  const [pubCustomImageUrl, setPubCustomImageUrl] = useState('');
  const [pubFileMockName, setPubFileMockName] = useState('');
  const [syncWithGoogleCal, setSyncWithGoogleCal] = useState(true);

  // Simulation/Log terminal states
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [publishingLog, setPublishingLog] = useState<string[]>([]);
  const [publishingSuccess, setPublishingSuccess] = useState(false);

  // Phone Mockup Preview Settings
  const [previewSocialMode, setPreviewSocialMode] = useState<'instagram' | 'tiktok'>('instagram');

  // BRAND ASSETS WATERMARK STATES
  const [brandAssetUrl, setBrandAssetUrl] = useState<string>(() => {
    return localStorage.getItem('cronos_brand_asset_url') || '';
  });
  const [brandAssetName, setBrandAssetName] = useState<string>(() => {
    return localStorage.getItem('cronos_brand_asset_name') || '';
  });

  // BOOKTOK TEMPLATES ROTATION STATES
  const [templateIndices, setTemplateIndices] = useState<number[]>([0, 1]);

  // MARKETING REMINDER SETTINGS STATES
  const [mReminderEnabled, setMReminderEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cronos_marketing_reminder_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.enabled !== false; // Default to true if not set
      }
    } catch {}
    return true;
  });

  const [mReminderTime, setMReminderTime] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cronos_marketing_reminder_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.time || '10:00';
      }
    } catch {}
    return '10:00';
  });

  const handleSaveMarketingReminderSettings = () => {
    try {
      const payload = { enabled: mReminderEnabled, time: mReminderTime };
      localStorage.setItem('cronos_marketing_reminder_settings', JSON.stringify(payload));
      triggerConfetti();
      alert(`🔔 Configurações salvas com sucesso! Lembrete diário: ${mReminderEnabled ? 'ATIVADO' : 'DESATIVADO'} às ${mReminderTime}.`);
    } catch (e) {
      alert('Erro ao salvar configurações.');
    }
  };

  // LITERARY CHATBOT STATES
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: 'model',
      text: 'Olá, autor(a)! Eu sou a sua assessora de marketing editorial e comunicação literária do CronosEscrita.\n\nNo nosso escopo gratuito incluso, você conta com:\n• Ganchos magnéticos (hooks) para abrir seus posts;\n• Roteiros dinâmicos para BookTok e Reels;\n• Legendas envolventes e hashtags estratégicas;\n• Ideias de campanhas de lançamento na Amazon Kindle e pré-vendas.\n\nComo posso ajudar a divulgar o seu livro hoje?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Helper to generate the 30-day suggested editorial calendar with distinct, rich ideas
  const generateSuggestedCalendar = (booksList: Book[], randomize = false) => {
    const hasBooks = booksList.length > 0;
    const book = booksList[0];
    const char = book?.characters?.[0]?.name || 'seu protagonista';
    const genre = book?.genre || 'ficção';
    const setting = book?.setting || 'cenário principal';
    const targetWords = book?.targetWords || 50000;

    const bookPool = [
      { type: 'reel' as const, title: `Apresentação de Personagem`, subject: `Apresente ${char}, protagonista de "${book?.title}". Use referências visuais que reflitam o conflito e o charme do personagem.` },
      { type: 'post' as const, title: `Premissa em 3 Palavras`, subject: `Explique a premissa de "${book?.title}" em apenas 3 palavras impactantes e provoque a curiosidade dos leitores.` },
      { type: 'carousel' as const, title: `Citação de Impacto`, subject: `Escolha um diálogo marcante ou frase emocionante de "${book?.title}" e coloque num carrossel com estética cuidadosa.` },
      { type: 'story' as const, title: `Bastidores de Rascunho`, subject: `Mostre uma captura do seu progresso em "${book?.title}" no CronosEscrita e pergunte aos leitores se estão ansiosos.` },
      { type: 'video' as const, title: `Tropes Literários Favoritos`, subject: `Fale sobre os tropes principais do gênero "${genre}" presentes em "${book?.title}" (ex: slow burn, redenção, rivais que viram aliados).` },
      { type: 'post' as const, title: `Dilema Criativo do Autor`, subject: `Conte sobre uma decisão difícil de escrita em "${book?.title}" (ex: um segredo revelado que mudou o rumo da história).` },
      { type: 'story' as const, title: `Trilha Sonora Oficial`, subject: `Compartilhe 3 músicas que você ouve enquanto escreve cenas marcantes dos personagens de "${book?.title}".` },
      { type: 'carousel' as const, title: `Estética do Cenário`, subject: `Apresente o cenário de "${book?.title}" (${setting}) com detalhes visuais, aromas e atmosfera sensorial.` },
      { type: 'reel' as const, title: `Rotina de Metas e Foco`, subject: `Fale sobre como a rotina diária no CronosEscrita te ajuda a avançar rumo à meta de ${targetWords} palavras.` },
      { type: 'post' as const, title: `Conselho Literário de ${genre}`, subject: `Escreva um conselho sincero para leitores e aspirantes a autor que amam narrativas do gênero "${genre}".` },
      { type: 'carousel' as const, title: `POV do Antagonista`, subject: `Mergulhe na mente do antagonista de "${book?.title}": por que ele acredita piamente que está tomando a decisão certa?` },
      { type: 'post' as const, title: `Trecho Inédito & Gancho`, subject: `Publique um parágrafo exclusivo que termine em suspense e peça para os leitores deixarem seus palpites nos comentários.` },
      { type: 'story' as const, title: `Enquete de Dilema Moral`, subject: `Faça uma pergunta sobre uma escolha ética difícil que ${char} precisará tomar durante a narrativa.` },
      { type: 'reel' as const, title: `Antes e Depois da Revisão`, subject: `Mostre a versão crua do primeiro rascunho lado a lado com a versão editada e lapidada.` },
      { type: 'carousel' as const, title: `O Objeto Simbólico`, subject: `Apresente uma relíquia, item ou símbolo crucial para o enredo de "${book?.title}" e seu significado oculto.` },
      { type: 'post' as const, title: `Curiosidade de Pesquisa`, subject: `Revele um fato curioso ou histórico que você teve que pesquisar a fundo para dar verossimilhança à história.` },
      { type: 'story' as const, title: `Caixinha de Perguntas`, subject: `Abra uma caixinha no Instagram: "Pergunte qualquer coisa sobre os personagens ou o universo de ${book?.title}".` },
      { type: 'reel' as const, title: `Fancast dos Sonhos`, subject: `Quais atores ou celebridades você escalaria para interpretar os papéis principais se o livro virasse filme?` },
      { type: 'carousel' as const, title: `Paleta de Cores & Vibe`, subject: `Monte uma paleta de cores conceituais que traduzem a energia emocional do livro (sombrio, solar, místico).` },
      { type: 'post' as const, title: `Por que esse Título?`, subject: `Conte a história real de como você escolheu o título "${book?.title}" e quais outras opções foram descartadas.` },
      { type: 'video' as const, title: `A Teoria Mais Louca`, subject: `Comente com bom humor uma teoria divertida ou inusitada que um leitor beta ou amigo levantou sobre o final.` },
      { type: 'story' as const, title: `Manias de Escrita`, subject: `Mostre a sua bebida favorita, café ou chá que acompanha suas sessões de escrita diária no CronosEscrita.` },
      { type: 'carousel' as const, title: `Quiz de Personalidade`, subject: `Monte um carrossel estilo teste: "Qual personagem de ${book?.title} você seria com base nas suas escolhas?".` },
      { type: 'post' as const, title: `O Maior Medo de ${char}`, subject: `Discuta a fraqueza humana ou a ferida do passado que o protagonista mais tenta esconder do mundo.` },
      { type: 'reel' as const, title: `Desafio dos 10 Segundos`, subject: `Tente resumir o conflito principal do seu livro em apenas 10 segundos sem falar nomes próprios!` },
      { type: 'story' as const, title: `Alerta de Spoilers sem Contexto`, subject: `Compartilhe 3 frases soltas e enigmáticas da história que só farão sentido completo para quem ler o livro.` },
      { type: 'carousel' as const, title: `Inspirações Literárias`, subject: `Indique 3 livros, filmes ou obras de arte que serviram de faísca para você querer criar "${book?.title}".` },
      { type: 'post' as const, title: `Carta Aberta aos Leitores`, subject: `Um agradecimento sincero a todo mundo que apoia seu sonho e acompanha o nascimento das suas páginas.` },
      { type: 'story' as const, title: `Contagem Regressiva`, subject: `Crie um adesivo de contagem regressiva para a próxima meta, revelação de capítulo ou lançamento oficial.` },
      { type: 'carousel' as const, title: `Manifesto da Obra`, subject: `Uma mensagem poderosa sobre a grande verdade temática que você deseja transmitir ao leitor com "${book?.title}".` },
    ];

    const generalPool = [
      { type: 'post' as const, title: `Apresentação de Autor`, subject: `Compartilhe uma foto sua em seu cantinho de escrita e conte sua trajetória e sua paixão pela literatura.` },
      { type: 'story' as const, title: `Bastidores do Dia`, subject: `Mostre sua xícara de café ou chá, sua meta de palavras no CronosEscrita e desafie outros autores a escreverem.` },
      { type: 'carousel' as const, title: `Citação de Inspiração`, subject: `Selecione uma frase marcante de um autor clássico ou contemporâneo que inspira seu estilo e comente.` },
      { type: 'story' as const, title: `Enquete de Engajamento`, subject: `Faça uma pergunta literária divertida para engajar (ex: prefere livros físicos, e-books ou áudio-livros?).` },
      { type: 'reel' as const, title: `Seu Cantinho de Leitura`, subject: `Mostre a estante, poltrona ou local favorito onde você costuma sentar para devorar novas histórias.` },
      { type: 'post' as const, title: `Dica de Leitura Semanal`, subject: `Recomende um livro nacional ou independente que você amou ler recentemente, valorizando a comunidade.` },
      { type: 'carousel' as const, title: `Playlist do Escritor`, subject: `Marque 3 músicas instrumentais que ativam seu foco criativo na hora de produzir novos parágrafos.` },
      { type: 'story' as const, title: `Vulnerabilidade na Escrita`, subject: `Fale de forma leve sobre bloqueio criativo e como você faz para recuperar o foco e a motivação.` },
      { type: 'reel' as const, title: `Humor: Manias de Escritor`, subject: `Grave de forma descontraída as manias clássicas de quem escreve (falar sozinho, pesquisar venenos medievais no Google).` },
      { type: 'post' as const, title: `Seu Grande Sonho Literário`, subject: `Escreva sobre onde você quer ver suas obras publicadas no futuro (livrarias físicas, adaptação cinematográfica, etc).` },
      { type: 'carousel' as const, title: `Top 3 Tropes Favoritos`, subject: `Conte quais são os seus clichês literários preferidos (enemies to lovers, found family, mistério de quarto fechado).` },
      { type: 'story' as const, title: `Caixa de Perguntas de Escrita`, subject: `Abra uma caixinha: "Qual a sua maior dúvida sobre como criar personagens ou publicar livros?".` },
      { type: 'reel' as const, title: `Organização de Ideias`, subject: `Mostre como você organiza notas, moodboards e fichas de personagens no CronosEscrita.` },
      { type: 'post' as const, title: `O Poder da Constância`, subject: `Compartilhe uma reflexão sobre como escrever um pouquinho todos os dias transforma um sonho em livro pronto.` },
      { type: 'carousel' as const, title: `Livros que me Fizeram Chorar`, subject: `Recomende 3 obras que deixaram seu coração apertado e discuta o poder da emoção nas histórias.` },
      { type: 'story' as const, title: `Café com Escrita`, subject: `Poste um story dando bom dia e convidando outros escritores para um sprint de foco matinal.` },
      { type: 'reel' as const, title: `Expectativa vs. Realidade`, subject: `Grave um vídeo divertido mostrando a expectativa de escrever em um castelo vs. a realidade de digitar de pijama.` },
      { type: 'post' as const, title: `O Primeiro Livro que Li`, subject: `Conte qual foi a história que acendeu a sua paixão pela literatura na infância ou adolescência.` },
      { type: 'carousel' as const, title: `Dicas para Evitar Procrastinação`, subject: `Compartilhe 3 técnicas práticas que você usa para sentar e escrever mesmo nos dias sem inspiração.` },
      { type: 'story' as const, title: `Enquete de Capas`, subject: `Mostre duas capas ou estilos visuais e pergunte aos seguidores qual chama mais a atenção deles na estante.` },
      { type: 'post' as const, title: `Como Construir Diálogos Vivos`, subject: `Dê uma dica sobre ler os diálogos em voz alta para garantir naturalidade e ritmo às conversas dos personagens.` },
      { type: 'carousel' as const, title: `Frases que Mudaram Minha Vida`, subject: `Três ensinamentos de grandes mestres da literatura sobre disciplina e arte.` },
      { type: 'reel' as const, title: `A Descoberta de uma Ideia Nova`, subject: `Mostre a reação de quando uma ideia brilhante surge no banho ou antes de dormir e você corre para anotar.` },
      { type: 'story' as const, title: `Pergunta do Dia`, subject: `Você prefere finais felizes com laço perfeito ou finais agridoces com reflexão duradoura?` },
      { type: 'post' as const, title: `Apoie a Literatura Nacional`, subject: `Um manifesto sobre a riqueza e a diversidade da produção literária contemporânea brasileira.` },
      { type: 'carousel' as const, title: `Anatomia de uma Cena de Suspense`, subject: `Mostre como o uso de frases curtas e descrições sensoriais acelera o pulso do leitor.` },
      { type: 'story' as const, title: `Meta do Mês Alcançada`, subject: `Compartilhe suas estatísticas de palavras do CronosEscrita com uma mensagem motivacional.` },
      { type: 'reel' as const, title: `Coisas que Leitores Fazem`, subject: `Cheirar páginas de livro novo, comprar edições repetidas por causa da capa e acumular leituras na mesa.` },
      { type: 'post' as const, title: `Por que Escrevo?`, subject: `Uma declaração apaixonada sobre a necessidade vital de contar histórias e tocar corações humanos.` },
      { type: 'carousel' as const, title: `Planejamento do Próximo Ciclo`, subject: `Apresente seus objetivos para o próximo mês de escrita e convide os leitores a acompanharem de perto.` },
    ];

    const extraAngles = [
      { type: 'reel' as const, title: `O Dilema de um Plot Twist`, subject: `Como foi a sensação de planejar aquela reviravolta que ninguém esperava? Fale sobre pistas sutis deixadas no manuscrito.` },
      { type: 'carousel' as const, title: `Se Esta História Fosse um Filme`, subject: `Indique a trilha sonora épica, diretor ideal e a paleta cinematográfica perfeita para a adaptação da sua obra.` },
      { type: 'story' as const, title: `Termômetro de Ansiedade`, subject: `Coloque uma barra de emoji para os leitores votarem no quanto estão ansiosos pelo próximo capítulo ou revelação de capa.` },
      { type: 'post' as const, title: `A Lição Mais Difícil que Aprendi`, subject: `Compartilhe com honestidade sobre os desafios de lapidar um manuscrito e como a disciplina diária supera o bloqueio criativo.` },
      { type: 'video' as const, title: `Respondendo a Comentários Reais`, subject: `Selecione perguntas que leitores mandaram no direct ou nos comentários e responda com carinho e entusiasmo.` },
      { type: 'carousel' as const, title: `Ficha Secreta do Protagonista`, subject: `Revele 3 segredos que não estão explícitos no livro: comidas favoritas, medos de infância e o maior defeito do personagem.` },
      { type: 'story' as const, title: `Quiz: Qual Personagem Você Seria?`, subject: `Crie uma enquete de 3 perguntas rápidas de personalidade para seus seguidores descobrirem com quem se parecem.` },
      { type: 'reel' as const, title: `Aquele Momento em que a Escrita Flui`, subject: `Grave a sua expressão de alívio e empolgação quando você bate a meta de palavras da sessão no CronosEscrita!` },
      { type: 'post' as const, title: `Dedicatória Especial`, subject: `A quem esta história é dedicada no seu coração? Compartilhe o sentimento por trás do seu livro.` },
      { type: 'carousel' as const, title: `Glossário do Universo Criado`, subject: `Explique 3 termos, lendas ou costumes únicos do mundo fictício que você construiu.` },
    ];

    const sourcePool = hasBooks ? bookPool : generalPool;
    const combinedPool = randomize ? [...sourcePool, ...extraAngles].sort(() => Math.random() - 0.5) : sourcePool;

    return Array.from({ length: 30 }).map((_, idx) => {
      const day = idx + 1;
      const item = combinedPool[idx % combinedPool.length];
      return {
        day,
        type: item.type,
        title: item.title,
        subject: item.subject,
      };
    });
  };

  const [suggestedCalendar, setSuggestedCalendar] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cronos_editable_suggested_calendar');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return generateSuggestedCalendar(books);
  });

  const [suggestionFeedback, setSuggestionFeedback] = useState<string | null>(null);
  const [activeSuggestedGroup, setActiveSuggestedGroup] = useState<'1-10' | '11-20' | '21-30'>('1-10');
  const [editingCard, setEditingCard] = useState<{
    day: number;
    type: 'reel' | 'post' | 'carousel' | 'story' | 'video' | 'post';
    title: string;
    subject: string;
  } | null>(null);

  // Save changes to localStorage
  const saveSuggestedCalendar = (newCal: any[]) => {
    setSuggestedCalendar(newCal);
    try {
      localStorage.setItem('cronos_editable_suggested_calendar', JSON.stringify(newCal));
    } catch (e) {
      console.error(e);
    }
  };

  // Regenerate suggestions: generates fresh, randomized ideas without firing confetti!
  const handleRegenerateSuggestedCalendar = () => {
    const fresh = generateSuggestedCalendar(books, true);
    saveSuggestedCalendar(fresh);
    setSuggestionFeedback('✨ 30 novas sugestões inteligentes criadas para o seu cronograma editorial!');
    setTimeout(() => setSuggestionFeedback(null), 4000);
  };

  // Add suggestion directly to the monthly editorial calendar
  const handleDirectAddToCalendar = (item: any) => {
    const targetDay = Math.min(Math.max(1, item.day), 28);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
    onAddPost({
      title: item.title,
      content: item.subject,
      platforms: ['instagram', 'tiktok'],
      mediaType: item.type,
      date: dateStr,
      time: '18:00',
      status: 'scheduled',
    });
    setSuggestionFeedback(`📅 Post "Dia ${item.day} - ${item.title}" agendado no Calendário Editorial (${dateStr.split('-').reverse().join('/')})!`);
    setTimeout(() => setSuggestionFeedback(null), 4500);
  };

  // Re-generate suggestions if books list changes and not customized
  useEffect(() => {
    const saved = localStorage.getItem('cronos_editable_suggested_calendar');
    if (!saved) {
      setSuggestedCalendar(generateSuggestedCalendar(books));
    }
  }, [books]);

  // Trigger escape key listeners for modals and publishing terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDateModal(false);
        setConnectingPlatform(null);
        setEditingCard(null);
        if (isPublishingNow) setIsPublishingNow(false);
        setPublishingSuccess(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPublishingNow]);

  const handleSaveCardEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    const updated = suggestedCalendar.map((item) =>
      item.day === editingCard.day ? { ...item, ...editingCard } : item
    );
    saveSuggestedCalendar(updated);
    setEditingCard(null);
    triggerConfetti();
  };

  const handleApplySuggestionToForm = (item: any) => {
    setPubTitle(item.title);
    setPubContent(`💡 Ideia para ${item.title}:\n\n${item.subject}`);
    setPubMediaType(item.type);
    
    // Smooth scroll to publication section
    const el = document.getElementById('social-networks-section');
    el?.scrollIntoView({ behavior: 'smooth' });
    triggerConfetti();
  };

  const handleUseGeneratedImageInPublisher = (imgUrl: string) => {
    setPubCustomImageUrl(imgUrl);
    setPubSelectedBookId(''); // Clear book cover selection
    setPubFileMockName(''); // Clear manual files
    const el = document.getElementById('social-networks-section');
    el?.scrollIntoView({ behavior: 'smooth' });
    triggerConfetti();
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6c2eb9', '#b83280', '#147d74', '#2dd4bf', '#fbbf24'],
      });
    } catch {}
  };

  const handleCreateCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onAddCustomDate({
      title: customTitle.trim(),
      date: customDateVal,
      category: customCategory,
    });

    setShowDateModal(false);
    setCustomTitle('');
    triggerConfetti();
  };

  const handleConnectSubmit = (platform: 'instagram' | 'facebook' | 'tiktok') => {
    if (!connectUsernameInput.trim()) return;

    const updated = { ...connectedAccounts };
    if (platform === 'instagram') {
      updated.instagram = { connected: true, username: connectUsernameInput.trim().replace('@', '') };
    } else if (platform === 'facebook') {
      updated.facebook = { connected: true, pageName: connectUsernameInput.trim() };
    } else if (platform === 'tiktok') {
      updated.tiktok = { connected: true, username: connectUsernameInput.trim().replace('@', '') };
    }

    onUpdateConnectedAccounts(updated);
    setConnectingPlatform(null);
    setConnectUsernameInput('');
    triggerConfetti();
  };

  const handleDisconnect = (platform: 'instagram' | 'facebook' | 'tiktok') => {
    const confirmed = window.confirm(`Deseja realmente desconectar sua conta do ${platform}?`);
    if (!confirmed) return;

    const updated = { ...connectedAccounts };
    if (platform === 'instagram') {
      updated.instagram = { connected: false, username: '' };
    } else if (platform === 'facebook') {
      updated.facebook = { connected: false, pageName: '' };
    } else if (platform === 'tiktok') {
      updated.tiktok = { connected: false, username: '' };
    }
    onUpdateConnectedAccounts(updated);

    // Reset publishing selections if needed
    setPubPlatforms(prev => ({ ...prev, [platform]: false }));
  };

  // Helper to add popular literary hashtag
  const handleAddHashtag = (hashtag: string) => {
    setPubContent((prev) => {
      const trimmed = prev.trim();
      if (trimmed.includes(hashtag)) return prev;
      return trimmed ? `${trimmed} ${hashtag}` : hashtag;
    });
  };

  // BRAND ASSET WATERMARK UPLOAD HANDLER
  const handleBrandAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setBrandAssetUrl(base64String);
      setBrandAssetName(file.name);
      localStorage.setItem('cronos_brand_asset_url', base64String);
      localStorage.setItem('cronos_brand_asset_name', file.name);
      triggerConfetti();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBrandAsset = () => {
    setBrandAssetUrl('');
    setBrandAssetName('');
    localStorage.removeItem('cronos_brand_asset_url');
    localStorage.removeItem('cronos_brand_asset_name');
  };

  // BOOKTOK/BOOKSTAGRAM TEMPLATES ROTATOR
  const handleRotateTemplates = () => {
    const TOTAL_TEMPLATES = BOOKTOK_TEMPLATES.length;
    const first = Math.floor(Math.random() * TOTAL_TEMPLATES);
    let second = Math.floor(Math.random() * TOTAL_TEMPLATES);
    while (second === first && TOTAL_TEMPLATES > 1) {
      second = Math.floor(Math.random() * TOTAL_TEMPLATES);
    }
    setTemplateIndices([first, second]);
    triggerConfetti();
  };

  // CHATBOT CHAT & IMAGE GENERATION DESPATCHER
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessageText = chatInput.trim();
    const newMsgList = [...chatMessages, { role: 'user', text: userMessageText }];
    setChatMessages(newMsgList);
    setChatInput('');
    setIsChatLoading(true);

    // Check if the user is requesting an image creative generation
    const isImageRequest =
      userMessageText.toLowerCase().includes('gerar imagem') ||
      userMessageText.toLowerCase().includes('gere uma imagem') ||
      userMessageText.toLowerCase().includes('criar imagem') ||
      userMessageText.toLowerCase().includes('imagem de');

    try {
      if (isImageRequest) {
        // Run image generation path
        const res = await fetch('/api/marketing/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessageText }),
        });
        const dataJson = await res.json();
        if (res.ok && dataJson.imageUrl) {
          setChatMessages((prev) => [
            ...prev,
            {
              role: 'model',
              text: '✨ Aqui está a arte do seu criativo que acabo de gerar para você! Você pode salvar essa imagem clicando com o botão direito nela ou usá-la no publicador oficial.',
              imageUrl: dataJson.imageUrl,
            },
          ]);
          triggerConfetti();
        } else {
          throw new Error(dataJson.error || 'Falha ao processar criativo visual.');
        }
      } else {
        // Run standard text assistant path
        const currentBookContext = books.length > 0 ? {
          title: books[0].title,
          genre: books[0].genre,
          premise: books[0].premise,
          tone: books[0].tone,
        } : null;

        const res = await fetch('/api/marketing/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessageText,
            history: newMsgList.slice(-6), // Send last 3 rounds of conversation
            bookContext: currentBookContext,
          }),
        });
        const dataJson = await res.json();
        if (res.ok && dataJson.text) {
          setChatMessages((prev) => [...prev, { role: 'model', text: dataJson.text }]);
        } else {
          throw new Error(dataJson.error || 'Falha ao obter conselho de marketing.');
        }
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ Desculpe, não consegui conectar à inteligência artificial agora: ${err.message || err}. Verifique se a sua conexão e a chave de API no servidor estão configuradas.`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Automated/Simulated Posting Action
  const handleSimulatedPublish = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const activeSelectedPlatforms = Object.entries(pubPlatforms)
      .filter(([_, isSelected]) => isSelected)
      .map(([platform]) => platform as 'instagram' | 'facebook' | 'tiktok');

    if (activeSelectedPlatforms.length === 0) {
      alert('Selecione pelo menos um canal (Instagram, Facebook ou TikTok) para publicar.');
      return;
    }

    // Verify if selected platforms are connected
    const unconnectedSelected = activeSelectedPlatforms.filter(p => !connectedAccounts[p].connected);
    if (unconnectedSelected.length > 0) {
      alert(`Por favor, conecte a conta do ${unconnectedSelected.join(', ')} antes de realizar a publicação oficial.`);
      return;
    }

    if (!pubTitle.trim()) {
      alert('Insira um título para a sua campanha ou publicação.');
      return;
    }

    if (!pubContent.trim()) {
      alert('Insira uma legenda para a sua publicação.');
      return;
    }

    setIsPublishingNow(true);
    setPublishingSuccess(false);
    setPublishingLog([]);

    const logSteps = [
      `🔌 [0.0s] Estabelecendo conexão segura com os servidores de mídias sociais...`,
      `🔑 [0.7s] Validando permissões OAuth 2.0 para as contas associadas... OK!`,
      `📦 [1.5s] Processando arquivos de mídia para envio (${pubMediaType === 'carousel' ? 'CARROSSEL' : pubMediaType.toUpperCase()})...`,
      `📷 [2.2s] ${pubSelectedBookId ? `Mídia vinculada: Capa do Livro "${books.find(b => b.id === pubSelectedBookId)?.title || 'Selecionado'}"` : pubFileMockName ? `Mídia vinculada: Arquivo "${pubFileMockName}"` : 'Mídia vinculada: Imagem padrão de autor'} carregada com sucesso!`,
      `📡 [3.0s] Enviando metadados do post, legenda e hashtag para publicação direta...`,
    ];

    // Append logs sequentially
    let delay = 0;
    logSteps.forEach((step, idx) => {
      setTimeout(() => {
        setPublishingLog(prev => [...prev, step]);
      }, delay);
      delay += 800;
    });

    // Add final platform success steps
    activeSelectedPlatforms.forEach((p, idx) => {
      setTimeout(() => {
        const username = p === 'facebook' ? connectedAccounts.facebook.pageName : connectedAccounts[p].username;
        setPublishingLog(prev => [
          ...prev,
          `✅ [${(3.8 + idx * 0.6).toFixed(1)}s] Publicado com sucesso no ${p.toUpperCase()} (${username})! ID do Post: API_${p.substring(0,3)}_${Math.floor(Math.random() * 10000000)}`
        ]);
      }, delay);
      delay += 600;
    });

    // Finish simulation
    setTimeout(() => {
      setPublishingLog(prev => [...prev, `🎉 [${(delay / 1000).toFixed(1)}s] Processo concluído com 100% de sucesso em todos os canais selecionados!`]);
      setPublishingSuccess(true);
      triggerConfetti();

      // Actually add the post to the publications/marketing history of the applet!
      onAddPost({
        title: pubTitle.trim(),
        content: pubContent.trim(),
        platforms: activeSelectedPlatforms,
        date: pubDate,
        time: pubTime,
        status: pubDate === todayStr ? 'published' : 'scheduled',
        mediaType: pubMediaType,
      });

      // Clear input fields for next post
      setPubTitle('');
      setPubContent('');
      setPubFileMockName('');
      setPubSelectedBookId('');
      setPubCustomImageUrl('');
    }, delay + 400);
  };

  // Normal Scheduling Action (adds to calendar queue without posting immediately)
  const handleNormalSchedule = () => {
    const activeSelectedPlatforms = Object.entries(pubPlatforms)
      .filter(([_, isSelected]) => isSelected)
      .map(([platform]) => platform as 'instagram' | 'facebook' | 'tiktok');

    if (activeSelectedPlatforms.length === 0) {
      alert('Selecione pelo menos uma rede social para agendar.');
      return;
    }

    if (!pubTitle.trim() || !pubContent.trim()) {
      alert('Preencha o título e a legenda para agendar o post no calendário editorial.');
      return;
    }

    onAddPost({
      title: pubTitle.trim(),
      content: pubContent.trim(),
      platforms: activeSelectedPlatforms,
      date: pubDate,
      time: pubTime,
      status: 'scheduled',
      mediaType: pubMediaType,
    });

    triggerConfetti();
    alert(`📅 Post "${pubTitle}" agendado com sucesso para ${pubDate.split('-').reverse().join('/')} às ${pubTime}! Ele agora aparece na sua folhinha do calendário editorial.`);
    
    // Clear fields
    setPubTitle('');
    setPubContent('');
    setPubFileMockName('');
    setPubSelectedBookId('');
    setPubCustomImageUrl('');
  };

  const selectedDayPosts = selectedDayKey ? postsByDate[selectedDayKey] || [] : [];
  const selectedDayCustomDates = selectedDayKey ? customDatesByDate[selectedDayKey] || [] : [];
  const selectedDayCuratedDates = selectedDayKey ? curatedDatesByDate[selectedDayKey] || [] : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* 1. CABEÇALHO DESTACADO: Visão geral da página e seções em sintonia com a cor do botão (#0f766e Verde Tiffany) */}
      <section className="relative rounded-3xl overflow-hidden p-5 sm:p-7 lg:p-8 shadow-lg bg-gradient-to-br from-[#120a1f] via-[#1a0f2b] to-[#120721] dark:from-[#0f071a] dark:to-[#0a0413] border border-[#ebdff2]/20 dark:border-[#2d1b42] text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0f766e]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#14b8a6]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f766e]/25 backdrop-blur-md border border-[#0f766e]/50 text-xs font-bold tracking-wider uppercase text-[#2dd4bf] shadow-xs">
                <Megaphone className="w-3.5 h-3.5 text-[#2dd4bf]" />
                <span>CronosPost · Calendário & Divulgação Editorial</span>
              </div>
              <h1 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
                CronosEscrita -{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5eead4] via-[#2dd4bf] to-[#0f766e]">
                  Marketing Literário
                </span>{' '}
                🚀
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">
                Toda grande obra precisa de leitores apaixonados! Planeje seus lançamentos e postagens no 
                <strong> Calendário Editorial</strong>, antecipe as <strong>Datas Literárias e Sociais</strong> mais marcantes 
                e configure suas mídias sociais para agendar e pré-visualizar postagens no <strong>Painel de Publicação Integrado</strong>.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl shrink-0 flex flex-col sm:flex-row items-center gap-4 shadow-lg min-w-[240px]">
              <div className="text-center sm:text-right">
                <span className="text-xs uppercase tracking-wider text-[#2dd4bf] font-bold block">
                  Publicações na Fila
                </span>
                <span className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight tabular-nums">
                  {marketingPosts.filter((p) => p.status === 'scheduled').length}
                </span>
                <span className="text-xs text-white/70 block mt-0.5">agendadas</span>
              </div>
              <div className="h-10 w-px bg-white/20 hidden sm:block" />
              <div className="text-center sm:text-right">
                <span className="text-xs uppercase tracking-wider text-[#2dd4bf] font-bold block">
                  Redes Vinculadas
                </span>
                <span className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight tabular-nums">
                  {Object.values(connectedAccounts).filter(acc => acc.connected).length} / 3
                </span>
                <span className="text-xs text-white/70 block mt-0.5">ativas</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (4 chips row) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f766e]/30 flex items-center justify-center text-[#2dd4bf]">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Posts Agendados</span>
                <span className="text-sm sm:text-base font-bold text-white tabular-nums">
                  {marketingPosts.filter((p) => p.status === 'scheduled').length} na fila
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Contas Conectadas</span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {Object.values(connectedAccounts).filter(acc => acc.connected).length} de 3
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Datas Literárias</span>
                <span className="text-sm sm:text-base font-bold text-white">
                  100+ cadastradas
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Assistente de IA</span>
                <span className="text-sm sm:text-base font-bold text-emerald-400">
                  Roteiros Grátis
                </span>
              </div>
            </div>
          </div>

          {/* Quick Section Navigator Anchors */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-white/80">
            <span className="font-bold text-white flex items-center gap-1">
              <span>Navegação Rápida:</span>
            </span>
            <a href="#social-networks-section" className="hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold">
              🔗 Suas Redes Sociais
            </a>
            <span className="text-white/20">•</span>
            <a href="#publishing-panel-section" className="hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold">
              🚀 Painel de Publicação
            </a>
            <span className="text-white/20">•</span>
            <a href="#calendar-editorial-section" className="hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold">
              📅 Calendário Editorial
            </a>
            <span className="text-white/20">•</span>
            <a href="#datas-comemorativas-section" className="hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold">
              🗓️ Datas Importantes
            </a>
            <span className="text-white/20">•</span>
            <a href="#marketing-templates-section" className="hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold">
              ✍️ Roteiros BookTok
            </a>
            <span className="text-white/20">•</span>
            <a href="#suggested-editorial-calendar-section" className="hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold">
              💡 Cronograma Sugerido
            </a>
            <span className="text-white/20">•</span>
            <a href="#literary-chatbot-marketing-section" className="hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold">
              🤖 Assistente de IA
            </a>

            {onOpenStoryModal && (
              <button
                type="button"
                onClick={onOpenStoryModal}
                className="ml-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#b83280] to-[#0f766e] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <span>📲 Gerar Story de Progresso</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO: SUAS REDES SOCIAIS */}
      <section id="social-networks-section" className="space-y-6 scroll-mt-20">
        <div className="bg-white dark:bg-[#160b24] p-5 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
            🔗 Suas Redes Sociais
          </h2>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">
            Conecte suas contas do Instagram, Facebook e TikTok para planejar e agendar postagens. As integrações utilizam as APIs oficiais das plataformas (Meta Graph API e TikTok Creator API), garantindo total segurança, estabilidade e proteção para a sua conta e seus dados de autor.
          </p>
        </div>

        {/* Connection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Instagram Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs flex flex-col justify-between hover:border-pink-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md mb-4">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#220d3a] dark:text-[#f7f2fc]">Instagram Professional</h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1.5 leading-relaxed">
                {connectedAccounts.instagram.connected
                  ? `Conectado como @${connectedAccounts.instagram.username}`
                  : 'Publique Reels, posts no feed e Carrosséis automaticamente com a Meta Graph API.'}
              </p>
            </div>

            <div className="mt-6">
              {connectedAccounts.instagram.connected ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pronto para publicação</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect('instagram')}
                    className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-200/50 dark:border-rose-900/40 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Desconectar Conta
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConnectingPlatform('instagram')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Vincular Instagram Business</span>
                </button>
              )}
            </div>
          </div>

          {/* Facebook Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs flex flex-col justify-between hover:border-blue-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md mb-4">
                <Facebook className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#220d3a] dark:text-[#f7f2fc]">Facebook Page</h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1.5 leading-relaxed">
                {connectedAccounts.facebook.connected
                  ? `Conectado à Página "${connectedAccounts.facebook.pageName}"`
                  : 'Integre sua página de autor e envie novidades para sua comunidade com um clique.'}
              </p>
            </div>

            <div className="mt-6">
              {connectedAccounts.facebook.connected ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pronto para publicação</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect('facebook')}
                    className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-200/50 dark:border-rose-900/40 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Desconectar Página
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConnectingPlatform('facebook')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Vincular Facebook</span>
                </button>
              )}
            </div>
          </div>

          {/* TikTok Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs flex flex-col justify-between hover:border-teal-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-black dark:bg-[#1a0e2a] flex items-center justify-center text-white shadow-md mb-4">
                <Video className="w-6 h-6 text-[#2dd4bf]" />
              </div>
              <h3 className="font-bold text-base text-[#220d3a] dark:text-[#f7f2fc]">TikTok Creator (BookTok)</h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1.5 leading-relaxed">
                {connectedAccounts.tiktok.connected
                  ? `Conectado como @${connectedAccounts.tiktok.username}`
                  : 'Programe vídeos de tropes, resenhas e reels literários direto na API oficial de publicação TikTok.'}
              </p>
            </div>

            <div className="mt-6">
              {connectedAccounts.tiktok.connected ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pronto para publicação</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect('tiktok')}
                    className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-200/50 dark:border-rose-900/40 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Desconectar Canal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConnectingPlatform('tiktok')}
                  className="w-full py-2.5 rounded-xl bg-[#1d152c] dark:bg-[#2dd4bf] text-white dark:text-[#1d152c] hover:opacity-95 text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Video className="w-4 h-4 text-[#2dd4bf] dark:text-[#1d152c]" />
                  <span>Vincular TikTok Creator</span>
                </button>
              )}
            </div>
          </div>

          {/* BRAND ASSETS WATERMARK CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs flex flex-col justify-between hover:border-[#6c2eb9]/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#147d74] to-[#2dd4bf] flex items-center justify-center text-white shadow-md mb-4">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-base text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-1.5">
                <span>Identidade Visual</span>
                {brandAssetUrl && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Ativa</span>
                )}
              </h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1.5 leading-relaxed">
                Envie seu logotipo, assinatura ou marca d'água para aplicar automaticamente como carimbo estético sobre todos os posts e capas.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {brandAssetUrl ? (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3 p-3 bg-[#e6f7f5]/40 rounded-2xl border border-[#cbebe7] dark:border-[#147d74]/30">
                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-black/10 flex items-center justify-center p-1 shrink-0">
                      <img src={brandAssetUrl} alt="Logo de marca" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{brandAssetName || 'Assinatura/Logotipo'}</p>
                      <p className="text-[10px] text-gray-400">Marca d'água ativa</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveBrandAsset}
                    className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-200/50 dark:border-rose-900/40 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Remover Assinatura
                  </button>
                </div>
              ) : (
                <label className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#ebdff2] dark:border-[#2d1b42] hover:border-[#6c2eb9] hover:bg-[#6c2eb9]/5 text-gray-400 hover:text-[#6c2eb9] dark:hover:text-[#a875ec] text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Carregar Logo / Assinatura</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBrandAssetUpload}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* PAINEL DE CONFIGURAÇÃO DE HORÁRIO DO LEMBRETE DIÁRIO DE POSTAGEM */}
        <div className="bg-[#faf7fd] dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42] p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-[#6c2eb9] dark:text-[#a875ec]">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-1.5">
                <span>Configuração de Lembrete Diário</span>
                {mReminderEnabled ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Ativado</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">Desativado</span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Escolha se deseja receber o pop-up de lembrete diário de postagem ao acessar a plataforma e o seu horário preferencial.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
              <input
                type="checkbox"
                checked={mReminderEnabled}
                onChange={(e) => setMReminderEnabled(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Lembrete Ativado</span>
            </label>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-gray-400">Horário:</span>
              <input
                type="time"
                disabled={!mReminderEnabled}
                value={mReminderTime}
                onChange={(e) => setMReminderTime(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#6c2eb9] disabled:opacity-40"
              />
            </div>
            
            <button
              type="button"
              onClick={handleSaveMarketingReminderSettings}
              className="w-full sm:w-auto px-4.5 py-2.5 bg-[#6c2eb9] hover:bg-[#5a239b] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Salvar Configuração
            </button>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO: PAINEL DE PUBLICAÇÃO & AGENDAMENTO LITERÁRIO */}
      <section id="publishing-panel-section" className="space-y-6 scroll-mt-20">
        <div className="bg-white dark:bg-[#160b24] p-5 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
            🚀 Painel de Publicação & Agendamento Literário
          </h2>
          <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">
            Escreva legendas atraentes, adicione mídias, selecione os canais de destino e programe ou publique instantaneamente via API.
          </p>
        </div>

        <div className="bg-white dark:bg-[#160b24] p-6 sm:p-8 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor Formulário de Postagem (7 colunas) */}
            <form onSubmit={handleSimulatedPublish} className="lg:col-span-7 space-y-6">
              {/* Canal de Destino */}
              <div>
                <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-2">
                  🚀 Selecione os Canais de Destino (Contas Conectadas)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Instagram Target */}
                  <label className={`flex-1 flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    pubPlatforms.instagram
                      ? 'border-[#b83280] bg-[#faeef5]/40 dark:bg-[#2d1424]/20'
                      : 'border-gray-200 dark:border-[#2d1b42] hover:border-gray-300'
                  } ${!connectedAccounts.instagram.connected ? 'opacity-50 cursor-not-allowed bg-gray-50/50 dark:bg-neutral-900/20' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        disabled={!connectedAccounts.instagram.connected}
                        checked={pubPlatforms.instagram}
                        onChange={(e) => setPubPlatforms(prev => ({ ...prev, instagram: e.target.checked }))}
                        className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 cursor-pointer"
                      />
                      <Instagram className={`w-4 h-4 ${pubPlatforms.instagram ? 'text-pink-600' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc]">Instagram</span>
                    </div>
                    {connectedAccounts.instagram.connected ? (
                      <span className="text-[10px] text-[#b83280] font-bold">@{connectedAccounts.instagram.username}</span>
                    ) : (
                      <span className="text-[9px] text-gray-500 italic">Desconectado</span>
                    )}
                  </label>

                  {/* Facebook Target */}
                  <label className={`flex-1 flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    pubPlatforms.facebook
                      ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/10'
                      : 'border-gray-200 dark:border-[#2d1b42] hover:border-gray-300'
                  } ${!connectedAccounts.facebook.connected ? 'opacity-50 cursor-not-allowed bg-gray-50/50 dark:bg-neutral-900/20' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        disabled={!connectedAccounts.facebook.connected}
                        checked={pubPlatforms.facebook}
                        onChange={(e) => setPubPlatforms(prev => ({ ...prev, facebook: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <Facebook className={`w-4 h-4 ${pubPlatforms.facebook ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc]">Facebook</span>
                    </div>
                    {connectedAccounts.facebook.connected ? (
                      <span className="text-[10px] text-blue-600 font-bold truncate max-w-[80px]">{connectedAccounts.facebook.pageName}</span>
                    ) : (
                      <span className="text-[9px] text-gray-500 italic">Desconectado</span>
                    )}
                  </label>

                  {/* TikTok Target */}
                  <label className={`flex-1 flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    pubPlatforms.tiktok
                      ? 'border-[#2dd4bf] bg-[#e6f7f5]/20 dark:bg-[#122e2b]/10'
                      : 'border-gray-200 dark:border-[#2d1b42] hover:border-gray-300'
                  } ${!connectedAccounts.tiktok.connected ? 'opacity-50 cursor-not-allowed bg-gray-50/50 dark:bg-neutral-900/20' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        disabled={!connectedAccounts.tiktok.connected}
                        checked={pubPlatforms.tiktok}
                        onChange={(e) => setPubPlatforms(prev => ({ ...prev, tiktok: e.target.checked }))}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                      />
                      <Video className={`w-4 h-4 ${pubPlatforms.tiktok ? 'text-teal-600' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc]">TikTok</span>
                    </div>
                    {connectedAccounts.tiktok.connected ? (
                      <span className="text-[10px] text-teal-600 font-bold">@{connectedAccounts.tiktok.username}</span>
                    ) : (
                      <span className="text-[9px] text-gray-500 italic">Desconectado</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Título & Formato */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                    Título do Post / Campanha
                  </label>
                  <input
                    type="text"
                    required
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    placeholder="Ex: Teaser Oficial de Lançamento"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                    Formato da Mídia
                  </label>
                  <select
                    value={pubMediaType}
                    onChange={(e) => setPubMediaType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9] cursor-pointer"
                  >
                    <option value="reel">Reel / Vídeo Curto (Instagram & TikTok)</option>
                    <option value="carousel">Carrossel (Múltiplas Imagens)</option>
                    <option value="story">Story</option>
                    <option value="video">Vídeo Longo horizontal</option>
                    <option value="post">Post Estático / Texto</option>
                  </select>
                </div>
              </div>

              {/* Mídia do Post - Utilizar livros reais do usuário para excelente UX */}
              <div>
                <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FileImage className="w-3.5 h-3.5 text-[#147d74]" />
                  <span>Escolha a Mídia / Capa Literária do Post</span>
                </label>

                <div className="space-y-4">
                  {books.length > 0 ? (
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 block mb-1.5">Rápido: Vincular com Capa de um dos seus Livros:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {books.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setPubSelectedBookId(b.id);
                              setPubFileMockName('');
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                              pubSelectedBookId === b.id
                                ? 'border-[#147d74] bg-[#e6f7f5]/40 dark:bg-[#147d74]/15 font-bold ring-1 ring-[#147d74]'
                                : 'border-gray-200 dark:border-[#2d1b42] bg-white dark:bg-[#140922] hover:border-gray-300'
                            }`}
                          >
                            <div className="w-8 h-10 bg-[#6c2eb9]/10 rounded flex-shrink-0 flex items-center justify-center overflow-hidden border border-black/10">
                              {b.coverUrl ? (
                                <img src={b.coverUrl} alt="capa" className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-[#6c2eb9]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-800 dark:text-gray-200 truncate font-semibold">{b.title}</p>
                              <p className="text-[9px] text-gray-400 truncate">Selecionar Capa</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] italic text-gray-400">Cadastre um livro no seu CronosEscrita para poder selecionar capas reais para o post!</p>
                  )}

                  {/* Manual File input simulation */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42]">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-[#6c2eb9]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-gray-700 dark:text-gray-300">Carregar Mídia Customizada (Arte/Vídeo)</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Formatos recomendados: JPEG, PNG, MP4</span>
                      </div>
                    </div>
                    <label className="px-4 py-2 bg-white dark:bg-[#160b24] hover:bg-[#faf7fd] border border-[#ebdff2] dark:border-[#2d1b42] text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all text-center">
                      <span>{pubFileMockName ? 'Trocar Arquivo' : 'Selecionar Arquivo'}</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPubFileMockName(e.target.files[0].name);
                            setPubSelectedBookId(''); // Clear book cover binding
                          }
                        }}
                      />
                    </label>
                  </div>

                  {pubFileMockName && (
                    <div className="flex items-center gap-2 text-xs text-[#147d74] bg-[#e6f7f5] dark:bg-[#122e2b] px-3.5 py-2 rounded-xl font-bold">
                      <Check className="w-4 h-4" />
                      <span>Arquivo pronto para envio: <strong>{pubFileMockName}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legenda & Hashtags */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider">
                    Legenda Magnética do Post
                  </label>
                  <span className={`text-[10px] font-bold ${pubContent.length > 2100 ? 'text-red-500' : 'text-gray-400'}`}>
                    {pubContent.length} / 2200 caracteres
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={pubContent}
                  onChange={(e) => setPubContent(e.target.value)}
                  maxLength={2200}
                  placeholder="Instigue curiosidade nos seus leitores... Fale das tropes do livro ou mostre os bastidores do seu dia de escrita!"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9]"
                />

                {/* Popular Hashtags insert helpers */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] text-gray-400 font-bold block">🔥 Clique para adicionar hashtags recomendadas pela sua Social Media:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['#BookTokBrasil', '#bookstagrambrasil', '#vidadeescritor', '#autoresnacionais', '#lancamentoliterario', '#leianacionais', '#escrevendo', '#cronosescritor'].map((hashtag) => (
                      <button
                        key={hashtag}
                        type="button"
                        onClick={() => handleAddHashtag(hashtag)}
                        className="px-2.5 py-1 rounded bg-[#f6f0fb] dark:bg-[#1f1033] text-gray-600 dark:text-gray-300 border border-[#ebdff2] dark:border-[#2d1b42] text-[10px] font-semibold hover:border-[#6c2eb9] transition-all"
                      >
                        {hashtag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agendamento Data/Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                    Data de Agendamento
                  </label>
                  <input
                    type="date"
                    required
                    value={pubDate}
                    onChange={(e) => setPubDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                    Horário da Postagem
                  </label>
                  <input
                    type="time"
                    required
                    value={pubTime}
                    onChange={(e) => setPubTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9]"
                  />
                </div>
              </div>

              {/* Google Calendar Sync Selector */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-teal-500/5 border border-teal-500/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncWithGoogleCal}
                  onChange={(e) => setSyncWithGoogleCal(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                  Sincronizar este post automaticamente como um evento no Google Calendar
                </span>
              </label>

              {/* Ações de Envio */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#ebdff2]/40 dark:border-[#2d1b42]/40">
                <button
                  type="button"
                  onClick={handleNormalSchedule}
                  className="flex-1 py-3 bg-white dark:bg-[#160b24] hover:bg-[#faf7fd] border border-[#ebdff2] dark:border-[#2d1b42] text-xs font-bold text-[#6c2eb9] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Apenas Agendar Fila</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#b83280] to-[#6c2eb9] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#2dd4bf]" />
                  <span>🚀 Publicar Agora via API</span>
                </button>
              </div>
            </form>

            {/* Visualização de Visual Live Phone Mockup Preview (5 colunas) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full pb-4 flex items-center justify-between border-b border-[#ebdff2]/40 dark:border-[#2d1b42]/40">
                <span className="text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#6c2eb9]" />
                  <span>Pré-Visualização Live</span>
                </span>
                <div className="flex bg-[#f6f0fb] dark:bg-[#1f1033] p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setPreviewSocialMode('instagram')}
                    className={`px-2 py-1 text-[10px] font-bold rounded ${
                      previewSocialMode === 'instagram' ? 'bg-white text-pink-600 shadow-xs' : 'text-gray-400'
                    }`}
                  >
                    Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSocialMode('tiktok')}
                    className={`px-2 py-1 text-[10px] font-bold rounded ${
                      previewSocialMode === 'tiktok' ? 'bg-white text-teal-600 shadow-xs' : 'text-gray-400'
                    }`}
                  >
                    TikTok
                  </button>
                </div>
              </div>

              {/* CSS Phone Frame */}
              <div className="relative mt-6 mx-auto w-[280px] h-[520px] rounded-[38px] border-[8px] border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col justify-between">
                {/* Speaker notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-neutral-800 rounded-b-xl z-20" />

                {previewSocialMode === 'instagram' ? (
                  /* Instagram UI Mockup */
                  <div className="flex-1 flex flex-col bg-white text-black text-xs h-full justify-between">
                    {/* Header */}
                    <div className="pt-7 px-3 pb-2 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                      <span className="font-bold text-[10px]">Instagram</span>
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                    </div>

                    {/* Feed Post Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
                      {/* User Account */}
                      <div className="p-2.5 flex items-center gap-2 bg-white">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                          <div className="w-full h-full rounded-full bg-gray-200 border border-white flex items-center justify-center font-bold text-[7px]">C</div>
                        </div>
                        <div>
                          <p className="font-bold text-[10px]">
                            {connectedAccounts.instagram.connected ? connectedAccounts.instagram.username : 'seu_username'}
                          </p>
                          <p className="text-[7px] text-gray-400">Patrocinado</p>
                        </div>
                      </div>

                      {/* Post Media (selected cover or upload placeholder) */}
                      <div className="w-full aspect-square bg-[#ebdff2]/40 flex items-center justify-center overflow-hidden border-y border-gray-100 relative">
                        {pubSelectedBookId && books.find(b => b.id === pubSelectedBookId)?.coverUrl ? (
                          <img src={books.find(b => b.id === pubSelectedBookId)?.coverUrl} alt="capa" className="w-full h-full object-cover" />
                        ) : pubCustomImageUrl ? (
                          <img src={pubCustomImageUrl} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="p-4 text-center">
                            <BookOpen className="w-10 h-10 text-[#6c2eb9] mx-auto opacity-40 mb-1" />
                            <p className="text-[9px] font-semibold text-gray-500">Capa do Livro Selecionado</p>
                            <p className="text-[7px] text-gray-400 mt-0.5">ou imagem carregada</p>
                          </div>
                        )}
                        {/* BRAND WATERMARK OVERLAY */}
                        {brandAssetUrl && (
                          <div className="absolute bottom-2 right-2 max-w-[55px] max-h-[35px] bg-white/85 backdrop-blur-xs p-1 rounded-md border border-white/20 shadow-xs z-10 pointer-events-none flex items-center justify-center">
                            <img src={brandAssetUrl} alt="logo" className="max-w-full max-h-full object-contain opacity-90" />
                          </div>
                        )}
                      </div>

                      {/* Caption details */}
                      <div className="p-3 bg-white space-y-1.5">
                        <div className="flex items-center gap-3 text-gray-700">
                          <Heart className="w-4 h-4 hover:text-red-500" />
                          <Megaphone className="w-4 h-4" />
                          <Send className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] font-bold">1.238 curtidas</p>
                        <p className="text-[9px] leading-relaxed">
                          <strong className="mr-1">
                            {connectedAccounts.instagram.connected ? connectedAccounts.instagram.username : 'seu_username'}
                          </strong>
                          <span className="text-gray-700">{pubContent || 'Escreva algo cativante no painel esquerdo para ver o preview live aqui...'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* TikTok UI Mockup */
                  <div className="flex-1 flex flex-col bg-neutral-950 text-white text-xs h-full justify-between relative">
                    {/* Full screen vertical video mockup background */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                      {pubSelectedBookId && books.find(b => b.id === pubSelectedBookId)?.coverUrl ? (
                        <div className="relative w-full h-full">
                          <img src={books.find(b => b.id === pubSelectedBookId)?.coverUrl} alt="capa" className="w-full h-full object-cover blur-sm opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center p-8">
                            <img src={books.find(b => b.id === pubSelectedBookId)?.coverUrl} alt="capa shadow" className="max-h-[250px] object-contain rounded-lg shadow-2xl border border-white/10" />
                          </div>
                        </div>
                      ) : pubCustomImageUrl ? (
                        <img src={pubCustomImageUrl} alt="preview" className="w-full h-full object-cover opacity-60" />
                      ) : (
                        <div className="p-6 text-center text-white/30">
                          <Video className="w-12 h-12 mx-auto opacity-35 mb-2 text-[#2dd4bf]" />
                          <p className="text-[10px] font-semibold text-white/50">BookTok Vertical Video</p>
                          <p className="text-[8px] text-white/40 mt-1">Carregue um arquivo de vídeo curto</p>
                        </div>
                      )}
                      {/* BRAND WATERMARK OVERLAY FOR TIKTOK */}
                      {brandAssetUrl && (
                        <div className="absolute top-16 right-3.5 max-w-[65px] max-h-[40px] bg-black/45 backdrop-blur-xs p-1 rounded-md border border-white/10 shadow-lg z-10 pointer-events-none flex items-center justify-center">
                          <img src={brandAssetUrl} alt="logo" className="max-w-full max-h-full object-contain opacity-95" />
                        </div>
                      )}
                    </div>

                    {/* Top tabs overlay */}
                    <div className="pt-7 px-4 flex justify-between items-center z-10 text-[9px] shrink-0 font-semibold bg-gradient-to-b from-black/60 to-transparent">
                      <span>Seguindo</span>
                      <span className="border-b-2 border-white pb-0.5">Para Você</span>
                      <Eye className="w-3.5 h-3.5 text-white" />
                    </div>

                    {/* Side Actions Overlay */}
                    <div className="absolute right-2.5 bottom-16 flex flex-col items-center gap-3 z-10">
                      <div className="w-7 h-7 rounded-full bg-white border border-[#2dd4bf] flex items-center justify-center text-[8px] text-black font-extrabold shadow">C</div>
                      <div className="text-center">
                        <Heart className="w-5 h-5 text-white fill-white/10" />
                        <span className="text-[7px] text-white/80 block mt-0.5">14K</span>
                      </div>
                      <div className="text-center">
                        <Megaphone className="w-5 h-5 text-white" />
                        <span className="text-[7px] text-white/80 block mt-0.5">382</span>
                      </div>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="p-3 pt-6 bg-gradient-to-t from-black/80 to-transparent z-10 text-[9px] space-y-1.5 self-end w-full">
                      <p className="font-bold">
                        @{connectedAccounts.tiktok.connected ? connectedAccounts.tiktok.username : 'seubooktok'}
                      </p>
                      <p className="text-white/80 leading-relaxed line-clamp-2">
                        {pubContent || 'Insira uma legenda para ver a sobreposição do BookTok aqui...'}
                      </p>
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Sparkles className="w-3 h-3 text-[#2dd4bf]" />
                        <span className="text-[8px]">Som Original - CronosEscrita</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO: CALENDÁRIO EDITORIAL MENSAL */}
      <section id="calendar-editorial-section" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#160b24] p-5 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
          <div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
              📅 Calendário Editorial Mensal
            </h2>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">
              Organize seus posts de bastidores, teasers, pré-vendas e lançamentos literários dia a dia na folhinha.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncGoogleCalendar}
              disabled={isSyncingCalendar}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              title="Sincronizar postagens e datas com o Google Calendar"
            >
              <Globe className="w-4 h-4 text-white" />
              <span>{isSyncingCalendar ? 'Sincronizando...' : 'Sincronizar com Google Calendar'}</span>
            </button>
            <a
              href="#publishing-panel-section"
              className="px-4 py-2.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5a239b] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#2dd4bf]" />
              <span>Agendar Novo Post</span>
            </a>
          </div>
        </div>

        {syncSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>{syncSuccessMsg}</span>
            <button onClick={() => setSyncSuccessMsg(null)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Calendário Mensal Estilo "Folhinha" para Marketing */}
        <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ebdff2] dark:border-[#2d1b42]">
            <div>
              <h3 className="font-serif-display text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] capitalize flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#6c2eb9]" />
                <span>{monthName}</span>
              </h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1">
                Selecione um dia para ver os detalhes, gerenciar posts ou adicionar metas de conteúdo.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#f6f0fb] dark:bg-[#1f1033] p-1 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] self-start sm:self-auto">
              <button
                onClick={handlePrevMonth}
                title="Mês anterior"
                className="p-1.5 hover:bg-white dark:hover:bg-[#2b1646] rounded-lg text-[#5c4672] dark:text-[#c4b3d8] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-white dark:hover:bg-[#2b1646] rounded-lg transition-colors cursor-pointer"
              >
                Hoje
              </button>
              <button
                onClick={handleNextMonth}
                title="Próximo mês"
                className="p-1.5 hover:bg-white dark:hover:bg-[#2b1646] rounded-lg text-[#5c4672] dark:text-[#c4b3d8] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Table Container with responsive fluid scroll on smaller screens (< 1024px) */}
          <div className="overflow-x-auto scrollbar-thin pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
            <div className="min-w-[540px] sm:min-w-0">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#8870a0] dark:text-[#9782ad] uppercase tracking-wider mt-6 mb-2">
                <span className="text-[#b83280] dark:text-[#f472b6]">Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span className="text-[#147d74] dark:text-[#2dd4bf]">Sáb</span>
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Leading empty days from prev month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const prevDay = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[64px] sm:min-h-[80px] p-2 rounded-2xl border border-dashed border-[#ebdff2]/60 dark:border-[#2d1b42]/40 bg-[#f6f0fb]/10 dark:bg-[#160b24]/10 text-[#8870a0]/30 dark:text-[#9782ad]/30 text-xs font-semibold select-none flex flex-col justify-between"
                >
                  <span>{prevDay}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const dayPosts = postsByDate[dayKey] || [];
              const dayCustomDates = customDatesByDate[dayKey] || [];
              const dayCuratedDates = curatedDatesByDate[dayKey] || [];
              
              const isToday = dayKey === todayStr;
              const isSelected = dayKey === selectedDayKey;
              const hasEvents = dayPosts.length > 0 || dayCustomDates.length > 0 || dayCuratedDates.length > 0;

              return (
                <button
                  key={dayKey}
                  onClick={() => setSelectedDayKey(dayKey === selectedDayKey ? null : dayKey)}
                  className={`min-h-[64px] sm:min-h-[80px] p-2 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                    isSelected
                      ? 'border-[#6c2eb9] dark:border-[#a875ec] ring-2 ring-[#6c2eb9]/25 bg-[#f6f0fb] dark:bg-[#1f1033] shadow-xs scale-[1.02]'
                      : isToday
                      ? 'border-[#b83280] dark:border-[#f472b6] bg-[#faeef5]/60 dark:bg-[#2b1424]/60 ring-1 ring-[#b83280]/40'
                      : hasEvents
                      ? 'border-[#6c2eb9]/40 dark:border-[#a875ec]/40 bg-[#f6f0fb]/40 dark:bg-[#1f1033]/20 hover:border-[#6c2eb9]'
                      : 'border-[#ebdff2] dark:border-[#2d1b42] bg-white dark:bg-[#160b24] hover:bg-[#faf7fd] dark:hover:bg-[#1f1033]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full tabular-nums ${
                        isToday
                          ? 'bg-[#b83280] text-white'
                          : isSelected
                          ? 'bg-[#6c2eb9] text-white'
                          : 'text-[#8870a0] dark:text-[#9782ad]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Event indicators */}
                    <div className="flex items-center gap-1 shrink-0">
                      {dayPosts.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#b83280] flex items-center justify-center" title={`${dayPosts.length} post(s) agendado(s)`} />
                      )}
                      {(dayCustomDates.length > 0 || dayCuratedDates.length > 0) && (
                        <span className="w-2 h-2 rounded-full bg-[#147d74] flex items-center justify-center" title="Efeméride ou Data Especial" />
                      )}
                    </div>
                  </div>

                  {/* Tiny text previews */}
                  <div className="hidden sm:block w-full overflow-hidden mt-1.5 space-y-0.5">
                    {dayPosts.slice(0, 1).map((p) => (
                      <div key={p.id} className="text-[9px] font-bold text-[#b83280] truncate bg-[#b83280]/10 dark:bg-[#b83280]/20 px-1 rounded-md">
                        🚀 {p.title}
                      </div>
                    ))}
                    {dayCustomDates.slice(0, 1).map((d) => (
                      <div key={d.id} className="text-[9px] font-bold text-[#147d74] truncate bg-[#147d74]/10 dark:bg-[#147d74]/20 px-1 rounded-md">
                        📌 {d.title}
                      </div>
                    ))}
                    {dayPosts.length === 0 && dayCustomDates.length === 0 && dayCuratedDates.slice(0, 1).map((d, idx) => (
                      <div key={idx} className="text-[9px] text-[#5c4672] dark:text-[#c4b3d8] truncate bg-black/5 dark:bg-white/5 px-1 rounded-md">
                        ✨ {d.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
              </div>
            </div>
          </div>

          {/* Selected day details panel */}
          {selectedDayKey && (
            <div className="mt-6 p-5 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0e2a] border border-[#ebdff2] dark:border-[#2d1b42] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#ebdff2] dark:border-[#ebdff2]/10 pb-3 flex-wrap gap-2">
                <div>
                  <h4 className="font-serif-display text-lg font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                    Programação para o dia {selectedDayKey.split('-').reverse().join('/')}
                  </h4>
                  <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8]">
                    Gerencie os posts de conteúdo e acompanhe as datas comemorativas e literárias desse dia.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPubDate(selectedDayKey);
                    const el = document.getElementById('publishing-panel-section') || document.getElementById('social-networks-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-[#6c2eb9] hover:bg-[#5a239b] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Escrever Post para este Dia</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Scheduled Posts */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-[#b83280] uppercase tracking-wider flex items-center gap-1.5">
                    <span>🚀 Posts Editorial / Campanhas</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#b83280]/10 text-xs font-bold text-[#b83280]">{selectedDayPosts.length}</span>
                  </h5>
                  {selectedDayPosts.map((post) => (
                    <div key={post.id} className="p-3 bg-white dark:bg-[#160b24] rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-[#b83280] bg-[#b83280]/10 px-1.5 py-0.5 rounded">
                            {post.mediaType === 'carousel' ? 'carrossel' : post.mediaType}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold">{post.time}</span>
                        </div>
                        <h6 className="font-bold text-xs text-[#220d3a] dark:text-[#f7f2fc] mt-1">{post.title}</h6>
                        <p className="text-[11px] text-[#5c4672]/80 dark:text-[#c4b3d8]/80 line-clamp-2 mt-0.5">“{post.content}”</p>
                      </div>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-95 transition-all"
                        title="Excluir postagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {selectedDayPosts.length === 0 && (
                    <p className="text-xs text-[#5c4672]/60 dark:text-[#c4b3d8]/60 italic py-2">Nenhum post planejado para esta data.</p>
                  )}
                </div>

                {/* Commemorative & Custom Dates */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-[#147d74] uppercase tracking-wider flex items-center gap-1.5">
                    <span>📌 Datas comemorativas & Marcos</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#147d74]/10 text-xs font-bold text-[#147d74]">{selectedDayCustomDates.length + selectedDayCuratedDates.length}</span>
                  </h5>
                  {selectedDayCustomDates.map((d) => (
                    <div key={d.id} className="p-3 bg-[#e6f7f5] dark:bg-[#147d74]/10 rounded-xl border border-[#cbebe7] dark:border-[#147d74]/30 flex items-center justify-between shadow-xs">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-[#147d74] dark:text-[#2dd4bf]">{d.category}</span>
                        <h6 className="font-bold text-xs text-[#147d74] dark:text-[#2dd4bf]">{d.title}</h6>
                      </div>
                      <button
                        onClick={() => onDeleteCustomDate(d.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        title="Remover data personalizada"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {selectedDayCuratedDates.map((d, idx) => (
                    <div key={idx} className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-100 dark:border-neutral-850/30 text-xs shadow-xs">
                      <span className="text-[9px] font-bold uppercase text-[#b83280]">{d.category}</span>
                      <h6 className="font-semibold text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">{d.title}</h6>
                    </div>
                  ))}
                  {selectedDayCustomDates.length === 0 && selectedDayCuratedDates.length === 0 && (
                    <p className="text-xs text-[#5c4672]/60 dark:text-[#c4b3d8]/60 italic py-2">Nenhum feriado ou marco literário nesta data.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. SEÇÃO: DATAS IMPORTANTES & LITERÁRIAS */}
      <section id="datas-comemorativas-section" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#160b24] p-5 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
          <div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
              🗓️ Datas Importantes & Literárias
            </h2>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">
              Feriados nacionais, marcos históricos da literatura brasileira e mundial, homenagens a profissionais do livro (revisores, bibliotecários, editores, ilustradores e tradutores) e datas de celebração da diversidade, orgulho e combate ao racismo e à misoginia.
            </p>
          </div>
          <button
            onClick={() => setShowDateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-purple-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Adicionar Marco ou Data Especial</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Suas Datas Especiais & Lançamentos */}
          <div className="bg-white dark:bg-[#160b24] p-6 sm:p-8 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-4 flex items-center gap-2 pb-3 border-b border-[#ebdff2]/40 dark:border-[#2d1b42]/40">
                <Sparkles className="w-5 h-5 text-[#147d74]" />
                <span>Suas Datas Especiais & Lançamentos</span>
              </h3>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {customDates.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs hover:border-[#6c2eb9] transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#147d74]/20 text-[#147d74] dark:text-[#2dd4bf]">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8]">
                          {item.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#220d3a] dark:text-[#f7f2fc] mt-1">{item.title}</h4>
                    </div>
                    <button
                      onClick={() => onDeleteCustomDate(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all active:scale-95"
                      title="Excluir data"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {customDates.length === 0 && (
                  <div className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    <Calendar className="w-10 h-10 mx-auto opacity-30 mb-2" />
                    <p className="text-xs">Nenhuma data personalizada cadastrada ainda.</p>
                    <p className="text-[10px] mt-1 text-gray-500">Adicione metas de pré-vendas e lançamento do seu e-book!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#ebdff2]/40 dark:border-[#2d1b42]/40 bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-2xl">
              <span className="text-xs font-bold text-[#147d74] block mb-1">💡 Dica de Planejamento Literário:</span>
              <p className="text-[11px] text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed">
                Mapeie datas como pré-venda, envio de originais para revisor, publicação de teaser, lançamento na Amazon, e data em que os leitores parceiros divulgarão as resenhas para maximizar o alcance do seu livro.
              </p>
            </div>
          </div>

          {/* Curated Literary & Cultural Dates */}
          <div className="bg-white dark:bg-[#160b24] p-6 sm:p-8 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm">
            <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc] mb-4 flex items-center gap-2 pb-3 border-b border-[#ebdff2]/40 dark:border-[#2d1b42]/40">
              <Globe className="w-5 h-5 text-[#b83280]" />
              <span>Calendário Nacional, Literário & Diversidade (2026)</span>
            </h3>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-100">
              {CURATED_IMPORTANT_DATES.map((dateItem, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#140922] border border-[#ebdff2] dark:border-[#2d1b42] hover:shadow-xs transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        dateItem.category === 'feriado'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : dateItem.category === 'literaria'
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                          : dateItem.category === 'profissao'
                          ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      }`}>
                        {dateItem.category}
                      </span>
                      <span className="text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8]">
                        {dateItem.date.split('-').slice(1).reverse().join('/')}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#220d3a] dark:text-[#f7f2fc] mt-1">{dateItem.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. SEÇÃO: GERADOR DE IDEIAS & ROTEIROS PARA BOOKTOK / BOOKSTAGRAM */}
      <section id="marketing-templates-section" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#160b24] p-5 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
          <div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
              ✍️ Gerador de Ideias & Roteiros para BookTok / Bookstagram
            </h2>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">
              Ideias de ganchos virais e roteiros prontos desenhados pela sua expert de social media. Role as sugestões para sortear novos temas!
            </p>
          </div>
          <button
            type="button"
            onClick={handleRotateTemplates}
            className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-[#6c2eb9]/15 text-[#6c2eb9] dark:text-[#a875ec] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-[#6c2eb9] dark:text-[#a875ec]" />
            <span>Atualizar Sugestões</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[BOOKTOK_TEMPLATES[templateIndices[0]] || BOOKTOK_TEMPLATES[0], BOOKTOK_TEMPLATES[templateIndices[1]] || BOOKTOK_TEMPLATES[1]].map((tpl, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs space-y-4 flex flex-col justify-between hover:border-[#6c2eb9]/40 transition-colors animate-in fade-in">
              <div className="space-y-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${tpl.badgeColor}`}>
                  {tpl.badge}
                </span>
                <h3 className="font-serif-display text-lg font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                  {tpl.title}
                </h3>
                <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed whitespace-pre-line">
                  {tpl.content}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPubTitle(tpl.title);
                  setPubContent(`🎬 Roteiro Sugerido:\n\n${tpl.plainText}`);
                  setPubMediaType(tpl.type);
                  const el = document.getElementById('social-networks-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  triggerConfetti();
                }}
                className="w-full py-2 bg-gradient-to-r from-[#6c2eb9] to-[#b83280] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Usar este Roteiro no Publicador</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SEÇÃO: CRONOGRAMA EDITORIAL SUGERIDO DE 30 DIAS */}
      <section id="suggested-editorial-calendar-section" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#160b24] p-5 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
          <div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
              💡 Cronograma Editorial Sugerido (30 Dias)
            </h2>
            <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-0.5">
              Ideias diárias de temas e formatos calibradas para a sua marca de autor ou livro atual.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {suggestionFeedback && (
              <span className="text-xs font-semibold text-[#147d74] dark:text-[#2dd4bf] bg-[#e6f7f5] dark:bg-[#122e2b] px-3 py-1.5 rounded-xl border border-[#cbebe7] dark:border-[#1d3d3a] animate-in fade-in">
                {suggestionFeedback}
              </span>
            )}
            <button
              type="button"
              onClick={handleRegenerateSuggestedCalendar}
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-[#6c2eb9] dark:text-[#a875ec] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-purple-200 dark:border-purple-800"
              title="Redefinir / Regenerar sugestões com novas ideias variadas"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerar Sugestões</span>
            </button>
          </div>
        </div>

        {/* Group Selector Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-[#f6f0fb] dark:bg-[#1f1033] p-1 rounded-2xl border border-[#ebdff2] dark:border-[#2d1b42]">
            {(['1-10', '11-20', '21-30'] as const).map((group) => (
              <button
                type="button"
                key={group}
                onClick={() => setActiveSuggestedGroup(group)}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeSuggestedGroup === group
                    ? 'bg-gradient-to-r from-[#6c2eb9] to-[#b83280] text-white shadow-md'
                    : 'text-[#8870a0] hover:text-[#220d3a] dark:hover:text-[#f7f2fc]'
                }`}
              >
                Dias {group}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of 10 card items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {suggestedCalendar
            .filter((item) => {
              if (activeSuggestedGroup === '1-10') return item.day >= 1 && item.day <= 10;
              if (activeSuggestedGroup === '11-20') return item.day >= 11 && item.day <= 20;
              return item.day >= 21 && item.day <= 30;
            })
            .map((item) => (
              <div
                key={item.day}
                className="bg-white dark:bg-[#160b24] rounded-2xl p-4.5 border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs flex flex-col justify-between hover:border-[#6c2eb9]/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-white/5 pb-2 mb-2.5">
                    <span className="text-[10px] font-extrabold uppercase bg-[#6c2eb9]/10 text-[#6c2eb9] dark:text-[#a875ec] px-2 py-0.5 rounded-full">
                      {item.type === 'carousel' ? 'carrossel' : item.type}
                    </span>
                    <span className="text-xs font-extrabold text-[#b83280] dark:text-[#f472b6]">
                      Dia {item.day}
                    </span>
                  </div>
                  <h4 className="font-serif-display text-xs sm:text-sm font-bold text-[#220d3a] dark:text-[#f7f2fc] line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#5c4672]/80 dark:text-[#c4b3d8]/80 line-clamp-3 mt-1 leading-relaxed">
                    {item.subject}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-gray-100 dark:border-white/5 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-all">
                  <button
                    type="button"
                    onClick={() => setEditingCard(item)}
                    title="Editar texto da sugestão"
                    className="p-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-[10px] font-bold text-[#5c4672] dark:text-[#c4b3d8] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectAddToCalendar(item)}
                    title="Adicionar diretamente ao Calendário Editorial deste mês"
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <CalendarPlus className="w-3 h-3 text-white" />
                    <span>Ao Calendário</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySuggestionToForm(item)}
                    title="Personalizar no Painel de Publicação"
                    className="py-1.5 px-2 bg-[#6c2eb9]/10 hover:bg-[#6c2eb9]/20 text-[#6c2eb9] dark:text-[#a875ec] rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Criar</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 7. SEÇÃO FINAL: ASSISTENTE LITERÁRIO DE IA */}
      <section id="literary-chatbot-marketing-section" className="space-y-6 scroll-mt-20">
        <div className="bg-white dark:bg-[#160b24] p-5 rounded-3xl border border-[#ebdff2] dark:border-[#2d1b42] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
                🤖 Assistente Literário de IA
              </h2>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1 leading-relaxed">
                Sua assessora criativa de marketing editorial e copywriting para livros. Crie ganchos magnéticos, roteiros dinâmicos para BookTok/Reels e estratégias de divulgação com inteligência artificial especializada.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold shrink-0 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Escopo 100% Gratuito Incluso</span>
            </div>
          </div>

          {/* O que está incluso no escopo gratuito */}
          <div className="mt-4 pt-3.5 border-t border-[#ebdff2]/40 dark:border-[#2d1b42]/40 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 text-[#6c2eb9] dark:text-[#a875ec]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Roteiros de Vídeo:</strong> Ganchos virais e cenas para BookTok/Reels.</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 text-[#b83280] dark:text-[#f472b6]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Copys & Legendas:</strong> Textos persuasivos e CTAs para o Instagram.</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 text-[#147d74] dark:text-[#2dd4bf]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Planejamento:</strong> Dicas de lançamento na Amazon e datas comemorativas.</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-md flex flex-col h-[520px] justify-between">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 pb-4 border-b border-gray-100 dark:border-white/5 scrollbar-thin">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse text-right' : 'text-left'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#b83280] text-white'
                    : 'bg-gradient-to-tr from-[#6c2eb9] to-[#ebdff2] text-white'
                }`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>

                <div className="space-y-2">
                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#faeef5] dark:bg-[#2b1424] text-[#b83280] dark:text-[#f472b6] font-bold rounded-tr-none text-left'
                      : 'bg-[#f6f0fb] dark:bg-[#1f1033] text-gray-800 dark:text-gray-200 rounded-tl-none whitespace-pre-line'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Render generated image part if any */}
                  {msg.imageUrl && (
                    <div className="p-3 bg-neutral-100 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-white/5 space-y-3 max-w-[320px] animate-in zoom-in-95 duration-200">
                      <div className="relative rounded-xl overflow-hidden border border-black/10 aspect-square bg-[#ebdff2]/40 flex items-center justify-center">
                        <img src={msg.imageUrl} alt="Criativo Gerado" className="w-full h-full object-cover" />
                        {brandAssetUrl && (
                          <div className="absolute bottom-2 right-2 max-w-[50px] max-h-[30px] bg-white/80 p-1 rounded-md border border-white/20 pointer-events-none">
                            <img src={brandAssetUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={msg.imageUrl}
                          download="cronos_criativo_ai.png"
                          className="flex-1 py-1.5 bg-white dark:bg-[#160b24] hover:bg-[#faf7fd] border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1"
                        >
                          Salvar Imagem
                        </a>
                        <button
                          type="button"
                          onClick={() => handleUseGeneratedImageInPublisher(msg.imageUrl)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          Usar no Publicador
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3 max-w-[85%] text-left">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6c2eb9] to-[#ebdff2] text-white flex items-center justify-center font-bold text-xs animate-pulse">
                  AI
                </div>
                <div className="bg-[#f6f0fb] dark:bg-[#1f1033] p-3.5 rounded-2xl rounded-tl-none text-xs text-gray-500 flex items-center gap-2 font-bold animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#6c2eb9]" />
                  <span>Sua Social Media de IA está criando as ideias e criativos de marketing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <input
              type="text"
              disabled={isChatLoading}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ex: 'Escreva 3 ganchos para BookTok' ou 'Gere uma imagem de uma fada lendo na floresta'..."
              className="flex-1 px-4 py-3 rounded-2xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-xs sm:text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-5 bg-[#6c2eb9] hover:bg-[#5a239b] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      </section>

      {/* MODAL: EDITAR SUGESTÃO DO CALENDÁRIO */}
      {editingCard && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCard(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in cursor-pointer"
        >
          <div className="bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 cursor-default">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Editar Sugestão (Dia {editingCard.day})
              </h3>
              <button
                onClick={() => setEditingCard(null)}
                className="p-2 rounded-xl text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] cursor-pointer"
                title="Voltar / Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCardEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                  Título da Publicação
                </label>
                <input
                  type="text"
                  required
                  value={editingCard.title}
                  onChange={(e) => setEditingCard(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                  Formato da Mídia
                </label>
                <select
                  value={editingCard.type}
                  onChange={(e) => setEditingCard(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9] cursor-pointer"
                >
                  <option value="reel">Reel / Vídeo Curto</option>
                  <option value="carousel">Carrossel</option>
                  <option value="story">Story</option>
                  <option value="video">Vídeo Longo</option>
                  <option value="post">Post Estático / Feed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                  Assunto / Roteiro Detalhado
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingCard.subject}
                  onChange={(e) => setEditingCard(prev => prev ? { ...prev, subject: e.target.value } : null)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebdff2] dark:border-[#2d1b42]">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5a239b] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR DATA PERSONALIZADA */}
      {showDateModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDateModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in cursor-pointer"
        >
          <div className="bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 cursor-default">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Adicionar Marco ou Data Especial
              </h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="p-2 rounded-xl text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] cursor-pointer"
                title="Voltar / Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomDateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                  Título do Evento ou Marco Literário
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ex: Revelação da Capa Oficial"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#147d74]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                    Data do Marco
                  </label>
                  <input
                    type="date"
                    required
                    value={customDateVal}
                    onChange={(e) => setCustomDateVal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#147d74]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#147d74] cursor-pointer"
                  >
                    <option value="lancamento">Lançamento</option>
                    <option value="literaria">Literária</option>
                    <option value="diversidade">Diversidade / Social</option>
                    <option value="outro">Outro Marco</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebdff2] dark:border-[#2d1b42]">
                <button
                  type="button"
                  onClick={() => setShowDateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] cursor-pointer"
                >
                  Voltar / Fechar (Esc)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer"
                >
                  Salvar Marco Especial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VINCULAR CONTA SOCIAL */}
      {connectingPlatform && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setConnectingPlatform(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in cursor-pointer"
        >
          <div className="bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-6 text-center cursor-default">
            <div className="w-14 h-14 rounded-2xl bg-[#6c2eb9]/10 text-[#6c2eb9] dark:text-[#a875ec] flex items-center justify-center mx-auto">
              <Share2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Vincular Conta {connectingPlatform === 'instagram' ? 'Instagram' : connectingPlatform === 'facebook' ? 'Facebook' : 'TikTok'}
              </h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1.5 leading-relaxed">
                Insira o seu @ de usuário profissional ou nome da página para realizar a autenticação segura do aplicativo com a API oficial:
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                autoFocus
                value={connectUsernameInput}
                onChange={(e) => setConnectUsernameInput(e.target.value)}
                placeholder={connectingPlatform === 'tiktok' ? '@seutiktok' : connectingPlatform === 'instagram' ? '@seuinsta' : 'Nome da Página'}
                className="w-full px-4 py-3 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-sm text-center font-bold text-[#220d3a] dark:text-[#f7f2fc] focus:outline-none focus:ring-2 focus:ring-[#6c2eb9]"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConnectingPlatform(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] cursor-pointer"
                >
                  Voltar / Fechar (Esc)
                </button>
                <button
                  type="button"
                  onClick={() => handleConnectSubmit(connectingPlatform)}
                  className="flex-1 py-2.5 rounded-xl bg-[#6c2eb9] hover:bg-[#5a239b] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Autorizar Vínculo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: SIMULADOR DE AGENDAMENTO / PUBLICAÇÃO API */}
      {isPublishingNow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-[#0f0717] border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-5 h-5 text-pink-500 animate-spin" />
                <h3 className="font-mono text-sm font-bold text-gray-200">
                  Meta & TikTok API Dispatch Pipeline
                </h3>
              </div>
              {!publishingSuccess && (
                <button
                  onClick={() => setIsPublishingNow(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  title="Abortar envio"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Terminal Log View */}
            <div className="bg-black/90 rounded-2xl p-4 border border-white/5 font-mono text-[11px] leading-relaxed space-y-2 h-[240px] overflow-y-auto no-scrollbar text-gray-300">
              {publishingLog.map((log, index) => (
                <div key={index} className="animate-in slide-in-from-bottom-1 duration-150">
                  {log}
                </div>
              ))}
              {!publishingSuccess && (
                <div className="flex items-center gap-1.5 text-gray-500 animate-pulse mt-1">
                  <span>█</span>
                  <span>Enviando dados para as mídias sociais...</span>
                </div>
              )}
            </div>

            {/* Completion Success Overlay */}
            {publishingSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-400">Postagem Publicada com Sucesso!</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Sua fila de agendamento foi atualizada com o novo post.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPublishingNow(false);
                    setPublishingSuccess(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Ok, continuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
