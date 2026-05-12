import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { themes } from '@/lib/themes';
import { getCollection } from '@/lib/collection';
import type { CollectionProgress } from '@/lib/collection';
import { checkComboStatus } from '@/lib/combo-effects';

// Garden item layout positions for the 7 collectibles per theme
// Arranged in a garden-like scatter pattern (percentage-based)
const ITEM_POSITIONS = [
  { x: 50, y: 22 },  // top center
  { x: 25, y: 35 },  // upper left
  { x: 75, y: 35 },  // upper right
  { x: 15, y: 55 },  // middle left
  { x: 85, y: 55 },  // middle right
  { x: 35, y: 70 },  // lower left
  { x: 65, y: 70 },  // lower right
];

// Decorative particle positions (CSS animated)
function generateDecoParticles(themeId: string) {
  const seed = themeId.charCodeAt(0);
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: ((seed * 37 + i * 73) % 100),
    top: ((seed * 53 + i * 41) % 80) + 10,
    delay: (i * 0.7) % 5,
    duration: 3 + (i % 4),
    size: 2 + (i % 3),
  }));
}

interface GardenItemProps {
  emoji: string;
  name: string;
  count: number;
  collected: boolean;
  x: number;
  y: number;
  index: number;
  accentColor: string;
}

function GardenItem({ emoji, name, count, collected, x, y, index, accentColor }: GardenItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const sizeScale = collected ? Math.min(1 + Math.log(count + 1) * 0.15, 1.6) : 0.8;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        zIndex: collected ? 10 : 5,
      }}
      onClick={() => setShowTooltip(!showTooltip)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Glow ring for collected items */}
      {collected && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
            transform: `scale(${sizeScale * 2.5})`,
          }}
        />
      )}

      {/* Item container */}
      <div
        className={`relative flex items-center justify-center rounded-full transition-transform duration-500 ${
          collected
            ? 'hover:scale-110'
            : 'opacity-30 grayscale'
        }`}
        style={{
          width: `${56 * sizeScale}px`,
          height: `${56 * sizeScale}px`,
          animationDelay: `${index * 0.3}s`,
          animation: collected ? `gardenFloat ${3 + index * 0.5}s ease-in-out infinite` : 'none',
        }}
      >
        <span
          className="select-none"
          style={{ fontSize: `${28 * sizeScale}px` }}
        >
          {collected ? emoji : '?'}
        </span>
      </div>

      {/* Count badge */}
      {collected && count > 1 && (
        <div
          className="absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: accentColor }}
        >
          x{count}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
          <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 text-white text-xs border border-white/10">
            {collected ? (
              <>
                <span className="font-medium">{name}</span>
                <span className="text-white/50 ml-1.5">x{count}</span>
              </>
            ) : (
              <span className="text-white/50">未收集</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Garden() {
  const navigate = useNavigate();
  const themeIds = ['spring', 'summer', 'autumn', 'winter'] as const;
  const [activeTheme, setActiveTheme] = useState<string>(themeIds[0]);

  const collections = useMemo(() => {
    const map: Record<string, CollectionProgress> = {};
    for (const id of themeIds) {
      map[id] = getCollection(id);
    }
    return map;
  }, []);

  const theme = themes[activeTheme];
  const collection = collections[activeTheme];
  const comboStatus = checkComboStatus(activeTheme, collection.collected);

  const uniqueCollected = theme.collectibleEmojis.filter(
    (e) => (collection.collected[e] || 0) > 0
  ).length;
  const totalItems = Object.values(collection.collected).reduce((s, c) => s + c, 0);
  const decoParticles = useMemo(() => generateDecoParticles(activeTheme), [activeTheme]);

  return (
    <div
      className="min-h-screen relative overflow-hidden select-none"
      style={{ background: theme.bgGradient }}
    >
      {/* CSS animation keyframes */}
      <style>{`
        @keyframes gardenFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gardenParticle {
          0%, 100% { opacity: 0.2; transform: translateY(0) scale(1); }
          50% { opacity: 0.6; transform: translateY(-15px) scale(1.3); }
        }
        @keyframes comboGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.1); }
        }
      `}</style>

      {/* Decorative floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {decoParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: theme.particleColors[p.id % theme.particleColors.length],
              animation: `gardenParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Top navigation */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
          >
            ←
          </button>
          <h1 className="text-white/80 text-sm font-medium">我的花园</h1>
          <div className="w-10" /> {/* spacer */}
        </div>
      </div>

      {/* Theme tabs */}
      <div className="fixed top-16 left-0 right-0 z-20 px-4">
        <div className="flex justify-center gap-2">
          {themeIds.map((id) => {
            const t = themes[id];
            const c = collections[id];
            const hasItems = Object.values(c.collected).some((v) => v > 0);
            const isActive = activeTheme === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTheme(id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                  isActive
                    ? 'bg-white/20 text-white border border-white/30 scale-105'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                {t.name.split('·')[0]}
                {hasItems && <span className="ml-1 text-[10px] opacity-60">{t.collectibleEmojis[0]}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress ring */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <div className="relative w-20 h-20">
          {/* Background ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20" cy="20" r="17"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5"
            />
            <circle
              cx="20" cy="20" r="17"
              fill="none"
              stroke={theme.accentColor}
              strokeWidth="2.5"
              strokeDasharray={`${(uniqueCollected / 7) * 106.8} 106.8`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-lg font-bold">{uniqueCollected}</span>
            <span className="text-white/40 text-[10px]">/7</span>
          </div>
        </div>
        <p className="text-white/50 text-xs mt-2">{theme.name}</p>
        {totalItems > 0 && (
          <p className="text-white/30 text-[10px] mt-0.5">共收集 {totalItems} 件</p>
        )}
      </div>

      {/* Combo status badge */}
      {comboStatus && (
        <div
          className="absolute top-52 left-1/2 -translate-x-1/2 z-10"
          style={{ animation: 'comboGlow 3s ease-in-out infinite' }}
        >
          <div
            className="rounded-full px-4 py-1.5 text-xs text-white font-medium border"
            style={{
              backgroundColor: `${theme.accentColor}20`,
              borderColor: `${theme.accentColor}50`,
            }}
          >
            {comboStatus.tier === 'ultimate' ? '终极特效已解锁' : '组合特效已解锁'}
          </div>
        </div>
      )}

      {/* Garden scene */}
      <div className="absolute inset-0 top-56 bottom-28">
        {theme.collectibleEmojis.map((emoji, i) => {
          const pos = ITEM_POSITIONS[i];
          const count = collection.collected[emoji] || 0;
          return (
            <GardenItem
              key={`${activeTheme}-${i}`}
              emoji={emoji}
              name={theme.collectibles[i]}
              count={count}
              collected={count > 0}
              x={pos.x}
              y={pos.y}
              index={i}
              accentColor={theme.accentColor}
            />
          );
        })}
      </div>

      {/* Bottom stats */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-6">
        <div className="text-center">
          <div className="flex justify-center gap-3 mb-3">
            {theme.collectibleEmojis.map((emoji, i) => (
              <span
                key={i}
                className={`text-lg transition-all duration-300 ${
                  (collection.collected[emoji] || 0) > 0
                    ? 'opacity-100'
                    : 'opacity-20 grayscale'
                }`}
              >
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-white/40 text-xs">
            {collection.streakDays > 1 && `连续 ${collection.streakDays} 天 · `}
            {uniqueCollected === 0
              ? '开始游戏收集你的花园吧'
              : uniqueCollected === 7
              ? '恭喜集齐所有道具！'
              : `还差 ${7 - uniqueCollected} 种道具`}
          </p>
        </div>
      </div>
    </div>
  );
}
