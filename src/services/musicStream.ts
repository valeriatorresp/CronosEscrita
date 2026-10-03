/**
 * Background Music Service for Immersive Writer
 * Supports parsing and embedding YouTube (videos & playlists) and Spotify (tracks, playlists, albums).
 */

export type MusicPlatform = 'youtube' | 'spotify' | 'unknown';

export interface ParsedMusicInfo {
  valid: boolean;
  platform: MusicPlatform;
  embedUrl: string;
  rawUrl: string;
  label: string;
  itemType?: 'video' | 'playlist' | 'track' | 'album';
  error?: string;
}

export interface CuratedMusicPreset {
  id: string;
  title: string;
  artistOrChannel: string;
  platform: 'youtube' | 'spotify';
  url: string;
  embedUrl: string;
  category: 'lofi' | 'classical' | 'fantasy' | 'jazz' | 'focus';
  emoji: string;
  description: string;
}

export const CURATED_MUSIC_PRESETS: CuratedMusicPreset[] = [
  {
    id: 'preset-lofi-girl',
    title: 'Lofi Hip Hop para Estudar/Escrever',
    artistOrChannel: 'Lofi Girl',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&enablejsapi=1',
    category: 'lofi',
    emoji: '☕',
    description: 'Batidas suaves e relaxantes para manter o fluxo contínuo de palavras.',
  },
  {
    id: 'preset-peaceful-piano',
    title: 'Peaceful Piano (Piano Suave)',
    artistOrChannel: 'Spotify Editorial',
    platform: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    category: 'classical',
    emoji: '🎹',
    description: 'Melodias acústicas calmas de piano para foco lírico e introspectivo.',
  },
  {
    id: 'preset-deep-focus',
    title: 'Deep Focus (Ondas Ambientais)',
    artistOrChannel: 'Spotify Editorial',
    platform: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    category: 'focus',
    emoji: '🧠',
    description: 'Músicas atmosféricas e sintéticas para imersão sem distração.',
  },
  {
    id: 'preset-fantasy-tavern',
    title: 'Taverna & Fantasia Medieval',
    artistOrChannel: 'Fantasy Music Lab',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=7M73f_R8H9Q',
    embedUrl: 'https://www.youtube-nocookie.com/embed/7M73f_R8H9Q?autoplay=1&enablejsapi=1',
    category: 'fantasy',
    emoji: '⚔️',
    description: 'Perfeito para autores de alta fantasia, romance de época e aventura.',
  },
  {
    id: 'preset-coffee-jazz',
    title: 'Café & Jazz Instrumental Noturno',
    artistOrChannel: 'Smooth Jazz Studio',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    embedUrl: 'https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1&enablejsapi=1',
    category: 'jazz',
    emoji: '🎷',
    description: 'Saxofone e contrabaixo aveludados para capítulos densos ou urbanos.',
  },
];

/**
 * Parses user-provided YouTube or Spotify URL and returns appropriate embed link
 */
export function parseMusicUrl(inputUrl: string): ParsedMusicInfo {
  const trimmed = (inputUrl || '').trim();

  if (!trimmed) {
    return {
      valid: false,
      platform: 'unknown',
      embedUrl: '',
      rawUrl: '',
      label: 'Nenhum link inserido',
      error: 'Cole um link do YouTube ou Spotify',
    };
  }

  // 1. YouTube Detection
  const ytMatch =
    trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([\w-]{11})/i);
  const ytListMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);

  if (ytMatch || ytListMatch || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    const videoId = ytMatch ? ytMatch[1] : null;
    const listId = ytListMatch ? ytListMatch[1] : null;

    if (videoId && listId) {
      return {
        valid: true,
        platform: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?list=${listId}&autoplay=1&enablejsapi=1`,
        rawUrl: trimmed,
        label: 'Vídeo/Playlist do YouTube',
        itemType: 'playlist',
      };
    } else if (videoId) {
      return {
        valid: true,
        platform: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
        rawUrl: trimmed,
        label: 'Vídeo do YouTube',
        itemType: 'video',
      };
    } else if (listId) {
      return {
        valid: true,
        platform: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}&autoplay=1&enablejsapi=1`,
        rawUrl: trimmed,
        label: 'Playlist do YouTube',
        itemType: 'playlist',
      };
    }
  }

  // 2. Spotify Detection
  // Matches: https://open.spotify.com/track/ID or /playlist/ID or /album/ID or /artist/ID or /episode/ID
  const spotifyMatch = trimmed.match(/open\.spotify\.com\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/i);
  const spotifyUriMatch = trimmed.match(/spotify:(track|playlist|album|artist|episode|show):([a-zA-Z0-9]+)/i);

  if (spotifyMatch || spotifyUriMatch) {
    const type = (spotifyMatch ? spotifyMatch[1] : spotifyUriMatch![1]).toLowerCase();
    const id = spotifyMatch ? spotifyMatch[2] : spotifyUriMatch![2];

    const typeLabels: Record<string, string> = {
      track: 'Faixa do Spotify',
      playlist: 'Playlist do Spotify',
      album: 'Álbum do Spotify',
      artist: 'Artista do Spotify',
      episode: 'Episódio do Spotify',
      show: 'Podcast do Spotify',
    };

    return {
      valid: true,
      platform: 'spotify',
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      rawUrl: trimmed,
      label: typeLabels[type] || 'Spotify',
      itemType: (type === 'playlist' ? 'playlist' : type === 'album' ? 'album' : 'track'),
    };
  }

  return {
    valid: false,
    platform: 'unknown',
    embedUrl: '',
    rawUrl: trimmed,
    label: 'Link não reconhecido',
    error: 'Insira um link válido do YouTube (ex: youtube.com/watch?v=...) ou do Spotify (ex: open.spotify.com/...)',
  };
}

const STORAGE_KEY = 'cronos_immersive_bg_music_config';

export interface SavedMusicConfig {
  activeUrl: string;
  presetId?: string;
  customLabel?: string;
  platform: MusicPlatform;
  autoPlayOnEnter: boolean;
  minimized: boolean;
}

export function loadSavedMusicConfig(): SavedMusicConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveMusicConfig(config: SavedMusicConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore localStorage errors
  }
}
