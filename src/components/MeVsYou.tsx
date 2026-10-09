import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, Heart, ArrowRight } from 'lucide-react';
import { MatchCategoryResult } from '../types';
import { sound } from '../utils/sound';

interface MeVsYouProps {
  senderName: string;
  recipientName: string;
  matchResults: MatchCategoryResult[];
  percentage: number;
  totalMatches: number;
  onContinue: () => void;
  nextSectionLabel?: string;
}

export const MeVsYou: React.FC<MeVsYouProps> = ({
  senderName,
  recipientName,
  matchResults,
  percentage,
  totalMatches,
  onContinue,
  nextSectionLabel = "See Our Memories 📸"
}) => {
  const matchingOnly = matchResults.filter(r => r.isMatch);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 select-none">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] mb-3 shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-[#E889AD] text-[#E889AD]" />
          The Grand Comparison
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold tracking-tight">
          ME ❤️ VS YOU 💗
        </h2>
        <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mt-1.5">
          A side-by-side reveal of our tastes & preferences
        </p>
      </motion.div>

      {/* Column Titles Bar */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sticky top-16 z-20 backdrop-blur-md py-2">
        <div className="text-center p-3 rounded-2xl bg-white/95 border border-[#F8C8DC] shadow-sm">
          <span className="text-xs sm:text-sm font-extrabold text-[#E889AD] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span>FARHAN</span>
            <span>❤️</span>
          </span>
          <span className="text-[10px] text-[#171717]/60 block mt-0.5 font-bold">ME</span>
        </div>
        <div className="text-center p-3 rounded-2xl bg-[#FDE8F1]/95 border border-[#F8C8DC] shadow-sm">
          <span className="text-xs sm:text-sm font-extrabold text-[#E889AD] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span>YOU</span>
            <span>💗</span>
          </span>
          <span className="text-[10px] text-[#171717]/60 block mt-0.5 font-bold">{recipientName.toUpperCase()}</span>
        </div>
      </div>

      {/* 12 Comparison Cards */}
      <div className="space-y-3.5">
        {matchResults.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`rounded-2xl p-4 border transition-all ${
              item.isMatch
                ? 'bg-white border-[#F8C8DC] shadow-[0_6px_25px_rgba(232,137,173,0.18)]'
                : 'glass-panel border-[#F8C8DC]/50'
            }`}
          >
            {/* Category header with badge */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#F8C8DC]/40">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs sm:text-sm font-bold text-[#171717]">{item.label}</span>
              </div>
              <div>
                {item.isMatch ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] shadow-xs">
                    <Check className="w-3.5 h-3.5 text-[#E889AD] stroke-[3]" />
                    ❤️ SAME
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium text-[#5A3D4A] bg-white/85 border border-[#F8C8DC]/70">
                    ✨ DIFFERENT — But that's what makes us unique!
                  </span>
                )}
              </div>
            </div>

            {/* Two Column Content */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              {/* Left Column (Me) */}
              <div className="p-3 rounded-xl bg-white border border-[#F8C8DC]/70 text-[#5A3D4A] flex flex-col justify-center">
                <span className="text-[10px] text-[#E889AD] font-bold mb-0.5 uppercase tracking-wide">
                  FARHAN
                </span>
                <span className="font-semibold text-[#171717] line-clamp-2">
                  {(() => {
                    if (Array.isArray(item.myAnswer)) {
                      return item.myAnswer.length > 0 ? (
                        item.myAnswer.join(', ')
                      ) : (
                        <span className="text-[#5A3D4A]/50 italic text-[11px]">(To be revealed later ✨)</span>
                      );
                    }
                    return item.myAnswer ? (
                      item.myAnswer
                    ) : (
                      <span className="text-[#5A3D4A]/50 italic text-[11px]">(To be revealed later ✨)</span>
                    );
                  })()}
                </span>
              </div>

              {/* Right Column (You) */}
              <div className="p-3 rounded-xl bg-[#FDE8F1]/60 border border-[#F8C8DC]/70 text-[#5A3D4A] flex flex-col justify-center">
                <span className="text-[10px] text-[#E889AD] font-bold mb-0.5 uppercase tracking-wide">
                  {recipientName}
                </span>
                <span className="font-semibold text-[#171717] line-clamp-2">
                  {Array.isArray(item.userAnswer) ? item.userAnswer.join(', ') : item.userAnswer}
                </span>
              </div>
            </div>

            {item.matchNote && (
              <p className="text-[11px] text-[#D9A441] font-medium mt-2 text-center italic">
                ✨ {item.matchNote}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* 17. FINAL SIMILARITY SUMMARY SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 rounded-3xl p-6 sm:p-8 text-center bg-white border-2 border-[#F8C8DC] shadow-[0_15px_40px_rgba(232,137,173,0.18)] relative overflow-hidden"
      >
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
          Summary Overview
        </span>

        <h3 className="text-xs sm:text-sm uppercase tracking-widest text-[#5A3D4A] font-bold mt-1">
          HOW MANY THINGS DO WE HAVE IN COMMON?
        </h3>

        <div className="flex items-center justify-center gap-5 my-5">
          <div className="text-3xl sm:text-4xl font-extrabold text-[#5A3D4A]">
            {totalMatches} <span className="text-xl sm:text-2xl text-[#5A3D4A]/50 font-normal">/ 12</span>
          </div>
          <div className="h-8 w-px bg-[#F8C8DC]" />
          <div className="text-3xl sm:text-4xl font-extrabold text-[#E889AD]">
            {percentage}% MATCH ❤️
          </div>
        </div>

        {/* Matching category summary cards */}
        {matchingOnly.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-[#5A3D4A]/70 mb-3 font-semibold">Shared favorites & vibes:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {matchingOnly.map(m => (
                <span
                  key={m.category}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5A3D4A] bg-[#FDE8F1] border border-[#F8C8DC] shadow-xs"
                >
                  <span>{m.icon}</span>
                  <span>Same {m.label.replace('Favorite ', '')}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Continue Button */}
      <div className="mt-8 flex justify-center pb-8">
        <button
          onClick={() => {
            sound.playClick();
            onContinue();
          }}
          className="px-9 py-4 rounded-full font-bold text-sm sm:text-base text-white btn-pink-gradient shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <span>{nextSectionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
