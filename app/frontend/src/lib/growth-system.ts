export interface GestureType {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockLevel: number;
}

export interface GrowthState {
  level: number;
  xp: number;
  xpToNext: number;
  unlockedGestures: string[];
  unlockedEffects: string[];
  breathingSessions: number;
  totalSwipes: number;
  totalLongPress: number;
  totalCircles: number;
  totalPinches: number;
  hiddenDiscoveries: string[];
}

const GROWTH_KEY_PREFIX = 'starry-garden-growth';

function getGrowthKey(themeId: string): string {
  return `${GROWTH_KEY_PREFIX}-${themeId}`;
}

export const GESTURES: GestureType[] = [
  { id: 'tap', name: '点触绽放', icon: '👆', description: '点击屏幕绽放烟花', unlockLevel: 0 },
  { id: 'swipe', name: '流光滑动', icon: '✋', description: '滑动留下光轨尾迹', unlockLevel: 2 },
  { id: 'longpress', name: '蓄力烟花', icon: '💫', description: '长按蓄力释放大型烟花', unlockLevel: 3 },
  { id: 'circle', name: '星云漩涡', icon: '🌀', description: '画圆创造旋转星云', unlockLevel: 5 },
  { id: 'pinch', name: '聚散星辰', icon: '🤏', description: '双指捏合聚拢或散开粒子', unlockLevel: 7 },
];

export const HIDDEN_DISCOVERIES = [
  { id: 'first_swipe', name: '初次光轨', emoji: '🌈', condition: 'First swipe gesture' },
  { id: 'big_firework', name: '超级烟花', emoji: '🎆', condition: 'Hold for 3+ seconds' },
  { id: 'nebula_born', name: '星云诞生', emoji: '🌌', condition: 'First circle gesture' },
  { id: 'breath_master', name: '呼吸大师', emoji: '🧘', condition: 'Complete 3 breathing sessions' },
  { id: 'collector', name: '收藏家', emoji: '🏆', condition: 'Collect 20 items' },
  { id: 'night_owl', name: '夜行者', emoji: '🦉', condition: 'Play after midnight' },
  { id: 'rainbow_trail', name: '彩虹轨迹', emoji: '🌈', condition: 'Swipe 50 times' },
  { id: 'galaxy_maker', name: '造星者', emoji: '⭐', condition: 'Create 10 nebulas' },
  { id: 'theme_complete', name: '四季收藏家', emoji: '🎑', condition: 'Collect all items in a theme' },
];

export const LEVEL_EFFECTS: Record<number, string> = {
  0: '基础粒子',
  1: '粒子发光增强',
  2: '解锁滑动光轨',
  3: '解锁蓄力烟花',
  4: '背景星星增多',
  5: '解锁星云漩涡',
  6: '粒子拖尾加长',
  7: '解锁聚散星辰',
  8: '极光背景效果',
  9: '全屏粒子风暴',
  10: '大师级画面',
};

export function getGrowthState(themeId: string): GrowthState {
  try {
    const stored = localStorage.getItem(getGrowthKey(themeId));
    if (stored) {
      return JSON.parse(stored) as GrowthState;
    }
  } catch {
    // ignore
  }
  const initial: GrowthState = {
    level: 0,
    xp: 0,
    xpToNext: 30,
    unlockedGestures: ['tap'],
    unlockedEffects: [],
    breathingSessions: 0,
    totalSwipes: 0,
    totalLongPress: 0,
    totalCircles: 0,
    totalPinches: 0,
    hiddenDiscoveries: [],
  };
  saveGrowthState(themeId, initial);
  return initial;
}

export function saveGrowthState(themeId: string, state: GrowthState): void {
  try {
    localStorage.setItem(getGrowthKey(themeId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function addXP(themeId: string, state: GrowthState, amount: number): { state: GrowthState; leveledUp: boolean; newUnlocks: string[] } {
  const updated = { ...state };
  updated.xp += amount;
  let leveledUp = false;
  const newUnlocks: string[] = [];

  while (updated.xp >= updated.xpToNext) {
    updated.xp -= updated.xpToNext;
    updated.level += 1;
    updated.xpToNext = Math.floor(30 * Math.pow(1.3, updated.level));
    leveledUp = true;

    // Check gesture unlocks
    for (const gesture of GESTURES) {
      if (gesture.unlockLevel === updated.level && !updated.unlockedGestures.includes(gesture.id)) {
        updated.unlockedGestures.push(gesture.id);
        newUnlocks.push(gesture.name);
      }
    }

    // Check effect unlocks
    const effect = LEVEL_EFFECTS[updated.level];
    if (effect && !updated.unlockedEffects.includes(effect)) {
      updated.unlockedEffects.push(effect);
    }
  }

  saveGrowthState(themeId, updated);
  return { state: updated, leveledUp, newUnlocks };
}

export function discoverHidden(themeId: string, state: GrowthState, discoveryId: string): GrowthState {
  if (state.hiddenDiscoveries.includes(discoveryId)) return state;
  const updated = { ...state };
  updated.hiddenDiscoveries = [...updated.hiddenDiscoveries, discoveryId];
  saveGrowthState(themeId, updated);
  return updated;
}

export function isGestureUnlocked(state: GrowthState, gestureId: string): boolean {
  return state.unlockedGestures.includes(gestureId);
}

export function getNextUnlock(state: GrowthState): GestureType | null {
  for (const gesture of GESTURES) {
    if (!state.unlockedGestures.includes(gesture.id)) {
      return gesture;
    }
  }
  return null;
}