import type { MuseumItem } from '../types';

/**
 * Defining games per era. `wikiTitle` includes Wikipedia's disambiguation
 * suffixes where the plain name is ambiguous ("Donkey Kong (1981 video game)",
 * "The Legend of Zelda (video game)") — the harvester also has a variant
 * ladder as a safety net. Most box art is fair-use on Wikipedia, so these
 * entries commonly resolve to stylized placeholders by design.
 */
export const GAMES: MuseumItem[] = [
  // ───────────────────────────── The Arcade Age ─────────────────────────────
  {
    slug: 'spacewar',
    kind: 'game',
    era: 'arcade-age',
    name: 'Spacewar!',
    wikiTitle: 'Spacewar!',
    aliases: ['Spacewar', 'Space War'],
    year: 1962,
    maker: 'Steve Russell / MIT',
    specs: {
      Hardware: 'DEC PDP-1 — a $120,000 minicomputer',
      Released: '1962, MIT (public domain by culture)',
      Genre: 'Space combat duel',
      Physics: 'Gravity well, inertia, hyperspace',
      Note: 'Spread freely to every PDP-1 in academia',
    },
    summary:
      'Two ships dueling around a star’s gravity well on a round CRT at MIT — written by Steve ' +
      'Russell and friends for fun and shared freely with every lab that wanted it. Before there ' +
      'was an industry, there was this.',
    legacy:
      'Spacewar! is the medium’s common ancestor: it directly inspired both Computer Space and ' +
      'Asteroids, and its hacker-culture origins — built to share, not to sell — are gaming’s ' +
      'founding myth.',
  },
  {
    slug: 'computer-space',
    kind: 'game',
    era: 'arcade-age',
    name: 'Computer Space',
    wikiTitle: 'Computer Space',
    aliases: [],
    year: 1971,
    maker: 'Syzygy Engineering / Nutting Associates',
    specs: {
      Creators: 'Nolan Bushnell & Ted Dabney',
      Released: '1971 — the first commercial arcade video game',
      Cabinet: 'Curvaceous fiberglass; appeared in Soylent Green',
      Sales: '~1,300 units',
    },
    summary:
      'Bushnell and Dabney squeezed Spacewar! into a coin-operated fiberglass cabinet a year ' +
      'before Pong. Too complicated for bar patrons, but the first time anyone paid a quarter ' +
      'to play a video game.',
    legacy:
      'Computer Space’s commercial stumble taught Bushnell the lesson that built Atari: make it ' +
      'simple enough for a drunk person. The entire arcade industry starts with this cabinet.',
  },
  {
    slug: 'pong',
    kind: 'game',
    era: 'arcade-age',
    name: 'Pong',
    wikiTitle: 'Pong',
    aliases: ['Pong (game)'],
    year: 1972,
    maker: 'Atari',
    platform: 'magnavox-odyssey',
    specs: {
      Developer: 'Allan Alcorn / Atari',
      Released: '1972 (arcade)',
      Genre: 'Sports',
      Hardware: 'Discrete logic — no CPU, no code',
      'First unit': 'Andy Capp’s Tavern, Sunnyvale — jammed with quarters',
    },
    summary:
      'Two paddles, one square ball, and an instruction set the whole world could read: "Avoid ' +
      'missing ball for high score." Built by Allan Alcorn as a training exercise, it became the ' +
      'first commercially successful video game.',
    legacy:
      'Pong founded the arcade industry and Atari with it. Its Magnavox lawsuit settlement also ' +
      'established that video game ideas had owners — the industry’s first IP battle.',
  },
  {
    slug: 'space-invaders',
    kind: 'game',
    era: 'arcade-age',
    name: 'Space Invaders',
    wikiTitle: 'Space Invaders',
    aliases: [],
    year: 1978,
    maker: 'Taito',
    platform: 'atari-2600',
    specs: {
      Designer: 'Tomohiro Nishikado',
      Released: '1978 (arcade)',
      Genre: 'Fixed shooter',
      Trivia: 'The speeding-up difficulty curve was a hardware bug kept as a feature',
      Impact: 'Quadrupled Atari 2600 sales as its first licensed arcade port',
    },
    summary:
      'Tomohiro Nishikado’s descending alien armada introduced the high score table, the ' +
      'accelerating difficulty curve, and persistent enemy fire — and caused a legendary (if ' +
      'embellished) 100-yen coin shortage in Japan.',
    legacy:
      'Space Invaders is the big bang of the shooter genre and of game-driven hardware sales: its ' +
      '2600 port invented the "killer app." The pixel invader remains gaming’s unofficial logo.',
  },
  {
    slug: 'asteroids',
    kind: 'game',
    era: 'arcade-age',
    name: 'Asteroids',
    wikiTitle: 'Asteroids (video game)',
    aliases: ['Asteroids'],
    year: 1979,
    maker: 'Atari',
    platform: 'atari-2600',
    specs: {
      Designers: 'Lyle Rains, Ed Logg',
      Released: '1979 (arcade)',
      Genre: 'Multidirectional shooter',
      Display: 'Vector monitor — lines, not pixels',
      Note: 'Atari’s best-selling arcade machine ever (~70,000 cabinets)',
    },
    summary:
      'Glowing vector lines, Newtonian drift, and a hyperspace panic button. Atari’s biggest ' +
      'arcade hit ever used a vector display to draw razor-sharp ships no raster screen could match.',
    legacy:
      'Asteroids perfected momentum-based physics as game feel, and its score-chasing culture ' +
      '(players left initials by the thousands) entrenched the high-score arms race of the golden age.',
  },
  {
    slug: 'pac-man',
    kind: 'game',
    era: 'arcade-age',
    name: 'Pac-Man',
    wikiTitle: 'Pac-Man',
    aliases: ['Puck Man', 'Pacman'],
    year: 1980,
    maker: 'Namco',
    platform: 'atari-2600',
    specs: {
      Designer: 'Toru Iwatani',
      Released: '1980 (arcade)',
      Genre: 'Maze chase',
      Design: 'Four ghosts, four distinct AI personalities',
      Note: 'Highest-grossing arcade game of all time',
    },
    summary:
      'Toru Iwatani designed a non-violent game to bring women into arcades and built the first ' +
      'gaming mascot. Each ghost hunts differently — Blinky chases, Pinky ambushes — a foundational ' +
      'lesson in legible enemy AI.',
    legacy:
      'Pac-Man was gaming’s first transmedia celebrity: cartoons, a hit single, lunchboxes. ' +
      'Pac-Man Fever was the proof that games could be pop culture, not just amusement machines.',
  },
  {
    slug: 'donkey-kong',
    kind: 'game',
    era: 'arcade-age',
    name: 'Donkey Kong',
    wikiTitle: 'Donkey Kong (1981 video game)',
    aliases: ['Donkey Kong (arcade game)', 'Donkey Kong'],
    year: 1981,
    maker: 'Nintendo',
    platform: 'colecovision',
    specs: {
      Designer: 'Shigeru Miyamoto',
      Released: '1981 (arcade)',
      Genre: 'Platformer',
      Firsts: 'Jumping as a core verb; narrative told in cutscenes',
      Star: '"Jumpman" — renamed Mario after Nintendo of America’s landlord',
    },
    summary:
      'Shigeru Miyamoto’s first game, built to rescue Nintendo’s unsold Radar Scope cabinets: a ' +
      'carpenter climbs girders to save a damsel from a barrel-throwing ape. The platformer genre ' +
      'starts here, and so does Mario.',
    legacy:
      'Donkey Kong introduced character-driven storytelling to arcades and launched the most ' +
      'important creator-character pairing in the medium’s history. Universal’s failed King Kong ' +
      'lawsuit also proved Nintendo would fight.',
  },
  {
    slug: 'galaga',
    kind: 'game',
    era: 'arcade-age',
    name: 'Galaga',
    wikiTitle: 'Galaga',
    aliases: [],
    year: 1981,
    maker: 'Namco',
    platform: 'atari-2600',
    specs: {
      Released: '1981 (arcade)',
      Genre: 'Fixed shooter',
      Mechanic: 'Tractor-beam capture — sacrifice a ship to fight with two',
      Note: 'Still running in arcades 45 years later',
    },
    summary:
      'The fixed shooter perfected: swooping choreographed enemy waves and the iconic ' +
      'risk-reward gamble of letting your fighter be captured to win it back doubled.',
    legacy:
      'Galaga refined Space Invaders’ formula into something so balanced it never left arcades. ' +
      'Its capture mechanic is an early masterpiece of designed risk-reward tension.',
  },

  // ─────────────────────────── The 8-Bit Era ───────────────────────────
  {
    slug: 'super-mario-bros',
    kind: 'game',
    era: 'eight-bit',
    name: 'Super Mario Bros.',
    wikiTitle: 'Super Mario Bros.',
    aliases: ['Super Mario Brothers', 'SMB'],
    year: 1985,
    maker: 'Nintendo',
    platform: 'nes',
    specs: {
      Director: 'Shigeru Miyamoto',
      Composer: 'Koji Kondo',
      Released: '1985 (Famicom/NES)',
      Genre: 'Side-scrolling platformer',
      Sales: '~58 million (incl. bundles)',
    },
    summary:
      'World 1-1 is the most studied screen in game design: it teaches running, jumping, power-ups, ' +
      'and secrets without a single word. The side-scrolling platformer template — momentum, ' +
      'level themes, warp secrets — ships complete in its first cartridge.',
    legacy:
      'Super Mario Bros. relaunched the entire American games industry after the crash and made ' +
      'Mario the medium’s defining icon. Koji Kondo’s overworld theme may be the most recognized ' +
      'melody written in the 20th century’s back half.',
  },
  {
    slug: 'the-legend-of-zelda',
    kind: 'game',
    era: 'eight-bit',
    name: 'The Legend of Zelda',
    wikiTitle: 'The Legend of Zelda (video game)',
    aliases: ['Legend of Zelda', 'Zelda'],
    year: 1986,
    maker: 'Nintendo',
    platform: 'nes',
    specs: {
      Director: 'Shigeru Miyamoto, Takashi Tezuka',
      Released: '1986 (Famicom Disk System / NES)',
      Genre: 'Action-adventure',
      First: 'Battery-backed save on a console cartridge',
      Inspiration: 'Miyamoto’s childhood cave exploration in Sonobe',
      Sales: '6.5+ million',
    },
    summary:
      'A golden cartridge holding an open world: no ordered levels, just a map full of secrets and ' +
      'the trust that players would find them. The battery save made a quest too big for one ' +
      'sitting possible at all.',
    legacy:
      'Zelda founded the action-adventure genre and gaming’s culture of shared secrets — ' +
      'schoolyard rumors as a meta-game. Its design DNA runs through every open world made since, ' +
      'a lineage Breath of the Wild closed into a circle.',
  },
  {
    slug: 'metroid',
    kind: 'game',
    era: 'eight-bit',
    name: 'Metroid',
    wikiTitle: 'Metroid (video game)',
    aliases: ['Metroid'],
    year: 1986,
    maker: 'Nintendo',
    platform: 'nes',
    specs: {
      Producer: 'Gunpei Yokoi',
      Released: '1986 (Famicom Disk System / NES)',
      Genre: 'Action-adventure (exploration)',
      Twist: 'Samus Aran revealed as a woman — a landmark 1986 surprise',
      Tone: 'Isolation, inspired by Alien',
      Sales: '2.73 million (as of 2004)',
    },
    summary:
      'A lone bounty hunter in a hostile labyrinth where progress means earning the tools to ' +
      'reopen the map — atmospheric, nonlinear, and deliberately lonely in an era of cheerful games.',
    legacy:
      'Metroid is half the etymology of "Metroidvania," the genre built on its ability-gated ' +
      'exploration. The Samus reveal remains one of gaming’s most cited cultural moments.',
  },
  {
    slug: 'mega-man-2',
    kind: 'game',
    era: 'eight-bit',
    name: 'Mega Man 2',
    wikiTitle: 'Mega Man 2',
    aliases: ['Rockman 2'],
    year: 1988,
    maker: 'Capcom',
    platform: 'nes',
    specs: {
      Released: '1988 (Famicom/NES) — as Rockman 2 in Japan',
      Genre: 'Action platformer',
      Structure: 'Pick your boss order; win their weapons',
      Note: 'Made as a passion project on leftover dev time',
      Sales: '1.51 million',
    },
    summary:
      'Eight Robot Masters, tackled in any order, each surrendering a weapon that trivializes ' +
      'another — a rock-paper-scissors structure of player-chosen difficulty, wrapped in the ' +
      'NES’s greatest soundtrack.',
    legacy:
      'Mega Man 2 codified non-linear level select and knowledge-as-power design. Its Japanese ' +
      'title Rockman vs. western Mega Man is a textbook regional naming split this museum’s ' +
      'database has to handle.',
  },
  {
    slug: 'tetris',
    kind: 'game',
    era: 'eight-bit',
    name: 'Tetris',
    wikiTitle: 'Tetris',
    aliases: ['Tetris (Game Boy video game)'],
    year: 1989,
    maker: 'Alexey Pajitnov / Nintendo',
    platform: 'game-boy',
    specs: {
      Creator: 'Alexey Pajitnov (Moscow, 1984)',
      'Key release': '1989 Game Boy pack-in',
      Genre: 'Falling-block puzzle',
      Rights: 'A Cold War licensing thriller settled at Soviet ministry level',
      Sales: '500+ million copies across all versions',
    },
    summary:
      'Invented on a Soviet Electronika 60 with brackets for graphics, then fought over by ' +
      'publishers across the Iron Curtain until Nintendo packed it into every Game Boy — the ' +
      'perfect game meeting its perfect device.',
    legacy:
      'Tetris is the most ported, most sold game ever, the proof that pure abstraction can ' +
      'outsell every franchise, and the reason millions of non-gamers owned a Game Boy. ' +
      'Researchers literally named an intrusive-imagery phenomenon "the Tetris effect."',
  },

  {
    slug: 'pokemon-red-blue',
    kind: 'game',
    era: 'eight-bit',
    name: 'Pokémon Red and Blue',
    wikiTitle: 'Pokémon Red, Blue, and Yellow',
    aliases: ['Pokémon Red and Blue', 'Pokemon Red', 'Pokemon Blue', 'Pocket Monsters'],
    year: 1996,
    maker: 'Game Freak / Nintendo',
    platform: 'game-boy',
    specs: {
      Designer: 'Satoshi Tajiri',
      Released: '1996 (Japan), 1998 (West) — on 8-bit hardware in the 3D era',
      Genre: 'Monster-collecting RPG',
      Mechanic: 'Trading via Link Cable — some monsters only evolve when traded',
      Sales: '31+ million (Red/Blue/Yellow)',
    },
    summary:
      'Satoshi Tajiri bottled his childhood bug-collecting into a Game Boy RPG where the deepest ' +
      'mechanic lived in a cable between two machines — released when the Game Boy was considered ' +
      'dead, on 8-bit hardware, in the middle of the PlayStation era.',
    legacy:
      'Pokémon became the highest-grossing media franchise on Earth — bigger than Star Wars and ' +
      'Marvel — and its trade-to-evolve design remains the masterclass in engineering social play ' +
      'into systems.',
  },

  // ─────────────────────────── The 16-Bit Wars ───────────────────────────
  {
    slug: 'super-mario-world',
    kind: 'game',
    era: 'sixteen-bit',
    name: 'Super Mario World',
    wikiTitle: 'Super Mario World',
    aliases: ['Super Mario Bros. 4'],
    year: 1990,
    maker: 'Nintendo',
    platform: 'snes',
    specs: {
      Director: 'Takashi Tezuka',
      Released: '1990 (Super Famicom launch title)',
      Genre: 'Platformer',
      Debut: 'Yoshi',
      Secrets: '96 exits, including the hidden Star World',
      Sales: '20.61 million',
    },
    summary:
      'The SNES launch statement: a sprawling interconnected world map riddled with secret exits, ' +
      'Yoshi’s debut, and the cape — 2D Mario at its most generous and most explorable.',
    legacy:
      'Super Mario World won the 16-bit war’s opening battle on craft alone and remains the ' +
      'benchmark 2D platformer — the ROM-hacking and Kaizo communities have kept it alive as a ' +
      'design language for thirty years.',
  },
  {
    slug: 'sonic-the-hedgehog',
    kind: 'game',
    era: 'sixteen-bit',
    name: 'Sonic the Hedgehog',
    wikiTitle: 'Sonic the Hedgehog (1991 video game)',
    aliases: ['Sonic the Hedgehog', 'Sonic 1'],
    year: 1991,
    maker: 'Sega',
    platform: 'sega-genesis',
    specs: {
      Programmer: 'Yuji Naka',
      Designer: 'Hirokazu Yasuhara',
      Released: '1991 (Genesis/Mega Drive)',
      Genre: 'Platformer',
      Purpose: 'Mascot engineered to make Mario look slow',
      Sales: '15 million (Genesis)',
    },
    summary:
      'Sega’s answer to Mario was attitude as physics: loops, slopes, and momentum tech showing ' +
      'off "blast processing." Sonic replaced Altered Beast as the Genesis pack-in and sales ' +
      'detonated.',
    legacy:
      'Sonic made the console war personal — speed versus polish, cool versus craft — and gave ' +
      'Sega the mascot that briefly out-Q-scored Mickey Mouse with American kids.',
  },
  {
    slug: 'street-fighter-ii',
    kind: 'game',
    era: 'sixteen-bit',
    name: 'Street Fighter II',
    wikiTitle: 'Street Fighter II',
    aliases: ['Street Fighter II: The World Warrior', 'SF2'],
    year: 1991,
    maker: 'Capcom',
    platform: 'snes',
    specs: {
      Released: '1991 (arcade); 1992 (SNES)',
      Genre: 'Fighting',
      Innovation: 'Combos — discovered as a bug, kept as the genre’s core',
      Note: 'The SNES port sold 6.3 million carts at ~$70',
    },
    summary:
      'Eight world warriors, six buttons, and the combo system that started as a timing glitch — ' +
      'Street Fighter II single-handedly revived arcades and made head-to-head competition the point.',
    legacy:
      'Every fighting game, every EVO bracket, every esports broadcast traces to SF2’s "winner ' +
      'stays" arcade etiquette. Its SNES port was the moment home consoles started eating ' +
      'arcade revenue for good.',
  },
  {
    slug: 'donkey-kong-country',
    kind: 'game',
    era: 'sixteen-bit',
    name: 'Donkey Kong Country',
    wikiTitle: 'Donkey Kong Country',
    aliases: ['DKC', 'Super Donkey Kong'],
    year: 1994,
    maker: 'Rare / Nintendo',
    platform: 'snes',
    specs: {
      Developer: 'Rare (Twycross, England)',
      Released: '1994 (SNES)',
      Technique: 'Pre-rendered SGI 3D models as 2D sprites',
      Sales: '9.3 million — fastest-selling game of its time',
    },
    summary:
      'Rare rendered gorillas on Silicon Graphics workstations and squeezed the frames into a ' +
      'SNES cartridge — visuals that looked impossibly next-gen and put Sega permanently on the ' +
      'back foot in the war’s final stretch.',
    legacy:
      'DKC proved presentation could counter raw hardware narratives (Nintendo marketing: "It ' +
      'can’t be done on Genesis") and previewed the pre-rendered aesthetic that defined the ' +
      'mid-90s, from Killer Instinct to FF7’s backgrounds.',
  },
  {
    slug: 'chrono-trigger',
    kind: 'game',
    era: 'sixteen-bit',
    name: 'Chrono Trigger',
    wikiTitle: 'Chrono Trigger',
    aliases: [],
    year: 1995,
    maker: 'Square',
    platform: 'snes',
    specs: {
      Team: '"Dream Team" — Sakaguchi, Horii, Toriyama',
      Composer: 'Yasunori Mitsuda',
      Released: '1995 (SNES)',
      Genre: 'JRPG',
      Innovation: 'New Game+ and 13 endings',
      Sales: '~3.44 million (SNES+PS1+DS)',
    },
    summary:
      'Final Fantasy’s creator, Dragon Quest’s designer, and Dragon Ball’s artist made a ' +
      'time-travel RPG with no random battles, multiple endings, and New Game+ — the 16-bit ' +
      'JRPG’s consensus masterpiece.',
    legacy:
      'Chrono Trigger normalized replay-aware design (New Game+ is its coinage) and remains the ' +
      'reference answer to "best JRPG ever." Its seamless battle transitions ended the ' +
      'random-encounter era’s inevitability.',
  },

  // ───────────────────────── The 3D Revolution ─────────────────────────
  {
    slug: 'doom',
    kind: 'game',
    era: 'three-d-revolution',
    name: 'Doom',
    wikiTitle: 'Doom (1993 video game)',
    aliases: ['DOOM', 'Doom 1993'],
    year: 1993,
    maker: 'id Software',
    specs: {
      Programmers: 'John Carmack, John Romero',
      Released: '1993 (MS-DOS shareware)',
      Genre: 'First-person shooter',
      Distribution: 'Shareware — first episode free, copied everywhere',
      Note: 'Installed on more PCs than Windows 95 (per Microsoft)',
      Sales: '~3.5 million (PC, by 1999)',
    },
    summary:
      'id Software uploaded the first episode to a university FTP server and crashed it. Carmack’s ' +
      'engine made speed feel like violence; deathmatch (Romero’s coinage) and WAD modding ' +
      'shipped in the box.',
    legacy:
      'Doom founded the FPS as gaming’s dominant genre, invented deathmatch culture, and its open ' +
      'modding ecosystem is the ancestor of every Steam Workshop. "Can it run Doom?" became the ' +
      'whole internet’s hardware benchmark joke.',
  },
  {
    slug: 'super-mario-64',
    kind: 'game',
    era: 'three-d-revolution',
    name: 'Super Mario 64',
    wikiTitle: 'Super Mario 64',
    aliases: ['Mario 64', 'SM64'],
    year: 1996,
    maker: 'Nintendo',
    platform: 'nintendo-64',
    specs: {
      Director: 'Shigeru Miyamoto',
      Released: '1996 (N64 launch)',
      Genre: '3D platformer',
      Innovation: 'Analog 360° movement + player-adjustable camera (Lakitu)',
      Sales: '11.91 million',
    },
    summary:
      'The team spent months on an empty garden just making Mario feel right to move — then built ' +
      'a game around that joy. The first masterpiece of 3D space: analog running, triple jumps, ' +
      'and a camera you control.',
    legacy:
      'Super Mario 64 is the Rosetta Stone of 3D character movement; its camera-and-stick grammar ' +
      'is so foundational that "it controls like Mario 64" is still shorthand for "it controls ' +
      'correctly."',
  },
  {
    slug: 'final-fantasy-vii',
    kind: 'game',
    era: 'three-d-revolution',
    name: 'Final Fantasy VII',
    wikiTitle: 'Final Fantasy VII',
    aliases: ['FF7', 'FFVII'],
    year: 1997,
    maker: 'Square',
    platform: 'playstation',
    specs: {
      Director: 'Yoshinori Kitase',
      Released: '1997 (PlayStation, 3 CDs)',
      Genre: 'JRPG',
      Budget: '~$40M+ development — unprecedented',
      Defection: 'Left Nintendo for CD-ROM storage',
      Sales: '9.8 million (PS1, by 2005)',
    },
    summary:
      'Square abandoned Nintendo cartridges for the storage of three CDs and spent Hollywood money ' +
      'on FMV — and a mid-game death scene became a generation’s shared grief. The JRPG’s ' +
      'worldwide breakout moment.',
    legacy:
      'FF7’s platform defection decided the 32-bit war, its marketing blitz proved games could ' +
      'launch like blockbuster films, and Aerith remains the canonical example of narrative ' +
      'permanence in games — no phoenix down, no take-backs.',
  },
  {
    slug: 'ocarina-of-time',
    kind: 'game',
    era: 'three-d-revolution',
    name: 'The Legend of Zelda: Ocarina of Time',
    wikiTitle: 'The Legend of Zelda: Ocarina of Time',
    aliases: ['Ocarina of Time', 'OoT', 'Zelda 64'],
    year: 1998,
    maker: 'Nintendo',
    platform: 'nintendo-64',
    specs: {
      Director: 'Multiple, prod. Shigeru Miyamoto',
      Released: '1998 (N64)',
      Genre: 'Action-adventure',
      Innovation: 'Z-targeting lock-on combat',
      Note: 'Long the highest-rated game on Metacritic (99)',
      Sales: '7.6 million (N64)',
    },
    summary:
      'Zelda’s leap to 3D solved problems nobody had named yet — Z-targeting made 3D combat ' +
      'readable, context buttons made one button do everything, and Hyrule Field made scale itself ' +
      'emotional.',
    legacy:
      'Ocarina’s lock-on targeting was silently adopted by essentially every 3D action game since ' +
      '— from Dark Souls to God of War. Routinely cited as the greatest game ever made, and its ' +
      'speedrun scene is still rewriting it.',
  },
  {
    slug: 'metal-gear-solid',
    kind: 'game',
    era: 'three-d-revolution',
    name: 'Metal Gear Solid',
    wikiTitle: 'Metal Gear Solid (1998 video game)',
    aliases: ['Metal Gear Solid', 'MGS'],
    year: 1998,
    maker: 'Konami',
    platform: 'playstation',
    specs: {
      Director: 'Hideo Kojima',
      Released: '1998 (PlayStation)',
      Genre: 'Stealth ("Tactical Espionage Action")',
      'Fourth wall': 'Psycho Mantis reads your memory card',
      Sales: '6 million (by 2001)',
    },
    summary:
      'Kojima’s cinematic stealth opus: voice-acted cutscenes with real direction, a boss who ' +
      'reads your memory card and makes you swap controller ports, and an anti-nuclear thriller ' +
      'plot games weren’t supposed to attempt.',
    legacy:
      'MGS made "cinematic" a genre ambition rather than an insult and put the director’s name on ' +
      'the box. The medium’s fourth-wall experiments — and its auteur culture — start here.',
  },
  {
    slug: 'grand-theft-auto-iii',
    kind: 'game',
    era: 'three-d-revolution',
    name: 'Grand Theft Auto III',
    wikiTitle: 'Grand Theft Auto III',
    aliases: ['GTA III', 'GTA 3'],
    year: 2001,
    maker: 'DMA Design / Rockstar Games',
    platform: 'playstation-2',
    specs: {
      Developer: 'DMA Design (Edinburgh)',
      Released: '2001 (PlayStation 2)',
      Genre: 'Open-world action',
      Innovation: 'Fully 3D living city sandbox with radio stations',
      Sales: '7 million (worldwide, by 2003)',
    },
    summary:
      'Liberty City turned the open world from a checklist into a place: radio chatter, ' +
      'pedestrians with routines, missions you could simply ignore in favor of chaos. The ' +
      'top-down series went 3D and changed everything.',
    legacy:
      'GTA III created the modern open-world blockbuster — the genre Ubisoft, Bethesda, and ' +
      'Rockstar itself have iterated ever since — and dragged games into mainstream moral panic ' +
      'debates, a rite of passage for any maturing medium.',
  },
  {
    slug: 'halo-combat-evolved',
    kind: 'game',
    era: 'three-d-revolution',
    name: 'Halo: Combat Evolved',
    wikiTitle: 'Halo: Combat Evolved',
    aliases: ['Halo', 'Halo CE'],
    year: 2001,
    maker: 'Bungie / Microsoft',
    platform: 'xbox',
    specs: {
      Developer: 'Bungie',
      Released: '2001 (Xbox launch)',
      Genre: 'First-person shooter',
      Design: 'Two-weapon limit, recharging shield, "30 seconds of fun"',
      Sales: '4 million (worldwide, by 2004)',
    },
    summary:
      'The console shooter finally done right: a two-weapon economy, recharging shields, vehicles, ' +
      'and the LAN-party legend of Blood Gulch. The Xbox sold on this game, full stop.',
    legacy:
      'Halo’s control scheme and shield-regen loop became the console FPS default for twenty ' +
      'years, and Halo 2’s Xbox Live multiplayer blueprint — lobbies, matchmaking, ranks — ' +
      'built the social architecture esports and Call of Duty inherited.',
  },

  {
    slug: 'world-of-warcraft',
    kind: 'game',
    era: 'three-d-revolution',
    name: 'World of Warcraft',
    wikiTitle: 'World of Warcraft',
    aliases: ['WoW'],
    year: 2004,
    maker: 'Blizzard Entertainment',
    specs: {
      Released: '2004 (PC)',
      Genre: 'MMORPG',
      Peak: '12 million simultaneous subscribers (2010)',
      Model: 'Monthly subscription — $15/month at scale',
    },
    summary:
      'Blizzard sanded every rough edge off the MMORPG and twelve million people moved to ' +
      'Azeroth — guild raids became second jobs, and "the game you live in" became a business ' +
      'model.',
    legacy:
      'WoW mainstreamed persistent online worlds and subscription revenue, rewired social lives ' +
      'enough to spawn academic study, and every live-service roadmap since is descended from ' +
      'its content patch cadence.',
  },

  // ───────────────────────── The HD Generation ─────────────────────────
  {
    slug: 'call-of-duty-4',
    kind: 'game',
    era: 'hd-generation',
    name: 'Call of Duty 4: Modern Warfare',
    wikiTitle: 'Call of Duty 4: Modern Warfare',
    aliases: ['Modern Warfare', 'CoD4'],
    year: 2007,
    maker: 'Infinity Ward',
    platform: 'xbox-360',
    specs: {
      Released: '2007',
      Genre: 'First-person shooter',
      Innovation: 'Multiplayer progression — ranks, unlocks, Prestige',
      Mission: '"All Ghillied Up" — the campaign stealth benchmark',
      Sales: '~16 million (by 2013)',
    },
    summary:
      'Call of Duty left WWII for the present day and bolted RPG progression onto multiplayer — ' +
      'ranks, loadouts, killstreaks, Prestige. The loop that ate the next fifteen years of ' +
      'online shooters.',
    legacy:
      'CoD4’s unlock treadmill became the default retention design for the entire industry, and ' +
      'its annualized dominance made Call of Duty the best-selling franchise of the HD era.',
  },
  {
    slug: 'wii-sports',
    kind: 'game',
    era: 'hd-generation',
    name: 'Wii Sports',
    wikiTitle: 'Wii Sports',
    aliases: [],
    year: 2006,
    maker: 'Nintendo',
    platform: 'wii',
    specs: {
      Released: '2006 (Wii pack-in)',
      Genre: 'Sports party',
      Sales: '82.9 million — long the best-selling single-platform game',
      Design: 'Five sports, zero tutorials needed',
    },
    summary:
      'Bowling that grandparents understood in one swing. Bundled with every Wii outside Japan, ' +
      'it became the demonstration disc for an entire philosophy: the controller is the tutorial.',
    legacy:
      'Wii Sports expanded gaming demographics more than any single title in history — retirement ' +
      'homes ran leagues — and remains the canonical proof that accessibility is a feature, ' +
      'not a compromise.',
  },
  {
    slug: 'portal',
    kind: 'game',
    era: 'hd-generation',
    name: 'Portal',
    wikiTitle: 'Portal (video game)',
    aliases: ['Portal'],
    year: 2007,
    maker: 'Valve',
    platform: 'xbox-360',
    specs: {
      Developer: 'Valve (from student project Narbacular Drop)',
      Released: '2007 (The Orange Box)',
      Genre: 'First-person puzzle',
      Length: '~3 hours, zero filler',
      Antagonist: 'GLaDOS',
    },
    summary:
      'A physics puzzle about thinking with portals, narrated by a passive-aggressive AI testing ' +
      'you to death. Three hours long, not a wasted minute, and the cake is a lie.',
    legacy:
      'Portal proved short, dense, and funny could beat long and bloated — a permission slip for ' +
      'every compact masterpiece since. GLaDOS set the bar for AI characters and games-as-comedy ' +
      'writing.',
  },
  {
    slug: 'minecraft',
    kind: 'game',
    era: 'hd-generation',
    name: 'Minecraft',
    wikiTitle: 'Minecraft',
    aliases: ['Mine Craft'],
    year: 2011,
    maker: 'Mojang',
    platform: 'xbox-360',
    specs: {
      Creator: 'Markus "Notch" Persson',
      Released: '2011 (1.0; public alpha 2009)',
      Genre: 'Sandbox survival',
      Sales: '300+ million — best-selling game ever',
      Acquisition: 'Microsoft, $2.5 billion (2014)',
    },
    summary:
      'An indie alpha sold from a blog post became the best-selling game of all time: a world of ' +
      'blocks where the game is whatever you build, survive, or automate with redstone.',
    legacy:
      'Minecraft made user creation the content model, raised a generation on YouTube let’s-plays, ' +
      'entered classrooms as infrastructure, and proved indie distribution could outscale any ' +
      'publisher. Nothing has dethroned it.',
  },
  {
    slug: 'skyrim',
    kind: 'game',
    era: 'hd-generation',
    name: 'The Elder Scrolls V: Skyrim',
    wikiTitle: 'The Elder Scrolls V: Skyrim',
    aliases: ['Skyrim'],
    year: 2011,
    maker: 'Bethesda Game Studios',
    platform: 'playstation-3',
    specs: {
      Director: 'Todd Howard',
      Released: '11/11/11',
      Genre: 'Open-world RPG',
      Systems: 'Radiant quests, full mod support',
      Sales: '60+ million across endless re-releases',
    },
    summary:
      'A frozen province where every mountain on the horizon is climbable and every NPC has a ' +
      'schedule — the open-world RPG as a life-consuming second home, kept alive by a modding ' +
      'scene bigger than most games.',
    legacy:
      'Skyrim defined the "live in it" open world and the art of the eternal re-release — it has ' +
      'shipped on three console generations, VR, and a refrigerator. "It just works" and arrows ' +
      'to the knee are permanent gaming folklore.',
  },
  {
    slug: 'the-last-of-us',
    kind: 'game',
    era: 'hd-generation',
    name: 'The Last of Us',
    wikiTitle: 'The Last of Us (video game)',
    aliases: ['TLOU'],
    year: 2013,
    maker: 'Naughty Dog',
    platform: 'playstation-3',
    specs: {
      Directors: 'Neil Druckmann, Bruce Straley',
      Released: '2013 (PS3, late-generation)',
      Genre: 'Action-adventure / survival',
      Performances: 'Troy Baker & Ashley Johnson, full mocap',
      Sales: '17 million (incl. Remastered)',
    },
    summary:
      'A smuggler, a girl, and a ruined America — the PS3’s swan song fused survival mechanics ' +
      'with performance-captured acting and an opening twenty minutes that rewired expectations ' +
      'for narrative games.',
    legacy:
      'The Last of Us became the standard-bearer for prestige narrative games and the rare ' +
      'adaptation (HBO, 2023) to win over both audiences — the clearest case that game ' +
      'storytelling had reached parity with television.',
  },

  {
    slug: 'angry-birds',
    kind: 'game',
    era: 'hd-generation',
    name: 'Angry Birds',
    wikiTitle: 'Angry Birds (video game)',
    aliases: ['Angry Birds'],
    year: 2009,
    maker: 'Rovio Entertainment',
    specs: {
      Released: '2009 (iOS)',
      Genre: 'Physics puzzle',
      Price: '$0.99 — then free with ads',
      Downloads: 'Billions across the franchise',
    },
    summary:
      'Rovio’s 52nd game: slingshot birds at pig fortresses for 99 cents. The touchscreen in ' +
      'everyone’s pocket suddenly out-shipped every console combined, and gaming’s biggest ' +
      'platform stopped being a console at all.',
    legacy:
      'Angry Birds is the marker stone of the mobile disruption — the moment "gamer" stopped ' +
      'describing a demographic. The free-to-play economics it pivoted into now fund the largest ' +
      'slice of the industry.',
  },

  // ─────────────────────────── The Modern Era ───────────────────────────
  {
    slug: 'grand-theft-auto-v',
    kind: 'game',
    era: 'modern-era',
    name: 'Grand Theft Auto V',
    wikiTitle: 'Grand Theft Auto V',
    aliases: ['GTA V', 'GTA 5'],
    year: 2013,
    maker: 'Rockstar Games',
    platform: 'playstation-4',
    specs: {
      Released: '2013 (then re-released on three more generations)',
      Genre: 'Open-world action',
      Launch: '$1 billion in 3 days — fastest-grossing entertainment product ever',
      Sales: '210+ million',
    },
    summary:
      'Three protagonists, one satirical Los Angeles, and GTA Online — a heist sandbox whose ' +
      'online half became a decade-long money machine that outsold almost everything else ' +
      'released since.',
    legacy:
      'GTA V proved a single game could be a platform spanning console generations, and GTA ' +
      'Online’s Shark Card economics rewrote publisher expectations about post-launch revenue — ' +
      'for better and much worse.',
  },
  {
    slug: 'the-witcher-3',
    kind: 'game',
    era: 'modern-era',
    name: 'The Witcher 3: Wild Hunt',
    wikiTitle: 'The Witcher 3: Wild Hunt',
    aliases: ['Witcher 3', 'TW3'],
    year: 2015,
    maker: 'CD Projekt Red',
    platform: 'playstation-4',
    specs: {
      Developer: 'CD Projekt Red (Warsaw)',
      Released: '2015',
      Genre: 'Open-world RPG',
      Standard: 'Bloody Baron quest — sidequest writing benchmark',
      Sales: '50+ million',
    },
    summary:
      'Geralt of Rivia’s send-off made sidequests the main event: morally knotted stories ' +
      '(the Bloody Baron) with consequences that ripple across a war-torn open world — from a ' +
      'Polish studio nobody yet called a giant.',
    legacy:
      'The Witcher 3 reset expectations for open-world writing and post-launch goodwill (16 free ' +
      'DLCs, two landmark expansions), and put Eastern European development permanently on the ' +
      'AAA map.',
  },
  {
    slug: 'breath-of-the-wild',
    kind: 'game',
    era: 'modern-era',
    name: 'The Legend of Zelda: Breath of the Wild',
    wikiTitle: 'The Legend of Zelda: Breath of the Wild',
    aliases: ['Breath of the Wild', 'BotW', 'Zelda BotW'],
    year: 2017,
    maker: 'Nintendo',
    platform: 'nintendo-switch',
    specs: {
      Director: 'Hidemaro Fujibayashi',
      Released: '2017 (Switch launch)',
      Genre: 'Open-world action-adventure',
      Design: 'Chemistry engine; climb anything, approach anyhow',
      Sales: '33.64 million (Switch)',
    },
    summary:
      'Zelda dismantled its own thirty-year formula: no ordered dungeons, no walls you can’t ' +
      'climb, a physics-and-chemistry engine where setting grass on fire creates an updraft ' +
      'you can glide on. The plateau tutorial is the new World 1-1.',
    legacy:
      'BotW’s systemic "multiplicative gameplay" redirected open-world design away from map ' +
      'icons toward curiosity — Elden Ring’s wordless horizons are its direct descendants. ' +
      'It closed the loop the 1986 Zelda opened.',
  },
  {
    slug: 'fortnite',
    kind: 'game',
    era: 'modern-era',
    name: 'Fortnite',
    wikiTitle: 'Fortnite Battle Royale',
    aliases: ['Fortnite', 'Fortnite BR'],
    year: 2017,
    maker: 'Epic Games',
    platform: 'playstation-4',
    specs: {
      Released: '2017 (Battle Royale mode)',
      Genre: 'Battle royale / platform',
      Model: 'Free-to-play, battle pass, seasonal live events',
      Scale: '650+ million registered accounts',
    },
    summary:
      'A struggling co-op builder pivoted to battle royale in two months and became a place ' +
      'rather than a game: concerts by Travis Scott, movie screenings, crossover skins from ' +
      'every franchise on Earth.',
    legacy:
      'Fortnite normalized the battle pass economy, forced cross-platform play into existence ' +
      '(the Sony holdout broke here), and bankrolled both Unreal Engine 5 and Epic v. Apple — ' +
      'the lawsuit that cracked the App Store.',
  },
  {
    slug: 'god-of-war-2018',
    kind: 'game',
    era: 'modern-era',
    name: 'God of War',
    wikiTitle: 'God of War (2018 video game)',
    aliases: ['God of War 2018', 'GoW 2018', 'Dad of War'],
    year: 2018,
    maker: 'Santa Monica Studio',
    platform: 'playstation-4',
    specs: {
      Director: 'Cory Barlog',
      Released: '2018 (PS4)',
      Genre: 'Action-adventure',
      Camera: 'Single unbroken shot, no cuts',
      Pivot: 'Greek rage to Norse fatherhood',
      Sales: '19.5 million (by 2021)',
    },
    summary:
      'Kratos, the angriest man in games, became a grieving father teaching his son in a Norse ' +
      'wilderness — shot as one continuous camera take. A franchise reinvention nobody believed ' +
      'in until it shipped.',
    legacy:
      'God of War became the template for legacy-franchise maturation and for Sony’s prestige ' +
      'single-player identity. The one-shot camera and "boy" memes both entered the canon.',
  },
  {
    slug: 'elden-ring',
    kind: 'game',
    era: 'modern-era',
    name: 'Elden Ring',
    wikiTitle: 'Elden Ring',
    aliases: [],
    year: 2022,
    maker: 'FromSoftware',
    platform: 'playstation-5',
    specs: {
      Director: 'Hidetaka Miyazaki',
      Worldbuilding: 'George R. R. Martin',
      Released: '2022',
      Genre: 'Open-world action RPG',
      Sales: '30+ million',
    },
    summary:
      'Dark Souls’ interlocking dungeon design unfolded across an open world that never points, ' +
      'never waypoints — just a golden tree on the horizon and the certainty that whatever ' +
      'killed you can be returned to later.',
    legacy:
      'Elden Ring took FromSoftware’s famously punishing formula to mainstream scale, vindicating ' +
      'friction and player trust as mass-market values. "Soulslike" stopped being niche the day ' +
      'it shipped.',
  },
  {
    slug: 'baldurs-gate-3',
    kind: 'game',
    era: 'modern-era',
    name: 'Baldur’s Gate 3',
    wikiTitle: "Baldur's Gate 3",
    aliases: ['BG3', "Baldur's Gate III"],
    year: 2023,
    maker: 'Larian Studios',
    platform: 'playstation-5',
    specs: {
      Director: 'Swen Vincke',
      Released: '2023 (after 3 years early access)',
      Genre: 'CRPG (D&D 5th Edition)',
      Scope: '~17,000 ending permutations, full VO',
      Awards: 'Swept every Game of the Year in 2023',
      Sales: '15 million (by 2024)',
    },
    summary:
      'A Belgian studio shipped a turn-based, 100+ hour Dungeons & Dragons CRPG with full ' +
      'cinematic production — no microtransactions, no live service — and it became a ' +
      'mainstream phenomenon anyway.',
    legacy:
      'BG3 detonated the assumption that depth must be niche, triggered an industry-wide ' +
      '"don’t expect this from everyone" panic among rival publishers, and revived the CRPG as a ' +
      'commercial pinnacle.',
  },
  {
    slug: 'astro-bot',
    kind: 'game',
    era: 'modern-era',
    name: 'Astro Bot',
    wikiTitle: 'Astro Bot',
    aliases: [],
    year: 2024,
    maker: 'Team Asobi',
    platform: 'playstation-5',
    specs: {
      Director: 'Nicolas Doucet',
      Released: '2024 (PS5)',
      Genre: '3D platformer',
      Awards: 'The Game Awards 2024 Game of the Year',
      Sales: '1.5 million by November 2024',
    },
    summary:
      'Team Asobi’s love letter to PlayStation history: a PS5-exclusive 3D platformer stuffed ' +
      'with cameos from thirty years of Sony franchises, and a master class in DualSense haptic ' +
      'design that made the controller as much a part of the experience as the game.',
    legacy:
      'Astro Bot’s TGA 2024 Game of the Year win — the first for a PS5-exclusive platformer — ' +
      'proved that a pure, joyful game built around a single platform’s hardware could beat ' +
      'sprawling open worlds on the industry’s biggest night.',
  },
  {
    slug: 'final-fantasy-vii-rebirth',
    kind: 'game',
    era: 'modern-era',
    name: 'Final Fantasy VII Rebirth',
    wikiTitle: 'Final Fantasy VII Rebirth',
    aliases: ['FF7 Rebirth', 'Final Fantasy 7 Rebirth'],
    year: 2024,
    maker: 'Square Enix',
    platform: 'playstation-5',
    specs: {
      Directors: 'Naoki Hamaguchi / Tetsuya Nomura / Motomu Toriyama',
      Released: '2024 (PS5), 2025 (PC)',
      Genre: 'Action RPG',
      Series: 'Part 2 of the FF7 Remake trilogy',
      Awards: '7 TGA 2024 nominations (incl. Best Score)',
    },
    summary:
      'The second chapter of Square Enix’s ambitious FF7 Remake trilogy opens the world beyond ' +
      'Midgar into a vast, semi-open reimagining of the classic journey — with a score that swept ' +
      'its own TGA category and a story that finally diverges from the original.',
    legacy:
      'FF7 Rebirth demonstrated that a beloved JRPG could be reborn as a multi-part modern epic ' +
      'without losing its soul, setting the template for long-form franchise reconstruction.',
  },
  {
    slug: 'clair-obscur-expedition-33',
    kind: 'game',
    era: 'modern-era',
    name: 'Clair Obscur: Expedition 33',
    wikiTitle: 'Clair Obscur: Expedition 33',
    aliases: ['Expedition 33'],
    year: 2025,
    maker: 'Sandfall Interactive',
    platform: 'playstation-5',
    specs: {
      Director: 'Guillaume Broche',
      Released: '2025 (PS5, Xbox Series X/S, PC)',
      Genre: 'Turn-based RPG with real-time action mechanics',
      Publisher: 'Kepler Interactive',
      Awards: 'The Game Awards 2025 Game of the Year (9 wins — most in TGA history)',
    },
    summary:
      'A debut from a small French studio that arrived with no franchise pedigree and no safety ' +
      'net, blending classic turn-based RPG structure with real-time parry and dodge mechanics ' +
      'against a painterly Belle Époque-inspired world of death and defiance.',
    legacy:
      'Clair Obscur’s record nine TGA 2025 wins — most in the show’s history — made it the ' +
      'defining indie triumph of the decade and proved that a first-time studio from France could ' +
      'capture the Game of the Year crown on sheer creative conviction.',
  },
];
