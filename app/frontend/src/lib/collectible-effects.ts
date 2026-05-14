import { ThemeConfig } from './themes';

// Extended particle type for collectible effects
export type CollectibleParticleType =
  | 'butterfly' | 'droplet' | 'ring' | 'wind' | 'sprout' | 'sparkle'
  | 'firefly' | 'starfish' | 'shell' | 'coral' | 'jellyfish' | 'wave'
  | 'maple' | 'pinecone' | 'acorn' | 'spore' | 'ember' | 'sunset' | 'steam'
  | 'snowflake' | 'ice' | 'aurora' | 'snowman' | 'bell' | 'warmth';

export interface SpawnedParticle {
  type: CollectibleParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  breathPhase?: number;
  breathSpeed?: number;
}

export interface CollectibleEffect {
  emoji: string;
  name: string;
  baseChance: number;
  spawnParticles: (x: number, y: number, theme: ThemeConfig, count: number) => SpawnedParticle[];
  /** Burst version for firework explosions — more particles, bigger, faster */
  spawnBurstParticles?: (x: number, y: number, theme: ThemeConfig, intensity: number) => SpawnedParticle[];
}

// ── Spring Effects ──────────────────────────────────────────────────────

export const springEffects: Record<string, CollectibleEffect> = {
  '\u{1F338}': {
    emoji: '\u{1F338}',
    name: '\u6A31\u82B1\u74E3',
    baseChance: 0.30,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'petal' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 2.5,
        vy: Math.random() * 1.2 + 0.4,
        life: 1, maxLife: 100 + Math.random() * 60,
        color: theme.particleColors[Math.floor(Math.random() * 3)],
        size: Math.random() * 4 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
      })),
  },
  '\u{1F33A}': {
    emoji: '\u{1F33A}',
    name: '\u82B1\u854A',
    baseChance: 0.20,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        return {
          type: 'sparkle' as CollectibleParticleType,
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, maxLife: 50 + Math.random() * 30,
          color: '#FFD700',
          size: Math.random() * 2 + 1,
          rotation: 0, rotationSpeed: 0,
        };
      }),
  },
  '\u{1F98B}': {
    emoji: '\u{1F98B}',
    name: '\u8774\u8776',
    baseChance: 0.18,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: Math.min(count, 3) }, (_, i) => {
        const angle = (Math.PI * 2 / 3) * i + Math.random() * 0.5;
        return {
          type: 'butterfly' as CollectibleParticleType,
          x, y,
          vx: Math.cos(angle) * 1.5,
          vy: Math.sin(angle) * 1.5,
          life: 1, maxLife: 180,
          color: '#FFD700',
          size: 5 + Math.random() * 2,
          rotation: angle,
          rotationSpeed: 0.05,
          orbitAngle: angle,
          orbitRadius: 2,
          orbitSpeed: 0.15,
        };
      }),
  },
  '\u{1F4A7}': {
    emoji: '\u{1F4A7}',
    name: '\u9732\u73E0',
    baseChance: 0.22,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'droplet' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 0.5,
        life: 1, maxLife: 120 + Math.random() * 60,
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)] || '#87CEEB',
        size: Math.random() * 3 + 2,
        rotation: 0, rotationSpeed: 0,
      })),
  },
  '\u{1F490}': {
    emoji: '\u{1F490}',
    name: '\u82B1\u73AF',
    baseChance: 0.15,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: Math.min(count, 2) }, () => ({
        type: 'ring' as CollectibleParticleType,
        x, y,
        vx: 0, vy: 0,
        life: 1, maxLife: 60,
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
        size: 3,
        rotation: 0, rotationSpeed: 0,
      })),
  },
  '\u{1F343}': {
    emoji: '\u{1F343}',
    name: '\u6625\u98CE',
    baseChance: 0.20,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        return {
          type: 'wind' as CollectibleParticleType,
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.5,
          life: 1, maxLife: 70 + Math.random() * 40,
          color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
          size: Math.random() * 3 + 2,
          rotation: angle,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
        };
      }),
  },
  '\u{1F331}': {
    emoji: '\u{1F331}',
    name: '\u65B0\u82BD',
    baseChance: 0.18,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'sprout' as CollectibleParticleType,
        x,
        y: y + Math.random() * 5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 1.5 - 0.5,
        life: 1, maxLife: 90 + Math.random() * 40,
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
        size: Math.random() * 3 + 2,
        rotation: 0, rotationSpeed: 0,
      })),
  },
};

