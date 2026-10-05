'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { soundFx } from '@/lib/audio';

export interface VibeArenaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  iconOnly?: boolean;
  useImage?: boolean;
  className?: string;
  onClick?: () => void;
}

export const VibeArenaLogo: React.FC<VibeArenaLogoProps> = ({
  size = 'md',
  showTagline = true,
  iconOnly = false,
  useImage = true,
  className = '',
  onClick
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-base', tag: 'text-[9px]', imgW: 36, imgH: 36, fullW: 130, fullH: 36 },
    md: { icon: 'w-10 h-10', text: 'text-lg', tag: 'text-[10px]', imgW: 44, imgH: 44, fullW: 160, fullH: 44 },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', tag: 'text-xs', imgW: 64, imgH: 64, fullW: 220, fullH: 60 },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', tag: 'text-sm', imgW: 96, imgH: 96, fullW: 320, fullH: 88 }
  };

  const currentSize = sizeMap[size];

  // SVG VA Monogram with controller D-pad, crown doodle and orbital loop
  const renderVaSvg = () => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-[0_0_12px_rgba(217,70,239,0.5)]"
    >
      <defs>
        <linearGradient id="vaVGrad" x1="10" y1="10" x2="50" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" />
          <stop offset="0.4" stopColor="#D946EF" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="vaAGrad" x1="45" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="vaOrbitGrad" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D946EF" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#A855F7" />
          <stop offset="1" stopColor="#06B6D4" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Hand-drawn crown doodle above 'A' */}
      <path
        d="M60 16L65 8L73 14L81 8L86 16"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stylized 'V' letter */}
      <path
        d="M18 24L38 80H48L32 24H18Z"
        fill="url(#vaVGrad)"
      />
      <path
        d="M32 24L48 68L44 80L24 24H32Z"
        fill="#A855F7"
        opacity="0.6"
      />

      {/* Stylized 'A' letter */}
      <path
        d="M68 20L48 80H58L63 64H78L83 80H93L73 20H68ZM70 42L75 56H65L70 42Z"
        fill="url(#vaAGrad)"
      />

      {/* Controller D-Pad cutout inside A */}
      <path
        d="M68 47V53M65 50H71"
        stroke="#080A12"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="76" cy="48" r="1" fill="#080A12" />
      <circle cx="78" cy="51" r="1" fill="#080A12" />

      {/* Playful orbital ring swooshing around VA */}
      <ellipse
        cx="52"
        cy="54"
        rx="46"
        ry="13"
        transform="rotate(-15 52 54)"
        stroke="url(#vaOrbitGrad)"
        strokeWidth="3.5"
        strokeDasharray="180 50"
        strokeLinecap="round"
      />

      {/* Playful sparkles */}
      <path d="M12 40L14 36L16 40L14 44L12 40Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M88 34L90 30L92 34L90 38L88 34Z" fill="#38BDF8" opacity="0.9" />
    </svg>
  );

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none group cursor-pointer transition-transform duration-200 active:scale-[0.98] ${className}`}
    >
      {/* Icon Emblem Container */}
      <div className={`relative ${currentSize.icon} shrink-0 flex items-center justify-center`}>
        {/* Ambient Back Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#D946EF] via-[#8B5CF6] to-[#06B6D4] blur-[8px] opacity-40 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Crisp Surface Box */}
        <div className="relative w-full h-full rounded-2xl bg-[#080A12] border border-white/15 p-1.5 flex items-center justify-center shadow-xl group-hover:border-[#D946EF]/50 transition-colors">
          {renderVaSvg()}
        </div>
      </div>

      {/* Typography Hierarchy */}
      {!iconOnly && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-display font-black tracking-tight text-white ${currentSize.text} leading-none flex items-center gap-1.5`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F472B6] via-[#D946EF] to-[#A855F7]">
                VIBE
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#06B6D4] to-[#0284C7]">
                ARENA
              </span>
            </span>

            <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded bg-[#D946EF]/15 text-[#F472B6] border border-[#D946EF]/30 tracking-wider">
              PLAY
            </span>
          </div>

          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse shrink-0" />
              <span className={`font-mono text-slate-400 font-medium uppercase tracking-widest leading-none ${currentSize.tag}`}>
                WHERE FRIENDS COME TO PLAY.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VibeArenaLogo;
