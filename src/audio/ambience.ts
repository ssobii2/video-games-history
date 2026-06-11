import type { GalleryTheme } from '../types';

/**
 * Generative era ambience — synthesized live with WebAudio, no audio assets.
 * Each theme is a tiny patch: a base drone/room-tone plus a sparse melodic or
 * textural event layer. Everything routes through one master gain so mute is
 * a single knob, persisted across visits.
 */

const MASTER_LEVEL = 0.14;
const MUTE_KEY = 'museum-ambience-muted';

interface Patch {
  build: (ctx: AudioContext, out: GainNode) => () => void; // returns teardown
}

export class AmbienceEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private teardown: (() => void) | null = null;
  private muted: boolean;

  constructor() {
    this.muted = localStorage.getItem(MUTE_KEY) === '1';
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Idempotent per theme; safe to call from a user-gesture handler only. */
  start(theme: GalleryTheme): void {
    this.stop();
    try {
      this.ctx = new AudioContext();
    } catch {
      return; // no audio support — museum stays silent, never broken
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : MASTER_LEVEL;
    this.master.connect(this.ctx.destination);
    this.teardown = PATCHES[theme].build(this.ctx, this.master);
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    if (this.master && this.ctx) {
      this.master.gain.linearRampToValueAtTime(
        muted ? 0 : MASTER_LEVEL,
        this.ctx.currentTime + 0.4
      );
    }
  }

  stop(): void {
    this.teardown?.();
    this.teardown = null;
    if (this.ctx) {
      void this.ctx.close().catch(() => undefined);
      this.ctx = null;
      this.master = null;
    }
  }
}

// ── Building blocks ───────────────────────────────────────────────────────

function noiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    // Brown-ish noise: integrate white noise for a soft room rumble.
    last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02;
    data[i] = last * 3.5;
  }
  return buf;
}

function noiseSource(ctx: AudioContext, out: AudioNode, level: number, filterHz: number): () => void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterHz;
  const gain = ctx.createGain();
  gain.gain.value = level;
  src.connect(filter).connect(gain).connect(out);
  src.start();
  return () => src.stop();
}

function drone(
  ctx: AudioContext,
  out: AudioNode,
  freqs: number[],
  type: OscillatorType,
  level: number,
  lfoRate = 0.07
): () => void {
  const gain = ctx.createGain();
  gain.gain.value = level;
  gain.connect(out);
  const oscs = freqs.map((f, i) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = f;
    osc.detune.value = i * 4 - 2;
    osc.connect(gain);
    osc.start();
    return osc;
  });
  // Slow breathing
  const lfo = ctx.createOscillator();
  lfo.frequency.value = lfoRate;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = level * 0.35;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start();
  return () => [...oscs, lfo].forEach((o) => o.stop());
}

