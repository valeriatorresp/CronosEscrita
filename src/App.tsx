import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { WordGameView } from './components/WordGameView';
import { BookBibleView } from './components/BookBibleView';
import { AuthModal } from './components/AuthModal';
import { BadgeCelebration } from './components/BadgeCelebration';
import { ReminderModal } from './components/ReminderModal';
import { ImmersiveWriter } from './components/ImmersiveWriter';
import { BadgesSection } from './components/BadgesSection';
import { MilestoneMiniCelebration } from './components/MilestoneMiniCelebration';
import { MarketingView } from './components/MarketingView';
import { AutomationView } from './components/AutomationView';
import { StoryGeneratorModal } from './components/StoryGeneratorModal';
import { BookBibleExportModal } from './components/BookBibleExportModal';
import { GlobalSkeletonLoader } from './components/GlobalSkeletonLoader';

import type {
  WritingSession,
  Project,
  Book,
  Badge,
  SavedMicroStory,
  AuthUser,
  ReminderSettings,
  MarketingPost,
  CustomDateItem,
  ConnectedSocialAccounts,
  SocialAutomation,
} from './types';
import {
  loadStorageData,
  saveStorageData,
  getTodayDateString,
  type StorageData,
} from './services/storage';
import { initAuth, logoutUser, setCachedAccessToken } from './services/auth';
import { saveUserBackup, loadUserBackup } from './services/backup';
import { evaluateBadges } from './data/badges';
import {
  loadReminderSettings,
  saveReminderSettings,
  checkShouldNotifyToday,
  sendBrowserNotification,
} from './services/reminder';

import { RefreshCw, Megaphone, TrendingUp, X } from 'lucide-react';
import { INSPIRATIONAL_QUOTES } from './data/quotes';
import { MetricsView } from './components/MetricsView';

