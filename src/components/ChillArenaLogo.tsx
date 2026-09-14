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
    lg: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
      {/* Brand Hexagon Gaming Shield Icon */}
      <div className={`relative ${iconSizes[size]} shrink-0`}>
        {/* Glow Ring behind */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#00F0FF] via-[#7928CA] to-[#FF0080] blur-[8px] opacity-70 group-hover:opacity-100 transition-opacity" />
        
        {/* Shield Container */}
        <div className="relative w-full h-full rounded-2xl bg-[#090b10] border border-[#00F0FF]/40 p-1 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,240,255,0.6)]"
          >
            {/* Ice Frost Snowflake / Fire Flame Crest */}
            <path
              d="M20 4L23.5 12.5H32.5L25 18L28 26.5L20 21.5L12 26.5L15 18L7.5 12.5H16.5L20 4Z"
              fill="url(#chillGradient)"
            />
            {/* Gaming Gamepad D-Pad Center Cross */}
            <circle cx="20" cy="28" r="4.5" fill="#00F0FF" fillOpacity="0.2" stroke="#00F0FF" strokeWidth="1.2" />
            <path d="M17 28H23M20 25V31" stroke="#ADFF2F" strokeWidth="1.8" strokeLinecap="round" />

            <defs>
              <linearGradient id="chillGradient" x1="7.5" y1="4" x2="32.5" y2="26.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF" />
                <stop offset="0.5" stopColor="#7928CA" />
                <stop offset="1" stopColor="#FF007A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-black tracking-tight text-white ${textSizes[size]} group-hover:text-[#00F0FF] transition-colors leading-none`}>
            CHILL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#00f0ff]/90 to-[#ADFF2F]">ARENA</span>
          </span>
          <span className="text-[8px] font-mono font-black bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 px-1.5 py-0.5 rounded leading-none">
            v2.4
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] font-mono text-gray-400 tracking-wider uppercase mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" />
            Squad Duels & Meme Lounge
          </span>
        )}
      </div>
    </div>
  );
};
