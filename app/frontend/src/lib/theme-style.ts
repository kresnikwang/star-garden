/**
 * Theme visual language — watercolor / painterly fireworks (not emoji/iOS icon style).
 */
import type { ThemeConfig } from './themes';
import type { SpawnedParticle } from './collectible-effects';
import { spawnCollectibleBurst } from './collectible-effects';

/** Primary firework body silhouette per season */
export type FireworkShape =
  | 'petal'    // spring — soft blossom petal
  | 'orb'      // summer — luminous firefly orb
  | 'leaf'     // autumn — maple / falling leaf
  | 'crystal'  // winter — soft ice crystal
  | 'mist'     // rain — elongated rain wash
  | 'moon'     // moon — soft crescent / lunar blot
  | 'sand'     // desert — grainy dune spark
  | 'ripple'   // lake — soft water ellipse
  | 'wash';    // generic ink wash blot

export function getThemeFireworkShape(themeId: string): FireworkShape {
  switch (themeId) {
    case 'spring': return 'petal';
    case 'summer': return 'orb';
    case 'autumn': return 'leaf';
    case 'winter': return 'crystal';
    case 'rain': return 'mist';
    case 'moon': return 'moon';
    case 'desert': return 'sand';
    case 'lake': return 'ripple';
    default: return 'wash';
  }
}

/** Softer, slightly desaturated palette for watercolor feel */
export function getWatercolorPalette(theme: ThemeConfig): string[] {
  const mistByTheme: Record<string, string[]> = {
    winter: ['#E8F4F8', '#D0E8F0', '#B8D4E0'],
    autumn: ['#F5E6D3', '#E8D4B8', '#D4C4A8'],
    summer: ['#E0F4F0', '#C8E8E0', '#B0DCD0'],
    spring: ['#FFE8EE', '#FFD8E4', '#F8C8D8'],
    rain: ['#D0DCE4', '#C0D0D8', '#E0E8EC'],
    moon: ['#F0E8D8', '#E8E0F0', '#F8F0E0'],
    desert: ['#F0E0C8', '#E8D4B0', '#D8C8A8'],
    lake: ['#D0E4E0', '#C8D8E0', '#E0E8E4'],
  };
  const mist = mistByTheme[theme.id] ?? ['#F0E8E8', '#E8E0E0'];
  return [...theme.particleColors, ...mist.slice(0, 2)];
}

/** Firework motion character per theme */
export function getThemeFireworkMotion(themeId: string): {
  drag: number;
  gravity: number;
  sizeMul: number;
  lifeMul: number;
  speedMul: number;
} {
  switch (themeId) {
    case 'spring': return { drag: 0.985, gravity: 0.012, sizeMul: 1.1, lifeMul: 1.15, speedMul: 0.9 };
    case 'summer': return { drag: 0.99, gravity: -0.008, sizeMul: 0.95, lifeMul: 1.25, speedMul: 0.75 };
    case 'autumn': return { drag: 0.98, gravity: 0.02, sizeMul: 1.15, lifeMul: 1.2, speedMul: 0.85 };
    case 'winter': return { drag: 0.992, gravity: 0.008, sizeMul: 1.0, lifeMul: 1.3, speedMul: 0.7 };
    case 'rain': return { drag: 0.988, gravity: 0.035, sizeMul: 0.9, lifeMul: 1.1, speedMul: 1.05 };
    case 'moon': return { drag: 0.993, gravity: 0.004, sizeMul: 1.15, lifeMul: 1.35, speedMul: 0.65 };
    case 'desert': return { drag: 0.982, gravity: 0.018, sizeMul: 1.05, lifeMul: 1.15, speedMul: 0.95 };
    case 'lake': return { drag: 0.99, gravity: 0.006, sizeMul: 1.05, lifeMul: 1.3, speedMul: 0.72 };
    default: return { drag: 0.985, gravity: 0.015, sizeMul: 1, lifeMul: 1, speedMul: 1 };
  }
}

export interface MixBurstOptions {
  x: number;
  y: number;
  theme: ThemeConfig;
  collected: Record<string, number>;
  intensity: number;
  /** Max mix probability cap */
  chanceCap?: number;
  /** Force high chance (combo) */
  forceChance?: number;
}

/**
 * Shared collectible-into-firework mix logic (was duplicated across swipe/firework spawners).
 */
export function mixCollectibleBursts(opts: MixBurstOptions): SpawnedParticle[] {
  const { x, y, theme, collected, intensity, chanceCap = 0.6, forceChance } = opts;
  const itemEntries = Object.entries(collected).filter(([, c]) => c > 0);
  if (itemEntries.length === 0) return [];

  const uniqueItems = itemEntries.length;
  const mixChance = forceChance ?? Math.min(0.2 + uniqueItems * 0.03, chanceCap);
  const out: SpawnedParticle[] = [];

  for (const [emoji, collectedCount] of itemEntries) {
    if (Math.random() < mixChance) {
      const itemIntensity = intensity * (1 + Math.log(collectedCount + 1) * 0.2);
      out.push(...spawnCollectibleBurst(emoji, x, y, theme, itemIntensity));
    }
  }
  return out;
}

