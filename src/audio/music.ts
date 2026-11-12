/**
 * Original looping background music, synthesised with the Web Audio API. It loops with no gap by
 * scheduling each beat ahead of time (FR-044). It has its own gain so the music volume is separate
 * from the effects volume.
 */

// A short original phrase, one note per beat, in Hz.
const PHRASE_HZ = [262, 330, 392, 330, 349, 392, 523, 392];
const BEAT_S = 0.25;
const SCHEDULE_AHEAD_S = 0.2;
const TICK_MS = 50;

export class Music {
  private timer: number | null = null;
  private nextTime = 0;
  private beat = 0;
  private gain: GainNode | null = null;

  constructor(private readonly context: () => AudioContext | null) {}

  /** Starts the loop. Safe to call again; it does nothing if the loop is already running. */
  start(volume: number, muted: boolean): void {
    const ctx = this.context();
    if (!ctx || this.timer !== null) return;
    if (!this.gain) {
      this.gain = ctx.createGain();
      this.gain.connect(ctx.destination);
    }
    this.setVolume(volume, muted);
    this.nextTime = ctx.currentTime + 0.05;
    this.beat = 0;
    this.timer = window.setInterval(() => this.schedule(ctx), TICK_MS);
  }

  setVolume(volume: number, muted: boolean): void {
    if (this.gain) this.gain.gain.value = muted ? 0 : volume * 0.15;
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private schedule(ctx: AudioContext): void {
    if (!this.gain) return;
    while (this.nextTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = PHRASE_HZ[this.beat % PHRASE_HZ.length];
      env.gain.setValueAtTime(1, this.nextTime);
      env.gain.exponentialRampToValueAtTime(0.01, this.nextTime + BEAT_S * 0.9);
      osc.connect(env).connect(this.gain);
      osc.start(this.nextTime);
      osc.stop(this.nextTime + BEAT_S);
      this.nextTime += BEAT_S;
      this.beat++;
    }
  }
}
