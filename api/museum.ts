import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, type ItemRow } from './_lib/db';
import { ERAS, catalogData } from '../shared/catalog/index';
import type { MuseumData, MuseumItem } from '../shared/types';

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
      const rows = (await sql`
        SELECT * FROM museum_items ORDER BY year, slug
      `) as unknown as ItemRow[];
      if (rows.length > 0) {
        const items: MuseumItem[] = rows.map(rowToItem);
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

function rowToItem(row: ItemRow): MuseumItem {
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
  };
}
