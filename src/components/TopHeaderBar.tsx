'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Search,
  Gift,
  Volume2,
  VolumeX,
  Menu,
  Crown,
  Swords,
  Flame,
  Zap
} from 'lucide-react';

interface TopHeaderBarProps {
  onToggleLeftSidebar?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  onToggleLeftSidebar
}) => {
  const router = useRouter();
  const { user, isMuted, toggleMute, openSpinModal, openMultiplayerModal } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const xpInLevel = user.xp % 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));

  return (
    <header className="w-full bg-[#080B14]/95 backdrop-blur-xl border-b border-[#1A2238] px-3 sm:px-6 lg:px-8 py-3 sticky top-0 z-30 flex items-center justify-between gap-3 lg:gap-6">
      {/* Left: Mobile Sidebar Toggle + Live Desk King Tag */}
      <div className="flex items-center gap-3 shrink-0">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className="md:hidden p-2 rounded-xl bg-[#121829] border border-gray-800 text-gray-400 hover:text-white"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Fixed Non-Clipping King of Desk Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 text-xs font-mono shrink-0">
          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-gray-300 font-medium">Desk King:</span>
          <span className="text-amber-400 font-black tracking-wide">50,000 🪙</span>
        </div>

        {/* 1v1 Duel Quick Action */}
        <button
          onClick={() => {
            soundFx.playClick();
            openMultiplayerModal();
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono font-bold transition-all hover:scale-105 shrink-0"
        >
          <Swords className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>1v1 DUEL</span>
        </button>
      </div>

      {/* Center: Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative min-w-0">
        <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search games, school roasts, cricket (e.g. Pen Flip, Modi)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#101524] border border-[#1E2842] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all font-sans"
        />
      </form>

      {/* Right User Controls & Currency Pills */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Coins Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101524] border border-amber-500/30 text-xs font-mono font-bold text-amber-400 shadow-sm shrink-0">
          <span>🪙</span>
          <span>{user.coins.toLocaleString()}</span>
        </div>

        {/* Daily Spin / Loot Box Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            openSpinModal();
          }}
          className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:brightness-110 text-slate-950 font-display text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-105 transition-all shrink-0"
        >
          <Gift className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DAILY SPIN</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            toggleMute();
            if (isMuted) soundFx.playClick();
          }}
          className="p-2 rounded-xl bg-[#101524] border border-gray-800 text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors shrink-0"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Google Sign In / Auth Button if Guest */}
        {user.authType === 'guest' ? (
          <button
            onClick={() => {
              soundFx.playClick();
              useAppStore.getState().openAuthModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-blue-600 hover:brightness-110 text-white font-display text-xs font-black shadow-md shadow-red-950/40 hover:scale-105 transition-all shrink-0"
          >
            <span className="text-xs">🌐</span>
            <span className="hidden sm:inline">SIGN IN</span>
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>CLOUD SYNCED</span>
          </div>
        )}

        {/* User Profile Pill */}
        <Link
          href="/profile"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-2.5 p-1 pr-2.5 sm:pr-3 rounded-xl bg-[#101524] border border-[#1E2842] hover:border-[#00F0FF]/50 transition-all cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] text-slate-950 flex items-center justify-center text-sm font-bold shadow relative">
            {user.avatar}
            {user.authType === 'google' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-[8px] text-white rounded-full flex items-center justify-center border border-slate-950 font-bold">
                G
              </span>
            )}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display leading-tight truncate max-w-[100px]">
              {user.username}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400">
              <span className="text-[#00F0FF] font-bold">LVL {user.level}</span>
              <div className="w-8 h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};
