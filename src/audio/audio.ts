/**
 * Original sound effects, synthesised with the Web Audio API so no audio files are shipped.
 * The audio context is created only after the first user gesture (FR-045).
 */

export type Effect =
  | 'hop'
  | 'death'
  | 'bay'
  | 'bonus'
  | 'levelClear'
  | 'timerWarning'
  | 'gameOver'
  | 'menu';

interface Tone {
  freq: number;
  endFreq?: number;
  durationS: number;
  wave: OscillatorType;
  delayS?: number;
}

const EFFECTS: Record<Effect, Tone[]> = {
  hop: [{ freq: 660, endFreq: 880, durationS: 0.05, wave: 'square' }],
  death: [{ freq: 400, endFreq: 90, durationS: 0.45, wave: 'sawtooth' }],
  bay: [
    { freq: 523, durationS: 0.1, wave: 'triangle' },
    { freq: 784, durationS: 0.14, wave: 'triangle', delayS: 0.1 },
  ],
  bonus: [
    { freq: 659, durationS: 0.1, wave: 'triangle' },
    { freq: 988, durationS: 0.2, wave: 'triangle', delayS: 0.1 },
  ],
  levelClear: [
    { freq: 523, durationS: 0.12, wave: 'triangle' },
    { freq: 659, durationS: 0.12, wave: 'triangle', delayS: 0.12 },
    { freq: 784, durationS: 0.12, wave: 'triangle', delayS: 0.24 },
    { freq: 1047, durationS: 0.3, wave: 'triangle', delayS: 0.36 },
  ],
  timerWarning: [{ freq: 1000, durationS: 0.08, wave: 'square' }],
  gameOver: [
    { freq: 392, durationS: 0.3, wave: 'triangle' },
    { freq: 311, durationS: 0.3, wave: 'triangle', delayS: 0.3 },
    { freq: 233, durationS: 0.6, wave: 'triangle', delayS: 0.6 },
  ],
  menu: [{ freq: 520, durationS: 0.04, wave: 'square' }],
};

export interface SoundSettings {
  effectsVolume: number;
  muted: boolean;
}

export class SoundBoard {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private settings: SoundSettings = { effectsVolume: 0.8, muted: false };

  /** Call from a user gesture. Creates the audio context on first use. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.gain = this.ctx.createGain();
    this.gain.connect(this.ctx.destination);
    this.applyVolume();
  }

  /** The audio context, for music. Null until unlock() has run. */
  context(): AudioContext | null {
    return this.ctx;
  }

  configure(settings: SoundSettings): void {
    this.settings = settings;
    this.applyVolume();
  }

  play(effect: Effect): void {
    if (!this.ctx || !this.gain || this.settings.muted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (const tone of EFFECTS[effect]) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = tone.wave;
      const start = now + (tone.delayS ?? 0);
      osc.frequency.setValueAtTime(tone.freq, start);
      if (tone.endFreq) osc.frequency.linearRampToValueAtTime(tone.endFreq, start + tone.durationS);
      env.gain.setValueAtTime(0.3, start);
      env.gain.exponentialRampToValueAtTime(0.001, start + tone.durationS);
      osc.connect(env).connect(this.gain);
      osc.start(start);
      osc.stop(start + tone.durationS + 0.02);
    }
  }

  private applyVolume(): void {
    if (!this.gain) return;
    this.gain.gain.value = this.settings.muted ? 0 : this.settings.effectsVolume;
  }
}
