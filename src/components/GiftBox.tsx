import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { sound } from '../utils/sound';
import { fireGoldenSparkle, fireCelebrationConfetti } from '../utils/confetti';

interface GiftBoxProps {
  recipientName: string;
  onOpened: () => void;
}

export const GiftBox: React.FC<GiftBoxProps> = ({ recipientName, onOpened }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [openingInProgress, setOpeningInProgress] = useState(false);

  const handleOpenGift = () => {
    if (isOpen || openingInProgress) return;
    setOpeningInProgress(true);
    sound.playClick();

    // Phase 1: Gentle shake and ribbon glow
    setIsShaking(true);

    setTimeout(() => {
      setIsShaking(false);
      setIsOpen(true);
      sound.playGiftFanfare();
      fireGoldenSparkle();
      fireCelebrationConfetti();

      // Phase 7: Transition to personal letter
      setTimeout(() => {
        onOpened();
      }, 2300);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center select-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
          A Magical Moment
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold">
          One last surprise...
        </h2>
        <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mt-1 max-w-xs mx-auto">
          Prepared exclusively with love for <span className="text-[#E889AD] font-semibold">{recipientName}</span>
        </p>
      </motion.div>

      {/* Interactive Pink Gift Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={handleOpenGift}
        className="relative cursor-pointer group select-none my-6 p-4"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleOpenGift();
        }}
      >
        {/* Soft Pink Aura Glow */}
        <motion.div
          animate={{
            scale: isOpen ? [1, 2.4, 3] : [1, 1.15, 1],
            opacity: isOpen ? [0.6, 1, 0.7] : [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: isOpen ? 1.5 : 3.5,
            repeat: isOpen ? 0 : Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-radial from-[#F8C8DC] via-[#FDE8F1]/60 to-transparent blur-3xl pointer-events-none"
        />

        {/* Radiating Light & Sparkles Burst */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0, rotate: 0, opacity: 0 }}
              animate={{ scale: 2.4, rotate: 180, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-80 h-80 rounded-full bg-radial from-white via-[#F8C8DC]/70 to-transparent blur-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Box Container with Shake Effect */}
        <motion.div
          animate={
            isShaking
              ? { x: [-5, 5, -5, 5, -2, 2, 0], rotate: [-2, 2, -2, 2, 0] }
              : { y: [0, -6, 0] }
          }
          transition={
            isShaking
              ? { duration: 0.5, ease: "easeInOut" }
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center"
        >
          {/* Lid */}
          <motion.div
            animate={
              isOpen
                ? { y: -110, rotate: -25, opacity: 0.1, scale: 1.15 }
                : { y: 0 }
            }
            transition={
              isOpen
                ? { duration: 1.2, ease: "easeOut" }
                : { duration: 0.3 }
            }
            className="absolute top-2 z-20 w-48 sm:w-56 h-14 rounded-2xl bg-gradient-to-r from-[#F7A8C4] via-[#F8C8DC] to-[#E889AD] shadow-xl border-t border-white/60 flex items-center justify-center overflow-hidden"
          >
            {/* White Glossy Ribbon horizontal */}
            <div className="absolute inset-x-0 h-4 bg-white shadow-xs" />
            {/* White Glossy Ribbon vertical */}
            <div className="absolute inset-y-0 w-8 bg-white shadow-xs" />

            {/* White Ribbon Bow on top */}
            <div className="absolute -top-3 z-30 flex items-center justify-center">
              <div className="relative w-12 h-8">
                <div className="absolute left-0 w-6 h-6 rounded-full border-3 border-white bg-white/95 rotate-45 shadow-md" />
                <div className="absolute right-0 w-6 h-6 rounded-full border-3 border-white bg-white/95 -rotate-45 shadow-md" />
                <div className="absolute left-1/2 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FDE8F1] shadow-xs" />
              </div>
            </div>
          </motion.div>

          {/* Gift Box Base */}
          <motion.div
            animate={
              isOpen
                ? { scale: [1, 1.05, 0.95], opacity: [1, 1, 0.5] }
                : { scale: 1 }
            }
            transition={{ duration: 1.2 }}
            className="absolute bottom-2 z-10 w-40 sm:w-48 h-36 sm:h-40 rounded-3xl bg-gradient-to-br from-[#F8C8DC] via-[#F7A8C4] to-[#E889AD] shadow-[0_20px_45px_rgba(232,137,173,0.35)] border border-white/60 overflow-hidden flex items-center justify-center"
          >
            {/* Vertical White Ribbon */}
            <div className="absolute inset-y-0 w-8 bg-white shadow-xs" />

            {/* Heart Badge */}
            <div className="relative z-10 w-11 h-11 rounded-full bg-white/95 border border-[#F8C8DC] flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-[#E889AD] fill-[#E889AD]" />
            </div>

            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
          </motion.div>
        </motion.div>

        {/* Floating Sparkles and Little Hearts */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-1 right-2 text-sm text-[#E889AD] animate-bounce">
            💕
          </span>
          <span className="absolute bottom-4 left-3 text-xs text-[#D9A441] animate-pulse">
            ✨
          </span>
          <span className="absolute top-8 left-4 text-xs text-[#E889AD]">
            🌸
          </span>
        </div>
      </motion.div>

      {/* Button prompt */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleOpenGift}
        disabled={isOpen || openingInProgress}
        className="mt-6 px-9 py-4 rounded-full font-bold text-sm sm:text-base text-white btn-pink-gradient flex items-center gap-2.5 cursor-pointer shadow-lg shadow-[#E889AD]/30 disabled:opacity-70"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span>{isOpen ? 'Unwrapping Magic... 💕' : 'OPEN YOUR SURPRISE 🎁'}</span>
      </motion.button>
    </motion.div>
  );
};