export default function App() {
  const [data, setData] = useState<StorageData>(() => loadStorageData());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'game' | 'bible' | 'badges' | 'marketing' | 'metrics' | 'automation'>('dashboard');
  const [bibleInitialTab, setBibleInitialTab] = useState<'architecture' | 'research' | 'drive'>('architecture');

  // Modals for author suggestions
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isBookBibleExportModalOpen, setIsBookBibleExportModalOpen] = useState(false);

  // Daily social media reminder uploader (checks first access in 24h)
  const [showDailySocialReminder, setShowDailySocialReminder] = useState(false);

  useEffect(() => {
    try {
      const lastReminder = localStorage.getItem('cronos_daily_social_reminder_time');
      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      if (!lastReminder || (now - parseInt(lastReminder, 10)) > ONE_DAY_MS) {
        const timer = setTimeout(() => {
          // Only show reminder if user is on dashboard and not already in marketing or automation
          setCurrentTab((tab) => {
            if (tab === 'dashboard') {
              setShowDailySocialReminder(true);
            }
            return tab;
          });
        }, 5000);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleDismissSocialReminder = () => {
    setShowDailySocialReminder(false);
    try {
      localStorage.setItem('cronos_daily_social_reminder_time', String(Date.now()));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoToPostNow = () => {
    setShowDailySocialReminder(false);
    try {
      localStorage.setItem('cronos_daily_social_reminder_time', String(Date.now()));
    } catch (err) {
      console.error(err);
    }
    setCurrentTab('marketing');
    setTimeout(() => {
      const section = document.getElementById('social-networks-section');
      section?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleOpenResearch = () => {
    setBibleInitialTab('research');
    setCurrentTab('bible');
    setTimeout(() => {
      const section = document.getElementById('literary-research-section');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = document.getElementById('research-search-input');
      input?.focus();
    }, 150);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to quickly trigger research tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleOpenResearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Rotating inspirational quote on each access/refresh
  const [quoteIndex, setQuoteIndex] = useState<number>(() => {
    try {
      const last = sessionStorage.getItem('cronos_last_quote_index');
      const next =
        last !== null
          ? (parseInt(last, 10) + 1) % INSPIRATIONAL_QUOTES.length
          : Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
      sessionStorage.setItem('cronos_last_quote_index', String(next));
      return next;
    } catch {
      return Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
    }
  });

  const handleNextQuote = () => {
    const next = (quoteIndex + 1) % INSPIRATIONAL_QUOTES.length;
    setQuoteIndex(next);
    try {
      sessionStorage.setItem('cronos_last_quote_index', String(next));
    } catch {}
  };

  const currentQuote = INSPIRATIONAL_QUOTES[quoteIndex] || INSPIRATIONAL_QUOTES[0];

  // Theme state: dark / light
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cronos_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cronos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cronos_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Authentication & Google Workspace state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Safety timeout for loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Badge celebration notification
  const [recentlyUnlockedBadge, setRecentlyUnlockedBadge] = useState<Badge | null>(null);

  // 500-words Milestone celebration
  const [milestoneCelebration, setMilestoneCelebration] = useState<{ show: boolean; words: number } | null>(null);

  // Reminder settings and state
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() =>
    loadReminderSettings()
  );
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderDismissedDate, setReminderDismissedDate] = useState<string | null>(() => {
    return localStorage.getItem('cronos_reminder_dismissed_date');
  });
  const [isReminderPending, setIsReminderPending] = useState(false);

  // Immersive Writing Mode (Focus Mode)
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [immersiveInitialText, setImmersiveInitialText] = useState('');
  const [immersiveInitialBookId, setImmersiveInitialBookId] = useState<string | undefined>();

  const handleOpenImmersive = (text: string = '', bookId?: string) => {
    setImmersiveInitialText(text);
    setImmersiveInitialBookId(bookId || data.books[0]?.id);
    setIsImmersiveMode(true);
  };

  // Initialize Auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser, token) => {
        setUser(authenticatedUser);
        if (token) {
          setGoogleToken(token);
        }
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setGoogleToken(null);
        setIsAuthLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Save changes to localStorage whenever data changes
  useEffect(() => {
    saveStorageData(data);
  }, [data]);

  // Restores user data from Firebase Firestore backup on login
  useEffect(() => {
    if (!user) return;

    const restoreBackup = async () => {
      try {
        const cloudData = await loadUserBackup(user.id);
        if (cloudData) {
          console.log('Centralized cloud backup loaded successfully from Firestore.');
          setData(cloudData);
        } else {
          console.log('No existing Firestore backup found. Initializing first cloud backup point.');
          await saveUserBackup(user.id, data);
        }
      } catch (err) {
        console.error('Centralized cloud backup restore/sync failed:', err);
      }
    };

    restoreBackup();
  }, [user?.id]);

  // Centralized Firebase Firestore auto-backup triggered on writing sessions or books changes
  useEffect(() => {
    if (!user) return;

    const debounceBackup = setTimeout(async () => {
      try {
        await saveUserBackup(user.id, data);
      } catch (err) {
        console.error('Firestore auto-backup event failed:', err);
      }
    }, 1200); // 1.2s Debounce to coalesce fast concurrent edits cleanly

    return () => clearTimeout(debounceBackup);
  }, [data, user?.id]);

  // Total words across all sessions
  const totalWords = data.sessions.reduce((sum, s) => sum + s.words, 0);

  // Words written today
  const todayStr = getTodayDateString();
  const wordsToday = data.sessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.words, 0);

  // Periodic reminder checking
  useEffect(() => {
    const checkReminder = () => {
      const shouldNotify = checkShouldNotifyToday(reminderSettings, wordsToday);
      setIsReminderPending(shouldNotify);

      // If browser notifications enabled and not yet fired today:
      if (
        shouldNotify &&
        reminderSettings.browserNotifications &&
        reminderSettings.lastNotifiedDate !== todayStr
      ) {
        sendBrowserNotification(
          '✍️ Hora de Escrever no CronosEscrita!',
          `Já são ${reminderSettings.time} e você ainda não registrou suas palavras de hoje. Que tal manter o foco agora?`
        );
        const updated = { ...reminderSettings, lastNotifiedDate: todayStr };
        setReminderSettings(updated);
        saveReminderSettings(updated);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [reminderSettings, wordsToday, todayStr]);

  const handleSaveReminderSettings = (newSettings: ReminderSettings) => {
    setReminderSettings(newSettings);
    saveReminderSettings(newSettings);
  };

  const handleDismissReminder = () => {
    setReminderDismissedDate(todayStr);
    localStorage.setItem('cronos_reminder_dismissed_date', todayStr);
  };

  const isReminderDismissed = reminderDismissedDate === todayStr;

  // Initial check on mount to ensure any existing progress has its badges unlocked and all 30 badges are loaded
  useEffect(() => {
    const { updatedBadges, newlyUnlocked } = evaluateBadges(
      data.badges,
      data.sessions,
      data.books,
      data.projects,
      data.savedMicroStories.length
    );
    if (newlyUnlocked.length > 0 || data.badges.length !== updatedBadges.length) {
      setData((prev) => ({
        ...prev,
        badges: updatedBadges,
      }));
    }
  }, []);

  // Helper to re-evaluate badges
  const checkBadges = (
    currentSessions: WritingSession[],
    currentBooks: Book[],
    currentProjects: Project[],
    currentStoriesCount: number
  ) => {
    const { updatedBadges, newlyUnlocked } = evaluateBadges(
      data.badges,
      currentSessions,
      currentBooks,
      currentProjects,
      currentStoriesCount
    );

    if (newlyUnlocked.length > 0) {
      setRecentlyUnlockedBadge(newlyUnlocked[0]);
    }

    return updatedBadges;
  };

  // Add Session handler
  const handleAddSession = (sessionData: Omit<WritingSession, 'id' | 'createdAt'>) => {
    const newSession: WritingSession = {
      ...sessionData,
      id: `sess_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const newSessions = [...data.sessions, newSession];
    const newBadges = checkBadges(
      newSessions,
      data.books,
      data.projects,
      data.savedMicroStories.length
    );

    setData((prev) => ({
      ...prev,
      sessions: newSessions,
      badges: newBadges,
    }));

    // Check if session reached 500 words or more for visual mini-celebration
    if (sessionData.words >= 500) {
      setMilestoneCelebration({
        show: true,
        words: sessionData.words,
      });
    }
  };

  // Delete Session handler
  const handleDeleteSession = (sessionId: string) => {
    const newSessions = data.sessions.filter((s) => s.id !== sessionId);
    setData((prev) => ({
      ...prev,
      sessions: newSessions,
    }));
  };

  // Update Session handler
  const handleUpdateSession = (updatedSession: WritingSession) => {
    const newSessions = data.sessions.map((s) =>
      s.id === updatedSession.id ? updatedSession : s
    );
    const newBadges = checkBadges(
      newSessions,
      data.books,
      data.projects,
      data.savedMicroStories.length
    );
    setData((prev) => ({
      ...prev,
      sessions: newSessions,
      badges: newBadges,
    }));
  };

  // Update Goal handler
  const handleUpdateGoal = (newGoal: number) => {
    setData((prev) => ({
      ...prev,
      goal: newGoal,
    }));
  };

  // Update Daily Goal handler
  const handleUpdateDailyGoal = (newDailyGoal: number) => {
    setData((prev) => ({
      ...prev,
      dailyGoal: newDailyGoal,
    }));
  };

  // Add Project handler
  const handleAddProject = (project: Project) => {
    setData((prev) => {
      if (prev.projects.some((p) => p.id === project.id)) return prev;
      return {
        ...prev,
        projects: [...prev.projects, project],
      };
    });
  };

  // Add Book handler with atomic project registration and state preservation
  const handleAddBook = (book: Book, project?: Project) => {
    setData((prev) => {
      // 1. Guarantee project exists in data
      let updatedProjects = prev.projects;
      if (project && !updatedProjects.some((p) => p.id === project.id)) {
        updatedProjects = [...updatedProjects, project];
      } else if (book.projectId && !updatedProjects.some((p) => p.id === book.projectId)) {
        updatedProjects = [
          ...updatedProjects,
          {
            id: book.projectId,
            name: `Projeto ${book.title}`,
            description: 'Projeto criado para o livro',
            createdAt: new Date().toISOString(),
          },
        ];
      }

      // 2. Add or update book in state
      const exists = prev.books.some((b) => b.id === book.id);
      const updatedBooks = exists
        ? prev.books.map((b) => (b.id === book.id ? book : b))
        : [...prev.books, book];

      // 3. Re-evaluate badges with newest lists
      const newBadges = checkBadges(
        prev.sessions,
        updatedBooks,
        updatedProjects,
        prev.savedMicroStories.length
      );

      return {
        ...prev,
        projects: updatedProjects,
        books: updatedBooks,
        badges: newBadges,
      };
    });
  };

  // Update Book handler
  const handleUpdateBook = (updatedBook: Book) => {
    setData((prev) => {
      const newBooks = prev.books.map((b) => (b.id === updatedBook.id ? updatedBook : b));
      const newBadges = checkBadges(
        prev.sessions,
        newBooks,
        prev.projects,
        prev.savedMicroStories.length
      );
      return {
        ...prev,
        books: newBooks,
        badges: newBadges,
      };
    });
  };

  // Delete Book handler
  const handleDeleteBook = (bookId: string) => {
    setData((prev) => ({
      ...prev,
      books: prev.books.filter((b) => b.id !== bookId),
      sessions: prev.sessions.filter((s) => s.bookId !== bookId),
    }));
  };

  // Save Micro Story from Game
  const handleSaveMicroStory = (story: SavedMicroStory) => {
    const newStories = [story, ...data.savedMicroStories];
    const newBadges = checkBadges(
      data.sessions,
      data.books,
      data.projects,
      newStories.length
    );
    setData((prev) => ({
      ...prev,
      savedMicroStories: newStories,
      badges: newBadges,
    }));
  };

  // Delete Micro Story
  const handleDeleteMicroStory = (storyId: string) => {
    setData((prev) => ({
      ...prev,
      savedMicroStories: prev.savedMicroStories.filter((s) => s.id !== storyId),
    }));
  };

  // Marketing Handlers
  const handleAddMarketingPost = (postData: Omit<MarketingPost, 'id'>) => {
    const newPost: MarketingPost = {
      ...postData,
      id: `post_${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      marketingPosts: [newPost, ...prev.marketingPosts],
    }));
  };

  const handleUpdateMarketingPost = (updatedPost: MarketingPost) => {
    setData((prev) => ({
      ...prev,
      marketingPosts: prev.marketingPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    }));
  };

  const handleDeleteMarketingPost = (postId: string) => {
    setData((prev) => ({
      ...prev,
      marketingPosts: prev.marketingPosts.filter((p) => p.id !== postId),
    }));
  };

  const handleAddCustomDate = (itemData: Omit<CustomDateItem, 'id'>) => {
    const newItem: CustomDateItem = {
      ...itemData,
      id: `date_${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      customImportantDates: [newItem, ...prev.customImportantDates],
    }));
  };

  const handleDeleteCustomDate = (dateId: string) => {
    setData((prev) => ({
      ...prev,
      customImportantDates: prev.customImportantDates.filter((d) => d.id !== dateId),
    }));
  };

  const handleUpdateConnectedAccounts = (accounts: ConnectedSocialAccounts) => {
    setData((prev) => ({
      ...prev,
      connectedAccounts: accounts,
    }));
  };

  const handleAddAutomation = (automationData: Omit<SocialAutomation, 'id' | 'createdAt'>) => {
    const newAutomation: SocialAutomation = {
      ...automationData,
      id: `auto_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      automations: [newAutomation, ...prev.automations],
    }));
  };

  const handleUpdateAutomation = (updatedAutomation: SocialAutomation) => {
    setData((prev) => ({
      ...prev,
      automations: prev.automations.map((a) => (a.id === updatedAutomation.id ? updatedAutomation : a)),
    }));
  };

  const handleDeleteAutomation = (id: string) => {
    setData((prev) => ({
      ...prev,
      automations: prev.automations.filter((a) => a.id !== id),
    }));
  };

  // Register session directly from Game
  const handleRegisterSessionFromGame = (bookId: string, words: number, notes: string) => {
    const book = data.books.find((b) => b.id === bookId);
    if (!book) return;

    handleAddSession({
      projectId: book.projectId,
      bookId: book.id,
      words,
      date: getTodayDateString(),
      notes,
      source: 'game',
    });
  };

  // Pre-fill quick log for book and switch to dashboard
  const handleQuickLogForBook = (bookId: string, projectId: string) => {
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setGoogleToken(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7fd] dark:bg-[#0d0716] text-[#220d3a] dark:text-[#f7f2fc] transition-colors duration-300">
      {isAuthLoading ? (
        <GlobalSkeletonLoader />
      ) : isImmersiveMode ? (
        <ImmersiveWriter
          books={data.books}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onExit={() => setIsImmersiveMode(false)}
          onSaveSession={(sessionData) => {
            handleAddSession(sessionData);
          }}
          initialText={immersiveInitialText}
          initialBookId={immersiveInitialBookId}
        />
      ) : (
        <>
          {/* Top Navigation */}
          <Navbar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            user={user}
            hasGoogleToken={!!googleToken}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            totalWords={totalWords}
            goal={data.goal}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            onOpenReminder={() => setIsReminderModalOpen(true)}
            isReminderPending={isReminderPending && !isReminderDismissed}
            onOpenImmersive={() => handleOpenImmersive()}
          />

          {/* Main Content Area with fluid responsive padding and overflow protection for devices < 1024px */}
          <main className="flex-1 min-w-0 w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-3.5 sm:px-5 md:px-6 lg:px-8 pt-3 sm:pt-5 lg:pt-6 pb-12 sm:pb-16 overflow-x-hidden transition-all duration-300">
            {currentTab === 'dashboard' && (
              <DashboardView
                goal={data.goal}
                onUpdateGoal={handleUpdateGoal}
                dailyGoal={data.dailyGoal}
                onUpdateDailyGoal={handleUpdateDailyGoal}
                challengeDays={data.challengeDays}
                startDate={data.startDate}
                sessions={data.sessions}
                projects={data.projects}
                books={data.books}
                badges={data.badges}
                hasGoogleToken={!!googleToken}
                googleToken={googleToken}
                onConnectGoogle={() => setIsAuthModalOpen(true)}
                onAddSession={handleAddSession}
                onDeleteSession={handleDeleteSession}
                onUpdateSession={handleUpdateSession}
                onNavigateToBible={() => setCurrentTab('bible')}
                onNavigateToGame={() => setCurrentTab('game')}
                onNavigateToBadges={() => setCurrentTab('badges')}
                isDarkMode={isDarkMode}
                reminderSettings={reminderSettings}
                isReminderPending={isReminderPending}
                reminderDismissed={isReminderDismissed}
                onDismissReminder={handleDismissReminder}
                onOpenReminderSettings={() => setIsReminderModalOpen(true)}
                onOpenImmersive={() => handleOpenImmersive()}
                onStartWritingWithPrompt={(promptText, bookId) => handleOpenImmersive(promptText, bookId)}
                hasPostedToday={data.marketingPosts.some((p) => p.date === getTodayDateString())}
                onNavigateToMarketing={handleGoToPostNow}
                onOpenStoryModal={() => setIsStoryModalOpen(true)}
              />
            )}

            {currentTab === 'game' && (
              <WordGameView
                books={data.books}
                savedStories={data.savedMicroStories}
                onSaveStory={handleSaveMicroStory}
                onDeleteStory={handleDeleteMicroStory}
                onRegisterSession={handleRegisterSessionFromGame}
                onOpenImmersive={handleOpenImmersive}
              />
            )}

            {currentTab === 'bible' && (
              <BookBibleView
                projects={data.projects}
                books={data.books}
                sessions={data.sessions}
                onAddProject={handleAddProject}
                onAddBook={handleAddBook}
                onUpdateBook={handleUpdateBook}
                onDeleteBook={handleDeleteBook}
                onQuickLogForBook={handleQuickLogForBook}
                googleToken={googleToken}
                onConnectGoogle={() => setIsAuthModalOpen(true)}
                initialTab={bibleInitialTab}
                onOpenExportModal={() => setIsBookBibleExportModalOpen(true)}
              />
            )}

            {currentTab === 'badges' && (
              <div className="space-y-8 animate-in fade-in duration-300 pb-12">
                <BadgesSection
                  badges={data.badges}
                  sessions={data.sessions}
                  books={data.books}
                  projects={data.projects}
                  savedStoriesCount={data.savedMicroStories?.length || 0}
                />
              </div>
            )}

            {currentTab === 'marketing' && (
              <MarketingView
                marketingPosts={data.marketingPosts}
                customDates={data.customImportantDates}
                connectedAccounts={data.connectedAccounts}
                books={data.books}
                googleToken={googleToken}
                onConnectGoogle={() => setIsAuthModalOpen(true)}
                onAddPost={handleAddMarketingPost}
                onUpdatePost={handleUpdateMarketingPost}
                onDeletePost={handleDeleteMarketingPost}
                onAddCustomDate={handleAddCustomDate}
                onDeleteCustomDate={handleDeleteCustomDate}
                onUpdateConnectedAccounts={handleUpdateConnectedAccounts}
                onOpenStoryModal={() => setIsStoryModalOpen(true)}
              />
            )}

            {currentTab === 'automation' && (
              <AutomationView
                automations={data.automations || []}
                marketingPosts={data.marketingPosts}
                books={data.books}
                onAddAutomation={handleAddAutomation}
                onUpdateAutomation={handleUpdateAutomation}
                onDeleteAutomation={handleDeleteAutomation}
              />
            )}

            {currentTab === 'metrics' && (
              <MetricsView
                sessions={data.sessions}
                books={data.books}
                projects={data.projects}
                badges={data.badges}
                goal={data.goal}
                challengeDays={data.challengeDays}
                startDate={data.startDate}
                isDarkMode={isDarkMode}
                onNavigateToBadges={() => setCurrentTab('badges')}
              />
            )}
          </main>

          {/* Footer with Rotating Literary Quote */}
          <footer className="border-t border-[#ebdff2] dark:border-[#2d1b42] bg-white/80 dark:bg-[#160b24]/80 py-8 mt-6 sm:mt-10 text-center text-xs text-[#5c4672]/70 dark:text-[#c4b3d8]/70 transition-colors duration-300">
            <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-3.5 sm:px-5 md:px-6 lg:px-8 space-y-3">
              <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto group">
                <p className="font-serif italic text-[#220d3a] dark:text-[#f7f2fc] text-sm sm:text-base leading-relaxed">
                  “{currentQuote.text}”
                  <span className="block sm:inline sm:ml-2 not-italic text-xs font-semibold text-[#b83280] dark:text-[#f472b6] mt-1 sm:mt-0">
                    — {currentQuote.author}
                  </span>
                </p>
                <button
                  onClick={handleNextQuote}
                  title="Sortear outra frase inspiradora"
                  aria-label="Sortear outra frase"
                  className="p-1.5 text-[#8870a0] hover:text-[#b83280] dark:hover:text-[#2dd4bf] rounded-lg hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] transition-colors cursor-pointer shrink-0 opacity-70 hover:opacity-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-[#8870a0]/70 dark:text-[#9782ad]/70">
                CronosEscrita · Rotina & Metas de Escrita · Transformando ideias, histórias e estudos em palavras concluídas
              </p>
            </div>
          </footer>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(authenticatedUser, token) => {
          setUser(authenticatedUser);
          if (token) {
            setGoogleToken(token);
            setCachedAccessToken(token);
          }
        }}
      />

      {/* Reminder Configuration Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        settings={reminderSettings}
        onSaveSettings={handleSaveReminderSettings}
        wordsToday={wordsToday}
        googleToken={googleToken}
        onConnectGoogle={() => setIsAuthModalOpen(true)}
      />

      {/* Badge Unlock Celebration Notification */}
      <BadgeCelebration
        unlockedBadge={recentlyUnlockedBadge}
        onDismiss={() => setRecentlyUnlockedBadge(null)}
      />

      {/* 500-words Milestone Mini Celebration */}
      {milestoneCelebration && (
        <MilestoneMiniCelebration
          show={milestoneCelebration.show}
          wordCount={milestoneCelebration.words}
          onClose={() => setMilestoneCelebration(null)}
          customTitle={`🎉 Marca de ${milestoneCelebration.words} Palavras Alcançada!`}
          customMessage="Que ritmo espetacular! Uma dose merecida de dopamina para celebrar sua dedicação nesta sessão de escrita."
        />
      )}

      {/* MODAL: LEMBRETE DIÁRIO DE POSTAGEM DE 24H */}
      {showDailySocialReminder && (
        <div
          onClick={handleDismissSocialReminder}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center"
          >
            <button
              onClick={handleDismissSocialReminder}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-[#f6f0fb] dark:hover:bg-[#1f1033] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Megaphone className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                🔔 Lembrete Diário de Social Media!
              </h3>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] mt-1.5 leading-relaxed">
                Mantenha suas redes sociais ativas para engajar seus leitores! Criar constância de marca é o segredo para vender seus livros.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-left space-y-1">
              <span className="text-[10px] font-bold text-[#6c2eb9] dark:text-[#a875ec] uppercase tracking-wider block">
                💡 Sugestão do Calendário para Hoje (Dia {new Date().getDate()}):
              </span>
              <p className="text-xs text-gray-800 dark:text-gray-200 font-bold leading-relaxed">
                {(() => {
                  try {
                    const saved = localStorage.getItem('cronos_editable_suggested_calendar');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      const dayIdx = (new Date().getDate() - 1) % 30;
                      if (parsed && parsed[dayIdx]) {
                        return `${parsed[dayIdx].title} — ${parsed[dayIdx].subject}`;
                      }
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  return data.books.length > 0
                    ? `Fale sobre o protagonista ou trope principal do seu livro "${data.books[0].title}" (${data.books[0].genre})!`
                    : "Apresentação de Autor: Compartilhe uma foto escrevendo e conte sua paixão pela literatura e seus gêneros prediletos.";
                })()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDismissSocialReminder}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#5c4672] dark:text-[#c4b3d8] border border-[#ebdff2] dark:border-[#2d1b42] cursor-pointer"
              >
                Dispensar por 24h
              </button>
              <button
                type="button"
                onClick={handleGoToPostNow}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#b83280] to-[#6c2eb9] hover:opacity-95 text-white text-xs font-bold shadow-md cursor-pointer rounded-xl"
              >
                ✍️ Criar Post Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Gerador de Story Compartilhável */}
      <StoryGeneratorModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        books={data.books}
        sessions={data.sessions}
        goal={data.goal}
        totalWords={totalWords}
        challengeDays={data.challengeDays}
      />

      {/* MODAL: Exportação Editorial da Book Bible */}
      <BookBibleExportModal
        isOpen={isBookBibleExportModalOpen}
        onClose={() => setIsBookBibleExportModalOpen(false)}
        books={data.books}
        projects={data.projects}
      />
    </div>
  );
}
