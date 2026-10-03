/**
 * Ambient Soundscapes Engine using the Web Audio API.
 * 100% client-side, zero external assets or network requests, works offline.
 */

export type SoundscapeType = 'none' | 'rain' | 'fireplace' | 'library' | 'waves';

export interface SoundscapeOption {
  id: SoundscapeType;
  label: string;
  emoji: string;
  description: string;
}

export const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  { id: 'none', label: 'Silêncio', emoji: '🔇', description: 'Sem som ambiente' },
  { id: 'rain', label: 'Chuva na Janela', emoji: '🌧️', description: 'Gotas suaves e chuva relaxante' },
  { id: 'fireplace', label: 'Lareira Quentinha', emoji: '🪵', description: 'Crepitar aconchegante de lenha' },
  { id: 'library', label: 'Biblioteca Secreta', emoji: '📚', description: 'Ruído suave de ar e calmaria' },
  { id: 'waves', label: 'Ondas Noturnas', emoji: '🌊', description: 'Ondas suaves quebrando na costa' },
];

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect: () => void }[] = [];
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): SoundscapeType {
    return this.currentType;
  }

  public stop() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];
    this.currentType = 'none';
  }

  public play(type: SoundscapeType) {
    this.stop();
    if (type === 'none') return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentType = type;

    switch (type) {
      case 'rain':
        this.startRain();
        break;
      case 'fireplace':
        this.startFireplace();
        break;
      case 'library':
        this.startLibrary();
        break;
      case 'waves':
        this.startWaves();
        break;
    }
  }

  /**
   * Helper to create a noise buffer
   */
  private createNoiseBuffer(durationSeconds = 5): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    // Pink noise approximation
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  private startRain() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer(6);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to sound like rain on glass / roof
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    this.activeNodes.push(source, filter, gain);
  }

  private startFireplace() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer(5);

    // Deep low rumble
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(240, this.ctx.currentTime);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

    source.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);

    source.start();
    this.activeNodes.push(source, lowpass, rumbleGain);

    // Subtle random crackles (intermittent bursts)
    const crackleInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentType !== 'fireplace') {
        clearInterval(crackleInterval);
        return;
      }
      try {
        const osc = this.ctx.createOscillator();
        const crackleGain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120 + Math.random() * 800, this.ctx.currentTime);
        crackleGain.gain.setValueAtTime(0.04 + Math.random() * 0.05, this.ctx.currentTime);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

        osc.connect(crackleGain);
        crackleGain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      } catch {}
    }, 180);

    this.activeNodes.push({
      disconnect: () => clearInterval(crackleInterval),
    });
  }

  private startLibrary() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer(5);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Very quiet gentle low air/room tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    this.activeNodes.push(source, filter, gain);
  }

  private startWaves() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer(6);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    // LFO for periodic wave swell
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 seconds period per wave

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    lfo.start();
    this.activeNodes.push(source, filter, gain, lfo, lfoGain);
  }
}

export const soundscapeEngine = new SoundscapeEngine();
