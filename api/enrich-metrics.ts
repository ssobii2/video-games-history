import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, ensureMetricsTable, withColdStartRetry } from './_lib/db.js';
import { ALL_ITEMS } from '../shared/catalog/index.js';
import { metricsFromSpecs, fetchWikidataMetrics } from './_lib/metrics.js';

const CONCURRENCY = 4;

/**
 * POST /api/enrich-metrics — parse hardware metrics from curated specs and
 * back-fill gaps from Wikidata. Idempotent: COALESCE upsert never nulls a
 * previously-found value. Optionally protected by SEED_TOKEN.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const requiredToken = process.env.SEED_TOKEN;
  if (requiredToken && req.query.token !== requiredToken) {
    res.status(401).json({ error: 'invalid seed token' });
    return;
  }

  const sql = getDb();
  if (!sql) {
    res.status(200).json({ skipped: 'no-db' });
    return;
  }

  await withColdStartRetry(() => ensureMetricsTable(sql));

  // Counters for summary report
  let fromSpecsUnits = 0;
  let fromSpecsPrice = 0;
  let fromSpecsCpu = 0;
  let fromSpecsRam = 0;
  let wikidataFetched = 0;
  let withUnits = 0;
  let withPrice = 0;
  const missingUnits: string[] = [];

  const queue = [...ALL_ITEMS];

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const item = queue.shift();
      if (!item) return;

      // 1. Parse from specs (no network)
      const m = metricsFromSpecs(item);

      // 2. Fill gaps via Wikidata only when needed
      let source_url: string | undefined;
      if (m.units_sold == null || m.launch_price_usd == null) {
        const wd = await fetchWikidataMetrics(item);
        wikidataFetched++;
        if (m.units_sold == null && wd.units_sold != null) {
          m.units_sold = wd.units_sold;
          // No units_sold_label from Wikidata — leave undefined
        }
        if (m.launch_price_usd == null && wd.launch_price_usd != null) {
          m.launch_price_usd = wd.launch_price_usd;
        }
        if (wd.source_url) source_url = wd.source_url;
      }

      // Wikipedia fallback: if still no source_url but we have at least one metric,
      // build a Wikipedia URL from the item's resolved title.
      if (
        source_url == null &&
        (m.units_sold != null ||
          m.launch_price_usd != null ||
          m.cpu_mhz != null ||
          m.ram_bytes != null)
      ) {
        const title = item.resolvedTitle ?? item.wikiTitle ?? item.name;
        source_url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
      }

      // Tally counters
      if (m.units_sold != null) withUnits++;
      else missingUnits.push(item.slug);
      if (m.launch_price_usd != null) withPrice++;

      // Count specs-derived hits (before wikidata topped up)
      const specsM = metricsFromSpecs(item);
      if (specsM.units_sold != null) fromSpecsUnits++;
      if (specsM.launch_price_usd != null) fromSpecsPrice++;
      if (specsM.cpu_mhz != null) fromSpecsCpu++;
      if (specsM.ram_bytes != null) fromSpecsRam++;

      // 3. UPSERT with COALESCE so re-runs never null a found value
      await withColdStartRetry(() => sql`
        INSERT INTO item_metrics (
          slug, units_sold, units_sold_label, launch_price_usd,
          cpu_mhz, ram_bytes, source_url, updated_at
        ) VALUES (
          ${item.slug},
          ${m.units_sold ?? null},
          ${m.units_sold_label ?? null},
          ${m.launch_price_usd ?? null},
          ${m.cpu_mhz ?? null},
          ${m.ram_bytes ?? null},
          ${source_url ?? null},
          now()
        )
        ON CONFLICT (slug) DO UPDATE SET
          units_sold       = COALESCE(EXCLUDED.units_sold,       item_metrics.units_sold),
          units_sold_label = COALESCE(EXCLUDED.units_sold_label, item_metrics.units_sold_label),
          launch_price_usd = COALESCE(EXCLUDED.launch_price_usd, item_metrics.launch_price_usd),
          cpu_mhz          = COALESCE(EXCLUDED.cpu_mhz,          item_metrics.cpu_mhz),
          ram_bytes        = COALESCE(EXCLUDED.ram_bytes,         item_metrics.ram_bytes),
          source_url       = COALESCE(EXCLUDED.source_url,        item_metrics.source_url),
          updated_at       = now()
      `);
    }
  });

  await Promise.all(workers);

  res.status(200).json({
    total: ALL_ITEMS.length,
    fromSpecs: {
      units: fromSpecsUnits,
      price: fromSpecsPrice,
      cpu: fromSpecsCpu,
      ram: fromSpecsRam,
    },
    fetched: wikidataFetched,
    withUnits,
    withPrice,
    missingUnits,
  });
}
