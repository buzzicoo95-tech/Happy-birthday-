import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BackgroundFXProps {
  feeling?: string;
  heartRainOverride?: boolean | null;
}

interface RainHeart {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  char: string;
  opacity: number;
  blur?: boolean;
}

export const BackgroundFX: React.FC<BackgroundFXProps> = ({ feeling, heartRainOverride }) => {
  // Default to true (Heart Rain is ON by default), follow heartRainOverride if explicitly set
  const isHeartRainActive =
    typeof heartRainOverride === 'boolean'
      ? heartRainOverride
      : true;

  // Soft atmospheric pastel gradients based on feeling
  const moodGradient = useMemo(() => {
    switch (feeling) {
      case 'Grateful':
        return 'from-[#FFFFFF] via-[#FFF0F7] to-[#FCE6F1]';
      case 'Happy':
        return 'from-[#FFFFFF] via-[#FFF3F8] to-[#FDE8F2]';
      case 'Excited':
        return 'from-[#FFFFFF] via-[#FFF0F6] to-[#FCE4EC]';
      case 'Relaxed':
        return 'from-[#FFFFFF] via-[#FDF2F7] to-[#F8EAF2]';
      case 'A Little Sad':
        return 'from-[#FFFFFF] via-[#FAF0F5] to-[#F5E6EE]';
      case 'Amazing':
        return 'from-[#FFFFFF] via-[#FFF1F7] to-[#FDE8F1]';
      default:
        return 'from-[#FFFFFF] via-[#FFF5F9] to-[#FDE8F1]';
    }
  }, [feeling]);

  // Floating ambient particles (for standard background aura)
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: (i * 17) % 96 + 2,
      y: (i * 23) % 94 + 3,
      size: (i % 3 === 0 ? 16 : i % 2 === 0 ? 12 : 8),
      type: i % 4 === 0 ? 'heart' : i % 4 === 1 ? 'petal' : i % 4 === 2 ? 'sparkle' : 'bokeh',
      duration: 6 + (i % 6) * 1.5,
      delay: (i % 5) * 0.8
    }));
  }, []);

  // Romantic 'Heart Rain' particles cascading from top to bottom
  const heartRainDrops: RainHeart[] = useMemo(() => {
    const heartChars = ['💗', '💕', '💖', '❤️', '🌸', '✨'];
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: ((i * 19 + 7) % 96) + 2, // Well-distributed horizontally 2% - 98%
      size: 14 + ((i * 7) % 16),   // 14px to 30px
      duration: 5 + ((i * 3) % 4) * 0.9, // 5s to 7.7s gentle fall rate
      delay: ((i * 13) % 50) / 10,  // 0s to 4.9s staggered start
      char: heartChars[i % heartChars.length],
      opacity: 0.35 + ((i % 5) * 0.12), // 0.35 to 0.83
      blur: i % 7 === 0 // occasional gentle depth of field
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" style={{ zIndex: 0 }}>
      {/* Base Pure White + Soft Blush Pink Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-1000 ${moodGradient}`} />

      {/* Soft Bokeh Glow Orbs */}
      <div className="absolute -top-24 -left-20 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#F8C8DC]/35 blur-3xl animate-pulse-pink" />
      <div
        className="absolute top-1/3 -right-24 w-88 h-88 sm:w-[420px] sm:h-[420px] rounded-full bg-[#FDE8F1]/60 blur-3xl animate-pulse-pink"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute -bottom-28 left-1/4 w-96 h-96 rounded-full bg-[#F8C8DC]/30 blur-3xl animate-pulse-pink"
        style={{ animationDelay: '3.5s' }}
      />

      {/* Standard Floating Ambience Particles */}
      {particles.map(p => {
        if (p.type === 'heart') {
          return (
            <div
              key={p.id}
              className="absolute text-[#E889AD]/35 transition-transform"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: `${p.size + 4}px`,
                animation: `floatSlow ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`
              }}
            >
              💗
            </div>
          );
        }

        if (p.type === 'petal') {
          return (
            <div
              key={p.id}
              className="absolute text-[#F8C8DC]/45 transition-transform"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: `${p.size + 6}px`,
                animation: `floatGentle ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`
              }}
            >
              🌸
            </div>
          );
        }

        if (p.type === 'sparkle') {
          return (
            <div
              key={p.id}
              className="absolute text-[#D9A441]/40 transition-transform"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: `${p.size + 2}px`,
                animation: `floatSlow ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`
              }}
            >
              ✨
            </div>
          );
        }

        // Soft Bokeh dot
        return (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#F8C8DC]/40 blur-xs transition-opacity"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `floatSlow ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        );
      })}

      {/* ============================================================ */}
      {/* ROMANTIC 'HEART RAIN' OVERLAY FOR 'GRATEFUL' OR 'HAPPY' */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isHeartRainActive && (
          <motion.div
            key="heart-rain-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {/* Gentle romantic radiant bloom when Heart Rain is triggered */}
            <div className="absolute inset-0 bg-radial from-[#F8C8DC]/20 via-transparent to-transparent animate-pulse-pink" />

            {/* Cascading falling hearts */}
            {heartRainDrops.map(drop => (
              <div
                key={drop.id}
                className="absolute animate-heart-rain will-change-transform"
                style={{
                  left: `${drop.x}%`,
                  top: '-10%',
                  fontSize: `${drop.size}px`,
                  opacity: drop.opacity,
                  filter: drop.blur ? 'blur(1px)' : 'none',
                  animationDuration: `${drop.duration}s`,
                  animationDelay: `${drop.delay}s`
                }}
              >
                <span className="inline-block transform drop-shadow-sm select-none">
                  {drop.char}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle delicate white radial highlight */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-white/40" />
    </div>
  );
};
