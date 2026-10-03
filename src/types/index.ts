export interface WritingSession {
  id: string;
  projectId: string;
  bookId: string;
  words: number;
  date: string; // YYYY-MM-DD
  durationMinutes?: number;
  notes?: string;
  source?: 'manual' | 'game' | 'calendar';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  role: string; // Protagonista, Antagonista, Mentor, Aliado, etc.
  archetype?: string;
  description: string;
  notes?: string;
}

export interface Chapter {
  id: string;
  order: number;
  title: string;
  summary: string;
  targetWords?: number;
  status: 'planejado' | 'escrevendo' | 'concluido' | 'revisado';
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ResearchQueryItem {
  id: string;
  bookId: string;
  query: string;
  category?: 'historical' | 'sensory' | 'technical' | 'fact_check' | 'names' | 'general';
  answer: string;
  sources: GroundingSource[];
  createdAt: string;
}

export interface MoodboardItem {
  id: string;
  url: string;
  title: string;
  category?: 'capa' | 'cenario' | 'personagem' | 'objeto' | 'atmosfera' | 'figurino' | 'outro';
  notes?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  projectId: string;
  title: string;
  subtitle?: string;
  author: string;
  coverUrl?: string;
  genre: string;
  targetWords: number;
  premise: string;
  setting: string;
  tone: string;
  generalNotes?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  characters: Character[];
  chapters: Chapter[];
  researchNotes?: ResearchQueryItem[];
  moodboardItems?: MoodboardItem[];
  // Publicação e lançamento
  publicationStatus?: 'planejado' | 'em_preparacao' | 'pronto' | 'publicado';
  targetPublicationDate?: string; // Data prevista (quando o livro ou arquivo será publicado)
  publishedAt?: string; // Data em que a publicação foi confirmada
  publicationFormat?: string;
  publisherOrPlatform?: string;
  publicationUrl?: string;
  publicationCount?: number;
  publicationNotes?: string;
  createdAt: string;
}

export type BadgeLevel = 'novato' | 'mediano' | 'bom_demais';

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'milestone' | 'streak' | 'creative' | 'worldbuilding';
  color: string;
  unlockedAt?: string;
  level?: BadgeLevel;
  levelName?: string; // e.g. "Escritor Novato", "Escritor em Ascensão", "Escritor Bom Demais"
  funRankName?: string; // e.g. "Explorador da Folha", "Artesão dos Parágrafos", "Lenda Viva das Letras"
  targetNumber?: number; // Target quantity needed to unlock
  metricType?:
    | 'total_words'
    | 'session_words'
    | 'unique_days'
    | 'total_minutes'
    | 'books'
    | 'characters'
    | 'chapters'
    | 'micro_stories'
    | 'publications'
    | 'weeks_constancy';
  metricUnit?: string; // e.g. "palavras", "dias", "minutos", "personagens", "capítulos", "contos", "publicações", "semanas"
  celebrationSuggestion?: string; // Dopamine booster suggestion
  consistencyReminder?: string; // Mindful reminder of steady consistency over trophy hunting
}

export interface DailyPromptWord {
  word: string;
  category: string;
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  poeticExample: string;
  sparkIdea: string;
}

export interface SavedMicroStory {
  id: string;
  word: string;
  text: string;
  wordCount: number;
  createdAt: string;
  transferredToSession?: boolean;
  promptTitle?: string;
  category?: string;
  durationMinutes?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
}

export interface MarketingPost {
  id: string;
  title: string;
  content: string;
  platforms: ('instagram' | 'facebook' | 'tiktok')[];
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'scheduled' | 'published';
  mediaType: 'reel' | 'carousel' | 'story' | 'video' | 'post';
}

export interface CustomDateItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'lancamento' | 'literaria' | 'diversidade' | 'outro';
}

export interface ConnectedSocialAccounts {
  instagram: { connected: boolean; username?: string };
  facebook: { connected: boolean; pageName?: string };
  tiktok: { connected: boolean; username?: string };
}

export interface SocialAutomation {
  id: string;
  name: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'threads' | 'whatsapp';
  triggerType: 'comment' | 'dm' | 'story_mention';
  keyword: string;
  responseMessage: string;
  linkUrl: string;
  connectedPostId: string; // "all" or specific post ID
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // e.g., "20:00"
  targetDailyWords: number;
  browserNotifications: boolean;
  syncGoogleCalendar: boolean;
  lastNotifiedDate?: string;
  daysOfWeek?: number[]; // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
}