// ── Summer Effects ──────────────────────────────────────────────────────

export const summerEffects: Record<string, CollectibleEffect> = {
  '\u2728': {
    emoji: '\u2728',
    name: '\u8424\u706B\u866B',
    baseChance: 0.28,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'firefly' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 1.5 - 0.5,
        life: 1, maxLife: 150 + Math.random() * 60,
        color: '#F7DC6F',
        size: Math.random() * 3 + 2,
        rotation: 0, rotationSpeed: 0,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 3 + Math.random() * 2,
      })),
  },
  '\u2B50': {
    emoji: '\u2B50',
    name: '\u6D77\u661F',
    baseChance: 0.18,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2;
        return {
          type: 'starfish' as CollectibleParticleType,
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, maxLife: 80 + Math.random() * 40,
          color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
          size: Math.random() * 4 + 3,
          rotation: angle,
          rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * 0.06,
        };
      }),
  },
  '\u{1F41A}': {
    emoji: '\u{1F41A}',
    name: '\u8D1D\u58F3',
    baseChance: 0.20,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'shell' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1,
        vy: Math.random() * 0.5 + 0.3,
        life: 1, maxLife: 100 + Math.random() * 50,
        color: '#FFF8E7',
        size: Math.random() * 3 + 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
      })),
  },
  '\u{1FAB8}': {
    emoji: '\u{1FAB8}',
    name: '\u73CA\u7469',
    baseChance: 0.15,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'coral' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: 1, maxLife: 70 + Math.random() * 40,
        color: '#FF6B6B',
        size: Math.random() * 3 + 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      })),
  },
  '\u{1FABC}': {
    emoji: '\u{1FABC}',
    name: '\u6C34\u6BCD',
    baseChance: 0.18,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: Math.min(count, 3) }, () => ({
        type: 'jellyfish' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 1 - 0.3,
        life: 1, maxLife: 140 + Math.random() * 60,
        color: 'rgba(173, 216, 230, 0.6)',
        size: Math.random() * 5 + 4,
        rotation: 0, rotationSpeed: 0,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 2 + Math.random() * 2,
      })),
  },
  '\u{1F30A}': {
    emoji: '\u{1F30A}',
    name: '\u6D77\u6D6A',
    baseChance: 0.22,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        return {
          type: 'wave' as CollectibleParticleType,
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, maxLife: 60 + Math.random() * 30,
          color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
          size: Math.random() * 3 + 2,
          rotation: angle,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
        };
      }),
  },
  '\u{1F965}': {
    emoji: '\u{1F965}',
    name: '\u6930\u5B50',
    baseChance: 0.16,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'pinecone' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1,
        life: 1, maxLife: 100 + Math.random() * 50,
        color: '#8B4513',
        size: Math.random() * 4 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      })),
  },
};

// ── Autumn Effects ──────────────────────────────────────────────────────

