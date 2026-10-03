import { doc, getDocFromServer, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './auth';
import type { StorageData } from './storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Robust centralized Firestore error handler required by system guidelines.
 * Packages firestore errors into a diagnostic JSON string.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Handled Gracefully:', JSON.stringify(errInfo));
}

/**
 * Test the Firestore connectivity on boot.
 */
export async function testConnection() {
  try {
    // Attempt a silent read from a path to check client connection
    await getDocFromServer(doc(db, 'users', 'connectivity_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection. Client is offline.");
    }
  }
}

// Automatically test connection when imported
testConnection();

/**
 * Saves a consolidated backup of the user's workspace to Firebase Firestore.
 */
export async function saveUserBackup(userId: string, data: StorageData): Promise<void> {
  const path = `users/${userId}/backups/current`;
  try {
    const payload = {
      userId,
      goal: data.goal,
      dailyGoal: data.dailyGoal,
      challengeDays: data.challengeDays,
      startDate: data.startDate,
      booksCount: data.books.length,
      sessionsCount: data.sessions.length,
      updatedAt: new Date().toISOString(),
      rawBooksJson: JSON.stringify(data.books),
      rawSessionsJson: JSON.stringify(data.sessions),
      rawProjectsJson: JSON.stringify(data.projects),
      rawBadgesJson: JSON.stringify(data.badges),
      rawMicroStoriesJson: JSON.stringify(data.savedMicroStories),
      rawMarketingPostsJson: JSON.stringify(data.marketingPosts),
      rawCustomDatesJson: JSON.stringify(data.customImportantDates),
      rawConnectedAccountsJson: JSON.stringify(data.connectedAccounts),
      rawAutomationsJson: JSON.stringify(data.automations),
    };

    await setDoc(doc(db, 'users', userId, 'backups', 'current'), payload);
    console.log(`Cloud backup successfully synced to Firestore for user: ${userId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads a consolidated backup of the user's workspace from Firebase Firestore.
 */
export async function loadUserBackup(userId: string): Promise<StorageData | null> {
  const path = `users/${userId}/backups/current`;
  try {
    const docRef = doc(db, 'users', userId, 'backups', 'current');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const payload = docSnap.data();

    // Parse backup safely
    const parsedBooks = payload.rawBooksJson ? JSON.parse(payload.rawBooksJson) : [];
    const parsedSessions = payload.rawSessionsJson ? JSON.parse(payload.rawSessionsJson) : [];
    const parsedProjects = payload.rawProjectsJson ? JSON.parse(payload.rawProjectsJson) : [];
    const parsedBadges = payload.rawBadgesJson ? JSON.parse(payload.rawBadgesJson) : [];
    const parsedMicroStories = payload.rawMicroStoriesJson ? JSON.parse(payload.rawMicroStoriesJson) : null;
    const parsedMarketingPosts = payload.rawMarketingPostsJson ? JSON.parse(payload.rawMarketingPostsJson) : null;
    const parsedCustomDates = payload.rawCustomDatesJson ? JSON.parse(payload.rawCustomDatesJson) : null;
    const parsedConnectedAccounts = payload.rawConnectedAccountsJson ? JSON.parse(payload.rawConnectedAccountsJson) : null;
    const parsedAutomations = payload.rawAutomationsJson ? JSON.parse(payload.rawAutomationsJson) : null;

    return {
      goal: typeof payload.goal === 'number' ? payload.goal : 50000,
      dailyGoal: typeof payload.dailyGoal === 'number' ? payload.dailyGoal : 1000,
      challengeDays: typeof payload.challengeDays === 'number' ? payload.challengeDays : 30,
      startDate: payload.startDate || new Date().toISOString().split('T')[0],
      projects: parsedProjects,
      books: parsedBooks,
      sessions: parsedSessions,
      badges: parsedBadges,
      savedMicroStories: parsedMicroStories || dataFieldsFallback(data => data.savedMicroStories, []),
      marketingPosts: parsedMarketingPosts || dataFieldsFallback(data => data.marketingPosts, []),
      customImportantDates: parsedCustomDates || dataFieldsFallback(data => data.customImportantDates, []),
      connectedAccounts: parsedConnectedAccounts || dataFieldsFallback(data => data.connectedAccounts, {
        instagram: { connected: false, username: '' },
        facebook: { connected: false, pageName: '' },
        tiktok: { connected: false, username: '' },
      }),
      automations: parsedAutomations || dataFieldsFallback(data => data.automations, []),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Helper to safely extract supplementary properties from localStorage fallback
 * so that we don't lose local-only data when recovering a cloud backup.
 */
function dataFieldsFallback<T>(selector: (d: StorageData) => T, defaultValue: T): T {
  try {
    const raw = localStorage.getItem('cronos_escrita_v3_clean');
    if (raw) {
      const parsed = JSON.parse(raw);
      const val = selector(parsed);
      if (val !== undefined && val !== null) {
        return val;
      }
    }
  } catch {}
  return defaultValue;
}
