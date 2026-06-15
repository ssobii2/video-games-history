export type Sfx = 'coin' | 'poweron' | 'correct' | 'wrong' | 'step';

const FILES: Partial<Record<Sfx, string>> = {
  coin: '/sfx/coin.wav',
  poweron: '/sfx/poweron.wav',
  correct: '/sfx/correct.ogg',
  wrong: '/sfx/wrong.wav',
  // 'step' intentionally omitted — silent no-op
};

const VOL: Partial<Record<Sfx, number>> = {
  coin: 0.4,
  poweron: 0.4,
  correct: 0.5,
  wrong: 0.5,
};

export class SfxEngine {
  private base = new Map<Sfx, HTMLAudioElement>();
  private muted: boolean;

  constructor() {
    this.muted = localStorage.getItem('museum-sfx-muted') === '1';
  }

  get isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    localStorage.setItem('museum-sfx-muted', muted ? '1' : '0');
  }

  play(name: Sfx): void {
    if (this.muted) return;
    const src = FILES[name];
    if (!src) return; // silent cue (e.g. 'step')
    let b = this.base.get(name);
    if (!b) {
      b = new Audio(src);
      b.preload = 'auto';
      this.base.set(name, b);
    }
    const node = b.cloneNode(true) as HTMLAudioElement;
    node.volume = VOL[name] ?? 0.4;
    node.play().catch(() => {});
  }
}