/** Map emoji keys → stable icon kind for watercolor SVG icons */
export type CollectibleKind =
  | 'petal' | 'stamen' | 'butterfly' | 'droplet' | 'wreath' | 'wind' | 'sprout'
  | 'firefly' | 'starfish' | 'shell' | 'coral' | 'jellyfish' | 'wave' | 'coconut'
  | 'maple' | 'pinecone' | 'acorn' | 'mushroom' | 'pumpkin' | 'sunset' | 'tea'
  | 'snowflake' | 'ice' | 'aurora' | 'snowman' | 'bell' | 'starlight' | 'hearth'
  | 'unknown';

const EMOJI_TO_KIND: Record<string, CollectibleKind> = {
  '\u{1F338}': 'petal',
  '\u{1F33A}': 'stamen',
  '\u{1F98B}': 'butterfly',
  '\u{1F4A7}': 'droplet',
  '\u{1F490}': 'wreath',
  '\u{1F343}': 'wind',
  '\u{1F331}': 'sprout',
  '\u2728': 'firefly',
  '\u2B50': 'starfish',
  '\u{1F41A}': 'shell',
  '\u{1FAB8}': 'coral',
  '\u{1FABC}': 'jellyfish',
  '\u{1F30A}': 'wave',
  '\u{1F965}': 'coconut',
  '\u{1F341}': 'maple',
  '\u{1F330}': 'pinecone',
  '\u{1FAD2}': 'acorn',
  '\u{1F344}': 'mushroom',
  '\u{1F383}': 'pumpkin',
  '\u{1F305}': 'sunset',
  '\u{1F375}': 'tea',
  '\u2744\uFE0F': 'snowflake',
  '\u2744': 'snowflake',
  '\u{1F48E}': 'ice',
  '\u{1F30C}': 'aurora',
  '\u26C4': 'snowman',
  '\u{1F514}': 'bell',
  '\u{1F31F}': 'starlight',
  '\u{1F525}': 'hearth',
  // Rain
  '\u2614': 'droplet',
  '\u{1F3EE}': 'hearth',
  '\u{1FAE7}': 'droplet',
  '\u26F5': 'shell',
  '\u{1F32B}\uFE0F': 'tea',
  '\u{1F33F}': 'sprout',
  '\u{1F4A6}': 'droplet',
  // Moon
  '\u{1F315}': 'starlight',
  '\u{1F33C}': 'stamen',
  '\u{1F430}': 'butterfly',
  '\u{1F56F}\uFE0F': 'hearth',
  '\u2601\uFE0F': 'tea',
  '\u{1F319}': 'starlight',
  '\u{1F4AB}': 'starlight',
  // Desert
  '\u{1F3DC}\uFE0F': 'pinecone',
  '\u{1F335}': 'sprout',
  '\u{1FAA8}': 'starlight',
  '\u{1F32C}\uFE0F': 'wind',
  '\u{1F6F8}': 'aurora',
  '\u{1F42A}': 'acorn',
  '\u{1F307}': 'sunset',
  // Lake
  '\u{1FAB7}': 'petal',
  '\u{1F41F}': 'jellyfish',
  '\u{1F33E}': 'wind',
  '\u{1FA9E}': 'shell',
  '\u{1F986}': 'butterfly',
  '\u{1F40C}': 'sprout',
};

export function getCollectibleKind(emoji: string): CollectibleKind {
  return EMOJI_TO_KIND[emoji] ?? 'unknown';
}

/** Soft accent colors for icons when no theme color given */
export const KIND_DEFAULT_COLORS: Record<CollectibleKind, string> = {
  petal: '#E8A0B0',
  stamen: '#E8C86A',
  butterfly: '#D4A0C0',
  droplet: '#8EC4D8',
  wreath: '#D890A8',
  wind: '#90C090',
  sprout: '#7CB87C',
  firefly: '#E8D070',
  starfish: '#E8C070',
  shell: '#E8D8C0',
  coral: '#E08080',
  jellyfish: '#90C8E0',
  wave: '#70B0C8',
  coconut: '#C09060',
  maple: '#D07040',
  pinecone: '#A07840',
  acorn: '#B08050',
  mushroom: '#D09080',
  pumpkin: '#E09040',
  sunset: '#E08060',
  tea: '#C8C0B0',
  snowflake: '#D0E8F0',
  ice: '#A0C8E0',
  aurora: '#80D0B0',
  snowman: '#E8F0F4',
  bell: '#E0C060',
  starlight: '#F0E8C0',
  hearth: '#E09060',
  unknown: '#C0B0C0',
};
