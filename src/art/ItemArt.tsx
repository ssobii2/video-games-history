import { useEffect, useRef, useState } from 'react';
import type { Era, MuseumItem } from '../types';
import { drawPlaceholder } from './placeholder';

interface Props {
  item: MuseumItem;
  era: Era;
  width: number;
  height: number;
  className?: string;
}

/**
 * Renders an item's freely licensed Wikipedia image when available, and
 * otherwise (or on load error — the copyright guardrail's last line) a
 * stylized, era-appropriate procedural placeholder. Never a broken <img>.
 */
export function ItemArt({ item, era, width, height, className }: Props) {
  const hasImage = Boolean(item.imageUrl) && item.imageStatus === 'ok';
  const [failed, setFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const usePlaceholder = !hasImage || failed;

  useEffect(() => {
    if (usePlaceholder && canvasRef.current) {
      drawPlaceholder(canvasRef.current, item, era, width * 2, height * 2);
    }
  }, [usePlaceholder, item, era, width, height]);

  if (usePlaceholder) {
    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width, height }}
        aria-label={`${item.name} — stylized placeholder art`}
      />
    );
  }
  return (
    <img
      src={item.imageUrl}
      alt={item.name}
      className={className}
      style={{ width, height, objectFit: 'contain', background: '#f0f0f2' }}
      loading="lazy"
      crossOrigin="anonymous"
      onError={() => setFailed(true)}
    />
  );
}
