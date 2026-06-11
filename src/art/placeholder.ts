import type { Era, MuseumItem } from '../types';

/**
 * Stylized, era-appropriate placeholder art for items whose Wikipedia imagery
 * is restricted or unavailable. Deterministic per item (seeded by slug) so the
 * same piece always wears the same art, in the DOM and in WebGL textures alike.
 */

/** mulberry32 — tiny seeded PRNG so art is stable across renders. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function drawPlaceholder(
  canvas: HTMLCanvasElement,
  item: MuseumItem,
  era: Era,
  width: number,
  height: number
): void {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rand = prng(hashString(item.slug));
  const { bg, primary, accent, text } = era.palette;

  // Base wash
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, shade(bg, 1.8));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  switch (era.galleryTheme) {
    case 'arcade':
      drawArcadePattern(ctx, width, height, primary, accent, rand);
      break;
    case 'eightbit':
      drawPixelMosaic(ctx, width, height, primary, accent, rand, 10);
      break;
    case 'sixteenbit':
      drawPixelMosaic(ctx, width, height, primary, accent, rand, 16);
      drawDiagonals(ctx, width, height, accent, rand);
      break;
    case 'threed':
      drawLowPoly(ctx, width, height, primary, accent, rand);
      break;
    case 'hd':
      drawGlowOrbs(ctx, width, height, primary, accent, rand);
      break;
    case 'modern':
      drawMinimalGeo(ctx, width, height, primary, accent, rand);
      break;
  }
  ctx.restore();

  // Vignette to seat the typography
  const vin = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.2,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  vin.addColorStop(0, 'rgba(0,0,0,0)');
  vin.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vin;
  ctx.fillRect(0, 0, width, height);

  // Title block
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = text;
  const fontStack =
    era.galleryTheme === 'arcade' || era.galleryTheme === 'eightbit'
      ? '"Press Start 2P", monospace'
      : era.galleryTheme === 'sixteenbit'
        ? '"VT323", monospace'
        : era.galleryTheme === 'threed'
          ? '"Orbitron", sans-serif'
          : '"Inter", sans-serif';

  const lines = wrapTitle(item.name);
  const base = Math.min(width, height);
  const size = clampFont(base / (era.galleryTheme === 'eightbit' || era.galleryTheme === 'arcade' ? 11 : 8), lines);
  ctx.font = `700 ${size}px ${fontStack}`;
  ctx.shadowColor = primary;
  ctx.shadowBlur = era.galleryTheme === 'arcade' ? 18 : 6;
  const lineH = size * 1.35;
  const startY = height / 2 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((line, i) => ctx.fillText(line, width / 2, startY + i * lineH, width * 0.9));

  // Footer: kind + year
  ctx.shadowBlur = 0;
  ctx.font = `500 ${Math.max(10, base / 22)}px "VT323", monospace`;
  ctx.fillStyle = accent;
  ctx.fillText(
    `${item.kind === 'console' ? 'HARDWARE' : 'SOFTWARE'} · ${item.year}`,
    width / 2,
    height - Math.max(14, base / 14)
  );
}

/** Canvas element factory for non-React consumers (Three.js textures). */
export function placeholderCanvas(item: MuseumItem, era: Era, w = 512, h = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  drawPlaceholder(canvas, item, era, w, h);
  return canvas;
}

function clampFont(px: number, lines: string[]): number {
  const longest = Math.max(...lines.map((l) => l.length), 1);
  return Math.max(9, Math.min(px, (px * 14) / longest));
}

function wrapTitle(name: string): string[] {
  const words = name.split(' ');
  if (words.length === 1) return words;
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 14 && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
  const b = Math.min(255, Math.round((n & 255) * factor));
  return `rgb(${r},${g},${b})`;
}

// ── Era pattern painters ──────────────────────────────────────────────────

function drawArcadePattern(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  primary: string, accent: string, rand: () => number
): void {
  // Vector-monitor starburst lines
  ctx.globalAlpha = 0.5;
  const cx = w * (0.3 + rand() * 0.4);
  const cy = h * (0.25 + rand() * 0.3);
  for (let i = 0; i < 14; i++) {
    const ang = rand() * Math.PI * 2;
    const len = (0.2 + rand() * 0.5) * Math.max(w, h);
    ctx.strokeStyle = i % 2 ? primary : accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
    ctx.stroke();
  }
  // Perspective neon grid floor
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = primary;
  const horizon = h * 0.62;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    ctx.lineWidth = 0.5 + t * 1.6;
    ctx.beginPath();
    const y = horizon + (h - horizon) * t * t;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = -6; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * (w / 14), horizon);
    ctx.lineTo(w / 2 + i * (w / 3.2), h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawPixelMosaic(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  primary: string, accent: string, rand: () => number, grid: number
): void {
  const cell = Math.ceil(Math.max(w, h) / grid);
  ctx.globalAlpha = 0.5;
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      const r = rand();
      if (r > 0.82) ctx.fillStyle = primary;
      else if (r > 0.7) ctx.fillStyle = accent;
      else continue;
      ctx.globalAlpha = 0.2 + rand() * 0.5;
      ctx.fillRect(x, y, cell - 1, cell - 1);
    }
  }
  ctx.globalAlpha = 1;
}

function drawDiagonals(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  accent: string, rand: () => number
): void {
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(3, w / 40);
  const step = w / 6;
  const offset = rand() * step;
  for (let x = -h; x < w + h; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x + offset + h * 0.6, h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawLowPoly(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  primary: string, accent: string, rand: () => number
): void {
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 12; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const s = (0.1 + rand() * 0.25) * Math.max(w, h);
    ctx.fillStyle = i % 3 === 0 ? accent : primary;
    ctx.globalAlpha = 0.12 + rand() * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s * (rand() - 0.3), y + s * (0.4 + rand() * 0.6));
    ctx.lineTo(x + s * (0.5 + rand() * 0.5), y + s * (rand() * 0.4));
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGlowOrbs(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  primary: string, accent: string, rand: () => number
): void {
  for (let i = 0; i < 5; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = (0.15 + rand() * 0.3) * Math.max(w, h);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, i % 2 ? `${primary}55` : `${accent}40`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawMinimalGeo(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  primary: string, accent: string, rand: () => number
): void {
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = primary;
  ctx.lineWidth = Math.max(2, w / 90);
  const r = Math.min(w, h) * (0.28 + rand() * 0.12);
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.46, r, Math.PI * (0.2 + rand() * 0.3), Math.PI * (1.4 + rand() * 0.5));
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.46, r * 0.7, Math.PI * rand(), Math.PI * (1 + rand()));
  ctx.stroke();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = accent;
  ctx.fillRect(w * 0.1, h * 0.78, w * 0.8, Math.max(2, h / 110));
  ctx.globalAlpha = 1;
}
