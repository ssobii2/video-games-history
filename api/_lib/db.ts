import { neon } from '@neondatabase/serverless';

export type Sql = ReturnType<typeof neon>;

/**
 * Returns a Neon HTTP client, or null when no database is configured —
 * callers fall back to the curated catalog so the app still works.
 * Vercel's Neon integration sets DATABASE_URL / POSTGRES_URL automatically.
 */
export function getDb(): Sql | null {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;
  if (!url) return null;
  try {
    return neon(url);
  } catch {
    return null;
  }
}

export async function ensureSchema(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS museum_items (
      slug            TEXT PRIMARY KEY,
      kind            TEXT NOT NULL CHECK (kind IN ('console', 'game')),
      era             TEXT NOT NULL,
      name            TEXT NOT NULL,
      wiki_title      TEXT NOT NULL,
      resolved_title  TEXT,
      aliases         JSONB NOT NULL DEFAULT '[]',
      year            INT NOT NULL,
      year_end        INT,
      maker           TEXT NOT NULL DEFAULT '',
      platform        TEXT,
      specs           JSONB NOT NULL DEFAULT '{}',
      summary         TEXT NOT NULL DEFAULT '',
      legacy          TEXT NOT NULL DEFAULT '',
      image_url       TEXT,
      image_status    TEXT NOT NULL DEFAULT 'placeholder',
      image_license   TEXT,
      wiki_url        TEXT,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

export interface ItemRow {
  slug: string;
  kind: string;
  era: string;
  name: string;
  wiki_title: string;
  resolved_title: string | null;
  aliases: string[];
  year: number;
  year_end: number | null;
  maker: string;
  platform: string | null;
  specs: Record<string, string>;
  summary: string;
  legacy: string;
  image_url: string | null;
  image_status: string;
  image_license: string | null;
  wiki_url: string | null;
}
