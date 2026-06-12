import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Era, MuseumData, MuseumItem } from './types';
import { loadMuseum } from './api/client';
import { Timeline } from './timeline/Timeline';
import { Placard } from './placard/Placard';
import { Gallery } from './gallery/Gallery';
import { SearchPalette } from './search/SearchPalette';
import { useIsBlockedDevice, DesktopGate } from './DesktopGate';
import { MusicEngine } from './audio/ambience';

type View = { mode: 'timeline' } | { mode: 'gallery'; era: Era };

export default function App() {
  const blocked = useIsBlockedDevice();
  const [data, setData] = useState<MuseumData | null>(null);
  const [view, setView] = useState<View>({ mode: 'timeline' });
  const [placardItem, setPlacardItem] = useState<MuseumItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const transitionRef = useRef<HTMLDivElement>(null);

  // Single music engine instance for the lifetime of the app
  const musicRef = useRef<MusicEngine | null>(null);
  if (!musicRef.current) musicRef.current = new MusicEngine();
  const [muted, setMuted] = useState(() => musicRef.current!.isMuted);

  // First-gesture autoplay: browsers block audio until a user gesture
  useEffect(() => {
    let gestured = false;
    const onGesture = () => {
      if (gestured) return;
      gestured = true;
      // Only auto-start lobby if we're still on the timeline
      setView((v) => {
        if (v.mode === 'timeline') {
          musicRef.current?.play('lobby');
        }
        return v;
      });
    };
    window.addEventListener('pointerdown', onGesture, { once: true });
    window.addEventListener('keydown', onGesture, { once: true });
    window.addEventListener('wheel', onGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('wheel', onGesture);
    };
  }, []);

  // Drive track by view — crossfades on every timeline↔gallery transition
  useEffect(() => {
    if (view.mode === 'gallery') {
      musicRef.current?.play(view.era.galleryTheme);
    } else {
      musicRef.current?.play('lobby');
    }
  }, [view]);

  // Stop engine on unmount
  useEffect(() => {
    return () => musicRef.current?.stop();
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      musicRef.current?.setMuted(next);
      return next;
    });
  }, []);

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

  if (blocked) return <DesktopGate />;

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
              <button className="masthead-mute" onClick={toggleMute} aria-label={muted ? 'Unmute music' : 'Mute music'}>
                {muted ? '🔇' : '🔊'}
              </button>
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
          muted={muted}
          onToggleMute={toggleMute}
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
