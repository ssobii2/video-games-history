import { useEffect, useState } from 'react';

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  );
}

function isPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(orientation: portrait)').matches;
}

export interface DeviceState {
  isTouch: boolean;
  blockedPortrait: boolean;
}

export function useDeviceState(): DeviceState {
  const compute = (): DeviceState => {
    const isTouch = isTouchDevice();
    return { isTouch, blockedPortrait: isTouch && isPortrait() && window.innerWidth < 700 };
  };
  const [state, setState] = useState<DeviceState>(() => compute());
  useEffect(() => {
    const check = () => setState(compute());
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);
  return state;
}

export function RotateGate() {
  return (
    <div className="rotate-gate">
      <div className="rotate-gate-inner">
        <div className="rotate-gate-icon" aria-hidden="true">📱↻</div>
        <div className="rotate-gate-headline">Rotate to landscape</div>
        <p className="rotate-gate-body">
          The Museum of Video Game History is a wide, immersive space.
          Turn your device sideways to step inside.
        </p>
      </div>
    </div>
  );
}
