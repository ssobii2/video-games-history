import { useRef } from 'react';

interface Props {
  onChange: (x: number, y: number) => void;
}

/** Thumb joystick. Reports a normalized vector (x right, y down), zero on release. */
export function Joystick({ onChange }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);

  const setKnob = (dx: number, dy: number) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    activeId.current = e.pointerId;
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId || !baseRef.current) return;
    e.stopPropagation();
    const r = baseRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = r.width / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > max) { dx = (dx / dist) * max; dy = (dy / dist) * max; }
    setKnob(dx, dy);
    onChange(dx / max, dy / max);
  };
  const onUp = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId) return;
    e.stopPropagation();
    activeId.current = null;
    setKnob(0, 0);
    onChange(0, 0);
  };

  return (
    <div
      className="gallery-joystick"
      ref={baseRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="gallery-joystick-knob" ref={knobRef} />
    </div>
  );
}
