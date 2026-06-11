import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Era, MuseumItem } from '../types';
import { GalleryApp } from './GalleryApp';
import { ItemArt } from '../art/ItemArt';

interface Props {
  era: Era;
  items: MuseumItem[];
  onExit: () => void;
}

/**
 * Mounts the Three.js engine and layers the HTML chrome over it: era HUD,
 * exit button, and the inspection panel that slides in when the camera
 * finishes its glide into a display.
 */
export function Gallery({ era, items, onExit }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<GalleryApp | null>(null);
  const [inspected, setInspected] = useState<MuseumItem | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const app = new GalleryApp(mount, era, items, {
      onInspect: (item) => setInspected(item),
      onInspectClosed: () => setInspected(null),
    });
    appRef.current = app;
    const onResize = () => app.resize();
    window.addEventListener('resize', onResize);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') app.exitInspect();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      app.dispose();
      appRef.current = null;
    };
  }, [era, items]);

  useEffect(() => {
    if (inspected && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [inspected]);

  return (
    <div
      className="gallery"
      data-theme={era.galleryTheme}
      style={{
        ['--era-bg' as string]: era.palette.bg,
        ['--era-primary' as string]: era.palette.primary,
        ['--era-accent' as string]: era.palette.accent,
        ['--era-text' as string]: era.palette.text,
      }}
    >
      <div className="gallery-mount" ref={mountRef} />

      <header className="gallery-hud">
        <button className="hud-back" onClick={onExit}>
          ← Timeline
        </button>
        <div className="hud-era">
          <h1>{era.name}</h1>
          <span>
            {era.years[0]}–{era.years[1]} · {era.tagline}
          </span>
        </div>
      </header>

      {!inspected && (
        <footer className="gallery-controls">
          <kbd>←</kbd> <kbd>→</kbd> walk the hall · move mouse to look · click a display to inspect
        </footer>
      )}

      {inspected && (
        <aside className="inspect-panel" ref={panelRef}>
          <button className="inspect-close" onClick={() => appRef.current?.exitInspect()}>
            ✕ Step back
          </button>
          <div className="inspect-art">
            <ItemArt item={inspected} era={era} width={260} height={220} />
            {inspected.imageStatus === 'ok' && inspected.imageLicense && (
              <span className="inspect-license">{inspected.imageLicense} · Wikimedia Commons</span>
            )}
          </div>
          <span className="inspect-kind">
            {inspected.kind === 'console' ? 'HARDWARE' : 'SOFTWARE'} · {inspected.year}
            {inspected.yearEnd ? `–${inspected.yearEnd}` : ''}
          </span>
          <h2>{inspected.name}</h2>
          <p className="inspect-maker">{inspected.maker}</p>
          <p className="inspect-summary">{inspected.summary}</p>
          <table className="inspect-specs">
            <tbody>
              {Object.entries(inspected.specs).map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Legacy &amp; Cultural Impact</h3>
          <p className="inspect-legacy">{inspected.legacy}</p>
          {inspected.wikiUrl && (
            <a href={inspected.wikiUrl} target="_blank" rel="noreferrer" className="wiki-link">
              Read on Wikipedia ↗
            </a>
          )}
        </aside>
      )}
    </div>
  );
}
