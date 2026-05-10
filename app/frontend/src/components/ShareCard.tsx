import { useRef, useEffect, useState } from 'react';
import { GrowthState, GESTURES } from '@/lib/growth-system';
import { ThemeConfig } from '@/lib/themes';
import { CollectionProgress } from '@/lib/collection';

interface ShareCardProps {
  theme: ThemeConfig;
  growth: GrowthState;
  collection: CollectionProgress;
  onClose: () => void;
}

export function ShareCard({ theme, growth, collection, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const totalCollected = Object.values(collection.collected).reduce(
    (sum, count) => sum + count,
    0
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const w = 360;
    const h = 640;
    canvas.width = w;
    canvas.height = h;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.5, '#1a1a3e');
    grad.addColorStop(1, '#2a1a4e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (let i = 0; i < 80; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
      ctx.fill();
    }

    // Decorative particles — glow via pre-rendered sprite (no shadowBlur)
    const colors = theme.particleColors;
    const glowCache = new Map<string, HTMLCanvasElement>();
    const getGlowSprite = (color: string, radius: number): HTMLCanvasElement => {
      const key = `${color}|${radius}`;
      if (glowCache.has(key)) return glowCache.get(key)!;
      const d = Math.ceil(radius * 2) + 2;
      const c = document.createElement('canvas');
      c.width = d;
      c.height = d;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(d / 2, d / 2, 0, d / 2, d / 2, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(0.4, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(d / 2, d / 2, radius, 0, Math.PI * 2);
      g.fill();
      glowCache.set(key, c);
      return c;
    };

    for (let i = 0; i < 30; i++) {
      const px = w * 0.2 + Math.random() * w * 0.6;
      const py = h * 0.15 + Math.random() * h * 0.3;
      const pr = 2 + Math.random() * 4;
      const pColor = colors[i % colors.length];

      // Glow halo via sprite
      const sprite = getGlowSprite(pColor, 10 + pr);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(sprite, px - sprite.width / 2, py - sprite.height / 2);
      ctx.globalAlpha = 1;

      // Core
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = pColor + '60';
      ctx.fill();
    }

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('星夜花园', w / 2, 80);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px sans-serif';
    ctx.fillText(theme.name, w / 2, 110);

    // Level badge
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(`Lv.${growth.level}`, w / 2, h * 0.45);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px sans-serif';
    ctx.fillText(`已解锁 ${growth.unlockedGestures.length}/${GESTURES.length} 种手势`, w / 2, h * 0.45 + 35);

    // Stats
    const statsY = h * 0.58;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px sans-serif';

    const stats = [
      `🔥 连续 ${collection.streakDays} 天`,
      `✨ 收集 ${totalCollected} 件`,
      `🧘 呼吸 ${growth.breathingSessions} 次`,
      `🌌 发现 ${growth.hiddenDiscoveries.length} 个彩蛋`,
    ];

    stats.forEach((stat, i) => {
      ctx.fillText(stat, w / 2, statsY + i * 28);
    });

    // Unlocked gestures
    const gestureY = h * 0.78;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px sans-serif';
    ctx.fillText('已解锁手势', w / 2, gestureY);

    const gestureEmojis = growth.unlockedGestures
      .map(id => GESTURES.find(g => g.id === id)?.icon || '')
      .join('  ');
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(gestureEmojis, w / 2, gestureY + 30);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px sans-serif';
    ctx.fillText('来星夜花园，开启你的治愈之旅', w / 2, h - 30);

    // Generate image URL
    setImageUrl(canvas.toDataURL('image/png'));
  }, [theme, growth, collection, totalCollected]);

  const handleShare = async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'starry-garden-share.png', { type: 'image/png' });
        await navigator.share({
          title: '星夜花园',
          text: `我在星夜花园达到了 Lv.${growth.level}！已解锁 ${growth.unlockedGestures.length} 种手势 ✨`,
          files: [file],
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = 'starry-garden-share.png';
    link.href = imageUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="flex flex-col items-center gap-4 max-w-sm w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
        >
          ✕
        </button>

        {/* Preview */}
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
          <canvas ref={canvasRef} className="w-[280px] h-[497px]" />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm border border-white/20 hover:bg-white/25 transition-all"
          >
            保存图片 📥
          </button>
          {navigator.share && (
            <button
              onClick={handleShare}
              className="px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm border border-white/20 hover:bg-white/25 transition-all"
            >
              分享 🔗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}