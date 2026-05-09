import { useState, useEffect, useRef, useCallback } from 'react';

interface BreathingGuideProps {
  accentColor: string;
  onComplete: () => void;
  onClose: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASE_DURATIONS: Record<BreathPhase, number> = {
  inhale: 4000,
  hold: 4000,
  exhale: 6000,
  rest: 2000,
};

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: '吸气',
  hold: '屏息',
  exhale: '呼气',
  rest: '放松',
};

const PHASE_ORDER: BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];

export function BreathingGuide({ accentColor, onComplete, onClose }: BreathingGuideProps) {
  const [phase, setPhase] = useState<BreathPhase>('rest');
  const [cycleCount, setCycleCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIndexRef = useRef(0);

  const totalCycles = 4;

  const startBreathing = useCallback(() => {
    setIsActive(true);
    phaseIndexRef.current = 0;
    setCycleCount(0);
    advancePhase(0, 0);
  }, []);

  const advancePhase = (phaseIdx: number, cycles: number) => {
    if (cycles >= totalCycles) {
      setIsActive(false);
      onComplete();
      return;
    }

    const currentPhase = PHASE_ORDER[phaseIdx];
    setPhase(currentPhase);
    setProgress(0);

    // Set scale based on phase
    if (currentPhase === 'inhale') setScale(1.5);
    else if (currentPhase === 'hold') setScale(1.5);
    else if (currentPhase === 'exhale') setScale(1);
    else setScale(1);

    const duration = PHASE_DURATIONS[currentPhase];
    const startTime = Date.now();

    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
    }, 50);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      const nextIdx = (phaseIdx + 1) % PHASE_ORDER.length;
      const nextCycles = nextIdx === 0 ? cycles + 1 : cycles;
      if (nextIdx === 0) setCycleCount(cycles + 1);
      advancePhase(nextIdx, nextCycles);
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
        >
          ✕
        </button>

        {!isActive ? (
          <div className="text-center">
            <p className="text-white/80 text-lg mb-2">🧘 呼吸引导</p>
            <p className="text-white/50 text-sm mb-6">
              跟随节奏深呼吸，完成后获得特殊奖励
            </p>
            <button
              onClick={startBreathing}
              className="px-6 py-3 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 hover:bg-white/25 transition-all"
            >
              开始呼吸 🌬️
            </button>
          </div>
        ) : (
          <>
            {/* Breathing circle */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Outer ring progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress)}`}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                />
              </svg>

              {/* Breathing orb */}
              <div
                className="w-24 h-24 rounded-full transition-transform ease-in-out"
                style={{
                  transitionDuration: '2000ms',
                  transform: `scale(${scale})`,
                  background: `radial-gradient(circle, ${accentColor}80, ${accentColor}20)`,
                  boxShadow: `0 0 40px ${accentColor}40, 0 0 80px ${accentColor}20`,
                }}
              />
            </div>

            {/* Phase label */}
            <div className="text-center">
              <p className="text-white/90 text-xl font-light">{PHASE_LABELS[phase]}</p>
              <p className="text-white/40 text-sm mt-2">
                第 {cycleCount + 1} / {totalCycles} 轮
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}