export const autumnEffects: Record<string, CollectibleEffect> = {
  '\u{1F341}': {
    emoji: '\u{1F341}',
    name: '\u67AB\u53F6',
    baseChance: 0.30,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'maple' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 1 + 0.5,
        life: 1, maxLife: 120 + Math.random() * 60,
        color: theme.particleColors[Math.floor(Math.random() * 3)],
        size: Math.random() * 5 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.06,
      })),
  },
  '\u{1F330}': {
    emoji: '\u{1F330}',
    name: '\u677E\u679C',
    baseChance: 0.18,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'pinecone' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1,
        life: 1, maxLife: 100 + Math.random() * 50,
        color: '#8B6914',
        size: Math.random() * 3 + 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
      })),
  },
  '\u{1FAD2}': {
    emoji: '\u{1FAD2}',
    name: '\u6A61\u679C',
    baseChance: 0.18,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'acorn' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 1.5,
        life: 1, maxLife: 80 + Math.random() * 40,
        color: '#A0522D',
        size: Math.random() * 3 + 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      })),
  },
  '\u{1F344}': {
    emoji: '\u{1F344}',
    name: '\u8611\u83C7',
    baseChance: 0.16,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'spore' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 0.8 - 0.2,
        life: 1, maxLife: 130 + Math.random() * 70,
        color: 'rgba(255, 255, 255, 0.7)',
        size: Math.random() * 2 + 1,
        rotation: 0, rotationSpeed: 0,
      })),
  },
  '\u{1F383}': {
    emoji: '\u{1F383}',
    name: '\u5357\u74DC',
    baseChance: 0.20,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'ember' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5,
        life: 1, maxLife: 100 + Math.random() * 50,
        color: theme.particleColors[Math.floor(Math.random() * 3)],
        size: Math.random() * 3 + 1.5,
        rotation: 0, rotationSpeed: 0,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 4 + Math.random() * 3,
      })),
  },
  '\u{1F305}': {
    emoji: '\u{1F305}',
    name: '\u843D\u65E5',
    baseChance: 0.15,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: Math.min(count, 3) }, (_, i) => {
        const angle = (Math.PI * 2 / 8) * i;
        return {
          type: 'sunset' as CollectibleParticleType,
          x, y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 0.5,
          life: 1, maxLife: 70 + Math.random() * 30,
          color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
          size: Math.random() * 4 + 3,
          rotation: angle,
          rotationSpeed: 0.02,
        };
      }),
  },
  '\u{1F375}': {
    emoji: '\u{1F375}',
    name: '\u6696\u8336',
    baseChance: 0.18,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'steam' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 1.5 - 0.5,
        life: 1, maxLife: 120 + Math.random() * 60,
        color: 'rgba(255, 255, 255, 0.4)',
        size: Math.random() * 5 + 3,
        rotation: 0, rotationSpeed: 0,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 1.5 + Math.random(),
      })),
  },
};

// ── Winter Effects ──────────────────────────────────────────────────────

export const winterEffects: Record<string, CollectibleEffect> = {
  '\u2744\uFE0F': {
    emoji: '\u2744\uFE0F',
    name: '\u96EA\u82B1',
    baseChance: 0.30,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'snowflake' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1 + 0.3,
        life: 1, maxLife: 140 + Math.random() * 80,
        color: '#FFFFFF',
        size: Math.random() * 4 + 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
      })),
  },
  '\u{1F48E}': {
    emoji: '\u{1F48E}',
    name: '\u51B0\u6676',
    baseChance: 0.20,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'ice' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        life: 1, maxLife: 80 + Math.random() * 40,
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
        size: Math.random() * 4 + 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
      })),
  },
  '\u{1F30C}': {
    emoji: '\u{1F30C}',
    name: '\u6781\u5149',
    baseChance: 0.15,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: Math.min(count, 2) }, () => ({
        type: 'aurora' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0,
        life: 1, maxLife: 90 + Math.random() * 40,
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
        size: 8 + Math.random() * 6,
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.01,
      })),
  },
  '\u26C4': {
    emoji: '\u26C4',
    name: '\u96EA\u4EBA',
    baseChance: 0.18,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'snowman' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1, maxLife: 70 + Math.random() * 40,
        color: '#FFFFFF',
        size: Math.random() * 4 + 3,
        rotation: 0, rotationSpeed: 0,
      })),
  },
  '\u{1F514}': {
    emoji: '\u{1F514}',
    name: '\u94C3\u94DB',
    baseChance: 0.18,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'bell' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        life: 1, maxLife: 60 + Math.random() * 30,
        color: '#FFD700',
        size: Math.random() * 3 + 2,
        rotation: 0, rotationSpeed: 0,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 5 + Math.random() * 3,
      })),
  },
  '\u{1F31F}': {
    emoji: '\u{1F31F}',
    name: '\u661F\u5149',
    baseChance: 0.22,
    spawnParticles: (x, y, _theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'bell' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1, maxLife: 100 + Math.random() * 50,
        color: '#FFFFFF',
        size: Math.random() * 3 + 1.5,
        rotation: 0, rotationSpeed: 0,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 3 + Math.random() * 2,
      })),
  },
  '\u{1F525}': {
    emoji: '\u{1F525}',
    name: '\u6696\u7089',
    baseChance: 0.20,
    spawnParticles: (x, y, theme, count) =>
      Array.from({ length: count }, () => ({
        type: 'warmth' as CollectibleParticleType,
        x, y,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 1.5 - 0.3,
        life: 1, maxLife: 120 + Math.random() * 60,
        color: theme.particleColors[Math.floor(Math.random() * 2)],
        size: Math.random() * 5 + 3,
        rotation: 0, rotationSpeed: 0,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 2 + Math.random() * 2,
      })),
  },
};

