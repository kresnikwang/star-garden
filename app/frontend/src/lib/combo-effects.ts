import { ThemeConfig, themes } from './themes';

// Combo tier definitions
export type ComboTier = 'base' | 'ultimate';

export interface ComboStatus {
  tier: ComboTier;
  themeId: string;
  uniqueCount: number;
}

/**
 * Check if a combo is available based on collected items.
 * Base combo: 5 unique items collected.
 * Ultimate combo: all 7 unique items collected.
 */
export function checkComboStatus(
  themeId: string,
  collected: Record<string, number>
): ComboStatus | null {
  const theme = themes[themeId];
  if (!theme) return null;

  const uniqueCount = theme.collectibleEmojis.filter(
    (e) => (collected[e] || 0) > 0
  ).length;

  if (uniqueCount >= 7) return { tier: 'ultimate', themeId, uniqueCount };
  if (uniqueCount >= 5) return { tier: 'base', themeId, uniqueCount };
  return null;
}

// Particle type alias for combo particles
export type ComboParticleType = 'combo_vortex' | 'combo_wave' | 'combo_star' | 'combo_ring';

/**
 * Combo-specific particle interface (compatible with ParticleCanvas Particle type)
 */
export interface ComboParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: string;
  rotation: number;
  rotationSpeed: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  breathPhase?: number;
  breathSpeed?: number;
}

// ── Combo probability per firework ────────────────────────────────────

export function getComboTriggerChance(tier: ComboTier): number {
  return tier === 'ultimate' ? 0.25 : 0.15;
}

// ── Spring: 樱花旋涡 (Sakura Vortex) ─────────────────────────────────

function springBaseCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles: ComboParticle[] = [];
  const count = 35;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const radius = 3 + Math.random() * 2;
    const speed = 0.8 + Math.random() * 0.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 140 + Math.random() * 60,
      color: theme.particleColors[i % 3],
      size: 3 + Math.random() * 4,
      type: 'combo_vortex',
      rotation: angle,
      rotationSpeed: 0.06 * (i % 2 === 0 ? 1 : -1),
      orbitAngle: angle,
      orbitRadius: radius,
      orbitSpeed: 0.04 + Math.random() * 0.02,
    });
  }
  return particles;
}

function springUltimateCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles = springBaseCombo(x, y, theme);
  // Double the vortex size
  for (const p of particles) {
    p.maxLife *= 1.5;
    p.size *= 1.4;
    if (p.orbitRadius) p.orbitRadius *= 1.8;
  }
  // Add central star
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 1, maxLife: 200,
    color: '#FFFFFF',
    size: 10,
    type: 'combo_star',
    rotation: 0, rotationSpeed: 0.02,
    breathPhase: 0, breathSpeed: 3,
  });
  // Add expanding rings
  for (let i = 0; i < 3; i++) {
    particles.push({
      x, y, vx: 0, vy: 0,
      life: 1, maxLife: 80 + i * 20,
      color: theme.particleColors[i % theme.particleColors.length],
      size: 5 + i * 3,
      type: 'combo_ring',
      rotation: 0, rotationSpeed: 0,
    });
  }
  return particles;
}

// ── Summer: 萤光浪潮 (Bioluminescent Wave) ────────────────────────────

function summerBaseCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles: ComboParticle[] = [];
  const count = 35;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const wave = Math.sin(angle * 3) * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * (2 + wave * 0.5),
      vy: Math.sin(angle) * (2 + wave * 0.5),
      life: 1,
      maxLife: 120 + Math.random() * 60,
      color: theme.particleColors[i % theme.particleColors.length],
      size: 2 + Math.random() * 4,
      type: 'combo_wave',
      rotation: angle,
      rotationSpeed: 0,
      breathPhase: i * 0.3,
      breathSpeed: 4 + Math.random() * 2,
    });
  }
  return particles;
}

function summerUltimateCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles = summerBaseCombo(x, y, theme);
  for (const p of particles) {
    p.maxLife *= 1.5;
    p.size *= 1.3;
  }
  // Central pulsating orb
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 1, maxLife: 200,
    color: '#48C9B0',
    size: 12,
    type: 'combo_star',
    rotation: 0, rotationSpeed: 0.01,
    breathPhase: 0, breathSpeed: 2,
  });
  for (let i = 0; i < 3; i++) {
    particles.push({
      x, y, vx: 0, vy: 0,
      life: 1, maxLife: 90 + i * 15,
      color: theme.particleColors[i % theme.particleColors.length],
      size: 6 + i * 4,
      type: 'combo_ring',
      rotation: 0, rotationSpeed: 0,
    });
  }
  return particles;
}

