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