// ── Maps ────────────────────────────────────────────────────────────────

export const collectibleEffectsMap: Record<string, Record<string, CollectibleEffect>> = {
  spring: springEffects,
  summer: summerEffects,
  autumn: autumnEffects,
  winter: winterEffects,
};

// ── Helpers ─────────────────────────────────────────────────────────────

export interface ActiveEffect {
  effect: CollectibleEffect;
  count: number;
}

export function getActiveEffects(
  themeId: string,
  collected: Record<string, number>
): ActiveEffect[] {
  const effects = collectibleEffectsMap[themeId];
  if (!effects) return [];

  return Object.entries(collected)
    .filter(([emoji, count]) => count > 0 && effects[emoji])
    .map(([emoji, count]) => ({ effect: effects[emoji], count }));
}

export function calculateMixChance(
  collected: Record<string, number>
): number {
  const uniqueItems = Object.values(collected).filter((c) => c > 0).length;
  return Math.min(0.20 + uniqueItems * 0.04, 0.55);
}

export function getCollectibleTypePriority(type: string): boolean {
  // Types that can be culled first when particle count exceeds MAX_PARTICLES
  const lowPriority = new Set<string>([
    'ambient', 'trail', 'floater',
    'wind', 'sprout', 'shell', 'coral', 'spore', 'steam',
    'snowman', 'warmth',
  ]);
  return lowPriority.has(type);
}

// ── Burst Particle System — collectible items erupt from fireworks ─────────────────

interface BurstConfig {
  type: CollectibleParticleType;
  count: number;
  sizeMin: number;
  sizeMax: number;
  speedMin: number;
  speedMax: number;
  gravity: number;
  rotationSpeedMin: number;
  rotationSpeedMax: number;
  lifeMin: number;
  lifeMax: number;
  spreadMode: 'radial' | 'upward' | 'downward' | 'float';
  colors?: string[];
  breathe?: boolean;
}

