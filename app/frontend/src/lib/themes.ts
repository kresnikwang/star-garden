/** Vite base path, e.g. "/" or "/star-garden/" */
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');

function asset(path: string): string {
  // path like "themes/spring-bg.png"
  return `${BASE}${path.replace(/^\//, '')}`;
}

export interface ThemeConfig {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  bgImage: string;
  bgGradient: string;
  particleColors: string[];
  accentColor: string;
  pentatonicScale: number[]; // frequencies in Hz - expanded to 14 notes
  melodyNotes: number[];
  collectibles: string[];
  collectibleEmojis: string[];
}

/** Stable display order on home / garden */
export const THEME_ORDER = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'rain',
  'moon',
  'desert',
  'lake',
] as const;

export type ThemeId = (typeof THEME_ORDER)[number];

export const themes: Record<string, ThemeConfig> = {
  spring: {
    id: 'spring',
    name: '春·樱花夜',
    nameEn: 'Spring Blossoms',
    description: '收集飘落的樱花瓣，编织春天的旋律',
    bgImage: asset('themes/spring-bg.png'),
    bgGradient: 'linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 50%, #4a2040 100%)',
    particleColors: ['#E8B0BC', '#D498A8', '#F0C8D0', '#C8A0B0', '#E8D0D8', '#B88898'],
    accentColor: '#D4A0B0',
    pentatonicScale: [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00,
      1046.50, 1174.66, 1318.51, 1567.98,
    ],
    melodyNotes: [523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 659.25, 523.25, 440.00, 392.00, 523.25, 659.25],
    collectibles: ['樱花瓣', '花蕊', '蝴蝶', '露珠', '花环', '春风', '新芽'],
    collectibleEmojis: ['\u{1F338}', '\u{1F33A}', '\u{1F98B}', '\u{1F4A7}', '\u{1F490}', '\u{1F343}', '\u{1F331}'],
  },
  summer: {
    id: 'summer',
    name: '夏·萤火海',
    nameEn: 'Summer Fireflies',
    description: '捕捉夏夜的萤火虫，点亮星空',
    bgImage: asset('themes/summer-bg.png'),
    bgGradient: 'linear-gradient(180deg, #0a1628 0%, #1a3a4a 50%, #0d4f4f 100%)',
    particleColors: ['#6BA8C4', '#5A9E94', '#D4C878', '#7AB8A0', '#9BBFD0', '#A8C8C0'],
    accentColor: '#6BA8A0',
    pentatonicScale: [
      196.00, 220.00, 246.94, 293.66, 329.63,
      392.00, 440.00, 493.88, 587.33, 659.25,
      783.99, 880.00, 987.77, 1174.66,
    ],
    melodyNotes: [392.00, 493.88, 587.33, 493.88, 659.25, 587.33, 440.00, 392.00, 329.63, 293.66, 392.00, 493.88],
    collectibles: ['萤火虫', '海星', '贝壳', '珊瑚', '水母', '海浪', '椰子'],
    collectibleEmojis: ['\u2728', '\u2B50', '\u{1F41A}', '\u{1FAB8}', '\u{1FABC}', '\u{1F30A}', '\u{1F965}'],
  },
  autumn: {
    id: 'autumn',
    name: '秋·枫叶谷',
    nameEn: 'Autumn Leaves',
    description: '收集金色枫叶，谱写秋日暖歌',
    bgImage: asset('themes/autumn-bg.png'),
    bgGradient: 'linear-gradient(180deg, #1a0a2e 0%, #3d1f0a 50%, #5c2d0a 100%)',
    particleColors: ['#C87060', '#D49858', '#C8A858', '#C88050', '#A86840', '#E0C8A8'],
    accentColor: '#C89060',
    pentatonicScale: [
      146.83, 164.81, 196.00, 220.00, 261.63,
      293.66, 329.63, 392.00, 440.00, 523.25,
      587.33, 659.25, 783.99, 880.00,
    ],
    melodyNotes: [293.66, 392.00, 440.00, 392.00, 523.25, 440.00, 329.63, 293.66, 261.63, 220.00, 293.66, 392.00],
    collectibles: ['枫叶', '松果', '橡果', '蘑菇', '南瓜', '落日', '暖茶'],
    collectibleEmojis: ['\u{1F341}', '\u{1F330}', '\u{1FAD2}', '\u{1F344}', '\u{1F383}', '\u{1F305}', '\u{1F375}'],
  },
  winter: {
    id: 'winter',
    name: '冬·极光雪',
    nameEn: 'Winter Aurora',
    description: '收集雪花结晶，唤醒极光之舞',
    bgImage: asset('themes/winter-bg.png'),
    bgGradient: 'linear-gradient(180deg, #0a0a2e 0%, #1a2a4a 50%, #0a3a5a 100%)',
    particleColors: ['#A0C0D4', '#C0C8D0', '#88B0C8', '#C8D8E4', '#D8E4EC', '#B0C8D4'],
    accentColor: '#98B8C8',
    pentatonicScale: [
      130.81, 146.83, 164.81, 196.00, 220.00,
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99,
    ],
    melodyNotes: [261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 293.66, 261.63, 220.00, 196.00, 261.63, 329.63],
    collectibles: ['雪花', '冰晶', '极光', '雪人', '铃铛', '星光', '暖炉'],
    collectibleEmojis: ['\u2744\uFE0F', '\u{1F48E}', '\u{1F30C}', '\u26C4', '\u{1F514}', '\u{1F31F}', '\u{1F525}'],
  },

  // ── New maps ──────────────────────────────────────────────────────────
  rain: {
    id: 'rain',
    name: '雨·烟波夜',
    nameEn: 'Rainy Mist',
    description: '聆听细雨低语，收集烟波中的微光',
    bgImage: asset('themes/rain-bg.jpg'),
    bgGradient: 'linear-gradient(180deg, #0e1524 0%, #1a2840 50%, #243848 100%)',
    particleColors: ['#8AA8B8', '#A0B8C4', '#6E8FA0', '#C0D0D8', '#7A98A8', '#B0C4CC'],
    accentColor: '#8AA8B8',
    // Soft minor-leaning pentatonic (A-ish)
    pentatonicScale: [
      220.00, 246.94, 293.66, 329.63, 392.00,
      440.00, 493.88, 587.33, 659.25, 783.99,
      880.00, 987.77, 1174.66, 1318.51,
    ],
    melodyNotes: [440.00, 523.25, 587.33, 523.25, 659.25, 587.33, 493.88, 440.00, 392.00, 349.23, 440.00, 523.25],
    collectibles: ['雨丝', '灯笼', '水泡', '小舟', '烟岚', '青苔', '涟漪'],
    collectibleEmojis: ['\u2614', '\u{1F3EE}', '\u{1FAE7}', '\u26F5', '\u{1F32B}\uFE0F', '\u{1F33F}', '\u{1F4A6}'],
  },
  moon: {
    id: 'moon',
    name: '月·桂花庭',
    nameEn: 'Moon Osmanthus',
    description: '在桂香月色中拾取银辉与花影',
    bgImage: asset('themes/moon-bg.jpg'),
    bgGradient: 'linear-gradient(180deg, #12102a 0%, #2a2048 50%, #3a3058 100%)',
    particleColors: ['#D8C8A8', '#C0B0D0', '#E8DCC0', '#A898C0', '#F0E8D0', '#B8A8C8'],
    accentColor: '#D0C0A0',
    pentatonicScale: [
      174.61, 196.00, 220.00, 261.63, 293.66,
      349.23, 392.00, 440.00, 523.25, 587.33,
      698.46, 783.99, 880.00, 1046.50,
    ],
    melodyNotes: [349.23, 440.00, 523.25, 440.00, 587.33, 523.25, 392.00, 349.23, 293.66, 261.63, 349.23, 440.00],
    collectibles: ['满月', '桂花', '玉兔', '烛火', '云纱', '新月', '银辉'],
    collectibleEmojis: ['\u{1F315}', '\u{1F33C}', '\u{1F430}', '\u{1F56F}\uFE0F', '\u2601\uFE0F', '\u{1F319}', '\u{1F4AB}'],
  },
  desert: {
    id: 'desert',
    name: '沙·星漠',
    nameEn: 'Star Desert',
    description: '在星空沙漠中追逐流沙与蜃楼',
    bgImage: asset('themes/desert-bg.jpg'),
    bgGradient: 'linear-gradient(180deg, #120e28 0%, #2a1e38 50%, #4a3020 100%)',
    particleColors: ['#C8A878', '#A88860', '#D4B890', '#8A7060', '#E0C8A0', '#B09878'],
    accentColor: '#C8A878',
    pentatonicScale: [
      155.56, 174.61, 207.65, 233.08, 277.18,
      311.13, 349.23, 415.30, 466.16, 554.37,
      622.25, 698.46, 830.61, 932.33,
    ],
    melodyNotes: [311.13, 392.00, 466.16, 392.00, 554.37, 466.16, 349.23, 311.13, 277.18, 233.08, 311.13, 392.00],
    collectibles: ['沙丘', '仙人掌', '星砂', '风纹', '驼铃', '蜃楼', '残阳'],
    collectibleEmojis: ['\u{1F3DC}\uFE0F', '\u{1F335}', '\u{1FAA8}', '\u{1F32C}\uFE0F', '\u{1F6F8}', '\u{1F42A}', '\u{1F307}'],
  },
  lake: {
    id: 'lake',
    name: '湖·睡莲',
    nameEn: 'Night Lilies',
    description: '静看睡莲浮于星湖，拾取镜中倒影',
    bgImage: asset('themes/lake-bg.jpg'),
    bgGradient: 'linear-gradient(180deg, #0a1828 0%, #143040 50%, #1a4850 100%)',
    particleColors: ['#6A98A0', '#88B0A8', '#D0B8C0', '#5A8890', '#A8C8C0', '#C8A8B0'],
    accentColor: '#78A8A8',
    pentatonicScale: [
      185.00, 207.65, 233.08, 277.18, 311.13,
      370.00, 415.30, 466.16, 554.37, 622.25,
      740.00, 830.61, 932.33, 1108.73,
    ],
    melodyNotes: [370.00, 466.16, 554.37, 466.16, 622.25, 554.37, 415.30, 370.00, 311.13, 277.18, 370.00, 466.16],
    collectibles: ['睡莲', '锦鲤', '芦苇', '月影', '水鸭', '湖光', '浮萍'],
    collectibleEmojis: ['\u{1FAB7}', '\u{1F41F}', '\u{1F33E}', '\u{1FA9E}', '\u{1F986}', '\u{1F48E}', '\u{1F40C}'],
  },
};

