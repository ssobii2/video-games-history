import type { Era, MuseumItem } from '../types';

/**
 * World-space layout for the infinite canvas.
 * X axis is time: one year = YEAR_W px at scale 1. Eras sit on two lanes so
 * overlapping generations (SNES vs Genesis while PlayStation arrives) are
 * visually parallel rather than stacked fiction.
 */

export const YEAR_W = 160;
export const EPOCH = 1960;

/**
 * Era title font size — bounded by block width AND name length so the widest
 * face (Press Start 2P, ~1em/glyph) never clips. Shared by the layout (to
 * reserve header space) and the component (to render the title).
 */
export function titleSizeFor(width: number, name: string): number {
  return Math.max(56, Math.min(width / 9, (width * 0.82) / (name.length * 0.92), 300));
}

/**
 * Vertical space the rendered header actually occupies above the lanes.
 *
 * Pieces (matching CSS; .era-title-row is now flex-direction:column):
 *   era-head padding-top              34
 *   title line (titleSizeFor * 0.95 line-height, use full for safety)
 *   era-years line (64px * 1.25)      80
 *   tagline (margin-top 18 + 46*1.3)  78
 *   description (margin-top 18 + 3 * 36*1.45 ≈ 3*52.2) = 18+157 = 175
 *   CTA (margin-top 22 + 30px font + 32px v-padding) = 84
 *   slack                             40
 *
 * Constant chrome = 34+80+78+175+84+40 = 491 → rounded to HEADER_CHROME.
 * Budget is kept in lockstep with .era-desc (3-line clamp) in styles.css.
 */
const HEADER_CHROME = 491;
export function headerHeightFor(width: number, name: string): number {
  return Math.round(titleSizeFor(width, name) + HEADER_CHROME);
}
export const LANE_H = 58;
export const GAME_CARD_W = 150;
export const GAME_CARD_H = 128;
export const GAME_STRIP_PAD = 24;
export const GAME_ROWS = 2;
export const ROW_GAP = 170;
export const WORLD_TOP = 120;

export const xOfYear = (year: number): number => (year - EPOCH) * YEAR_W;

export interface ConsoleLane {
  item: MuseumItem;
  /** y offset within the era block */
  top: number;
  /** x offset within the era block */
  left: number;
  width: number;
}

export interface GameSpot {
  item: MuseumItem;
  top: number;
  left: number;
}

export interface EraBlock {
  era: Era;
  x: number;
  y: number;
  width: number;
  height: number;
  consoles: ConsoleLane[];
  games: GameSpot[];
}

export interface WorldLayout {
  blocks: EraBlock[];
  width: number;
  height: number;
  minYear: number;
  maxYear: number;
}

export function computeLayout(eras: Era[], items: MuseumItem[]): WorldLayout {
  const blocks: EraBlock[] = [];

  // First pass: measure each era block.
  const measured = eras.map((era) => {
    const consoles = items
      .filter((i) => i.kind === 'console' && i.era === era.slug)
      .sort((a, b) => a.year - b.year);
    const games = items
      .filter((i) => i.kind === 'game' && i.era === era.slug)
      .sort((a, b) => a.year - b.year);
    const width = xOfYear(era.years[1] + 1) - xOfYear(era.years[0]);
    const headerH = headerHeightFor(width, era.name);
    const height =
      headerH +
      consoles.length * LANE_H +
      GAME_STRIP_PAD +
      GAME_ROWS * (GAME_CARD_H + 14) +
      30;
    return { era, consoles, games, headerH, height };
  });

  // Stack however many lanes the era data uses, each as tall as its tallest block.
  const rowHeights: number[] = [];
  for (const m of measured) {
    rowHeights[m.era.row] = Math.max(rowHeights[m.era.row] ?? 0, m.height);
  }
  const rowY: number[] = [];
  let acc = WORLD_TOP;
  rowHeights.forEach((h, i) => {
    rowY[i] = acc;
    acc += h + ROW_GAP;
  });

  for (const { era, consoles, games, headerH, height } of measured) {
    const [start, end] = era.years;
    const x = xOfYear(start);
    const width = xOfYear(end + 1) - x;
    const y = rowY[era.row];

    const lanes: ConsoleLane[] = consoles.map((item, idx) => {
      const left = clamp(xOfYear(item.year) - x, 0, width - 80);
      const right = item.yearEnd
        ? clamp(xOfYear(item.yearEnd + 1) - x, left + 220, width)
        : width - 8;
      return {
        item,
        top: headerH + idx * LANE_H,
        left,
        width: right - left,
      };
    });

    // Game strip: greedy row packing so same-year releases don't collide.
    const stripTop = headerH + consoles.length * LANE_H + GAME_STRIP_PAD;
    const rowEnds: number[] = new Array(GAME_ROWS).fill(-Infinity);
    const spots: GameSpot[] = games.map((item) => {
      const ideal = clamp(xOfYear(item.year) - x, 8, width - GAME_CARD_W - 8);
      let rowIdx = rowEnds.findIndex((end) => ideal >= end + 10);
      let left = ideal;
      if (rowIdx === -1) {
        // Every row is occupied at this x — take the least-crowded row and shove right.
        rowIdx = rowEnds.indexOf(Math.min(...rowEnds));
        left = clamp(rowEnds[rowIdx] + 10, 8, width - GAME_CARD_W - 8);
      }
      rowEnds[rowIdx] = left + GAME_CARD_W;
      return { item, top: stripTop + rowIdx * (GAME_CARD_H + 14), left };
    });

    blocks.push({ era, x, y, width, height, consoles: lanes, games: spots });
  }

  const minYear = Math.min(...eras.map((e) => e.years[0]));
  const maxYear = Math.max(...eras.map((e) => e.years[1]));
  return {
    blocks,
    width: xOfYear(maxYear + 3),
    height: acc - ROW_GAP + 160,
    minYear,
    maxYear,
  };
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Zoom thresholds: what the canvas crossfades between. */
export type Lod = 'eras' | 'consoles' | 'games';

export const CONSOLES_LOD_MIN = 0.16;
export const GAMES_LOD_MIN = 0.52;
/**
 * Diving into an era should always land in the 'games' detail level so the game
 * cards render immediately, even for wide/tall eras whose natural fit-scale
 * would otherwise stop in 'consoles'. Slightly above GAMES_LOD_MIN for margin.
 */
export const DIVE_MIN_SCALE = 0.54;

export function lodForScale(s: number): Lod {
  if (s < CONSOLES_LOD_MIN) return 'eras';
  if (s < GAMES_LOD_MIN) return 'consoles';
  return 'games';
}
