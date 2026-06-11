import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Era, MuseumData, MuseumItem } from './types';
import { loadMuseum } from './api/client';
import { Timeline } from './timeline/Timeline';
import { Placard } from './placard/Placard';
import { Gallery } from './gallery/Gallery';
import { SearchPalette } from './search/SearchPalette';

type View = { mode: 'timeline' } | { mode: 'gallery'; era: Era };

export default function App() {
  const [data, setData] = useState<MuseumData | null>(null);
  const [view, setView] = useState<View>({ mode: 'timeline' });
  const [placardItem, setPlacardItem] = useState<MuseumItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const transitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMuseum().then(setData);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /** Era doorway: a color wash with the era's name, then the view swaps under it. */
  const transitionTo = useCallback((next: View, era: Era) => {
    const el = transitionRef.current;
    if (!el) {
      setView(next);
      return;
    }
    el.style.background = era.palette.bg;
    el.style.color = era.palette.text;
    el.querySelector('.transition-title')!.textContent =
      next.mode === 'gallery' ? era.name : 'The Timeline';
    const tl = gsap.timeline();
    tl.set(el, { display: 'flex' })
      .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.in' })
      .add(() => {
        setPlacardItem(null);
        setView(next);
      })
      .to(el, { opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.35 })
      .set(el, { display: 'none' });
  }, []);

  const enterEra = useCallback(
    (era: Era) => transitionTo({ mode: 'gallery', era }, era),
    [transitionTo]
  );
  const exitToTimeline = useCallback(() => {
    if (view.mode === 'gallery') transitionTo({ mode: 'timeline' }, view.era);
  }, [view, transitionTo]);

  if (!data) {
    return (
      <div className="boot-splash">
        <div className="boot-splash-logo">INSERT&nbsp;COIN</div>
        <div className="boot-splash-sub">LOADING THE MUSEUM OF VIDEO GAME HISTORY…</div>
      </div>
    );
  }

  const eraOf = (item: MuseumItem): Era => data.eras.find((e) => e.slug === item.era)!;

  return (
    <div className="app">
      {view.mode === 'timeline' && (
        <>
          <header className="masthead">
            <h1>
              The Museum of <span>Video Game History</span>
            </h1>
            <div className="masthead-right">
              <button className="search-trigger" onClick={() => setSearchOpen(true)}>
                ⌕ Search <kbd>Ctrl K</kbd>
              </button>
              <span className={`source-badge ${data.source}`}>
                {data.source === 'database' ? '⛁ Wikipedia-enriched archive' : '◈ curated catalog'}
              </span>
            </div>
          </header>
          <Timeline data={data} onSelect={setPlacardItem} onEnterEra={enterEra} />
        </>
      )}

      {view.mode === 'gallery' && (
        <Gallery
          era={view.era}
          items={data.items.filter((i) => i.era === view.era.slug)}
          onExit={exitToTimeline}
        />
      )}

      {placardItem && view.mode === 'timeline' && (
        <Placard
          item={placardItem}
          era={eraOf(placardItem)}
          onClose={() => setPlacardItem(null)}
          onEnterEra={enterEra}
        />
      )}

      {searchOpen && (
        <SearchPalette
          items={data.items}
          eras={data.eras}
          onPick={(item) => {
            // Search always lands on the placard; from a gallery, step out first.
            if (view.mode === 'gallery') {
              const era = eraOf(item);
              transitionTo({ mode: 'timeline' }, era);
              window.setTimeout(() => setPlacardItem(item), 900);
            } else {
              setPlacardItem(item);
            }
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}

      <div className="era-transition" ref={transitionRef} aria-hidden>
        <span className="transition-title" />
        <span className="transition-sub">now entering</span>
      </div>
    </div>
  );
}