// ── Autumn: 枫叶旋风 (Golden Leaf Tornado) ────────────────────────────

function autumnBaseCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles: ComboParticle[] = [];
  const count = 35;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const r = 2 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * 1.5,
      vy: Math.sin(angle) * 1.5 + 0.5,
      life: 1,
      maxLife: 130 + Math.random() * 70,
      color: theme.particleColors[i % 4],
      size: 4 + Math.random() * 4,
      type: 'combo_vortex',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      orbitAngle: angle,
      orbitRadius: r,
      orbitSpeed: 0.05 + Math.random() * 0.03,
    });
  }
  return particles;
}

function autumnUltimateCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles = autumnBaseCombo(x, y, theme);
  for (const p of particles) {
    p.maxLife *= 1.4;
    p.size *= 1.3;
    if (p.orbitRadius) p.orbitRadius *= 1.6;
  }
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 1, maxLife: 200,
    color: '#F39C12',
    size: 11,
    type: 'combo_star',
    rotation: 0, rotationSpeed: 0.03,
    breathPhase: 0, breathSpeed: 2.5,
  });
  for (let i = 0; i < 3; i++) {
    particles.push({
      x, y, vx: 0, vy: 0,
      life: 1, maxLife: 85 + i * 18,
      color: theme.particleColors[i % theme.particleColors.length],
      size: 5 + i * 3,
      type: 'combo_ring',
      rotation: 0, rotationSpeed: 0,
    });
  }
  return particles;
}

// ── Winter: 极光绽放 (Aurora Burst) ───────────────────────────────────

function winterBaseCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles: ComboParticle[] = [];
  const count = 35;
  const auroraColors = ['#85C1E9', '#AED6F1', '#A3E4D7', '#D2B4DE', '#FFFFFF'];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    particles.push({
      x, y,
      vx: Math.cos(angle) * (1.5 + Math.random()),
      vy: Math.sin(angle) * (1.5 + Math.random()) - 0.3,
      life: 1,
      maxLife: 150 + Math.random() * 60,
      color: auroraColors[i % auroraColors.length],
      size: 3 + Math.random() * 5,
      type: 'combo_wave',
      rotation: angle,
      rotationSpeed: 0.02,
      breathPhase: i * 0.2,
      breathSpeed: 3 + Math.random(),
    });
  }
  return particles;
}

function winterUltimateCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles = winterBaseCombo(x, y, theme);
  for (const p of particles) {
    p.maxLife *= 1.5;
    p.size *= 1.4;
  }
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 1, maxLife: 220,
    color: '#FFFFFF',
    size: 12,
    type: 'combo_star',
    rotation: 0, rotationSpeed: 0.015,
    breathPhase: 0, breathSpeed: 2,
  });
  for (let i = 0; i < 4; i++) {
    particles.push({
      x, y, vx: 0, vy: 0,
      life: 1, maxLife: 80 + i * 15,
      color: ['#85C1E9', '#A3E4D7', '#D2B4DE', '#FFFFFF'][i],
      size: 5 + i * 4,
      type: 'combo_ring',
      rotation: 0, rotationSpeed: 0,
    });
  }
  return particles;
}

// ── Generator dispatch ────────────────────────────────────────────────

type ComboGenerator = (x: number, y: number, theme: ThemeConfig) => ComboParticle[];

const comboGenerators: Record<string, Record<ComboTier, ComboGenerator>> = {
  spring: { base: springBaseCombo, ultimate: springUltimateCombo },
  summer: { base: summerBaseCombo, ultimate: summerUltimateCombo },
  autumn: { base: autumnBaseCombo, ultimate: autumnUltimateCombo },
  winter: { base: winterBaseCombo, ultimate: winterUltimateCombo },
};

/**
 * Generate combo particles for the given theme and tier.
 */
export function generateComboParticles(
  themeId: string,
  tier: ComboTier,
  x: number,
  y: number
): ComboParticle[] {
  const theme = themes[themeId];
  if (!theme) return [];
  const gen = comboGenerators[themeId]?.[tier];
  if (!gen) return [];
  return gen(x, y, theme);
}
