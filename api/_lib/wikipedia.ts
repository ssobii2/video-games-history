/**
 * Server-side Wikipedia / Wikimedia Commons harvester.
 *
 * Handles the naming chaos endemic to gaming history:
 *  - follows redirects ("Sega Mega Drive" → "Sega Genesis") and reports the
 *    canonical resolved title so callers can dedupe
 *  - walks a disambiguation variant ladder when a bare title lands on a
 *    disambiguation page ("Pong" → "Pong (video game)" …)
 *  - checks image licensing via Commons extmetadata and refuses non-free
 *    media (most game box art), falling back to other freely licensed images
 *    on the same article, else signalling "placeholder"
 */

const REST_BASE = 'https://en.wikipedia.org/api/rest_v1';
const ACTION_BASE = 'https://en.wikipedia.org/w/api.php';
const USER_AGENT =
  'VideoGameMuseum/1.0 (educational museum project; https://github.com/video-game-museum)';
const FETCH_TIMEOUT_MS = 8000;

export interface WikiSummary {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnailUrl?: string;
  type: string;
}

export interface WikiImage {
  url: string;
  license: string;
  status: 'ok' | 'placeholder';
}

export interface HarvestResult {
  resolvedTitle?: string;
  summary?: string;
  wikiUrl?: string;
  image: WikiImage;
  error?: string;
}

async function wikiFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** REST summary endpoint; follows redirects server-side. Null on 404. */
async function fetchSummary(title: string): Promise<WikiSummary | null> {
  const res = await wikiFetch(
    `${REST_BASE}/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`summary ${res.status} for "${title}"`);
  const data: any = await res.json();
  return {
    title: data.title ?? title,
    extract: data.extract ?? '',
    pageUrl: data.content_urls?.desktop?.page ?? '',
    thumbnailUrl: data.originalimage?.source ?? data.thumbnail?.source,
    type: data.type ?? 'standard',
  };
}

/**
 * Disambiguation/404 variant ladder. Given "Pong (game)" or a bare ambiguous
 * "Doom", tries sensible Wikipedia suffix conventions before giving up.
 */
function titleVariants(title: string, kind: 'console' | 'game', year: number): string[] {
  const base = title.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const variants = [title];
  if (base !== title) variants.push(base);
  if (kind === 'game') {
    variants.push(
      `${base} (video game)`,
      `${base} (${year} video game)`,
      `${base} (arcade game)`,
      `${base} (game)`
    );
  } else {
    variants.push(`${base} (console)`, `${base} (video game console)`, `${base} (system)`);
  }
  return [...new Set(variants)];
}

/** Resolve a title to a real (non-disambiguation) article summary. */
async function resolveSummary(
  title: string,
  kind: 'console' | 'game',
  year: number
): Promise<WikiSummary | null> {
  for (const variant of titleVariants(title, kind, year)) {
    let summary: WikiSummary | null = null;
    try {
      summary = await fetchSummary(variant);
    } catch {
      continue; // transient failure on one variant — try the next
    }
    if (summary && summary.type !== 'disambiguation') return summary;
  }
  return null;
}

interface ImageInfo {
  url: string;
  license: string;
  nonFree: boolean;
}

/** Commons imageinfo + extmetadata for a File: title. Null if unavailable. */
async function fetchImageInfo(fileTitle: string): Promise<ImageInfo | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: fileTitle,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1024',
    format: 'json',
    formatversion: '2',
    origin: '*',
  });
  const res = await wikiFetch(`${ACTION_BASE}?${params}`);
  if (!res.ok) return null;
  const data: any = await res.json();
  const info = data.query?.pages?.[0]?.imageinfo?.[0];
  if (!info?.url) return null;
  const meta = info.extmetadata ?? {};
  const license: string = meta.LicenseShortName?.value ?? meta.License?.value ?? '';
  const nonFreeFlag = String(meta.NonFree?.value ?? '').trim();
  const nonFree =
    nonFreeFlag === '1' ||
    nonFreeFlag.toLowerCase() === 'true' ||
    /non-?free|fair use|copyright/i.test(license);
  return { url: info.thumburl ?? info.url, license, nonFree };
}

/** File name heuristics: skip icons, logos, maps, UI chrome. */
function looksLikeContentImage(fileTitle: string): boolean {
  if (!/\.(jpe?g|png|gif)$/i.test(fileTitle)) return false;
  return !/\b(icon|logo|map|flag|wordmark|sound|chart|graph|diagram|screenshot of wik)/i.test(
    fileTitle
  );
}

/** List image files used on an article (Action API). */
async function fetchArticleImages(title: string): Promise<string[]> {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'images',
    imlimit: '30',
    format: 'json',
    formatversion: '2',
    origin: '*',
  });
  const res = await wikiFetch(`${ACTION_BASE}?${params}`);
  if (!res.ok) return [];
  const data: any = await res.json();
  const images: Array<{ title: string }> = data.query?.pages?.[0]?.images ?? [];
  return images.map((i) => i.title).filter(looksLikeContentImage);
}

/** Lead image file name for an article, if any. */
async function fetchLeadImageFile(title: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'pageimages',
    piprop: 'name',
    format: 'json',
    formatversion: '2',
    origin: '*',
  });
  const res = await wikiFetch(`${ACTION_BASE}?${params}`);
  if (!res.ok) return null;
  const data: any = await res.json();
  const name = data.query?.pages?.[0]?.pageimage;
  return name ? `File:${name}` : null;
}

const MAX_LICENSE_LOOKUPS = 6;

/**
 * Copyright guardrail: pick a freely licensed image for an article.
 * Lead image first; if restricted/missing, walk other article images;
 * if nothing free is found, signal a stylized placeholder.
 */
async function pickFreeImage(articleTitle: string): Promise<WikiImage> {
  const candidates: string[] = [];
  try {
    const lead = await fetchLeadImageFile(articleTitle);
    if (lead) candidates.push(lead);
    const rest = await fetchArticleImages(articleTitle);
    for (const file of rest) if (!candidates.includes(file)) candidates.push(file);
  } catch {
    // listing failed entirely — placeholder below
  }

  let lookups = 0;
  for (const file of candidates) {
    if (lookups >= MAX_LICENSE_LOOKUPS) break;
    lookups++;
    try {
      const info = await fetchImageInfo(file);
      if (info && !info.nonFree) {
        return { url: info.url, license: info.license || 'free', status: 'ok' };
      }
    } catch {
      // one bad file never aborts the walk
    }
  }
  return { url: '', license: '', status: 'placeholder' };
}

/** Full harvest for one catalog entry. Never throws — errors land in `.error`. */
export async function harvestItem(entry: {
  wikiTitle: string;
  kind: 'console' | 'game';
  year: number;
}): Promise<HarvestResult> {
  try {
    const summary = await resolveSummary(entry.wikiTitle, entry.kind, entry.year);
    if (!summary) {
      return {
        image: { url: '', license: '', status: 'placeholder' },
        error: `no article resolved for "${entry.wikiTitle}"`,
      };
    }
    const image = await pickFreeImage(summary.title);
    return {
      resolvedTitle: summary.title,
      summary: summary.extract || undefined,
      wikiUrl: summary.pageUrl || undefined,
      image,
    };
  } catch (err) {
    return {
      image: { url: '', license: '', status: 'placeholder' },
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
