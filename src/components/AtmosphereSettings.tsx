import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Heart, X, Sparkles, RotateCcw, CloudRain } from 'lucide-react';
import { sound } from '../utils/sound';

interface AtmosphereSettingsProps {
  heartRainEnabled: boolean;
  onToggleHeartRain: () => void;
  onResetAuto?: () => void;
  isCustomOverride?: boolean;
  feeling?: string;
  className?: string;
}

export const AtmosphereSettings: React.FC<AtmosphereSettingsProps> = ({
  heartRainEnabled,
  onToggleHeartRain,
  onResetAuto,
  isCustomOverride,
  feeling,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when tapping outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleToggle = () => {
    sound.playPop();
    onToggleHeartRain();
  };

  const handleReset = () => {
    sound.playClick();
    if (onResetAuto) {
      onResetAuto();
    }
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Settings Header Icon Button */}
      <button
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen);
        }}
        aria-label="Atmosphere & Heart Rain Settings"
        title="Settings: Toggle Heart Rain"
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs text-[#5A3D4A] hover:text-[#E889AD] border transition-all active:scale-95 shadow-xs cursor-pointer ${
          isOpen
            ? 'border-[#E889AD] bg-white ring-2 ring-[#E889AD]/20'
            : 'bg-white/90 border-[#F8C8DC] hover:border-[#E889AD]'
        }`}
      >
        <Settings
          className={`w-3.5 h-3.5 text-[#E889AD] transition-transform duration-300 ${
            isOpen ? 'rotate-90 text-[#171717]' : ''
          }`}
        />
        <span className="hidden sm:inline font-bold text-[11px] text-[#171717]">Settings</span>
        {heartRainEnabled ? (
          <span className="text-[10px] animate-pulse" title="Heart Rain is Active">💕</span>
        ) : (
          <span className="text-[10px] opacity-40">🤍</span>
        )}
      </button>

      {/* Floating Settings Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-11 right-0 w-72 sm:w-80 bg-white/95 backdrop-blur-xl border-2 border-[#F8C8DC] rounded-3xl p-4 shadow-2xl shadow-[#E889AD]/25 text-left z-50"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F8C8DC]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FDE8F1] border border-[#F8C8DC] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#E889AD]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#171717]">
                    Visual Atmosphere
                  </h4>
                  <p className="text-[10px] text-[#5A3D4A]/70">
                    Control romantic animations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Settings"
                className="p-1 rounded-full text-[#5A3D4A]/60 hover:text-[#171717] hover:bg-[#FDE8F1] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Heart Rain Toggle Row */}
            <div className="bg-[#FDE8F1]/60 rounded-2xl p-3 border border-[#F8C8DC] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white border border-[#F8C8DC] flex items-center justify-center text-sm shadow-xs">
                  {heartRainEnabled ? '💖' : '🤍'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#171717]">
                      Heart Rain
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        heartRainEnabled
                          ? 'bg-[#E889AD] text-white'
                          : 'bg-white text-[#5A3D4A]/60 border border-[#F8C8DC]'
                      }`}
                    >
                      {heartRainEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5A3D4A]/70">
                    Cascading heart particles
                  </p>
                </div>
              </div>

              {/* iOS-style Pink Toggle Switch */}
              <button
                onClick={handleToggle}
                role="switch"
                aria-checked={heartRainEnabled}
                aria-label="Toggle Heart Rain"
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center border ${
                  heartRainEnabled
                    ? 'bg-[#E889AD] border-[#E889AD]'
                    : 'bg-[#F8C8DC]/60 border-[#F8C8DC]'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md flex items-center justify-center ${
                    heartRainEnabled ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <Heart
                    className={`w-3 h-3 ${
                      heartRainEnabled
                        ? 'text-[#E889AD] fill-[#E889AD]'
                        : 'text-slate-300'
                    }`}
                  />
                </motion.div>
              </button>
            </div>

            {/* Helper Info & Mode Indicator */}
            <div className="mt-3 pt-2 text-[10px] text-[#5A3D4A]/70 space-y-1.5 px-1 border-t border-[#F8C8DC]/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] text-[#5A3D4A]/80">
                  <CloudRain className="w-3 h-3 text-[#E889AD] shrink-0" />
                  <span>
                    {heartRainEnabled
                      ? 'Heart Rain is ON (Default) 💕'
                      : 'Heart Rain is paused 🤍'}
                  </span>
                </span>
                {isCustomOverride && onResetAuto && (
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-[#E889AD] hover:text-[#171717] font-bold underline cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
