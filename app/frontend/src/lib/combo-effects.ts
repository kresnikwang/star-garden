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

// ── Combo probability per firework ───────────────────────────────────

export function getComboTriggerChance(tier: ComboTier): number {
  return tier === 'ultimate' ? 0.25 : 0.10;
}

// ── Helper: add a glowing outer ring to any combo ──────────────────────
function addOrbitalRing(base: ComboParticle[], x: number, y: number, theme: ThemeConfig, colorIdx: number) {
  const ringCount = 6; // reduced from 8
  const ringColor = theme.particleColors[colorIdx % theme.particleColors.length];
  for (let i = 0; i < ringCount; i++) {
    const angle = (Math.PI * 2 * i) / ringCount;
    base.push({
      x, y,
      vx: Math.cos(angle) * 0.3,
      vy: Math.sin(angle) * 0.3,
      life: 1,
      maxLife: 200 + Math.random() * 80,
      color: ringColor,
      size: 2.5 + Math.random() * 2,
      type: 'combo_vortex',
      rotation: angle,
      rotationSpeed: 0.08 * (i % 2 === 0 ? 1 : -1),
      orbitAngle: angle,
      orbitRadius: 8 + Math.random() * 4,
      orbitSpeed: 0.06 + Math.random() * 0.03,
    });
  }
  return base;
}

function addCometTrail(base: ComboParticle[], x: number, y: number, theme: ThemeConfig) {
  // 8 slow-moving comet particles with trail effect (reduced from 10)
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.7;
    base.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 250 + Math.random() * 100,
      color: i % 2 === 0 ? '#FFFFFF' : theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
      size: 1.5 + Math.random() * 2,
      type: 'combo_vortex',
      rotation: angle,
      rotationSpeed: 0,
      breathPhase: Math.random() * Math.PI * 2,
      breathSpeed: 1 + Math.random(),
    });
  }
  return base;
}

// ── Spring: 樱花旋涡 (Sakura Vortex) ─────────────────────────────────

function springBaseCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles: ComboParticle[] = [];
  // Core burst: 50 particles in spiral pattern (reduced from 80)
  const coreCount = 50;
  for (let i = 0; i < coreCount; i++) {
    const angle = (Math.PI * 2 * i) / coreCount + (i % 3) * 0.1;
    const speed = 1.5 + (i % 5) * 0.3;
    const colorIdx = i % 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 160 + Math.random() * 80,
      color: theme.particleColors[colorIdx],
      size: 5 + Math.random() * 5,
      type: 'combo_vortex',
      rotation: angle,
      rotationSpeed: 0.05 * (i % 2 === 0 ? 1 : -1),
      orbitAngle: angle,
      orbitRadius: 2 + Math.random() * 3,
      orbitSpeed: 0.05 + Math.random() * 0.03,
    });
  }
  // Add orbital ring
  addOrbitalRing(particles, x, y, theme, 0);
  // Add comet trail
  addCometTrail(particles, x, y, theme);
  return particles;
}

function springUltimateCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles = springBaseCombo(x, y, theme);
  // Enhance all existing particles
  for (const p of particles) {
    p.maxLife *= 1.4;
    p.size *= 1.5;
    if (p.orbitRadius) p.orbitRadius *= 2;
    p.vx *= 1.3;
    p.vy *= 1.3;
  }
  // Extra second orbital ring
  addOrbitalRing(particles, x, y, theme, 1);
  // Extra second comet trail
  addCometTrail(particles, x, y, theme);
  // Central star (larger and brighter)
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 1, maxLife: 280,
    color: '#FFD0D8',
    size: 18,
    type: 'combo_star',
    rotation: 0, rotationSpeed: 0.015,
    breathPhase: 0, breathSpeed: 2,
  });
  // Expanding shockwave rings
  for (let i = 0; i < 4; i++) {
    particles.push({
      x, y, vx: 0, vy: 0,
      life: 1, maxLife: 100 + i * 25,
      color: ['#FFB7C5', '#FF69B4', '#FFC0CB', '#F8BBD9'][i],
      size: 8 + i * 4,
      type: 'combo_ring',
      rotation: 0, rotationSpeed: 0,
    });
  }
  // Extra 12 burst particles (fast radial) — reduced from 20
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    const speed = 3 + Math.random() * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 80 + Math.random() * 40,
      color: theme.particleColors[i % theme.particleColors.length],
      size: 2 + Math.random() * 3,
      type: 'combo_vortex',
      rotation: angle,
      rotationSpeed: 0,
    });
  }
  return particles;
}

