import React, { useState, useEffect } from 'react';
import {
  Music,
  ExternalLink,
  X,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Headphones,
  Sliders,
} from 'lucide-react';
import {
  CURATED_MUSIC_PRESETS,
  parseMusicUrl,
  ParsedMusicInfo,
  loadSavedMusicConfig,
  saveMusicConfig,
  CuratedMusicPreset,
} from '../services/musicStream';

// High-fidelity branded SVGs for YouTube and Spotify
export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path
      fill="#FF0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
    />
  </svg>
);

export const SpotifyIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path
      fill="#1ED760"
      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.308c-.216.353-.674.464-1.026.248-2.812-1.718-6.35-2.107-10.518-1.155-.403.092-.806-.157-.898-.56-.092-.403.158-.806.56-.898 4.567-1.042 8.484-.598 11.634 1.339.352.216.464.674.248 1.026zm1.47-3.265c-.272.443-.852.584-1.295.312-3.218-1.978-8.125-2.55-11.933-1.393-.497.15-1.028-.135-1.18-.632-.15-.497.135-1.028.632-1.18 4.356-1.322 9.775-.682 13.464 1.583.443.272.584.852.312 1.295zm.126-3.41c-3.858-2.29-10.222-2.502-13.88-1.392-.591.179-1.218-.16-1.397-.751-.18-.591.16-1.218.751-1.397 4.212-1.278 11.242-1.03 15.688 1.61.531.314.704 1.002.39 1.533-.314.53-.999.704-1.552.397z"
    />
  </svg>
);

