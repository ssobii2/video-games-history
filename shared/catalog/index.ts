import type { Era, MuseumData, MuseumItem } from '../types.js';
import { ERAS, ERA_BY_SLUG } from './eras.js';
import { CONSOLES } from './consoles.js';
import { GAMES } from './games.js';

export { ERAS, ERA_BY_SLUG, CONSOLES, GAMES };
export type { Era, MuseumItem, MuseumData };

export const ALL_ITEMS: MuseumItem[] = [...CONSOLES, ...GAMES];

export const ITEM_BY_SLUG = new Map(ALL_ITEMS.map((i) => [i.slug, i]));

/**
 * Alias → canonical slug map for naming-conflict resolution.
 * "sega mega drive", "famicom", "pc engine" all land on one canonical entry,
 * so regional names can never produce duplicate rows.
 */
export const ALIAS_TO_SLUG: Map<string, string> = (() => {
  const map = new Map<string, string>();
  const put = (name: string, slug: string) => {
    const key = normalizeName(name);
    // First registration wins; canonical names are registered before aliases.
    if (key && !map.has(key)) map.set(key, slug);
  };
  for (const item of ALL_ITEMS) {
    put(item.name, item.slug);
    put(item.wikiTitle, item.slug);
  }
  for (const item of ALL_ITEMS) {
    for (const alias of item.aliases) put(alias, item.slug);
  }
  return map;
})();

/** Lowercase, strip Wikipedia disambiguation suffixes and punctuation noise. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*$/, '') // "Pong (game)" → "pong"
    .replace(/[’'".:!]/g, '')
    .replace(/[\s_-]+/g, ' ')
    .trim();
}

/** Resolve any regional/alternate name to its canonical catalog slug. */
export function resolveAlias(name: string): string | undefined {
  return ALIAS_TO_SLUG.get(normalizeName(name));
}

/** Full curated dataset, used as both server-side and client-side fallback. */
export function catalogData(): MuseumData {
  return { source: 'catalog', eras: ERAS, items: ALL_ITEMS };
}
