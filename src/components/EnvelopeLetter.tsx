import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, ArrowRight, Mail } from 'lucide-react';
import { sound } from '../utils/sound';

interface EnvelopeLetterProps {
  letterText: string;
  senderName: string;
  recipientName: string;
  onContinue: () => void;
}

export const EnvelopeLetter: React.FC<EnvelopeLetterProps> = ({
  letterText,
  senderName,
  recipientName,
  onContinue
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isTypingDone, setIsTypingDone] = useState(false);

  const lines = letterText.split('\n');

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    sound.playPop();
    setIsOpen(true);
  };

  // Line-by-line typewriter animation reveal
  useEffect(() => {
    if (!isOpen) return;

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < lines.length) {
        setDisplayedLines(prev => [...prev, lines[currentIdx]]);
        currentIdx++;
      } else {
        setIsTypingDone(true);
        clearInterval(interval);
      }
    }, 420);

    return () => clearInterval(interval);
  }, [isOpen, lines]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8 max-w-xl mx-auto text-center select-none"
    >
      {/* Top Heading */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] mb-3 shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-[#E889AD] text-[#E889AD]" />
          From The Heart
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold">
          💌 A Little Something For You
        </h2>
        <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mt-1">
          A personal note from <span className="text-[#E889AD] font-semibold">{senderName}</span>
        </p>
      </motion.div>

      {/* Envelope Card or Unfolded Letter */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm cursor-pointer select-none"
            onClick={handleOpenEnvelope}
          >
            {/* The Pink & White Envelope */}
            <div className="relative bg-white border-2 border-[#F8C8DC] rounded-3xl p-8 shadow-[0_15px_40px_rgba(232,137,173,0.22)] flex flex-col items-center justify-center min-h-[250px] group transition-transform hover:scale-[1.02]">
              {/* Envelope flap lines */}
              <div className="absolute top-0 inset-x-0 h-24 border-b border-[#F8C8DC] bg-gradient-to-b from-[#FDE8F1]/80 to-transparent rounded-t-3xl pointer-events-none" />

              {/* Decorative Hearts in Corners */}
              <span className="absolute top-3 left-4 text-sm text-[#E889AD]">💕</span>
              <span className="absolute top-3 right-4 text-sm text-[#E889AD]">🌸</span>

              {/* Wax Seal / Heart Stamp */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#F7A8C4] to-[#E889AD] border-2 border-white shadow-md flex items-center justify-center my-3"
              >
                <Heart className="w-8 h-8 text-white fill-white" />
                <div className="absolute inset-1 rounded-full border border-dashed border-white/60 pointer-events-none" />
              </motion.div>

              <p className="text-xs uppercase tracking-widest text-[#5A3D4A]/80 font-bold mt-2">
                To: {recipientName}
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-white btn-pink-gradient shadow-md flex items-center gap-2 group-hover:scale-105"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open My Letter ❤️</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            {/* The Unfolded Birthday Card */}
            <div className="relative text-left bg-white text-[#5A3D4A] rounded-3xl p-6 sm:p-9 shadow-[0_20px_50px_rgba(232,137,173,0.25)] border-2 border-[#F8C8DC] overflow-hidden">
              {/* Soft pink corner highlights & decorative elements */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-radial from-[#FDE8F1] to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-radial from-[#FDE8F1]/80 to-transparent pointer-events-none" />
              <span className="absolute top-3 right-4 text-xs text-[#E889AD]">✨</span>
              <span className="absolute bottom-4 right-4 text-xs text-[#E889AD]">💕</span>
              <span className="absolute top-4 left-4 text-xs text-[#E889AD]">🌸</span>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#F8C8DC] pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#E889AD] fill-[#E889AD]" />
                  <span className="text-xs uppercase tracking-widest text-[#E889AD] font-sans font-bold">
                    Special Birthday Card
                  </span>
                </div>
                <span className="text-xs text-[#5A3D4A]/60 font-sans font-medium">
                  With all my love
                </span>
              </div>

              {/* The Typewriter Lines */}
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-[#5A3D4A] min-h-[160px]">
                {displayedLines.map((line, idx) => {
                  if (line.trim() === '') {
                    return <div key={idx} className="h-2" />;
                  }
                  return (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className={
                        line.startsWith('Dear') || line.startsWith('Happy')
                          ? 'font-bold text-[#E889AD] font-serif text-base sm:text-lg'
                          : line.includes('Farhan') || line.includes('With all') || line.includes(senderName)
                          ? 'font-handwriting text-2xl text-[#E889AD] pt-2 font-bold'
                          : 'font-serif'
                      }
                    >
                      {line}
                    </motion.p>
                  );
                })}

                {!isTypingDone && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-2 h-4 bg-[#E889AD] ml-1 translate-y-0.5"
                  />
                )}
              </div>
            </div>

            {/* Continue to ME vs YOU */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex justify-center"
            >
              <button
                onClick={() => {
                  sound.playClick();
                  onContinue();
                }}
                className="px-8 py-3.5 rounded-full font-bold text-sm sm:text-base text-white btn-pink-gradient shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Continue: ME ❤️ VS YOU 💗</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
