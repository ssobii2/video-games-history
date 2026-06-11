import type { Era } from '../types';

/**
 * The six halls of the museum. Year spans intentionally overlap — generations
 * competed, they didn't queue politely. Rows alternate so overlaps read clearly
 * on the timeline.
 */
export const ERAS: Era[] = [
  {
    slug: 'arcade-age',
    name: 'The Arcade Age',
    short: 'Arcade',
    years: [1962, 1985],
    row: 0,
    palette: { bg: '#0a0118', primary: '#ff2bd6', accent: '#00e5ff', text: '#ffe6fb' },
    tagline: 'Quarters, cabinets, and the birth of an industry',
    description:
      'From Spacewar! on a lab PDP-1 through Computer Space, Pong, and the golden age of Pac-Man ' +
      'and Donkey Kong, video games were born in dark rooms full of glowing cabinets. The first ' +
      'home machines — the Odyssey, the Atari 2600 — carried that arcade fire into living rooms, ' +
      'right up to the crash of 1983 that nearly killed it all.',
    galleryTheme: 'arcade',
  },
  {
    slug: 'eight-bit',
    name: 'The 8-Bit Home Console Era',
    short: '8-Bit',
    years: [1983, 1996],
    row: 1,
    palette: { bg: '#3d1410', primary: '#e4593f', accent: '#f2c879', text: '#ffeede' },
    tagline: 'Nintendo rebuilds the industry from the ashes',
    description:
      'After the crash, the Famicom — sold in the West as the NES — resurrected home gaming with ' +
      'strict quality control, the Mario and Zelda dynasties, and a warm CRT glow in a million ' +
      'living rooms. Sega answered with the Master System, and the Game Boy kept 8 bits alive in ' +
      'every pocket deep into the 90s — long enough to hand Pokémon to the world.',
    galleryTheme: 'eightbit',
  },
  {
    slug: 'sixteen-bit',
    name: 'The 16-Bit Console Wars',
    short: '16-Bit',
    years: [1988, 1996],
    row: 2,
    palette: { bg: '#1c1240', primary: '#7b61ff', accent: '#00c2a8', text: '#ece6ff' },
    tagline: 'Sega does what Nintendon’t',
    description:
      'The Genesis (Mega Drive outside America) and the Super Nintendo fought the first great ' +
      'marketing war of gaming, with the TurboGrafx-16 (PC Engine in Japan) and the luxury Neo Geo ' +
      'on the flanks. Mascots, attitude ads, and Mode 7 — until a gray box from Sony ended the duel.',
    galleryTheme: 'sixteenbit',
  },
  {
    slug: 'three-d-revolution',
    name: 'The 3D Revolution',
    short: '3D Era',
    years: [1993, 2004],
    row: 0,
    palette: { bg: '#10211c', primary: '#76d275', accent: '#9aa0a6', text: '#e7f5ec' },
    tagline: 'Polygons, CDs, and worlds with a third axis',
    description:
      'Doom lit the fuse, then the PlayStation, Nintendo 64, Saturn, and Dreamcast dragged games ' +
      'into 3D space — wobbly textures, fixed cameras, fog hiding the draw distance, and a strange ' +
      'new eeriness that defined a generation. The PlayStation 2 then became the best-selling ' +
      'console ever made.',
    galleryTheme: 'threed',
  },
  {
    slug: 'hd-generation',
    name: 'The HD Generation',
    short: 'HD',
    years: [2004, 2013],
    row: 1,
    palette: { bg: '#0d1b2a', primary: '#4fc3f7', accent: '#e8eef5', text: '#eaf4ff' },
    tagline: 'Online by default, high definition by demand',
    description:
      'Xbox 360 and PlayStation 3 turned consoles into networked HD entertainment hubs while the ' +
      'Wii ignored the spec race entirely and got grandparents swinging remotes. The DS and PSP ' +
      'fought a second war in pockets, smartphones crashed the party, and digital stores, ' +
      'achievements, and patches changed what owning a game meant.',
    galleryTheme: 'hd',
  },
  {
    slug: 'modern-era',
    name: 'The Modern Era',
    short: 'Modern',
    years: [2012, 2026],
    row: 2,
    palette: { bg: '#0e1116', primary: '#00d4aa', accent: '#f5b942', text: '#e9fdf7' },
    tagline: 'Hybrids, SSDs, and games as a service',
    description:
      'x86 architectures, the hybrid Switch, near-instant SSD loading on PS5 and Series X, and the ' +
      'rise of subscriptions, live-service worlds, and handheld PCs. The console war became a ' +
      'platform ecosystem war — and games became the biggest entertainment medium on Earth.',
    galleryTheme: 'modern',
  },
];

export const ERA_BY_SLUG = new Map(ERAS.map((e) => [e.slug, e]));
