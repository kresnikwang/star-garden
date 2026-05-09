# 星夜花园 - 治愈小游戏 (Enhanced)

## Design
- **Design References**: Dreamy night sky particle effects, soft glowing flowers, seasonal nature themes
- **Color Palette**: 
  - Spring: #FFB7C5 (cherry blossom), #98D8C8 (fresh green), #F7DC6F (warm yellow)
  - Summer: #5DADE2 (ocean blue), #48C9B0 (tropical green), #F39C12 (sunset orange)
  - Autumn: #E74C3C (maple red), #F39C12 (golden), #8E44AD (twilight purple)
  - Winter: #AED6F1 (ice blue), #D5DBDB (silver), #2C3E50 (deep night)
- **Typography**: Rounded, soft fonts - system default with fallback to sans-serif
- **Key Styles**: Full-screen canvas, glowing particles, soft gradients, floating animations

## Development Tasks
- [x] Create todo.md and generate theme background images
- [x] Create main game canvas component with particle system (fireworks + flowers)
- [x] Implement Web Audio API music system (pentatonic scale notes + background melody)
- [x] Create theme selection page with 4 seasonal themes
- [x] Implement daily variation system (date-based changes)
- [x] Create collection/progress system with localStorage
- [x] Build full app with routing and state management
- [x] Run lint and build checks
- [x] Add gesture system (swipe trails, long-press charge firework, circle nebula, pinch)
- [x] Add growth/unlock system with levels and progressive unlocks
- [x] Add breathing guide mode with rhythm rewards
- [x] Add share/screenshot feature for achievements
- [x] Update Game.tsx to integrate all new systems
- [x] Run lint and build checks for new features

## Architecture
- `src/pages/Index.tsx` - Theme selection page
- `src/pages/Game.tsx` - Main game canvas page
- `src/components/ParticleCanvas.tsx` - Canvas particle rendering engine (enhanced with gestures)
- `src/lib/audio-engine.ts` - Web Audio API sound system
- `src/lib/themes.ts` - Theme configurations and daily variations
- `src/lib/collection.ts` - Collection progress management (enhanced with levels)
- `src/lib/growth-system.ts` - NEW: Growth/unlock/level system
- `src/components/BreathingGuide.tsx` - NEW: Breathing guide overlay
- `src/components/ShareCard.tsx` - NEW: Share screenshot card