/** Sparse random event layer: short enveloped tones on an interval. */
function events(
  ctx: AudioContext,
  out: AudioNode,
  opts: {
    everyMs: [number, number];
    freqs: number[];
    type: OscillatorType;
    level: number;
    decay: number;
  }
): () => void {
  let timer = 0;
  let stopped = false;
  const schedule = () => {
    if (stopped) return;
    const [lo, hi] = opts.everyMs;
    timer = window.setTimeout(() => {
      if (stopped) return;
      const osc = ctx.createOscillator();
      osc.type = opts.type;
      osc.frequency.value = opts.freqs[Math.floor(Math.random() * opts.freqs.length)];
      const env = ctx.createGain();
      const t = ctx.currentTime;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(opts.level, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, t + opts.decay);
      osc.connect(env).connect(out);
      osc.start(t);
      osc.stop(t + opts.decay + 0.1);
      schedule();
    }, lo + Math.random() * (hi - lo));
  };
  schedule();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

// ── Era patches ───────────────────────────────────────────────────────────

const PATCHES: Record<GalleryTheme, Patch> = {
  // Dark room hum + distant cabinet blips and zaps.
  arcade: {
    build: (ctx, out) => {
      const stops = [
        noiseSource(ctx, out, 0.5, 220),
        drone(ctx, out, [50, 100], 'sine', 0.3, 0.11), // transformer hum
        events(ctx, out, { everyMs: [1800, 5200], freqs: [880, 1175, 660, 1568], type: 'square', level: 0.05, decay: 0.18 }),
        events(ctx, out, { everyMs: [4000, 9000], freqs: [220, 165], type: 'sawtooth', level: 0.04, decay: 0.5 }),
      ];
      return () => stops.forEach((s) => s());
    },
  },
  // Warm living-room tone + a soft, slow chiptune lullaby.
  eightbit: {
    build: (ctx, out) => {
      const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0, 523.25]; // C major, gentle
      let step = 0;
      const stops = [
        noiseSource(ctx, out, 0.4, 160),
        drone(ctx, out, [98, 196], 'triangle', 0.18, 0.05),
        events(ctx, out, { everyMs: [1100, 1300], freqs: [0], type: 'square', level: 0, decay: 0.1 }),
      ];
      // Deterministic sequence instead of random events
      let stopped = false;
      let timer = 0;
      const playStep = () => {
        if (stopped) return;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = melody[step % melody.length] / 2;
        step++;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.045, t + 0.03);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1200;
        osc.connect(lp).connect(env).connect(out);
        osc.start(t);
        osc.stop(t + 0.8);
        timer = window.setTimeout(playStep, 1400 + (step % 4 === 0 ? 1200 : 0));
      };
      playStep();
      stops.push(() => {
        stopped = true;
        clearTimeout(timer);
      });
      return () => stops.forEach((s) => s());
    },
  },
  // Purple dusk pad — two detuned triangles, slow shimmer.
  sixteenbit: {
    build: (ctx, out) => {
      const stops = [
        noiseSource(ctx, out, 0.3, 300),
        drone(ctx, out, [130.81, 196.0, 261.63], 'triangle', 0.22, 0.06), // Cm-ish pad
        events(ctx, out, { everyMs: [3500, 8000], freqs: [1046.5, 1318.5, 1568], type: 'triangle', level: 0.04, decay: 1.2 }),
      ];
      return () => stops.forEach((s) => s());
    },
  },
  // The eerie one: detuned saw drone, fluorescent buzz, sparse sonar pings.
  threed: {
    build: (ctx, out) => {
      const stops = [
        noiseSource(ctx, out, 0.35, 140),
        drone(ctx, out, [55, 55.7, 110.4], 'sawtooth', 0.12, 0.04),
        drone(ctx, out, [120], 'square', 0.04, 8), // light buzz
        events(ctx, out, { everyMs: [6000, 14000], freqs: [440, 392, 466.16], type: 'sine', level: 0.06, decay: 2.4 }),
      ];
      return () => stops.forEach((s) => s());
    },
  },
  // Showroom AC hush + occasional glassy UI chime.
  hd: {
    build: (ctx, out) => {
      const stops = [
        noiseSource(ctx, out, 0.55, 480),
        drone(ctx, out, [196, 293.66], 'sine', 0.1, 0.05),
        events(ctx, out, { everyMs: [7000, 16000], freqs: [1567.98, 2093], type: 'sine', level: 0.035, decay: 1.6 }),
      ];
      return () => stops.forEach((s) => s());
    },
  },
  // Bright minimal pad, barely there.
  modern: {
    build: (ctx, out) => {
      const stops = [
        noiseSource(ctx, out, 0.3, 600),
        drone(ctx, out, [261.63, 329.63, 392.0], 'sine', 0.12, 0.045),
        events(ctx, out, { everyMs: [9000, 18000], freqs: [2093, 2637], type: 'sine', level: 0.025, decay: 2.0 }),
      ];
      return () => stops.forEach((s) => s());
    },
  },
};
