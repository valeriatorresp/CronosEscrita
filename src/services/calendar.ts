import type { GoogleCalendarEvent } from '../types';

export const listCalendarWritingEvents = async (
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> => {
  try {
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('singleEvents', 'true');
    if (timeMin) url.searchParams.set('timeMin', timeMin);
    if (timeMax) url.searchParams.set('timeMax', timeMax);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Falha ao buscar eventos do Google Calendar');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Erro na listagem de eventos do Google Calendar:', error);
    throw error;
  }
};

export const createCalendarWritingEvent = async (
  accessToken: string,
  params: {
    title: string;
    bookTitle: string;
    words: number;
    date: string; // YYYY-MM-DD
    durationMinutes?: number;
    notes?: string;
  }
): Promise<GoogleCalendarEvent> => {
  const startTime = new Date(`${params.date}T19:00:00`);
  const duration = params.durationMinutes && params.durationMinutes > 0 ? params.durationMinutes : 45;
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

  const eventPayload = {
    summary: `✍️ Sessão de Escrita: ${params.bookTitle} (+${params.words} palavras)`,
    description: `Sessão registrada no CronosEscrita.\nLivro: ${params.bookTitle}\nPalavras: ${params.words}\nDuração: ${duration} min\n${params.notes ? `Notas: ${params.notes}` : ''}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    },
    colorId: '3', // Grape / Violet color in Google Calendar
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Falha ao criar evento no Google Calendar');
  }

  return response.json();
};

export const createDailyWritingReminder = async (
  accessToken: string,
  targetWords: number,
  timeString: string = '20:00',
  daysOfWeek: number[] = [0, 1, 2, 3, 4, 5, 6]
): Promise<GoogleCalendarEvent> => {
  const now = new Date();
  const [hours, minutes] = timeString.split(':').map((v) => parseInt(v, 10) || 0);
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

  // Mapear dias para o padrão iCalendar RRULE (SU, MO, TU, WE, TH, FR, SA)
  const dayCodeMap: Record<number, string> = {
    0: 'SU',
    1: 'MO',
    2: 'TU',
    3: 'WE',
    4: 'TH',
    5: 'FR',
    6: 'SA',
  };

  const selectedCodes = daysOfWeek.map((d) => dayCodeMap[d]).filter(Boolean);
  const recurrenceRule =
    selectedCodes.length === 7 || selectedCodes.length === 0
      ? 'RRULE:FREQ=DAILY'
      : `RRULE:FREQ=WEEKLY;BYDAY=${selectedCodes.join(',')}`;

  const eventPayload = {
    summary: `✍️ Lembrete de Escrita: Meta do Dia (~${Math.ceil(targetWords / 30)} palavras)`,
    description: `Hora de avançar no seu livro! Você reservou este momento para escrever no CronosEscrita.\nNão deixe o dia terminar com a página em branco.`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    },
    recurrence: [recurrenceRule],
    colorId: '4', // Flamingo / Pink in Google Calendar
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'email', minutes: 60 },
      ],
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Falha ao agendar lembrete no Google Calendar');
  }

  return response.json();
};
