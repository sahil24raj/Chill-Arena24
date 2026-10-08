'use client';

import React, { useState } from 'react';

export interface GamerAvatarProps {
  avatar?: string;
  photoURL?: string;
  avatarType?: 'google' | 'upload' | 'preset';
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  showOnline?: boolean;
  isOnline?: boolean;
  showLevel?: boolean;
  level?: number;
  glowEffect?: boolean;
  rank?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', text: 'text-xs', rounded: 'rounded-lg', badge: 'text-[9px] px-1', dot: 'w-2 h-2 -bottom-0.5 -right-0.5' },
  sm: { box: 'w-8 h-8', text: 'text-sm', rounded: 'rounded-xl', badge: 'text-[9px] px-1.5', dot: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5' },
  md: { box: 'w-10 h-10', text: 'text-base', rounded: 'rounded-xl', badge: 'text-[10px] px-1.5', dot: 'w-3 h-3 -bottom-0.5 -right-0.5' },
  lg: { box: 'w-14 h-14', text: 'text-2xl', rounded: 'rounded-2xl', badge: 'text-xs px-2 py-0.5', dot: 'w-3.5 h-3.5 bottom-0 right-0' },
  xl: { box: 'w-20 h-20', text: 'text-4xl', rounded: 'rounded-2xl', badge: 'text-xs px-2.5 py-0.5', dot: 'w-4 h-4 bottom-0 right-0' },
  '2xl': { box: 'w-28 h-28', text: 'text-5xl', rounded: 'rounded-3xl', badge: 'text-xs px-3 py-1', dot: 'w-5 h-5 bottom-0.5 right-0.5' },
  hero: { box: 'w-32 h-32 sm:w-36 sm:h-36', text: 'text-6xl sm:text-7xl', rounded: 'rounded-3xl', badge: 'text-xs px-3 py-1', dot: 'w-5 h-5 bottom-1 right-1' }
};

export function isImageSource(src?: string): boolean {
  if (!src) return false;
  return (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:image/') ||
    src.startsWith('/') ||
    src.includes('googleusercontent.com')
  );
}

export const GamerAvatar: React.FC<GamerAvatarProps> = ({
  avatar = '🎮',
  photoURL,
  alt,
  name,
  size = 'md',
  className = '',
  showOnline = false,
  isOnline = true,
  showLevel = false,
  level,
  glowEffect = true,
  rank,
  onClick
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  // Determine effective image source
  const imageSource = !imgError && (isImageSource(avatar) ? avatar : isImageSource(photoURL) ? photoURL : null);

  // Border & Glow based on rank tier
  const getRankGlow = () => {
    if (!glowEffect) return 'border-white/10';
    if (!rank) return 'border-[#00F0FF]/60 shadow-[0_0_20px_rgba(0,240,255,0.25)]';
    const r = rank.toLowerCase();
    if (r.includes('grandmaster') || r.includes('champion')) {
      return 'border-[#D946EF] shadow-[0_0_25px_rgba(217,70,239,0.4)]';
    }
    if (r.includes('diamond')) {
      return 'border-[#00F0FF] shadow-[0_0_25px_rgba(0,240,255,0.35)]';
    }
    if (r.includes('platinum')) {
      return 'border-[#2DD4BF] shadow-[0_0_20px_rgba(45,212,191,0.3)]';
    }
    if (r.includes('gold')) {
      return 'border-[#FBBF24] shadow-[0_0_20px_rgba(251,191,36,0.35)]';
    }
    if (r.includes('silver')) {
      return 'border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.2)]';
    }
    return 'border-[#00F0FF]/60 shadow-[0_0_20px_rgba(0,240,255,0.25)]';
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex shrink-0 items-center justify-center select-none ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200' : ''
      } ${className}`}
    >
      {/* Outer Shell with Gradient & Border */}
      <div
        className={`${sizeConfig.box} ${sizeConfig.rounded} p-0.5 bg-gradient-to-tr from-[#121626] to-[#1E253B] border-2 ${getRankGlow()} overflow-hidden transition-all duration-300 flex items-center justify-center`}
      >
        {imageSource ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSource}
            alt={alt || name || 'Gamer Avatar'}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover ${sizeConfig.rounded} bg-[#0A0D18]`}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${sizeConfig.text} bg-gradient-to-tr from-[#0E1322] to-[#182038]`}
          >
            <span>{avatar || '🎮'}</span>
          </div>
        )}
      </div>

      {/* Online / Offline Presence Dot */}
      {showOnline && (
        <span
          className={`absolute ${sizeConfig.dot} rounded-full ring-2 ring-[#080A12] ${
            isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-slate-500'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        >
          {isOnline && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          )}
        </span>
      )}

      {/* Level Badge Pill */}
      {showLevel && level !== undefined && (
        <span
          className={`absolute -bottom-2 -right-1 font-mono font-black ${sizeConfig.badge} rounded-full bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black shadow-md border border-black/40`}
        >
          LVL {level}
        </span>
      )}
    </div>
  );
};
