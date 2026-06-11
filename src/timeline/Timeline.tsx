import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Era, MuseumData, MuseumItem } from '../types';
import { ItemArt } from '../art/ItemArt';
import {
  computeLayout,
  lodForScale,
  titleSizeFor,
  xOfYear,
  clamp,
  type EraBlock,
  type Lod,
  GAME_CARD_W,
  GAME_CARD_H,
} from './layout';

interface Props {
  data: MuseumData;
  onSelect: (item: MuseumItem) => void;
  onEnterEra: (era: Era) => void;
}

interface Camera {
  x: number;
  y: number;
  s: number;
}

const MIN_SCALE = 0.055;
const MAX_SCALE = 2.6;

/**
 * The infinite canvas. The world is a single absolutely-positioned DOM tree
 * transformed imperatively (translate + scale) for 60fps pan/zoom; React only
 * re-renders when the LOD bucket changes. GSAP drives all animated camera
 * moves (wheel zoom glide, double-click era dives, legend jumps).
 */
export function Timeline({ data, onSelect, onEnterEra }: Props) {
  const layout = useMemo(() => computeLayout(data.eras, data.items), [data]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const cam = useRef<Camera>({ x: 0, y: 0, s: MIN_SCALE });
  const [lod, setLod] = useState<Lod>('eras');
  const lodRef = useRef<Lod>('eras');

  const decades = useMemo(() => {
    const out: number[] = [];
    for (let y = Math.ceil(layout.minYear / 5) * 5; y <= layout.maxYear + 2; y += 5) out.push(y);
    return out;
  }, [layout]);

  /** Push camera state into the DOM. The only place transforms are written. */
  const apply = () => {
    const { x, y, s } = cam.current;
    if (worldRef.current) {
      worldRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    }
    if (rulerRef.current) {
      for (const el of rulerRef.current.children) {
        const year = Number((el as HTMLElement).dataset.year);
        (el as HTMLElement).style.transform = `translateX(${xOfYear(year) * s + x}px)`;
      }
    }
    const next = lodForScale(s);
    if (next !== lodRef.current) {
      lodRef.current = next;
      setLod(next);
    }
  };

  const animateTo = (target: Partial<Camera>, duration = 1.1) => {
    gsap.killTweensOf(cam.current);
    gsap.to(cam.current, {
      ...target,
      duration,
      ease: 'power3.inOut',
      onUpdate: apply,
    });
  };

  /** Frame a world-space rect with padding. */
  const frameRect = (wx: number, wy: number, ww: number, wh: number, duration = 1.15) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const pad = 0.92;
    const s = clamp(Math.min((vp.clientWidth / ww) * pad, (vp.clientHeight / wh) * pad), MIN_SCALE, MAX_SCALE);
    animateTo(
      {
        s,
        x: vp.clientWidth / 2 - (wx + ww / 2) * s,
        y: vp.clientHeight / 2 - (wy + wh / 2) * s,
      },
      duration
    );
  };

  const frameWorld = (duration = 1.15) =>
    frameRect(0, 0, layout.width, layout.height, duration);

  const frameEra = (block: EraBlock, duration = 1.2) =>
    frameRect(block.x - 60, block.y - 60, block.width + 120, block.height + 120, duration);

  // Initial fit + input wiring.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    // Fit the whole half-century on first paint, no animation.
    const pad = 0.92;
    const s = clamp(
      Math.min((vp.clientWidth / layout.width) * pad, (vp.clientHeight / layout.height) * pad),
      MIN_SCALE,
      MAX_SCALE
    );
    cam.current = {
      s,
      x: vp.clientWidth / 2 - (layout.width / 2) * s,
      y: vp.clientHeight / 2 - (layout.height / 2) * s,
    };
    apply();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { x, y, s } = cam.current;
      const factor = Math.exp(-e.deltaY * 0.0016);
      const ns = clamp(s * factor, MIN_SCALE, MAX_SCALE);
      const rect = vp.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      gsap.killTweensOf(cam.current);
      // Keep the point under the cursor fixed while scale changes.
      gsap.to(cam.current, {
        s: ns,
        x: cx - ((cx - x) / s) * ns,
        y: cy - ((cy - y) / s) * ns,
        duration: 0.35,
        ease: 'power2.out',
        onUpdate: apply,
      });
    };

    let dragging = false;
    let captured = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    // Multi-pointer tracking for touch pinch-zoom.
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDist = 0;

    const pinchInfo = () => {
      const [a, b] = [...pointers.values()];
      return {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      gsap.killTweensOf(cam.current);
      if (pointers.size === 2) {
        dragging = false;
        pinchDist = pinchInfo().dist;
        return;
      }
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      // Deliberately NO setPointerCapture here: capturing on pointerdown
      // retargets the compatibility mouseup to the viewport, which kills the
      // `click` event for every node inside the canvas. Capture starts only
      // once movement proves this is a drag, not a click.
    };
    const onPointerMove = (e: PointerEvent) => {
      if (pointers.has(e.pointerId)) {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (pointers.size >= 2) {
        // Pinch: zoom around the midpoint, keeping it fixed in world space.
        const { dist, midX, midY } = pinchInfo();
        if (pinchDist > 0) {
          const { x, y, s } = cam.current;
          const ns = clamp(s * (dist / pinchDist), MIN_SCALE, MAX_SCALE);
          const rect = vp.getBoundingClientRect();
          const cx = midX - rect.left;
          const cy = midY - rect.top;
          cam.current.s = ns;
          cam.current.x = cx - ((cx - x) / s) * ns;
          cam.current.y = cy - ((cy - y) / s) * ns;
          apply();
        }
        pinchDist = dist;
        return;
      }
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      lastX = e.clientX;
      lastY = e.clientY;
      if (!captured && moved > 6) {
        captured = true;
        vp.setPointerCapture(e.pointerId);
        vp.classList.add('dragging');
      }
      cam.current.x += dx;
      cam.current.y += dy;
      apply();
    };
    const onPointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinchDist = 0;
      dragging = false;
      if (captured) {
        captured = false;
        vp.classList.remove('dragging');
        // Suppress the click that ends a drag gesture.
        const swallow = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        vp.addEventListener('click', swallow, { capture: true, once: true });
        try {
          vp.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
      gsap.killTweensOf(cam.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  return (
    <div className={`timeline lod-${lod}`} ref={viewportRef}>
      <div className="ruler" ref={rulerRef} aria-hidden>
        {decades.map((year) => (
          <div key={year} className={`ruler-mark ${year % 10 === 0 ? 'decade' : ''}`} data-year={year}>
            <span>{year}</span>
          </div>
        ))}
      </div>

      <div className="world" ref={worldRef}>
        {layout.blocks.map((block) => (
          <EraBlockView
            key={block.era.slug}
            block={block}
            lod={lod}
            onZoom={() => frameEra(block)}
            onSelect={onSelect}
            onEnterEra={onEnterEra}
            eraOf={(item) => data.eras.find((e) => e.slug === item.era)!}
          />
        ))}
      </div>

      <nav className="legend" aria-label="Era navigation">
        <button className="legend-chip overview" onClick={() => frameWorld()}>
          ⊙ Overview
        </button>
        {layout.blocks.map((b) => (
          <button
            key={b.era.slug}
            className="legend-chip"
            style={{ ['--chip' as string]: b.era.palette.primary }}
            onClick={() => frameEra(b)}
          >
            {b.era.short}
          </button>
        ))}
      </nav>

      <div className="hint">scroll to zoom · drag to pan · click an era to dive in</div>
    </div>
  );
}

interface BlockProps {
  block: EraBlock;
  lod: Lod;
  onZoom: () => void;
  onSelect: (item: MuseumItem) => void;
  onEnterEra: (era: Era) => void;
  eraOf: (item: MuseumItem) => Era;
}

function EraBlockView({ block, lod, onZoom, onSelect, onEnterEra, eraOf }: BlockProps) {
  const { era } = block;
  const titleSize = titleSizeFor(block.width, era.name);
  return (
    <section
      className="era-block"
      data-theme={era.galleryTheme}
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: block.height,
        ['--era-bg' as string]: era.palette.bg,
        ['--era-primary' as string]: era.palette.primary,
        ['--era-accent' as string]: era.palette.accent,
        ['--era-text' as string]: era.palette.text,
      }}
      onClick={(e) => {
        // At overview zoom the whole block is one big "dive in" target.
        if (lod === 'eras') {
          e.stopPropagation();
          onZoom();
        }
      }}
    >
      <header className="era-head">
        <div className="era-title-row">
          <h2 style={{ fontSize: titleSize }}>{era.name}</h2>
          <span className="era-years">
            {era.years[0]} — {era.years[1]}
          </span>
        </div>
        <p className="era-tagline">{era.tagline}</p>
        <p className="era-desc">{era.description}</p>
        <button
          className="enter-gallery"
          onClick={(e) => {
            e.stopPropagation();
            onEnterEra(era);
          }}
        >
          ▶ Enter the {era.short} Gallery
        </button>
      </header>

      <div className="era-consoles">
        {block.consoles.map(({ item, top, left, width }) => (
          <button
            key={item.slug}
            className="console-bar"
            style={{ top, left, width }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            title={`${item.name} (${item.year})`}
          >
            <span className="console-year">{item.year}</span>
            <span className="console-name">{item.name}</span>
            <span className="console-span">{item.yearEnd ? `→ ${item.yearEnd}` : '→'}</span>
          </button>
        ))}
      </div>

      <div className="era-games">
        {block.games.map(({ item, top, left }) => (
          <button
            key={item.slug}
            className="game-card"
            style={{ top, left, width: GAME_CARD_W, height: GAME_CARD_H }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
          >
            <ItemArt item={item} era={eraOf(item)} width={GAME_CARD_W - 12} height={GAME_CARD_H - 44} />
            <span className="game-name">{item.name}</span>
            <span className="game-year">{item.year}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
