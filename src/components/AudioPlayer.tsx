import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { sound } from '../utils/sound';

interface AudioPlayerProps {
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ className }) => {
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());

  useEffect(() => {
    setIsMuted(sound.getMuted());
  }, []);

  const handleToggle = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sound.playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle background music"
      className={
        className ??
        'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/90 text-xs text-[#5A3D4A] hover:text-[#E889AD] border border-[#F8C8DC] hover:border-[#E889AD] transition-all active:scale-95 shadow-xs cursor-pointer select-none'
      }
    >
      <Music className={`w-3.5 h-3.5 text-[#E889AD] ${!isMuted ? 'animate-bounce' : 'opacity-60'}`} />
      <span className="font-medium text-[11px] sm:text-xs">
        <span className="sm:hidden">{!isMuted ? '🔊' : '🔇'}</span>
        <span className="hidden sm:inline">{!isMuted ? '🔊 Music ON' : '🔇 Music OFF'}</span>
      </span>
      {!isMuted ? (
        <Volume2 className="hidden sm:inline w-3.5 h-3.5 text-[#E889AD]" />
      ) : (
        <VolumeX className="hidden sm:inline w-3.5 h-3.5 text-[#5A3D4A]/50" />
      )}
    </button>
  );
};