interface ImmersiveMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const ImmersiveMusicPlayer: React.FC<ImmersiveMusicPlayerProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  // Current active music state
  const [activeMusic, setActiveMusic] = useState<ParsedMusicInfo | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [previewInfo, setPreviewInfo] = useState<ParsedMusicInfo | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [rememberPreference, setRememberPreference] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved preference on mount
  useEffect(() => {
    const saved = loadSavedMusicConfig();
    if (saved && saved.activeUrl) {
      const parsed = parseMusicUrl(saved.activeUrl);
      if (parsed.valid) {
        setActiveMusic(parsed);
        setInputUrl(saved.activeUrl);
        if (saved.presetId) {
          setActivePresetId(saved.presetId);
        }
        setIsMinimized(saved.minimized ?? false);
      }
    }
  }, []);

  // Update preview whenever input URL changes
  useEffect(() => {
    if (inputUrl.trim()) {
      const parsed = parseMusicUrl(inputUrl);
      setPreviewInfo(parsed);
    } else {
      setPreviewInfo(null);
    }
  }, [inputUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Play a custom URL
  const handlePlayCustomUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseMusicUrl(inputUrl);
    if (!parsed.valid) {
      showToast('⚠️ Link inválido. Cole uma URL do YouTube ou Spotify.');
      return;
    }

    setActiveMusic(parsed);
    setActivePresetId(null);
    setIsMinimized(false);

    if (rememberPreference) {
      saveMusicConfig({
        activeUrl: parsed.rawUrl,
        platform: parsed.platform,
        autoPlayOnEnter: true,
        minimized: false,
      });
    }

    showToast(`🎵 Música conectada com sucesso (${parsed.label})!`);
    onClose();
  };

  // Play a preset
  const handleSelectPreset = (preset: CuratedMusicPreset) => {
    const parsed = parseMusicUrl(preset.url);
    setActiveMusic(parsed);
    setActivePresetId(preset.id);
    setInputUrl(preset.url);
    setIsMinimized(false);

    if (rememberPreference) {
      saveMusicConfig({
        activeUrl: preset.url,
        presetId: preset.id,
        customLabel: preset.title,
        platform: preset.platform,
        autoPlayOnEnter: true,
        minimized: false,
      });
    }

    showToast(`🎶 Tocando: ${preset.title}`);
    onClose();
  };

  // Stop music
  const handleStopMusic = () => {
    setActiveMusic(null);
    setActivePresetId(null);
    try {
      localStorage.removeItem('cronos_immersive_bg_music_config');
    } catch {
      // Ignore
    }
    showToast('Música desativada.');
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#220d3a] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-purple-400/30 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Active Player Widget (Mini Dock in Bottom-Right Corner) */}
      {activeMusic && activeMusic.valid && (
        <div
          className={`fixed bottom-14 right-4 z-40 transition-all duration-300 ${
            isMinimized
              ? 'w-auto max-w-xs'
              : activeMusic.platform === 'spotify'
              ? 'w-80 sm:w-96'
              : 'w-72 sm:w-88'
          }`}
        >
          <div className="bg-white/95 dark:bg-[#160b24]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#ebdff2] dark:border-[#2d1b42] overflow-hidden transition-all duration-200">
            {/* Header bar of floating dock */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#f8f3fc] dark:bg-[#1f1033] border-b border-[#ebdff2] dark:border-[#2d1b42]">
              <div
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex items-center gap-2 cursor-pointer select-none group min-w-0"
                title={isMinimized ? 'Expandir reprodutor de música' : 'Minimizar reprodutor'}
              >
                {activeMusic.platform === 'youtube' ? (
                  <YouTubeIcon className="w-4 h-4 shrink-0" />
                ) : (
                  <SpotifyIcon className="w-4 h-4 shrink-0" />
                )}
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#220d3a] dark:text-[#f7f2fc] truncate max-w-[140px] sm:max-w-[180px]">
                    {activePresetId
                      ? CURATED_MUSIC_PRESETS.find((p) => p.id === activePresetId)?.title
                      : activeMusic.label}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1ED760] animate-pulse shrink-0" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {/* Change track / open settings */}
                <button
                  onClick={onOpen}
                  title="Trocar música ou ajustar link"
                  className="p-1 text-[#8870a0] hover:text-[#6c2eb9] dark:hover:text-[#a875ec] rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>

                {/* Minimize/Maximize toggle */}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expandir player' : 'Minimizar para não distrair'}
                  className="p-1 text-[#8870a0] hover:text-[#220d3a] dark:hover:text-white rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Close/Stop music */}
                <button
                  onClick={handleStopMusic}
                  title="Parar música de fundo"
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe Player (Only shown if NOT minimized) */}
            {!isMinimized && (
              <div className="relative bg-black/5 dark:bg-black/20 p-2">
                {activeMusic.platform === 'youtube' ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={activeMusic.embedUrl}
                      title="YouTube Background Music"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="w-full rounded-xl overflow-hidden shadow-inner">
                    <iframe
                      src={activeMusic.embedUrl}
                      title="Spotify Background Music"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="w-full border-0"
                      style={{ height: '152px' }}
                    />
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between px-1 text-[10px] text-[#8870a0] dark:text-[#9782ad]">
                  <span>💡 Você pode minimizar este mini player para escrever sem distrações.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Music Modal / Configuration Drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-[#160b24] border border-[#ebdff2] dark:border-[#2d1b42] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between bg-[#faf7fd] dark:bg-[#1f1033]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-[#6c2eb9] to-[#b83280] flex items-center justify-center text-white shadow-md">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-display font-bold text-base text-[#220d3a] dark:text-[#f7f2fc] leading-tight">
                    Música de Fundo para Escrita
                  </h3>
                  <p className="text-xs text-[#8870a0] dark:text-[#9782ad]">
                    Conecte trilhas do YouTube ou Spotify para entrar em estado de hiperfoco
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#8870a0] hover:text-[#220d3a] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Section 1: Custom URL Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-1.5">
                    <span>🔗 Inserir Link do YouTube ou Spotify</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8870a0]">
                    <span className="flex items-center gap-1">
                      <YouTubeIcon className="w-3.5 h-3.5" /> YouTube
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <SpotifyIcon className="w-3.5 h-3.5" /> Spotify
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePlayCustomUrl} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Cole o link (ex: youtube.com/watch?v=... ou spotify.com/playlist/...)"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#ebdff2] dark:border-[#2d1b42] bg-[#faf7fd] dark:bg-[#12081f] text-[#220d3a] dark:text-[#f7f2fc] placeholder-[#8870a0]/60 focus:outline-hidden focus:ring-2 focus:ring-[#6c2eb9]/30"
                      />
                      {inputUrl && (
                        <button
                          type="button"
                          onClick={() => setInputUrl('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8870a0] hover:text-[#220d3a] p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!inputUrl.trim() || Boolean(previewInfo && !previewInfo.valid)}
                      className="px-4 py-2.5 rounded-xl bg-linear-to-r from-[#6c2eb9] to-[#b83280] hover:from-[#5b24a0] hover:to-[#9f286e] text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Tocar Música</span>
                    </button>
                  </div>

                  {/* Realtime link parser badge */}
                  {previewInfo && (
                    <div
                      className={`text-xs px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${
                        previewInfo.valid
                          ? previewInfo.platform === 'youtube'
                            ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300'
                            : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {previewInfo.valid ? (
                        <>
                          {previewInfo.platform === 'youtube' ? (
                            <YouTubeIcon className="w-4 h-4 shrink-0" />
                          ) : (
                            <SpotifyIcon className="w-4 h-4 shrink-0" />
                          )}
                          <span className="font-semibold">{previewInfo.label} detectado!</span>
                          <span className="text-[11px] opacity-80 truncate">Pronto para reproduzir.</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>{previewInfo.error}</span>
                        </>
                      )}
                    </div>
                  )}
                </form>

                {/* Preference checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#5c4672] dark:text-[#c4b3d8]">
                  <input
                    type="checkbox"
                    checked={rememberPreference}
                    onChange={(e) => setRememberPreference(e.target.checked)}
                    className="rounded border-[#ebdff2] text-[#6c2eb9] focus:ring-[#6c2eb9] cursor-pointer"
                  />
                  <span>Lembrar esta música nas próximas sessões de escrita</span>
                </label>
              </div>

              {/* Section 2: Curated Presets for Quick Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ou escolha uma Trilha Curada (1-Clique)</span>
                  </h4>
                  <span className="text-[10px] text-[#8870a0] font-semibold">Testadas para imersão</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CURATED_MUSIC_PRESETS.map((preset) => {
                    const isCurrent = activePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                          isCurrent
                            ? 'bg-purple-50 dark:bg-[#2a1347] border-[#6c2eb9] shadow-sm'
                            : 'bg-[#faf7fd] dark:bg-[#190c2a] border-[#ebdff2] dark:border-[#2d1b42] hover:border-[#6c2eb9]/50 hover:bg-white dark:hover:bg-[#201036]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl p-1 rounded-xl bg-white dark:bg-black/20 shadow-xs shrink-0">
                            {preset.emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {preset.platform === 'youtube' ? (
                                <YouTubeIcon className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <SpotifyIcon className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-[#220d3a] dark:text-[#f7f2fc] truncate">
                                {preset.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8870a0] dark:text-[#9782ad] mt-0.5 line-clamp-2">
                              {preset.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#ebdff2]/60 dark:border-[#2d1b42]/60 flex items-center justify-between text-[10px]">
                          <span className="text-[#6c2eb9] dark:text-[#a875ec] font-semibold">
                            {preset.artistOrChannel}
                          </span>
                          {isCurrent ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <Check className="w-3 h-3" /> Tocando Agora
                            </span>
                          ) : (
                            <span className="text-[#8870a0] group-hover:text-[#6c2eb9] font-medium flex items-center gap-0.5">
                              Tocar <Play className="w-2.5 h-2.5 fill-current" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informative Tip */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[11px] space-y-1">
                  <p className="font-semibold">Como funciona a reprodução?</p>
                  <p className="opacity-90 leading-relaxed">
                    O player é executado em um mini-dock flutuante no canto da tela. Você pode minimizá-lo a qualquer
                    momento com o botão <Minimize2 className="w-2.5 h-2.5 inline" /> para que fique apenas uma pílula
                    discreta enquanto você digita no modo imersivo.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#ebdff2] dark:border-[#2d1b42] flex items-center justify-between bg-[#faf7fd] dark:bg-[#1f1033]">
              {activeMusic ? (
                <button
                  onClick={handleStopMusic}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Desativar Música Atual</span>
                </button>
              ) : (
                <span className="text-xs text-[#8870a0]">Nenhuma música ativa</span>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#6c2eb9] hover:bg-[#5b24a0] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