const burstConfigs: Record<string, BurstConfig> = {
  // Spring
  '\u{1F338}': { type: 'petal', count: 22, sizeMin: 5, sizeMax: 10, speedMin: 1.5, speedMax: 4.5, gravity: 0.25, rotationSpeedMin: -0.06, rotationSpeedMax: 0.06, lifeMin: 120, lifeMax: 200, spreadMode: 'downward' },
  '\u{1F33A}': { type: 'sparkle', count: 18, sizeMin: 2, sizeMax: 5, speedMin: 2, speedMax: 5, gravity: 0.1, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 80, lifeMax: 140, spreadMode: 'radial', colors: ['#FFD700', '#FFEC8B', '#FFF8DC'] },
  '\u{1F98B}': { type: 'butterfly', count: 5, sizeMin: 7, sizeMax: 12, speedMin: 1, speedMax: 3, gravity: -0.15, rotationSpeedMin: 0.03, rotationSpeedMax: 0.08, lifeMin: 180, lifeMax: 280, spreadMode: 'float', colors: ['#FFD700', '#FF8C00', '#FFB6C1'] },
  '\u{1F4A7}': { type: 'droplet', count: 16, sizeMin: 2, sizeMax: 5, speedMin: 1, speedMax: 3, gravity: -0.05, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 120, lifeMax: 200, spreadMode: 'float', colors: ['rgba(135,206,235,0.6)', 'rgba(173,216,230,0.5)', 'rgba(176,224,230,0.4)'], breathe: true },
  '\u{1F490}': { type: 'ring', count: 4, sizeMin: 6, sizeMax: 14, speedMin: 0.5, speedMax: 2, gravity: 0, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 80, lifeMax: 140, spreadMode: 'radial' },
  '\u{1F343}': { type: 'wind', count: 18, sizeMin: 3, sizeMax: 7, speedMin: 2.5, speedMax: 6, gravity: 0.05, rotationSpeedMin: -0.08, rotationSpeedMax: 0.08, lifeMin: 80, lifeMax: 140, spreadMode: 'radial' },
  '\u{1F331}': { type: 'sprout', count: 14, sizeMin: 4, sizeMax: 8, speedMin: 1, speedMax: 3, gravity: -0.2, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 100, lifeMax: 180, spreadMode: 'upward' },
  // Summer
  '\u2728': { type: 'firefly', count: 22, sizeMin: 3, sizeMax: 6, speedMin: 1, speedMax: 3.5, gravity: -0.1, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 140, lifeMax: 220, spreadMode: 'float', colors: ['#F7DC6F', '#FFFF99', '#FFD700'], breathe: true },
  '\u2B50': { type: 'starfish', count: 14, sizeMin: 5, sizeMax: 10, speedMin: 1.5, speedMax: 4, gravity: 0.15, rotationSpeedMin: -0.05, rotationSpeedMax: 0.05, lifeMin: 100, lifeMax: 160, spreadMode: 'radial' },
  '\u{1F41A}': { type: 'shell', count: 14, sizeMin: 3, sizeMax: 6, speedMin: 1, speedMax: 3, gravity: -0.08, rotationSpeedMin: -0.03, rotationSpeedMax: 0.03, lifeMin: 120, lifeMax: 200, spreadMode: 'float', colors: ['rgba(255,248,231,0.7)', 'rgba(255,228,196,0.6)', 'rgba(255,222,173,0.5)'], breathe: true },
  '\u{1FAB8}': { type: 'coral', count: 12, sizeMin: 4, sizeMax: 8, speedMin: 1, speedMax: 3, gravity: 0.1, rotationSpeedMin: -0.04, rotationSpeedMax: 0.04, lifeMin: 80, lifeMax: 140, spreadMode: 'radial', colors: ['#FF6B6B', '#FF8E8E', '#FFAAAA'] },
  '\u{1FABC}': { type: 'jellyfish', count: 5, sizeMin: 8, sizeMax: 14, speedMin: 0.5, speedMax: 2, gravity: -0.1, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 160, lifeMax: 260, spreadMode: 'float', colors: ['rgba(173,216,230,0.7)', 'rgba(135,206,250,0.6)'], breathe: true },
  '\u{1F30A}': { type: 'wave', count: 16, sizeMin: 4, sizeMax: 9, speedMin: 2.5, speedMax: 5.5, gravity: 0.05, rotationSpeedMin: -0.06, rotationSpeedMax: 0.06, lifeMin: 80, lifeMax: 140, spreadMode: 'radial' },
  '\u{1F965}': { type: 'pinecone', count: 12, sizeMin: 3, sizeMax: 6, speedMin: 1, speedMax: 3, gravity: -0.05, rotationSpeedMin: -0.05, rotationSpeedMax: 0.05, lifeMin: 140, lifeMax: 220, spreadMode: 'float', colors: ['rgba(139,69,19,0.5)', 'rgba(160,82,45,0.4)', 'rgba(205,133,63,0.3)'], breathe: true },
  // Autumn
  '\u{1F341}': { type: 'maple', count: 24, sizeMin: 5, sizeMax: 9, speedMin: 1.5, speedMax: 4.5, gravity: 0.05, rotationSpeedMin: -0.06, rotationSpeedMax: 0.06, lifeMin: 140, lifeMax: 220, spreadMode: 'float' },
  '\u{1F330}': { type: 'pinecone', count: 12, sizeMin: 3, sizeMax: 6, speedMin: 1, speedMax: 3, gravity: -0.05, rotationSpeedMin: -0.05, rotationSpeedMax: 0.05, lifeMin: 140, lifeMax: 220, spreadMode: 'float', colors: ['rgba(139,105,20,0.5)', 'rgba(160,82,45,0.4)', 'rgba(184,134,11,0.3)'], breathe: true },
  '\u{1FAD2}': { type: 'acorn', count: 14, sizeMin: 3, sizeMax: 6, speedMin: 1.5, speedMax: 3.5, gravity: -0.05, rotationSpeedMin: -0.06, rotationSpeedMax: 0.06, lifeMin: 140, lifeMax: 220, spreadMode: 'float', colors: ['rgba(160,82,45,0.5)', 'rgba(139,69,19,0.4)', 'rgba(205,133,63,0.3)'], breathe: true },
  '\u{1F344}': { type: 'spore', count: 20, sizeMin: 2, sizeMax: 5, speedMin: 0.5, speedMax: 2, gravity: -0.15, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 140, lifeMax: 220, spreadMode: 'float', colors: ['rgba(255,255,255,0.6)', 'rgba(255,250,240,0.5)'], breathe: true },
  '\u{1F383}': { type: 'ember', count: 18, sizeMin: 3, sizeMax: 6, speedMin: 1.5, speedMax: 4, gravity: -0.2, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 100, lifeMax: 160, spreadMode: 'upward', breathe: true },
  '\u{1F305}': { type: 'sunset', count: 8, sizeMin: 6, sizeMax: 12, speedMin: 1, speedMax: 3, gravity: 0.05, rotationSpeedMin: 0.01, rotationSpeedMax: 0.03, lifeMin: 100, lifeMax: 160, spreadMode: 'radial' },
  '\u{1F375}': { type: 'steam', count: 16, sizeMin: 4, sizeMax: 10, speedMin: 0.5, speedMax: 2, gravity: -0.2, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 120, lifeMax: 200, spreadMode: 'upward', colors: ['rgba(255,255,255,0.35)', 'rgba(255,250,240,0.25)'], breathe: true },
  // Winter
  '\u2744\uFE0F': { type: 'snowflake', count: 26, sizeMin: 3, sizeMax: 7, speedMin: 0.8, speedMax: 2.5, gravity: 0.02, rotationSpeedMin: -0.04, rotationSpeedMax: 0.04, lifeMin: 160, lifeMax: 260, spreadMode: 'float', colors: ['#FFFFFF', '#E0F7FA', '#B2EBF2'] },
  '\u{1F48E}': { type: 'ice', count: 16, sizeMin: 4, sizeMax: 9, speedMin: 1.5, speedMax: 4, gravity: 0.15, rotationSpeedMin: -0.06, rotationSpeedMax: 0.06, lifeMin: 100, lifeMax: 160, spreadMode: 'radial', colors: ['#AED6F1', '#85C1E9', '#D6EAF8'] },
  '\u{1F30C}': { type: 'aurora', count: 6, sizeMin: 10, sizeMax: 20, speedMin: 0.3, speedMax: 1.5, gravity: 0, rotationSpeedMin: 0.005, rotationSpeedMax: 0.015, lifeMin: 120, lifeMax: 200, spreadMode: 'float' },
  '\u26C4': { type: 'snowman', count: 10, sizeMin: 3, sizeMax: 7, speedMin: 0.8, speedMax: 2.5, gravity: -0.08, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 140, lifeMax: 220, spreadMode: 'float', colors: ['rgba(255,255,255,0.7)', 'rgba(232,244,248,0.5)'], breathe: true },
  '\u{1F514}': { type: 'bell', count: 14, sizeMin: 4, sizeMax: 8, speedMin: 1.5, speedMax: 4, gravity: 0.1, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 80, lifeMax: 140, spreadMode: 'radial', colors: ['#FFD700', '#FFC125', '#FFE4B5'], breathe: true },
  '\u{1F31F}': { type: 'bell', count: 18, sizeMin: 2, sizeMax: 5, speedMin: 0.5, speedMax: 2.5, gravity: -0.05, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 120, lifeMax: 200, spreadMode: 'float', colors: ['#FFFFFF', '#FFFACD', '#FAFAD2'], breathe: true },
  '\u{1F525}': { type: 'warmth', count: 18, sizeMin: 4, sizeMax: 9, speedMin: 1, speedMax: 3, gravity: -0.25, rotationSpeedMin: 0, rotationSpeedMax: 0, lifeMin: 120, lifeMax: 200, spreadMode: 'upward', breathe: true },
};

