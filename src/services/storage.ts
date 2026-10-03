import type {
  WritingSession,
  Project,
  Book,
  Badge,
  SavedMicroStory,
  MarketingPost,
  CustomDateItem,
  ConnectedSocialAccounts,
  SocialAutomation,
} from '../types';
import { INITIAL_BADGES } from '../data/badges';

const STORAGE_KEY = 'cronos_escrita_v3_clean';

export interface StorageData {
  goal: number; // default 50000
  dailyGoal: number; // default 1000
  challengeDays: number; // default 30
  startDate: string; // YYYY-MM-DD
  projects: Project[];
  books: Book[];
  sessions: WritingSession[];
  badges: Badge[];
  savedMicroStories: SavedMicroStory[];
  marketingPosts: MarketingPost[];
  customImportantDates: CustomDateItem[];
  connectedAccounts: ConnectedSocialAccounts;
  automations: SocialAutomation[];
}

export const getTodayDateString = (dateObj: Date = new Date()): string => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getOffsetDateString = (dayOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return getTodayDateString(d);
};

const getCleanInitialData = (): StorageData => {
  return {
    goal: 50000,
    dailyGoal: 1000,
    challengeDays: 30,
    startDate: getTodayDateString(),
    projects: [],
    books: [],
    sessions: [],
    badges: INITIAL_BADGES.map((b) => ({ ...b, unlockedAt: undefined })),
    savedMicroStories: [],
    marketingPosts: [],
    customImportantDates: [],
    connectedAccounts: {
      instagram: { connected: false, username: '' },
      facebook: { connected: false, pageName: '' },
      tiktok: { connected: false, username: '' },
    },
    automations: [],
  };
};

export const loadStorageData = (): StorageData => {
  try {
    // Clear old mock storage key if present
    if (localStorage.getItem('cronos_escrita_v2_store')) {
      try {
        const oldData = JSON.parse(localStorage.getItem('cronos_escrita_v2_store') || '{}');
        // If it was mock data with Lunaria, remove it
        if (oldData.projects?.some((p: Project) => p.id === 'proj_lunaria_01')) {
          localStorage.removeItem('cronos_escrita_v2_store');
        }
      } catch {
        localStorage.removeItem('cronos_escrita_v2_store');
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getCleanInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);

    // Filter out any lingering mock objects if any exist
    const cleanProjects = (Array.isArray(parsed.projects) ? parsed.projects : []).filter(
      (p: Project) => p.id !== 'proj_lunaria_01'
    );
    const cleanBooks = (Array.isArray(parsed.books) ? parsed.books : []).filter(
      (b: Book) => b.id !== 'book_cronicas_nevoa_01'
    );
    const cleanSessions = (Array.isArray(parsed.sessions) ? parsed.sessions : []).filter(
      (s: WritingSession) => s.projectId !== 'proj_lunaria_01' && !s.id.startsWith('sess_0')
    );
    const cleanStories = (Array.isArray(parsed.savedMicroStories) ? parsed.savedMicroStories : []).filter(
      (m: SavedMicroStory) => m.id !== 'story_01'
    );

    return {
      goal: typeof parsed.goal === 'number' ? parsed.goal : 50000,
      dailyGoal: typeof parsed.dailyGoal === 'number' ? parsed.dailyGoal : 1000,
      challengeDays: typeof parsed.challengeDays === 'number' ? parsed.challengeDays : 30,
      startDate: parsed.startDate || getTodayDateString(),
      projects: cleanProjects,
      books: cleanBooks,
      sessions: cleanSessions,
      badges: Array.isArray(parsed.badges) && parsed.badges.length > 0 ? parsed.badges : INITIAL_BADGES.map((b) => ({ ...b, unlockedAt: undefined })),
      savedMicroStories: cleanStories,
      marketingPosts: Array.isArray(parsed.marketingPosts) ? parsed.marketingPosts : getCleanInitialData().marketingPosts,
      customImportantDates: Array.isArray(parsed.customImportantDates) ? parsed.customImportantDates : getCleanInitialData().customImportantDates,
      connectedAccounts: parsed.connectedAccounts || getCleanInitialData().connectedAccounts,
      automations: Array.isArray(parsed.automations) ? parsed.automations : [],
    };
  } catch (error) {
    console.error('Erro ao ler localStorage, reiniciando dados limpos:', error);
    const initial = getCleanInitialData();
    return initial;
  }
};

export const saveStorageData = (data: StorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

export const clearAllData = (): StorageData => {
  const clean = getCleanInitialData();
  saveStorageData(clean);
  return clean;
};
