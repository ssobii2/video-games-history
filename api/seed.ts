import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getDb } from './_lib/db.js';
import { harvestItem } from './_lib/wikipedia.js';
import { ALL_ITEMS, normalizeName } from '../shared/catalog/index.js';
import type { MuseumItem } from '../shared/types.js';

const CONCURRENCY = 4;

interface SeedReport {
  ok: boolean;
  seeded: number;
  withImages: number;
  placeholders: number;
  duplicatesResolved: Array<{ slug: string; resolvedTitle: string; canonicalSlug: string }>;
  failures: Array<{ slug: string; error: string }>;
}

/**
 * POST /api/seed — harvest Wikipedia for every catalog entry and upsert into
 * Neon. Idempotent: re-running refreshes summaries and imagery in place.
 * Optionally protected: set SEED_TOKEN and pass ?token=... to match.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed — POST to seed' });
    return;
  }
  const requiredToken = process.env.SEED_TOKEN;
  if (requiredToken && req.query.token !== requiredToken) {
    res.status(401).json({ error: 'invalid seed token' });
    return;
  }
  const sql = getDb();
  if (!sql) {
    res.status(503).json({
      error:
        'no database configured — set DATABASE_URL (Neon connection string). ' +
        'The app still works without seeding, using the curated catalog.',
    });
    return;
  }

  await ensureSchema(sql);

  const report: SeedReport = {
    ok: true,
    seeded: 0,
    withImages: 0,
    placeholders: 0,
    duplicatesResolved: [],
    failures: [],
  };

  // Canonical-title dedup across the whole run: if two entries' wiki titles
  // resolve (via redirects) to the same article, the second is recorded and
  // skipped instead of writing a duplicate museum piece.
  const resolvedToSlug = new Map<string, string>();

  const queue = [...ALL_ITEMS];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const item = queue.shift();
      if (!item) return;
      await seedOne(item);
    }
  });
  await Promise.all(workers);

  async function seedOne(item: MuseumItem): Promise<void> {
    const result = await harvestItem(item);
    if (result.error) {
      report.failures.push({ slug: item.slug, error: result.error });
    }
    if (result.resolvedTitle) {
      const key = normalizeName(result.resolvedTitle);
      const existing = resolvedToSlug.get(key);
      if (existing && existing !== item.slug) {
        report.duplicatesResolved.push({
          slug: item.slug,
          resolvedTitle: result.resolvedTitle,
          canonicalSlug: existing,
        });
        return; // same article as an already-seeded entry — skip, don't duplicate
      }
      resolvedToSlug.set(key, item.slug);
    }

    // Curated summary stays when Wikipedia gave nothing; extracts win otherwise.
    const summary = result.summary && result.summary.length > 80 ? result.summary : item.summary;

    try {
      await sql!`
        INSERT INTO museum_items (
          slug, kind, era, name, wiki_title, resolved_title, aliases,
          year, year_end, maker, platform, specs, summary, legacy,
          image_url, image_status, image_license, wiki_url, updated_at
        ) VALUES (
          ${item.slug}, ${item.kind}, ${item.era}, ${item.name}, ${item.wikiTitle},
          ${result.resolvedTitle ?? null}, ${JSON.stringify(item.aliases)},
          ${item.year}, ${item.yearEnd ?? null}, ${item.maker}, ${item.platform ?? null},
          ${JSON.stringify(item.specs)}, ${summary}, ${item.legacy},
          ${result.image.url || null}, ${result.image.status}, ${result.image.license || null},
          ${result.wikiUrl ?? null}, now()
        )
        ON CONFLICT (slug) DO UPDATE SET
          resolved_title = EXCLUDED.resolved_title,
          summary = EXCLUDED.summary,
          legacy = EXCLUDED.legacy,
          specs = EXCLUDED.specs,
          image_url = EXCLUDED.image_url,
          image_status = EXCLUDED.image_status,
          image_license = EXCLUDED.image_license,
          wiki_url = EXCLUDED.wiki_url,
          updated_at = now()
      `;
      report.seeded++;
      if (result.image.status === 'ok') report.withImages++;
      else report.placeholders++;
    } catch (err) {
      report.failures.push({
        slug: item.slug,
        error: `db write: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  report.ok = report.failures.length < ALL_ITEMS.length / 2;
  res.status(report.ok ? 200 : 500).json(report);
}
