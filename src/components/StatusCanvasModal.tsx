import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Download, Check, Sparkles, Heart, Smartphone, Copy, X } from 'lucide-react';
import { StatusStyle, MatchCategoryResult } from '../types';
import { sound } from '../utils/sound';

interface StatusCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  senderName: string;
  similarityScore: number;
  matchingCategories: MatchCategoryResult[];
}

export const StatusCanvasModal: React.FC<StatusCanvasModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  senderName,
  similarityScore,
  matchingCategories
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StatusStyle>('luxury');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Render the 1080x1920 canvas graphic
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // ==========================================
    // STYLE 1 — LUXURY PINK
    // White background, soft pink gradient, gold accents, elegant typography, heart/sparkle
    // ==========================================
    if (selectedStyle === 'luxury') {
      // White to soft blush pink gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(0.35, '#FFF7FA');
      bgGrad.addColorStop(0.75, '#FDE8F1');
      bgGrad.addColorStop(1, '#F8C8DC');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Gold Accent Borders & Flourishes
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      ctx.strokeStyle = 'rgba(232, 137, 173, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(80, 80, width - 160, height - 160);

      // Gold corner details
      const corners = [
        [80, 80],
        [width - 80, 80],
        [80, height - 80],
        [width - 80, height - 80]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillStyle = '#D9A441';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Top Tag
      ctx.fillStyle = '#D9A441';
      ctx.font = 'bold 30px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦ SPECIAL BIRTHDAY EDITION ✦', width / 2, 230);

      // Main Birthday Title
      ctx.fillStyle = '#5A3D4A';
      ctx.font = 'bold 74px "Playfair Display", Georgia, serif';
      ctx.fillText('HAPPY BIRTHDAY 🎂', width / 2, 350);

      // Recipient Name in Deep Rose
      ctx.fillStyle = '#E889AD';
      ctx.font = 'italic bold 92px "Playfair Display", Georgia, serif';
      ctx.fillText(`${recipientName} ❤️`, width / 2, 470);

      // Divider line with gold star
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.6)';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 200, 540);
      ctx.lineTo(width / 2 + 200, 540);
      ctx.stroke();

      ctx.fillStyle = '#D9A441';
      ctx.font = '36px serif';
      ctx.fillText('✦', width / 2, 552);

      // Compatibility Title
      ctx.fillStyle = '#5A3D4A';
      ctx.font = '600 38px "Outfit", sans-serif';
      ctx.fillText('OUR FRIENDSHIP MATCH', width / 2, 650);

      // Score Gold Badge
      ctx.fillStyle = '#E889AD';
      ctx.font = '900 136px "Outfit", sans-serif';
      ctx.fillText(`${similarityScore}%`, width / 2, 790);

      ctx.fillStyle = '#D9A441';
      ctx.font = 'bold 36px "Cinzel", Georgia, serif';
      ctx.fillText('COMPATIBILITY', width / 2, 850);

      // Highlights box
      const boxY = 940;
      const boxH = 420;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.strokeStyle = '#F8C8DC';
      ctx.lineWidth = 3;
      roundRect(ctx, 130, boxY, width - 260, boxH, 32);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#5A3D4A';
      ctx.font = 'bold 32px "Cinzel", sans-serif';
      ctx.fillText('SHARED HIGHLIGHTS', width / 2, boxY + 70);

      const displayMatches = matchingCategories.slice(0, 4);
      if (displayMatches.length > 0) {
        displayMatches.forEach((m, idx) => {
          const itemY = boxY + 140 + idx * 65;
          ctx.fillStyle = '#5A3D4A';
          ctx.font = '600 34px "Outfit", sans-serif';
          ctx.fillText(`${m.icon}  Same ${m.label.replace('Favorite ', '')}`, width / 2, itemY);
        });
      } else {
        ctx.fillStyle = '#5A3D4A';
        ctx.font = 'italic 34px "Playfair Display", serif';
        ctx.fillText('Two distinct souls with an unbreakable bond 💕', width / 2, boxY + 220);
      }

      // Emotional quote
      ctx.fillStyle = '#5A3D4A';
      ctx.font = 'italic 42px "Playfair Display", Georgia, serif';
      ctx.fillText('"Different in some ways,', width / 2, 1480);
      ctx.fillText('same in the ways that matter. ❤️"', width / 2, 1545);

      // Bottom Signature
      ctx.fillStyle = '#E889AD';
      ctx.font = '600 34px "Outfit", sans-serif';
      ctx.fillText(`Made with ❤️ by ${senderName}`, width / 2, 1740);

    // ==========================================
    // STYLE 2 — ROMANTIC PINK
    // Blush pink background, white typography, floating hearts, soft glow, cute design
    // ==========================================
    } else if (selectedStyle === 'friendship') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#F8C8DC');
      grad.addColorStop(0.5, '#F7A8C4');
      grad.addColorStop(1, '#E889AD');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Floating white heart doodles
      drawHeart(ctx, 160, 240, 45, 'rgba(255, 255, 255, 0.35)');
      drawHeart(ctx, 920, 300, 55, 'rgba(255, 255, 255, 0.4)');
      drawHeart(ctx, 130, 1100, 50, 'rgba(255, 255, 255, 0.35)');
      drawHeart(ctx, 950, 1420, 55, 'rgba(255, 255, 255, 0.4)');

      // Translucent inner card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      roundRect(ctx, 90, 120, width - 180, height - 240, 50);
      ctx.fill();
      ctx.stroke();

      // Header Tag
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💖 SWEET BIRTHDAY CELEBRATION 💖', width / 2, 240);

      // Happy Birthday
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 82px "Playfair Display", sans-serif';
      ctx.fillText('HAPPY BIRTHDAY 🎂', width / 2, 360);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 100px "Outfit", sans-serif';
      ctx.fillText(`${recipientName} ❤️`, width / 2, 480);

      // Score Circle
      const circleY = 760;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(width / 2, circleY, 170, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 115px "Outfit", sans-serif';
      ctx.fillText(`${similarityScore}%`, width / 2, circleY + 30);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px "Outfit", sans-serif';
      ctx.fillText('MATCHED', width / 2, circleY + 80);

      // Shared categories chips
      const displayMatches = matchingCategories.slice(0, 4);
      const startMatchY = 1040;
      displayMatches.forEach((m, idx) => {
        const my = startMatchY + idx * 80;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        roundRect(ctx, 160, my - 45, width - 320, 65, 32);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 34px "Outfit", sans-serif';
        ctx.fillText(`${m.icon}  Same ${m.label.replace('Favorite ', '')}`, width / 2, my);
      });

      // Emotional quote
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'italic bold 42px "Playfair Display", Georgia, serif';
      ctx.fillText('"Different in some ways,', width / 2, 1460);
      ctx.fillText('same in the ways that matter. ❤️"', width / 2, 1530);

      // Bottom
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px "Outfit", sans-serif';
      ctx.fillText(`Made with ❤️ by ${senderName}`, width / 2, 1720);

    // ==========================================
    // STYLE 3 — MINIMAL WHITE
    // Mostly white background, small pink heart, minimal elegant typography, clean appearance
    // ==========================================
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Subtle border line
      ctx.strokeStyle = '#FDE8F1';
      ctx.lineWidth = 3;
      ctx.strokeRect(70, 70, width - 140, height - 140);

      ctx.textAlign = 'left';

      // Top Tag with small pink heart
      ctx.fillStyle = '#E889AD';
      ctx.font = 'bold 30px "Outfit", sans-serif';
      ctx.fillText('COMPATIBILITY & WISHES 💗', 110, 270);

      ctx.fillStyle = '#5A3D4A';
      ctx.font = '900 86px "Outfit", sans-serif';
      ctx.fillText('HAPPY BIRTHDAY', 110, 390);

      ctx.fillStyle = '#E889AD';
      ctx.font = '900 110px "Outfit", sans-serif';
      ctx.fillText(`${recipientName.toUpperCase()}`, 110, 510);

      // Big Bold Numbers
      ctx.fillStyle = '#E889AD';
      ctx.font = '900 150px "Outfit", sans-serif';
      ctx.fillText(`${similarityScore}%`, 110, 770);

      ctx.fillStyle = '#5A3D4A';
      ctx.font = 'bold 50px "Outfit", sans-serif';
      ctx.fillText('SIMILAR.', 110, 840);

      ctx.fillStyle = '#D9A441';
      ctx.font = '900 150px "Outfit", sans-serif';
      ctx.fillText('100%', 110, 1020);

      ctx.fillStyle = '#5A3D4A';
      ctx.font = 'bold 50px "Outfit", sans-serif';
      ctx.fillText('FRIENDS. ❤️', 110, 1090);

      // Matching category labels chips
      let chipX = 110;
      let chipY = 1220;
      matchingCategories.slice(0, 4).forEach((m) => {
        ctx.fillStyle = '#FDE8F1';
        ctx.strokeStyle = '#F8C8DC';
        ctx.lineWidth = 2;
        const text = `${m.icon} ${m.label.replace('Favorite ', '')}`;
        ctx.font = '600 28px "Outfit", sans-serif';
        const metrics = ctx.measureText(text);
        const chipW = metrics.width + 44;

        if (chipX + chipW > width - 110) {
          chipX = 110;
          chipY += 70;
        }

        roundRect(ctx, chipX, chipY - 35, chipW, 55, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#5A3D4A';
        ctx.fillText(text, chipX + 22, chipY + 4);
        chipX += chipW + 20;
      });

      // Bottom Message
      ctx.fillStyle = '#5A3D4A';
      ctx.font = '400 36px "Outfit", sans-serif';
      ctx.fillText('Different in some ways,', 110, 1490);
      ctx.fillStyle = '#E889AD';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.fillText('same in the ways that matter. ❤️', 110, 1545);

      // Signature
      ctx.fillStyle = '#5A3D4A';
      ctx.font = '500 30px "Outfit", sans-serif';
      ctx.fillText(`Made with ❤️ by ${senderName}`, 110, 1740);
    }
  }, [selectedStyle, recipientName, senderName, similarityScore, matchingCategories]);

  useEffect(() => {
    if (isOpen) {
      renderCanvas();
    }
  }, [isOpen, renderCanvas]);

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawHeart(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - size, y - size, x - size * 1.5, y + size / 3, x, y + size * 1.2);
    ctx.bezierCurveTo(x + size * 1.5, y + size / 3, x + size, y - size, x, y);
    ctx.fill();
    ctx.restore();
  }

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);
    sound.playClick();

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Birthday_Status_${recipientName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // fallback
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handleCopyCaption = () => {
    sound.playClick();
    const caption = `Happy Birthday to my favorite human ${recipientName}! 🎂❤️\n\nOur friendship scored ${similarityScore}% compatibility! Different in some ways, same in the ways that matter ✨ Made with love by ${senderName}`;
    navigator.clipboard?.writeText(caption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white border-2 border-[#F8C8DC] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full bg-[#FDE8F1] hover:bg-[#F8C8DC] text-[#5A3D4A] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] mb-2">
            <Smartphone className="w-3.5 h-3.5 text-[#E889AD]" />
            WhatsApp Status (9:16)
          </span>
          <h3 className="text-xl sm:text-2xl font-serif text-[#5A3D4A] font-bold">
            Take This Memory With You 📱❤️
          </h3>
          <p className="text-xs text-[#5A3D4A]/70 mt-1">
            Download and share on your WhatsApp or Instagram story!
          </p>
        </div>

        {/* Style Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#FDE8F1] rounded-2xl mb-4 border border-[#F8C8DC]">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedStyle('luxury');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedStyle === 'luxury'
                ? 'bg-white text-[#E889AD] shadow-sm'
                : 'text-[#5A3D4A]/70 hover:text-[#5A3D4A]'
            }`}
          >
            👑 Luxury Pink
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedStyle('friendship');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedStyle === 'friendship'
                ? 'bg-white text-[#E889AD] shadow-sm'
                : 'text-[#5A3D4A]/70 hover:text-[#5A3D4A]'
            }`}
          >
            💖 Romantic Pink
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedStyle('minimal');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedStyle === 'minimal'
                ? 'bg-white text-[#5A3D4A] shadow-sm'
                : 'text-[#5A3D4A]/70 hover:text-[#5A3D4A]'
            }`}
          >
            ⚡ Minimal White
          </button>
        </div>

        {/* Canvas Display (Preserves 9:16 aspect ratio visually) */}
        <div className="relative mx-auto w-full max-w-[260px] aspect-9/16 rounded-2xl overflow-hidden shadow-xl border-2 border-[#F8C8DC] bg-white my-2 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white btn-pink-gradient shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isDownloading ? 'Generating PNG...' : 'Download Status ❤️'}</span>
          </button>

          <button
            onClick={handleCopyCaption}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-[#5A3D4A] bg-[#FDE8F1] hover:bg-[#F8C8DC] border border-[#F8C8DC] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-[#E889AD]" />
                <span className="text-[#E889AD] font-bold">Caption Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#5A3D4A]" />
                <span>Copy Caption</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
