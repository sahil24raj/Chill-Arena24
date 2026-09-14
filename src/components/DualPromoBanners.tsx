'use client';

import React from 'react';
import Link from 'next/link';
import { soundFx } from '@/lib/audio';
import { Sparkles, Play, Flame, Gift, Swords, Crown, Zap } from 'lucide-react';

import { useAppStore } from '@/store/useAppStore';

interface DualPromoProps {
  onOpenMultiplayer?: () => void;
  onOpenSpin?: () => void;
}

export const DualPromoBanners: React.FC<DualPromoProps> = ({
  onOpenMultiplayer,
  onOpenSpin
}) => {
  const store = useAppStore();
  const handleOpenMultiplayer = onOpenMultiplayer || store.openMultiplayerModal;
  const handleOpenSpin = onOpenSpin || store.openSpinModal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Promo Banner 1: Purple / Gold (Jackpotter Style) */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-7 bg-gradient-to-r from-[#2c1348] via-[#1a0f30] to-[#120a22] border-2 border-[#7928CA]/50 shadow-2xl shadow-[#7928CA]/15 group hover:border-[#FF0080]/60 transition-all">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-[#FF0080]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#7928CA]/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="space-y-3 max-w-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF0080]/20 border border-[#FF0080]/40 text-[10px] font-mono text-[#FF0080] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>SQUAD REWARDS BOOSTER</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase leading-tight">
              GET REWARDS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0080] to-amber-300">
                FOR PLAYING
              </span>
            </h2>

            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              The more you play, the more you earn! Unlock rare classroom avatars & victory emotes.
            </p>

            <div className="pt-1">
              <Link
                href="/game/pen-flip"
                onClick={() => soundFx.playClick()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-300 hover:brightness-110 text-slate-950 font-display text-xs font-black shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>PLAY NOW</span>
              </Link>
            </div>
          </div>

          {/* Glowing 3D Graphic Mascot Illustration */}
          <div className="shrink-0 relative group-hover:scale-105 transition-transform duration-300">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-pink-900/40 border border-pink-500/30 flex items-center justify-center text-6xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-[#FF0080]/30 to-transparent animate-pulse" />
              <span className="relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">👑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Banner 2: Blue / Cyan / Emerald (Jackpotter Style) */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-7 bg-gradient-to-r from-[#0d2a44] via-[#091b2c] to-[#06121e] border-2 border-[#00F0FF]/40 shadow-2xl shadow-[#00F0FF]/15 group hover:border-[#ADFF2F]/60 transition-all">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-[#00F0FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#ADFF2F]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="space-y-3 max-w-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[10px] font-mono text-[#00F0FF] font-bold">
              <Swords className="w-3 h-3" />
              <span>1V1 MULTIPLAYER TOURNAMENT</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase leading-tight">
              PLAY & EARN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F]">
                BIG REWARDS
              </span>
            </h2>

            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Earn extra bonuses from inviting friends & challenging your hostel gang in 1-over cricket duels.
            </p>

            <div className="pt-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  handleOpenMultiplayer();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl cyber-button text-slate-950 font-display text-xs font-black shadow-lg shadow-[#00F0FF]/30 hover:scale-105 transition-transform"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>CHALLENGE SQUAD</span>
              </button>
            </div>
          </div>

          {/* Glowing 3D Graphic Dragon / Trophy Illustration */}
          <div className="shrink-0 relative group-hover:scale-105 transition-transform duration-300">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-cyan-900/60 to-blue-900/40 border border-[#00F0FF]/40 flex items-center justify-center text-6xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-[#00F0FF]/30 to-transparent animate-pulse" />
              <span className="relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">💎</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
