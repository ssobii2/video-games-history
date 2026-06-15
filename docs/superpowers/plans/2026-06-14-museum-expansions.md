# Museum Expansions Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.
> **No test runner exists** in this repo and none will be added (over-engineering for a personal showcase). The verification gate per task is: (1) `npm run typecheck` passes, (2) live behavior confirmed on `http://localhost:5173` (dev server already running) via playwright-cli.
> **No commits during execution** — the user's standing rule is "never commit without explicit say-so." Commits happen only at the end, on the user's instruction. Verification replaces commit gates.
> **Coding by Sonnet subagents only.**

**Goal:** Add three self-contained features to the museum on the `expansions` branch — a scored trivia quiz, a guided auto-tour with UI sound effects, and a DB-backed data-viz lane (units-sold / hardware-growth) under the timeline.

**Architecture:** Each feature is an isolated unit. Quiz + Tour are pure client-side React/GSAP overlays that reuse the existing Placard/Credits modal pattern and the Timeline camera API. SFX is a small standalone engine alongside `MusicEngine`. Data-viz adds a Neon table + an idempotent enrich endpoint that parses existing `specs` first and fetches only missing values from free sources (Wikidata → Wikipedia infobox fallback), then renders a year-aligned lane.

**Tech Stack:** Vite 6, React 18, TypeScript 5.6, Three.js, GSAP, `@neondatabase/serverless` (Neon Postgres). Spec: `docs/superpowers/specs/2026-06-14-museum-expansions-design.md`.

---

## Phase A — SfxEngine (shared dependency)

### Task A1: SfxEngine

**Files:**
- Create: `src/audio/sfx.ts`
- Create assets: `public/sfx/coin.mp3`, `public/sfx/poweron.mp3`, `public/sfx/step.mp3`, `public/sfx/correct.mp3`, `public/sfx/wrong.mp3`
- Create: `public/sfx/ATTRIBUTIONS.md`

- [ ] **Step 1: Implement the engine.** Mirror the shape of `MusicEngine`'s mute handling but for one-shots.

```ts
// src/audio/sfx.ts
export type Sfx = 'coin' | 'poweron' | 'step' | 'correct' | 'wrong';

const FILES: Record<Sfx, string> = {
  coin: '/sfx/coin.mp3',
  poweron: '/sfx/poweron.mp3',
  step: '/sfx/step.mp3',
  correct: '/sfx/correct.mp3',
  wrong: '/sfx/wrong.mp3',
};
const VOL: Record<Sfx, number> = { coin: 0.45, poweron: 0.4, step: 0.3, correct: 0.5, wrong: 0.5 };

export class SfxEngine {
  private buffers = new Map<Sfx, HTMLAudioElement>();
  constructor(private getMuted: () => boolean) {}
  /** Fire a one-shot. No-op when muted. Clones the element so rapid repeats overlap. */
  play(name: Sfx): void {
    if (this.getMuted()) return;
    let base = this.buffers.get(name);
    if (!base) { base = new Audio(FILES[name]); base.preload = 'auto'; this.buffers.set(name, base); }
    const node = base.cloneNode(true) as HTMLAudioElement;
    node.volume = VOL[name];
    node.play().catch(() => {});
  }
}
```

- [ ] **Step 2: Source the 5 SFX assets.** Prefer CC0/CC-BY (freesound.org CC0, mixkit, kenney.nl CC0). Coin = arcade coin-insert; poweron = console chime/boot; step = soft UI tick; correct = bright ping; wrong = low buzz. Keep each < ~60KB. Record each file's name + author + license + URL in `public/sfx/ATTRIBUTIONS.md` (same format as `public/music/ATTRIBUTIONS.md`). CC0 needs no in-app credit; any CC-BY/non-free goes in the Credits modal (Task E1).

