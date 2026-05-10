import { useRef, useEffect, useCallback } from 'react';
import { ThemeConfig, getDailyVariation } from '@/lib/themes';
import { GrowthState, isGestureUnlocked } from '@/lib/growth-system';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'firework' | 'trail' | 'meteor' | 'ambient' | 'swipe' | 'charge' | 'nebula' | 'petal' | 'lighttrail' | 'sparkle' | 'starfield' | 'groundglow' | 'echo' | 'floater';
  rotation: number;
  rotationSpeed: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  swipeDir?: SwipeDirection;
  // Breathing effect for ambient particles
  breathPhase?: number;
  breathSpeed?: number;
  // Echo particle origin
  echoOriginX?: number;
  echoOriginY?: number;
}

export interface GestureEvent {
  type: 'tap' | 'swipe' | 'longpress' | 'circle' | 'pinch' | 'combo_triple_tap' | 'combo_circle_pinch' | 'combo_dual_press';
  x: number;
  y: number;
  data?: { chargeTime?: number; radius?: number; direction?: number; comboData?: { themeId?: string; secondX?: number; secondY?: number } };
}

interface ParticleCanvasProps {
  theme: ThemeConfig;
  growth: GrowthState;
  onGesture: (event: GestureEvent) => void;
  onChargeStart?: () => void;
  onChargeEnd?: () => void;
  onSwipeStart?: (y: number) => void;
  onSwipeMove?: (y: number) => void;
  onSwipeEnd?: () => void;
  onPinchStart?: (scale: number, cx: number, cy: number) => void;
  onPinchMove?: (scale: number) => void;
  onPinchEnd?: () => void;
}

// Global particle cap — keeps frame time predictable under rapid tapping
const MAX_PARTICLES = 300;

