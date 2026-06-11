import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { Era, MuseumItem } from '../types';
import { ItemArt } from '../art/ItemArt';

interface Props {
  item: MuseumItem;
  era: Era;
  onClose: () => void;
  onEnterEra: (era: Era) => void;
}

/**
 * The museum placard — a spec sheet styled to its era (retro box insert for
 * the cartridge ages, glass slab for the modern wall). GSAP handles the
 * entrance/exit so opening one feels like lifting a card off the timeline.
 */
export function Placard({ item, era, onClose, onEnterEra }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    closingRef.current = false;
    const tl = gsap.timeline();
    tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' })
      .fromTo(
        cardRef.current,
        { y: 64, opacity: 0, rotateX: -8, scale: 0.94 },
        { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 0.55, ease: 'power3.out' },
        '-=0.15'
      );
    return () => {
      tl.kill();
    };
  }, [item.slug]);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    gsap.to(cardRef.current, { y: 40, opacity: 0, scale: 0.95, duration: 0.28, ease: 'power2.in' });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.08,
      ease: 'power1.in',
      onComplete: onClose,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="placard-backdrop" ref={backdropRef} onClick={close} role="dialog" aria-modal>
      <article
        className="placard"
        data-theme={era.galleryTheme}
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          ['--era-bg' as string]: era.palette.bg,
          ['--era-primary' as string]: era.palette.primary,
          ['--era-accent' as string]: era.palette.accent,
          ['--era-text' as string]: era.palette.text,
        }}
      >
        <button className="placard-close" onClick={close} aria-label="Close placard">
          ✕
        </button>

        <div className="placard-art">
          <ItemArt item={item} era={era} width={300} height={300} />
          {item.imageStatus === 'ok' && item.imageLicense && (
            <span className="placard-license">📷 {item.imageLicense} · Wikimedia Commons</span>
          )}
        </div>

        <div className="placard-body">
          <div className="placard-kicker">
            <span className="kind-chip">{item.kind === 'console' ? 'HARDWARE' : 'SOFTWARE'}</span>
            <span className="era-chip">{era.name}</span>
            <span className="year-chip">
              {item.year}
              {item.yearEnd ? `–${item.yearEnd}` : ''}
            </span>
          </div>

          <h2 className="placard-title">{item.name}</h2>
          <p className="placard-maker">{item.maker}</p>

          {item.aliases.length > 0 && (
            <p className="placard-aka">
              Also known as: <em>{item.aliases.slice(0, 3).join(' · ')}</em>
            </p>
          )}

          <p className="placard-summary">{item.summary}</p>

          <table className="placard-specs">
            <tbody>
              {Object.entries(item.specs).map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="legacy-head">Legacy &amp; Cultural Impact</h3>
          <p className="placard-legacy">{item.legacy}</p>

          <div className="placard-actions">
            <button className="cta" onClick={() => onEnterEra(era)}>
              ▶ Enter the Era Gallery
            </button>
            {item.wikiUrl && (
              <a className="wiki-link" href={item.wikiUrl} target="_blank" rel="noreferrer">
                Read on Wikipedia ↗
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
