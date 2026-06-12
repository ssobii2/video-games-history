import { useEffect, useState } from 'react';

function computeBlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches ||
    window.innerWidth < 900
  );
}

export function useIsBlockedDevice(): boolean {
  const [blocked, setBlocked] = useState(() => computeBlocked());

  useEffect(() => {
    const check = () => setBlocked(computeBlocked());
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return blocked;
}

export function DesktopGate() {
  return (
    <div className="desktop-gate">
      <div className="desktop-gate-inner">
        <div className="desktop-gate-headline">🚫 NO ENTRY</div>
        <p className="desktop-gate-sub">
          This is a 3D museum, not a TikTok.
        </p>
        <p className="desktop-gate-body">
          It needs a real keyboard, a mouse, and a screen bigger than your palm.
          We don&apos;t have a mobile wing — and frankly,
          neither does your budget.&nbsp;💸
        </p>
        <p className="desktop-gate-tip">
          (resize your window past 900px on desktop to enter)
        </p>
      </div>
    </div>
  );
}