export function ParticleCanvas({ theme, growth, onGesture, onChargeStart, onChargeEnd, onSwipeStart, onSwipeMove, onSwipeEnd, onPinchStart, onPinchMove, onPinchEnd }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const consecutiveClicksRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const lastInteractionRef = useRef(Date.now()); // Track last interaction for breathing mode

  // Offscreen canvas for pre-rendered star field (rebuilt only on resize / level change)
  const starCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const starCanvasLevelRef = useRef<number>(-1); // level when starCanvas was last drawn
  // Cached aurora gradient (rebuilt only on resize)
  const auroraGradientRef = useRef<CanvasGradient | null>(null);
  const auroraGradientSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  /**
   * Glow-sprite cache — replaces ctx.shadowBlur on every particle draw.
   *
   * A "glow sprite" is a tiny offscreen canvas containing a radial gradient
   * that looks identical to a filled circle with shadowBlur, but compositing
   * a pre-baked image is ~5-10× cheaper than triggering the GPU blur pass.
   *
   * Cache key: `${color}|${glowRadius}` where glowRadius = particleSize * blurMult.
   * The sprite is drawn at 2× the glow radius so the soft halo fits entirely
   * inside the canvas bounds.
   */
  const glowCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

  /** Return (creating if necessary) a cached glow-sprite for the given color and radius. */
  const getGlowSprite = useCallback((color: string, glowRadius: number): HTMLCanvasElement => {
    // Round radius to nearest 0.5 px to limit cache size without visible stepping
    const r = Math.round(glowRadius * 2) / 2;
    const key = `${color}|${r}`;
    const cache = glowCacheRef.current;
    if (cache.has(key)) return cache.get(key)!;

    const diameter = Math.ceil(r * 2) + 2; // +2 px padding so edge doesn't clip
    const sc = document.createElement('canvas');
    sc.width = diameter;
    sc.height = diameter;
    const sctx = sc.getContext('2d')!;
    const cx = diameter / 2;
    const grad = sctx.createRadialGradient(cx, cx, 0, cx, cx, r);
    grad.addColorStop(0,   color);               // opaque core
    grad.addColorStop(0.4, color);               // hold color a bit
    grad.addColorStop(1,   'rgba(0,0,0,0)');     // transparent edge
    sctx.fillStyle = grad;
    sctx.beginPath();
    sctx.arc(cx, cx, r, 0, Math.PI * 2);
    sctx.fill();

    // Cap cache size to avoid unbounded memory growth
    if (cache.size >= 256) cache.clear();
    cache.set(key, sc);
    return sc;
  }, []);

  // Gesture tracking refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchPathRef = useRef<{ x: number; y: number }[]>([]);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressingRef = useRef(false);
  const chargeStartRef = useRef(0);
  const lastTouchPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);

  // Pinch gesture state
  const pinchStartDistRef = useRef(0);
  const pinchActiveRef = useRef(false);
  const lastPinchCenterRef = useRef<{ x: number; y: number } | null>(null);

  // Combo tracking
  const lastCircleRef = useRef<{ cx: number; cy: number; radius: number; time: number } | null>(null);
  const tripleTapTrackerRef = useRef<{ x: number; y: number; time: number; count: number }>({ x: 0, y: 0, time: 0, count: 0 });
  const dualPressStateRef = useRef<{ finger1: { id: number; x: number; y: number }; finger2: { id: number; x: number; y: number }; startTime: number } | null>(null);

  // Track which touch triggered long press (for multi-touch handling)
  const longPressTouchIdRef = useRef<number | null>(null);
  const longPressStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const secondLongPressRef = useRef<{ id: number; x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);

  // Store callbacks in refs to avoid stale closures in native event listeners
  const onGestureRef = useRef(onGesture);
  const onChargeStartRef = useRef(onChargeStart);
  const onChargeEndRef = useRef(onChargeEnd);
  const onSwipeStartRef = useRef(onSwipeStart);
  const onSwipeMoveRef = useRef(onSwipeMove);
  const onSwipeEndRef = useRef(onSwipeEnd);
  const onPinchStartRef = useRef(onPinchStart);
  const onPinchMoveRef = useRef(onPinchMove);
  const onPinchEndRef = useRef(onPinchEnd);
  const growthRef = useRef(growth);
  const themeRef = useRef(theme);

  useEffect(() => {
    onGestureRef.current = onGesture;
  }, [onGesture]);
  useEffect(() => {
    onChargeStartRef.current = onChargeStart;
  }, [onChargeStart]);
  useEffect(() => {
    onChargeEndRef.current = onChargeEnd;
  }, [onChargeEnd]);
  useEffect(() => {
    onSwipeStartRef.current = onSwipeStart;
  }, [onSwipeStart]);
  useEffect(() => {
    onSwipeMoveRef.current = onSwipeMove;
  }, [onSwipeMove]);
  useEffect(() => {
    onSwipeEndRef.current = onSwipeEnd;
  }, [onSwipeEnd]);
  useEffect(() => {
    onPinchStartRef.current = onPinchStart;
  }, [onPinchStart]);
  useEffect(() => {
    onPinchMoveRef.current = onPinchMove;
  }, [onPinchMove]);
  useEffect(() => {
    onPinchEndRef.current = onPinchEnd;
  }, [onPinchEnd]);
  useEffect(() => {
    growthRef.current = growth;
  }, [growth]);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const dailyVariation = getDailyVariation(theme.id);

  /**
   * Add new particles while respecting MAX_PARTICLES.
   * User-triggered particles (firework, charge, etc.) are kept;
   * excess is shed by dropping the oldest ambient/trail/floater particles.
   */
  const addParticles = useCallback((newParticles: Particle[]) => {
    if (newParticles.length === 0) return;
    const combined = [...particlesRef.current, ...newParticles];
    if (combined.length <= MAX_PARTICLES) {
      particlesRef.current = combined;
      return;
    }
    let excess = combined.length - MAX_PARTICLES;
    const trimmed: Particle[] = [];
    for (const p of combined) {
      if (excess > 0 && (p.type === 'ambient' || p.type === 'trail' || p.type === 'floater')) {
        excess--;
      } else {
        trimmed.push(p);
      }
    }
    // If still over cap (all slots taken by high-priority particles) just slice
    particlesRef.current = trimmed.length > MAX_PARTICLES ? trimmed.slice(trimmed.length - MAX_PARTICLES) : trimmed;
  }, []);

  // Load background image with retry
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const loadImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        bgImageRef.current = img;
      };
      img.onerror = () => {
        retryCount++;
        if (retryCount < maxRetries) {
          // Retry without crossOrigin on second attempt
          setTimeout(() => {
            const retryImg = new Image();
            if (retryCount > 1) {
              // Try without crossOrigin header
              retryImg.onload = () => {
                bgImageRef.current = retryImg;
              };
              retryImg.src = theme.bgImage;
            } else {
              retryImg.crossOrigin = 'anonymous';
              retryImg.onload = () => {
                bgImageRef.current = retryImg;
              };
              retryImg.src = theme.bgImage + '?retry=' + retryCount;
            }
          }, 1000 * retryCount);
        }
      };
      img.src = theme.bgImage;
    };

    loadImage();
  }, [theme.bgImage]);

  const createFireworkParticles = useCallback(
    (x: number, y: number, intensity: number = 1) => {
      const colors = themeRef.current.particleColors;
      const count = Math.floor((20 + Math.random() * 15) * intensity);
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = (2 + Math.random() * 4) * intensity;
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: (3 + Math.random() * 5) * intensity,
          type: intensity > 1.5 ? 'charge' : 'firework',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
        });
      }

      // Trailing sparkles
      for (let i = 0; i < Math.floor(8 * intensity); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 80 + Math.random() * 40,
          color: '#FFFFFF',
          size: 1.5 + Math.random() * 2,
          type: 'trail',
          rotation: 0,
          rotationSpeed: 0,
        });
      }

      addParticles(newParticles);
    },
    [addParticles]
  );

  // Determine swipe direction from angle
  const getSwipeDirection = useCallback((dx: number, dy: number): SwipeDirection => {
    const angle = Math.atan2(dy, dx);
    // Up: -135 to -45 degrees (negative Y)
    if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) return 'up';
    // Down: 45 to 135 degrees (positive Y)
    if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) return 'down';
    // Left: 135 to -135 degrees
    if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) return 'left';
    // Right: -45 to 45 degrees
    return 'right';
  }, []);

  // Up swipe: firework sparks shooting upward
  const createUpSwipeEffect = useCallback(
    (x: number, y: number) => {
      const colors = themeRef.current.particleColors;
      const count = 20 + growthRef.current.level * 2;
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 2;
        const speed = 3 + Math.random() * 5;
        newParticles.push({
          x: x + (Math.random() - 0.5) * 20,
          y,
          vx: spread,
          vy: -speed, // Upward
          life: 1,
          maxLife: 60 + Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 4,
          type: 'firework',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          swipeDir: 'up',
        });
      }

      // Sparkle trail behind
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + Math.random() * 20,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1 - Math.random() * 2,
          life: 1,
          maxLife: 80 + Math.random() * 40,
          color: '#FFFFFF',
          size: 1 + Math.random() * 2,
          type: 'trail',
          rotation: 0,
          rotationSpeed: 0,
        });
      }

      addParticles(newParticles);
    },
    [addParticles]
  );

  // Down swipe: petal rain / falling particles
  const createDownSwipeEffect = useCallback(
    (x: number, y: number) => {
      const colors = themeRef.current.particleColors;
      const count = 25 + growthRef.current.level * 2;
      const newParticles: Particle[] = [];
      const canvasW = canvasRef.current?.width || 400;

      for (let i = 0; i < count; i++) {
        const startX = x + (Math.random() - 0.5) * canvasW * 0.6;
        newParticles.push({
          x: startX,
          y: y - 50 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 1.5, // Gentle horizontal drift
          vy: 1.5 + Math.random() * 2.5, // Falling down
          life: 1,
          maxLife: 100 + Math.random() * 80,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 5,
          type: 'petal',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08, // Slow spinning like petals
          swipeDir: 'down',
        });
      }

      addParticles(newParticles);
    },
    [addParticles]
  );

  // Left/Right swipe: light trail / comet streak
  const createHorizontalSwipeEffect = useCallback(
    (startX: number, startY: number, endX: number, endY: number, direction: SwipeDirection) => {
      const colors = themeRef.current.particleColors;
      const count = 30 + growthRef.current.level * 2;
      const newParticles: Particle[] = [];
      const dirMultiplier = direction === 'right' ? 1 : -1;

      // Main comet/light trail
      for (let i = 0; i < count; i++) {
        const progress = i / count;
        const px = startX + (endX - startX) * progress;
        const py = startY + (endY - startY) * progress + (Math.random() - 0.5) * 10;
        newParticles.push({
          x: px,
          y: py,
          vx: dirMultiplier * (2 + Math.random() * 3) * (1 - progress * 0.5),
          vy: (Math.random() - 0.5) * 0.8,
          life: 1,
          maxLife: 50 + Math.random() * 40 + progress * 30,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: (4 - progress * 2) + Math.random() * 2,
          type: 'lighttrail',
          rotation: direction === 'right' ? 0 : Math.PI,
          rotationSpeed: 0,
          swipeDir: direction,
        });
      }

      // Trailing sparkles that fade behind
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          x: startX + (Math.random() - 0.5) * 20,
          y: startY + (Math.random() - 0.5) * 20,
          vx: dirMultiplier * (0.5 + Math.random()),
          vy: (Math.random() - 0.5) * 1.5,
          life: 1,
          maxLife: 60 + Math.random() * 30,
          color: '#FFFFFF',
          size: 1 + Math.random() * 2,
          type: 'trail',
          rotation: 0,
          rotationSpeed: 0,
        });
      }

      addParticles(newParticles);
    },
    [addParticles]
  );

  const createSwipeTrail = useCallback(
    (x: number, y: number, vx: number, vy: number, dir: SwipeDirection) => {
      const colors = themeRef.current.particleColors;
      const trailLength = growthRef.current.level >= 6 ? 6 : 3;
      const newParticles: Particle[] = [];

      for (let i = 0; i < trailLength; i++) {
        if (dir === 'up') {
          // Upward sparks during swipe
          newParticles.push({
            x: x + (Math.random() - 0.5) * 12,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1,
            vy: -1 - Math.random() * 2,
            life: 1,
            maxLife: 30 + Math.random() * 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 2 + Math.random() * 3,
            type: 'swipe',
            rotation: -Math.PI / 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            swipeDir: 'up',
          });
        } else if (dir === 'down') {
          // Petal-like particles during swipe
          newParticles.push({
            x: x + (Math.random() - 0.5) * 15,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 1 + Math.random() * 1.5,
            life: 1,
            maxLife: 40 + Math.random() * 30,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 3 + Math.random() * 4,
            type: 'petal',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.06,
            swipeDir: 'down',
          });
        } else {
          // Horizontal swipe particles (same round shape as vertical)
          const dirMult = dir === 'right' ? 1 : -1;
          newParticles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 10,
            vx: dirMult * (1.5 + Math.random() * 2),
            vy: (Math.random() - 0.5) * 0.5,
            life: 1,
            maxLife: 35 + Math.random() * 25,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 2 + Math.random() * 3,
            type: 'swipe',
            rotation: dir === 'right' ? 0 : Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            swipeDir: dir,
          });
        }
      }

      addParticles(newParticles);
    },
    [addParticles]
  );

  const createRisingFirework = useCallback(
    (x: number, y: number, chargeTime: number) => {
      const colors = themeRef.current.particleColors;
      const intensity = Math.min(chargeTime / 1000, 3);
      const startY = canvasRef.current?.height || 800;
      const newParticles: Particle[] = [];

      // Rising trail particles
      const riseSteps = 15;
      for (let i = 0; i < riseSteps; i++) {
        const progress = i / riseSteps;
        newParticles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: startY - (startY - y) * progress,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(startY - y) / 40,
          life: 1,
          maxLife: 20 + i * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 2,
          type: 'trail',
          rotation: 0,
          rotationSpeed: 0,
        });
      }

      addParticles(newParticles);

      // Delayed explosion at target
      setTimeout(() => {
        createFireworkParticles(x, y, 1 + intensity);
      }, 400);
    },
    [createFireworkParticles, addParticles]
  );

  const createNebula = useCallback(
    (x: number, y: number, radius: number) => {
      const colors = themeRef.current.particleColors;
      const count = 40 + Math.floor(radius / 5);
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const r = radius * 0.3 + Math.random() * radius * 0.7;
        const orbitSpeed = 0.02 + Math.random() * 0.03;

        newParticles.push({
          x: x + Math.cos(angle) * r,
          y: y + Math.sin(angle) * r,
          vx: 0,
          vy: 0,
          life: 1,
          maxLife: 150 + Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 4,
          type: 'nebula',
          rotation: angle,
          rotationSpeed: orbitSpeed * (Math.random() > 0.5 ? 1 : -1),
          orbitAngle: angle,
          orbitRadius: r,
          orbitSpeed,
        });
      }

      addParticles(newParticles);
    },
    [addParticles]
  );

  const createMeteorShower = useCallback(
    (canvasWidth: number) => {
      const colors = themeRef.current.particleColors;
      const meteorCount = 15 + Math.floor(Math.random() * 10);
      const newParticles: Particle[] = [];

      for (let i = 0; i < meteorCount; i++) {
        const startX = Math.random() * canvasWidth;
        const delay = i * 5;
        newParticles.push({
          x: startX,
          y: -20 - delay * 3,
          vx: 2 + Math.random() * 2,
          vy: 4 + Math.random() * 3,
          life: 1,
          maxLife: 100 + Math.random() * 60,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
          type: 'meteor',
          rotation: Math.atan2(4, 2),
          rotationSpeed: 0,
        });
      }

      addParticles(newParticles);
    },
    [addParticles]
  );

  // Create pinch visual effect (particles converge or diverge)
  const createPinchEffect = useCallback(
    (cx: number, cy: number, scale: number) => {
      const colors = themeRef.current.particleColors;
      const count = 8;
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = scale < 1 ? -3 : 3; // Converge or diverge
        newParticles.push({
          x: cx + Math.cos(angle) * 50 * scale,
          y: cy + Math.sin(angle) * 50 * scale,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 40,
          color: colors[i % colors.length],
          size: 3 + Math.random() * 2,
          type: 'sparkle',
          rotation: angle,
          rotationSpeed: 0.05,
        });
      }

      addParticles(newParticles);
    },
    [addParticles]
  );

  // Combo 1: Circle + Pinch → compress nebula into energy ball
  const createEnergyBall = useCallback((cx: number, cy: number, radius: number) => {
    const colors = themeRef.current.particleColors;
    const newParticles: Particle[] = [];

    // Compress existing nebula particles toward center
    for (const p of particlesRef.current) {
      if (p.type === 'nebula') {
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius * 2) {
          p.vx += dx * 0.05;
          p.vy += dy * 0.05;
          p.orbitRadius = (p.orbitRadius || 0) * 0.9;
        }
      }
    }

    // Bright energy core
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      newParticles.push({
        x: cx + Math.cos(angle) * 10,
        y: cy + Math.sin(angle) * 10,
        vx: Math.cos(angle) * (1 + Math.random()),
        vy: Math.sin(angle) * (1 + Math.random()),
        life: 1,
        maxLife: 60 + Math.random() * 40,
        color: '#FFFFFF',
        size: 3 + Math.random() * 3,
        type: 'charge',
        rotation: 0,
        rotationSpeed: 0,
      });
    }

    // Outer energy ring
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      newParticles.push({
        x: cx + Math.cos(angle) * (radius * 0.3),
        y: cy + Math.sin(angle) * (radius * 0.3),
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5,
        life: 1,
        maxLife: 80 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 2,
        type: 'sparkle',
        rotation: angle,
        rotationSpeed: 0.1,
      });
    }

    addParticles(newParticles);
  }, [addParticles]);

  // Combo 2: Dual long press → particle bridge between fingers
  const createParticleBridge = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const colors = themeRef.current.particleColors;
    const newParticles: Particle[] = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(dist / 8);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      for (let j = 0; j < 2; j++) {
        newParticles.push({
          x: px + (Math.random() - 0.5) * 6,
          y: py + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          life: 1,
          maxLife: 120 + Math.random() * 60,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 2,
          type: 'ambient',
          rotation: 0,
          rotationSpeed: 0,
          breathPhase: Math.random() * Math.PI * 2,
          breathSpeed: 2 + Math.random() * 2,
        });
      }
    }

    // Bridge endpoints glow
    for (const pt of [{ x: x1, y: y1 }, { x: x2, y: y2 }]) {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        newParticles.push({
          x: pt.x + Math.cos(angle) * 8,
          y: pt.y + Math.sin(angle) * 8,
          vx: Math.cos(angle) * 0.5,
          vy: Math.sin(angle) * 0.5,
          life: 1,
          maxLife: 50 + Math.random() * 30,
          color: '#FFFFFF',
          size: 2 + Math.random() * 2,
          type: 'sparkle',
          rotation: 0,
          rotationSpeed: 0,
        });
      }
    }

    addParticles(newParticles);
  }, [addParticles]);

  // Combo 3: Triple tap → theme-specific burst
  const createThemeBurst = useCallback((x: number, y: number) => {
    const themeId = themeRef.current.id;
    const colors = themeRef.current.particleColors;
    const newParticles: Particle[] = [];

    if (themeId === 'spring') {
      // Cherry blossom rain
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        newParticles.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 1,
          life: 1,
          maxLife: 100 + Math.random() * 60,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
          type: 'petal',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.06,
        });
      }
    } else if (themeId === 'summer') {
      // Firefly burst
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 80 + Math.random() * 60,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 2.5,
          type: 'ambient',
          rotation: 0,
          rotationSpeed: 0,
          breathPhase: Math.random() * Math.PI * 2,
          breathSpeed: 3 + Math.random() * 3,
        });
      }
    } else if (themeId === 'autumn') {
      // Maple leaf whirlwind
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 3 + Math.random() * 3;
        newParticles.push({
          x: x + Math.cos(angle) * 20,
          y: y + Math.sin(angle) * 20,
          vx: Math.cos(angle + Math.PI / 2) * speed,
          vy: Math.sin(angle + Math.PI / 2) * speed,
          life: 1,
          maxLife: 90 + Math.random() * 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 4,
          type: 'petal',
          rotation: angle,
          rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * 0.08,
        });
      }
    } else {
      // Winter: ice crystal burst
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;
        const speed = 1.5 + Math.random() * 3;
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 70 + Math.random() * 40,
          color: i % 3 === 0 ? '#FFFFFF' : colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 2,
          type: 'sparkle',
          rotation: angle,
          rotationSpeed: 0.05,
        });
      }
    }

    addParticles(newParticles);
  }, [addParticles]);

  // Handle tap
  const handleTap = useCallback(
    (x: number, y: number) => {
      lastInteractionRef.current = Date.now();
      const now = Date.now();
      if (now - lastClickTimeRef.current < 1000) {
        consecutiveClicksRef.current++;
      } else {
        consecutiveClicksRef.current = 1;
      }
      lastClickTimeRef.current = now;

      // Combo: triple tap detection
      const tracker = tripleTapTrackerRef.current;
      const dist = Math.sqrt((x - tracker.x) ** 2 + (y - tracker.y) ** 2);
      if (dist < 50 && now - tracker.time < 600) {
        tracker.count++;
      } else {
        tracker.x = x;
        tracker.y = y;
        tracker.count = 1;
      }
      tracker.time = now;

      if (tracker.count >= 3 && isGestureUnlocked(growthRef.current, 'combo_triple_tap')) {
        tracker.count = 0;
        createThemeBurst(x, y);
        onGestureRef.current({ type: 'combo_triple_tap', x, y, data: { comboData: { themeId: themeRef.current.id } } });
        return;
      }

      createFireworkParticles(x, y);

      if (consecutiveClicksRef.current >= 5) {
        const canvas = canvasRef.current;
        if (canvas) createMeteorShower(canvas.width);
        consecutiveClicksRef.current = 0;
      }

      // Level 10+: echo particles after interaction
      if (growthRef.current.level >= 10) {
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 10 + Math.random() * 20;
          particlesRef.current.push({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 0.3,
            vy: Math.sin(angle) * 0.3,
            life: 1,
            maxLife: 80 + Math.random() * 60,
            color: themeRef.current.particleColors[Math.floor(Math.random() * themeRef.current.particleColors.length)],
            size: 1 + Math.random() * 1.5,
            type: 'echo',
            rotation: 0,
            rotationSpeed: 0,
            echoOriginX: x,
            echoOriginY: y,
          });
        }
      }

      onGestureRef.current({ type: 'tap', x, y });
    },
    [createFireworkParticles, createMeteorShower]
  );

  // Detect circle gesture from path
  const detectCircle = useCallback((path: { x: number; y: number }[]): { isCircle: boolean; cx: number; cy: number; radius: number } => {
    if (path.length < 15) return { isCircle: false, cx: 0, cy: 0, radius: 0 };

    const cx = path.reduce((s, p) => s + p.x, 0) / path.length;
    const cy = path.reduce((s, p) => s + p.y, 0) / path.length;
    const distances = path.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));
    const avgR = distances.reduce((s, d) => s + d, 0) / distances.length;
    const variance = distances.reduce((s, d) => s + (d - avgR) ** 2, 0) / distances.length;
    const stdDev = Math.sqrt(variance);

    // Check if path forms a circle (low variance relative to radius)
    const isCircle = avgR > 30 && stdDev / avgR < 0.35;
    return { isCircle, cx, cy, radius: avgR };
  }, []);

  // Register native touch event listeners (non-passive) to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (touch: Touch) => {
      const rect = canvas.getBoundingClientRect();
      // Use CSS pixel coordinates (not physical pixels) since we ctx.scale(dpr) in render
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      lastInteractionRef.current = Date.now();

      // If a second finger is placed while a long-press timer is running,
      // cancel the timer — user intent is pinch, not long press.
      if (e.touches.length >= 2 && longPressTouchIdRef.current !== null && !isLongPressingRef.current) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        longPressTouchIdRef.current = null;
        longPressStartPosRef.current = null;
        return;
      }

      // If already tracking a long-press candidate (timer running or active), don't interfere
      if (longPressTouchIdRef.current !== null) return;

      const touch = e.touches[0];
      const { x, y } = getPos(touch);

      touchStartRef.current = { x, y, time: Date.now() };
      touchPathRef.current = [{ x, y }];
      lastTouchPosRef.current = { x, y };
      isLongPressingRef.current = false;
      hasMoved.current = false;

      // Start long press timer if unlocked
      if (isGestureUnlocked(growthRef.current, 'longpress')) {
        chargeStartRef.current = Date.now();
        longPressTouchIdRef.current = touch.identifier;
        longPressStartPosRef.current = { x, y };
        longPressTimerRef.current = setTimeout(() => {
          // Defensive: if timer was cancelled (set to null) while this callback
          // was pending in the event loop, don't start the charge sound.
          if (longPressTimerRef.current === null) return;
          isLongPressingRef.current = true;
          onChargeStartRef.current?.();
        }, 500);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      lastInteractionRef.current = Date.now();

      // Pinch gesture detection (two fingers, neither is long-pressing)
      if (e.touches.length === 2 && !isLongPressingRef.current) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
        const cx = (t1.clientX + t2.clientX) / 2;
        const cy = (t1.clientY + t2.clientY) / 2;

        if (!pinchActiveRef.current) {
          // Check for Circle + Pinch combo
          const circle = lastCircleRef.current;
          const now = Date.now();
          if (circle && now - circle.time < 2000 && isGestureUnlocked(growthRef.current, 'combo_circle_pinch')) {
            const comboDist = Math.sqrt((cx - circle.cx) ** 2 + (cy - circle.cy) ** 2);
            if (comboDist < circle.radius * 1.5) {
              // Combo triggered! Compress nebula into energy ball
              createEnergyBall(circle.cx, circle.cy, circle.radius);
              onGestureRef.current({ type: 'combo_circle_pinch', x: circle.cx, y: circle.cy, data: { radius: circle.radius } });
              lastCircleRef.current = null;
              // Don't start normal pinch, just return
              return;
            }
          }

          pinchStartDistRef.current = dist;
          pinchActiveRef.current = true;
          lastPinchCenterRef.current = { x: cx, y: cy };
          const scale = dist / pinchStartDistRef.current;
          onPinchStartRef.current?.(scale, cx, cy);
        } else {
          const scale = dist / pinchStartDistRef.current;
          lastPinchCenterRef.current = { x: cx, y: cy };
          onPinchMoveRef.current?.(scale);
          // Create pinch visual effect
          createPinchEffect(cx, cy, scale);
          // NOTE: Don't fire pinch gesture event here — it would trigger
          // on every touchmove. We fire it once in onTouchEnd instead.
        }
        return;
      }

      // One finger long-pressing + another finger on screen
      if (e.touches.length === 2 && isLongPressingRef.current) {
        const sliding = Array.from(e.touches).find(t => t.identifier !== longPressTouchIdRef.current);
        if (!sliding) return;

        const { x, y } = getPos(sliding);

        // Check for dual long press combo
        if (isGestureUnlocked(growthRef.current, 'combo_dual_press')) {
          if (!secondLongPressRef.current) {
            // Start tracking second finger for dual press
            const timer = setTimeout(() => {
              if (secondLongPressRef.current && dualPressStateRef.current) {
                // Both fingers held long enough — trigger combo!
                const f1 = dualPressStateRef.current.finger1;
                const f2 = dualPressStateRef.current.finger2;
                createParticleBridge(f1.x, f1.y, f2.x, f2.y);
                onGestureRef.current({
                  type: 'combo_dual_press',
                  x: (f1.x + f2.x) / 2,
                  y: (f1.y + f2.y) / 2,
                  data: { comboData: { secondX: f2.x, secondY: f2.y } }
                });
                dualPressStateRef.current = null;
              }
              secondLongPressRef.current = null;
            }, 500);
            secondLongPressRef.current = { id: sliding.identifier, x, y, timer };
            dualPressStateRef.current = {
              finger1: { id: longPressTouchIdRef.current!, x: longPressStartPosRef.current!.x, y: longPressStartPosRef.current!.y },
              finger2: { id: sliding.identifier, x, y },
              startTime: Date.now(),
            };
          }
        }

        const prev = lastTouchPosRef.current;
        lastTouchPosRef.current = { x, y };

        if (!hasMoved.current && prev) {
          const dist = Math.sqrt((x - prev.x) ** 2 + (y - prev.y) ** 2);
          if (dist > 5) {
            hasMoved.current = true;
            // Cancel dual press tracking if second finger moved
            if (secondLongPressRef.current) {
              clearTimeout(secondLongPressRef.current.timer);
              secondLongPressRef.current = null;
              dualPressStateRef.current = null;
            }
            onSwipeStartRef.current?.(y);
          }
        }

        if (hasMoved.current) {
          onSwipeMoveRef.current?.(y);
        }

        if (prev) {
          const vx = x - prev.x;
          const vy = y - prev.y;
          if (Math.sqrt(vx * vx + vy * vy) > 2) {
            const start = touchStartRef.current;
            const dx = start ? x - start.x : vx;
            const dy = start ? y - start.y : vy;
            createSwipeTrail(x, y, vx, vy, getSwipeDirection(dx, dy));
          }
        }
        return;
      }

      const touch = e.touches[0];
      const { x, y } = getPos(touch);

      const prev = lastTouchPosRef.current;
      touchPathRef.current.push({ x, y });
      lastTouchPosRef.current = { x, y };

      // Cancel long press if moved too much
      const start = touchStartRef.current;
      if (start && Math.sqrt((x - start.x) ** 2 + (y - start.y) ** 2) > 20) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        if (isLongPressingRef.current) {
          onChargeEndRef.current?.();
        }
        isLongPressingRef.current = false;
        hasMoved.current = true;

        // Start continuous swipe sound on first significant movement
        if (!pinchActiveRef.current) {
          onSwipeStartRef.current?.(y);
        }
      }

      // Update swipe sound pitch based on Y position
      if (hasMoved.current && !pinchActiveRef.current) {
        onSwipeMoveRef.current?.(y);
      }

      // Create direction-aware swipe trail for visual feedback
      if (prev) {
        const vx = x - prev.x;
        const vy = y - prev.y;
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > 2) {
          const start = touchStartRef.current;
          const dx = start ? x - start.x : vx;
          const dy = start ? y - start.y : vy;
          const dir = getSwipeDirection(dx, dy);
          createSwipeTrail(x, y, vx, vy, dir);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();

      // Clear any pending long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // If a long-press finger was tracked, check if it left
      if (longPressTouchIdRef.current !== null) {
        const longPressFingerLeft = Array.from(e.changedTouches).some(
          t => t.identifier === longPressTouchIdRef.current
        );

        if (longPressFingerLeft) {
          // The tracked finger left the screen
          const wasLongPressing = isLongPressingRef.current;
          const start = longPressStartPosRef.current;

          if (wasLongPressing && start) {
            // Actual long press release -> firework
            const chargeTime = Date.now() - chargeStartRef.current;
            createRisingFirework(start.x, start.y, chargeTime);
            onGestureRef.current({ type: 'longpress', x: start.x, y: start.y, data: { chargeTime } });
            onChargeEndRef.current?.();

            // Level 10+: echo particles from long press release
            if (growthRef.current.level >= 10) {
              for (let i = 0; i < 4; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 15 + Math.random() * 25;
                particlesRef.current.push({
                  x: start.x + Math.cos(angle) * dist,
                  y: start.y + Math.sin(angle) * dist,
                  vx: Math.cos(angle) * 0.2,
                  vy: Math.sin(angle) * 0.2,
                  life: 1,
                  maxLife: 100 + Math.random() * 80,
                  color: themeRef.current.particleColors[Math.floor(Math.random() * themeRef.current.particleColors.length)],
                  size: 1.5 + Math.random() * 2,
                  type: 'echo',
                  rotation: 0,
                  rotationSpeed: 0,
                  echoOriginX: start.x,
                  echoOriginY: start.y,
                });
              }
            }
          }

          // Clear long-press tracking
          longPressTouchIdRef.current = null;
          longPressStartPosRef.current = null;
          isLongPressingRef.current = false;

          // Stop swipe sound if active
          if (hasMoved.current) {
            onSwipeEndRef.current?.();
          }

          if (e.touches.length === 1) {
            // Another finger remains — set it up for single-finger gestures
            const remaining = e.touches[0];
            const pos = getPos(remaining);
            touchStartRef.current = { x: pos.x, y: pos.y, time: Date.now() };
            touchPathRef.current = [pos];
            lastTouchPosRef.current = pos;
            hasMoved.current = false;
          }

          if (wasLongPressing) {
            // Long press was fully handled — done
            touchStartRef.current = null;
            touchPathRef.current = [];
            return;
          }
          // Not a long press — fall through to tap/swipe detection below
          // Keep touchStartRef/touchPathRef for detection
        } else {
          // A non-long-pressing finger left while long-pressing is active
          if (hasMoved.current) {
            onSwipeEndRef.current?.();
          }
          if (e.touches.length === 1) {
            // Only long-pressing finger remains — restore its state
            const remaining = e.touches[0];
            const pos = getPos(remaining);
            touchStartRef.current = { x: pos.x, y: pos.y, time: Date.now() };
            touchPathRef.current = [pos];
            lastTouchPosRef.current = pos;
            hasMoved.current = false;
          }
          return;
        }
      }

      // End pinch gesture
      if (pinchActiveRef.current) {
        pinchActiveRef.current = false;
        pinchStartDistRef.current = 0;
        onPinchEndRef.current?.();

        // Fire pinch gesture event once (was removed from onTouchMove)
        const center = lastPinchCenterRef.current;
        if (center) {
          onGestureRef.current({ type: 'pinch', x: center.x, y: center.y });
          lastPinchCenterRef.current = null;
        }

        if (e.touches.length === 0) {
          touchStartRef.current = null;
          touchPathRef.current = [];
          isLongPressingRef.current = false;
        } else if (e.touches.length === 1) {
          const remaining = e.touches[0];
          const pos = getPos(remaining);
          touchStartRef.current = { x: pos.x, y: pos.y, time: Date.now() };
          touchPathRef.current = [pos];
          lastTouchPosRef.current = pos;
          hasMoved.current = false;
        }
        return;
      }

      // Stop continuous swipe sound
      if (hasMoved.current) {
        onSwipeEndRef.current?.();
      }

      const start = touchStartRef.current;
      const path = touchPathRef.current;
      if (!start) return;

      const endTouch = e.changedTouches[0];
      const { x: endX, y: endY } = getPos(endTouch);

      const elapsed = Date.now() - start.time;
      const distance = Math.sqrt((endX - start.x) ** 2 + (endY - start.y) ** 2);

      // Circle detection
      if (isGestureUnlocked(growthRef.current, 'circle') && path.length > 15) {
        const { isCircle, cx, cy, radius } = detectCircle(path);
        if (isCircle) {
          createNebula(cx, cy, radius);
          onGestureRef.current({ type: 'circle', x: cx, y: cy, data: { radius } });

          // Record circle for combo detection
          lastCircleRef.current = { cx, cy, radius, time: Date.now() };

          // Level 10+: echo particles from circle gesture
          if (growthRef.current.level >= 10) {
            for (let i = 0; i < 4; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = 20 + Math.random() * 30;
              particlesRef.current.push({
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                vx: Math.cos(angle) * 0.25,
                vy: Math.sin(angle) * 0.25,
                life: 1,
                maxLife: 100 + Math.random() * 80,
                color: themeRef.current.particleColors[Math.floor(Math.random() * themeRef.current.particleColors.length)],
                size: 1.5 + Math.random() * 2,
                type: 'echo',
                rotation: 0,
                rotationSpeed: 0,
                echoOriginX: cx,
                echoOriginY: cy,
              });
            }
          }

          touchStartRef.current = null;
          touchPathRef.current = [];
          return;
        }
      }

      // Swipe detection (fast movement over distance)
      if (isGestureUnlocked(growthRef.current, 'swipe') && distance > 50 && elapsed < 600) {
        const dx = endX - start.x;
        const dy = endY - start.y;
        const dir = getSwipeDirection(dx, dy);
        onGestureRef.current({ type: 'swipe', x: endX, y: endY, data: { direction: Math.atan2(dy, dx) } });

        if (dir === 'up') {
          createUpSwipeEffect(endX, endY);
        } else if (dir === 'down') {
          createDownSwipeEffect(endX, endY);
        } else {
          createHorizontalSwipeEffect(start.x, start.y, endX, endY, dir);
        }

        // Level 5+: ground glow residue along swipe path
        if (growthRef.current.level >= 5 && path.length > 5) {
          const glowCount = Math.min(5, Math.floor(path.length / 10));
          for (let i = 0; i < glowCount; i++) {
            const pt = path[Math.floor((path.length * (i + 1)) / (glowCount + 1))];
            particlesRef.current.push({
              x: pt.x + (Math.random() - 0.5) * 10,
              y: pt.y + (Math.random() - 0.5) * 10,
              vx: 0,
              vy: 0,
              life: 1,
              maxLife: 150 + Math.random() * 100,
              color: themeRef.current.particleColors[Math.floor(Math.random() * themeRef.current.particleColors.length)],
              size: 2 + Math.random() * 2,
              type: 'groundglow',
              rotation: 0,
              rotationSpeed: 0,
            });
          }
        }

        touchStartRef.current = null;
        touchPathRef.current = [];
        return;
      }

      // Default: tap (more lenient on mobile - allow up to 30px movement and 500ms)
      if (distance < 30 && elapsed < 500) {
        handleTap(endX, endY);
      } else if (!hasMoved.current && elapsed < 500) {
        handleTap(endX, endY);
      }

      touchStartRef.current = null;
      touchPathRef.current = [];
      isLongPressingRef.current = false;
    };

    // Use { passive: false } to allow preventDefault on mobile Chrome
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [createFireworkParticles, createRisingFirework, createNebula, createSwipeTrail, createUpSwipeEffect, createDownSwipeEffect, createHorizontalSwipeEffect, getSwipeDirection, detectCircle, handleTap, createMeteorShower, createPinchEffect]);

  // Mouse fallback for desktop
  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleTap(x, y);
  }, [handleTap]);

  // Draw particle based on daily shape
  const drawParticle = useCallback(
    (ctx: CanvasRenderingContext2D, p: Particle) => {
      const alpha = p.life;

      /**
       * Stamp a glow sprite centred at (cx, cy) in *world* coordinates.
       * glowR = the soft-halo radius (was shadowBlur × some multiplier).
       * The sprite is drawn with 'lighter' blend so overlapping glows
       * add up naturally, matching the old shadowBlur look.
       */
      const drawGlow = (cx: number, cy: number, glowR: number, color: string, glowAlpha: number) => {
        const sprite = getGlowSprite(color, glowR);
        const half = sprite.width / 2;
        ctx.globalAlpha = alpha * glowAlpha;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(sprite, cx - half, cy - half);
        ctx.globalCompositeOperation = 'source-over';
      };

      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      // ── petal ──────────────────────────────────────────────────────────
      if (p.type === 'petal') {
        // Soft glow halo underneath
        drawGlow(0, 0, p.size * 2.5, p.color, 0.35);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        // Inner highlight
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, -p.size * 0.2, p.size * 0.2, p.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        return;
      }

      // ── lighttrail ─────────────────────────────────────────────────────
      if (p.type === 'lighttrail') {
        const length = p.size * 3;
        drawGlow(length * 0.5, 0, p.size * 3, p.color, 0.4);
        ctx.globalAlpha = alpha;
        const gradient = ctx.createLinearGradient(-length, 0, length, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.3, p.color);
        gradient.addColorStop(0.7, p.color);
        gradient.addColorStop(1, '#FFFFFF');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, length, p.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bright core
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(length * 0.5, 0, p.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        return;
      }

      // ── groundglow ─────────────────────────────────────────────────────
      if (p.type === 'groundglow') {
        drawGlow(0, 0, p.size * 8, p.color, 0.3);
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        return;
      }

      // ── echo ───────────────────────────────────────────────────────────
      if (p.type === 'echo') {
        drawGlow(0, 0, p.size * 3.5, p.color, 0.35);
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        return;
      }

      // ── floater ────────────────────────────────────────────────────────
      if (p.type === 'floater') {
        drawGlow(0, 0, p.size * 5, p.color, 0.3);
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.9;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        return;
      }

      // ── firework / charge / nebula / swipe / trail / sparkle / etc. ───
      const glowMult = p.type === 'charge' ? 4 : p.type === 'nebula' ? 3 : 2;
      const glowAlpha = p.type === 'charge' ? 0.6 : 0.45;
      drawGlow(0, 0, p.size * glowMult, p.color, glowAlpha);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const shape = (p.type === 'firework' || p.type === 'charge') ? dailyVariation.particleShape : 'circle';

      switch (shape) {
        case 'star': {
          const spikes = 5;
          const outerR = p.size;
          const innerR = p.size * 0.4;
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI * i) / spikes - Math.PI / 2;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'flower': {
          const petals = 5;
          for (let i = 0; i < petals; i++) {
            const angle = (Math.PI * 2 * i) / petals;
            ctx.beginPath();
            ctx.ellipse(
              Math.cos(angle) * p.size * 0.4,
              Math.sin(angle) * p.size * 0.4,
              p.size * 0.5,
              p.size * 0.3,
              angle,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          break;
        }
        case 'heart': {
          const s = p.size * 0.6;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(-s, -s * 0.5, -s * 0.5, -s, 0, -s * 0.4);
          ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.5, 0, s * 0.3);
          ctx.fill();
          break;
        }
        default: {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
    },
    [dailyVariation.particleShape, getGlowSprite]
  );

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Invalidate cached offscreen canvases on resize
      starCanvasLevelRef.current = -1;
      auroraGradientRef.current = null;
    };
    resize();
    window.addEventListener('resize', resize);

    const addAmbient = () => {
      const level = growthRef.current.level;
      const maxAmbient = 50 + level * 10;
      if (particlesRef.current.filter(p => p.type === 'ambient').length >= maxAmbient) return;

      const colors = themeRef.current.particleColors;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const themeId = themeRef.current.id;

      // Theme-specific ambient behavior
      let vx = (Math.random() - 0.5) * 0.3;
      let vy = -0.2 - Math.random() * 0.3;
      let rotationSpeed = 0;
      let size = 1 + Math.random() * 2;

      if (themeId === 'spring') {
        // Petal-like drifting
        vx = (Math.random() - 0.5) * 0.5;
        vy = 0.3 + Math.random() * 0.4;
        rotationSpeed = (Math.random() - 0.5) * 0.03;
      } else if (themeId === 'summer') {
        // Firefly-like slow drift upward
        vx = (Math.random() - 0.5) * 0.4;
        vy = -0.1 - Math.random() * 0.2;
        size = 1.5 + Math.random() * 2;
      } else if (themeId === 'autumn') {
        // Falling leaf-like
        vx = (Math.random() - 0.5) * 0.6;
        vy = 0.4 + Math.random() * 0.3;
        rotationSpeed = (Math.random() - 0.5) * 0.04;
        size = 2 + Math.random() * 2;
      } else if (themeId === 'winter') {
        // Snow-like slow fall
        vx = (Math.random() - 0.5) * 0.2;
        vy = 0.2 + Math.random() * 0.2;
        size = 1 + Math.random() * 1.5;
      }

      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx,
        vy,
        life: 1,
        maxLife: 200 + Math.random() * 100,
        color,
        size,
        type: 'ambient',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 0.5 + Math.random() * 1.5,
      });
    };

    const animate = () => {
      if (!running) return;

      const w = canvas.width;
      const h = canvas.height;
      const now = Date.now();
      const timeSec = now * 0.001;

      // Draw background
      if (bgImageRef.current && bgImageRef.current.complete && bgImageRef.current.naturalWidth > 0) {
        // Draw with "cover" aspect ratio to avoid stretching
        const img = bgImageRef.current;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = w / h;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (imgAspect > canvasAspect) {
          // Image is wider - crop sides
          sw = img.naturalHeight * canvasAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          // Image is taller - crop top/bottom
          sh = img.naturalWidth / canvasAspect;
          sy = (img.naturalHeight - sh) / 2;
        }
        // Apply background opacity (0.6 for a subtle, non-overwhelming look)
        ctx.globalAlpha = 0.6;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        ctx.globalAlpha = 1;
        // Dark overlay for better particle visibility
        const overlayAlpha = Math.max(0.1, 0.25 - growthRef.current.level * 0.01);
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha})`;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Use theme-specific gradient as fallback (always visible)
        const bgGradientStr = themeRef.current.bgGradient;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        // Parse theme gradient colors
        const colorMatches = bgGradientStr.match(/#[0-9a-fA-F]{6}/g);
        if (colorMatches && colorMatches.length >= 3) {
          grad.addColorStop(0, colorMatches[0]);
          grad.addColorStop(0.5, colorMatches[1]);
          grad.addColorStop(1, colorMatches[2]);
        } else {
          grad.addColorStop(0, '#0a0a2e');
          grad.addColorStop(0.5, '#1a1a3e');
          grad.addColorStop(1, '#2a1a4e');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Starfield twinkling at level 3+
      // Star positions are static — pre-render to offscreen canvas; only twinkle alpha varies per frame.
      // We bake the positions once (or when level changes) and stamp them each frame with a
      // time-varying global alpha to approximate twinkling cheaply.
      if (growthRef.current.level >= 3) {
        const level = growthRef.current.level;
        const starCount = 20 + level * 5;

        // Rebuild offscreen star canvas when level changes or size changed
        if (starCanvasLevelRef.current !== level || !starCanvasRef.current ||
            starCanvasRef.current.width !== w || starCanvasRef.current.height !== h) {
          const sc = document.createElement('canvas');
          sc.width = w;
          sc.height = h;
          const sctx = sc.getContext('2d')!;
          sctx.fillStyle = 'white';
          for (let i = 0; i < starCount; i++) {
            const sx = (i * 137.5) % w;
            const sy = (i * 73.3) % h;
            const starSize = 0.5 + (i % 3) * 0.3;
            sctx.beginPath();
            sctx.arc(sx, sy, starSize, 0, Math.PI * 2);
            sctx.fill();
          }
          starCanvasRef.current = sc;
          starCanvasLevelRef.current = level;
        }

        // Composite pre-baked stars with a time-varying alpha to simulate twinkling
        const twinkle = 0.3 + 0.4 * Math.sin(timeSec * 2);
        ctx.globalAlpha = twinkle;
        ctx.drawImage(starCanvasRef.current, 0, 0);
        ctx.globalAlpha = 1;
      }

      // Aurora effect at level 8+
      if (growthRef.current.level >= 8) {
        // Rebuild cached gradient only when canvas size changes
        if (!auroraGradientRef.current ||
            auroraGradientSizeRef.current.w !== w || auroraGradientSizeRef.current.h !== h) {
          const grad = ctx.createLinearGradient(0, 0, w, h * 0.4);
          grad.addColorStop(0, themeRef.current.particleColors[0]);
          grad.addColorStop(0.5, themeRef.current.particleColors[2]);
          grad.addColorStop(1, themeRef.current.particleColors[4] || themeRef.current.particleColors[0]);
          auroraGradientRef.current = grad;
          auroraGradientSizeRef.current = { w, h };
        }

        ctx.globalAlpha = 0.08;
        ctx.fillStyle = auroraGradientRef.current;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        // Step 40px instead of 20px — half the path points, visually identical
        for (let x = 0; x <= w; x += 40) {
          const y = h * 0.2 + Math.sin(x * 0.005 + timeSec) * 40 + Math.sin(x * 0.01 + timeSec * 1.5) * 20;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Update and draw particles
      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        // Nebula particles orbit
        if (p.type === 'nebula' && p.orbitAngle !== undefined && p.orbitRadius !== undefined && p.orbitSpeed !== undefined) {
          p.orbitAngle += p.orbitSpeed;
          const centerX = p.x - Math.cos(p.orbitAngle - p.orbitSpeed) * p.orbitRadius;
          const centerY = p.y - Math.sin(p.orbitAngle - p.orbitSpeed) * p.orbitRadius;
          p.x = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
          p.y = centerY + Math.sin(p.orbitAngle) * p.orbitRadius;
          p.orbitRadius *= 0.998;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        p.rotation += p.rotationSpeed;

        if (p.type === 'firework' || p.type === 'charge') {
          p.vy += 0.05;
          p.vx *= 0.98;
          p.vy *= 0.98;
        } else if (p.type === 'swipe') {
          p.vx *= 0.95;
          p.vy *= 0.95;
        } else if (p.type === 'petal') {
          // Petals drift and sway like falling leaves
          p.vx += Math.sin(p.life * 10) * 0.03;
          p.vy += 0.02;
          p.vx *= 0.99;
          p.vy *= 0.99;
        } else if (p.type === 'lighttrail') {
          p.vx *= 0.96;
          p.vy *= 0.9;
        } else if (p.type === 'trail') {
          p.vy -= 0.01;
          p.vx *= 0.99;
        } else if (p.type === 'ambient') {
          // Theme-specific ambient movement with breathing
          const themeId = themeRef.current.id;
          if (themeId === 'spring') {
            p.vx += Math.sin(timeSec + p.breathPhase!) * 0.002;
            p.rotation += p.rotationSpeed;
          } else if (themeId === 'summer') {
            // Fireflies: gentle upward drift with occasional direction change
            p.vy += Math.sin(now * 0.002 + p.breathPhase!) * 0.001;
          } else if (themeId === 'autumn') {
            p.vx += Math.sin(p.life * 8) * 0.02;
            p.rotation += p.rotationSpeed;
          } else if (themeId === 'winter') {
            p.vx += Math.sin(timeSec + p.x * 0.01) * 0.003;
          }
          p.vx *= 0.995;
          p.vy *= 0.995;
        } else if (p.type === 'groundglow') {
          // Ground glow particles don't move, just fade
          p.vx *= 0.9;
          p.vy *= 0.9;
        } else if (p.type === 'echo') {
          // Echo particles slowly drift away from origin
          if (p.echoOriginX !== undefined && p.echoOriginY !== undefined) {
            const dx = p.x - p.echoOriginX;
            const dy = p.y - p.echoOriginY;
            p.vx += dx * 0.001;
            p.vy += dy * 0.001;
          }
          p.vx *= 0.97;
          p.vy *= 0.97;
        } else if (p.type === 'floater') {
          // Floater particles gently bob up and down
          p.vy += Math.sin(now * 0.003 + p.breathPhase!) * 0.01;
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        p.life -= 1 / p.maxLife;

        if (p.life > 0) {
          // Breathing effect for ambient and floater particles
          if ((p.type === 'ambient' || p.type === 'floater') && p.breathPhase !== undefined) {
            p.breathPhase += (p.breathSpeed || 1) * 0.02;
            const breathScale = 0.7 + 0.3 * Math.sin(p.breathPhase);
            const breathAlpha = 0.5 + 0.5 * Math.sin(p.breathPhase);
            const glowR = p.size * breathScale * 2.5;
            const sprite = getGlowSprite(p.color, glowR);
            const half = sprite.width / 2;
            // Glow halo via sprite (no shadowBlur)
            ctx.globalAlpha = p.life * breathAlpha * 0.5;
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(sprite, p.x - half, p.y - half);
            ctx.globalCompositeOperation = 'source-over';
            // Solid core circle
            ctx.globalAlpha = p.life * breathAlpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * breathScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          } else {
            drawParticle(ctx, p);
          }
          alive.push(p);
        }
      }
      particlesRef.current = alive;

      // Add ambient particles (skip when near cap to avoid frame drops)
      if (particlesRef.current.length < MAX_PARTICLES * 0.85 &&
          Math.random() < 0.05 + growthRef.current.level * 0.01) {
        addAmbient();
      }

      // Draw charge indicator if long pressing
      if (isLongPressingRef.current && touchStartRef.current) {
        const elapsed = now - chargeStartRef.current;
        const chargeProgress = Math.min(elapsed / 3000, 1);
        const { x, y } = touchStartRef.current;
        const chargeR = 20 + chargeProgress * 30;
        const chargeAngle = Math.PI * 2 * chargeProgress;
        const chargeColor = themeRef.current.accentColor;

        // Glow halo (replaces shadowBlur=15) — multi-layer stroke
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y, chargeR, 0, chargeAngle);
        ctx.strokeStyle = chargeColor + '20'; // 12.5% alpha
        ctx.lineWidth = 3 + 30;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, chargeR, 0, chargeAngle);
        ctx.strokeStyle = chargeColor + '40'; // 25% alpha
        ctx.lineWidth = 3 + 14;
        ctx.stroke();

        // Core arc
        ctx.beginPath();
        ctx.arc(x, y, chargeR, 0, chargeAngle);
        ctx.strokeStyle = chargeColor + '80';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pulsing center dot
        ctx.beginPath();
        ctx.arc(x, y, 4 + chargeProgress * 4, 0, Math.PI * 2);
        ctx.fillStyle = themeRef.current.accentColor;
        ctx.fill();

        // Edge pulse glow at level 7+
        if (growthRef.current.level >= 7) {
          const pulseRadius = 50 + chargeProgress * 100 + Math.sin(now * 0.003) * 10;
          const pulseAlpha = 0.1 + 0.1 * Math.sin(timeSec * 2);
          ctx.strokeStyle = themeRef.current.accentColor;
          ctx.globalAlpha = pulseAlpha * (1 - chargeProgress * 0.5);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Reset canvas state to prevent leakage into next frame
        ctx.lineCap = 'butt';
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
      }

      // Quiet mode: floating orbs after 3 seconds of no interaction
      const idleTime = now - lastInteractionRef.current;
      if (idleTime > 3000 && growthRef.current.level >= 2 && particlesRef.current.length < MAX_PARTICLES * 0.7) {
        const floaterCount = particlesRef.current.filter(p => p.type === 'floater').length;
        const maxFloaters = 3 + Math.floor(growthRef.current.level / 2);
        if (floaterCount < maxFloaters && Math.random() < 0.02) {
          particlesRef.current.push({
            x: Math.random() * w,
            y: h + 20,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.3 - Math.random() * 0.2,
            life: 1,
            maxLife: 400 + Math.random() * 200,
            color: themeRef.current.particleColors[Math.floor(Math.random() * themeRef.current.particleColors.length)],
            size: 3 + Math.random() * 4,
            type: 'floater',
            rotation: 0,
            rotationSpeed: 0,
            breathPhase: Math.random() * Math.PI * 2,
            breathSpeed: 0.3 + Math.random() * 0.5,
          });
        }
      }

      // Level 10+: random micro-bursts when idle
      if (growthRef.current.level >= 10 && idleTime > 5000 && Math.random() < 0.005 &&
          particlesRef.current.length + 8 <= MAX_PARTICLES) {
        const bx = Math.random() * w;
        const by = Math.random() * h * 0.6;
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          const speed = 0.5 + Math.random() * 1;
          particlesRef.current.push({
            x: bx,
            y: by,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            maxLife: 60 + Math.random() * 40,
            color: themeRef.current.particleColors[Math.floor(Math.random() * themeRef.current.particleColors.length)],
            size: 1.5 + Math.random() * 2,
            type: 'ambient',
            rotation: 0,
            rotationSpeed: 0,
            breathPhase: Math.random() * Math.PI * 2,
            breathSpeed: 1 + Math.random(),
          });
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [drawParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
      onClick={handleClick}
    />
  );
}