import type { MuseumItem } from '../types';

/**
 * Curated console hardware catalog. `wikiTitle` is the canonical English
 * Wikipedia article; `aliases` carry the regional names that must resolve to
 * the same entry (Mega Drive → Genesis, Famicom → NES, PC Engine → TurboGrafx-16).
 * Specs are a curated baseline; the seeding pipeline overlays live Wikipedia
 * summaries and license-checked imagery.
 */
export const CONSOLES: MuseumItem[] = [
  // ───────────────────────────── The Arcade Age ─────────────────────────────
  {
    slug: 'magnavox-odyssey',
    kind: 'console',
    era: 'arcade-age',
    name: 'Magnavox Odyssey',
    wikiTitle: 'Magnavox Odyssey',
    aliases: ['Odyssey', 'Brown Box'],
    year: 1972,
    yearEnd: 1975,
    maker: 'Magnavox',
    specs: {
      CPU: 'None — discrete diode–transistor logic',
      Media: 'Plug-in jumper cards (no ROM)',
      Video: 'Black & white; plastic screen overlays for color',
      'Units sold': '~350,000',
      'Launch price': 'US$99.95',
    },
    summary:
      'The first commercial home video game console, born from Ralph Baer’s 1966 "Brown Box" ' +
      'prototype. It had no processor and no sound — just analog circuits painting dots and lines ' +
      'that plastic overlays turned into tennis courts and haunted houses.',
    legacy:
      'It proved video games could live in the home, and its table-tennis game directly inspired ' +
      'Atari’s Pong — a debt settled in court. Every console since descends from Baer’s box of wires.',
  },
  {
    slug: 'atari-2600',
    kind: 'console',
    era: 'arcade-age',
    name: 'Atari 2600',
    wikiTitle: 'Atari 2600',
    aliases: ['Atari VCS', 'Atari Video Computer System'],
    year: 1977,
    yearEnd: 1992,
    maker: 'Atari, Inc.',
    specs: {
      CPU: 'MOS 6507 @ 1.19 MHz',
      RAM: '128 bytes',
      Media: 'ROM cartridges',
      'Units sold': '~30 million',
      'Launch price': 'US$189.95',
    },
    summary:
      'The machine that made interchangeable cartridges the standard, turning home video games from ' +
      'a single built-in toy into a library you collected. Its woodgrain front and one-button ' +
      'joystick became the icon of gaming’s first decade.',
    legacy:
      'The 2600 created the modern games market — third-party developers (Activision was founded by ' +
      'its rogue programmers), licensed arcade ports, and ultimately the 1983 crash its glutted ' +
      'library helped cause. Boom and bust, both invented here.',
  },
  {
    slug: 'intellivision',
    kind: 'console',
    era: 'arcade-age',
    name: 'Intellivision',
    wikiTitle: 'Intellivision',
    aliases: ['Mattel Intellivision'],
    year: 1979,
    yearEnd: 1990,
    maker: 'Mattel Electronics',
    specs: {
      CPU: 'GI CP1610 @ ~895 kHz (16-bit)',
      RAM: '1 KB',
      Resolution: '159×96, 16 colors',
      Media: 'ROM cartridges',
      'Units sold': '~3 million',
      'Launch price': 'US$299',
    },
    summary:
      'Mattel’s sophisticated challenger to the Atari 2600, with a 16-bit processor, a numeric ' +
      'keypad controller, and visibly better sports games — a point its ads hammered relentlessly.',
    legacy:
      'The Intellivision started the first console war. Its side-by-side comparison TV ads, fronted ' +
      'by George Plimpton, invented the adversarial marketing that Sega would later perfect.',
  },
  {
    slug: 'colecovision',
    kind: 'console',
    era: 'arcade-age',
    name: 'ColecoVision',
    wikiTitle: 'ColecoVision',
    aliases: ['Coleco Vision'],
    year: 1982,
    yearEnd: 1985,
    maker: 'Coleco',
    specs: {
      CPU: 'Zilog Z80A @ 3.58 MHz',
      RAM: '1 KB',
      VRAM: '16 KB',
      Media: 'ROM cartridges',
      'Pack-in': 'Donkey Kong',
      'Units sold': '~2 million',
      'Launch price': 'US$175',
    },
    summary:
      'The closest thing to an arcade at home in 1982, launched with a near-perfect port of Donkey ' +
      'Kong as the pack-in — Nintendo’s first big presence in American living rooms, ironically ' +
      'on someone else’s hardware.',
    legacy:
      'ColecoVision set the bar for arcade fidelity that defined the next decade of console marketing, ' +
      'then died in the crash within three years — proof of how fast the 1983 collapse moved.',
  },

  // ─────────────────────────── The 8-Bit Era ───────────────────────────
  {
    slug: 'nes',
    kind: 'console',
    era: 'eight-bit',
    name: 'Nintendo Entertainment System',
    wikiTitle: 'Nintendo Entertainment System',
    aliases: ['NES', 'Famicom', 'Family Computer', 'Nintendo Family Computer'],
    year: 1983,
    yearEnd: 1995,
    maker: 'Nintendo',
    specs: {
      CPU: 'Ricoh 2A03 (6502 core) @ 1.79 MHz',
      RAM: '2 KB',
      PPU: '256×240, 54 colors',
      Media: 'ROM cartridges ("Game Paks")',
      'Units sold': '61.9 million',
      'Launch price': 'US$179.99',
    },
    summary:
      'Launched in Japan in 1983 as the Family Computer (Famicom) and in a crash-scarred America in ' +
      '1985 disguised as an "Entertainment System" with a toy robot. It rebuilt the industry on strict ' +
      'licensing, the Seal of Quality, and the best games anyone had ever played.',
    legacy:
      'The NES is the hinge of video game history: it standardized the publisher licensing model, ' +
      'established Nintendo’s first-party dynasties (Mario, Zelda, Metroid), and made "Nintendo" ' +
      'a generic verb for video games for a generation of parents.',
  },
  {
    slug: 'master-system',
    kind: 'console',
    era: 'eight-bit',
    name: 'Sega Master System',
    wikiTitle: 'Master System',
    aliases: ['Sega Mark III', 'Mark III', 'Master System'],
    year: 1985,
    yearEnd: 1996,
    maker: 'Sega',
    specs: {
      CPU: 'Zilog Z80A @ 3.58 MHz',
      RAM: '8 KB',
      VDP: '256×224, 64 colors on screen',
      Media: 'Cartridges + Sega Cards',
      'Units sold': '~13 million (excl. Brazil)',
      'Launch price': 'US$199.99',
    },
    summary:
      'Sega’s sleeker, technically stronger answer to the NES, sold in Japan as the Mark III. ' +
      'It lost badly in America and Japan but conquered Europe and became a phenomenon in Brazil, ' +
      'where Tectoy kept manufacturing it into the 2020s.',
    legacy:
      'The Master System established Sega as Nintendo’s permanent rival and proved the games ' +
      'market was global — regional victories in Europe and Brazil kept Sega alive to fight the 16-bit war.',
  },
  {
    slug: 'atari-7800',
    kind: 'console',
    era: 'eight-bit',
    name: 'Atari 7800',
    wikiTitle: 'Atari 7800',
    aliases: ['Atari 7800 ProSystem'],
    year: 1986,
    yearEnd: 1992,
    maker: 'Atari Corporation',
    specs: {
      CPU: 'Atari SALLY (6502C) @ 1.79 MHz',
      RAM: '4 KB',
      Graphics: 'MARIA custom chip, 320×240',
      'Backward compatibility': 'Atari 2600 cartridges',
      'Units sold': '~3.8 million',
      'Launch price': 'US$79.95',
    },
    summary:
      'Atari’s comeback console — finished in 1984 but shelved for two years during the company’s ' +
      'fire sale, launching into a world Nintendo already owned. First major console with built-in ' +
      'backward compatibility.',
    legacy:
      'The 7800 is gaming’s great "what if" — competitive hardware sunk by corporate chaos. Its ' +
      'backward compatibility pioneered an idea now considered table stakes for new hardware.',
  },
  {
    slug: 'game-boy',
    kind: 'console',
    era: 'eight-bit',
    name: 'Game Boy',
    wikiTitle: 'Game Boy',
    aliases: ['Nintendo Game Boy'],
    year: 1989,
    yearEnd: 2003,
    maker: 'Nintendo',
    specs: {
      CPU: 'Sharp LR35902 @ 4.19 MHz',
      RAM: '8 KB',
      Screen: '160×144, 4 shades of "green"',
      Power: '4× AA, ~15–30 hours',
      'Units sold': '118.7 million (incl. Color)',
      'Launch price': 'US$89.95',
    },
    summary:
      'Gunpei Yokoi’s "Lateral Thinking with Withered Technology" made flesh: a deliberately modest ' +
      'monochrome handheld that crushed its technically superior color rivals on battery life, price, ' +
      'durability — and Tetris in the box.',
    legacy:
      'The Game Boy invented portable gaming as a mass medium and carried Pokémon to the world. ' +
      'Its design philosophy — the right technology, not the best — still defines Nintendo hardware.',
  },

  // ─────────────────────────── The 16-Bit Wars ───────────────────────────
  {
    slug: 'game-gear',
    kind: 'console',
    era: 'sixteen-bit',
    name: 'Sega Game Gear',
    wikiTitle: 'Game Gear',
    aliases: ['Sega Game Gear'],
    year: 1990,
    yearEnd: 1997,
    maker: 'Sega',
    specs: {
      CPU: 'Zilog Z80 @ 3.58 MHz (Master System architecture)',
      RAM: '8 KB',
      Screen: '3.2" backlit color LCD, 160×144',
      Power: '6× AA, ~3–5 hours',
      'Units sold': '~10.6 million',
      'Launch price': 'US$149.99',
    },
    summary:
      'Sega took the console war portable: a backlit color screen against the Game Boy’s pea-soup ' +
      'monochrome — and a six-AA appetite that drained batteries before a long car ride ended. ' +
      'Essentially a Master System for your hands.',
    legacy:
      'The Game Gear is the classic spec-sheet-versus-reality lesson: color and backlight lost to ' +
      'battery life and Tetris. Every handheld since has had to answer its question — power or ' +
      'longevity?',
  },
  {
    slug: 'sega-genesis',
    kind: 'console',
    era: 'sixteen-bit',
    name: 'Sega Genesis',
    wikiTitle: 'Sega Genesis',
    aliases: ['Sega Mega Drive', 'Mega Drive', 'Megadrive'],
    year: 1988,
    yearEnd: 1997,
    maker: 'Sega',
    specs: {
      CPU: 'Motorola 68000 @ 7.6 MHz (+ Z80 co-processor)',
      RAM: '64 KB + 64 KB VRAM',
      Video: '320×224, 61 colors on screen',
      Media: 'ROM cartridges',
      'Units sold': '~30.75 million',
      'Launch price': 'US$189',
    },
    summary:
      'Known as the Mega Drive everywhere except North America, Sega’s 16-bit machine arrived two ' +
      'years before the SNES and fought it to a near-draw with arcade ports, sports games, Sonic’s ' +
      'attitude, and the most aggressive marketing gaming had seen: "Genesis does what Nintendon’t."',
    legacy:
      'The Genesis made the console war a cultural event and made Sega briefly the coolest brand in ' +
      'America. Its regional dual identity — Genesis/Mega Drive — remains the canonical example of ' +
      'gaming’s naming chaos.',
  },
  {
    slug: 'snes',
    kind: 'console',
    era: 'sixteen-bit',
    name: 'Super Nintendo Entertainment System',
    wikiTitle: 'Super Nintendo Entertainment System',
    aliases: ['SNES', 'Super Famicom', 'Super NES', 'Super Nintendo'],
    year: 1990,
    yearEnd: 2003,
    maker: 'Nintendo',
    specs: {
      CPU: 'Ricoh 5A22 @ up to 3.58 MHz',
      RAM: '128 KB',
      Video: 'Mode 7 rotation/scaling, 32,768-color palette',
      Audio: 'Sony S-SMP (designed by Ken Kutaragi)',
      Media: 'ROM cartridges',
      'Units sold': '49.1 million',
      'Launch price': 'US$199.99',
    },
    summary:
      'The Super Famicom answered the Genesis with Mode 7 graphics, lush color, and a sound chip ' +
      'designed by Sony’s Ken Kutaragi — a collaboration whose collapse would create the ' +
      'PlayStation. Home to arguably the strongest first-party library ever assembled.',
    legacy:
      'The SNES perfected the 2D game — Super Mario World, Zelda, Chrono Trigger — just before 3D made ' +
      '2D "obsolete." And the botched SNES-CD deal with Sony is the single most consequential business ' +
      'blunder in gaming history.',
  },
  {
    slug: 'turbografx-16',
    kind: 'console',
    era: 'sixteen-bit',
    name: 'TurboGrafx-16',
    wikiTitle: 'TurboGrafx-16',
    aliases: ['PC Engine', 'PC-Engine', 'NEC PC Engine', 'CoreGrafx'],
    year: 1987,
    yearEnd: 1994,
    maker: 'NEC / Hudson Soft',
    specs: {
      CPU: 'HuC6280 (8-bit) @ 7.16 MHz',
      RAM: '8 KB',
      Graphics: 'Dual 16-bit video chips, 482 colors on screen',
      Media: 'HuCard credit-card cartridges (+ CD-ROM add-on)',
      'Units sold': '~10 million worldwide',
    },
    summary:
      'Launched in Japan as the PC Engine — a tiny white box that outsold the Famicom for a moment — ' +
      'and rebadged TurboGrafx-16 for America. An 8-bit CPU driving 16-bit graphics chips, plus the ' +
      'first CD-ROM add-on in console history.',
    legacy:
      'The PC Engine proved Japan and America were different markets entirely: a giant at home, an ' +
      'also-ran abroad. Its CD-ROM² add-on beat everyone to optical media by years.',
  },
  {
    slug: 'neo-geo',
    kind: 'console',
    era: 'sixteen-bit',
    name: 'Neo Geo AES',
    wikiTitle: 'Neo Geo (system)',
    aliases: ['Neo Geo', 'Neo-Geo', 'SNK Neo Geo', 'Neo Geo AES'],
    year: 1990,
    yearEnd: 1997,
    maker: 'SNK',
    specs: {
      CPU: 'Motorola 68000 @ 12 MHz (+ Z80)',
      RAM: '64 KB',
      Sprites: '380 on screen, no tile background limit',
      Media: 'Giant 330-megabit cartridges',
      'Launch price': 'US$649 (games ~$200)',
      'Units sold': '1.18 million (1M Japan + 180K overseas)',
    },
    summary:
      'Literal arcade hardware in a home shell — SNK’s "Rolls-Royce of consoles" ran the exact same ' +
      'cartridges as its arcade cabinets, at prices only rental shops and rich kids could touch.',
    legacy:
      'The Neo Geo defined gaming’s luxury tier and kept 2D fighting games (Fatal Fury, King of ' +
      'Fighters, Metal Slug) at arcade quality deep into the polygon era. A cult object to this day.',
  },

  // ───────────────────────── The 3D Revolution ─────────────────────────
  {
    slug: 'atari-jaguar',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'Atari Jaguar',
    wikiTitle: 'Atari Jaguar',
    aliases: ['Jaguar'],
    year: 1993,
    yearEnd: 1996,
    maker: 'Atari Corporation',
    specs: {
      CPU: 'Motorola 68000 @ 13.295 MHz (+ "Tom" + "Jerry" RISC)',
      RAM: '2 MB',
      Architecture: 'Five processors: "Tom" + "Jerry" + 68000',
      Marketing: '"Do the Math" — 64-bit claims, widely disputed',
      Controller: '15-button keypad monster',
      'Units sold': '~250,000',
      'Launch price': 'US$249.95',
    },
    summary:
      'Atari’s last console gambled on a bewildering five-processor design marketed as 64-bit. ' +
      'Developers couldn’t tame it, the library never came, and the company that started the ' +
      'industry exited hardware forever.',
    legacy:
      'The Jaguar closed Atari’s console story where the 2600 opened it. Its failure cleared the ' +
      'last American seat at the table just as Sony arrived — and its unsold shells later became ' +
      'dental camera housings, gaming’s strangest afterlife.',
  },
  {
    slug: 'virtual-boy',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'Virtual Boy',
    wikiTitle: 'Virtual Boy',
    aliases: ['Nintendo Virtual Boy'],
    year: 1995,
    yearEnd: 1996,
    maker: 'Nintendo',
    specs: {
      CPU: 'NEC V810 @ 20 MHz',
      RAM: '64 KB',
      Display: 'Dual red-LED eyepieces, "true 3D" stereoscopy',
      Form: 'Tabletop visor on a bipod — not actually portable',
      Warning: 'Shipped with eye-strain and headache cautions',
      'Units sold': '~770,000 — Nintendo’s biggest flop',
      'Launch price': 'US$179.95',
    },
    summary:
      'Gunpei Yokoi’s red-and-black stereoscopic visor, rushed to market half-finished: 3D without ' +
      'color, portability, or comfort. Discontinued within a year — Nintendo’s most public failure.',
    legacy:
      'The Virtual Boy made Nintendo allergic to half-ready hardware and VR for decades, yet it ' +
      'was right about the destination — every modern headset chases the immersion it promised ' +
      'thirty years too early.',
  },
  {
    slug: 'playstation',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'PlayStation',
    wikiTitle: 'PlayStation (console)',
    aliases: ['PS1', 'PSX', 'Sony PlayStation', 'PSOne'],
    year: 1994,
    yearEnd: 2006,
    maker: 'Sony Computer Entertainment',
    specs: {
      CPU: 'MIPS R3000A @ 33.87 MHz',
      RAM: '2 MB + 1 MB VRAM',
      Media: 'CD-ROM (2×)',
      'Units sold': '102.5 million — first console past 100M',
      'Launch price': 'US$299 ("$299" — one word at E3 1995)',
    },
    summary:
      'Born from the wreckage of the Nintendo–Sony SNES-CD partnership, Ken Kutaragi’s revenge ' +
      'machine bet everything on 3D polygons and cheap CDs — and won. Mature marketing pulled gaming ' +
      'out of the toy aisle and into clubs and dorm rooms.',
    legacy:
      'The PlayStation ended Nintendo–Sega bipolarity, made third-party publishers kingmakers (Final ' +
      'Fantasy VII’s defection sealed it), and established Sony as the industry’s center of ' +
      'gravity for two decades.',
  },
  {
    slug: 'sega-saturn',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'Sega Saturn',
    wikiTitle: 'Sega Saturn',
    aliases: ['Saturn'],
    year: 1994,
    yearEnd: 2000,
    maker: 'Sega',
    specs: {
      CPU: 'Dual Hitachi SH-2 @ 28.6 MHz',
      RAM: '2 MB',
      Architecture: 'Renders quadrilaterals, not triangles',
      Media: 'CD-ROM (2×)',
      'Units sold': '9.26 million',
      'Launch price': 'US$399',
    },
    summary:
      'A 2D powerhouse with a notoriously hard-to-program dual-CPU design, wrong-footed by the ' +
      'PlayStation’s triangle-based 3D. Its surprise four-months-early US launch in 1995 ' +
      'blindsided retailers and developers alike — and backfired completely.',
    legacy:
      'The Saturn began Sega’s hardware death spiral, but in Japan it was a beloved home for ' +
      'arcade-perfect fighters and shooters. A masterclass in how architecture choices and launch ' +
      'logistics can kill great engineering.',
  },
  {
    slug: 'nintendo-64',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'Nintendo 64',
    wikiTitle: 'Nintendo 64',
    aliases: ['N64', 'Ultra 64', 'Project Reality'],
    year: 1996,
    yearEnd: 2002,
    maker: 'Nintendo',
    specs: {
      CPU: 'NEC VR4300 @ 93.75 MHz',
      RAM: '4 MB',
      Graphics: 'SGI Reality Co-Processor @ 62.5 MHz',
      Media: 'ROM cartridges (up to 64 MB)',
      Controller: 'First analog stick + Rumble Pak on a mainstream pad',
      'Units sold': '32.9 million',
      'Launch price': 'US$199.99',
    },
    summary:
      'Silicon Graphics workstation technology in a kid’s console, introducing the analog stick ' +
      'and force feedback as standard vocabulary. Staying with cartridges kept load times at zero — ' +
      'and drove Square, Enix, and Final Fantasy VII straight to Sony.',
    legacy:
      'Super Mario 64 and Ocarina of Time wrote the grammar of 3D movement and 3D cameras that every ' +
      'game since speaks. The cartridge decision is the textbook case of winning a technical argument ' +
      'and losing the war.',
  },
  {
    slug: 'dreamcast',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'Dreamcast',
    wikiTitle: 'Dreamcast',
    aliases: ['Sega Dreamcast'],
    year: 1998,
    yearEnd: 2001,
    maker: 'Sega',
    specs: {
      CPU: 'Hitachi SH-4 @ 200 MHz',
      RAM: '16 MB',
      GPU: 'NEC PowerVR2',
      Online: 'Built-in 56k modem — first console with stock internet',
      Media: '1.2 GB GD-ROM',
      'Units sold': '9.13 million',
      'Launch price': 'US$199',
    },
    summary:
      'Sega’s brilliant, doomed swan song: arcade-perfect graphics, a built-in modem with real ' +
      'online play (Phantasy Star Online), the VMU memory card with its own screen, and a launch ' +
      'library for the ages — released into the path of the PlayStation 2 hype train.',
    legacy:
      'The Dreamcast ended Sega as a hardware maker and became gaming’s most romanticized failure. ' +
      'Online console gaming, downloadable content experiments, second-screen play — it did everything ' +
      'first, two years too early.',
  },
  {
    slug: 'playstation-2',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'PlayStation 2',
    wikiTitle: 'PlayStation 2',
    aliases: ['PS2'],
    year: 2000,
    yearEnd: 2013,
    maker: 'Sony Computer Entertainment',
    specs: {
      CPU: '"Emotion Engine" @ 294.9 MHz',
      RAM: '32 MB',
      GPU: '"Graphics Synthesizer" @ 147.5 MHz',
      Media: 'DVD-ROM (also played DVD movies)',
      'Backward compatibility': 'Nearly the full PS1 library',
      'Units sold': '160+ million — best-selling console ever',
      'Launch price': 'US$299',
    },
    summary:
      'The best-selling console of all time, and for millions of households also their first DVD ' +
      'player — a Trojan horse that put a games machine under the living room TV by default. ' +
      'Thirteen years in production, a library of nearly 4,000 titles.',
    legacy:
      'The PS2’s DVD gambit proved consoles win by being more than consoles. Its sales record ' +
      'still stands, and its era — GTA III, Shadow of the Colossus, Metal Gear Solid 2 — marks ' +
      'gaming’s arrival as mainstream adult culture.',
  },
  {
    slug: 'gamecube',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'GameCube',
    wikiTitle: 'GameCube',
    aliases: ['Nintendo GameCube', 'NGC', 'Dolphin'],
    year: 2001,
    yearEnd: 2007,
    maker: 'Nintendo',
    specs: {
      CPU: 'IBM "Gekko" PowerPC @ 485 MHz',
      RAM: '24 MB',
      GPU: 'ATI "Flipper" @ 162 MHz',
      Media: '1.46 GB miniDVD',
      'Units sold': '21.7 million',
      'Launch price': 'US$199',
    },
    summary:
      'A purple lunchbox with a handle, developer-friendly and pound-for-pound the most efficient ' +
      'hardware of its generation. Nintendo’s first optical-disc console — but a deliberately ' +
      'small disc that dodged DVD licensing and movie playback.',
    legacy:
      'Commercially Nintendo’s low point in home consoles, creatively a golden age: Metroid Prime, ' +
      'Wind Waker, Smash Melee. Its failure pushed Nintendo off the spec treadmill and directly ' +
      'birthed the Wii’s blue-ocean strategy.',
  },
  {
    slug: 'xbox',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'Xbox',
    wikiTitle: 'Xbox (console)',
    aliases: ['Microsoft Xbox', 'Original Xbox', 'OG Xbox'],
    year: 2001,
    yearEnd: 2009,
    maker: 'Microsoft',
    specs: {
      CPU: 'Intel Pentium III–class @ 733 MHz',
      RAM: '64 MB',
      GPU: 'Nvidia NV2A @ 233 MHz',
      Storage: 'Built-in 8 GB hard drive — a console first',
      Online: 'Ethernet port + Xbox Live (2002)',
      'Units sold': '~24 million',
      'Launch price': 'US$299',
    },
    summary:
      'Microsoft’s PC-architecture brute, built in a panic that the PS2 would eat the home ' +
      'computer. A built-in hard drive, an Ethernet jack, and Halo — and with Xbox Live, the first ' +
      'unified online console service done right.',
    legacy:
      'The Xbox made online multiplayer a console standard, made the American shooter the genre of ' +
      'record, and turned a software company into one of gaming’s three pillars within a single ' +
      'generation.',
  },

  {
    slug: 'game-boy-advance',
    kind: 'console',
    era: 'three-d-revolution',
    name: 'Game Boy Advance',
    wikiTitle: 'Game Boy Advance',
    aliases: ['GBA', 'Game Boy Advance SP'],
    year: 2001,
    yearEnd: 2008,
    maker: 'Nintendo',
    specs: {
      CPU: 'ARM7TDMI @ 16.78 MHz',
      RAM: '256 KB',
      Screen: '240×160 color (SP added the frontlight)',
      'Backward compatibility': 'Game Boy & Game Boy Color',
      'Units sold': '81.5 million',
      'Launch price': 'US$99.99',
    },
    summary:
      'A Super Nintendo for your pocket while the home consoles chased polygons — the GBA was the ' +
      '2D refuge of the 3D era, home to Metroid Fusion, Golden Sun, and a renaissance of ' +
      'sprite craft.',
    legacy:
      'The GBA proved 2D wasn’t obsolete, just portable. Its SP clamshell redesign set the ' +
      'template Nintendo handhelds kept for fifteen years.',
  },

  // ───────────────────────── The HD Generation ─────────────────────────
  {
    slug: 'nintendo-ds',
    kind: 'console',
    era: 'hd-generation',
    name: 'Nintendo DS',
    wikiTitle: 'Nintendo DS',
    aliases: ['DS', 'NDS', 'Nintendo DS Lite', 'DSi'],
    year: 2004,
    yearEnd: 2013,
    maker: 'Nintendo',
    specs: {
      CPU: 'ARM946E-S @ 67 MHz (+ ARM7TDMI @ 33 MHz)',
      RAM: '4 MB',
      Screens: 'Two — bottom one a resistive touchscreen',
      Input: 'Stylus, microphone, local wireless',
      Library: 'Nintendogs, Brain Age — new audiences entirely',
      'Units sold': '154 million — best-selling handheld ever',
      'Launch price': 'US$149.99',
    },
    summary:
      'A "third pillar" hedge that became Nintendo’s main column: two screens, a stylus, and ' +
      'software for people who had never held a controller. It out-sold everything but the PS2.',
    legacy:
      'The DS rehearsed the Wii’s blue-ocean playbook in pockets first and proved touch interfaces ' +
      'could carry games — one year before the iPhone existed.',
  },
  {
    slug: 'psp',
    kind: 'console',
    era: 'hd-generation',
    name: 'PlayStation Portable',
    wikiTitle: 'PlayStation Portable',
    aliases: ['PSP', 'Sony PSP'],
    year: 2004,
    yearEnd: 2014,
    maker: 'Sony Computer Entertainment',
    specs: {
      CPU: 'MIPS R4000 @ 333 MHz',
      RAM: '32 MB',
      Screen: '4.3" 480×272 widescreen',
      Media: 'UMD optical discs',
      'Units sold': '~80 million',
      'Launch price': 'US$249',
    },
    summary:
      'Console-grade 3D in your hands in 2004 — Sony’s gorgeous widescreen counterpunch to the DS, ' +
      'carrying Monster Hunter to Japanese commuter-train ubiquity and movies on tiny UMD discs.',
    legacy:
      'The PSP legitimized "real games" on handhelds and previewed media-convergence devices, but ' +
      'losing to the DS’s weirder, cheaper vision foreshadowed the smartphone lesson: convenience ' +
      'beats horsepower.',
  },
  {
    slug: 'nintendo-3ds',
    kind: 'console',
    era: 'hd-generation',
    name: 'Nintendo 3DS',
    wikiTitle: 'Nintendo 3DS',
    aliases: ['3DS', '2DS', 'New Nintendo 3DS'],
    year: 2011,
    yearEnd: 2020,
    maker: 'Nintendo',
    specs: {
      CPU: 'Dual-core ARM11 MPCore @ 268 MHz',
      RAM: '128 MB FCRAM',
      Display: 'Glasses-free stereoscopic 3D (slider-adjustable)',
      Launch: 'Stumbled at $249; saved by a 32% price cut in 5 months',
      'Units sold': '75.9 million',
      'Launch price': 'US$249.99',
    },
    summary:
      'Glasses-free 3D that most players eventually switched off — but underneath the gimmick, ' +
      'the last great dedicated handheld library: Fire Emblem Awakening, Animal Crossing, ' +
      'Pokémon X/Y.',
    legacy:
      'The 3DS survived the smartphone onslaught that killed every other dedicated handheld ' +
      'except its own successor, and its emergency price cut taught the industry how fast launch ' +
      'pricing can be renegotiated.',
  },
  {
    slug: 'xbox-360',
    kind: 'console',
    era: 'hd-generation',
    name: 'Xbox 360',
    wikiTitle: 'Xbox 360',
    aliases: ['X360', '360'],
    year: 2005,
    yearEnd: 2016,
    maker: 'Microsoft',
    specs: {
      CPU: '"Xenon" tri-core PowerPC @ 3.2 GHz',
      RAM: '512 MB',
      GPU: 'ATI "Xenos" with unified shaders',
      Online: 'Xbox Live: achievements, marketplace, parties',
      Flaw: '"Red Ring of Death" — >$1 billion in warranty repairs',
      'Units sold': '~84 million',
      'Launch price': 'US$299.99',
    },
    summary:
      'First out of the HD gate by a full year, the 360 defined the generation’s social fabric: ' +
      'gamerscore, party chat, digital marketplaces, indie games on a console dashboard. Also infamous ' +
      'for the hardware failure that nearly burned the lead away.',
    legacy:
      'The 360 era made online identity — your gamertag, your achievements, your friends list — the ' +
      'center of console gaming, a template every platform copied. Kinect later sold fast and faded ' +
      'faster.',
  },
  {
    slug: 'playstation-3',
    kind: 'console',
    era: 'hd-generation',
    name: 'PlayStation 3',
    wikiTitle: 'PlayStation 3',
    aliases: ['PS3'],
    year: 2006,
    yearEnd: 2017,
    maker: 'Sony Computer Entertainment',
    specs: {
      CPU: 'Cell Broadband Engine @ 3.2 GHz (1 PPE + 7 SPEs)',
      RAM: '256 MB XDR',
      Media: 'Blu-ray — won the format war against HD-DVD',
      'Launch price': 'US$599 ("FIVE HUNDRED AND NINETY-NINE US DOLLARS")',
      'Units sold': '87.4 million',
    },
    summary:
      'Launched arrogant and overpriced with the exotic, brutally hard-to-program Cell processor — ' +
      'then clawed its way back through Blu-ray’s victory, free online play, and a late-generation ' +
      'run of prestige exclusives (Uncharted 2, The Last of Us).',
    legacy:
      'The PS3 humbled Sony and taught the industry that developer ergonomics beat theoretical ' +
      'horsepower — a lesson written directly into the x86 PlayStation 4. It also quietly won the ' +
      'last great physical format war.',
  },
  {
    slug: 'wii',
    kind: 'console',
    era: 'hd-generation',
    name: 'Wii',
    wikiTitle: 'Wii',
    aliases: ['Nintendo Wii', 'Revolution'],
    year: 2006,
    yearEnd: 2013,
    maker: 'Nintendo',
    specs: {
      CPU: 'IBM "Broadway" @ 729 MHz',
      RAM: '88 MB',
      Graphics: '480p only — no HD',
      Controller: 'Wii Remote motion pointer',
      'Pack-in': 'Wii Sports',
      'Units sold': '101.6 million',
      'Launch price': 'US$249.99',
    },
    summary:
      'Nintendo skipped the HD arms race entirely and sold motion-controlled bowling to the whole ' +
      'planet. Underpowered on paper, sold out for two straight years in practice — the definitive ' +
      'blue-ocean product.',
    legacy:
      'The Wii expanded gaming’s audience beyond anyone’s projections — nursing homes ran ' +
      'bowling leagues on it. It proved interface novelty can beat raw specs, then proved fad ' +
      'audiences churn just as fast (see: Wii U).',
  },

  // ─────────────────────────── The Modern Era ───────────────────────────
  {
    slug: 'wii-u',
    kind: 'console',
    era: 'modern-era',
    name: 'Wii U',
    wikiTitle: 'Wii U',
    aliases: ['WiiU'],
    year: 2012,
    yearEnd: 2017,
    maker: 'Nintendo',
    specs: {
      CPU: 'IBM PowerPC "Espresso" @ 1.24 GHz',
      RAM: '2 GB DDR3',
      Controller: 'GamePad tablet with embedded screen',
      Confusion: 'Marketed so unclearly many thought it was a Wii accessory',
      'Units sold': '13.6 million — Nintendo’s worst home console',
      'Launch price': 'US$299.99',
    },
    summary:
      'A tablet controller in search of a reason, a name that hid the fact it was new hardware, ' +
      'and the Wii’s casual millions nowhere to be found. Five years of beautiful, stranded ' +
      'software — Mario Kart 8, Splatoon — that the Switch would later rescue.',
    legacy:
      'The Wii U is the cautionary tale of riding a fad brand one generation too long — and the ' +
      'direct cause of the Switch’s clarity. Its corpse seeded the strongest launch library ' +
      'pipeline in Nintendo history.',
  },
  {
    slug: 'playstation-4',
    kind: 'console',
    era: 'modern-era',
    name: 'PlayStation 4',
    wikiTitle: 'PlayStation 4',
    aliases: ['PS4'],
    year: 2013,
    yearEnd: 2025,
    maker: 'Sony Interactive Entertainment',
    specs: {
      CPU: 'AMD Jaguar 8-core @ 1.6 GHz (x86-64)',
      RAM: '8 GB GDDR5',
      Reveal: 'Won E3 2013 by simply allowing used games',
      'Units sold': '117+ million',
      'Launch price': 'US$399.99',
    },
    summary:
      'Sony’s great correction: ordinary x86 PC architecture, developer-first messaging, and a ' +
      'launch defined by mocking Microsoft’s DRM stumbles in a 22-second video. It outsold the ' +
      'Xbox One roughly two to one for the entire generation.',
    legacy:
      'The PS4 generation cemented the prestige single-player blockbuster (God of War, Horizon, ' +
      'Spider-Man) as Sony’s identity and made share buttons and streaming integration standard ' +
      'console furniture.',
  },
  {
    slug: 'xbox-one',
    kind: 'console',
    era: 'modern-era',
    name: 'Xbox One',
    wikiTitle: 'Xbox One',
    aliases: ['XB1', 'XBone'],
    year: 2013,
    yearEnd: 2020,
    maker: 'Microsoft',
    specs: {
      CPU: 'AMD Jaguar 8-core @ 1.75 GHz (x86-64)',
      RAM: '8 GB DDR3',
      Reveal: 'TV-first messaging + always-online DRM (reversed)',
      Pivot: 'Game Pass subscription launched 2017',
      'Units sold': '~58 million (estimates; Microsoft stopped reporting)',
      'Launch price': 'US$499',
    },
    summary:
      'Revealed as a TV-cable-Kinect entertainment box with used-game restrictions, and punished for ' +
      'it instantly. The generation-long recovery — dropping Kinect, backward compatibility, and ' +
      'Game Pass — quietly redefined Microsoft’s entire strategy.',
    legacy:
      'The Xbox One launch is the modern case study in misreading your audience. Its redemption arc ' +
      'birthed Game Pass and the platform-agnostic, subscription-first Xbox that followed.',
  },
  {
    slug: 'nintendo-switch',
    kind: 'console',
    era: 'modern-era',
    name: 'Nintendo Switch',
    wikiTitle: 'Nintendo Switch',
    aliases: ['Switch', 'NX'],
    year: 2017,
    maker: 'Nintendo',
    specs: {
      CPU: 'Nvidia Tegra X1 — ARM Cortex-A57 @ 1.02 GHz',
      RAM: '4 GB LPDDR4',
      SoC: 'Nvidia Tegra X1 (custom)',
      Form: 'Hybrid — handheld, tabletop, docked TV',
      Controllers: 'Detachable Joy-Con pair',
      'Units sold': '150+ million',
      'Launch price': 'US$299.99',
    },
    summary:
      'One device that is both the home console and the handheld, ending Nintendo’s dual-hardware ' +
      'era — launched alongside Breath of the Wild, one of the strongest debuts ever, two months ' +
      'before Mario Odyssey’s year even got going.',
    legacy:
      'The Switch resurrected Nintendo from the Wii U and now sits among the best-selling consoles ' +
      'ever made. It collapsed the console/handheld distinction so completely that the whole industry ' +
      '(Steam Deck, ROG Ally) followed it portable.',
  },
  {
    slug: 'playstation-5',
    kind: 'console',
    era: 'modern-era',
    name: 'PlayStation 5',
    wikiTitle: 'PlayStation 5',
    aliases: ['PS5'],
    year: 2020,
    maker: 'Sony Interactive Entertainment',
    specs: {
      CPU: 'AMD Zen 2 8-core @ 3.5 GHz',
      RAM: '16 GB GDDR6',
      GPU: 'RDNA 2, 10.28 TFLOPS, ray tracing',
      Storage: 'Custom NVMe SSD @ 5.5 GB/s raw',
      Controller: 'DualSense haptics + adaptive triggers',
      'Units sold': '75+ million',
      'Launch price': 'US$499',
    },
    summary:
      'Built around an SSD so fast it changed game design — loading screens became optional — plus ' +
      'controller haptics precise enough to feel raindrops. Launched mid-pandemic into two years of ' +
      'scalpers and shortages.',
    legacy:
      'The PS5 generation normalized 60fps performance modes, ray tracing, and the death of the ' +
      'loading screen, while $70 games, live-service bets, and PC ports redefined what a ' +
      '"PlayStation exclusive" even means.',
  },
  {
    slug: 'xbox-series',
    kind: 'console',
    era: 'modern-era',
    name: 'Xbox Series X|S',
    wikiTitle: 'Xbox Series X and Series S',
    aliases: ['Xbox Series X', 'Xbox Series S', 'XSX', 'Series X'],
    year: 2020,
    maker: 'Microsoft',
    specs: {
      CPU: 'AMD Zen 2 8-core @ 3.8 GHz (Series X)',
      RAM: '16 GB GDDR6',
      GPU: '12 TFLOPS RDNA 2 (X) / 4 TFLOPS (S)',
      Strategy: 'Two price tiers, one library, Game Pass day-one',
      'Units sold': '~30 million (estimates)',
      'Launch price': 'US$499',
    },
    summary:
      'A tower-of-power flagship and a cheap digital-only sibling, both serving Game Pass — ' +
      'Microsoft selling a subscription ecosystem with hardware as the on-ramp, capped by the ' +
      '$68.7 billion Activision Blizzard acquisition.',
    legacy:
      'Series X|S marks the moment Xbox stopped fighting the console war on units sold and ' +
      'redefined victory as subscribers and reach — Xbox games on PC, cloud, and eventually rival ' +
      'platforms.',
  },
  {
    slug: 'steam-deck',
    kind: 'console',
    era: 'modern-era',
    name: 'Steam Deck',
    wikiTitle: 'Steam Deck',
    aliases: ['Valve Steam Deck'],
    year: 2022,
    maker: 'Valve',
    specs: {
      CPU: 'AMD Zen 2 @ up to 3.5 GHz',
      RAM: '16 GB LPDDR5',
      APU: 'AMD Zen 2 + RDNA 2 ("Aerith")',
      OS: 'SteamOS 3 (Arch Linux + Proton)',
      Library: 'The entire Steam catalog, verified per game',
      'Units sold': 'Multiple millions (Valve does not report)',
      'Launch price': 'US$399',
    },
    summary:
      'Valve’s handheld PC: the Steam library — Elden Ring, Baldur’s Gate 3, twenty years of ' +
      'backlog — running on a Linux portable through the Proton compatibility layer, at a console price.',
    legacy:
      'The Deck legitimized the handheld PC as a category overnight, dragged Windows-only gaming ' +
      'toward Linux compatibility, and blurred the last line between console and computer.',
  },
  {
    slug: 'nintendo-switch-2',
    kind: 'console',
    era: 'modern-era',
    name: 'Nintendo Switch 2',
    wikiTitle: 'Nintendo Switch 2',
    aliases: ['Switch 2'],
    year: 2025,
    maker: 'Nintendo',
    specs: {
      CPU: 'Octa-core ARM Cortex-A78C (Nvidia T239)',
      GPU: 'Nvidia Ampere, 1536 CUDA cores, DLSS + ray tracing',
      RAM: '12 GB LPDDR5X',
      Storage: '256 GB internal',
      Display: '1080p LCD, 120 Hz handheld; 4K/60 docked',
      'Launch price': 'US$449.99',
      'Units sold': '3.5 million in first 4 days (fastest-selling console launch ever)',
    },
    summary:
      'The hybrid successor to the best-selling Switch: DLSS-powered graphics in handheld form, ' +
      'backward compatible with Switch, and a launch lineup anchored by Mario Kart World.',
    legacy:
      'The Switch 2 became the fastest-selling gaming hardware launch of all time, mainstreaming ' +
      'DLSS-quality handheld gaming and proving the hybrid form factor was no passing trend.',
  },
];
