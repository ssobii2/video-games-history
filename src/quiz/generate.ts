import type { Era, MuseumItem } from '../types';
import type { QuizQuestion } from './types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Assemble [correct, ...distractors], dedupe, shuffle, return question or null. */
function buildOptions(
  correct: string,
  distractors: string[],
): { options: string[]; correctIndex: number } | null {
  const unique = Array.from(new Set([correct, ...distractors]));
  if (unique.length < 4) return null;
  const four = [correct, ...unique.filter((v) => v !== correct).slice(0, 3)];
  const shuffled = shuffle(four);
  return { options: shuffled, correctIndex: shuffled.indexOf(correct) };
}

// ─── question builders ────────────────────────────────────────────────────────

function releaseYear(item: MuseumItem, allItems: MuseumItem[]): QuizQuestion | null {
  const correct = String(item.year);
  // Distractor years: pick other years in the catalog near this one, dedupe
  const others = allItems
    .filter((i) => i.slug !== item.slug)
    .map((i) => i.year)
    .filter((y) => y !== item.year && Math.abs(y - item.year) <= 6 && Math.abs(y - item.year) >= 1);
  const deduped = Array.from(new Set(others));
  if (deduped.length < 3) return null;
  const distractors = shuffle(deduped).slice(0, 3).map(String);
  const built = buildOptions(correct, distractors);
  if (!built) return null;
  return {
    id: `release-year:${item.slug}`,
    prompt: `In what year was ${item.name} released?`,
    ...built,
    itemSlug: item.slug,
  };
}

function maker(item: MuseumItem, allItems: MuseumItem[]): QuizQuestion | null {
  const correct = item.maker;
  const others = allItems
    .filter((i) => i.kind === item.kind && i.slug !== item.slug && i.maker !== correct)
    .map((i) => i.maker);
  const deduped = Array.from(new Set(others));
  if (deduped.length < 3) return null;
  const distractors = shuffle(deduped).slice(0, 3);
  const built = buildOptions(correct, distractors);
  if (!built) return null;
  return {
    id: `maker:${item.slug}`,
    prompt: `Who made ${item.name}?`,
    ...built,
    itemSlug: item.slug,
  };
}

function era(item: MuseumItem, eras: Era[]): QuizQuestion | null {
  const correctEra = eras.find((e) => e.slug === item.era);
  if (!correctEra) return null;
  const correct = correctEra.name;
  const others = eras.filter((e) => e.slug !== item.era).map((e) => e.name);
  if (others.length < 3) return null;
  const distractors = shuffle(others).slice(0, 3);
  const built = buildOptions(correct, distractors);
  if (!built) return null;
  return {
    id: `era:${item.slug}`,
    prompt: `Which era does ${item.name} belong to?`,
    ...built,
    itemSlug: item.slug,
  };
}

function launchedFirst(allItems: MuseumItem[]): QuizQuestion | null {
  // Need 4 items with distinct years
  const byYear = shuffle(allItems.slice()).sort(() => 0.5 - Math.random());
  const picked: MuseumItem[] = [];
  const usedYears = new Set<number>();
  for (const item of byYear) {
    if (!usedYears.has(item.year)) {
      picked.push(item);
      usedYears.add(item.year);
    }
    if (picked.length === 4) break;
  }
  if (picked.length < 4) return null;
  const correct = picked.reduce((a, b) => (a.year < b.year ? a : b));
  const options = picked.map((i) => i.name);
  const shuffled = shuffle(options);
  return {
    id: `launched-first:${picked.map((i) => i.slug).join('-')}`,
    prompt: 'Which of these came first?',
    options: shuffled,
    correctIndex: shuffled.indexOf(correct.name),
    // no itemSlug — question spans multiple items
  };
}

const SPEC_KEYS = ['Units sold', 'CPU', 'RAM', 'Launch price'] as const;

function spec(item: MuseumItem, allItems: MuseumItem[]): QuizQuestion | null {
  const usableKey = SPEC_KEYS.find((k) => item.specs[k] !== undefined);
  if (!usableKey) return null;
  const correct = item.specs[usableKey];
  const others = allItems
    .filter((i) => i.slug !== item.slug && i.specs[usableKey] !== undefined && i.specs[usableKey] !== correct)
    .map((i) => i.specs[usableKey]);
  const deduped = Array.from(new Set(others));
  if (deduped.length < 3) return null;
  const distractors = shuffle(deduped).slice(0, 3);
  const built = buildOptions(correct, distractors);
  if (!built) return null;
  return {
    id: `spec:${item.slug}:${usableKey}`,
    prompt: `What was the ${usableKey} of ${item.name}?`,
    ...built,
    itemSlug: item.slug,
  };
}

// ─── main export ─────────────────────────────────────────────────────────────

export function generateQuiz(
  items: MuseumItem[],
  eras: Era[],
  count = 10,
): QuizQuestion[] {
  const candidates: QuizQuestion[] = [];

  for (const item of items) {
    const ry = releaseYear(item, items);
    if (ry) candidates.push(ry);

    const mk = maker(item, items);
    if (mk) candidates.push(mk);

    const er = era(item, eras);
    if (er) candidates.push(er);

    const sp = spec(item, items);
    if (sp) candidates.push(sp);
  }

  // launched-first: generate several to add variety
  for (let i = 0; i < Math.min(10, Math.ceil(items.length / 4)); i++) {
    const lf = launchedFirst(items);
    if (lf) candidates.push(lf);
  }

  // Dedupe by id (launched-first IDs will all be unique; others are stable per item+kind)
  const seen = new Set<string>();
  const deduped: QuizQuestion[] = [];
  for (const q of candidates) {
    if (!seen.has(q.id)) {
      seen.add(q.id);
      deduped.push(q);
    }
  }

  const pool = shuffle(deduped);
  return pool.slice(0, count);
}
