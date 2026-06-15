/**
 * Pure parsers for hardware metric strings found in catalog `specs`,
 * plus a Wikidata fetch for gap-filling.
 */
import type { MuseumItem } from '../../shared/types.js';

const FETCH_TIMEOUT_MS = 8000;

// ---------------------------------------------------------------------------
// Pure parsers (no network)
// ---------------------------------------------------------------------------

/**
 * Parse a units-sold string to a plain integer.
 * Handles: "~155 million", "61.9 million", "1.5 billion", "350,000", plain ints.
 */
export function parseUnitsSold(s: string): number | undefined {
  // Strip leading ~ and whitespace
  const clean = s.trim().replace(/^~\s*/, '');

  const billionMatch = clean.match(/^([\d,]+(?:\.\d+)?)\s*\+?\s*billion/i);
  if (billionMatch) {
    const n = parseFloat(billionMatch[1].replace(/,/g, ''));
    if (!isNaN(n)) return Math.round(n * 1_000_000_000);
  }

  const millionMatch = clean.match(/^([\d,]+(?:\.\d+)?)\s*\+?\s*million/i);
  if (millionMatch) {
    const n = parseFloat(millionMatch[1].replace(/,/g, ''));
    if (!isNaN(n)) return Math.round(n * 1_000_000);
  }

  // Plain integer, possibly with commas
  const plainMatch = clean.match(/^([\d,]+)/);
  if (plainMatch) {
    const n = parseInt(plainMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(n)) return n;
  }

  return undefined;
}

/**
 * Parse a price string to USD float.
 * Only accepts USD ($ or US$). Returns undefined for non-USD.
 */
export function parsePriceUsd(s: string): number | undefined {
  // Must contain $ (USD indicator); reject yen, euro, etc.
  if (!s.includes('$')) return undefined;
  // Match optional "US" prefix then $ then digits
  const m = s.match(/US\$\s*([\d,]+(?:\.\d+)?)/i) ?? s.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (!m) return undefined;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return isNaN(n) ? undefined : n;
}

/**
 * Parse a CPU string and return the clock speed in MHz.
 * Handles MHz and GHz; takes the first clock figure found.
 * e.g. "MOS 6507 @ 1.19 MHz" → 1.19, "3.2 GHz" → 3200
 */
export function parseCpuMhz(s: string): number | undefined {
  const ghzMatch = s.match(/([\d.]+)\s*GHz/i);
  if (ghzMatch) {
    const n = parseFloat(ghzMatch[1]);
    if (!isNaN(n)) return n * 1000;
  }
  const mhzMatch = s.match(/([\d.]+)\s*MHz/i);
  if (mhzMatch) {
    const n = parseFloat(mhzMatch[1]);
    if (!isNaN(n)) return n;
  }
  const khzMatch = s.match(/([\d.]+)\s*kHz/i);
  if (khzMatch) {
    const n = parseFloat(khzMatch[1]);
    if (!isNaN(n)) return n / 1000;
  }
  return undefined;
}

/**
 * Parse a RAM string to bytes. Uses 1024 multipliers.
 * e.g. "128 bytes" → 128, "64 KB" → 65536, "512 MB" → 536870912, "8 GB" → 8589934592
 */
export function parseRamBytes(s: string): number | undefined {
  const m = s.match(/([\d,]+(?:\.\d+)?)\s*(bytes?|KB|MB|GB|TB)/i);
  if (!m) return undefined;
  const n = parseFloat(m[1].replace(/,/g, ''));
  if (isNaN(n)) return undefined;
  const unit = m[2].toUpperCase();
  if (unit === 'BYTES' || unit === 'BYTE') return Math.round(n);
  if (unit === 'KB') return Math.round(n * 1024);
  if (unit === 'MB') return Math.round(n * 1024 * 1024);
  if (unit === 'GB') return Math.round(n * 1024 * 1024 * 1024);
  if (unit === 'TB') return Math.round(n * 1024 * 1024 * 1024 * 1024);
  return undefined;
}

