'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/types';
import { soundFx } from '@/lib/audio';
import { Play, Users, Sparkles, Trophy, Flame, Zap, Shield, Gift } from 'lucide-react';

interface HeroSectionProps {
  featuredGame: GameItem;
  onOpenMultiplayer: () => void;
  onOpenSpin: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredGame,
  onOpenMultiplayer,
  onOpenSpin
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#00F0FF]/25 bg-gradient-to-b from-[#0e121a] via-[#090b10] to-[#07080c] p-6 lg:p-12 shadow-2xl">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 -ml-20 w-60 h-60 bg-[#ADFF2F]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Headlines & Call to Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Multiplayer Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-[#00F0FF]/40 text-xs font-mono backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#ADFF2F] animate-pulse" />
            <span className="text-[#00F0FF] font-bold">2,481 PLAYERS ONLINE NOW</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">INSTANT ROOMS ACTIVE</span>
          </div>

          {/* Main Cinematic Gaming Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white font-display uppercase">
              PLAY. ROAST. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#00F0FF]/90 to-[#ADFF2F] neon-text-cyan">
                REPEAT.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-sans max-w-xl leading-relaxed pt-2">
              Quick multiplayer mini-games for you, your squad, and your last 2 brain cells. Flip pens on classroom desks, dodge ACP Pradyuman, hit street cricket sixes, and duel in 30-second rapid word battles.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/game/${featuredGame.id}`}
              onClick={() => soundFx.playClick()}
              className="cyber-button px-8 py-4 rounded-xl font-display text-sm font-black text-slate-950 flex items-center gap-2.5 shadow-xl shadow-[#00F0FF]/25 hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>PLAY FEATURED: {featuredGame.title.split(':')[0].toUpperCase()}</span>
            </Link>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenMultiplayer();
              }}
              className="px-6 py-4 rounded-xl bg-slate-900/90 border border-purple-500/50 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-sm font-black flex items-center gap-2 transition-all font-display shadow-lg"
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>INVITE FRIENDS / ROOM CODE</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenSpin();
              }}
              className="px-4 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-sm font-bold flex items-center gap-2 transition-all"
              title="Claim Daily Free Reward"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs">FREE SPIN</span>
            </button>
          </div>

          {/* Micro Value Props */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800/80 font-mono text-[11px] text-gray-400">
            <div>
              <span className="text-base font-bold text-[#00F0FF] block font-display">0 Downloads</span>
              <span>Runs in browser 60 FPS</span>
            </div>
            <div>
              <span className="text-base font-bold text-[#ADFF2F] block font-display">1v1 Duels</span>
              <span>Pass & Play / Rooms</span>
            </div>
            <div>
              <span className="text-base font-bold text-pink-400 block font-display">XP & Rewards</span>
              <span>Level up & unlock skins</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Featured Game Hero Showcase */}
        <div className="lg:col-span-5 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/30 to-[#ADFF2F]/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />

          <div className="relative rounded-3xl overflow-hidden glass-panel border-[#00F0FF]/30 p-5 bg-[#0a0d14]/90 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#00F0FF] font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-pink-500" /> TRENDING ARENA #01
              </span>
              <span className="text-[#ADFF2F] bg-[#ADFF2F]/10 px-2.5 py-0.5 rounded-full border border-[#ADFF2F]/30 font-bold">
                ★ {featuredGame.rating} RATING
              </span>
            </div>

            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-gray-800 group-hover:scale-[1.02] transition-transform duration-500">
              <img
                src={featuredGame.bannerImage}
                alt={featuredGame.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
                <span className="text-3xl mb-1.5">{featuredGame.thumbnail}</span>
                <h3 className="text-xl font-black text-white font-display leading-tight">{featuredGame.title}</h3>
                <p className="text-xs text-gray-300 font-sans line-clamp-1 mt-0.5">{featuredGame.tagline}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-gray-800">
                <span className="text-gray-500 block">GAME DURATION</span>
                <span className="text-white font-bold">{featuredGame.duration}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-gray-800">
                <span className="text-gray-500 block">TOTAL PLAYS</span>
                <span className="text-[#00F0FF] font-bold">{(featuredGame.playCount / 1000).toFixed(0)}k gamers</span>
              </div>
            </div>

            <Link
              href={`/game/${featuredGame.id}`}
              onClick={() => soundFx.playClick()}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-[#00F0FF] text-white hover:text-slate-950 border border-[#00F0FF]/40 text-xs font-black font-display tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>LAUNCH GAME INSTANTLY</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
