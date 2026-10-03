import type { ReminderSettings } from '../types';
import { getTodayDateString } from './storage';

const REMINDER_STORAGE_KEY = 'cronos_reminder_settings_v1';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  time: '20:00', // 20:00 (8:00 PM) default
  targetDailyWords: 1667,
  browserNotifications: false,
  syncGoogleCalendar: false,
  daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // Todos os dias por padrão (0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb)
};

export const loadReminderSettings = (): ReminderSettings => {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_REMINDER_SETTINGS,
      ...parsed,
      daysOfWeek: Array.isArray(parsed.daysOfWeek) && parsed.daysOfWeek.length > 0
        ? parsed.daysOfWeek
        : DEFAULT_REMINDER_SETTINGS.daysOfWeek,
    };
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
};

export const saveReminderSettings = (settings: ReminderSettings): void => {
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Erro ao salvar configurações de lembrete:', e);
  }
};

export const checkShouldNotifyToday = (
  settings: ReminderSettings,
  wordsToday: number
): boolean => {
  if (!settings.enabled) return false;

  // Se houver filtro de dias da semana configurado, verificar se hoje é um dos dias
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 (Domingo) a 6 (Sábado)

  if (settings.daysOfWeek && settings.daysOfWeek.length > 0) {
    if (!settings.daysOfWeek.includes(currentDayOfWeek)) {
      return false; // Hoje não é um dia configurado para receber notificações
    }
  }

  // Se já escreveu palavras hoje, não precisa alertar!
  if (wordsToday > 0) return false;

  // Check current time against set time
  const [targetH, targetM] = settings.time.split(':').map((v) => parseInt(v, 10) || 0);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const scheduledMinutes = targetH * 60 + targetM;

  // Has the stipulated hour arrived or passed?
  return currentMinutes >= scheduledMinutes;
};

export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
};

export const sendBrowserNotification = (title: string, body: string): void => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Falha ao emitir notificação nativa:', e);
    }
  }
};