- [ ] **Step 3: Verify.** `npm run typecheck` passes. In the browser, confirm each `/sfx/*.mp3` returns 200 (Network tab) and `new Audio('/sfx/coin.mp3').play()` works after a user gesture. No console errors.

---

## Phase B — Quiz (Feature 3, self-contained)

### Task B1: Question generator

**Files:**
- Create: `src/quiz/types.ts`
- Create: `src/quiz/generate.ts`

- [ ] **Step 1: Types.**

```ts
// src/quiz/types.ts
import type { MuseumItem } from '../types';
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];     // length 4
  correctIndex: number;  // 0..3
  itemSlug?: string;     // item this question is "about", for the review link
}
```

- [ ] **Step 2: Generator.** `generateQuiz(items: MuseumItem[], eras: Era[], count = 10): QuizQuestion[]`. Build a pool of candidate questions across these kinds, then sample `count` distinct ones (shuffle, dedupe by `id`):
  - **release-year:** "In what year was {name} released?" — correct = `item.year`; distractors = 3 nearby plausible years (±1..6, deduped, no collision with correct).
  - **maker:** "Who made {name}?" — correct = `item.maker`; distractors = 3 other distinct makers sampled from the same `kind`.
  - **era:** "Which era does {name} belong to?" — correct = era.name for `item.era`; distractors = 3 other era names.
  - **launched-first:** "Which launched first?" — pick 2 items with different years; options are 4 item names (the 2 + 2 more), correct = the earliest among the listed; phrase as "Which of these came first?".
  - **spec:** only for items whose `specs` has a clean key (e.g. "Units sold", "CPU", "RAM"): "What was {name}'s {key}?" — correct = the spec value; distractors = same-key values from 3 other items.
  Each option list: correct + 3 distractors, deduped (skip the question if it can't get 3 distinct plausible distractors), then shuffled; set `correctIndex` to the shuffled position. Use `Math.random()` (fine in app code). Guarantee `count` questions by drawing from the pool; if pool < count, return what exists.

- [ ] **Step 3: Verify.** `npm run typecheck` passes. Add a temporary `console.log(generateQuiz(items, eras))` invocation path is unnecessary — instead verify live in Task B2.

### Task B2: Quiz modal

**Files:**
- Create: `src/quiz/Quiz.tsx`
- Create CSS: append a `/* ── Quiz ── */` block to `src/styles.css`
- Modify: `src/App.tsx` (state + masthead button + render)

- [ ] **Step 1: Component.** Props:

```ts
interface Props {
  items: MuseumItem[];
  eras: Era[];
  onClose: () => void;
  onOpenItem: (item: MuseumItem) => void; // review-screen placard link
  sfx?: { play: (n: 'correct' | 'wrong' | 'step') => void };
}
```
Behavior: on mount, `generateQuiz(...)` once into state. Render the modal using the **Credits overlay pattern** (`backdrop` + `card` + GSAP `fromTo` entrance + Escape-to-close + backdrop click closes + `stopPropagation` on card). Show one question at a time: prompt, 4 option buttons, "Q {i+1} / {n}" progress, running score. On answer: lock options, highlight correct (green) + chosen-if-wrong (red), play `correct`/`wrong` sfx, then a "Next" button. After the last question: an **end screen** with final score (`x / n`), a per-question review list (prompt, your answer vs correct, and if `itemSlug` set a "View →" button calling `onOpenItem`), and a "Play again" button that regenerates.

- [ ] **Step 2: CSS.** Reuse Credits tokens (`--panel`, `--line`, magenta `#ff2bd6`, cyan `#7ee0ff`). Classes: `.quiz-backdrop` (centered, z-index ≥ 110, blur), `.quiz-card`, `.quiz-close`, `.quiz-progress`, `.quiz-option` (+ `.correct`/`.wrong`/`.locked` states), `.quiz-next`, `.quiz-review`, `.quiz-score`. **Specificity caution:** scope state modifiers under `.quiz-card` so they outrank base `.quiz-option` (learned from the credits specificity bug).

- [ ] **Step 3: Wire into App.** In `src/App.tsx`: `const [quizOpen, setQuizOpen] = useState(false);`. Add a masthead button next to Credits: `<button className="quiz-trigger" onClick={() => setQuizOpen(true)}>❓ Quiz</button>`. Render at top level: `{quizOpen && <Quiz items={data.items} eras={data.eras} onClose={() => setQuizOpen(false)} onOpenItem={(it) => { setQuizOpen(false); setPlacardItem(it); /* switch to timeline if needed */ }} sfx={sfxRef.current} />}`. (Reuse the existing `onPick` logic from SearchPalette for opening an item, including switching `view` to timeline if currently in gallery.)

- [ ] **Step 4: Verify (live).** `npm run typecheck` passes. Via playwright-cli on :5173: click ❓ Quiz → modal opens → answer all 10 → score increments only on correct → end screen shows score + review → a review "View →" opens that item's placard → "Play again" yields different questions → Escape closes. Screenshot the question screen + end screen. No console errors.

---

## Phase C — Guided tour (Feature 2)

### Task C1: Expose Timeline camera API

**Files:**
- Modify: `src/timeline/Timeline.tsx` (add `forwardRef` + `useImperativeHandle`)
- Modify: `src/App.tsx` (hold `timelineRef`, pass to Timeline)

- [ ] **Step 1: Expose an imperative handle.** Wrap `Timeline` in `forwardRef`. Expose:

```ts
export interface TimelineHandle {
  frameWorld: (duration?: number) => void;
  frameEraBySlug: (slug: string, duration?: number) => void; // resolves the EraBlock then calls existing frameEra
}
```
Implement with `useImperativeHandle` over the existing internal `frameWorld` / `frameEra` functions (look up the `EraBlock` for `slug` in the computed layout). Don't change existing behavior; this is additive.

- [ ] **Step 2: App holds the ref.** `const timelineRef = useRef<TimelineHandle>(null);` and pass `ref={timelineRef}` where `<Timeline .../>` is rendered. Confirm existing timeline interaction still works.

- [ ] **Step 3: Verify.** `npm run typecheck` passes. Timeline still pans/zooms/dives normally on :5173 (regression check). From devtools, `timelineRef` methods are reachable (or defer proof to Task C2).

### Task C2: Tour controller + caption overlay

**Files:**
- Create: `src/tour/Tour.tsx`
- Create CSS: append `/* ── Guided tour ── */` block to `src/styles.css`
- Modify: `src/App.tsx` (state + masthead ▶ Tour button + render; only when `view.mode === 'timeline'`)

- [ ] **Step 1: Component.** Props:

```ts
interface Props {
  eras: Era[];
  timeline: React.RefObject<TimelineHandle>;
  onEnd: () => void;
  sfx?: { play: (n: 'step') => void };
}
```
Behavior: on mount, build a step list = `[overview, ...eras in chronological order]`. Step 0: `timeline.current?.frameWorld(1.2)`, caption = intro ("A tour through the history of video games"). Each era step: `timeline.current?.frameEraBySlug(era.slug, 1.2)`, caption = era.name + era.tagline + one fact (e.g. year range `years[0]–years[1]`), play `step` sfx. Use a GSAP timeline OR a `setTimeout`/interval driver with ~5s dwell per step; advance automatically; clear timers on unmount. Caption card fades in/out (GSAP). Controls overlay: "Skip" / "End tour" button + "Esc to exit". Esc, the End button, or reaching the last step → `onEnd()`. Ensure all timers are cleared on `onEnd`/unmount (no dangling tweens — follow the cleanup pattern from `Credits.tsx`).

- [ ] **Step 2: CSS.** `.tour-caption` (lower-center card, `--panel`/`--line`, GSAP-animated), `.tour-controls`, `.tour-progress` (dots or "3 / 7"). Pointer-events scoped so the tour overlay doesn't block the timeline beneath except for its controls.

- [ ] **Step 3: Wire into App.** `const [tourOn, setTourOn] = useState(false);`. Masthead button (timeline view only): `<button className="tour-trigger" onClick={() => setTourOn(true)}>▶ Tour</button>`. Render: `{tourOn && view.mode === 'timeline' && <Tour eras={data.eras} timeline={timelineRef} onEnd={() => setTourOn(false)} sfx={sfxRef.current} />}`.

- [ ] **Step 4: Verify (live).** `npm run typecheck` passes. On :5173: click ▶ Tour → camera frames overview then pans era→era with captions advancing (~5s each) → step sfx fires (network/no-error check) → Esc and "End tour" both stop cleanly and restore normal interaction → no dangling animation (timeline responds to wheel/drag after). Screenshot mid-tour. No console errors.

### Task C3: Wire SFX into existing interactions

**Files:**
- Modify: `src/App.tsx` (create `sfxRef`, pass `getMuted`), `src/timeline/Timeline.tsx` or `src/placard/Placard.tsx` (coin on item open), App `enterEra` (poweron).

- [ ] **Step 1: Create the engine in App.** `const sfxRef = useRef<SfxEngine>(); if (!sfxRef.current) sfxRef.current = new SfxEngine(() => musicRef.current?.isMuted ?? false);`. (Place near `musicRef` init.)
- [ ] **Step 2: Fire cues.** `coin` when a placard opens (in the `onSelect`/`setPlacardItem` path). `poweron` in `enterEra` before/at the transition. `correct`/`wrong` already wired via Quiz props; `step` via Tour props.
- [ ] **Step 3: Verify.** `npm run typecheck` passes. On :5173 with audio unmuted: opening a placard and entering an era trigger sound (or, headless: confirm `sfxRef.current.play` is called and the audio elements are created, no errors). Muting silences them.

---

## Phase D — Data-viz lane (Feature 1, DB-backed)

### Task D1: Metrics table + parsing/fetch lib

**Files:**
- Modify: `api/_lib/db.ts` (add `ensureMetricsTable`, `MetricRow`)
- Create: `api/_lib/metrics.ts`

- [ ] **Step 1: Table + row type.** In `api/_lib/db.ts` add a `MetricRow` interface mirroring the table and an `ensureMetricsTable(sql)` that runs:

```sql
CREATE TABLE IF NOT EXISTS item_metrics (
  slug TEXT PRIMARY KEY REFERENCES museum_items(slug) ON DELETE CASCADE,
  units_sold BIGINT,
  units_sold_label TEXT,
  launch_price_usd NUMERIC,
  cpu_mhz NUMERIC,
  ram_bytes BIGINT,
  source_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Parsers (specs-first, no network).** In `api/_lib/metrics.ts`:
  - `parseUnitsSold(label: string): number | undefined` — handle "~155 million", "30 million", "101.63 million", "1.5 billion", plain integers with commas.
  - `parsePriceUsd(label: string): number | undefined` — handle "US$189.95", "$299", "¥…"→skip (only USD).
  - `parseCpuMhz(label: string): number | undefined` — handle "1.19 MHz", "3.2 GHz"→3200, "@ 93.75 MHz".
  - `parseRamBytes(label: string): number | undefined` — handle "128 bytes", "2 KB", "512 MB", "8 GB" → bytes.
  - `metricsFromSpecs(item: MuseumItem): Partial<MetricRow>` — read `specs["Units sold"]`, `specs["Launch price"]`, and CPU/RAM keys (try "CPU", "Processor", "RAM", "Memory"); return normalized numbers + preserve `units_sold_label` from the raw spec string. No `source_url` (it's curated catalog data).
- [ ] **Step 3: Free fetch for gaps.** `fetchWikidataMetrics(item): Promise<Partial<MetricRow>>` — query Wikidata for the article's entity and read units-sold/price if present. Approach: resolve the Wikipedia title (reuse `resolvedTitle`/`wikiTitle`) → Wikidata REST `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=<title>&props=claims&format=json` → read P1092 (quantity produced) and price-related claims if available; set `source_url` to the Wikidata entity URL. **Coverage is partial — return `{}` when nothing usable; never guess.** 8s timeout like `wikipedia.ts`. (Wikipedia infobox parse is an optional secondary fallback; only add if Wikidata yields too little.)
- [ ] **Step 4: Verify.** `npm run typecheck` passes. Unit-spot-check parsers by a throwaway node eval in the sandbox (not committed): e.g. `parseUnitsSold("~155 million") === 155000000`, `parseRamBytes("512 MB") === 536870912`.

### Task D2: Enrich endpoint + dev route

**Files:**
- Create: `api/enrich-metrics.ts`
- Modify: `vite-plugins/api-dev.ts` (register `/api/enrich-metrics`)

- [ ] **Step 1: Handler.** `POST /api/enrich-metrics` (optional `?token=` gate like seed). Steps: `ensureMetricsTable(sql)`; load all items (`ALL_ITEMS` or DB rows); for each: `const m = metricsFromSpecs(item);` then **only if** `m.units_sold` or `m.launch_price_usd` is missing, `Object.assign(m, await fetchWikidataMetrics(item))` (don't overwrite present specs-derived values); `UPSERT` into `item_metrics` (`ON CONFLICT (slug) DO UPDATE`, but **do not** null-out existing non-null columns — coalesce). Idempotent. Return `{ enriched: n, fetched: k, skipped: [...] }`. Concurrency ≤ 4 like seed.
- [ ] **Step 2: Dev route.** In `vite-plugins/api-dev.ts` add `/api/enrich-metrics` alongside `/api/seed` (same SSR-load pattern).
- [ ] **Step 3: Verify.** `npm run typecheck` passes. Run the endpoint once: `POST http://localhost:5173/api/enrich-metrics` (via ctx_execute fetch). Then query the DB: confirm rows exist and spot-check known values (PS2 `units_sold` ≈ 155000000, Wii ≈ 101000000, Atari 2600 from specs). Report how many came from specs vs fetched vs missing.

### Task D3: Expose metrics through /api/museum

**Files:**
- Modify: `shared/types.ts` (add `ItemMetrics` + `MuseumItem.metrics?`)
- Modify: `api/museum.ts` (left join, map into payload)

- [ ] **Step 1: Types.**

```ts
// shared/types.ts
export interface ItemMetrics {
  unitsSold?: number;
  unitsSoldLabel?: string;
  launchPriceUsd?: number;
  cpuMhz?: number;
  ramBytes?: number;
  sourceUrl?: string;
}
// add to MuseumItem:
  metrics?: ItemMetrics;
```

- [ ] **Step 2: Join.** In `api/museum.ts`, after fetching `museum_items`, fetch `item_metrics` (one query), build a `Map<slug, ItemMetrics>`, and attach `metrics` in `rowToItem`/post-map. Catalog fallback path leaves `metrics` undefined (lane simply shows no bars then). Keep response shape backward-compatible.
- [ ] **Step 3: Verify.** `npm run typecheck` passes. `GET /api/museum` (ctx_execute) → confirm items now include `metrics` with real numbers for known consoles. Confirm `source: 'database'`.

### Task D4: Data-viz lane render + toggle

**Files:**
- Create: `src/timeline/DataLane.tsx`
- Modify: `src/timeline/Timeline.tsx` (render the lane in world space under the eras; pass items + current LOD/scale)
- Create CSS: append `/* ── Data lane ── */` to `src/styles.css`
- Modify: `src/App.tsx` (lane-mode state + masthead toggle, OR keep toggle local to Timeline)

- [ ] **Step 1: Component.** `DataLane({ items, mode, yBase })` where `mode: 'units' | 'hardware' | 'off'`. Position each datum at `xOfYear(item.year)` (import from `layout.ts`). **Units mode:** for each console with `metrics.unitsSold`, draw a bar (height scaled to the max units in view; show `unitsSoldLabel` on hover/label). Consoles lacking data render a muted "no data" tick — never a fabricated bar. **Hardware mode:** plot `cpuMhz` and `ramBytes` as two log-scaled polylines across console launch years (legend + axis ticks). Footnote: a small "sources" affordance linking `metrics.sourceUrl` where present.
- [ ] **Step 2: Integrate into Timeline world.** Render `<DataLane>` inside the transformed world container so it pans/zooms with the timeline, positioned below the era blocks (compute a `yBase` below the tallest era block). **Only mount when `lod !== 'eras'`** (scale ≥ 0.16) to protect zoom perf — gate on the existing LOD value. Mode toggle: a small control in the Timeline legend/HUD (Units / Hardware / Off), default Off so it's opt-in and never on at first paint.
- [ ] **Step 3: CSS.** `.data-lane`, `.data-bar`, `.data-bar.empty`, `.data-line`, `.data-legend`, `.data-toggle`. Use era palette accents; keep paint cheap (no blur/shadow on many elements — respect the perf fix).
- [ ] **Step 4: Verify (live).** `npm run typecheck` passes. On :5173: toggle Units → bars appear at correct years aligned to the time axis, known consoles show plausible heights, data-less consoles show the muted tick (not a guess); toggle Hardware → CPU/RAM lines render with legend; toggle Off → lane gone. Zoom to far overview → lane is hidden, **zoom stays smooth** (perf regression check). Screenshot Units + Hardware modes. No console errors.

---

## Phase E — Credits + final pass

### Task E1: Credits / attributions update

**Files:**
- Modify: `src/credits/Credits.tsx` (add SFX attribution if any non-CC0)
- Modify: `public/sfx/ATTRIBUTIONS.md` (final list)

- [ ] **Step 1.** If any SFX is CC-BY/non-free, add a "Sound effects" line to the Credits modal crediting author/license/source. CC0 assets need no in-app credit but still get listed in `ATTRIBUTIONS.md`.
- [ ] **Step 2: Verify.** `npm run typecheck` passes. Credits modal renders the new line (if added) without layout breakage.

### Task E2: Full regression + verification sweep

- [ ] **Step 1.** `npm run typecheck` clean across the whole branch.
- [ ] **Step 2.** `npm run build` succeeds (tsc + vite build).
- [ ] **Step 3.** Live sweep on :5173: all three features work end-to-end; existing features (timeline zoom/dive, gallery, search, placard, credits, music/mute) still work; no console errors. Screenshots of each feature.
- [ ] **Step 4.** Report results to the user. **Do not commit** — await explicit instruction, then commit per-feature (or as the user directs) with the Co-Authored-By trailer.

---

## Self-review notes (author)

- **Spec coverage:** Quiz (B1–B2), Tour (C1–C2), SFX (A1, C3), Data-viz pipeline (D1–D3) + render (D4), Credits update (E1), verification gates every task. Deep-links intentionally absent (dropped). ✓
- **Type consistency:** `TimelineHandle.frameEraBySlug`, `SfxEngine.play(Sfx)`, `ItemMetrics`/`MuseumItem.metrics`, `QuizQuestion` shape are defined once (C1/A1/D3/B1) and referenced consistently downstream. ✓
- **No commits** anywhere in steps (user rule). Verification via `typecheck` + live runs replaces TDD/commit gates (no test runner exists). ✓
- **Perf guard:** data-lane gated to `lod !== 'eras'` + default Off, protecting the prior zoom-perf fix. ✓
- **Honest data:** specs-first, fetch-only-missing, never overwrite/guess, show gaps. ✓
