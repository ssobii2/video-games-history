import type { GalleryTheme } from '../types';

export type Track = GalleryTheme | 'lobby';

const MASTER = 0.4;
const MUTE_KEY = 'museum-ambience-muted';
const FADE_MS = 900;

export class MusicEngine {
  private audios = new Map<Track, HTMLAudioElement>();
  private current: Track | null = null;
  private muted: boolean;
  private fadeRaf = 0;

  constructor() {
    this.muted = localStorage.getItem(MUTE_KEY) === '1';
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Lazily create a looping <audio> for a track. */
  private el(track: Track): HTMLAudioElement {
    let audio = this.audios.get(track);
    if (!audio) {
      audio = new Audio('/music/' + track + '.mp3');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.addEventListener('error', () => {
        // no-op: never break if the file is missing
      });
      this.audios.set(track, audio);
    }
    return audio;
  }

  /** Crossfade to `track`. No-op if already current. */
  play(track: Track): void {
    if (track === this.current) {
      // Already the active track — but if autoplay was blocked earlier the
      // element is paused; this call (often a fresh user gesture) lets us
      // actually start it.
      const a = this.audios.get(track);
      if (a && a.paused && !this.muted) {
        const r = a.play();
        if (r && typeof r.catch === 'function') r.catch(() => {});
      }
      return;
    }

    const prev = this.current;
    this.current = track;

    const next = this.el(track);
    const target = this.muted ? 0 : MASTER;

    const p = next.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});

    // Cancel any in-flight fade
    if (this.fadeRaf !== 0) {
      cancelAnimationFrame(this.fadeRaf);
      this.fadeRaf = 0;
    }

    const prevEl = prev !== null ? this.audios.get(prev) ?? null : null;
    const startNextVol = next.volume;
    const startPrevVol = prevEl ? prevEl.volume : 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / FADE_MS, 1);

      // Ease in/out (smoothstep)
      const ease = t * t * (3 - 2 * t);

      next.volume = Math.min(1, Math.max(0, startNextVol + (target - startNextVol) * ease));

      if (prevEl) {
        const v = Math.max(0, startPrevVol * (1 - ease));
        prevEl.volume = v;
        if (v < 0.001) {
          prevEl.pause();
          prevEl.volume = 0;
        }
      }

      if (t < 1) {
        this.fadeRaf = requestAnimationFrame(tick);
      } else {
        this.fadeRaf = 0;
      }
    };

    this.fadeRaf = requestAnimationFrame(tick);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');

    if (this.current === null) return;
    const audio = this.audios.get(this.current);
    if (!audio) return;

    // Unmuting: make sure the track is actually playing (it may have been
    // created while muted and never started).
    if (!muted && audio.paused) {
      const r = audio.play();
      if (r && typeof r.catch === 'function') r.catch(() => {});
    }

    // Cancel in-flight fade before adjusting
    if (this.fadeRaf !== 0) {
      cancelAnimationFrame(this.fadeRaf);
      this.fadeRaf = 0;
    }

    const startVol = audio.volume;
    const targetVol = muted ? 0 : MASTER;
    const startTime = performance.now();
    const MUTE_FADE = 300;

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / MUTE_FADE, 1);
      audio.volume = Math.min(1, Math.max(0, startVol + (targetVol - startVol) * t));
      if (t < 1) {
        this.fadeRaf = requestAnimationFrame(tick);
      } else {
        this.fadeRaf = 0;
      }
    };

    this.fadeRaf = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.fadeRaf !== 0) {
      cancelAnimationFrame(this.fadeRaf);
      this.fadeRaf = 0;
    }
    this.audios.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.current = null;
  }
}
