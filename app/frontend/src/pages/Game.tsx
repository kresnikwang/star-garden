import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticleCanvas } from '@/components/ParticleCanvas';
import type { GestureEvent } from '@/components/ParticleCanvas';
import { BreathingGuide } from '@/components/BreathingGuide';
import { ShareCard } from '@/components/ShareCard';
import { AudioEngine } from '@/lib/audio-engine';
import { themes, getDailyVariation } from '@/lib/themes';
import { getCollection, addCollectible, getSelectedTheme } from '@/lib/collection';
import type { CollectionProgress } from '@/lib/collection';
import {
  getGrowthState,
  addXP,
  discoverHidden,
  saveGrowthState,
  getNextUnlock,
  GESTURES,
  isGestureUnlocked,
} from '@/lib/growth-system';
import type { GrowthState } from '@/lib/growth-system';
import { checkComboStatus } from '@/lib/combo-effects';

export default function Game() {
  const navigate = useNavigate();
  const themeId = getSelectedTheme() || 'spring';
  const theme = themes[themeId];
  const dailyVariation = getDailyVariation(themeId);

  const [collection, setCollection] = useState<CollectionProgress>(() =>
    getCollection(themeId)
  );
  const [growth, setGrowth] = useState<GrowthState>(() => getGrowthState(themeId));
  const [clickCount, setClickCount] = useState(0);
  const [showCollect, setShowCollect] = useState<{ emoji: string; x: number; y: number } | null>(null);
  const [melodyActive, setMelodyActive] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null);
  const [unlockMsg, setUnlockMsg] = useState<string | null>(null);
  const [discoveryMsg, setDiscoveryMsg] = useState<string | null>(null);

  const audioRef = useRef<AudioEngine | null>(null);
  const melodyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize audio engine
  useEffect(() => {
    audioRef.current = new AudioEngine();
    return () => {
      audioRef.current?.destroy();
    };
  }, []);

  // Start melody after 30 seconds of play
  useEffect(() => {
    if (clickCount >= 5 && !melodyActive) {
      melodyTimerRef.current = setTimeout(() => {
        audioRef.current?.startMelody(theme);
        setMelodyActive(true);
      }, 30000);
    }
    return () => {
      if (melodyTimerRef.current) clearTimeout(melodyTimerRef.current);
    };
  }, [clickCount, melodyActive, theme]);

  // Auto-hide UI after 4 seconds
  useEffect(() => {
    if (showUI) {
      const timer = setTimeout(() => setShowUI(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showUI]);

  // Check for night owl discovery
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5 && !growth.hiddenDiscoveries.includes('night_owl')) {
      const updated = discoverHidden(themeId, growth, 'night_owl');
      setGrowth(updated);
      showDiscovery('🦉 发现彩蛋：夜行者');
    }
  }, []);

  const showDiscovery = (msg: string) => {
    setDiscoveryMsg(msg);
    setTimeout(() => setDiscoveryMsg(null), 3000);
  };

  const handleGesture = useCallback(
    (event: GestureEvent) => {
      audioRef.current?.init();

      let xpGain = 1;
      let updatedGrowth = { ...growth };

      switch (event.type) {
        case 'tap': {
          // Use Y-position to map to 14 notes for richer sound
          audioRef.current?.playNoteByPosition(theme, event.y, window.innerHeight);
          // Audio linkage: collectible sound layers
          if (Object.keys(collection.collected).length > 0) {
            audioRef.current?.playCollectibleLayers(theme, collection.collected);
          }
          xpGain = 1;
          break;
        }
        case 'swipe': {
          xpGain = 2;
          updatedGrowth.totalSwipes += 1;
          // Discovery: first swipe
          if (!updatedGrowth.hiddenDiscoveries.includes('first_swipe')) {
            updatedGrowth = discoverHidden(themeId, updatedGrowth, 'first_swipe');
            showDiscovery('🌈 发现彩蛋：初次光轨');
          }
          // Discovery: 50 swipes
          if (updatedGrowth.totalSwipes >= 50 && !updatedGrowth.hiddenDiscoveries.includes('rainbow_trail')) {
            updatedGrowth = discoverHidden(themeId, updatedGrowth, 'rainbow_trail');
            showDiscovery('🌈 发现彩蛋：彩虹轨迹');
          }
          audioRef.current?.playNoteByPosition(theme, event.y, window.innerHeight);
          break;
        }
        case 'longpress': {
          const chargeTime = event.data?.chargeTime || 0;
          xpGain = Math.floor(3 + chargeTime / 1000);
          updatedGrowth.totalLongPress += 1;
          // Discovery: big firework (3+ seconds)
          if (chargeTime >= 3000 && !updatedGrowth.hiddenDiscoveries.includes('big_firework')) {
            updatedGrowth = discoverHidden(themeId, updatedGrowth, 'big_firework');
            showDiscovery('🎆 发现彩蛋：超级烟花');
          }
          // Stop charge sound and play explosion
          audioRef.current?.stopChargeSound();
          audioRef.current?.playExplosionSound(theme);
          // Audio linkage: collectible sound layers on explosion
          if (Object.keys(collection.collected).length > 0) {
            audioRef.current?.playCollectibleLayers(theme, collection.collected);
          }
          break;
        }
        case 'circle': {
          xpGain = 5;
          updatedGrowth.totalCircles += 1;
          // Discovery: first nebula
          if (!updatedGrowth.hiddenDiscoveries.includes('nebula_born')) {
            updatedGrowth = discoverHidden(themeId, updatedGrowth, 'nebula_born');
            showDiscovery('🌌 发现彩蛋：星云诞生');
          }
          // Discovery: 10 nebulas
          if (updatedGrowth.totalCircles >= 10 && !updatedGrowth.hiddenDiscoveries.includes('galaxy_maker')) {
            updatedGrowth = discoverHidden(themeId, updatedGrowth, 'galaxy_maker');
            showDiscovery('⭐ 发现彩蛋：造星者');
          }
          audioRef.current?.playNoteByPosition(theme, event.y, window.innerHeight);
          break;
        }
        case 'pinch': {
          xpGain = 3;
          updatedGrowth.totalPinches += 1;
          break;
        }
        case 'combo_triple_tap': {
          xpGain = 8;
          updatedGrowth.totalCombos += 1;
          audioRef.current?.playExplosionSound(theme);
          if (Object.keys(collection.collected).length > 0) {
            audioRef.current?.playCollectibleLayers(theme, collection.collected);
          }
          // Check for combo tier sound
          const tripleCombo = checkComboStatus(themeId, collection.collected);
          if (tripleCombo) {
            audioRef.current?.playComboSound(theme, tripleCombo.tier);
          }
          break;
        }
        case 'combo_circle_pinch': {
          xpGain = 10;
          updatedGrowth.totalCombos += 1;
          audioRef.current?.playExplosionSound(theme);
          if (Object.keys(collection.collected).length > 0) {
            audioRef.current?.playCollectibleLayers(theme, collection.collected);
          }
          const circleCombo = checkComboStatus(themeId, collection.collected);
          if (circleCombo) {
            audioRef.current?.playComboSound(theme, circleCombo.tier);
          }
          break;
        }
        case 'combo_dual_press': {
          xpGain = 10;
          updatedGrowth.totalCombos += 1;
          audioRef.current?.playNoteByPosition(theme, event.y, window.innerHeight);
          break;
        }
      }

      // Discovery: combo master (5 combos)
      if (updatedGrowth.totalCombos >= 5 && !updatedGrowth.hiddenDiscoveries.includes('combo_master')) {
        updatedGrowth = discoverHidden(themeId, updatedGrowth, 'combo_master');
        showDiscovery('⚡ 发现彩蛋：组合大师');
      }

      // Add XP
      const { state: afterXP, leveledUp, newUnlocks } = addXP(themeId, updatedGrowth, xpGain);
      setGrowth(afterXP);

      if (leveledUp) {
        setLevelUpMsg(`🎉 升级到 Lv.${afterXP.level}!`);
        setTimeout(() => setLevelUpMsg(null), 3000);
      }

      if (newUnlocks.length > 0) {
        setUnlockMsg(`✨ 解锁新手势：${newUnlocks.join(', ')}`);
        setTimeout(() => setUnlockMsg(null), 4000);
      }

      // Update click count and collection
      const newCount = clickCount + 1;
      setClickCount(newCount);

        // Collect every 20 interactions (slower pace)
      // Last 2 items require 'theme_complete' discovery (collect all first 5)
      if (newCount % 20 === 0) {
        const baseIndex = Math.floor(((newCount - 1) / 20)) % theme.collectibleEmojis.length;
        const maxIndex = afterXP.hiddenDiscoveries.includes('theme_complete')
          ? theme.collectibleEmojis.length
          : 5;
        const emojiIndex = baseIndex % maxIndex;
        const emoji = theme.collectibleEmojis[emojiIndex];
        const updated = addCollectible(collection, emoji);
        setCollection(updated);
        setShowCollect({ emoji, x: event.x, y: event.y });
        setTimeout(() => setShowCollect(null), 1500);

        // Show collectible fusion hint
        const effectName = theme.collectibles[emojiIndex];
        setTimeout(() => {
          showDiscovery(`${emoji} ${effectName}已融入烟花！`);
        }, 1600);

        // Check for combo tier unlocks
        const comboStatus = checkComboStatus(themeId, updated.collected);
        const prevCombo = checkComboStatus(themeId, collection.collected);
        if (comboStatus && comboStatus.tier === 'base' && (!prevCombo || prevCombo.tier !== 'base')) {
          // Just unlocked base combo (5 unique items)
          setTimeout(() => {
            showDiscovery('组合特效已解锁！烟花将展现主题华彩！');
            audioRef.current?.playComboSound(theme, 'base');
          }, 3200);
        } else if (comboStatus && comboStatus.tier === 'ultimate' && (!prevCombo || prevCombo.tier !== 'ultimate')) {
          // Just unlocked ultimate combo (7 unique items)
          setTimeout(() => {
            showDiscovery('终极特效已解锁！集齐所有道具，烟花大师！');
            audioRef.current?.playComboSound(theme, 'ultimate');
          }, 3200);
        }

        // Discovery: collector (20 items total)
        const totalItems = Object.values(updated.collected).reduce((s, c) => s + c, 0);
        if (totalItems >= 20 && !afterXP.hiddenDiscoveries.includes('collector')) {
          const discoveredState = discoverHidden(themeId, afterXP, 'collector');
          setGrowth(discoveredState);
          showDiscovery('🏆 发现彩蛋：收藏家');
        }

        // Discovery: theme_complete — all available items collected
        const checkEmojis = afterXP.hiddenDiscoveries.includes('theme_complete')
          ? theme.collectibleEmojis
          : theme.collectibleEmojis.slice(0, 5);
        const allCollected = checkEmojis.every(e => (updated.collected[e] || 0) >= 1);
        if (allCollected && !afterXP.hiddenDiscoveries.includes('theme_complete')) {
          const discoveredState = discoverHidden(themeId, afterXP, 'theme_complete');
          setGrowth(discoveredState);
          showDiscovery('🎑 发现彩蛋：四季收藏家');
        }
      }

      setShowUI(true);
    },
    [clickCount, collection, theme, growth]
  );

  const handleBreathingComplete = useCallback(() => {
    setShowBreathing(false);
    const updated = { ...growth };
    updated.breathingSessions += 1;
    saveGrowthState(themeId, updated);

    // Bonus XP for breathing
    const { state: afterXP, leveledUp } = addXP(themeId, updated, 10);
    setGrowth(afterXP);

    if (leveledUp) {
      setLevelUpMsg(`🎉 升级到 Lv.${afterXP.level}!`);
      setTimeout(() => setLevelUpMsg(null), 3000);
    }

    // Discovery: breath master
    if (afterXP.breathingSessions >= 3 && !afterXP.hiddenDiscoveries.includes('breath_master')) {
      const discoveredState = discoverHidden(themeId, afterXP, 'breath_master');
      setGrowth(discoveredState);
      showDiscovery('🧘 发现彩蛋：呼吸大师');
    }

    setShowCollect({ emoji: '🧘', x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setTimeout(() => setShowCollect(null), 1500);
  }, [growth]);

  const totalCollected = Object.values(collection.collected).reduce(
    (sum, count) => sum + count,
    0
  );

  const nextUnlock = getNextUnlock(growth);
  const xpProgress = growth.xp / growth.xpToNext;

  return (
    <div className="relative w-full h-screen overflow-hidden select-none">
      {/* Background gradient fallback - always visible behind canvas */}
      <div
        className="fixed inset-0 z-0"
        style={{ background: theme.bgGradient }}
      />
      {/* Particle Canvas */}
      <ParticleCanvas
        theme={theme}
        growth={growth}
        collection={collection}
        onGesture={handleGesture}
        onChargeStart={() => {
          audioRef.current?.init();
          audioRef.current?.startChargeSound(theme);
        }}
        onChargeEnd={() => {
          audioRef.current?.stopChargeSound();
        }}
        onSwipeStart={(y: number) => {
          audioRef.current?.init();
          audioRef.current?.startSwipeSound(theme, y, window.innerHeight);
        }}
        onSwipeMove={(y: number) => {
          audioRef.current?.updateSwipeSound(y, window.innerHeight, theme);
        }}
        onSwipeEnd={() => {
          audioRef.current?.stopSwipeSound();
        }}
        onPinchStart={(scale: number, cx: number, cy: number) => {
          audioRef.current?.startPinchSound(theme, scale);
        }}
        onPinchMove={(scale: number) => {
          audioRef.current?.updatePinchSound(theme, scale);
        }}
        onPinchEnd={() => {
          audioRef.current?.stopPinchSound();
        }}
      />

      {/* Top UI */}
      <div
        className={`fixed top-0 left-0 right-0 z-10 p-4 transition-opacity duration-500 ${
          showUI ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
          >
            ←
          </button>
          <div className="text-center">
            <p className="text-white/60 text-xs">{theme.name}</p>
            <div className="flex items-center gap-2 justify-center mt-1">
              <span className="text-white/80 text-xs font-medium">Lv.{growth.level}</span>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${xpProgress * 100}%`, backgroundColor: theme.accentColor }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/garden')}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors text-sm"
              title="我的花园"
            >
              🌿
            </button>
            <button
              onClick={() => setShowBreathing(true)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors text-sm"
            >
              🧘
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors text-sm"
            >
              📤
            </button>
          </div>
        </div>
      </div>

      {/* Bottom UI */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-10 p-6 text-center transition-opacity duration-500 ${
          showUI ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Gesture hints */}
        <div className="flex justify-center gap-3 mb-3 flex-wrap">
          {GESTURES.map((gesture) => {
            const unlocked = isGestureUnlocked(growth, gesture.id);
            return (
              <div
                key={gesture.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  unlocked
                    ? 'bg-white/10 text-white/70'
                    : 'bg-white/5 text-white/20'
                }`}
                title={unlocked ? gesture.description : `Lv.${gesture.unlockLevel} 解锁`}
              >
                <span>{gesture.icon}</span>
                <span className="hidden sm:inline">{gesture.name}</span>
                {!unlocked && <span>🔒</span>}
              </div>
            );
          })}
        </div>

        {nextUnlock && (
          <p className="text-white/40 text-xs mb-2">
            下一个解锁：Lv.{nextUnlock.unlockLevel} {nextUnlock.icon} {nextUnlock.name}
          </p>
        )}

        <p className="text-white/50 text-xs">
          🔥 连续{collection.streakDays}天 · 收集 {totalCollected} · 发现 {growth.hiddenDiscoveries.length}/10 彩蛋
          {growth.totalCombos > 0 && ` · 组合技 ${growth.totalCombos}`}
        </p>

        {melodyActive && (
          <p className="text-white/30 text-xs mt-1">🎵 背景旋律已加入</p>
        )}

        {/* Collection display */}
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {theme.collectibleEmojis.map((emoji, i) => (
            <span
              key={i}
              className={`text-lg ${
                collection.collected[emoji]
                  ? 'opacity-100'
                  : 'opacity-30 grayscale'
              }`}
              title={`${theme.collectibles[i]}: ${collection.collected[emoji] || 0}`}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Level up notification */}
      {levelUpMsg && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 text-white text-lg font-medium shadow-lg border border-white/20">
            {levelUpMsg}
          </div>
        </div>
      )}

      {/* Unlock notification */}
      {unlockMsg && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 z-30 animate-pulse">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 text-white text-sm shadow-lg border border-white/20">
            {unlockMsg}
          </div>
        </div>
      )}

      {/* Discovery notification */}
      {discoveryMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-yellow-500/20 backdrop-blur-md rounded-full px-5 py-2 text-white text-sm border border-yellow-500/30 animate-pulse">
            {discoveryMsg}
          </div>
        </div>
      )}

      {/* Collectible popup */}
      {showCollect && (
        <div
          className="fixed z-20 pointer-events-none animate-bounce"
          style={{ left: showCollect.x - 20, top: showCollect.y - 40 }}
        >
          <div className="text-4xl animate-pulse">{showCollect.emoji}</div>
          <p className="text-white/80 text-xs text-center mt-1">+1</p>
        </div>
      )}

      {/* Special event indicator */}
      {dailyVariation.specialEvent && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1 text-white/70 text-xs">
            {dailyVariation.specialEvent === 'meteor_shower'
              ? '✨ 今日特别：流星雨加倍'
              : '🎁 今日特别：双倍收集'}
          </div>
        </div>
      )}

      {/* Breathing Guide */}
      {showBreathing && (
        <BreathingGuide
          accentColor={theme.accentColor}
          onComplete={handleBreathingComplete}
          onClose={() => setShowBreathing(false)}
        />
      )}

      {/* Share Card */}
      {showShare && (
        <ShareCard
          theme={theme}
          growth={growth}
          collection={collection}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}