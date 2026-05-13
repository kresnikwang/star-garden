// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'trigger' | 'accumulate' | 'collect' | 'combo' | 'streak' | 'special';
  // target value for accumulate type achievements (undefined = boolean unlock)
  target?: number;
  // which stat to track
  stat?: string;
  // theme id for theme-specific achievements
  themeId?: string;
  // rarity: common | rare | epic | legendary
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  // bonus description shown when unlocked
  reward?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── First-time triggers ─────────────────────────────────────────────────
  {
    id: 'first_firework',
    name: '初见烟火',
    description: '触发第一次烟花',
    icon: '🎆',
    type: 'trigger',
    rarity: 'common',
    reward: '+5 XP',
  },
  {
    id: 'first_triple_tap',
    name: '三重绽放',
    description: '三连击触发花瓣特效',
    icon: '🌸',
    type: 'trigger',
    rarity: 'common',
    reward: '+8 XP',
  },
  {
    id: 'first_long_press',
    name: '长情陪伴',
    description: '长按触发大烟花',
    icon: '⏳',
    type: 'trigger',
    rarity: 'common',
    reward: '+10 XP',
  },
  {
    id: 'first_swipe',
    name: '轻扫流星',
    description: '向下滑动触发滑落烟花',
    icon: '💫',
    type: 'trigger',
    rarity: 'common',
    reward: '+5 XP',
  },
  {
    id: 'first_pinch',
    name: '天地之间',
    description: '双指缩放触发能量特效',
    icon: '🤏',
    type: 'trigger',
    rarity: 'common',
    reward: '+8 XP',
  },
  {
    id: 'first_dual_press',
    name: '双指连线',
    description: '双指长按触发粒子桥',
    icon: '🔗',
    type: 'trigger',
    rarity: 'common',
    reward: '+10 XP',
  },

  // ── Accumulation: gesture counts ────────────────────────────────────────
  {
    id: 'gesture_50',
    name: '手势达人',
    description: '累计触发手势 50 次',
    icon: '👆',
    type: 'accumulate',
    stat: 'totalGestures',
    target: 50,
    rarity: 'rare',
    reward: '+20 XP',
  },
  {
    id: 'gesture_200',
    name: '手势大师',
    description: '累计触发手势 200 次',
    icon: '🖐️',
    type: 'accumulate',
    stat: 'totalGestures',
    target: 200,
    rarity: 'epic',
    reward: '+50 XP',
  },
  {
    id: 'gesture_500',
    name: '星夜舞者',
    description: '累计触发手势 500 次',
    icon: '🌟',
    type: 'accumulate',
    stat: 'totalGestures',
    target: 500,
    rarity: 'legendary',
    reward: '+100 XP',
  },

  // ── Accumulation: combos ─────────────────────────────────────────────────
  {
    id: 'combo_10',
    name: '组合新星',
    description: '触发组合技 10 次',
    icon: '⚡',
    type: 'accumulate',
    stat: 'totalCombos',
    target: 10,
    rarity: 'rare',
    reward: '+25 XP',
  },
  {
    id: 'combo_50',
    name: '组合大师',
    description: '触发组合技 50 次',
    icon: '✨',
    type: 'accumulate',
    stat: 'totalCombos',
    target: 50,
    rarity: 'epic',
    reward: '+60 XP',
  },

  // ── Theme collection ────────────────────────────────────────────────────
  {
    id: 'collect_spring',
    name: '春之收集者',
    description: '樱花夜收集 100 个粒子',
    icon: '🌸',
    type: 'collect',
    stat: 'totalCollected',
    themeId: 'spring',
    target: 100,
    rarity: 'rare',
    reward: '+30 XP',
  },
  {
    id: 'collect_summer',
    name: '夏之捕捉者',
    description: '萤火海收集 100 个粒子',
    icon: '✨',
    type: 'collect',
    stat: 'totalCollected',
    themeId: 'summer',
    target: 100,
    rarity: 'rare',
    reward: '+30 XP',
  },
  {
    id: 'collect_autumn',
    name: '秋之收藏家',
    description: '枫叶谷收集 100 个粒子',
    icon: '🍁',
    type: 'collect',
    stat: 'totalCollected',
    themeId: 'autumn',
    target: 100,
    rarity: 'rare',
    reward: '+30 XP',
  },
  {
    id: 'collect_winter',
    name: '冬之追光者',
    description: '极光雪收集 100 个粒子',
    icon: '❄️',
    type: 'collect',
    stat: 'totalCollected',
    themeId: 'winter',
    target: 100,
    rarity: 'rare',
    reward: '+30 XP',
  },
  {
    id: 'collect_all_themes',
    name: '四季轮回',
    description: '四个主题各收集 50 个粒子',
    icon: '🗓️',
    type: 'special',
    rarity: 'legendary',
    reward: '+150 XP',
  },

  // ── Streak achievements ──────────────────────────────────────────────────
  {
    id: 'streak_3',
    name: '三日之约',
    description: '连续游玩 3 天',
    icon: '📅',
    type: 'streak',
    stat: 'streakDays',
    target: 3,
    rarity: 'common',
    reward: '+15 XP',
  },
  {
    id: 'streak_7',
    name: '一周之誓',
    description: '连续游玩 7 天',
    icon: '📆',
    type: 'streak',
    stat: 'streakDays',
    target: 7,
    rarity: 'rare',
    reward: '+40 XP',
  },
  {
    id: 'streak_30',
    name: '月度挚友',
    description: '连续游玩 30 天',
    icon: '🗓️',
    type: 'streak',
    stat: 'streakDays',
    target: 30,
    rarity: 'epic',
    reward: '+100 XP',
  },

  // ── Special milestones ───────────────────────────────────────────────────
  {
    id: 'all_gestures',
    name: '全能之手',
    description: '解锁全部 6 种基础手势',
    icon: '🏆',
    type: 'special',
    rarity: 'epic',
    reward: '+80 XP',
  },
  {
    id: 'first_share',
    name: '分享之美',
    description: '分享你的星夜花园',
    icon: '🤝',
    type: 'special',
    rarity: 'rare',
    reward: '+20 XP',
  },
  {
    id: 'level_5',
    name: '初露锋芒',
    description: '达到 5 级',
    icon: '⬆️',
    type: 'special',
    rarity: 'common',
    reward: '+25 XP',
  },
  {
    id: 'level_10',
    name: '小有所成',
    description: '达到 10 级',
    icon: '⬆️',
    type: 'special',
    rarity: 'rare',
    reward: '+60 XP',
  },
];

export const RARITY_COLORS: Record<Achievement['rarity'], string> = {
  common: '#9CA3AF',     // gray
  rare: '#60A5FA',        // blue
  epic: '#A78BFA',        // purple
  legendary: '#FBBF24',   // gold
};

export const RARITY_BG: Record<Achievement['rarity'], string> = {
  common: 'rgba(156,163,175,0.1)',
  rare: 'rgba(96,165,250,0.1)',
  epic: 'rgba(167,139,250,0.1)',
  legendary: 'rgba(251,191,36,0.15)',
};