/** Shared domain types — used by the catalog, the API layer, and the frontend. */

export type EraSlug =
  | 'arcade-age'
  | 'eight-bit'
  | 'sixteen-bit'
  | 'three-d-revolution'
  | 'hd-generation'
  | 'modern-era';

export type GalleryTheme =
  | 'arcade'
  | 'eightbit'
  | 'sixteenbit'
  | 'threed'
  | 'hd'
  | 'modern';

export interface EraPalette {
  /** Deep background tone of the era block / gallery fog. */
  bg: string;
  /** Dominant brand color. */
  primary: string;
  /** Secondary accent. */
  accent: string;
  /** Readable text color over bg. */
  text: string;
}

export interface Era {
  slug: EraSlug;
  name: string;
  /** Short display name for chips and HUDs. */
  short: string;
  years: [number, number];
  /** Timeline lane (0 = top) so overlapping eras are visually parallel, never occluding. */
  row: 0 | 1 | 2;
  palette: EraPalette;
  tagline: string;
  description: string;
  galleryTheme: GalleryTheme;
}

export type ItemKind = 'console' | 'game';

export type ImageStatus = 'ok' | 'placeholder';

export interface MuseumItem {
  slug: string;
  kind: ItemKind;
  era: EraSlug;
  name: string;
  /** Canonical English Wikipedia article title used for harvesting. */
  wikiTitle: string;
  /** Regional / alternate names that must resolve to this same entry. */
  aliases: string[];
  year: number;
  /** Discontinuation year for hardware; undefined for games or ongoing platforms. */
  yearEnd?: number;
  /** Manufacturer (consoles) or developer (games). */
  maker: string;
  /** For games: the console slug it is most associated with (timeline clustering). */
  platform?: string;
  /** Curated spec sheet — label → value, rendered in placard order. */
  specs: Record<string, string>;
  /** Educational summary. Overridden by the Wikipedia extract once seeded. */
  summary: string;
  /** Curated account of legacy and cultural impact. Always curated, never harvested. */
  legacy: string;
  /** Enrichment fields, populated by the seeding pipeline. */
  imageUrl?: string;
  imageStatus?: ImageStatus;
  imageLicense?: string;
  wikiUrl?: string;
  resolvedTitle?: string;
  /** Parsed hardware metrics, populated by the enrich-metrics pipeline. */
  metrics?: ItemMetrics;
}

export interface ItemMetrics {
  unitsSold?: number;
  unitsSoldLabel?: string;
  launchPriceUsd?: number;
  cpuMhz?: number;
  ramBytes?: number;
  sourceUrl?: string;
}

export interface MuseumData {
  source: 'database' | 'catalog';
  eras: Era[];
  items: MuseumItem[];
}
