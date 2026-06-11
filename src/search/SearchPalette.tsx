import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Era, MuseumItem } from '../types';

interface Props {
  items: MuseumItem[];
  eras: Era[];
  onPick: (item: MuseumItem) => void;
  onClose: () => void;
}

/**
 * Ctrl/⌘+K command palette over the whole collection. Matches names, regional
 * aliases ("mega drive" finds the Genesis), and makers; ranked by match
 * position. Enter or click opens the museum placard.
 */
export function SearchPalette({ items, eras, onPick, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const eraOf = (item: MuseumItem) => eras.find((e) => e.slug === item.era);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice().sort((a, b) => a.year - b.year).slice(0, 12);
    const scored: Array<{ item: MuseumItem; score: number }> = [];
    for (const item of items) {
      const haystacks = [item.name, ...item.aliases, item.maker];
      let best = Infinity;
      for (const h of haystacks) {
        const idx = h.toLowerCase().indexOf(q);
        if (idx === -1) continue;
        // startsWith beats substring; name beats alias beats maker (array order)
        best = Math.min(best, idx * 10 + haystacks.indexOf(h));
      }
      if (best < Infinity) scored.push({ item, score: best });
    }
    return scored
      .sort((a, b) => a.score - b.score || a.item.year - b.item.year)
      .slice(0, 12)
      .map((s) => s.item);
  }, [query, items]);

  useEffect(() => {
    inputRef.current?.focus();
    gsap.fromTo(
      cardRef.current,
      { y: -24, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => setCursor(0), [query]);

  const pick = (item: MuseumItem) => {
    onPick(item);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      pick(results[cursor]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="search-backdrop" onClick={onClose} role="dialog" aria-modal aria-label="Search the museum">
      <div className="search-card" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Search consoles & games… try “mega drive” or “famicom”"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
        />
        <ul className="search-results">
          {results.map((item, i) => {
            const era = eraOf(item);
            return (
              <li key={item.slug}>
                <button
                  className={`search-row ${i === cursor ? 'active' : ''}`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => pick(item)}
                  style={{ ['--chip' as string]: era?.palette.primary ?? '#888' }}
                >
                  <span className="row-kind">{item.kind === 'console' ? '🕹' : '🎮'}</span>
                  <span className="row-name">{item.name}</span>
                  <span className="row-meta">
                    {item.maker} · {item.year}
                  </span>
                  <span className="row-era">{era?.short}</span>
                </button>
              </li>
            );
          })}
          {results.length === 0 && <li className="search-empty">Nothing in the collection matches.</li>}
        </ul>
        <footer className="search-foot">
          <kbd>↑↓</kbd> navigate · <kbd>↵</kbd> open placard · <kbd>esc</kbd> close
        </footer>
      </div>
    </div>
  );
}
