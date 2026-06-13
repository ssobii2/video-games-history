import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  onClose: () => void;
}

/**
 * Global credits & attribution overlay — music licensing, Wikipedia/Wikimedia
 * sourcing, and tech stack. Opens from the masthead "ⓘ Credits" button.
 * GSAP handles the entrance; Escape or backdrop-click dismisses it.
 */
export function Credits({ onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      cardRef.current,
      { y: 40, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
    );
    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="credits-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal={true}
      aria-label="Credits and sources"
    >
      <div className="credits-card" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <button className="credits-close" onClick={onClose} aria-label="Close credits">
          ✕
        </button>

        <h2 className="credits-title">Credits &amp; Sources</h2>

        <section className="credits-section">
          <h3>Music</h3>
          <p>
            All tracks by{' '}
            <a
              className="credits-link"
              href="https://incompetech.com"
              target="_blank"
              rel="noreferrer"
            >
              Kevin MacLeod ↗
            </a>
            , licensed under Creative Commons: By Attribution 4.0{' '}
            <a
              className="credits-link"
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 4.0 ↗
            </a>
            .
          </p>
          <p className="credits-tracks">
            Carefree · Hyperfun · 8bit Dungeon Level · Pixelland · Echoes of Time v2 · Digital
            Lemonade · Enchanted Journey
          </p>
        </section>

        <section className="credits-section">
          <h3>Text &amp; Images</h3>
          <p>
            Article text and images are drawn from{' '}
            <a
              className="credits-link"
              href="https://en.wikipedia.org"
              target="_blank"
              rel="noreferrer"
            >
              Wikipedia ↗
            </a>{' '}
            and Wikimedia Commons. Article text is available under{' '}
            <a
              className="credits-link"
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA 4.0 ↗
            </a>
            . Some images (box art, logos) are non-free and shown at low resolution for
            identification. Each placard links to its original source.
          </p>
        </section>

        <section className="credits-section">
          <h3>Built with</h3>
          <p className="credits-tracks">React · Vite · GSAP · Three.js</p>
        </section>

        <p className="credits-foot">A non-commercial demo project, made for the love of games.</p>
      </div>
    </div>
  );
}
