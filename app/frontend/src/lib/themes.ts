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

export const themes: Record<string, ThemeConfig> = {
  spring: {
    id: 'spring',
    name: '\u6625\u00B7\u6A31\u82B1\u591C',
    nameEn: 'Spring Blossoms',
    description: '\u6536\u96C6\u98D8\u843D\u7684\u6A31\u82B1\u74E3\uFF0C\u7F16\u7EC7\u6625\u5929\u7684\u65CB\u5F8B',
    bgImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1071821/2026-05-08/oeowwjaaagnq/spring-theme-bg.png',
    bgGradient: 'linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 50%, #4a2040 100%)',
    particleColors: ['#FFB7C5', '#FF69B4', '#FFC0CB', '#FFE4E1', '#F8BBD9', '#FFD0D8'],
    accentColor: '#FFB7C5',
    // Two octaves pentatonic: C4-A4, C5-A5 + extra high notes
    pentatonicScale: [
      261.63, 293.66, 329.63, 392.00, 440.00,  // C4 D4 E4 G4 A4
      523.25, 587.33, 659.25, 783.99, 880.00,  // C5 D5 E5 G5 A5
      1046.50, 1174.66, 1318.51, 1567.98       // C6 D6 E6 G6
    ],
    melodyNotes: [523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 659.25, 523.25, 440.00, 392.00, 523.25, 659.25],
    collectibles: ['\u6A31\u82B1\u74E3', '\u82B1\u854A', '\u8774\u8776', '\u9732\u73E0', '\u82B1\u73AF', '\u6625\u98CE', '\u65B0\u82BD'],
    collectibleEmojis: ['\u{1F338}', '\u{1F33A}', '\u{1F98B}', '\u{1F4A7}', '\u{1F490}', '\u{1F343}', '\u{1F331}'],
  },
  summer: {
    id: 'summer',
    name: '\u590F\u00B7\u8424\u706B\u6D77',
    nameEn: 'Summer Fireflies',
    description: '\u6355\u6349\u590F\u591C\u7684\u8424\u706B\u866B\uFF0C\u70B9\u4EAE\u661F\u7A7A',
    bgImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1071821/2026-05-08/oeowx2iaagpq/summer-theme-bg.png',
    bgGradient: 'linear-gradient(180deg, #0a1628 0%, #1a3a4a 50%, #0d4f4f 100%)',
    particleColors: ['#5DADE2', '#48C9B0', '#F7DC6F', '#82E0AA', '#AED6F1', '#B3D9F0'],
    accentColor: '#48C9B0',
    // Two octaves: G3-E4, G4-E5 + high
    pentatonicScale: [
      196.00, 220.00, 246.94, 293.66, 329.63,  // G3 A3 B3 D4 E4
      392.00, 440.00, 493.88, 587.33, 659.25,  // G4 A4 B4 D5 E5
      783.99, 880.00, 987.77, 1174.66           // G5 A5 B5 D6
    ],
    melodyNotes: [392.00, 493.88, 587.33, 493.88, 659.25, 587.33, 440.00, 392.00, 329.63, 293.66, 392.00, 493.88],
    collectibles: ['\u8424\u706B\u866B', '\u6D77\u661F', '\u8D1D\u58F3', '\u73CA\u7469', '\u6C34\u6BCD', '\u6D77\u6D6A', '\u6930\u5B50'],
    collectibleEmojis: ['\u2728', '\u2B50', '\u{1F41A}', '\u{1FAB8}', '\u{1FABC}', '\u{1F30A}', '\u{1F965}'],
  },
  autumn: {
    id: 'autumn',
    name: '\u79CB\u00B7\u67AB\u53F6\u8C37',
    nameEn: 'Autumn Leaves',
    description: '\u6536\u96C6\u91D1\u8272\u67AB\u53F6\uFF0C\u8C31\u5199\u79CB\u65E5\u6696\u6B4C',
    bgImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1071821/2026-05-08/oeowv6iaagpa/autumn-theme-bg.png',
    bgGradient: 'linear-gradient(180deg, #1a0a2e 0%, #3d1f0a 50%, #5c2d0a 100%)',
    particleColors: ['#E74C3C', '#F39C12', '#F1C40F', '#E67E22', '#D35400', '#FFDBA8'],
    accentColor: '#F39C12',
    // Two octaves: D3-C4, D4-C5 + high
    pentatonicScale: [
      146.83, 164.81, 196.00, 220.00, 261.63,  // D3 E3 G3 A3 C4
      293.66, 329.63, 392.00, 440.00, 523.25,  // D4 E4 G4 A4 C5
      587.33, 659.25, 783.99, 880.00            // D5 E5 G5 A5
    ],
    melodyNotes: [293.66, 392.00, 440.00, 392.00, 523.25, 440.00, 329.63, 293.66, 261.63, 220.00, 293.66, 392.00],
    collectibles: ['\u67AB\u53F6', '\u677E\u679C', '\u6A61\u679C', '\u8611\u83C7', '\u5357\u74DC', '\u843D\u65E5', '\u6696\u8336'],
    collectibleEmojis: ['\u{1F341}', '\u{1F330}', '\u{1FAD2}', '\u{1F344}', '\u{1F383}', '\u{1F305}', '\u{1F375}'],
  },
  winter: {
    id: 'winter',
    name: '\u51AC\u00B7\u6781\u5149\u96EA',
    nameEn: 'Winter Aurora',
    description: '\u6536\u96C6\u96EA\u82B1\u7ED3\u6676\uFF0C\u5524\u9192\u6781\u5149\u4E4B\u821E',
    bgImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1071821/2026-05-08/oeowtlaaagoq/winter-theme-bg.png',
    bgGradient: 'linear-gradient(180deg, #0a0a2e 0%, #1a2a4a 50%, #0a3a5a 100%)',
    particleColors: ['#AED6F1', '#D5DBDB', '#85C1E9', '#D6EAF8', '#EBF5FB', '#D6EFF5'],
    accentColor: '#AED6F1',
    // Two octaves: C3-A3, C4-A4 + high
    pentatonicScale: [
      130.81, 146.83, 164.81, 196.00, 220.00,  // C3 D3 E3 G3 A3
      261.63, 293.66, 329.63, 392.00, 440.00,  // C4 D4 E4 G4 A4
      523.25, 587.33, 659.25, 783.99            // C5 D5 E5 G5
    ],
    melodyNotes: [261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 293.66, 261.63, 220.00, 196.00, 261.63, 329.63],
    collectibles: ['\u96EA\u82B1', '\u51B0\u6676', '\u6781\u5149', '\u96EA\u4EBA', '\u94C3\u94DB', '\u661F\u5149', '\u6696\u7089'],
    collectibleEmojis: ['\u2744\uFE0F', '\u{1F48E}', '\u{1F30C}', '\u26C4', '\u{1F514}', '\u{1F31F}', '\u{1F525}'],
  },
};

// Get daily variation based on date
export function getDailyVariation(themeId: string): {
  colorShift: number;
  particleShape: 'circle' | 'star' | 'flower' | 'heart';
  specialEvent: string | null;
  collectibleIndex: number;
} {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const dayOfWeek = today.getDay();

  const shapes: ('circle' | 'star' | 'flower' | 'heart')[] = ['circle', 'star', 'flower', 'heart'];
  const particleShape = shapes[dayOfYear % 4];

  const theme = themes[themeId];
  const collectibleIndex = dayOfYear % (theme?.collectibles.length || 7);

  // Special events on certain days
  let specialEvent: string | null = null;
  if (dayOfWeek === 0) specialEvent = 'meteor_shower'; // Sunday
  if (dayOfYear % 7 === 0) specialEvent = 'double_collect'; // Every 7 days

  return {
    colorShift: (dayOfYear * 37) % 360,
    particleShape,
    specialEvent,
    collectibleIndex,
  };
}