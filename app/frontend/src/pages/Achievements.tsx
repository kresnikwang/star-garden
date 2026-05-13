import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACHIEVEMENTS, RARITY_COLORS, RARITY_BG, type Achievement } from '@/lib/achievements';
import {
  getAllProgress,
  getCompletionStats,
  loadStore,
} from '@/lib/achievement-store';
import { themes } from '@/lib/themes';

type Filter = 'all' | 'unlocked' | 'common' | 'rare' | 'epic' | 'legendary';

export default function Achievements() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ReturnType<typeof getAllProgress> | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getCompletionStats> | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showNewBadge, setShowNewBadge] = useState<string[]>([]);

  useEffect(() => {
    setProgress(getAllProgress());
    setStats(getCompletionStats());
    const store = loadStore();
    // Show "NEW" badge for achievements unlocked in last 24h
    const dayAgo = Date.now() - 86400000;
    const newIds = ACHIEVEMENTS
      .filter(a => {
        const p = store.achievements[a.id];
        return p?.unlockedAt && p.unlockedAt > dayAgo;
      })
      .map(a => a.id);
    setShowNewBadge(newIds);
  }, []);

  const filtered = ACHIEVEMENTS.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return progress?.[a.id]?.unlocked;
    return a.rarity === filter;
  });

  if (!progress || !stats) return null;

  const unlockedCount = stats.unlocked;
  const totalCount = stats.total;

  // Group by rarity for display
  const groups: Record<Filter, Achievement[]> = {
    all: filtered,
    unlocked: filtered,
    common: ACHIEVEMENTS.filter(a => a.rarity === 'common'),
    rare: ACHIEVEMENTS.filter(a => a.rarity === 'rare'),
    epic: ACHIEVEMENTS.filter(a => a.rarity === 'epic'),
    legendary: ACHIEVEMENTS.filter(a => a.rarity === 'legendary'),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a2e] via-[#1a1a3e] to-[#2a1a4e] text-white relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${((i * 73) % 100)}%`,
              top: `${((i * 51) % 100)}%`,
              width: `${1 + (i % 2)}px`,
              height: `${1 + (i % 2)}px`,
              animationDelay: `${(i * 0.3) % 4}s`,
              animationDuration: `${2 + (i % 4)}s`,
              opacity: 0.2 + (i % 5) * 0.1,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
          >
            ←
          </button>
          <h1 className="text-white/80 text-sm font-medium">成就</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pt-20 px-4 pb-8 max-w-lg mx-auto">

        {/* Completion banner */}
        <div className="text-center mb-6">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="url(#completionGradient)"
                strokeWidth="8"
                strokeDasharray={`${(stats.percentage / 100) * 327} 327`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{stats.percentage}%</span>
              <span className="text-[10px] text-white/40">完成度</span>
            </div>
          </div>
          <p className="text-white/60 text-xs">
            已解锁 <span className="text-white font-medium">{unlockedCount}</span> / {totalCount} 个成就
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'unlocked', 'common', 'rare', 'epic', 'legendary'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? '全部' :
               f === 'unlocked' ? '已解锁' :
               f === 'common' ? '普通' :
               f === 'rare' ? '稀有' :
               f === 'epic' ? '史诗' : '传说'}
            </button>
          ))}
        </div>

        {/* Achievement list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center text-white/30 py-12 text-sm">
              {filter === 'unlocked' ? '还没有解锁任何成就，继续加油！' : '无成就'}
            </div>
          )}

          {filtered.map(a => {
            const p = progress[a.id];
            const isUnlocked = p?.unlocked;
            const count = p?.count ?? 0;
            const target = a.target ?? 1;
            const progPct = Math.min((count / target) * 100, 100);
            const color = RARITY_COLORS[a.rarity];
            const isNew = showNewBadge.includes(a.id);

            return (
              <button
                key={a.id}
                onClick={() => setSelectedAchievement(a)}
                className={`w-full text-left rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isUnlocked ? '' : 'opacity-50'
                }`}
                style={{ background: isUnlocked ? RARITY_BG[a.rarity] : 'rgba(255,255,255,0.03)', border: `1px ${color}30` }}
              >
                <div className="flex items-center gap-3">
                  {/* Icon badge */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${color}20`, border: `1.5px solid ${color}60` }}
                  >
                    {isUnlocked ? a.icon : '🔒'}
                    {isNew && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full animate-pulse">NEW</span>
                    )}
                  </div>

                  {/* Name + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/90">{a.name}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                      >
                        {a.rarity === 'common' ? '普通' :
                         a.rarity === 'rare' ? '稀有' :
                         a.rarity === 'epic' ? '史诗' : '传说'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{a.description}</p>

                    {/* Progress bar for accumulate/streak types */}
                    {a.type === 'accumulate' || a.type === 'streak' || a.type === 'collect' ? (
                      <div className="mt-2">
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progPct}%`, background: color }}
                          />
                        </div>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {count} / {target}
                          {isUnlocked && <span className="ml-2 text-white/50">✓ 已达成</span>}
                        </p>
                      </div>
                    ) : isUnlocked ? (
                      <p className="text-[10px] text-white/30 mt-1">
                        ✓ 已达成 {p?.unlockedAt ? new Date(p.unlockedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : ''}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail modal */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          progress={progress[selectedAchievement.id]}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}

function AchievementModal({ achievement: a, progress, onClose }: { achievement: Achievement; progress: { count: number; unlocked: boolean; unlockedAt?: number } | undefined; onClose: () => void }) {
  const color = RARITY_COLORS[a.rarity];
  const count = progress?.count ?? 0;
  const target = a.target ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)`, border: `1px ${color}40` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 text-sm">✕</button>

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
          style={{ background: `${color}20`, border: `2px solid ${color}60` }}
        >
          {progress?.unlocked ? a.icon : '🔒'}
        </div>

        {/* Name + rarity */}
        <h2 className="text-lg font-bold text-white mb-1">{a.name}</h2>
        <span
          className="inline-block text-xs px-2 py-0.5 rounded-full mb-3"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {a.rarity === 'common' ? '普通' : a.rarity === 'rare' ? '稀有' : a.rarity === 'epic' ? '史诗' : '传说'}
        </span>

        <p className="text-white/60 text-sm mb-4 leading-relaxed">{a.description}</p>

        {/* Progress */}
        {(a.type === 'accumulate' || a.type === 'streak' || a.type === 'collect') && (
          <div className="mb-4">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-1">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((count / target) * 100, 100)}%`, background: color }}
              />
            </div>
            <p className="text-xs text-white/40">{count} / {target}</p>
          </div>
        )}

        {/* Reward */}
        {a.reward && (
          <div
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm"
            style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
          >
            🎁 {a.reward}
          </div>
        )}

        {/* Unlocked date */}
        {progress?.unlocked && progress.unlockedAt && (
          <p className="text-white/30 text-xs mt-4">
            解锁于 {new Date(progress.unlockedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}