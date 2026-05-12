import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { themes } from '@/lib/themes';
import { getCollection, setSelectedTheme, getSelectedTheme } from '@/lib/collection';

export default function Index() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(getSelectedTheme());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (themeId: string) => {
    setSelectedId(themeId);
  };

  const handleStart = () => {
    if (selectedId) {
      setSelectedTheme(selectedId);
      navigate('/game');
    }
  };

  const themeList = Object.values(themes);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a2e] via-[#1a1a3e] to-[#2a1a4e] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-bold text-white/90 mb-2 tracking-wider">
          星夜花园
        </h1>
        <p className="text-white/50 text-sm">选择你的治愈旅程</p>
      </div>

      {/* Theme Selection Grid */}
      <div className="grid grid-cols-2 gap-4 max-w-sm w-full z-10 mb-8">
        {themeList.map((theme) => {
          const collection = getCollection(theme.id);
          const totalCollected = Object.values(collection.collected).reduce(
            (sum, count) => sum + count,
            0
          );
          const isSelected = selectedId === theme.id;
          const isHovered = hoveredId === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              onMouseEnter={() => setHoveredId(theme.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-white/60 scale-105 shadow-lg shadow-white/10'
                  : 'ring-1 ring-white/10 hover:ring-white/30'
              } ${isHovered && !isSelected ? 'scale-[1.02]' : ''}`}
            >
              {/* Background image */}
              <img
                src={theme.bgImage}
                alt={theme.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <h3 className="text-white font-medium text-sm">{theme.name}</h3>
                <p className="text-white/50 text-[10px] mt-0.5 line-clamp-2">
                  {theme.description}
                </p>
                {totalCollected > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-white/40">
                      已收集 {totalCollected}
                    </span>
                    <span className="text-xs">
                      {theme.collectibleEmojis[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={!selectedId}
        className={`z-10 px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
          selectedId
            ? 'bg-white/15 backdrop-blur-md text-white border border-white/20 hover:bg-white/25 hover:scale-105 active:scale-95'
            : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
        }`}
      >
        {selectedId ? '开始治愈之旅 ✨' : '请选择一个主题'}
      </button>

      {/* Garden button */}
      <button
        onClick={() => navigate('/garden')}
        className="z-10 mt-4 px-5 py-2 rounded-full text-xs bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60 transition-all duration-300"
      >
        查看花园
      </button>

      {/* Continue hint */}
      {selectedId && getCollection(selectedId).totalClicks > 0 && (
        <p className="text-white/30 text-xs mt-3 z-10">
          继续你的{themes[selectedId].name}之旅
        </p>
      )}
    </div>
  );
}