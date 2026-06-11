import * as THREE from 'three';

/**
 * Procedural canvas textures for the era rooms — no binary assets shipped,
 * each floor/wall is painted at runtime and repeated. Each generator returns
 * a properly color-managed, anisotropic, tiling CanvasTexture.
 */

function makeTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
  repeat: [number, number]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

let seedState = 7;
const rand = () => {
  // Deterministic — same rooms every visit.
  seedState = (seedState * 16807) % 2147483647;
  return (seedState - 1) / 2147483646;
};

/** Dark synthwave grid — the arcade floor under blacklight. */
export function neonGridFloor(color = '#ff2bd6', glow = '#00e5ff'): THREE.CanvasTexture {
  return makeTexture(
    512,
    (ctx, s) => {
      ctx.fillStyle = '#07010f';
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
      const step = s / 4;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * step);
        ctx.lineTo(s, i * step);
        ctx.stroke();
      }
      // Carpet noise specks like a real 80s arcade floor
      ctx.shadowBlur = 0;
      for (let i = 0; i < 420; i++) {
        ctx.fillStyle = i % 3 ? '#1b0a33' : '#27104a';
        ctx.fillRect(rand() * s, rand() * s, 2.5, 2.5);
      }
    },
    [10, 3]
  );
}

/** Warm oak planks — the 8-bit family living room. */
export function woodPlanks(): THREE.CanvasTexture {
  return makeTexture(
    512,
    (ctx, s) => {
      const plankH = s / 6;
      for (let i = 0; i < 6; i++) {
        const base = 96 + rand() * 36;
        ctx.fillStyle = `rgb(${base + 44}, ${base * 0.62 + 16}, ${base * 0.34})`;
        ctx.fillRect(0, i * plankH, s, plankH);
        // grain
        ctx.strokeStyle = 'rgba(64,34,12,0.35)';
        ctx.lineWidth = 1;
        for (let g = 0; g < 7; g++) {
          const y = i * plankH + rand() * plankH;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(s * 0.3, y + rand() * 6 - 3, s * 0.7, y + rand() * 6 - 3, s, y);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(40,20,8,0.8)';
        ctx.fillRect(0, i * plankH, s, 2);
        // plank end seam at a random offset
        ctx.fillRect(rand() * s, i * plankH, 2, plankH);
      }
    },
    [4, 8]
  );
}

/** Striped cream wallpaper with a faint floral dot — Grandma-approved. */
export function wallpaperStripes(tint = '#f2e3c6', stripe = '#e0c9a0'): THREE.CanvasTexture {
  return makeTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = stripe;
      for (let x = 0; x < s; x += 32) ctx.fillRect(x, 0, 9, s);
      ctx.fillStyle = 'rgba(190,120,80,0.18)';
      for (let i = 0; i < 24; i++) {
        ctx.beginPath();
        ctx.arc(rand() * s, rand() * s, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [12, 3]
  );
}

/** Loud geometric 90s carpet — bowling alleys, rec rooms, 16-bit dens. */
export function carpet90s(bg = '#241a4d', a = '#7b61ff', b = '#00c2a8'): THREE.CanvasTexture {
  return makeTexture(
    512,
    (ctx, s) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 40; i++) {
        const x = rand() * s;
        const y = rand() * s;
        const size = 14 + rand() * 30;
        ctx.strokeStyle = i % 2 ? a : b;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.55;
        if (rand() > 0.5) {
          // squiggle
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + size, y - size, x + size * 2, y);
          ctx.stroke();
        } else {
          // confetti triangle
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y + size * 0.4);
          ctx.lineTo(x + size * 0.3, y + size);
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 800; i++) {
        ctx.fillStyle = i % 2 ? a : '#120c2e';
        ctx.fillRect(rand() * s, rand() * s, 2, 2);
      }
      ctx.globalAlpha = 1;
    },
    [6, 2]
  );
}

/** Hard checkerboard — PS1-era spatial anxiety. */
export function checkerFloor(a = '#9aa0a6', b = '#23272b'): THREE.CanvasTexture {
  return makeTexture(
    256,
    (ctx, s) => {
      const cell = s / 4;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          ctx.fillStyle = (x + y) % 2 ? a : b;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      // grime so it doesn't read as a tech demo
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = '#000';
        ctx.fillRect(rand() * s, rand() * s, 4, 4);
      }
      ctx.globalAlpha = 1;
    },
    [14, 4]
  );
}

/** Bare institutional concrete for 3D-era walls. */
export function concreteWall(base = 168): THREE.CanvasTexture {
  return makeTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = `rgb(${base},${base + 4},${base + 6})`;
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 2200; i++) {
        const v = base + (rand() - 0.5) * 36;
        ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
        ctx.fillRect(rand() * s, rand() * s, 1.6, 1.6);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(rand() * s, 0);
        ctx.lineTo(rand() * s, s);
        ctx.stroke();
      }
    },
    [6, 2]
  );
}

/** Near-black mirror tile for the HD showroom floor. */
export function glossTile(base = '#15191e', line = '#2a323c'): THREE.CanvasTexture {
  return makeTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = line;
      ctx.lineWidth = 2;
      const cell = s / 2;
      for (let i = 0; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(s, i * cell);
        ctx.stroke();
      }
    },
    [12, 4]
  );
}

/** Bright seamless showroom white with the faintest panel lines. */
export function showroomFloor(): THREE.CanvasTexture {
  return makeTexture(
    256,
    (ctx, s) => {
      const g = ctx.createLinearGradient(0, 0, s, s);
      g.addColorStop(0, '#f4f6f8');
      g.addColorStop(1, '#e8ecf0');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = 'rgba(180,190,200,0.5)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, s, s);
    },
    [10, 3]
  );
}

/** Dark matte wall with a single neon racing stripe (arcade / modern accent). */
export function stripeWall(bg: string, stripeColor: string, stripeY = 0.3): THREE.CanvasTexture {
  return makeTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = stripeColor;
      ctx.shadowColor = stripeColor;
      ctx.shadowBlur = 14;
      ctx.fillRect(0, s * stripeY, s, s * 0.045);
    },
    [8, 1]
  );
}
