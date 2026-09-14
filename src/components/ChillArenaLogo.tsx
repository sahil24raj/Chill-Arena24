'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const ChillArenaLogo: React.FC<LogoProps> = ({ size = 'md', showTagline = true }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
      {/* Hexagonal Cyber Flame Crest Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0`}>
        {/* Ambient Neon Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#00F0FF] via-[#7928CA] to-[#FF007A] blur-[6px] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Emblem Shield Box */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#111827] to-[#080C16] border border-[#00F0FF]/50 p-1.5 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]"
          >
            {/* Outer Diamond Crest */}
            <path
              d="M18 3L32 10.5V25.5L18 33L4 25.5V10.5L18 3Z"
              stroke="url(#shieldGrad)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Central Stylized Gaming Controller / 'C' & 'A' Flame Wave */}
            <path
              d="M12 18C12 14.6863 14.6863 12 18 12C20.5 12 22.5 13.5 23.5 15.5M24 18C24 21.3137 21.3137 24 18 24C15.5 24 13.5 22.5 12.5 20.5"
              stroke="#00F0FF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Center Gaming Spark */}
            <circle cx="18" cy="18" r="2.2" fill="#ADFF2F" />
            
            <defs>
              <linearGradient id="shieldGrad" x1="4" y1="3" x2="32" y2="33" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF" />
                <stop offset="0.5" stopColor="#7928CA" />
                <stop offset="1" stopColor="#FF007A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-black tracking-tight text-white ${textSizes[size]} group-hover:text-[#00F0FF] transition-colors leading-none`}>
            CHILL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#00D4FF] to-[#ADFF2F]">ARENA</span>
          </span>
          <span className="text-[8px] font-mono font-black bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 px-1.5 py-0.5 rounded leading-none">
            PRO
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] font-mono text-gray-400 tracking-wider uppercase mt-1 flex items-center gap-1 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse shrink-0" />
            <span>Squad Gaming & Chill Arcade</span>
          </span>
        )}
      </div>
    </div>
  );
};