export function getThemeList(): ThemeConfig[] {
  return THEME_ORDER.map((id) => themes[id]).filter(Boolean);
}

// Get daily variation based on date
// particleShape is theme-locked (watercolor language)
export function getDailyVariation(themeId: string): {
  colorShift: number;
  particleShape: 'petal' | 'orb' | 'leaf' | 'crystal' | 'mist' | 'moon' | 'sand' | 'ripple';
  specialEvent: string | null;
  collectibleIndex: number;
} {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const dayOfWeek = today.getDay();

  const themeShape: Record<string, 'petal' | 'orb' | 'leaf' | 'crystal' | 'mist' | 'moon' | 'sand' | 'ripple'> = {
    spring: 'petal',
    summer: 'orb',
    autumn: 'leaf',
    winter: 'crystal',
    rain: 'mist',
    moon: 'moon',
    desert: 'sand',
    lake: 'ripple',
  };
  const particleShape = themeShape[themeId] ?? 'petal';

  const theme = themes[themeId];
  const collectibleIndex = dayOfYear % (theme?.collectibles.length || 7);

  let specialEvent: string | null = null;
  if (dayOfWeek === 0) specialEvent = 'meteor_shower';
  if (dayOfYear % 7 === 0) specialEvent = 'double_collect';

  return {
    colorShift: (dayOfYear * 37) % 360,
    particleShape,
    specialEvent,
    collectibleIndex,
  };
}
