export type SoundEffect = 'lineClear' | 'tetris' | 'gameOver' | 'levelUp';

const NOTE_FREQUENCIES: Record<SoundEffect, number[]> = {
  lineClear: [523.25],
  tetris: [523.25, 659.25, 783.99, 1046.5],
  gameOver: [220, 196, 174.61],
  levelUp: [523.25, 783.99],
};

const NOTE_DURATION_SEC = 0.09;

export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return null;
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  play(effect: SoundEffect): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    NOTE_FREQUENCIES[effect].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = frequency;

      const startTime = ctx.currentTime + index * NOTE_DURATION_SEC;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + NOTE_DURATION_SEC);

      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + NOTE_DURATION_SEC + 0.02);
    });
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }
}

export const soundManager = new SoundManager();
