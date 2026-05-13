import { ACHIEVEMENTS, type Achievement } from './achievements';

const STORAGE_KEY = 'star_garden_achievements';

export interface AchievementProgress {
  unlockedAt?: number; // timestamp ms
  count: number;       // current count toward target
}

export interface AchievementStore {
  achievements: Record<string, AchievementProgress>;
  lastPlayedDate: string; // YYYY-MM-DD
  totalPlayedDays: number;
  totalGestures: number;
  totalCombos: number;
  totalCollected: number;
  shareCount: number;
}

// Load from localStorage
export function loadStore(): AchievementStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultStore();
}

function defaultStore(): AchievementStore {
  return {
    achievements: {},
    lastPlayedDate: '',
    totalPlayedDays: 0,
    totalGestures: 0,
    totalCombos: 0,
    totalCollected: 0,
    shareCount: 0,
  };
}

function saveStore(store: AchievementStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// Get count for a specific achievement
export function getCount(id: string): number {
  return loadStore().achievements[id]?.count ?? 0;
}

// Get all unlocked achievement ids
export function getUnlocked(): string[] {
  const store = loadStore();
  return Object.entries(store.achievements)
    .filter(([, v]) => v.unlockedAt != null)
    .map(([id]) => id);
}

// Get progress (count and unlocked status) for all achievements
export function getAllProgress(): Record<string, { count: number; unlocked: boolean; unlockedAt?: number }> {
  const store = loadStore();
  const result: Record<string, { count: number; unlocked: boolean; unlockedAt?: number }> = {};
  for (const a of ACHIEVEMENTS) {
    const p = store.achievements[a.id];
    result[a.id] = {
      count: p?.count ?? 0,
      unlocked: p?.unlockedAt != null,
      unlockedAt: p?.unlockedAt,
    };
  }
  return result;
}

// Update a stat counter and check achievements
export function incrementCounter(key: keyof AchievementStore, amount = 1): string[] {
  const store = loadStore();
  const prev = store[key] as number;
  (store as any)[key] = prev + amount;
  const unlocked = checkAndUnlock(store);
  saveStore(store);
  return unlocked;
}

// Update streak (call on each game session start)
export function updateStreak(): string[] {
  const store = loadStore();
  const today = new Date().toISOString().slice(0, 10);
  if (store.lastPlayedDate === today) return []; // already played today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (store.lastPlayedDate === yesterday) {
    // continue streak
    store.totalPlayedDays = (store.totalPlayedDays || 0) + 1;
  } else if (!store.lastPlayedDate) {
    // first time
    store.totalPlayedDays = 1;
  } else {
    // streak broken, reset
    store.totalPlayedDays = 1;
  }
  store.lastPlayedDate = today;
  const unlocked = checkAndUnlock(store);
  saveStore(store);
  return unlocked;
}

// Mark share done
export function markShared(): string[] {
  const store = loadStore();
  store.shareCount = (store.shareCount || 0) + 1;
  const unlocked = checkAndUnlock(store);
  saveStore(store);
  return unlocked;
}

// Check level achievements
export function checkLevel(level: number): string[] {
  const store = loadStore();
  const unlocked = checkAndUnlock(store, level);
  saveStore(store);
  return unlocked;
}

// Main check function — run after any stat update
function checkAndUnlock(store: AchievementStore, level?: number): string[] {
  const newlyUnlocked: string[] = [];

  for (const a of ACHIEVEMENTS) {
    const prog = store.achievements[a.id] ?? { count: 0 };
    if (prog.unlockedAt) continue; // already unlocked

    let count = 0;
    let unlocked = false;

    switch (a.type) {
      case 'trigger':
        // Boolean: just needs to exist in store
        count = prog.count || 0;
        unlocked = count > 0;
        break;

      case 'accumulate': {
        if (!a.stat) break;
        const statKey = a.stat as keyof AchievementStore;
        count = (store[statKey] as number) ?? 0;
        unlocked = a.target != null ? count >= a.target : count > 0;
        break;
      }

      case 'collect': {
        count = store.totalCollected || 0;
        // For theme-specific, we'd need per-theme tracking
        // For now, collect achievements check total
        unlocked = a.target != null ? count >= a.target : false;
        break;
      }

      case 'streak': {
        count = store.totalPlayedDays || 0;
        unlocked = a.target != null ? count >= a.target : false;
        break;
      }

      case 'special': {
        if (a.id === 'all_gestures') {
          // Requires all 6 trigger achievements unlocked
          const triggers = ACHIEVEMENTS.filter(t => t.type === 'trigger');
          unlocked = triggers.every(t => store.achievements[t.id]?.unlockedAt);
          count = unlocked ? 1 : 0;
        } else if (a.id === 'first_share') {
          count = store.shareCount || 0;
          unlocked = count > 0;
        } else if (a.id === 'level_5') {
          count = level ?? 0;
          unlocked = count >= 5;
        } else if (a.id === 'level_10') {
          count = level ?? 0;
          unlocked = count >= 10;
        } else if (a.id === 'collect_all_themes') {
          // This would need per-theme tracking; for now we check total
          // Actual implementation: track per theme in store
          count = store.totalCollected || 0;
          unlocked = count >= 200; // proxy: played enough to collect from all themes
        }
        break;
      }
    }

    store.achievements[a.id] = { count, unlockedAt: unlocked ? Date.now() : prog.unlockedAt };

    if (unlocked && !prog.unlockedAt) {
      newlyUnlocked.push(a.id);
    }
  }

  return newlyUnlocked;
}

// Public: increment a stat and get newly unlocked achievement ids
export function trackGesture(): string[] {
  return incrementCounter('totalGestures' as keyof AchievementStore, 1);
}

export function trackCombo(): string[] {
  return incrementCounter('totalCombos' as keyof AchievementStore, 1);
}

export function trackCollection(count = 1): string[] {
  return incrementCounter('totalCollected' as keyof AchievementStore, count);
}

export function triggerAchievement(id: string): string[] {
  const store = loadStore();
  if (store.achievements[id]?.unlockedAt) return [];
  store.achievements[id] = { count: 1, unlockedAt: Date.now() };
  const newlyUnlocked = [id];
  saveStore(store);
  return newlyUnlocked;
}

export function getCompletionStats() {
  const unlocked = getUnlocked();
  return {
    total: ACHIEVEMENTS.length,
    unlocked: unlocked.length,
    percentage: Math.round((unlocked.length / ACHIEVEMENTS.length) * 100),
  };
}