/**
 * Generate burst particles for a collectible item — called when fireworks explode.
 * Intensity: 1 = normal firework, 2+ = charged/combo explosions.
 */
export function spawnCollectibleBurst(
  emoji: string,
  x: number,
  y: number,
  theme: ThemeConfig,
  intensity: number = 1
): SpawnedParticle[] {
  const cfg = burstConfigs[emoji];
  if (!cfg) return [];

  const count = Math.floor(cfg.count * intensity);
  const colors = cfg.colors || theme.particleColors;
  const particles: SpawnedParticle[] = [];

  for (let i = 0; i < count; i++) {
    let vx = 0, vy = 0;
    const angle = (Math.PI * 2 * i) / Math.max(count, 1) + Math.random() * 0.5;
    const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);

    switch (cfg.spreadMode) {
      case 'radial':
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        break;
      case 'upward':
        vx = (Math.random() - 0.5) * speed * 1.5;
        vy = -speed * (0.6 + Math.random() * 0.4);
        break;
      case 'downward':
        vx = (Math.random() - 0.5) * speed * 1.2;
        vy = speed * (0.3 + Math.random() * 0.7);
        break;
      case 'float':
        vx = Math.cos(angle) * speed * 0.7;
        vy = Math.sin(angle) * speed * 0.5 - Math.random() * 0.5;
        break;
    }

    const p: SpawnedParticle = {
      x,
      y,
      vx,
      vy,
      life: 1,
      maxLife: Math.floor((cfg.lifeMin + Math.random() * (cfg.lifeMax - cfg.lifeMin)) * intensity),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: (cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)) * Math.min(intensity, 1.5),
      type: cfg.type,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: cfg.rotationSpeedMin + Math.random() * (cfg.rotationSpeedMax - cfg.rotationSpeedMin),
    };

    // Gravity stored as orbitSpeed hack (particle canvas will apply vy += gravity each frame)
    // Actually, let's store it differently. We'll add gravity to vy each frame in the update loop.
    // For now, store in a custom property via type assertion.
    (p as unknown as Record<string, number>).gravity = cfg.gravity;

    if (cfg.breathe) {
      p.breathPhase = Math.random() * Math.PI * 2;
      p.breathSpeed = 2 + Math.random() * 3;
    }

    particles.push(p);
  }

  return particles;
}

/**
 * Get all burst particles for active collectible effects.
 */
export function getCollectibleBurstParticles(
  themeId: string,
  collected: Record<string, number>,
  x: number,
  y: number,
  theme: ThemeConfig,
  intensity: number = 1
): SpawnedParticle[] {
  const effects = collectibleEffectsMap[themeId];
  if (!effects) return [];

  const all: SpawnedParticle[] = [];
  for (const [emoji, count] of Object.entries(collected)) {
    if (count > 0 && burstConfigs[emoji]) {
      // More collected = more intensity
      const itemIntensity = intensity * (1 + Math.log(count + 1) * 0.3);
      const burst = spawnCollectibleBurst(emoji, x, y, theme, itemIntensity);
      all.push(...burst);
    }
  }
  return all;
}
