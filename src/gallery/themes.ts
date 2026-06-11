import * as THREE from 'three';
import type { GalleryTheme } from '../types';
import {
  carpet90s,
  checkerFloor,
  concreteWall,
  glossTile,
  neonGridFloor,
  showroomFloor,
  stripeWall,
  wallpaperStripes,
  woodPlanks,
} from './textures';

/**
 * One lighting-and-material identity per era. The engine is shared; these
 * configs are what make the arcade room feel like 2am in 1981 and the modern
 * room feel like a flagship store at noon.
 */
export interface RoomTheme {
  fog: { color: number; density: number };
  floor: () => THREE.Material;
  wall: () => THREE.Material;
  ceilingColor: number;
  hemi: { sky: number; ground: number; intensity: number };
  ambient: { color: number; intensity: number };
  keySpots: { color: number; intensity: number };
  /** Emissive lift applied to artworks so pieces glow in dark rooms. */
  artEmissive: number;
  pedestalColor: number;
  frameColor: number;
  useEnvironment: boolean;
  flicker: boolean;
  /** Era-specific set dressing + accent lights. */
  dress: (scene: THREE.Scene, hallLen: number, hallW: number, hallH: number) => void;
}

const std = (opts: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(opts);

export const ROOM_THEMES: Record<GalleryTheme, RoomTheme> = {
  // 2am in 1981: black walls, humming neon, carpet that glows under blacklight.
  arcade: {
    fog: { color: 0x05010d, density: 0.055 },
    floor: () => std({ map: neonGridFloor(), roughness: 0.85, metalness: 0.1 }),
    wall: () => std({ map: stripeWall('#0a0414', '#ff2bd6', 0.26), roughness: 0.9 }),
    ceilingColor: 0x030108,
    hemi: { sky: 0x2a0a4a, ground: 0x05010d, intensity: 0.5 },
    ambient: { color: 0x1b0533, intensity: 0.55 },
    keySpots: { color: 0xff7bea, intensity: 60 },
    artEmissive: 0.5,
    pedestalColor: 0x120822,
    frameColor: 0x1d0f33,
    useEnvironment: false,
    flicker: false,
    dress: (scene, hallLen, hallW, hallH) => {
      // Neon tubes running the length of both walls
      const tubeGeo = new THREE.BoxGeometry(hallLen * 0.92, 0.07, 0.07);
      const magenta = std({ color: 0x000000, emissive: 0xff2bd6, emissiveIntensity: 2.4 });
      const cyan = std({ color: 0x000000, emissive: 0x00e5ff, emissiveIntensity: 2.4 });
      const tubeA = new THREE.Mesh(tubeGeo, magenta);
      tubeA.position.set(0, hallH - 1.1, -hallW / 2 + 0.1);
      const tubeB = new THREE.Mesh(tubeGeo, cyan);
      tubeB.position.set(0, hallH - 1.1, hallW / 2 - 0.1);
      scene.add(tubeA, tubeB);
      const glowA = new THREE.PointLight(0xff2bd6, 30, hallLen, 1.6);
      glowA.position.set(-hallLen / 4, hallH - 1.2, 0);
      const glowB = new THREE.PointLight(0x00e5ff, 30, hallLen, 1.6);
      glowB.position.set(hallLen / 4, hallH - 1.2, 0);
      scene.add(glowA, glowB);
      // Hulking cabinet silhouettes guarding the far ends
      const cabMat = std({ color: 0x0c0618, roughness: 0.95 });
      const marqueeMat = std({ color: 0x000000, emissive: 0x00e5ff, emissiveIntensity: 1.6 });
      for (const endX of [-hallLen / 2 + 1.2, hallLen / 2 - 1.2]) {
        for (let i = 0; i < 3; i++) {
          const cab = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.9, 0.7), cabMat);
          cab.position.set(endX, 0.95, -hallW / 2 + 1 + i * 1.1);
          cab.castShadow = true;
          const marquee = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 0.06), marqueeMat);
          marquee.position.set(endX, 2.0, cab.position.z + 0.33);
          scene.add(cab, marquee);
        }
      }
    },
  },

  // A 1987 living room frozen at dusk: oak floor, striped wallpaper, one warm lamp.
  eightbit: {
    fog: { color: 0x241108, density: 0.03 },
    floor: () => std({ map: woodPlanks(), roughness: 0.6, metalness: 0.05 }),
    wall: () => std({ map: wallpaperStripes(), roughness: 0.95 }),
    ceilingColor: 0xe8dcc8,
    hemi: { sky: 0xffe6c0, ground: 0x5a3a22, intensity: 0.65 },
    ambient: { color: 0xffd9a0, intensity: 0.5 },
    keySpots: { color: 0xffd9a0, intensity: 50 },
    artEmissive: 0.22,
    pedestalColor: 0x6b4a2e,
    frameColor: 0x4a3320,
    useEnvironment: false,
    flicker: false,
    dress: (scene, hallLen, hallW) => {
      // The family CRT on a wooden stand, screen softly alive
      const stand = std({ color: 0x5a3c24, roughness: 0.7 });
      const tv = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 0.9), std({ color: 0x2b2620, roughness: 0.6 }));
      tv.position.set(-hallLen / 2 + 1.4, 1.05, 0);
      tv.castShadow = true;
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.78, 0.58),
        std({ color: 0x000000, emissive: 0x6fa8ff, emissiveIntensity: 1.5 })
      );
      screen.position.set(tv.position.x + 0.555, 1.12, 0);
      screen.rotation.y = Math.PI / 2;
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 1.0), stand);
      base.position.set(tv.position.x, 0.28, 0);
      scene.add(tv, screen, base);
      const screenGlow = new THREE.PointLight(0x6fa8ff, 8, 6, 2);
      screenGlow.position.set(tv.position.x + 1, 1.2, 0);
      scene.add(screenGlow);
      // A big oval rug down the middle
      const rug = new THREE.Mesh(
        new THREE.CircleGeometry(2.2, 32),
        std({ map: carpet90s('#5a2e1e', '#c97f4a', '#e8c87a'), roughness: 1 })
      );
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(0, 0.012, 0);
      rug.scale.set(1.6, 1, 1);
      rug.receiveShadow = true;
      scene.add(rug);
      // Warm table-lamp pools along the hall
      for (let i = -1; i <= 1; i++) {
        const lamp = new THREE.PointLight(0xffc474, 14, 9, 1.8);
        lamp.position.set((i * hallLen) / 3.2, 2.4, hallW / 4);
        scene.add(lamp);
      }
    },
  },

  // The 90s den: loud carpet, purple dusk, the console war on every shelf.
  sixteenbit: {
    fog: { color: 0x140d33, density: 0.032 },
    floor: () => std({ map: carpet90s(), roughness: 1 }),
    wall: () => std({ map: stripeWall('#241a4d', '#00c2a8', 0.34), roughness: 0.92 }),
    ceilingColor: 0x18103a,
    hemi: { sky: 0x4a3aa0, ground: 0x140d33, intensity: 0.8 },
    ambient: { color: 0x6b5bd2, intensity: 0.65 },
    keySpots: { color: 0xb9a8ff, intensity: 55 },
    artEmissive: 0.3,
    pedestalColor: 0x2c2160,
    frameColor: 0x3b2d80,
    useEnvironment: false,
    flicker: false,
    dress: (scene, hallLen, hallW, hallH) => {
      // Dueling accent glows — purple vs teal, one per wall: the war itself.
      const purple = new THREE.PointLight(0x7b61ff, 26, hallLen / 1.5, 1.7);
      purple.position.set(-hallLen / 5, hallH - 1.4, -hallW / 2 + 0.6);
      const teal = new THREE.PointLight(0x00c2a8, 26, hallLen / 1.5, 1.7);
      teal.position.set(hallLen / 5, hallH - 1.4, hallW / 2 - 0.6);
      scene.add(purple, teal);
      // Zigzag emissive trim
      const trimGeo = new THREE.BoxGeometry(hallLen * 0.9, 0.05, 0.05);
      const trim = new THREE.Mesh(trimGeo, std({ color: 0x000000, emissive: 0x00c2a8, emissiveIntensity: 1.8 }));
      trim.position.set(0, 0.45, -hallW / 2 + 0.08);
      const trim2 = trim.clone();
      trim2.position.z = hallW / 2 - 0.08;
      (trim2.material as THREE.MeshStandardMaterial) = std({
        color: 0x000000,
        emissive: 0x7b61ff,
        emissiveIntensity: 1.8,
      });
      scene.add(trim, trim2);
      // Bean bag blobs
      const bean = std({ color: 0x35256e, roughness: 1 });
      for (const [bx, bz] of [[-hallLen / 6, 0], [hallLen / 7, hallW / 5]] as const) {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14), bean);
        blob.scale.set(1.2, 0.55, 1.2);
        blob.position.set(bx, 0.38, bz);
        blob.castShadow = true;
        scene.add(blob);
      }
    },
  },

  // Early-polygon eeriness: checkerboard, institutional concrete, a light that hums.
  threed: {
    fog: { color: 0x0d1a15, density: 0.07 },
    floor: () => std({ map: checkerFloor(), roughness: 0.5, metalness: 0.15 }),
    wall: () => std({ map: concreteWall(), roughness: 0.95 }),
    ceilingColor: 0x11201a,
    hemi: { sky: 0x6a8a78, ground: 0x0d1a15, intensity: 0.4 },
    ambient: { color: 0x6f8f7a, intensity: 0.5 },
    keySpots: { color: 0xc9ffd9, intensity: 45 },
    artEmissive: 0.32,
    pedestalColor: 0x3a4540,
    frameColor: 0x2c3530,
    useEnvironment: false,
    flicker: true,
    dress: (scene, hallLen, _hallW, hallH) => {
      // Checkered columns marching down the hall — pure PS1 hub-world
      const colMat = std({ map: checkerFloor('#76d275', '#1c2a22'), roughness: 0.8 });
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, hallH, 6), colMat);
        // Offset from z=0 — the camera walks the center line, columns flank it.
        col.position.set((i * hallLen) / 5.4, hallH / 2, i % 2 === 0 ? 2.1 : -2.1);
        col.castShadow = true;
        scene.add(col);
      }
      // Buzzing fluorescent fixtures
      const fixtureMat = std({ color: 0x0a0f0c, emissive: 0xd6ffe0, emissiveIntensity: 1.3 });
      for (let i = -1; i <= 1; i++) {
        const fixture = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.32), fixtureMat);
        fixture.position.set((i * hallLen) / 3.4, hallH - 0.08, 0);
        scene.add(fixture);
      }
    },
  },

  // Big-box electronics floor, 2008: dark gloss, cold blue light, demo-station hush.
  hd: {
    fog: { color: 0x0a141f, density: 0.028 },
    floor: () => std({ map: glossTile(), roughness: 0.12, metalness: 0.6 }),
    wall: () => std({ map: stripeWall('#101b28', '#4fc3f7', 0.3), roughness: 0.7 }),
    ceilingColor: 0x081019,
    hemi: { sky: 0x274a66, ground: 0x0a141f, intensity: 0.6 },
    ambient: { color: 0x3a6a96, intensity: 0.55 },
    keySpots: { color: 0xbfe6ff, intensity: 70 },
    artEmissive: 0.3,
    pedestalColor: 0x16222e,
    frameColor: 0x1c2a3a,
    useEnvironment: true,
    flicker: false,
    dress: (scene, hallLen, hallW) => {
      // LED floor strips along both wall lines
      for (const z of [-hallW / 2 + 0.25, hallW / 2 - 0.25]) {
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(hallLen * 0.94, 0.04, 0.08),
          std({ color: 0x000000, emissive: 0x4fc3f7, emissiveIntensity: 2.2 })
        );
        strip.position.set(0, 0.03, z);
        scene.add(strip);
      }
      const wash = new THREE.PointLight(0x4fc3f7, 20, hallLen / 1.4, 1.8);
      wash.position.set(0, 3.4, 0);
      scene.add(wash);
    },
  },

  // Flagship store at noon: white gloss, luminous ceiling, products floating in light.
  modern: {
    fog: { color: 0xdfe7ee, density: 0.012 },
    floor: () => std({ map: showroomFloor(), roughness: 0.18, metalness: 0.25 }),
    wall: () => std({ color: 0xf2f5f8, roughness: 0.85 }),
    ceilingColor: 0xffffff,
    hemi: { sky: 0xffffff, ground: 0xc8d2da, intensity: 1.15 },
    ambient: { color: 0xffffff, intensity: 0.75 },
    keySpots: { color: 0xffffff, intensity: 55 },
    artEmissive: 0.12,
    pedestalColor: 0xfafcfe,
    frameColor: 0xdde4ea,
    useEnvironment: true,
    flicker: false,
    dress: (scene, hallLen, hallW, hallH) => {
      // Luminous ceiling panels — the showroom signature
      const panelMat = std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.05 });
      const cols = Math.max(3, Math.floor(hallLen / 4));
      for (let i = 0; i < cols; i++) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, hallW * 0.5), panelMat);
        panel.position.set(-hallLen / 2 + (i + 0.5) * (hallLen / cols), hallH - 0.05, 0);
        scene.add(panel);
      }
      // Teal brand accent line
      const accent = new THREE.Mesh(
        new THREE.BoxGeometry(hallLen * 0.9, 0.06, 0.02),
        std({ color: 0x000000, emissive: 0x00d4aa, emissiveIntensity: 2 })
      );
      accent.position.set(0, 2.6, -hallW / 2 + 0.06);
      scene.add(accent);
    },
  },
};
