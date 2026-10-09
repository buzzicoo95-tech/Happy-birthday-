import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Camera, ArrowRight, Heart } from 'lucide-react';
import { MemoryItem } from '../types';
import { sound } from '../utils/sound';

interface MemoriesSlideshowProps {
  memories: MemoryItem[];
  onContinue: () => void;
}

export const MemoriesSlideshow: React.FC<MemoriesSlideshowProps> = ({
  memories,
  onContinue
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const validMemories = memories.filter((_, idx) => !failedImages.has(idx));

  if (validMemories.length === 0) {
    return null;
  }

  const handleNext = () => {
    sound.playClick();
    setCurrentIndex(prev => (prev + 1) % validMemories.length);
  };

  const handlePrev = () => {
    sound.playClick();
    setCurrentIndex(prev => (prev - 1 + validMemories.length) % validMemories.length);
  };

  const current = validMemories[currentIndex] || validMemories[0];

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 text-center select-none">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] mb-2 shadow-xs">
          <Camera className="w-3.5 h-3.5 text-[#E889AD]" />
          Precious Moments
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold">
          Our Favorite Memories 📸
        </h2>
        <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mt-1">
          A glimpse into the special journey we share
        </p>
      </motion.div>

      {/* Polaroid Slide Card with Pink Frame */}
      <div className="relative my-4 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.94, rotate: -1.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.94, rotate: 1.5 }}
            transition={{ duration: 0.4 }}
            className="bg-white border-4 border-[#F8C8DC] rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(232,137,173,0.28)] relative"
          >
            {/* Heart Decoration in top corner */}
            <div className="absolute -top-3.5 -right-2 z-10 w-8 h-8 rounded-full bg-[#FDE8F1] border-2 border-[#F8C8DC] flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 text-[#E889AD] fill-[#E889AD]" />
            </div>

            {/* Image Frame */}
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-[#FDE8F1] border border-[#F8C8DC]/60">
              <img
                src={current.image}
                alt={current.caption}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={() => {
                  setFailedImages(prev => new Set(prev).add(currentIndex));
                }}
              />
              {current.date && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#5A3D4A] backdrop-blur-md border border-[#F8C8DC] shadow-xs">
                  {current.date}
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="mt-4 px-2 text-left">
              <p className="text-sm sm:text-base font-serif text-[#5A3D4A] italic leading-snug">
                "{current.caption}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Arrow Controls */}
        {validMemories.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous memory"
              className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#5A3D4A] flex items-center justify-center border border-[#F8C8DC] shadow-md transition-transform active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-[#E889AD]" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next memory"
              className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#5A3D4A] flex items-center justify-center border border-[#F8C8DC] shadow-md transition-transform active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-[#E889AD]" />
            </button>
          </>
        )}
      </div>

      {/* Pagination dots */}
      {validMemories.length > 1 && (
        <div className="flex justify-center gap-1.5 my-4">
          {validMemories.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-[#E889AD]' : 'w-2 bg-[#F8C8DC]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Continue button */}
      <div className="mt-8">
        <button
          onClick={() => {
            sound.playClick();
            onContinue();
          }}
          className="px-9 py-4 rounded-full font-bold text-sm sm:text-base text-white btn-pink-gradient shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
        >
          <span>The Big Birthday Reveal 🎉</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