// ---------------------------------------------------------------------------
// Spec-derived metrics
// ---------------------------------------------------------------------------

export interface SpecsMetrics {
  units_sold?: number;
  units_sold_label?: string;
  launch_price_usd?: number;
  cpu_mhz?: number;
  ram_bytes?: number;
}

/**
 * Extract numeric metrics from an item's curated `specs` record.
 * No network — pure parse.
 */
export function metricsFromSpecs(item: MuseumItem): SpecsMetrics {
  const result: SpecsMetrics = {};

  const unitsRaw = item.specs['Units sold'] ?? item.specs['Sales'];
  if (unitsRaw) {
    const parsed = parseUnitsSold(unitsRaw);
    if (parsed !== undefined) {
      result.units_sold = parsed;
      result.units_sold_label = unitsRaw;
    }
  }

  const priceRaw = item.specs['Launch price'];
  if (priceRaw) {
    const parsed = parsePriceUsd(priceRaw);
    if (parsed !== undefined) result.launch_price_usd = parsed;
  }

  const cpuRaw = item.specs['CPU'] ?? item.specs['Processor'];
  if (cpuRaw) {
    const parsed = parseCpuMhz(cpuRaw);
    if (parsed !== undefined) result.cpu_mhz = parsed;
  }

  const ramRaw = item.specs['RAM'] ?? item.specs['Memory'];
  if (ramRaw) {
    const parsed = parseRamBytes(ramRaw);
    if (parsed !== undefined) result.ram_bytes = parsed;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Wikidata fetch (gap-filler)
// ---------------------------------------------------------------------------

interface WikidataFetchResult {
  units_sold?: number;
  launch_price_usd?: number;
  source_url?: string;
}

async function wikidataFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: {
        'User-Agent': 'VideoGameMuseum/1.0 (educational museum project)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch Wikidata claims for an item to fill gaps not covered by specs.
 * Uses P1092 (total produced) for units sold.
 * Returns {} on any error or missing data — never guesses.
 */
export async function fetchWikidataMetrics(
  item: MuseumItem
): Promise<WikidataFetchResult> {
  const title = item.resolvedTitle ?? item.wikiTitle ?? item.name;
  try {
    const url =
      `https://www.wikidata.org/w/api.php?action=wbgetentities` +
      `&sites=enwiki&titles=${encodeURIComponent(title)}` +
      `&props=claims&format=json&origin=*`;

    const resp = await wikidataFetch(url);
    if (!resp.ok) return {};

    const data = (await resp.json()) as {
      entities?: Record<
        string,
        {
          id?: string;
          missing?: string;
          claims?: Record<
            string,
            Array<{
              mainsnak?: {
                datavalue?: { value?: { amount?: string } };
              };
            }>
          >;
        }
      >;
    };

    if (!data.entities) return {};

    // Pick the first non-missing entity
    let entityId: string | undefined;
    let entity: (typeof data.entities)[string] | undefined;
    for (const [id, ent] of Object.entries(data.entities)) {
      if (!('missing' in ent)) {
        entityId = id;
        entity = ent;
        break;
      }
    }
    if (!entity || !entityId) return {};

    const result: WikidataFetchResult = {};

    // P1092 = total produced / units made
    const p1092 = entity.claims?.['P1092'];
    if (p1092 && p1092.length > 0) {
      const amount = p1092[0]?.mainsnak?.datavalue?.value?.amount;
      if (amount) {
        // Wikidata amounts look like "+155000000"
        const n = parseInt(amount.replace(/^\+/, ''), 10);
        if (!isNaN(n) && n > 0) {
          result.units_sold = n;
          result.source_url = `https://www.wikidata.org/wiki/${entityId}`;
        }
      }
    }

    return result;
  } catch {
    return {};
  }
}
