import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, withColdStartRetry, type ItemRow, type MetricRow } from './_lib/db.js';
import { ERAS, catalogData } from '../shared/catalog/index.js';
import type { MuseumData, MuseumItem, ItemMetrics } from '../shared/types.js';

/**
 * GET /api/museum — the only data endpoint the frontend reads.
 * Serves the seeded, Wikipedia-enriched database when available;
 * otherwise falls back to the curated catalog so the museum always opens.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');

  const sql = getDb();
  if (sql) {
    try {
      const rows = (await withColdStartRetry(() =>
        sql`SELECT * FROM museum_items ORDER BY year, slug`
      )) as unknown as ItemRow[];
      if (rows.length > 0) {
        // Attempt to load metrics; safe-fail if table doesn't exist yet
        let metricsMap = new Map<string, ItemMetrics>();
        try {
          const metricRows = (await withColdStartRetry(() =>
            sql`SELECT * FROM item_metrics`
          )) as unknown as MetricRow[];
          metricsMap = new Map(
            metricRows.map((r) => [r.slug, metricRowToItemMetrics(r)])
          );
        } catch {
          // item_metrics not yet created — metrics will be undefined on all items
        }

        const items: MuseumItem[] = rows.map((row) =>
          rowToItem(row, metricsMap.get(row.slug))
        );
        const payload: MuseumData = { source: 'database', eras: ERAS, items };
        res.status(200).json(payload);
        return;
      }
    } catch {
      // table missing / connection failure — catalog fallback below
    }
  }

  res.status(200).json(catalogData());
}

function metricRowToItemMetrics(r: MetricRow): ItemMetrics {
  const m: ItemMetrics = {};
  if (r.units_sold != null) m.unitsSold = Number(r.units_sold);
  if (r.units_sold_label != null) m.unitsSoldLabel = r.units_sold_label;
  if (r.launch_price_usd != null) m.launchPriceUsd = Number(r.launch_price_usd);
  if (r.cpu_mhz != null) m.cpuMhz = Number(r.cpu_mhz);
  if (r.ram_bytes != null) m.ramBytes = Number(r.ram_bytes);
  if (r.source_url != null) m.sourceUrl = r.source_url;
  return m;
}

function rowToItem(row: ItemRow, metrics?: ItemMetrics): MuseumItem {
  return {
    slug: row.slug,
    kind: row.kind as MuseumItem['kind'],
    era: row.era as MuseumItem['era'],
    name: row.name,
    wikiTitle: row.wiki_title,
    resolvedTitle: row.resolved_title ?? undefined,
    aliases: row.aliases ?? [],
    year: row.year,
    yearEnd: row.year_end ?? undefined,
    maker: row.maker,
    platform: row.platform ?? undefined,
    specs: row.specs ?? {},
    summary: row.summary,
    legacy: row.legacy,
    imageUrl: row.image_url ?? undefined,
    imageStatus: (row.image_status as MuseumItem['imageStatus']) ?? 'placeholder',
    imageLicense: row.image_license ?? undefined,
    wikiUrl: row.wiki_url ?? undefined,
    metrics,
  };
}
