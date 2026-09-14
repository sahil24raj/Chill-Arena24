'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Trophy,
  Search,
  Gift,
  Bell,
  Volume2,
  VolumeX,
  ShoppingBag,
  Sparkles,
  Menu,
  MessageSquare,
  Crown,
  Swords
} from 'lucide-react';

interface TopHeaderBarProps {
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  onToggleLeftSidebar,
  onToggleRightSidebar
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
    <header className="w-full bg-[#0a0c14]/90 backdrop-blur-xl border-b border-[#1e2235] px-4 lg:px-8 py-3 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Mobile Toggle Button for Left Sidebar */}
      {onToggleLeftSidebar && (
        <button
          onClick={onToggleLeftSidebar}
          className="md:hidden p-2 rounded-xl bg-[#121522] border border-gray-800 text-gray-400 hover:text-white"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Left Prize / King Banner (Jackpotter Style) */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 text-xs font-mono">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-gray-300 font-bold">King of the Desk:</span>
          <span className="text-amber-400 font-black">50,000+ COINS PRIZE</span>
        </div>


        <button
          onClick={() => {
            soundFx.playClick();
            openMultiplayerModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono font-bold transition-all"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>INSTANT 1v1 DUEL</span>
        </button>
      </div>

      {/* Center Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search games, categories, roasts (e.g. Pen Flip, Cricket)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#121522] border border-[#1e2235] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] font-sans"
        />
      </form>

      {/* Right User Controls & Currency Pills (Jackpotter Style) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Coins Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121522] border border-amber-500/30 text-xs font-mono font-bold text-amber-400 shadow-sm">
          <span>🪙</span>
          <span>{user.coins.toLocaleString()}</span>
        </div>

        {/* Claim / Spin Free Rewards Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            openSpinModal();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:brightness-110 text-slate-950 font-display text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>FREE SPIN</span>
        </button>

        {/* Store Button */}
        <Link
          href="/shop"
          onClick={() => soundFx.playClick()}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161926] border border-gray-800 hover:border-[#00F0FF] text-xs font-bold text-gray-300 hover:text-white transition-colors font-display"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
          <span>SHOP</span>
        </Link>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            toggleMute();
            if (isMuted) soundFx.playClick();
          }}
          className="p-2 rounded-xl bg-[#121522] border border-gray-800 text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* User Profile Pill (Jackpotter Style) */}
        <Link
          href="/profile"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-2.5 p-1 pr-3 rounded-xl bg-[#121522] border border-[#1e2235] hover:border-[#00F0FF]/40 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] text-slate-950 flex items-center justify-center text-sm font-bold shadow">
            {user.avatar}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display leading-tight">
              {user.username}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400">
              <span className="text-[#00F0FF] font-bold">LVL {user.level}</span>
              <div className="w-10 h-1 bg-slate-900 rounded-full overflow-hidden">
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