// ── Summer: 萤光浪潮 (Bioluminescent Wave) ─────────────────────────────────

function summerBaseCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles: ComboParticle[] = [];
  // 50 bioluminescent wave particles (reduced from 80)
  const count = 50;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const wave = Math.sin(angle * 3) * 2;
    const speed = 2.2 + wave * 0.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 140 + Math.random() * 80,
      color: theme.particleColors[i % theme.particleColors.length],
      size: 3 + Math.random() * 5,
      type: 'combo_wave',
      rotation: angle,
      rotationSpeed: 0,
      breathPhase: i * 0.3,
      breathSpeed: 4 + Math.random() * 2,
    });
  }
  // Add orbital ring
  addOrbitalRing(particles, x, y, theme, 1);
  // Add comet trail
  addCometTrail(particles, x, y, theme);
  return particles;
}

function summerUltimateCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles = summerBaseCombo(x, y, theme);
  for (const p of particles) {
    p.maxLife *= 1.4;
    p.size *= 1.5;
    if (p.orbitRadius) p.orbitRadius *= 2;
    p.vx *= 1.3;
    p.vy *= 1.3;
  }
  // Extra orbital ring
  addOrbitalRing(particles, x, y, theme, 2);
  // Extra comet trail
  addCometTrail(particles, x, y, theme);
  // Central pulsating orb
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 1, maxLife: 280,
    color: '#2EE6B8',
    size: 20,
    type: 'combo_star',
    rotation: 0, rotationSpeed: 0.01,
    breathPhase: 0, breathSpeed: 2,
  });
  // Expanding rings
  for (let i = 0; i < 4; i++) {
    particles.push({
      x, y, vx: 0, vy: 0,
      life: 1, maxLife: 100 + i * 25,
      color: ['#48C9B0', '#1ABC9C', '#16A085', '#0E6251'][i],
      size: 8 + i * 4,
      type: 'combo_ring',
      rotation: 0, rotationSpeed: 0,
    });
  }
  // Extra 20 fast burst particles — reduced from 40
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 40;
    const speed = 3 + Math.random() * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 80 + Math.random() * 40,
      color: theme.particleColors[i % theme.particleColors.length],
      size: 2 + Math.random() * 3,
      type: 'combo_wave',
      rotation: angle,
      rotationSpeed: 0,
    });
  }
  return particles;
}

// ── Autumn: 枫叶旋风 (Golden Leaf Tornado) ─────────────────────────────────

function autumnBaseCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles: ComboParticle[] = [];
  const count = 50; // reduced from 80
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const r = 2 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * (1.8 + Math.random() * 0.5),
      vy: Math.sin(angle) * (1.8 + Math.random() * 0.5) + 0.5,
      life: 1,
      maxLife: 150 + Math.random() * 80,
      color: theme.particleColors[i % 4],
      size: 5 + Math.random() * 5,
      type: 'combo_vortex',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      orbitAngle: angle,
      orbitRadius: r,
      orbitSpeed: 0.05 + Math.random() * 0.03,
    });
  }
  // Add orbital ring
  addOrbitalRing(particles, x, y, theme, 0);
  // Add comet trail
  addCometTrail(particles, x, y, theme);
  return particles;
}

function autumnUltimateCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles = autumnBaseCombo(x, y, theme);
  for (const p of particles) {
    p.maxLife *= 1.4;
    p.size *= 1.5;
    if (p.orbitRadius) p.orbitRadius *= 2;
    p.vx *= 1.3;
    p.vy *= 1.3;
  }
  // Extra orbital ring
  addOrbitalRing(particles, x, y, theme, 2);
  // Extra comet trail
  addCometTrail(particles, x, y, theme);
  // Central golden star
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 1, maxLife: 280,
    color: '#FFCC00',
    size: 20,
    type: 'combo_star',
    rotation: 0, rotationSpeed: 0.025,
    breathPhase: 0, breathSpeed: 2.5,
  });
  // Expanding rings
  for (let i = 0; i < 4; i++) {
    particles.push({
      x, y, vx: 0, vy: 0,
      life: 1, maxLife: 95 + i * 20,
      color: ['#F39C12', '#E67E22', '#D35400', '#F1C40F'][i],
      size: 8 + i * 4,
      type: 'combo_ring',
      rotation: 0, rotationSpeed: 0,
    });
  }
  // Extra 20 burst particles — reduced from 40
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 40;
    const speed = 3 + Math.random() * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 80 + Math.random() * 40,
      color: theme.particleColors[i % theme.particleColors.length],
      size: 2 + Math.random() * 3,
      type: 'combo_vortex',
      rotation: angle,
      rotationSpeed: 0,
    });
  }
  return particles;
}

// ── Winter: 极光绽放 (Aurora Burst) ──────────────────────────────────────

function winterBaseCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles: ComboParticle[] = [];
  const count = 50; // reduced from 80
  const auroraColors = ['#85C1E9', '#AED6F1', '#A3E4D7', '#D2B4DE', '#FFFFFF'];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    particles.push({
      x, y,
      vx: Math.cos(angle) * (2 + Math.random() * 0.8),
      vy: Math.sin(angle) * (2 + Math.random() * 0.8) - 0.3,
      life: 1,
      maxLife: 160 + Math.random() * 80,
      color: auroraColors[i % auroraColors.length],
      size: 4 + Math.random() * 6,
      type: 'combo_wave',
      rotation: angle,
      rotationSpeed: 0.02,
      breathPhase: i * 0.2,
      breathSpeed: 3 + Math.random(),
    });
  }
  // Add orbital ring
  addOrbitalRing(particles, x, y, theme, 2);
  // Add comet trail
  addCometTrail(particles, x, y, theme);
  return particles;
}

function winterUltimateCombo(x: number, y: number, theme: ThemeConfig): ComboParticle[] {
  const particles = winterBaseCombo(x, y, theme);
  for (const p of particles) {
    p.maxLife *= 1.4;
    p.size *= 1.5;
    if (p.orbitRadius) p.orbitRadius *= 2;
    p.vx *= 1.3;
    p.vy *= 1.3;
  }
  // Extra orbital ring
  addOrbitalRing(particles, x, y, theme, 3);
  // Extra comet trail
  addCometTrail(particles, x, y, theme);
  // Central icy star
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 1, maxLife: 300,
    color: '#E0F7FA',
    size: 20,
    type: 'combo_star',
    rotation: 0, rotationSpeed: 0.015,
    breathPhase: 0, breathSpeed: 2,
  });
  // Expanding rings
  for (let i = 0; i < 4; i++) {
    particles.push({
      x, y, vx: 0, vy: 0,
      life: 1, maxLife: 90 + i * 20,
      color: ['#85C1E9', '#A3E4D7', '#D2B4DE', '#FFFFFF'][i],
      size: 8 + i * 4,
      type: 'combo_ring',
      rotation: 0, rotationSpeed: 0,
    });
  }
  // Extra 20 burst particles — reduced from 40
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 40;
    const speed = 3 + Math.random() * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 80 + Math.random() * 40,
      color: auroraColors[i % auroraColors.length],
      size: 2 + Math.random() * 3,
      type: 'combo_wave',
      rotation: angle,
      rotationSpeed: 0,
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
